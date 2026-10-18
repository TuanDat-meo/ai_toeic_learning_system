'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoaderCircle, MessageCircle, MessagesSquare, RefreshCw, Trash2 } from 'lucide-react';
import { deleteCommunityPost, getCommunityComments, getCommunityPosts, type CommunityComment, type CommunityPost } from '@/lib/api/community';

type Filter = 'ALL' | 'QUESTION' | 'DISCUSSION';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function getQuestionName(snapshot: Record<string, unknown> | null) {
  if (!snapshot) return '';
  return String(snapshot.questionText ?? snapshot.question ?? snapshot.text ?? snapshot.transcript ?? '').trim();
}

export function AdminCommunityView() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [expandedPostId, setExpandedPostId] = useState('');
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState('');
  const [error, setError] = useState('');

  const refreshPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPosts(await getCommunityPosts());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải bài viết cộng đồng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshPosts(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshPosts]);

  const visiblePosts = useMemo(
    () => posts.filter((post) => filter === 'ALL' || post.postType === filter),
    [posts, filter],
  );

  async function toggleComments(postId: string) {
    if (expandedPostId === postId) {
      setExpandedPostId('');
      setComments([]);
      return;
    }
    setExpandedPostId(postId);
    setComments([]);
    setLoadingComments(true);
    try {
      setComments(await getCommunityComments(postId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải bình luận.');
    } finally {
      setLoadingComments(false);
    }
  }

  async function removePost(post: CommunityPost) {
    if (!window.confirm(`Xóa bài “${post.title}” cùng toàn bộ bình luận?`)) return;
    setDeletingPostId(post.id);
    setError('');
    try {
      await deleteCommunityPost(post.id);
      setPosts((current) => current.filter((item) => item.id !== post.id));
      if (expandedPostId === post.id) {
        setExpandedPostId('');
        setComments([]);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể xóa bài viết.');
    } finally {
      setDeletingPostId('');
    }
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-indigo-700">Chăm sóc người dùng</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Cộng đồng</h1>
        <p className="mt-1 text-sm text-slate-500">Theo dõi bài viết và bình luận; xóa nội dung không phù hợp khi cần.</p>
      </div>
      <button type="button" onClick={() => void refreshPosts()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
        <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
      </button>
    </div>

    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div><h2 className="font-semibold text-slate-900">Bài viết cộng đồng</h2><p className="text-xs text-slate-500">{posts.length} bài viết gần nhất</p></div>
        <div className="flex gap-2">
          {([['ALL', 'Tất cả'], ['QUESTION', 'Hỏi bài'], ['DISCUSSION', 'Thảo luận']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${filter === value ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{label}</button>)}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><LoaderCircle className="size-7 animate-spin text-indigo-600" /></div>
        : visiblePosts.length === 0 ? <div className="px-6 py-16 text-center"><MessagesSquare className="mx-auto size-9 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-600">Không có bài viết nào trong mục này.</p></div>
          : <div className="divide-y divide-slate-100">{visiblePosts.map((post) => <article key={post.id} className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{post.authorName.trim().split(/\s+/).slice(-2).map((part) => part[0]?.toUpperCase()).join('') || 'HV'}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500"><span className="font-semibold text-slate-800">{post.authorName}</span><span>{formatDate(post.createdAt)}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">{post.postType === 'QUESTION' ? 'Hỏi bài' : 'Thảo luận'}</span></div>
                <h3 className="mt-2 font-bold text-slate-900">{post.title}</h3>
                {getQuestionName(post.questionSnapshot) && <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm font-semibold text-indigo-800">{getQuestionName(post.questionSnapshot)}</p>}
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{post.content}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => void toggleComments(post.id)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"><MessageCircle className="size-4" />{post.commentCount} bình luận</button>
                  <button type="button" onClick={() => void removePost(post)} disabled={deletingPostId === post.id} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"><Trash2 className="size-4" />{deletingPostId === post.id ? 'Đang xóa…' : 'Xóa bài'}</button>
                </div>
                {expandedPostId === post.id && <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <h4 className="mb-2 text-xs font-bold text-slate-700">Bình luận</h4>
                  {loadingComments ? <LoaderCircle className="size-4 animate-spin text-indigo-600" /> : comments.length ? <div className="space-y-2">{comments.map((comment) => <div key={comment.id} className="rounded-lg bg-white px-3 py-2"><p className="text-xs font-semibold text-slate-800">{comment.authorName}<span className="ml-2 font-normal text-slate-400">{formatDate(comment.createdAt)}</span></p><p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{comment.content}</p></div>)}</div> : <p className="text-xs text-slate-500">Chưa có bình luận.</p>}
                </div>}
              </div>
            </div>
          </article>)}</div>}
    </section>
  </div>;
}
