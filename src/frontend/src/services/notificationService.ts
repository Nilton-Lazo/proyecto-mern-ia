import { apiFetch } from './api';
import type { AppNotification, NotificationsResponse } from '../types/notification';

export function fetchMyNotifications(token: string | null, unreadOnly = false) {
  const query = unreadOnly ? '?unread=true' : '';
  return apiFetch<NotificationsResponse>(`/api/notifications/me${query}`, { token });
}

export function markNotificationRead(token: string | null, notificationId: string) {
  return apiFetch<{ success: boolean; notification: AppNotification }>(
    `/api/notifications/${notificationId}/read`,
    { method: 'PATCH', token }
  );
}
