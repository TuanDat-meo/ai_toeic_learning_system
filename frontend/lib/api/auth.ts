import { API_BASE_URL, apiRequest, postAuthRequest, writeAuthRequest, type ApiMessage } from './client';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'STUDENT' | 'TEACHER';
};

export type AccountActivity = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string | null;
  createdAt: string;
};

export function getCurrentUser() {
  return apiRequest<AuthUser>('/api/auth/me');
}

export function updateCurrentUserProfile(fullName: string, email: string) {
  return writeAuthRequest<AuthUser & ApiMessage>('PATCH', '/api/auth/me', { fullName, email });
}

export function getAccountActivity(limit = 50) {
  return apiRequest<AccountActivity[]>(`/api/auth/activity?limit=${limit}`);
}

export function changePassword(currentPassword: string, newPassword: string) {
  return postAuthRequest<void>('/api/auth/password/change', { currentPassword, newPassword });
}

export function logoutAllSessions() {
  return postAuthRequest<void>('/api/auth/logout-all');
}

export function login(email: string, password: string) {
  return postAuthRequest<AuthUser>('/api/auth/login', { email, password });
}

export function startGoogleLogin() {
  if (typeof window !== 'undefined') {
    window.location.assign(`${API_BASE_URL}/oauth2/authorization/google`);
  }
}

export function registerStudent(fullName: string, email: string, password: string) {
  return postAuthRequest<{ message: string }>('/api/auth/register', { fullName, email, password });
}

export function logout() {
  return postAuthRequest<void>('/api/auth/logout');
}

export function requestPasswordReset(email: string) {
  return postAuthRequest<{ message: string }>('/api/auth/password/forgot', { email });
}

export function resetPassword(token: string, password: string) {
  return postAuthRequest<{ message: string }>('/api/auth/password/reset', { token, password });
}
