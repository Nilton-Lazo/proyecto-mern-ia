function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header simple */}
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Tutor Virtual - Inicio del Pryecto
          </span>
          <nav className="flex items-center gap-6 text-sm text-slate-600">
            <a className="hover:text-slate-900 transition-colors" href="/">
              Inicio
            </a>
            <a className="hover:text-slate-900 transition-colors" href="/prueba">
              Documentos
            </a>
            <a className="hover:text-slate-900 transition-colors" href="#">
              Contacto
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto grid max-w-6xl place-items-center px-4 py-20">
        <section className="w-full">
          <div className="grid items-center gap-10 md:grid-cols-2">
            {/* Texto */}
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                Hello <span className="text-blue-600">World</span> 👋
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Arrancamos el proyecto con <strong>Vite + React + Tailwind v4</strong>.
                Ha empezar a construir.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  Grupo de Desarrollo
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Plataforma Discord
                </a>
              </div>

              {/* Badges de tecnologias que se usaran */}
              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-white/70 px-3 py-1 ring-1 ring-slate-200">
                  TypeScript
                </span>
                <span className="rounded-full bg-white/70 px-3 py-1 ring-1 ring-slate-200">
                  React
                </span>
                <span className="rounded-full bg-white/70 px-3 py-1 ring-1 ring-slate-200">
                  Tailwind v4
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500">
          © {new Date().getFullYear()} Tutor Virtual — Espere el resultado final con ansias.
        </div>
      </footer>
    </div>
  )
}

export default Home
