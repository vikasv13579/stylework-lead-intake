import { LeadStatus } from '@prisma/client';
import { Errors } from '../types/errors';

/**
 * State machine definition for valid Lead status transitions.
 * 
 * Flow:
 * NEW -> CONTACTED, LOST
 * CONTACTED -> QUALIFIED, LOST
 * QUALIFIED -> CONVERTED, LOST
 * CONVERTED -> (terminal state)
 * LOST -> NEW (re-open)
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  [LeadStatus.NEW]: [LeadStatus.CONTACTED, LeadStatus.LOST],
  [LeadStatus.CONTACTED]: [LeadStatus.QUALIFIED, LeadStatus.LOST],
  [LeadStatus.QUALIFIED]: [LeadStatus.CONVERTED, LeadStatus.LOST],
  [LeadStatus.CONVERTED]: [],
  [LeadStatus.LOST]: [LeadStatus.NEW],
};

/**
 * Validates whether transitioning from currentStatus to nextStatus is permitted.
 * Throws InvalidStatusTransition error if invalid.
 */
export function validateStatusTransition(
  currentStatus: LeadStatus,
  nextStatus: LeadStatus
): void {
  if (currentStatus === nextStatus) {
    return; // No-op transition is allowed
  }

  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw Errors.InvalidStatusTransition(currentStatus, nextStatus);
  }
}
