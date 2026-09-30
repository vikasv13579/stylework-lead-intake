import { Lead, Activity, Prisma, LeadStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

export type LeadWithActivities = Lead & { activities: Activity[] };

// Prisma's JSON input type — safe to use for metadata/previousValue/newValue fields
type JsonInput = Prisma.InputJsonValue;

export interface ListLeadsParams {
  page: number;
  limit: number;
  search?: string;
  status?: LeadStatus;
  source?: string;
  sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'status' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Creates a Lead and its first "Lead Created" activity in a single transaction.
 * Returns the created lead with its activities.
 */
export async function createLeadWithActivity(
  data: Prisma.LeadCreateInput,
  activityMetadata?: Record<string, JsonInput>
): Promise<LeadWithActivities> {
  return prisma.$transaction(async (tx) => {
    const lead = await tx.lead.create({ data });

    const meta: JsonInput | undefined = activityMetadata
      ? (activityMetadata as JsonInput)
      : undefined;

    await tx.activity.create({
      data: {
        leadId: lead.id,
        action: 'Lead Created',
        newValue: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone ?? null,
          source: lead.source,
          campaignId: lead.campaignId ?? null,
          adId: lead.adId ?? null,
          status: lead.status,
        } as JsonInput,
        ...(meta !== undefined ? { metadata: meta } : {}),
      },
    });

    return tx.lead.findUniqueOrThrow({
      where: { id: lead.id },
      include: { activities: { orderBy: { createdAt: 'desc' } } },
    });
  });
}

/**
 * Finds a lead by its external (Meta) ID.
 * Returns null if not found.
 */
export async function findLeadByExternalId(
  externalLeadId: string
): Promise<Lead | null> {
  return prisma.lead.findUnique({ where: { externalLeadId } });
}

/**
 * Finds a lead by internal ID with activities.
 * Returns null if not found.
 */
export async function findLeadById(id: string): Promise<LeadWithActivities | null> {
  return prisma.lead.findUnique({
    where: { id },
    include: { activities: { orderBy: { createdAt: 'desc' } } },
  });
}

/**
 * Lists leads with pagination, search, status filtering, source filtering, and sorting.
 */
export async function listLeads(params: ListLeadsParams): Promise<{ data: Lead[]; total: number }> {
  const {
    page,
    limit,
    search,
    status,
    source,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const skip = (page - 1) * limit;
  const where: Prisma.LeadWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (source) {
    where.source = { equals: source, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.lead.count({ where }),
  ]);

  return { data, total };
}

/**
 * Updates lead fields. If status changes, records a "Status Changed" activity.
 */
export async function updateLead(
  id: string,
  data: Prisma.LeadUpdateInput,
  previousStatus?: LeadStatus
): Promise<LeadWithActivities> {
  return prisma.$transaction(async (tx) => {
    const updatedLead = await tx.lead.update({
      where: { id },
      data,
    });

    // Log status transition activity if status changed
    if (data.status && previousStatus && data.status !== previousStatus) {
      await tx.activity.create({
        data: {
          leadId: updatedLead.id,
          action: 'Status Changed',
          previousValue: { status: previousStatus } as JsonInput,
          newValue: { status: data.status as string } as JsonInput,
        },
      });
    }

    return tx.lead.findUniqueOrThrow({
      where: { id: updatedLead.id },
      include: { activities: { orderBy: { createdAt: 'desc' } } },
    });
  });
}

/**
 * Deletes a lead by ID. Associated activities are cascade-deleted.
 */
export async function deleteLead(id: string): Promise<Lead> {
  return prisma.lead.delete({
    where: { id },
  });
}

/**
 * Creates a custom activity log for a lead (e.g. Note Added, Call Logged, Email Sent).
 */
export async function addLeadActivity(
  leadId: string,
  action: string,
  metadata?: Record<string, JsonInput>
): Promise<Activity> {
  return prisma.activity.create({
    data: {
      leadId,
      action,
      ...(metadata ? { metadata: metadata as JsonInput } : {}),
    },
  });
}
