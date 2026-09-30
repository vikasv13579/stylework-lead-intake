import {
  listLeads,
  findLeadById,
  createLeadWithActivity,
  updateLead as updateLeadInRepo,
  deleteLead as deleteLeadInRepo,
  addLeadActivity,
  LeadWithActivities,
} from '../repositories/lead.repository';
import {
  CreateLeadInput,
  UpdateLeadInput,
  ListLeadsQuery,
  AddActivityInput,
} from '../validators/lead.validator';
import { Errors } from '../types/errors';
import logger from '../config/logger';

export interface PaginatedLeadsResponse {
  data: LeadWithActivities[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Lists leads with pagination, search, and filter params.
 */
export async function getLeadsService(
  query: ListLeadsQuery
): Promise<PaginatedLeadsResponse> {
  const { page, limit, search, status, source, sortBy, sortOrder } = query;

  const { data, total } = await listLeads({
    page,
    limit,
    search,
    status,
    source,
    sortBy,
    sortOrder,
  });

  // Fetch full details with activities for each lead in list
  const leadsWithActivities = await Promise.all(
    data.map(async (lead) => {
      const full = await findLeadById(lead.id);
      return full!;
    })
  );

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: leadsWithActivities,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Gets a lead by internal UUID with activities timeline.
 */
export async function getLeadByIdService(id: string): Promise<LeadWithActivities> {
  const lead = await findLeadById(id);
  if (!lead) {
    throw Errors.LeadNotFound(id);
  }
  return lead;
}

/**
 * Creates a new lead manually with an initial audit activity.
 */
export async function createLeadService(
  input: CreateLeadInput
): Promise<LeadWithActivities> {
  const { note, ...leadFields } = input;

  const externalId =
    input.externalLeadId ??
    `MANUAL_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const lead = await createLeadWithActivity(
    {
      ...leadFields,
      externalLeadId: externalId,
      phone: input.phone ?? null,
      campaignId: input.campaignId ?? null,
      adId: input.adId ?? null,
    },
    {
      source: 'MANUAL_ENTRY',
      ...(note ? { initialNote: note } : {}),
    }
  );

  if (note) {
    await addLeadActivity(lead.id, 'Note Added', { note });
  }

  logger.info('Lead created manually', { leadId: lead.id, email: lead.email });
  return (await findLeadById(lead.id))!;
}

/**
 * Updates an existing lead. Logs status changes automatically.
 */
export async function updateLeadService(
  id: string,
  input: UpdateLeadInput
): Promise<LeadWithActivities> {
  const existing = await findLeadById(id);
  if (!existing) {
    throw Errors.LeadNotFound(id);
  }

  const updated = await updateLeadInRepo(id, input, existing.status);
  logger.info('Lead updated', { leadId: id, updatedFields: Object.keys(input) });
  return updated;
}

/**
 * Deletes a lead by ID.
 */
export async function deleteLeadService(id: string): Promise<void> {
  const existing = await findLeadById(id);
  if (!existing) {
    throw Errors.LeadNotFound(id);
  }

  await deleteLeadInRepo(id);
  logger.info('Lead deleted', { leadId: id });
}

/**
 * Adds a custom activity log to a lead.
 */
export async function addLeadActivityService(
  id: string,
  input: AddActivityInput
): Promise<LeadWithActivities> {
  const existing = await findLeadById(id);
  if (!existing) {
    throw Errors.LeadNotFound(id);
  }

  await addLeadActivity(id, input.action, input.metadata as any);
  return (await findLeadById(id))!;
}
