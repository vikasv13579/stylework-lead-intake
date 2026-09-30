import { Request, Response, NextFunction } from 'express';
import {
  ListLeadsQuerySchema,
  CreateLeadSchema,
  UpdateLeadSchema,
  AddActivitySchema,
} from '../validators/lead.validator';
import {
  getLeadsService,
  getLeadByIdService,
  createLeadService,
  updateLeadService,
  deleteLeadService,
  addLeadActivityService,
} from '../services/lead.service';

/**
 * GET /api/leads
 * Lists leads with pagination, search, status & source filters.
 */
export async function getLeads(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = ListLeadsQuerySchema.parse(req.query);
    const result = await getLeadsService(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/leads/:id
 * Retrieves a single lead with full activity history.
 */
export async function getLeadById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const lead = await getLeadByIdService(id);
    res.status(200).json({ data: lead });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/leads
 * Creates a new lead manually.
 */
export async function createLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = CreateLeadSchema.parse(req.body);
    const lead = await createLeadService(input);
    res.status(201).json({ message: 'Lead created successfully', data: lead });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/leads/:id
 * Updates lead fields and status.
 */
export async function updateLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const input = UpdateLeadSchema.parse(req.body);
    const lead = await updateLeadService(id, input);
    res.status(200).json({ message: 'Lead updated successfully', data: lead });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/leads/:id
 * Deletes a lead by ID.
 */
export async function deleteLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    await deleteLeadService(id);
    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/leads/:id/activities
 * Adds a custom activity entry to a lead.
 */
export async function addActivity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const input = AddActivitySchema.parse(req.body);
    const lead = await addLeadActivityService(id, input);
    res.status(201).json({ message: 'Activity logged successfully', data: lead });
  } catch (error) {
    next(error);
  }
}
