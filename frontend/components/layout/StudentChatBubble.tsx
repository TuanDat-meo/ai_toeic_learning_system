'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Reply, Send, X } from 'lucide-react';
import { getCurrentUser, type AuthUser } from '@/lib/api/auth';
import { chatHeartbeat, getDiscussion, getOrCreateSupportThread, getSupportMessages, getSupportThreads, sendDiscussionMessage, sendSupportMessage, type ChatMessage, type SupportThread } from '@/lib/api/chat';

type Tab = 'discussion' | 'support';
const formatTime = (value: string) => new Date(value).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export function StudentChatBubble() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('discussion');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [supportThreads, setSupportThreads] = useState<SupportThread[]>([]);
  const [supportLoaded, setSupportLoaded] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const openSupport = useCallback(async () => {
    try {
      if (user?.role === 'ADMIN') {
        const threads = await getSupportThreads(); setSupportThreads(threads); setSupportLoaded(true);
        setThreadId((current) => current && threads.some((thread) => thread.id === current) ? current : null);
      } else {
        const result = await getOrCreateSupportThread(); setThreadId(result.threadId);
      }
    }
    catch { setError('Không thể mở cuộc trò chuyện hỗ trợ. Vui lòng đăng nhập lại.'); }
  }, [user]);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
    const openChat = () => setOpen(true);
    window.addEventListener('toeic:open-chat', openChat);
    return () => window.removeEventListener('toeic:open-chat', openChat);
  }, []);

  useEffect(() => {
    if (tab === 'support' && user && (user.role === 'ADMIN' ? !supportLoaded : !threadId)) void openSupport();
  }, [tab, user, threadId, supportLoaded, openSupport]);

  const refresh = useCallback(async () => {
    try {
      if (tab === 'discussion') {
        const result = await getDiscussion(); setMessages(result.messages); setOnlineCount(result.onlineCount);
      } else {
        if (user?.role === 'ADMIN') {
          const threads = await getSupportThreads(); setSupportThreads(threads);
        }
        if (threadId) setMessages(await getSupportMessages(threadId));
        else setMessages([]);
      }
      setError('');
    } catch { setError('Không tải được tin nhắn. Kiểm tra kết nối rồi thử lại.'); }
  }, [tab, threadId, user]);

  useEffect(() => {
    if (!open) return;
    void refresh();
    const timer = window.setInterval(() => { void refresh(); if (user) void chatHeartbeat().then((r) => setOnlineCount(r.onlineCount)).catch(() => undefined); }, 4000);
    return () => window.clearInterval(timer);
  }, [open, refresh, user]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true); setError('');
    try {
      if (tab === 'discussion') await sendDiscussionMessage(content, replyTo?.id);
      else if (threadId) await sendSupportMessage(threadId, content, replyTo?.id);
      setDraft(''); setReplyTo(null); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Không gửi được tin nhắn.'); }
    finally { setSending(false); }
  }

  return <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
    {open ? <section id="student-chat-panel" aria-labelledby="student-chat-title" className="flex h-[min(34rem,calc(100dvh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div><h2 id="student-chat-title" className="text-sm font-bold text-slate-900">{tab === 'discussion' ? 'Thảo luận' : 'Hỗ trợ'} <span className="font-normal text-emerald-600">{tab === 'discussion' ? `• ${onlineCount} online` : ''}</span></h2><p className="text-xs text-slate-500">{tab === 'discussion' ? 'Trò chuyện, hỏi đáp và chia sẻ kinh nghiệm TOEIC' : 'Nhắn tin riêng với quản trị viên'}</p></div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Đóng chat" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="size-4" /></button>
      </header>
      <nav className="flex gap-2 px-3 py-2"><button type="button" onClick={() => { setTab('discussion'); setError(''); }} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tab === 'discussion' ? 'bg-indigo-600 text-white' : 'border text-slate-600'}`}>Thảo luận</button><button type="button" onClick={() => { setTab('support'); setError(''); if (user?.role === 'ADMIN') setThreadId(null); }} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tab === 'support' ? 'bg-indigo-600 text-white' : 'border text-slate-600'}`}>Hỗ trợ</button></nav>
      {tab === 'support' && user?.role === 'ADMIN' && threadId ? <div className="flex items-center gap-2 border-y border-slate-100 px-3 py-2"><button type="button" aria-label="Quay lại danh sách hỗ trợ" onClick={() => setThreadId(null)} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"><ArrowLeft className="size-4" /></button><span className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{supportThreads.find((thread) => thread.id === threadId)?.userName.trim().split(/\s+/).slice(-2).map((part) => part[0]?.toUpperCase()).join('') || 'HV'}</span><span className="min-w-0"><b className="block truncate text-xs text-slate-800">{supportThreads.find((thread) => thread.id === threadId)?.userName}</b><span className="block text-[10px] text-slate-500">Đang trò chuyện với học viên</span></span></div> : null}
      {tab === 'discussion' ? <div className="border-y border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-950">🔔 Hãy chia sẻ lịch sự, không đăng thông tin cá nhân hoặc nội dung quảng cáo.</div> : null}
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-white px-3 py-3">
        {tab === 'support' && user?.role === 'ADMIN' && !threadId ? supportThreads.length ? supportThreads.map((thread) => <button key={thread.id} type="button" onClick={() => { setThreadId(thread.id); setReplyTo(null); }} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-slate-50"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{thread.userName.trim().split(/\s+/).slice(-2).map((part) => part[0]?.toUpperCase()).join('') || 'HV'}</span><span className="min-w-0 flex-1"><b className="block truncate text-xs text-slate-800">{thread.userName}</b><span className="mt-1 block truncate text-[11px] text-slate-500">{thread.lastMessage || 'Chưa có tin nhắn'}</span></span></button>) : <p className="py-8 text-center text-xs text-slate-500">Chưa có cuộc trò chuyện hỗ trợ.</p> : messages.length ? messages.map((message) => <article key={message.id} className="flex gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">{message.senderName.trim().split(/\s+/).slice(-1)[0]?.slice(0, 1).toUpperCase()}</span>
          <div className="min-w-0 flex-1"><div className="mb-1 flex items-baseline gap-1.5"><span className="truncate text-[11px] font-semibold text-slate-700">{message.senderName}{message.senderRole === 'ADMIN' ? ' · Admin' : ''}</span><time className="shrink-0 text-[10px] text-slate-400">{formatTime(message.createdAt)}</time></div><div className="w-fit max-w-full rounded-xl rounded-tl-sm bg-slate-100 px-3 py-2">{message.replyToContent ? <div className="mb-2 border-l-2 border-indigo-400 pl-2 text-[10px] text-slate-500"><b>{message.replyToSenderName}</b>: {message.replyToContent}</div> : null}<p className="whitespace-pre-wrap break-words text-[13px] leading-5 text-slate-800">{message.content}</p></div>{user ? <button type="button" onClick={() => setReplyTo(message)} className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 hover:underline"><Reply className="size-3"/>Trả lời</button> : null}</div>
        </article>) : <p className="py-8 text-center text-xs text-slate-500">{tab === 'support' && !user ? 'Đăng nhập để nhắn tin với admin' : 'Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!'}</p>}
        {error ? <p role="alert" className="text-xs text-rose-600">{error}</p> : null}
      </div>
      {user ? <form onSubmit={submit} className="border-t border-slate-200 p-3">{replyTo ? <div className="mb-2 flex items-start justify-between gap-2 rounded-lg bg-indigo-50 px-2.5 py-2 text-[11px] text-indigo-900"><span className="line-clamp-2"><b>Trả lời {replyTo.senderName}:</b> {replyTo.content}</span><button type="button" onClick={() => setReplyTo(null)} aria-label="Bỏ trả lời" className="text-slate-500">×</button></div> : null}<div className="flex gap-2"><input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000} placeholder={tab === 'discussion' ? 'Viết tin nhắn...' : user.role === 'ADMIN' ? 'Trả lời học viên...' : 'Nhắn tin cho admin...'} className="h-10 min-w-0 flex-1 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400" /><button disabled={sending || !draft.trim() || (tab === 'support' && !threadId)} aria-label="Gửi tin nhắn" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white disabled:opacity-50"><Send className="size-4" /></button></div></form> : <div className="border-t border-slate-200 p-3 text-center text-xs"><Link href="/login" className="font-semibold text-indigo-600 hover:underline">Đăng nhập</Link> để {tab === 'discussion' ? 'chat cùng mọi người' : 'nhắn tin với admin'}</div>}
    </section> : null}
    <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Đóng chat' : 'Mở chat'} aria-expanded={open} aria-controls="student-chat-panel" className="flex size-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700">{open ? <X className="size-6" /> : <MessageCircle className="size-6" />}</button>
  </div>;
}
