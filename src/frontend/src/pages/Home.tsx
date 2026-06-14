import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ui/ScrollReveal';

export default function Home() {
  return (
    <main className="overflow-hidden bg-white dark:bg-slate-950">
      {/* ── HERO full-screen estilo Apple ── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
        <div className="pointer-events-none absolute inset-0 landing-mesh" />
        <div className="hero-glow pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="float-slow pointer-events-none absolute left-[8%] top-[25%] hidden h-16 w-16 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-lg ring-1 ring-slate-100 dark:bg-slate-800/80 dark:ring-slate-700 md:flex">
          📖
        </div>
        <div className="float-delay pointer-events-none absolute right-[10%] top-[35%] hidden h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl md:flex">
          🤖
        </div>

        <ScrollReveal variant="fade-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
            Colegio San Carlos
          </p>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold tracking-tight text-slate-900 dark:text-white md:text-7xl md:leading-[1.05]">
            Lectura comprensiva.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent text-gradient-animate">
              Potenciada con IA.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300 md:text-xl">
            El tutor virtual que genera preguntas, brinda retroalimentación inmediata y
            acompaña el progreso de cada estudiante.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Comenzar ahora
            </Link>
            <Link
              to="/como-funciona"
              className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700"
            >
              Ver tutorial
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={200} className="mt-16 w-full max-w-3xl">
          <div className="mx-auto rounded-3xl bg-gradient-to-b from-slate-100 to-white p-1 shadow-2xl ring-1 ring-slate-200/80">
            <div className="rounded-[1.35rem] bg-slate-900 px-6 py-8 text-left text-slate-300 md:px-10">
              <p className="text-[11px] uppercase tracking-widest text-sky-400">Vista previa</p>
              <p className="mt-3 text-lg font-medium text-white">
                «La lectura comprensiva fortalece el pensamiento crítico…»
              </p>
              <div className="mt-4 space-y-2">
                <div className="h-2 w-3/4 rounded-full bg-indigo-500/40" />
                <div className="h-2 w-1/2 rounded-full bg-sky-500/30" />
              </div>
              <p className="mt-4 text-xs text-emerald-400">✓ 5 preguntas generadas · Retroalimentación lista</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Sección sticky scroll: texto centrado ── */}
      <section className="landing-section-dark px-6 py-32 text-center text-white">
        <ScrollReveal variant="fade-center">
          <h2 className="mx-auto max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Preguntas que entienden el texto.
            <br />
            <span className="text-slate-400">No genéricas. No al azar.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-slate-400">
            La IA analiza cada lectura y crea preguntas de comprensión literal, inferencial
            y pensamiento crítico adaptadas al contenido.
          </p>
        </ScrollReveal>
      </section>

      <section className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal variant="fade-center" className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              Diseñado para el aula peruana
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Inicial, primaria y secundaria — I.E.P. San Carlos</p>
          </ScrollReveal>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Para estudiantes',
                desc: 'Actividades asignadas, práctica libre con IA y seguimiento de tu progreso.',
                to: '/beneficios',
                cta: 'Conocer ventajas',
              },
              {
                title: 'Para docentes',
                desc: 'Asigna lecturas, monitorea entregas y accede a reportes de comprensión.',
                to: '/como-funciona',
                cta: 'Ver cómo funciona',
              },
              {
                title: 'Para el colegio',
                desc: 'Digitaliza la evaluación lectora y reduce la carga administrativa.',
                to: '/beneficios',
                cta: 'Explorar beneficios',
              },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 100}>
                <article className="flex h-full flex-col rounded-3xl bg-slate-50 p-8 ring-1 ring-slate-100 dark:bg-slate-900/60 dark:ring-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{card.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{card.desc}</p>
                  <Link
                    to={card.to}
                    className="mt-6 text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    {card.cta} →
                  </Link>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-slate-100 bg-slate-50 px-6 py-24 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <ScrollReveal variant="fade-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Empieza a leer con propósito</h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-600 dark:text-slate-400">
            Regístrate como estudiante o docente. Los reportes y datos personales solo son
            visibles tras iniciar sesión.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/questions"
              className="rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Probar generador
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
