import { NavLink, Link, Outlet } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const [open, setOpen] = useState(false);

  const linkBase =
    "px-3 py-2 rounded-lg text-sm font-medium transition-colors";
  const linkInactive =
    "text-slate-600 hover:text-slate-900 hover:bg-slate-100";
  const linkActive = "text-white bg-blue-600 hover:bg-blue-700";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Branding */}
            <Link to="/" className="flex items-center gap-3">
              {/* logotipo simple (SVG) */}
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                {/* mortarboard icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M12 3 1 8l11 5 9-4.09V17h2V8L12 3Zm0 12L4.5 11.2V14c0 2.53 3.58 4.5 7.5 4.5s7.5-1.97 7.5-4.5v-2.27L12 15Z" />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-tight text-slate-900">
                  Universidad Continental
                </p>
                <p className="text-xs text-slate-500">
                  Tutor Virtual de Lectura Crítica
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Inicio
              </NavLink>
              <NavLink
                to="/questions"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Preguntas
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Reportes
              </NavLink>
              <NavLink
                to="/prueba"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? "bg-slate-900 text-white hover:bg-black" : "text-slate-700 hover:text-white hover:bg-slate-900"}`
                }
              >
                Acceder
              </NavLink>
            </nav>

            {/* Mobile toggle */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menú"
              aria-expanded={open}
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {open && (
            <nav className="md:hidden pb-3 flex flex-col gap-2">
              <NavLink
                to="/"
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Inicio
              </NavLink>
              <NavLink
                to="/questions"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Preguntas
              </NavLink>
              <NavLink
                to="/reports"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Reportes
              </NavLink>
              <NavLink
                to="/prueba"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? "bg-slate-900 text-white hover:bg-black" : "text-slate-700 hover:text-white hover:bg-slate-900"}`
                }
              >
                Acceder
              </NavLink>
            </nav>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Tutor Virtual
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Plataforma para fortalecer la comprensión lectora con apoyo de IA.
            </p>
          </div>

          <div className="text-sm">
            <p className="font-semibold text-slate-900">Recursos</p>
            <ul className="mt-2 space-y-2">
              <li>
                <a
                  href="https://github.com/Nilton-Lazo/proyecto-mern-ia"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-slate-900"
                >
                  Repositorio GitHub
                </a>
              </li>
              <li>
                <Link to="/reports" className="text-slate-600 hover:text-slate-900">
                  Reportes
                </Link>
              </li>
              <li>
                <Link to="/questions" className="text-slate-600 hover:text-slate-900">
                  Generar preguntas
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-sm">
            <p className="font-semibold text-slate-900">Contacto</p>
            <div className="mt-2 flex items-center gap-3">
              {/* GitHub */}
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.41-1.34-1.79-1.34-1.79-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.81 1.3 3.5.99.11-.77.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.9 0-1.3.47-2.36 1.23-3.19-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.22a11.4 11.4 0 0 1 6 0c2.28-1.54 3.29-1.22 3.29-1.22.66 1.65.24 2.87.12 3.17.77.83 1.23 1.9 1.23 3.19 0 4.59-2.81 5.59-5.49 5.89.43.37.81 1.1.81 2.22v3.3c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.05c.53-1 1.82-2.06 3.75-2.06 4.01 0 4.75 2.64 4.75 6.06V23h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.12 1.43-2.12 2.9V23h-4V8.5z" />
                </svg>
              </a>
              {/* X/Twitter */}
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                aria-label="Twitter"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M18.244 2H21l-6.5 7.43L22.5 22H15.5l-5-6.96L4.5 22H2l7-8L2 2h6.5l4.6 6.39L18.244 2Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500 flex items-center justify-between">
            <span>© {new Date().getFullYear()} Tutor Virtual de Lectura Crítica</span>
            <span className="hidden sm:inline">
              Hecho con React + TypeScript + Tailwind + Node
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}