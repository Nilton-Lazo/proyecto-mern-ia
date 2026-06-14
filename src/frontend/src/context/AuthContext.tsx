// src/frontend/context/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type User = {
  id: string;
  email: string;
  nombres: string;
  apellidos?: string;
  role: 'student' | 'teacher' | 'admin';
};

type RegisterPayload = {
  nombres: string;
  apellidos: string;
  centroEstudios?: string;
  email: string;
  password: string;
  role?: 'student' | 'teacher';
};

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterPayload) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado inicial desde localStorage
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const v = localStorage.getItem('user');
    return v ? JSON.parse(v) : null;
  });

  // Sincroniza cambios en token/user con localStorage
  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');

    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [token, user]);

  // ---- Actions ----
  const login = async (email: string, password: string): Promise<User> => {
    let res: Response;
    try {
      res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error(
        `No se pudo conectar al servidor (${API}). Verifica que el backend esté activo en el puerto 3000.`
      );
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Error al iniciar sesión');

    // Normaliza por si el backend no envía role (default: student)
    const loggedUser: User = {
      id: data.user?.id ?? data.user?._id ?? '',
      email: data.user?.email ?? email,
      nombres: data.user?.nombres ?? '',
      role: (data.user?.role as User['role']) ?? 'student',
    };

    setToken(data.token);
    setUser(loggedUser);

    return loggedUser; // 👈 clave para poder leer user.role en Login.tsx
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    let res: Response;
    try {
      res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error(
        `No se pudo conectar al servidor (${API}). Verifica que el backend esté activo en el puerto 3000.`
      );
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Error al registrarse');

    const newUser: User = {
      id: data.user?.id ?? data.user?._id ?? '',
      email: data.user?.email ?? payload.email,
      nombres: data.user?.nombres ?? payload.nombres,
      role: (data.user?.role as User['role']) ?? 'student',
    };

    setToken(data.token ?? null);
    setUser(newUser);

    return newUser; // 👈 también retornamos el usuario
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}