import {
  CreateLeadSchema,
  UpdateLeadSchema,
  ListLeadsQuerySchema,
} from '../src/validators/lead.validator';

describe('Lead Schema Validators', () => {
  describe('CreateLeadSchema', () => {
    it('validates a valid lead creation payload', () => {
      const payload = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        source: 'MANUAL',
      };

      const result = CreateLeadSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('NEW');
        expect(result.data.email).toBe('john.doe@example.com');
      }
    });

    it('rejects invalid email address', () => {
      const payload = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
      };

      const result = CreateLeadSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateLeadSchema', () => {
    it('allows partial update fields', () => {
      const payload = {
        status: 'QUALIFIED',
        phone: '+9876543210',
      };

      const result = UpdateLeadSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('QUALIFIED');
      }
    });
  });

  describe('ListLeadsQuerySchema', () => {
    it('applies default pagination parameters', () => {
      const result = ListLeadsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortBy).toBe('createdAt');
        expect(result.data.sortOrder).toBe('desc');
      }
    });
  });
});
