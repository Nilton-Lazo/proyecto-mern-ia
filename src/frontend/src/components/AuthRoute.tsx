import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

type Props = { children: ReactNode };

/** Solo usuarios autenticados (cualquier rol). */
export default function AuthRoute({ children }: Props) {
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace state={{ from: '/reports' }} />;
  return <>{children}</>;
}
