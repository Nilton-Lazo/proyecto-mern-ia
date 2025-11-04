import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    try { 
      const user = await login(email, password);
      if (user.role === 'teacher') {
        nav('/teacher/dashboard');
      } else {
        nav('/questions');
      }
    } 
    catch (e:any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded-lg border p-3" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded-lg border p-3" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold disabled:opacity-50" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <p className="mt-3 text-sm text-slate-600">
        ¿No tienes cuenta? <Link className="text-blue-600 hover:underline" to="/register">Regístrate</Link>
      </p>
    </div>
  );
}