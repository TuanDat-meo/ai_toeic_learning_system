import { apiRequest, postAuthRequest } from './client';

export type ChatMessage = {
  id: string;
  threadId: string | null;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  replyToId: string | null;
  replyToSenderName: string | null;
  replyToContent: string | null;
  createdAt: string;
};

export type SupportThread = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  lastMessage: string | null;
  updatedAt: string;
};

export const getDiscussion = () => apiRequest<{ onlineCount: number; messages: ChatMessage[] }>('/api/chat/discussion');
export const sendDiscussionMessage = (content: string, replyToId?: string | null) => postAuthRequest<ChatMessage>('/api/chat/discussion', { content, replyToId: replyToId ?? null });
export const chatHeartbeat = () => postAuthRequest<{ onlineCount: number }>('/api/chat/presence');
export const getOrCreateSupportThread = () => postAuthRequest<{ threadId: string }>('/api/chat/support/thread');
export const getSupportMessages = (threadId: string) => apiRequest<ChatMessage[]>(`/api/chat/support/${threadId}/messages`);
export const sendSupportMessage = (threadId: string, content: string, replyToId?: string | null) => postAuthRequest<ChatMessage>(`/api/chat/support/${threadId}/messages`, { content, replyToId: replyToId ?? null });
export const getSupportThreads = () => apiRequest<SupportThread[]>('/api/admin/chat/support');
