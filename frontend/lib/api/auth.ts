type ApiMessage = {
  message?: string;
  detail?: string;
};

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

export type ManagedUser = AuthUser & {
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
};

export type AdminDashboard = {
  generatedAt: string;
  system: {
    api: 'UP' | 'DOWN';
    database: 'UP' | 'DOWN';
  };
  summary: {
    activeStudents: number;
    newStudentsLast7Days: number;
    totalVocabularies: number;
    publishedVocabularies: number;
    totalReadingPassages: number;
    publishedReadingPassages: number;
    pendingReviews: number;
    importsLast7Days: number;
    failedImportBatchesLast7Days: number;
    weeklyRegistrations: { date: string; count: number }[];
    recentImports: {
      fileName: string;
      status: string;
      totalRecords: number;
      successCount: number;
      failedCount: number;
      createdAt: string;
    }[];
  } | null;
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

async function getCsrfToken() {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new Error('Không thể kết nối máy chủ. Vui lòng thử lại sau.');
  }

  if (!response.ok) throw new Error('Không thể khởi tạo bảo mật phiên. Vui lòng thử lại.');
  return await response.json() as { token: string; headerName: string };
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: { Accept: 'application/json', ...init.headers },
    });
  } catch {
    throw new Error('Không thể kết nối máy chủ. Vui lòng thử lại sau.');
  }

  const payload = await response.json().catch(() => null) as ApiMessage | null;
  if (!response.ok) {
    if (response.status === 401) throw new Error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
    if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này.');
    throw new Error(payload?.detail || payload?.message || 'Yêu cầu chưa thể xử lý. Vui lòng thử lại.');
  }

  return payload as T;
}

async function writeAuthRequest<T>(method: 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const csrf = await getCsrfToken();
  return apiRequest<T>(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function postAuthRequest<T>(path: string, body?: unknown) {
  return writeAuthRequest<T>('POST', path, body);
}

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

export function registerStudent(fullName: string, email: string, password: string) {
  return postAuthRequest<{ message: string }>('/api/auth/register', { fullName, email, password });
}

export function logout() {
  return postAuthRequest<void>('/api/auth/logout');
}

export function listManagedUsers() {
  return apiRequest<ManagedUser[]>('/api/admin/users');
}

export function getAdminDashboard() {
  return apiRequest<AdminDashboard>('/api/admin/dashboard');
}

export function createManagedUser(input: {
  fullName: string;
  email: string;
  password: string;
  role: AuthUser['role'];
}) {
  return postAuthRequest<ApiMessage>('/api/admin/users', input);
}

export function updateManagedUser(userId: string, input: {
  fullName: string;
  email: string;
  password?: string;
  role: AuthUser['role'];
  status: ManagedUser['status'];
}) {
  return writeAuthRequest<ApiMessage>('PATCH', `/api/admin/users/${userId}`, input);
}

export function deleteManagedUser(userId: string) {
  return writeAuthRequest<void>('DELETE', `/api/admin/users/${userId}`);
}

export function requestPasswordReset(email: string) {
  return postAuthRequest<{ message: string }>('/api/auth/password/forgot', { email });
}

export function resetPassword(token: string, password: string) {
  return postAuthRequest<{ message: string }>('/api/auth/password/reset', { token, password });
}
