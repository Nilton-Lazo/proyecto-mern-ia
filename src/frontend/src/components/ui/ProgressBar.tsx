type Props = {
  value: number;
  className?: string;
  color?: 'blue' | 'emerald' | 'amber';
};

export default function ProgressBar({ value, className = '', color = 'blue' }: Props) {
  const pct = Math.min(100, Math.max(0, value));
  const bar =
    color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : 'bg-indigo-600';

  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${className}`}>
      <div className={`h-2 rounded-full transition-all ${bar}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
