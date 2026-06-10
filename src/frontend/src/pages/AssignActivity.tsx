import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import { Input, Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import StudentSelector from '../components/teacher/StudentSelector';
import {
  createActivity,
  extractPdf,
  fetchTeacherStudents,
  type TeacherStudent,
} from '../services/teacherService';
import { CURRICULAR_AREAS, DEFAULT_AREA, type CurricularArea } from '../constants/curricularAreas';
import { validateUploadFile, isPdfFile } from '../utils/fileValidation';

export default function AssignActivity() {
  const { token, user } = useAuth();

  const [title, setTitle] = useState('');
  const [area, setArea] = useState<CurricularArea>(DEFAULT_AREA);
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [textBody, setTextBody] = useState('');
  const [sourceType, setSourceType] = useState<'text' | 'pdf' | 'markdown'>('text');
  const [originalFileName, setOriginalFileName] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const data = await fetchTeacherStudents(token, studentSearch);
      setStudents(data.students);
    } catch {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [token, studentSearch]);

  useEffect(() => {
    const t = setTimeout(loadStudents, studentSearch ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadStudents, studentSearch]);

  const onToggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const onSelectAll = () => setSelected(students.map((s) => s._id));

  const onSelectFiltered = () => {
    const q = studentSearch.trim().toLowerCase();
    const filtered = q
      ? students.filter(
          (s) =>
            s.nombres.toLowerCase().includes(q) ||
            s.apellidos.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
        )
      : students;
    setSelected((prev) => [...new Set([...prev, ...filtered.map((s) => s._id)])]);
  };

  const onFile = async (f: File | null) => {
    if (!f) return;
    setErr(null);
    const validation = validateUploadFile(f);
    if (validation) {
      setErr(validation);
      return;
    }

    if (isPdfFile(f)) {
      setExtracting(true);
      try {
        const result = await extractPdf(f, token);
        if (!result.text?.trim()) {
          setErr('El PDF no contiene texto legible o está vacío.');
          return;
        }
        setTextBody(result.text);
        setSourceType('pdf');
        setOriginalFileName(result.originalFileName);
        setShowPreview(true);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'No se pudo leer el PDF');
      } finally {
        setExtracting(false);
      }
      return;
    }

    const content = await f.text();
    setTextBody(content);
    setSourceType(f.name.toLowerCase().endsWith('.md') ? 'markdown' : 'text');
    setOriginalFileName(f.name);
    setShowPreview(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);

    if (!title.trim()) return setErr('El título es obligatorio.');
    if (!area) return setErr('Selecciona un área o curso.');
    if (!topic.trim()) return setErr('Indica el tema de la actividad.');
    if (!textBody.trim()) return setErr('Debes incluir el texto de lectura o subir un archivo.');
    if (!selected.length) return setErr('Selecciona al menos un estudiante.');

    try {
      setLoading(true);
      await createActivity(
        {
          title: title.trim(),
          area,
          topic: topic.trim(),
          instructions: instructions.trim(),
          text: textBody,
          dueAt: dueAt || null,
          assignees: selected,
          sourceType,
          originalFileName,
        },
        token
      );

      setOkMsg('Actividad asignada correctamente a los estudiantes seleccionados.');
      setTitle('');
      setTopic('');
      setInstructions('');
      setTextBody('');
      setDueAt('');
      setSelected([]);
      setSourceType('text');
      setOriginalFileName('');
      setShowPreview(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error al asignar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        badge="Ruta de aprendizaje con IA"
        title="Asignar actividad"
        subtitle="Organiza lecturas por área curricular, sube PDF o texto y asigna a tus estudiantes."
        crumbs={[
          { label: 'Inicio', to: '/teacher/dashboard' },
          { label: 'Asignar actividad' },
        ]}
      />

      {user?.role !== 'teacher' && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Estás viendo una página pensada para docentes.
        </p>
      )}

      <div className="mt-4 space-y-2">
        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {err}
          </div>
        )}
        {okMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            {okMsg}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        {/* Paso 1: Información */}
        <section className="app-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            1. Información de la actividad
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="app-label block">Título *</label>
              <Input
                className="mt-1"
                placeholder='Ej.: "Energía y cambio climático"'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="app-label block">Área / Curso *</label>
              <select
                className="app-input mt-1 w-full"
                value={area}
                onChange={(e) => setArea(e.target.value as CurricularArea)}
              >
                {CURRICULAR_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="app-label block">Tema *</label>
              <Input
                className="mt-1"
                placeholder='Ej.: "Cambio climático", "Texto narrativo"'
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="app-label block">Instrucciones</label>
              <Textarea
                className="mt-1"
                rows={3}
                placeholder="Indica qué debe hacer el estudiante…"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Paso 2: Lectura */}
        <section className="app-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            2. Lectura o archivo
          </p>
          <div className="mt-4">
            <label className="app-label block">Texto de la lectura *</label>
            <Textarea
              className="mt-1"
              rows={10}
              placeholder="Pega el texto o sube un archivo .txt, .md o .pdf…"
              value={textBody}
              onChange={(e) => {
                setTextBody(e.target.value);
                if (sourceType === 'pdf') setSourceType('text');
              }}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-indigo-400 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                <input
                  type="file"
                  accept=".txt,.md,.markdown,.pdf"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] || null)}
                />
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] text-white">
                  ↑
                </span>
                {extracting ? 'Extrayendo PDF…' : 'Subir .txt / .md / .pdf'}
              </label>
              {originalFileName && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Archivo: {originalFileName} ({sourceType})
                </span>
              )}
            </div>
            {showPreview && textBody.trim() && (
              <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                <summary className="cursor-pointer text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  Vista previa del texto extraído ({textBody.length} caracteres)
                </summary>
                <p className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300">
                  {textBody.slice(0, 2000)}
                  {textBody.length > 2000 ? '…' : ''}
                </p>
              </details>
            )}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Paso 3: Configuración */}
          <section className="app-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              3. Configuración
            </p>
            <div className="mt-4">
              <label className="app-label block">Fecha límite (opcional)</label>
              <Input
                type="date"
                className="mt-1"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>
            <div className="mt-4 rounded-2xl bg-indigo-50/60 px-3 py-3 text-xs text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
              <p className="font-medium">Ruta de aprendizaje con IA</p>
              <p className="mt-1">
                El estudiante leerá el texto, analizará con IA, responderá preguntas clasificadas
                por habilidad y recibirá retroalimentación formativa con seguimiento de progreso.
              </p>
            </div>
          </section>

          {/* Paso 4: Estudiantes */}
          <div>
            {loadingStudents && (
              <p className="mb-2 text-xs text-slate-500">Actualizando lista de estudiantes…</p>
            )}
            <StudentSelector
              students={students}
              selected={selected}
              search={studentSearch}
              onSearch={setStudentSearch}
              onToggle={onToggle}
              onSelectAll={onSelectAll}
              onSelectFiltered={onSelectFiltered}
              onClear={() => setSelected([])}
            />
          </div>
        </div>

        {/* Paso 5: Confirmación */}
        <section className="app-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            5. Confirmación
          </p>
          <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Área:</strong> {area} · <strong>Tema:</strong> {topic || '—'}
            </li>
            <li>
              <strong>Estudiantes:</strong> {selected.length} seleccionados
            </li>
            <li>
              <strong>Lectura:</strong> {textBody.trim() ? `${textBody.length} caracteres` : 'pendiente'}
            </li>
          </ul>
          <Button type="submit" disabled={loading || extracting} loading={loading} className="mt-4 w-full sm:w-auto">
            {loading ? 'Asignando…' : 'Asignar actividad'}
          </Button>
        </section>
      </form>
    </div>
  );
}
