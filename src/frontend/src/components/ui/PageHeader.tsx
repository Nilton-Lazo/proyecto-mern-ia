import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';

type Crumb = { label: string; to?: string };

type Props = {
  badge?: string;
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  action?: ReactNode;
  animate?: boolean;
};

export default function PageHeader({
  badge,
  title,
  subtitle,
  crumbs,
  action,
  animate = false,
}: Props) {
  const content = (
    <>
      {crumbs && crumbs.length > 0 && (
        <nav className="app-breadcrumb mb-3 flex flex-wrap items-center">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center">
              {i > 0 && <span className="mx-2 opacity-60">/</span>}
              {c.to ? (
                <Link to={c.to} className="hover:text-slate-700 dark:hover:text-white">
                  {c.label}
                </Link>
              ) : (
                <span className="app-breadcrumb-active">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {badge && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-800">
              {badge}
            </span>
          )}
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    </>
  );

  if (animate) {
    return (
      <header className="mb-8">
        <ScrollReveal variant="fade-up">{content}</ScrollReveal>
      </header>
    );
  }

  return <header className="mb-8">{content}</header>;
}
