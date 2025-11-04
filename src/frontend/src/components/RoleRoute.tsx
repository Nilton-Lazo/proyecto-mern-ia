import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

type Props = {
    children: ReactNode;
    allowed: Array<'teacher' | 'admin' | 'student'>;
};

export default function RoleRoute({ children, allowed }: Props) {
    const { user, token } = useAuth();

    if (!token || !user) return <Navigate to="/login" replace />;
    if (!allowed.includes(user.role)) return <Navigate to="/" replace />;

    return <>{children}</>;
}
