import type { Lead } from '../types/lead';
import { StatusBadge } from './StatusBadge';
import { useAddActivity } from '../hooks/useLeads';
import { useState } from 'react';

interface LeadDrawerProps {
  lead: Lead;
  onClose: () => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function LeadDrawer({ lead, onClose }: LeadDrawerProps) {
  const [note, setNote] = useState('');
  const addActivity = useAddActivity(lead.id);

  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    await addActivity.mutateAsync({ action: 'Note Added', metadata: { note } });
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative flex h-full w-full max-w-lg flex-col border-l border-white/[0.07] bg-[#14161f] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideIn 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              {lead.firstName} {lead.lastName}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{lead.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={lead.status} />
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors mt-0.5">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-px border-b border-white/[0.06] bg-white/[0.03]">
          {[
            ['Source', lead.source.replace('_', ' ')],
            ['Phone', lead.phone ?? '—'],
            ['Campaign', lead.campaignId ?? '—'],
            ['Created', new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
          ].map(([k, v]) => (
            <div key={k} className="bg-[#14161f] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{k}</p>
              <p className="mt-1 text-sm text-slate-300 font-medium">{v}</p>
            </div>
          ))}
        </div>

        {/* Activity timeline */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-600">Activity Timeline</h3>
          {lead.activities.length === 0 ? (
            <p className="text-sm text-slate-600 italic">No activities yet.</p>
          ) : (
            <ol className="relative border-l border-white/[0.06] ml-2 space-y-5">
              {lead.activities.map((a) => (
                <li key={a.id} className="ml-4">
                  <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-indigo-500/60 ring-4 ring-[#14161f]" />
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-200">{a.action}</p>
                      <time className="text-[11px] text-slate-600 shrink-0">{timeAgo(a.createdAt)}</time>
                    </div>
                    {a.metadata && (
                      <pre className="mt-1.5 text-xs text-slate-500 whitespace-pre-wrap break-all">
                        {JSON.stringify(a.metadata, null, 2)}
                      </pre>
                    )}
                    {a.previousValue && a.newValue && (
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                        <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-rose-400">
                          {JSON.stringify(a.previousValue)}
                        </span>
                        <span>→</span>
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400">
                          {JSON.stringify(a.newValue)}
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Add note */}
        <form onSubmit={submitNote} className="border-t border-white/[0.06] p-4 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note or log activity…"
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200
                       placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-colors"
          />
          <button
            type="submit"
            disabled={addActivity.isPending || !note.trim()}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white
                       hover:bg-indigo-500 transition-colors disabled:opacity-40"
          >
            {addActivity.isPending ? '…' : 'Log'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
