import { API_BASE_URL, apiRequest, postAuthRequest, writeAuthRequest, type ApiMessage } from './client';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'STUDENT' | 'TEACHER';
};

export function getHomePathForRole(role: AuthUser['role']) {
  if (role === 'ADMIN') return '/admin/overview';
  if (role === 'TEACHER') return '/admin/content/vocabulary';
  return '/dashboard';
}

export type AccountActivity = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string | null;
  createdAt: string;
};

export type LearningOnboardingPayload = {
  targetScore: number;
  examDate: string | null;
  learningReason: 'CAREER' | 'STUDY' | 'TRAVEL' | 'PERSONAL';
  currentLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
  recentScore: number | null;
  dailyStudyMinutes: number | null;
  studyDays: number[];
  interests: ('LISTENING' | 'READING' | 'VOCABULARY' | 'GRAMMAR' | 'MOCK_TESTS')[];
};

export type LearningOnboardingDraft = Omit<LearningOnboardingPayload, 'learningReason' | 'targetScore'> & {
  targetScore: number | null;
  learningReason: LearningOnboardingPayload['learningReason'] | null;
  currentStep: number;
};

export type LearningOnboardingState = LearningOnboardingDraft & {
  completed: boolean;
};

export function getCurrentUser() {
  return apiRequest<AuthUser>('/api/auth/me');
}

export function getLearningOnboardingStatus() {
  return apiRequest<{ state: LearningOnboardingState }>('/api/learning-profile/onboarding/status');
}

export function completeLearningOnboarding(payload: LearningOnboardingPayload) {
  return postAuthRequest<void>('/api/learning-profile/onboarding', payload);
}

export function saveLearningOnboardingDraft(draft: LearningOnboardingDraft) {
  return writeAuthRequest<void>('PUT', '/api/learning-profile/onboarding/draft', draft);
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

export function startGoogleLogin(flow: 'login' | 'signup') {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${API_BASE_URL}/api/auth/google/${flow}`);
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
