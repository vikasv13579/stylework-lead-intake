import { useState } from 'react';
import type { Lead, LeadStatus } from '../types/lead';
import { StatusBadge } from './StatusBadge';
import { useTransitionStatus, useDeleteLead } from '../hooks/useLeads';

const TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  NEW:       ['CONTACTED', 'LOST'],
  CONTACTED: ['QUALIFIED', 'LOST'],
  QUALIFIED: ['CONVERTED', 'LOST'],
  CONVERTED: [],
  LOST:      ['NEW'],
};

const SOURCE_ICONS: Record<string, string> = {
  META_ADS: '📣',
  MANUAL:   '✏️',
};

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const transition = useTransitionStatus(lead.id);
  const deleteLead = useDeleteLead();
  const nextStatuses = TRANSITIONS[lead.status];
  const fullName = `${lead.firstName} ${lead.lastName}`;
  const initials = `${lead.firstName[0] ?? ''}${lead.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div
      className="group relative flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#1a1d27] p-5 shadow-lg
                 transition-all duration-200 hover:border-indigo-500/40 hover:shadow-indigo-500/10 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-300 font-bold text-sm ring-1 ring-indigo-500/30">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-100 leading-tight">{fullName}</p>
            <p className="truncate text-xs text-slate-500 mt-0.5">{lead.email}</p>
          </div>
        </div>
        <StatusBadge status={lead.status} size="sm" />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-md bg-white/[0.04] px-2 py-1">
          {SOURCE_ICONS[lead.source] ?? '🔗'} {lead.source.replace('_', ' ')}
        </span>
        {lead.phone && (
          <span className="rounded-md bg-white/[0.04] px-2 py-1">{lead.phone}</span>
        )}
        <span className="rounded-md bg-white/[0.04] px-2 py-1">
          {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between gap-2 border-t border-white/[0.05] pt-3" onClick={(e) => e.stopPropagation()}>
        {/* Status transitions */}
        <div className="flex flex-wrap gap-1.5">
          {nextStatuses.map((s) => (
            <button
              key={s}
              disabled={transition.isPending}
              onClick={() => transition.mutate(s)}
              className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-slate-300
                         hover:bg-indigo-600/30 hover:text-indigo-200 transition-colors disabled:opacity-40"
            >
              → {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
          {nextStatuses.length === 0 && (
            <span className="text-[11px] text-slate-600 italic">Terminal state</span>
          )}
        </div>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex gap-1.5">
            <button
              onClick={() => deleteLead.mutate(lead.id)}
              disabled={deleteLead.isPending}
              className="rounded-lg bg-rose-600/20 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-600/40 transition-colors"
            >
              {deleteLead.isPending ? '…' : 'Confirm'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-400 hover:bg-white/[0.1] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete lead"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
