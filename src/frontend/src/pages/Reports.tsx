import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/ui/LoadingState';

/**
 * Redirige /reports al módulo correcto según rol.
 * Mantiene compatibilidad con enlaces existentes en nav y dashboards.
 */
export default function Reports() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace state={{ from: '/reports' }} />;

  if (user.role === 'teacher' || user.role === 'admin') {
    return <Navigate to="/teacher/reports" replace />;
  }

  if (user.role === 'student') {
    return <Navigate to="/student/reports" replace />;
  }

  return <LoadingState />;
}
