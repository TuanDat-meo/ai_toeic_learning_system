import { apiRequest, writeAuthRequest } from './client';

export type SystemSettings = {
  systemName: string;
  supportEmail: string;
  dailyStudyMinutes: number;
  reminderTime: string;
  notifications: {
    newRegistrations: boolean;
    supportRequests: boolean;
    contentReports: boolean;
  };
  aiModerationEnabled: boolean;
  version: number;
  updatedAt: string;
};

export type SystemSettingsUpdate = Omit<SystemSettings, 'version' | 'updatedAt'> & {
  expectedVersion: number;
};

export function getSystemSettings() {
  return apiRequest<SystemSettings>('/api/admin/settings');
}

export function updateSystemSettings(settings: SystemSettingsUpdate) {
  return writeAuthRequest<SystemSettings>('PUT', '/api/admin/settings', settings);
}
