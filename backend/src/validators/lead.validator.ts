import { z } from 'zod';
import { LeadStatus } from '@prisma/client';

export const LeadStatusEnum = z.nativeEnum(LeadStatus);

export const CreateLeadSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().optional(),
  source: z.string().trim().default('MANUAL'),
  status: LeadStatusEnum.default(LeadStatus.NEW),
  campaignId: z.string().trim().optional(),
  adId: z.string().trim().optional(),
  externalLeadId: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export const UpdateLeadSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().nullable().optional(),
  source: z.string().trim().optional(),
  status: LeadStatusEnum.optional(),
  campaignId: z.string().trim().nullable().optional(),
  adId: z.string().trim().nullable().optional(),
});

export const ListLeadsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  status: LeadStatusEnum.optional(),
  source: z.string().trim().optional(),
  sortBy: z
    .enum(['createdAt', 'firstName', 'lastName', 'status', 'updatedAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const AddActivitySchema = z.object({
  action: z.string().trim().min(1, 'Action is required'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const TransitionStatusSchema = z.object({
  status: LeadStatusEnum,
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;
export type ListLeadsQuery = z.infer<typeof ListLeadsQuerySchema>;
export type AddActivityInput = z.infer<typeof AddActivitySchema>;
export type TransitionStatusInput = z.infer<typeof TransitionStatusSchema>;
