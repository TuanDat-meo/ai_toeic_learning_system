'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, RefreshCw, Reply, Send } from 'lucide-react';
import { getSupportMessages, getSupportThreads, sendSupportMessage, type ChatMessage, type SupportThread } from '@/lib/api/chat';

function initials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map((part) => part[0]?.toLocaleUpperCase() ?? '').join('');
}

export function AdminChatView() {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  const refreshThreads = useCallback(async () => {
    try {
      const list = await getSupportThreads();
      setThreads(list);
      setSelected((current) => current && list.some((thread) => thread.id === current) ? current : null);
    } catch { setError('Không tải được danh sách hỗ trợ.'); }
  }, []);

  const refreshMessages = useCallback(async () => {
    if (!selected) { setMessages([]); return; }
    try { setMessages(await getSupportMessages(selected)); setError(''); }
    catch { setError('Không tải được tin nhắn của cuộc trò chuyện.'); }
  }, [selected]);

  useEffect(() => {
    void refreshThreads();
    const timer = window.setInterval(() => void refreshThreads(), 6000);
    return () => window.clearInterval(timer);
  }, [refreshThreads]);

  useEffect(() => {
    void refreshMessages();
    if (!selected) return;
    const timer = window.setInterval(() => void refreshMessages(), 4000);
    return () => window.clearInterval(timer);
  }, [refreshMessages, selected]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || !draft.trim() || busy) return;
    setBusy(true);
    try {
      await sendSupportMessage(selected, draft.trim(), replyTo?.id);
      setDraft(''); setReplyTo(null);
      await refreshMessages(); await refreshThreads();
    } catch (e) { setError(e instanceof Error ? e.message : 'Không gửi được tin nhắn.'); }
    finally { setBusy(false); }
  }

  const current = threads.find((thread) => thread.id === selected);

  return <div className="space-y-5">
    <div><p className="text-sm font-semibold text-indigo-700">Chăm sóc người dùng</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Tin nhắn hỗ trợ</h1><p className="mt-1 text-sm text-slate-500">Chọn một người dùng để mở và trả lời cuộc trò chuyện.</p></div>
    {error ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
    <div className={`grid min-h-[65vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${selected ? 'md:grid-cols-[320px_1fr]' : 'md:grid-cols-1'}`}>
      <aside className={`${selected ? 'hidden md:flex' : 'flex'} min-h-[65vh] flex-col`}>
        <div className="flex items-center justify-between border-b px-4 py-3"><div><h2 className="font-semibold text-slate-800">Cuộc trò chuyện</h2><p className="text-xs text-slate-500">{threads.length} người dùng</p></div><button type="button" onClick={() => void refreshThreads()} aria-label="Làm mới danh sách" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><RefreshCw className="size-4" /></button></div>
        <div className="flex-1 overflow-y-auto">{threads.length ? threads.map((thread) => <button key={thread.id} type="button" onClick={() => { setSelected(thread.id); setReplyTo(null); }} className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${selected === thread.id ? 'bg-indigo-50' : ''}`}>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{initials(thread.userName) || 'U'}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{thread.userName}</span><span className="mt-1 block truncate text-xs text-slate-500">{thread.lastMessage || 'Chưa có tin nhắn'}</span></span>
          <span className="sr-only">{thread.userEmail}</span>
        </button>) : <p className="p-6 text-center text-sm text-slate-500">Chưa có cuộc trò chuyện hỗ trợ.</p>}</div>
      </aside>

      {selected ? <section className="flex min-h-[65vh] flex-col">
        <header className="flex items-center gap-3 border-b px-4 py-3"><button type="button" onClick={() => { setSelected(null); setReplyTo(null); }} aria-label="Quay lại danh sách" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"><ArrowLeft className="size-4" /></button><span className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{initials(current?.userName ?? '') || 'U'}</span><div className="min-w-0"><h2 className="truncate font-semibold text-slate-900">{current?.userName}</h2><p className="truncate text-xs text-slate-500">{current?.userEmail}</p></div></header>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.map((message) => <div key={message.id} className={`flex ${message.senderRole === 'ADMIN' ? 'justify-end' : 'justify-start'}`}><div className="max-w-[85%]"><div className={`rounded-2xl px-3 py-2 ${message.senderRole === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}><p className="mb-1 text-[10px] opacity-70">{message.senderName} · {new Date(message.createdAt).toLocaleString('vi-VN')}</p>{message.replyToContent ? <div className="mb-2 border-l-2 border-indigo-400 pl-2 text-[10px] opacity-75"><b>{message.replyToSenderName}</b>: {message.replyToContent}</div> : null}<p className="whitespace-pre-wrap break-words text-sm">{message.content}</p></div><button type="button" onClick={() => setReplyTo(message)} className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 hover:underline"><Reply className="size-3"/>Trả lời</button></div></div>)}{!messages.length ? <p className="py-8 text-center text-sm text-slate-500">Chưa có tin nhắn trong cuộc trò chuyện này.</p> : null}</div>
        <form onSubmit={submit} className="border-t p-3">{replyTo ? <div className="mb-2 flex items-start justify-between gap-2 rounded-lg bg-indigo-50 px-2.5 py-2 text-[11px] text-indigo-900"><span className="line-clamp-2"><b>Trả lời {replyTo.senderName}:</b> {replyTo.content}</span><button type="button" onClick={() => setReplyTo(null)} aria-label="Bỏ trả lời" className="text-slate-500">×</button></div> : null}<div className="flex gap-2"><input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000} placeholder="Trả lời người dùng..." className="h-11 min-w-0 flex-1 rounded-xl border px-3 text-sm outline-none focus:border-indigo-400"/><button disabled={!draft.trim() || busy} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white disabled:opacity-50"><Send className="size-4"/>Gửi</button></div></form>
      </section> : null}
    </div>
  </div>;
}
