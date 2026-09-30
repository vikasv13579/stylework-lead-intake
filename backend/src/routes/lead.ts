import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addActivity,
} from '../controllers/lead.controller';

const router = Router();

/**
 * GET /api/leads - List leads with filtering & pagination
 * POST /api/leads - Create new lead manually
 */
router.route('/').get(getLeads).post(createLead);

/**
 * GET /api/leads/:id - Get lead by ID
 * PATCH /api/leads/:id - Update lead details / status
 * DELETE /api/leads/:id - Delete lead
 */
router.route('/:id').get(getLeadById).patch(updateLead).delete(deleteLead);

/**
 * POST /api/leads/:id/activities - Log custom activity for a lead
 */
router.post('/:id/activities', addActivity);

export default router;
