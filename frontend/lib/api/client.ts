export type ApiMessage = {
  message?: string;
  detail?: string;
};

export class ApiRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

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

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
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
    if (response.status === 401) {
      if (path === '/api/auth/login') {
        throw new ApiRequestError(payload?.detail || payload?.message || 'Email hoặc mật khẩu không chính xác.', 401);
      }
      throw new ApiRequestError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.', 401);
    }
    if (response.status === 403) throw new ApiRequestError('Bạn không có quyền thực hiện thao tác này.', 403);
    throw new ApiRequestError(
      payload?.detail || payload?.message || 'Yêu cầu chưa thể xử lý. Vui lòng thử lại.',
      response.status,
    );
  }

  return payload as T;
}

export async function writeAuthRequest<T>(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
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

export async function uploadAuthRequest<T>(path: string, body: FormData): Promise<T> {
  const csrf = await getCsrfToken();
  return apiRequest<T>(path, {
    method: 'POST',
    headers: { [csrf.headerName]: csrf.token },
    body,
  });
}

export function postAuthRequest<T>(path: string, body?: unknown) {
  return writeAuthRequest<T>('POST', path, body);
}
