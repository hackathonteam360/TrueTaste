import Constants from 'expo-constants';
import { useAuthStore } from '../store/auth.store';

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  const hostUri = (Constants.expoConfig as any)?.hostUri as string | undefined;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:5000/api`;
  }
  return 'http://localhost:5000/api';
}

export const API_URL = resolveBaseUrl();

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: any;
  formData?: FormData;
};

export async function request<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { formData, headers: extraHeaders = {}, ...rest } = options;
  const headers: Record<string, string> = { ...(extraHeaders as any) };
  let body: BodyInit | undefined;

  if (formData) {
    body = formData;
  } else if (rest.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(rest.body);
  }

  const token = useAuthStore.getState().token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...rest, headers, body });
  } catch {
    throw new ApiError(0, 'Network error. Check your connection and that the server is running.');
  }

  if (res.status === 401) {
    await useAuthStore.getState().logout();
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new ApiError(res.status, data?.message || `Request failed (${res.status})`);
  }

  return data as T;
}