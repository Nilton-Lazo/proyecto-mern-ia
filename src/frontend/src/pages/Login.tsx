import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/ui/AuthLayout';
import { Input } from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'teacher') nav('/teacher/dashboard');
      else if (user.role === 'student') nav('/student/home');
      else nav('/');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Ingresa con tu correo institucional"
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400" to="/register">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {err && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {err}
          </p>
        )}
        <Button type="submit" className="w-full" loading={loading}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </AuthLayout>
  );
}
