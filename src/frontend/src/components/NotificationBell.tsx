import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyNotifications, markNotificationRead } from '../services/notificationService';
import type { AppNotification } from '../types/notification';
import { formatDate } from '../utils/formatDate';

function BellIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.5 9.5 0 0 0-2.346 5.12.75.75 0 0 0 1.479.248A8 8 0 0 1 5.85 3.5ZM19.267 2.5a.75.75 0 1 0-1.118 1 8 8 0 0 1 1.987 4.045.75.75 0 0 0 1.479-.248A9.5 9.5 0 0 0 19.267 2.5Z" />
      <path
        fillRule="evenodd"
        d="M12 2.25A6.75 6.75 0 0 0 5.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c1.544.57 3.16.864 4.773.864h7.598c1.613 0 3.228-.295 4.773-.864a.75.75 0 0 0 .298-1.206 8.217 8.217 0 0 1-2.119-5.52V9A6.75 6.75 0 0 0 12 2.25ZM9.75 18c0 .034 0 .067.002.1a2.25 2.25 0 0 0 4.496 0 .75.75 0 0 0-.004-.1h-4.49Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type NotificationBellProps = {
  compact?: boolean;
};

export default function NotificationBell({ compact = false }: NotificationBellProps) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchMyNotifications(token);
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      /* silencioso — no bloquear UI */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const handleMarkRead = async (n: AppNotification) => {
    if (!token || n.read) return;
    try {
      await markNotificationRead(token, n._id);
      setNotifications((prev) =>
        prev.map((item) => (item._id === n._id ? { ...item, read: true } : item))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
        className={`relative inline-flex items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white ${
          compact ? 'h-9 w-9' : 'h-10 w-10'
        }`}
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:w-96">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Notificaciones</p>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} sin leer</p>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Cargando…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                No tienes notificaciones aún.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.slice(0, 8).map((n) => (
                  <li
                    key={n._id}
                    className={`px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                      !n.read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                        {n.message && (
                          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                        )}
                        <p className="mt-1 text-[11px] text-slate-400">{formatDate(n.createdAt)}</p>
                        {n.activityId && n.type === 'activity_assigned' && (
                          <Link
                            to={`/student/activities/${n.activityId}`}
                            onClick={() => {
                              handleMarkRead(n);
                              setOpen(false);
                            }}
                            className="mt-1 inline-block text-xs font-medium text-indigo-600 hover:underline"
                          >
                            Ver actividad →
                          </Link>
                        )}
                      </div>
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(n)}
                          className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        >
                          Leída
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function NotificationListPanel({
  limit = 5,
  onUpdate,
}: {
  limit?: number;
  onUpdate?: () => void;
}) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchMyNotifications(token);
      setNotifications(res.notifications.slice(0, limit));
      onUpdate?.();
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [token, limit, onUpdate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (n: AppNotification) => {
    if (!token || n.read) return;
    try {
      await markNotificationRead(token, n._id);
      setNotifications((prev) =>
        prev.map((item) => (item._id === n._id ? { ...item, read: true } : item))
      );
      onUpdate?.();
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando notificaciones…</p>;
  }

  if (notifications.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Aún no tienes notificaciones. Cuando un docente te asigne una actividad, aparecerá aquí automáticamente.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {notifications.map((n) => (
        <div
          key={n._id}
          className={`app-card p-4 ${!n.read ? 'ring-2 ring-indigo-200 dark:ring-indigo-800' : ''}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{n.title}</p>
              {n.message && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{n.message}</p>
              )}
              <p className="mt-1 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {n.activityId && (
                <Link
                  to={`/student/activities/${n.activityId}`}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Abrir
                </Link>
              )}
              {!n.read && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(n)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Marcar leída
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
