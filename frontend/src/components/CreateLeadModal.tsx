import { useState } from 'react';
import { useCreateLead } from '../hooks/useLeads';

interface CreateLeadModalProps {
  onClose: () => void;
}

export function CreateLeadModal({ onClose }: CreateLeadModalProps) {
  const create = useCreateLead();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    note: '',
    source: 'MANUAL',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await create.mutateAsync({
        ...form,
        phone: form.phone || undefined,
        note: form.note || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    }
  };

  const field = (
    id: keyof typeof form,
    label: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={form[id]}
        onChange={(e) => setForm((p) => ({ ...p, [id]: e.target.value }))}
        className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200
                   placeholder:text-slate-600 outline-none transition-colors
                   focus:border-indigo-500/60 focus:bg-white/[0.06]"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#1a1d27] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">Add New Lead</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {field('firstName', 'First Name', 'text', 'Jane')}
            {field('lastName', 'Last Name', 'text', 'Doe')}
          </div>
          {field('email', 'Email', 'email', 'jane@example.com')}
          {field('phone', 'Phone (optional)', 'tel', '+91 98765 43210')}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="note" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Initial Note (optional)
            </label>
            <textarea
              id="note"
              placeholder="Context or notes about this lead…"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              rows={2}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200
                         placeholder:text-slate-600 outline-none transition-colors resize-none
                         focus:border-indigo-500/60 focus:bg-white/[0.06]"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={create.isPending}
            className="mt-1 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white
                       hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50"
          >
            {create.isPending ? 'Creating…' : 'Create Lead'}
          </button>
        </form>
      </div>
    </div>
  );
}
