import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import {
  getNavRole,
  getHomePath,
  getNavItems,
  getFooterLinks,
} from './navConfig';

const FULL_BLEED_PATHS = new Set(['/', '/como-funciona', '/beneficios', '/login', '/register']);

const linkBase =
  'relative whitespace-nowrap px-3 py-2 rounded-xl text-sm font-medium transition-colors';
const linkInactive =
  'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800';
const linkActive =
  'text-slate-900 bg-slate-100 font-semibold dark:text-white dark:bg-slate-800';

function NavLinks({
  items,
  onNavigate,
  className = '',
}: {
  items: ReturnType<typeof getNavItems>;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={item.to + item.label}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive} ${className}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const isFullBleed = FULL_BLEED_PATHS.has(pathname);

  const navRole = getNavRole(user);
  const isTeacher = navRole === 'teacher';
  const isStudent = navRole === 'student';
  const navItems = getNavItems(navRole);
  const homePath = getHomePath(navRole);
  const footerLinks = getFooterLinks(navRole);

  const firstName = user?.nombres?.split(' ')[0] || 'Usuario';
  const initials = (user?.nombres || user?.email || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const closeMenu = () => setOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/80 transition-colors dark:bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-900/90 dark:supports-[backdrop-filter]:bg-slate-900/80">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Branding — destino según rol */}
            <Link to={homePath} className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 3 1 8l11 5 9-4.09V17h2V8L12 3Zm0 12L4.5 11.2V14c0 2.53 3.58 4.5 7.5 4.5s7.5-1.97 7.5-4.5v-2.27L12 15Z" />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                  Colegio San Carlos
                </p>
                <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                  Tutor Virtual de Lectura Crítica
                </p>
              </div>
            </Link>

            {/* NAV DESKTOP — solo links del rol actual */}
            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto md:flex lg:gap-1">
              <NavLinks items={navItems} />
            </nav>

            {/* Acciones derecha — desktop */}
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <ThemeToggle compact />

              {!user ? (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-900 text-white hover:bg-black dark:bg-white dark:text-slate-900'
                          : 'text-slate-700 hover:bg-slate-900 hover:text-white dark:text-slate-200 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    Acceder
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/60'
                      }`
                    }
                  >
                    Registrarse
                  </NavLink>
                </>
              ) : (
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-700">
                  <div className="hidden items-center gap-2 lg:flex">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-slate-50 dark:bg-indigo-600">
                      {initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-100">
                        Hola, {firstName}
                      </span>
                      <span className="text-[11px]">
                        {isTeacher && (
                          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:border-blue-700 dark:bg-blue-950/60 dark:text-blue-200">
                            Docente
                          </span>
                        )}
                        {isStudent && (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200">
                            Estudiante
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    Salir
                  </button>
                </div>
              )}
            </div>

            {/* Móvil */}
            <div className="flex shrink-0 items-center gap-2 md:hidden">
              <ThemeToggle compact />
              <button
                className="inline-flex items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setOpen((v) => !v)}
                aria-label="Abrir menú"
                aria-expanded={open}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  {open ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {open && (
            <nav className="flex flex-col gap-1 border-t border-slate-100 pb-4 pt-3 dark:border-slate-800 md:hidden">
              <NavLinks items={navItems} onNavigate={closeMenu} />

              {!user ? (
                <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className="rounded-xl bg-slate-900 px-3 py-2.5 text-center text-sm font-medium text-white dark:bg-white dark:text-slate-900"
                  >
                    Acceder
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={closeMenu}
                    className="rounded-xl bg-blue-600 px-3 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Registrarse
                  </NavLink>
                </div>
              ) : (
                <div className="mt-2 flex flex-col gap-2 rounded-2xl bg-slate-50/80 p-3 dark:bg-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-slate-50 dark:bg-indigo-600">
                      {initials}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-100">
                        Hola, {firstName}
                      </span>
                      <span className="ml-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {isTeacher ? 'Docente' : isStudent ? 'Estudiante' : 'Usuario'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); closeMenu(); }}
                    className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-slate-700"
                  >
                    Salir
                  </button>
                </div>
              )}
            </nav>
          )}
        </div>
      </header>

      <main
        className={
          isFullBleed
            ? 'flex-1 w-full'
            : 'flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:py-8'
        }
      >
        <Outlet />
      </main>

      <footer className="mt-4 border-t border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Tutor Virtual</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Plataforma para fortalecer la comprensión lectora con apoyo de IA,
              diseñada para docentes y estudiantes del Colegio San Carlos.
            </p>
          </div>

          <div className="text-sm">
            <p className="font-semibold text-slate-900 dark:text-white">
              {navRole === 'guest' ? 'Recursos' : 'Accesos rápidos'}
            </p>
            <ul className="mt-2 space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.to}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm sm:col-span-2 md:col-span-1">
            <p className="font-semibold text-slate-900 dark:text-white">Contacto</p>
            <div className="mt-3 flex items-center gap-3">
              <a href="https://github.com/" target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="GitHub">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.41-1.34-1.79-1.34-1.79-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.81 1.3 3.5.99.11-.77.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.9 0-1.3.47-2.36 1.23-3.19-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.22a11.4 11.4 0 0 1 6 0c2.28-1.54 3.29-1.22 3.29-1.22.66 1.65.24 2.87.12 3.17.77.83 1.23 1.9 1.23 3.19 0 4.59-2.81 5.59-5.49 5.89.43.37.81 1.1.81 2.22v3.3c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" /></svg>
              </a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.05c.53-1 1.82-2.06 3.75-2.06 4.01 0 4.75 2.64 4.75 6.06V23h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.12 1.43-2.12 2.9V23h-4V8.5z" /></svg>
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Twitter">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M18.244 2H21l-6.5 7.43L22.5 22H15.5l-5-6.96L4.5 22H2l7-8L2 2h6.5l4.6 6.39L18.244 2Z" /></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800">
          <div className="mx-auto max-w-6xl px-4 py-3 text-[11px] flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Tutor Virtual de Lectura Crítica</span>
            <span className="text-slate-400">Hecho con React + TypeScript + Tailwind + Node</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
