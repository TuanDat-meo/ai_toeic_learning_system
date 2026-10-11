export type ApiMessage = {
  message?: string;
  detail?: string;
};

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
        throw new Error(payload?.detail || payload?.message || 'Email hoặc mật khẩu không chính xác.');
      }
      throw new Error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
    }
    if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này.');
    throw new Error(payload?.detail || payload?.message || 'Yêu cầu chưa thể xử lý. Vui lòng thử lại.');
  }

  return payload as T;
}

export async function writeAuthRequest<T>(method: 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
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

export function postAuthRequest<T>(path: string, body?: unknown) {
  return writeAuthRequest<T>('POST', path, body);
}
