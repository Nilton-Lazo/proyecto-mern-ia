import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/ui/AuthLayout';
import { Input, Select } from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({
    nombres: '',
    apellidos: '',
    centroEstudios: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await register(f);
      nav(f.role === 'teacher' ? '/teacher/dashboard' : '/student/home');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Únete al tutor virtual del Colegio San Carlos"
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400" to="/login">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Nombres"
            value={f.nombres}
            onChange={(e) => setF({ ...f, nombres: e.target.value })}
            required
          />
          <Input
            placeholder="Apellidos"
            value={f.apellidos}
            onChange={(e) => setF({ ...f, apellidos: e.target.value })}
            required
          />
        </div>
        <Input
          placeholder="Centro de estudios (opcional)"
          value={f.centroEstudios}
          onChange={(e) => setF({ ...f, centroEstudios: e.target.value })}
        />
        <Input
          type="email"
          placeholder="Correo electrónico"
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
          required
          autoComplete="new-password"
        />
        <Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
          <option value="student">Soy estudiante</option>
          <option value="teacher">Soy docente</option>
        </Select>
        {err && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {err}
          </p>
        )}
        <Button type="submit" className="w-full" loading={loading}>
          {loading ? 'Creando…' : 'Registrarme'}
        </Button>
      </form>
    </AuthLayout>
  );
}
