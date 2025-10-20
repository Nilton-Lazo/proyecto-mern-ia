import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Fondo decorativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-100 blur-3xl opacity-70" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-100 blur-3xl opacity-70" />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* Badge */}
        <div className="mx-auto mb-6 w-fit rounded-full border border-blue-200 bg-blue-50/70 px-3 py-1 text-xs font-medium text-blue-700">
          IA educativa • Lectura crítica
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Texto */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl leading-tight">
              Desarrolla tu{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                pensamiento crítico
              </span>{" "}
              con un tutor virtual
            </h1>

            <p className="mt-5 text-lg text-slate-700 leading-relaxed md:max-w-xl md:text-xl">
              Lee un texto, genera preguntas inteligentes, recibe retroalimentación
              inmediata y visualiza tu progreso. Todo apoyado por modelos de IA
              locales (Ollama) y almacenamiento en MongoDB.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:items-start">
              <Link
                to="/questions"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow hover:bg-blue-700 transition"
              >
                Comenzar
                <svg
                  className="ml-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <a
                href="https://github.com/Nilton-Lazo/proyecto-mern-ia"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow ring-1 ring-slate-200 hover:bg-slate-50 transition"
              >
                Saber más
              </a>
            </div>

            {/* Métricas / confianza */}
            <ul className="mt-8 grid grid-cols-3 gap-3 text-center md:text-left md:max-w-md">
              <li className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-100">
                <p className="text-2xl font-bold text-slate-900">IA</p>
                <p className="text-xs text-slate-500">Ollama local</p>
              </li>
              <li className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-100">
                <p className="text-2xl font-bold text-slate-900">Mongo</p>
                <p className="text-xs text-slate-500">Datos seguros</p>
              </li>
              <li className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-100">
                <p className="text-2xl font-bold text-slate-900">Reportes</p>
                <p className="text-xs text-slate-500">Progreso claro</p>
              </li>
            </ul>
          </div>

          {/* Ilustración */}
          <div className="mx-auto w-full max-w-md">
            <div className="relative">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-blue-200 to-indigo-200 blur-xl opacity-60" />
              <div className="relative rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
                {/* SVG ilustración */}
                <svg
                  viewBox="0 0 200 200"
                  className="mx-auto h-64 w-64"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="90" fill="#EEF2FF" />
                  <rect x="40" y="65" width="120" height="70" rx="12" fill="url(#g1)" />
                  <rect x="52" y="78" width="96" height="12" rx="6" fill="white" opacity="0.9" />
                  <rect x="52" y="98" width="72" height="12" rx="6" fill="white" opacity="0.9" />
                  <circle cx="150" cy="104" r="8" fill="white" opacity="0.95" />
                  <path
                    d="M148 104 l4 4 l8 -8"
                    stroke="#22c55e"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <p className="mt-4 text-center text-sm text-slate-600">
                  Genera preguntas, responde y recibe feedback automático.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features rápidas */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            title="Preguntas inteligentes"
            desc="Analizamos tu texto y generamos preguntas enfocadas en comprensión y análisis."
            icon={
              <path d="M12 3 1 8l11 5 11-5-11-5Zm-8 9v4l8 4 8-4v-4l-8 4-8-4Z" />
            }
          />
          <Feature
            title="Retroalimentación inmediata"
            desc="Recibe comentarios claros sobre tus respuestas para mejorar al instante."
            icon={
              <path d="M4 4h16v12H7l-3 3V4Zm4 4h8M8 11h8" />
            }
          />
          <Feature
            title="Reportes y progreso"
            desc="Visualiza tu evolución con gráficos y últimas respuestas guardadas."
            icon={
              <path d="M4 19h16M7 16V8m5 8V6m5 10v-4" />
            }
          />
        </div>
      </section>
    </main>
  );
}

function Feature({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
          {icon}
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  );
}