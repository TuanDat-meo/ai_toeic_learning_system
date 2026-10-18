import { apiRequest, postAuthRequest, writeAuthRequest } from './client';

export type CommunityPost = {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  postType: 'DISCUSSION' | 'QUESTION';
  questionSnapshot: Record<string, unknown> | null;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CommunityComment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export function getCommunityPosts() {
  return apiRequest<CommunityPost[]>('/api/community/posts');
}

export function createCommunityPost(input: {
  title: string;
  content: string;
  postType: 'DISCUSSION' | 'QUESTION';
  questionSnapshot?: Record<string, unknown>;
}) {
  return postAuthRequest<CommunityPost>('/api/community/posts', input);
}

export function deleteCommunityPost(id: string) {
  return writeAuthRequest<void>('DELETE', `/api/community/posts/${id}`);
}

export function getCommunityComments(postId: string) {
  return apiRequest<CommunityComment[]>(`/api/community/posts/${postId}/comments`);
}

export function createCommunityComment(postId: string, content: string) {
  return postAuthRequest<CommunityComment>(`/api/community/posts/${postId}/comments`, { content });
}
