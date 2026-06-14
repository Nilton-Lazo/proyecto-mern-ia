import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 landing-mesh opacity-60 dark:opacity-40" />
      <div className="hero-glow pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-600/20" />
      <div className="hero-glow pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-600/15" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-4 py-10 lg:flex-row lg:gap-16 lg:px-6">
        {/* Panel izquierdo — branding */}
        <ScrollReveal variant="fade-center" className="mb-8 max-w-md text-center lg:mb-0 lg:flex-1 lg:text-left">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-lg">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M12 3 1 8l11 5 9-4.09V17h2V8L12 3Zm0 12L4.5 11.2V14c0 2.53 3.58 4.5 7.5 4.5s7.5-1.97 7.5-4.5v-2.27L12 15Z" />
              </svg>
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Colegio San Carlos</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tutor Virtual de Lectura Crítica</p>
            </div>
          </Link>

          <h2 className="mt-8 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Aprende a leer con{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent text-gradient-animate">
              propósito
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Accede a actividades, práctica con IA y seguimiento de tu comprensión lectora.
            Diseñado para estudiantes y docentes del I.E.P. San Carlos.
          </p>

          <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
            {['Preguntas con IA', 'Retroalimentación', 'Progreso'].map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-800/80 dark:text-slate-300 dark:ring-slate-700"
              >
                {t}
              </span>
            ))}
          </div>
        </ScrollReveal>

        {/* Formulario */}
        <ScrollReveal variant="fade-scale" delay={100} className="w-full max-w-md lg:flex-1">
          <div className="app-card rounded-3xl p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            <div className="mt-6">{children}</div>
            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">{footer}</div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
