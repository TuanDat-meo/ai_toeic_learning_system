'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpenText, LoaderCircle, MessageCircle, MessagesSquare, Plus, Send, Trash2 } from 'lucide-react';
import { getCurrentUser, type AuthUser } from '@/lib/api/auth';
import {
  createCommunityComment, createCommunityPost, deleteCommunityPost, getCommunityComments, getCommunityPosts,
  type CommunityComment, type CommunityPost,
} from '@/lib/api/community';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function getQuestionName(snapshot: Record<string, unknown> | null) {
  if (!snapshot) return '';
  return String(snapshot.questionText ?? snapshot.question ?? snapshot.text ?? snapshot.transcript ?? '').trim();
}

function QuestionSnapshot({ snapshot, showQuestionText = true }: { snapshot: Record<string, unknown>; showQuestionText?: boolean }) {
  const question = String(snapshot.questionText ?? snapshot.question ?? snapshot.text ?? '');
  const mainPassage = snapshot.passage ?? snapshot.passageText ?? snapshot.transcript;
  const passages = Array.isArray(snapshot.passages)
    ? snapshot.passages as Array<Record<string, unknown>>
    : [];
  const imageValues = [snapshot.imageUrl, ...(Array.isArray(snapshot.imageUrls) ? snapshot.imageUrls : []), snapshot.image]
    .flatMap((value) => {
      if (typeof value === 'string') return [value];
      if (value && typeof value === 'object' && 'url' in value && typeof value.url === 'string') return [value.url];
      return [];
    }).filter((value, index, values) => value.trim() && values.indexOf(value) === index);
  const audioUrl = typeof snapshot.audioUrl === 'string' ? snapshot.audioUrl : '';
  const options = snapshot.options;
  const optionEntries = Array.isArray(options)
    ? options.map((option, index) => {
        const item = option as Record<string, unknown>;
        return [String(item.id ?? String.fromCharCode(65 + index)), String(item.text ?? option)];
      })
    : options && typeof options === 'object' ? Object.entries(options as Record<string, unknown>).map(([key, value]) => [key, String(value)]) : [];
  return <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-sm">
    <p className="mb-2 flex items-center gap-2 font-bold text-indigo-900"><BookOpenText className="size-4" /> Câu hỏi được chia sẻ</p>
    {snapshot.passageTitle ? <p className="mb-2 font-semibold text-slate-800">{String(snapshot.passageTitle)}</p> : null}
    {mainPassage ? <div className="mb-3 max-h-96 overflow-y-auto rounded-lg bg-white p-4"><p className="whitespace-pre-wrap leading-6 text-slate-700">{String(mainPassage)}</p>
      {snapshot.passageTextVi ? <details className="mt-3 border-t border-slate-100 pt-2"><summary className="cursor-pointer text-xs font-semibold text-indigo-700">Bản dịch tiếng Việt</summary><p className="mt-2 whitespace-pre-wrap leading-6 text-slate-600">{String(snapshot.passageTextVi)}</p></details> : null}
    </div> : null}
    {passages.map((passage, index) => <section key={`${String(passage.label ?? 'passage')}-${index}`} className="mb-3 rounded-lg bg-white p-4">
      {passage.label ? <h4 className="mb-2 font-bold text-slate-800">{String(passage.label)}</h4> : null}
      {passage.text ? <p className="whitespace-pre-wrap leading-6 text-slate-700">{String(passage.text)}</p> : null}
      {passage.textVi ? <details className="mt-3 border-t border-slate-100 pt-2"><summary className="cursor-pointer text-xs font-semibold text-indigo-700">Bản dịch tiếng Việt</summary><p className="mt-2 whitespace-pre-wrap leading-6 text-slate-600">{String(passage.textVi)}</p></details> : null}
    </section>)}
    {showQuestionText && question ? <p className="whitespace-pre-wrap font-medium text-slate-900">{question}</p> : null}
    {imageValues.length > 0 && <div className="mt-3 grid gap-3 sm:grid-cols-2">{imageValues.map((src, index) => <figure key={`${src}-${index}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white p-2">
      <img src={src} alt={`Hình ảnh câu hỏi ${index + 1}`} className="mx-auto max-h-96 max-w-full object-contain" loading="lazy" />
    </figure>)}</div>}
    {optionEntries.length > 0 && <ul className="mt-3 space-y-1.5">{optionEntries.map(([key, value]) => <li key={key} className="text-slate-700"><span className="font-bold">{key}.</span> {value}</li>)}</ul>}
    {snapshot.correctAnswer ? <p className="mt-3 text-xs text-slate-500">Đáp án tham khảo: <strong>{String(snapshot.correctAnswer)}</strong></p> : null}
    {snapshot.explanation ? <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">{String(snapshot.explanation)}</p> : null}
    {audioUrl && <div className="mt-4 rounded-lg bg-white p-3"><p className="mb-2 text-xs font-bold text-slate-700">Audio câu hỏi</p><audio controls preload="none" className="w-full" src={audioUrl}>Trình duyệt không hỗ trợ phát audio.</audio></div>}
  </div>;
}

export function CommunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPostId = searchParams.get('post');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [openCommentsPostId, setOpenCommentsPostId] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'QUESTION' | 'DISCUSSION'>('ALL');

  useEffect(() => {
    let active = true;
    Promise.all([getCurrentUser(), getCommunityPosts()]).then(([currentUser, data]) => {
      if (!active) return;
      setUser(currentUser);
      setPosts(data);
    }).catch((cause) => setError(cause instanceof Error ? cause.message : 'Không thể tải cộng đồng.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    getCommunityComments(selectedId).then((data) => { if (active) setComments(data); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Không thể tải bình luận.'); });
    return () => { active = false; };
  }, [selectedId]);

  async function submitPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true); setError('');
    try {
      const post = await createCommunityPost({ title: title.trim(), content: content.trim(), postType: 'DISCUSSION' });
      setPosts((current) => [post, ...current]); setTitle(''); setContent(''); setCreating(false); setComments([]); setSelectedId(post.id);
      router.push(`/community?post=${post.id}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể đăng bài.'); }
    finally { setSubmitting(false); }
  }

  async function toggleComments(postId: string) {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId('');
      return;
    }
    setOpenCommentsPostId(postId);
    setCommentText('');
    try {
      setComments(await getCommunityComments(postId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải bình luận.');
    }
  }

  async function submitComment(event: React.FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault();
    if (!postId || !commentText.trim()) return;
    setSubmitting(true); setError('');
    try {
      const comment = await createCommunityComment(postId, commentText.trim());
      setComments((current) => [...current, comment]); setCommentText('');
      setPosts((current) => current.map((post) => post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể gửi bình luận.'); }
    finally { setSubmitting(false); }
  }

  async function removePost(postId: string) {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await deleteCommunityPost(postId);
      setPosts((current) => current.filter((post) => post.id !== postId));
      if (selectedId === postId || requestedPostId === postId) { setComments([]); setSelectedId(''); router.replace('/community?feed=all'); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể xóa bài viết.'); }
  }

  const selectedPostId = requestedPostId ?? (searchParams.get('feed') === 'all' ? '' : selectedId);
  const selected = posts.find((post) => post.id === selectedPostId);
  const visibleFeedFilter = searchParams.get('feed') === 'all' ? 'ALL' : feedFilter;
  const visiblePosts = posts.filter((post) => visibleFeedFilter === 'ALL' || post.postType === visibleFeedFilter);

  return <div className="mx-auto w-full max-w-5xl">
    <div className="mx-auto max-w-[660px]">
    {!selected && <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <button type="button" onClick={() => setCreating((value) => !value)} className="flex w-full items-center gap-3 text-left">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-base font-semibold text-white">{user?.fullName?.slice(0, 1) || 'N'}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-slate-500">{user?.fullName ? `${user.fullName} ơi, bạn đang nghĩ gì thế?` : 'Bạn đang nghĩ gì thế?'}</span>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"><Plus className="size-4" /> Đăng bài</span>
      </button>
    </section>}

    {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    {creating && <form onSubmit={(event) => void submitPost(event)} className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-900">Tạo bài thảo luận</h2>
      <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="community-title">Tiêu đề</label><input id="community-title" required maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Bạn muốn trao đổi điều gì?" className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
      <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="community-content">Nội dung</label><textarea id="community-content" required minLength={5} maxLength={10000} rows={5} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Mô tả câu hỏi, cách bạn đã thử hoặc kinh nghiệm muốn chia sẻ..." className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
      <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setCreating(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Hủy</button><button disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">{submitting ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />} Đăng bài</button></div>
    </form>}

    {selected ? <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <button type="button" onClick={() => { setComments([]); setSelectedId(''); router.push('/community?feed=all'); }} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"><ArrowLeft className="size-4" /> Tất cả bài viết</button>
      <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-extrabold text-slate-900">{selected.title}</h2>{getQuestionName(selected.questionSnapshot) && <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-base font-semibold leading-6 text-indigo-800">{getQuestionName(selected.questionSnapshot)}</p>}<p className="mt-2 text-xs text-slate-500">{selected.authorName} · {formatDate(selected.createdAt)}</p></div>{(user?.id === selected.authorId || user?.role === 'ADMIN') && <button type="button" onClick={() => void removePost(selected.id)} title="Xóa bài viết" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="size-4" /></button>}</div>
      <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700">{selected.content}</p>
      {selected.questionSnapshot && <QuestionSnapshot snapshot={selected.questionSnapshot} showQuestionText={false} />}
    </section> : <>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {([['ALL', 'Tất cả'], ['QUESTION', 'Hỏi bài'], ['DISCUSSION', 'Thảo luận']] as const).map(([filter, label]) => <button key={filter} type="button" onClick={() => { setFeedFilter(filter); router.replace('/community'); }} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${visibleFeedFilter === filter ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{label}</button>)}
      </div>
      {loading ? <div className="flex justify-center py-16"><LoaderCircle className="size-7 animate-spin text-indigo-600" /></div> : visiblePosts.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><MessagesSquare className="mx-auto size-10 text-indigo-300" /><h2 className="mt-3 font-bold text-slate-900">Chưa có bài viết</h2><p className="mt-1 text-sm text-slate-500">Hãy mở đầu cuộc thảo luận đầu tiên của cộng đồng.</p><button type="button" onClick={() => setCreating(true)} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">Tạo bài viết</button></div> : <div className="space-y-3">{visiblePosts.map((post) => <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
        <div className="flex items-start justify-between gap-4"><button type="button" onClick={() => { setComments([]); setSelectedId(post.id); window.history.replaceState(null, '', `/community?post=${post.id}`); }} className="flex min-w-0 flex-1 items-start gap-3 text-left"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">{post.authorName.slice(0, 2).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-x-2 text-sm font-bold text-slate-900">{post.authorName}<span className="font-normal text-slate-400">· {formatDate(post.createdAt)}</span><span className="font-normal text-slate-400">· {post.postType === 'QUESTION' ? 'Hỏi bài' : 'Thảo luận'}</span></span><h2 className="mt-2 text-base font-bold text-slate-900">{post.title}</h2>{getQuestionName(post.questionSnapshot) && <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm font-semibold leading-5 text-indigo-800">{getQuestionName(post.questionSnapshot)}</p>}<p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{post.content}</p></span></button>{(user?.id === post.authorId || user?.role === 'ADMIN') && <button type="button" onClick={() => void removePost(post.id)} title="Xóa bài viết" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Trash2 className="size-4" /></button>}</div>
        {post.questionSnapshot && <button type="button" onClick={() => { setComments([]); setSelectedId(post.id); window.history.replaceState(null, '', `/community?post=${post.id}`); }} className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-sm"><span className="flex items-center gap-2 font-semibold text-slate-800"><BookOpenText className="size-4 text-blue-600" />{getQuestionName(post.questionSnapshot) || 'Câu hỏi TOEIC đính kèm'}</span><span className="font-semibold text-blue-600">Xem bài ›</span></button>}
        <div className="mt-4 flex items-center gap-5 border-t border-slate-100 pt-3 text-sm text-slate-500"><button type="button" onClick={() => void toggleComments(post.id)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-blue-600 hover:bg-blue-50"><MessageCircle className="size-4" /> {post.commentCount}</button></div>
        {openCommentsPostId === post.id && <div className="-mx-5 mt-3 border-t border-slate-100 px-5 pt-4">
          <div className="space-y-3">{comments.map((comment) => <article key={comment.id} className="flex items-start gap-2.5"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{comment.authorName.slice(0, 1).toUpperCase()}</span><div className="min-w-0 rounded-2xl bg-slate-100 px-3 py-2"><p className="text-xs font-bold text-slate-800">{comment.authorName}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-slate-700">{comment.content}</p></div><span className="shrink-0 pt-1 text-[11px] text-slate-400">{formatDate(comment.createdAt)}</span></article>)}{comments.length === 0 && <p className="pl-10 text-sm text-slate-500">Chưa có bình luận. Hãy bắt đầu trò chuyện nhé.</p>}</div>
          <form onSubmit={(event) => void submitComment(event, post.id)} className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2"><input required maxLength={3000} value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Viết bình luận..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" /><button type="submit" disabled={submitting || !commentText.trim()} aria-label="Gửi bình luận" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"><Send className="size-4" /></button></form>
        </div>}
      </article>)}</div>}
    </>}
    </div>
  </div>;
}
