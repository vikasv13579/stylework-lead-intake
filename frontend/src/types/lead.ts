export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

export interface Activity {
  id: string;
  leadId: string;
  action: string;
  previousValue: unknown;
  newValue: unknown;
  metadata: unknown;
  createdAt: string;
}

export interface Lead {
  id: string;
  externalLeadId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  source: string;
  status: LeadStatus;
  campaignId: string | null;
  adId: string | null;
  createdAt: string;
  updatedAt: string;
  activities: Activity[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeadsListResponse {
  data: Lead[];
  pagination: PaginationMeta;
}

export interface CreateLeadPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: string;
  note?: string;
}

export interface UpdateLeadPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
}
