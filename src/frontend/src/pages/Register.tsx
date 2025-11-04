import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ 
    nombres:'', 
    apellidos:'', 
    centroEstudios:'', 
    email:'', 
    password:'', 
    role:'student' 
  });
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    try { 
      await register(f); 
      nav(f.role === 'teacher' ? '/teacher/dashboard' : '/questions');
    }
    catch (e:any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-4">Crear cuenta</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded-lg border p-3" placeholder="Nombres" value={f.nombres} onChange={e=>setF({...f, nombres:e.target.value})}/>
        <input className="w-full rounded-lg border p-3" placeholder="Apellidos" value={f.apellidos} onChange={e=>setF({...f, apellidos:e.target.value})}/>
        <input className="w-full rounded-lg border p-3" placeholder="Centro de estudios (opcional)" value={f.centroEstudios} onChange={e=>setF({...f, centroEstudios:e.target.value})}/>
        <input className="w-full rounded-lg border p-3" placeholder="Correo" value={f.email} onChange={e=>setF({...f, email:e.target.value})}/>
        <input className="w-full rounded-lg border p-3" placeholder="Contraseña" type="password" value={f.password} onChange={e=>setF({...f, password:e.target.value})}/>
        
        {/* Selector de rol */}
        <select
          className="w-full rounded-lg border p-3"
          value={f.role}
          onChange={e=>setF({...f, role:e.target.value})}
        >
          <option value="student">Soy estudiante</option>
          <option value="teacher">Soy docente</option>
        </select>

        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold disabled:opacity-50" disabled={loading}>
          {loading ? 'Creando...' : 'Registrarme'}
        </button>
      </form>
      <p className="mt-3 text-sm text-slate-600">
        ¿Ya tienes cuenta? <Link className="text-blue-600 hover:underline" to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}