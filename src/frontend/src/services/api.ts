import { API_URL } from '../config/env';

export function getApiBase(): string {
  return API_URL ?? 'http://localhost:3000';
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const isBodyMethod = rest.method && !['GET', 'HEAD'].includes(rest.method.toUpperCase());
  const res = await fetch(`${getApiBase()}${path}`, {
    ...rest,
    headers: {
      ...(isBodyMethod ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Error ${res.status}`);
  }
  return data as T;
}
