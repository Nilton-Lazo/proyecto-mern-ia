import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ui/ScrollReveal';

const STEPS = [
  {
    n: '01',
    title: 'El docente asigna una lectura',
    desc: 'Sube o selecciona un texto según el grado y nivel. El sistema crea la actividad para cada estudiante.',
  },
  {
    n: '02',
    title: 'La IA genera preguntas',
    desc: 'A partir del texto, se crean al menos 5 preguntas de comprensión literal, inferencial y pensamiento crítico.',
  },
  {
    n: '03',
    title: 'El estudiante responde',
    desc: 'Puede guardar borrador, practicar con retroalimentación inmediata y enviar cuando esté listo.',
  },
  {
    n: '04',
    title: 'Seguimiento y reportes',
    desc: 'El docente visualiza progreso, entregas y desempeño. Solo usuarios registrados acceden a sus datos.',
  },
];

const ROLES = [
  { role: 'Estudiante', items: ['Mis actividades', 'Práctica con IA', 'Progreso personal'] },
  { role: 'Docente', items: ['Asignar lecturas', 'Panel de seguimiento', 'Reportes por aula'] },
  { role: 'Colegio', items: ['Educación digital', 'Menos carga manual', 'Evaluación continua'] },
];

export default function HowItWorks() {
  return (
    <main className="overflow-hidden bg-slate-950 text-white">
      {/* Hero */}
      <section className="landing-mesh relative px-6 pb-20 pt-16 text-center md:pt-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="hero-glow absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>
        <ScrollReveal variant="fade-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            Tutorial del sistema
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Así funciona el{' '}
            <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent text-gradient-animate">
              Tutor Virtual
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-400 md:text-lg">
            Plataforma educativa del Colegio San Carlos para fortalecer la comprensión lectora
            y el pensamiento crítico con inteligencia artificial.
          </p>
        </ScrollReveal>
      </section>

      {/* Video / demo */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <ScrollReveal variant="fade-scale" delay={100}>
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 ring-1 ring-white/10 shadow-2xl">
            <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8">
              <div className="play-pulse mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/90 text-white shadow-lg">
                <svg className="ml-1 h-9 w-9" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-lg font-semibold">Recorrido visual del sistema</p>
              <p className="mt-2 max-w-md text-center text-sm text-slate-400">
                Demostración del flujo: registro → lectura asignada → preguntas con IA →
                retroalimentación → progreso del estudiante.
              </p>
              <div className="mt-8 grid w-full max-w-2xl grid-cols-4 gap-2 text-center text-[10px] text-slate-500">
                {['Registro', 'Lectura', 'Preguntas IA', 'Progreso'].map((s, i) => (
                  <div key={s} className="rounded-lg bg-white/5 py-2 ring-1 ring-white/10">
                    <span className="block text-indigo-400">{i + 1}</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <p className="border-t border-white/5 px-6 py-3 text-center text-xs text-slate-500">
              Video demostrativo del proyecto académico — I.E.P. San Carlos
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <ScrollReveal variant="fade-center" className="mb-14 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Flujo en 4 pasos</h2>
          <p className="mt-3 text-slate-400">Desde la asignación hasta el seguimiento docente</p>
        </ScrollReveal>
        <div className="grid gap-6 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <ScrollReveal key={s.n} delay={i * 80}>
              <article className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm">
                <span className="text-3xl font-bold text-indigo-400/80">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="landing-section-dark px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal variant="fade-center" className="mb-12 text-center">
            <h2 className="text-3xl font-bold">¿Quién usa la plataforma?</h2>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-3">
            {ROLES.map((r, i) => (
              <ScrollReveal key={r.role} delay={i * 100}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-sky-300">{r.role}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-slate-300">
                    {r.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 text-center">
        <ScrollReveal variant="fade-center">
          <p className="text-slate-400">¿Listo para empezar?</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Crear cuenta
            </Link>
            <Link
              to="/beneficios"
              className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Ver beneficios
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
