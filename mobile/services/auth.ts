import { request } from './api';
import type { User } from '../types';

export async function registerApi(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  return request('/auth/register', { method: 'POST', body: data });
}

export async function loginApi(data: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  return request('/auth/login', { method: 'POST', body: data });
}

export async function fetchMe(): Promise<{ user: User }> {
  return request('/auth/me');
}