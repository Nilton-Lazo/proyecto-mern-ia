export type NavItem = { to: string; label: string; end?: boolean };

export type NavRole = 'guest' | 'teacher' | 'student';

export function getNavRole(user: { role?: string } | null): NavRole {
  if (!user) return 'guest';
  if (user.role === 'teacher') return 'teacher';
  if (user.role === 'student') return 'student';
  return 'guest';
}

export function getHomePath(role: NavRole): string {
  if (role === 'teacher') return '/teacher/dashboard';
  if (role === 'student') return '/student/home';
  return '/';
}

export function getNavItems(role: NavRole): NavItem[] {
  switch (role) {
    case 'teacher':
      return [
        { to: '/teacher/dashboard', label: 'Inicio', end: true },
        { to: '/teacher/assign', label: 'Asignar actividades' },
        { to: '/reports', label: 'Reportes' },
      ];
    case 'student':
      return [
        { to: '/student/home', label: 'Inicio', end: true },
        { to: '/student/activities', label: 'Mis actividades' },
        { to: '/student/practice', label: 'Práctica con IA' },
        { to: '/student/progress', label: 'Progreso' },
        { to: '/reports', label: 'Reportes' },
      ];
    default:
      return [
        { to: '/', label: 'Inicio', end: true },
        { to: '/questions', label: 'Preguntas' },
        { to: '/como-funciona', label: 'Cómo funciona' },
        { to: '/beneficios', label: 'Beneficios' },
      ];
  }
}

export function getFooterLinks(role: NavRole): { to: string; label: string; external?: boolean }[] {
  switch (role) {
    case 'teacher':
      return [
        { to: '/teacher/dashboard', label: 'Panel docente' },
        { to: '/teacher/assign', label: 'Asignar actividades' },
        { to: '/reports', label: 'Reportes' },
      ];
    case 'student':
      return [
        { to: '/student/home', label: 'Mi inicio' },
        { to: '/student/activities', label: 'Mis actividades' },
        { to: '/student/practice', label: 'Práctica con IA' },
        { to: '/reports', label: 'Reportes' },
      ];
    default:
      return [
        { to: 'https://github.com/Nilton-Lazo/proyecto-mern-ia', label: 'Repositorio GitHub', external: true },
        { to: '/como-funciona', label: 'Cómo funciona' },
        { to: '/beneficios', label: 'Beneficios' },
        { to: '/questions', label: 'Generar preguntas' },
      ];
  }
}
