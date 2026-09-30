import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type {
  Lead,
  LeadsListResponse,
  CreateLeadPayload,
  UpdateLeadPayload,
  LeadStatus,
} from '../types/lead';

/* ─── Query Keys ─────────────────────────────── */
export const leadKeys = {
  all: ['leads'] as const,
  list: (params: object) => ['leads', 'list', params] as const,
  detail: (id: string) => ['leads', 'detail', id] as const,
};

/* ─── Fetch helpers ──────────────────────────── */
export function useLeads(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery<LeadsListResponse>({
    queryKey: leadKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get('/leads', { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useLead(id: string) {
  return useQuery<{ data: Lead }>({
    queryKey: leadKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/leads/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

/* ─── Mutations ──────────────────────────────── */
export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateLeadPayload) => {
      const { data } = await apiClient.post('/leads', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: leadKeys.all }),
  });
}

export function useUpdateLead(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateLeadPayload) => {
      const { data } = await apiClient.patch(`/leads/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: leadKeys.detail(id) });
    },
  });
}

export function useTransitionStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status: LeadStatus) => {
      const { data } = await apiClient.patch(`/leads/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: leadKeys.detail(id) });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/leads/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: leadKeys.all }),
  });
}

export function useAddActivity(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { action: string; metadata?: object }) => {
      const { data } = await apiClient.post(`/leads/${leadId}/activities`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: leadKeys.detail(leadId) }),
  });
}
