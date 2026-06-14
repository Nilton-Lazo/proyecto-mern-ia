import { useCallback, useEffect, useRef, useState } from 'react';
import type { QuestionAnswer } from '../types/student';
import { autosaveActivity } from '../services/studentService';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type Options = {
  activityId: string | undefined;
  token: string | null;
  answers: QuestionAnswer[];
  currentStep?: number;
  enabled?: boolean;
  intervalMs?: number;
};

function storageKey(id: string) {
  return `tutor-autosave-${id}`;
}

export function useAutoSave({
  activityId,
  token,
  answers,
  currentStep = 4,
  enabled = true,
  intervalMs = 8000,
}: Options) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  const answersRef = useRef(answers);
  const savingRef = useRef(false);

  answersRef.current = answers;

  const persistLocal = useCallback(() => {
    if (!activityId) return;
    try {
      localStorage.setItem(
        storageKey(activityId),
        JSON.stringify({ answers, currentStep, savedAt: new Date().toISOString() })
      );
    } catch {
      /* ignore quota */
    }
  }, [activityId, answers, currentStep]);

  const save = useCallback(async (force = false) => {
    if (!activityId || !token || !enabled) return;
    if (!force && !dirtyRef.current) return;
    if (savingRef.current) return;

    savingRef.current = true;
    setStatus('saving');
    setErrorMsg(null);
    persistLocal();

    try {
      const res = await autosaveActivity(activityId, answersRef.current, token, currentStep);
      dirtyRef.current = false;
      const at = res.lastSavedAt ? new Date(res.lastSavedAt) : new Date();
      setLastSavedAt(at);
      setStatus('saved');
    } catch (e) {
      setStatus('error');
      setErrorMsg(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      savingRef.current = false;
    }
  }, [activityId, token, enabled, currentStep, persistLocal]);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    if (status === 'saved') setStatus('idle');
  }, [status]);

  // Interval autosave
  useEffect(() => {
    if (!enabled || !activityId) return;
    const t = setInterval(() => save(false), intervalMs);
    return () => clearInterval(t);
  }, [enabled, activityId, intervalMs, save]);

  // Save on unmount / route leave
  useEffect(() => {
    return () => {
      if (dirtyRef.current && activityId && token) {
        autosaveActivity(activityId, answersRef.current, token, currentStep).catch(() => {});
      }
    };
  }, [activityId, token, currentStep]);

  // beforeunload
  useEffect(() => {
    if (!enabled) return;
    const handler = () => {
      if (dirtyRef.current) persistLocal();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled, persistLocal]);

  const clearDirty = useCallback((savedAt?: string | Date) => {
    dirtyRef.current = false;
    setErrorMsg(null);
    if (savedAt) setLastSavedAt(savedAt instanceof Date ? savedAt : new Date(savedAt));
    setStatus('saved');
  }, []);

  return { status, lastSavedAt, errorMsg, markDirty, clearDirty, saveNow: () => save(true) };
}

export function loadLocalDraft(activityId: string): QuestionAnswer[] | null {
  try {
    const raw = localStorage.getItem(storageKey(activityId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.answers) ? parsed.answers : null;
  } catch {
    return null;
  }
}
