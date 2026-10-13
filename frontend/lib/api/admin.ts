import { apiRequest, postAuthRequest, writeAuthRequest, type ApiMessage } from './client';
import type { AuthUser } from './auth';

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
