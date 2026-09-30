import type { LeadStatus } from '../types/lead';

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  NEW:       { label: 'New',       bg: 'bg-indigo-500/15', text: 'text-indigo-300', dot: 'bg-indigo-400' },
  CONTACTED: { label: 'Contacted', bg: 'bg-sky-500/15',    text: 'text-sky-300',    dot: 'bg-sky-400' },
  QUALIFIED: { label: 'Qualified', bg: 'bg-violet-500/15', text: 'text-violet-300', dot: 'bg-violet-400' },
  CONVERTED: { label: 'Converted', bg: 'bg-emerald-500/15',text: 'text-emerald-300',dot: 'bg-emerald-400' },
  LOST:      { label: 'Lost',      bg: 'bg-rose-500/15',   text: 'text-rose-300',   dot: 'bg-rose-400' },
};

interface StatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide ${px} ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
