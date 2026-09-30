import { useState, useCallback } from 'react';
import { useLeads } from '../hooks/useLeads';
import { LeadCard } from '../components/LeadCard';
import { LeadDrawer } from '../components/LeadDrawer';
import { CreateLeadModal } from '../components/CreateLeadModal';
import { StatusBadge } from '../components/StatusBadge';
import type { Lead, LeadStatus } from '../types/lead';

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'firstName', label: 'First Name' },
  { value: 'status', label: 'Status' },
  { value: 'updatedAt', label: 'Last Updated' },
];

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, isError, error } = useLeads({
    page,
    limit: 12,
    search: search || undefined,
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
  });

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleStatusFilter = (s: string) => {
    setStatusFilter(s === statusFilter ? '' : s);
    setPage(1);
  };

  const leads = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0f1117]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-100 tracking-tight">Stylework<span className="text-indigo-400"> Leads</span></span>
          </div>

          <button
            id="create-lead-btn"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white
                       hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Lead
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats strip */}
        {pagination && (
          <div className="mb-8 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/[0.07] bg-[#1a1d27] px-5 py-4 flex flex-col">
              <span className="text-3xl font-bold text-slate-100">{pagination.total}</span>
              <span className="text-xs text-slate-500 mt-0.5">Total Leads</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="search-leads"
              type="text"
              placeholder="Search by name, email, phone…"
              value={search}
              onChange={handleSearch}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 py-2.5 text-sm text-slate-200
                         placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-colors"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-[#1a1d27] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500/60"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
              className="rounded-xl border border-white/[0.08] bg-[#1a1d27] p-2.5 text-slate-400 hover:text-slate-200 transition-colors"
              title="Toggle sort order"
            >
              {sortOrder === 'desc'
                ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4 4m0 0l4-4m-4 4V4" /></svg>
                : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" /></svg>
              }
            </button>
          </div>
        </div>

        {/* Status filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter('')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors
              ${statusFilter === '' ? 'bg-indigo-600 text-white' : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.1]'}`}
          >
            All
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`rounded-full transition-all ${statusFilter === s ? 'ring-2 ring-offset-2 ring-offset-[#0f1117] ring-indigo-500' : ''}`}
            >
              <StatusBadge status={s} size="sm" />
            </button>
          ))}
        </div>

        {/* Lead grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-6 py-10 text-center">
            <p className="text-rose-300 font-semibold">Failed to load leads</p>
            <p className="text-sm text-rose-400/70 mt-1">{(error as Error)?.message}</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-600">
            <svg className="h-16 w-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-lg font-semibold">No leads found</p>
            <p className="text-sm mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={() => setSelectedLead(lead)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border border-white/[0.08] bg-[#1a1d27] px-4 py-2 text-sm text-slate-400
                         hover:text-slate-200 disabled:opacity-30 transition-colors"
            >
              ← Prev
            </button>
            <span className="px-3 text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-white/[0.08] bg-[#1a1d27] px-4 py-2 text-sm text-slate-400
                         hover:text-slate-200 disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Detail drawer */}
      {selectedLead && (
        <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}

      {/* Create modal */}
      {showCreate && <CreateLeadModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
