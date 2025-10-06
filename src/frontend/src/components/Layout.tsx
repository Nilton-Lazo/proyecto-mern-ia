import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Header global */}
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Universidad Continental
          </span>
          <nav className="flex items-center gap-6 text-sm text-slate-600">
            <Link className="hover:text-slate-900 transition-colors" to="/">
              Inicio
            </Link>
            <Link className="hover:text-slate-900 transition-colors" to="/questions">
              Preguntas
            </Link>
            <Link className="hover:text-slate-900 transition-colors" to="/reports">
              Reportes
            </Link>
            <Link className="hover:text-slate-900 transition-colors" to="/prueba">
              Acceder
            </Link>
          </nav>
        </div>
      </header>

      {/* Aquí se cargan las páginas dinámicamente */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      {/* Footer global */}
      <footer className="border-t bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500">
          © {new Date().getFullYear()} Tutor Virtual de Lectura Crítica
        </div>
      </footer>
    </div>
  );
}
