import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ui/ScrollReveal';

const BENEFITS = [
  {
    icon: '🧠',
    title: 'Comprensión lectora con IA',
    desc: 'Genera preguntas automáticas adaptadas al texto: literal, inferencial, crítica y vocabulario.',
  },
  {
    icon: '⚡',
    title: 'Retroalimentación inmediata',
    desc: 'El estudiante recibe comentarios al instante sobre aciertos y áreas de mejora, sin esperar al docente.',
  },
  {
    icon: '📊',
    title: 'Seguimiento del progreso',
    desc: 'Registro de resultados, puntajes y avance por actividad. Reportes solo para usuarios autenticados.',
  },
  {
    icon: '👩‍🏫',
    title: 'Menos carga para el docente',
    desc: 'Asignación digital de lecturas, evaluación automática y panel con indicadores por estudiante.',
  },
  {
    icon: '🔍',
    title: 'Pensamiento crítico',
    desc: 'Detección de sesgos, análisis de idea principal y preguntas que fomentan la reflexión.',
  },
  {
    icon: '🌱',
    title: 'Educación sostenible',
    desc: 'Reduce el uso de papel y promueve el aprendizaje digital responsable en primaria y secundaria.',
  },
];

const STATS = [
  { value: '5+', label: 'Preguntas por texto' },
  { value: '<3s', label: 'Respuesta del sistema' },
  { value: '24/7', label: 'Acceso en línea' },
  { value: '100%', label: 'Adaptado al colegio' },
];

export default function Benefits() {
  return (
    <main className="bg-white">
      {/* Hero oscuro */}
      <section className="landing-mesh relative overflow-hidden bg-slate-950 px-6 py-20 text-center text-white md:py-28">
        <div className="float-slow pointer-events-none absolute left-[10%] top-[20%] text-4xl opacity-20">📚</div>
        <div className="float-delay pointer-events-none absolute right-[12%] top-[30%] text-5xl opacity-15">✨</div>
        <ScrollReveal variant="fade-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            I.E.P. San Carlos
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Ventajas de usar el Tutor Virtual
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Una solución propia, integrada al modelo pedagógico del colegio, que digitaliza la
            evaluación lectora y fortalece el pensamiento crítico.
          </p>
        </ScrollReveal>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100 bg-slate-50 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 60} className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{s.value}</p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Benefits grid */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <ScrollReveal variant="fade-center" className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-slate-900">¿Por qué elegir esta plataforma?</h2>
          <p className="mt-3 text-slate-600">
            Frente a evaluaciones manuales o plataformas genéricas internacionales
          </p>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <ScrollReveal key={b.title} delay={i * 70}>
              <article className="group h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md hover:ring-indigo-100">
                <span className="text-3xl">{b.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.desc}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Comparativa */}
      <section className="bg-slate-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal variant="fade-center" className="text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Comparado con métodos tradicionales</h2>
            <div className="mt-10 overflow-hidden rounded-2xl ring-1 ring-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="p-4">Aspecto</th>
                    <th className="p-4">Tradicional</th>
                    <th className="p-4 text-sky-300">Tutor Virtual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ['Retroalimentación', 'Días después', 'Inmediata con IA'],
                    ['Seguimiento', 'Manual', 'Automático por estudiante'],
                    ['Preguntas', 'Elaboradas a mano', 'Generadas por IA'],
                    ['Acceso', 'Solo en aula', 'Desde cualquier dispositivo'],
                  ].map(([a, t, v]) => (
                    <tr key={a}>
                      <td className="p-4 font-medium">{a}</td>
                      <td className="p-4 text-slate-400">{t}</td>
                      <td className="p-4 text-emerald-300">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-6 py-16 text-center">
        <ScrollReveal variant="fade-center">
          <Link
            to="/como-funciona"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Ver cómo funciona el sistema →
          </Link>
          <div className="mt-6">
            <Link
              to="/register"
              className="inline-flex rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Registrarse gratis
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
