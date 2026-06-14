type Card = {
  label: string;
  value: string | number;
  accent?: string;
  small?: boolean;
};

type Props = { cards: Card[] };

export default function SummaryCards({ cards }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="app-card p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
          <p
            className={`mt-1 font-semibold text-slate-900 dark:text-white ${c.small ? 'text-sm truncate' : 'text-xl'} ${c.accent || ''}`}
            title={typeof c.value === 'string' ? c.value : undefined}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
