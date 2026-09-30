import { LeadStatus } from '@prisma/client';
import {
  validateStatusTransition,
  ALLOWED_STATUS_TRANSITIONS,
} from '../src/services/workflow.service';

describe('Lead Status Workflow State Machine', () => {
  describe('ALLOWED_STATUS_TRANSITIONS map', () => {
    it('covers all LeadStatus values', () => {
      const allStatuses = Object.values(LeadStatus);
      allStatuses.forEach((status) => {
        expect(ALLOWED_STATUS_TRANSITIONS).toHaveProperty(status);
      });
    });

    it('CONVERTED is a terminal state (no outbound transitions)', () => {
      expect(ALLOWED_STATUS_TRANSITIONS[LeadStatus.CONVERTED]).toHaveLength(0);
    });
  });

  describe('validateStatusTransition', () => {
    it('allows NEW -> CONTACTED', () => {
      expect(() =>
        validateStatusTransition(LeadStatus.NEW, LeadStatus.CONTACTED)
      ).not.toThrow();
    });

    it('allows NEW -> LOST', () => {
      expect(() =>
        validateStatusTransition(LeadStatus.NEW, LeadStatus.LOST)
      ).not.toThrow();
    });

    it('allows CONTACTED -> QUALIFIED', () => {
      expect(() =>
        validateStatusTransition(LeadStatus.CONTACTED, LeadStatus.QUALIFIED)
      ).not.toThrow();
    });

    it('allows QUALIFIED -> CONVERTED', () => {
      expect(() =>
        validateStatusTransition(LeadStatus.QUALIFIED, LeadStatus.CONVERTED)
      ).not.toThrow();
    });

    it('allows LOST -> NEW (re-open)', () => {
      expect(() =>
        validateStatusTransition(LeadStatus.LOST, LeadStatus.NEW)
      ).not.toThrow();
    });

    it('no-op transition is always allowed (same status)', () => {
      expect(() =>
        validateStatusTransition(LeadStatus.NEW, LeadStatus.NEW)
      ).not.toThrow();
    });

    it('throws 422 for invalid transition: NEW -> CONVERTED', () => {
      expect(() =>
        validateStatusTransition(LeadStatus.NEW, LeadStatus.CONVERTED)
      ).toThrow("Cannot transition lead status from 'NEW' to 'CONVERTED'");
    });

    it('throws 422 for invalid transition: NEW -> QUALIFIED', () => {
      expect(() =>
        validateStatusTransition(LeadStatus.NEW, LeadStatus.QUALIFIED)
      ).toThrow("Cannot transition lead status from 'NEW' to 'QUALIFIED'");
    });

    it('throws 422 for invalid transition: CONVERTED -> NEW', () => {
      expect(() =>
        validateStatusTransition(LeadStatus.CONVERTED, LeadStatus.NEW)
      ).toThrow("Cannot transition lead status from 'CONVERTED' to 'NEW'");
    });

    it('throws 422 for invalid transition: QUALIFIED -> CONTACTED', () => {
      expect(() =>
        validateStatusTransition(LeadStatus.QUALIFIED, LeadStatus.CONTACTED)
      ).toThrow("Cannot transition lead status from 'QUALIFIED' to 'CONTACTED'");
    });
  });
});
