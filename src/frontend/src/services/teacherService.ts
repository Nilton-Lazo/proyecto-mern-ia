import { API_URL } from '../config/env';

export type TeacherStudent = {
  _id: string;
  nombres: string;
  apellidos: string;
  email: string;
};

export type CreateActivityPayload = {
  title: string;
  area: string;
  topic: string;
  instructions: string;
  text: string;
  dueAt: string | null;
  assignees: string[];
  sourceType?: 'text' | 'pdf' | 'markdown';
  originalFileName?: string;
};

export async function fetchTeacherStudents(token: string | null, search = '') {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_URL}/api/teacher/students${q}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('No se pudieron cargar los estudiantes');
  return res.json() as Promise<{ students: TeacherStudent[]; total: number }>;
}

export async function extractPdf(file: File, token: string | null) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/api/teacher/extract-pdf`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al procesar PDF');
  return data as {
    ok: boolean;
    text: string;
    pages: number;
    charCount: number;
    originalFileName: string;
    sourceType: 'pdf';
  };
}

export async function createActivity(payload: CreateActivityPayload, token: string | null) {
  const res = await fetch(`${API_URL}/api/teacher/activities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'No se pudo crear la actividad');
  return data as { ok: boolean; activityId: string };
}
