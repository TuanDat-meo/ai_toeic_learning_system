'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, MessageCircle, RefreshCw, Reply, Send, Sparkles, X } from 'lucide-react';
import { getCurrentUser, type AuthUser } from '@/lib/api/auth';
import {
  askAiChat,
  chatHeartbeat,
  getDiscussion,
  getOrCreateSupportThread,
  getSupportMessages,
  getSupportThreads,
  sendDiscussionMessage,
  sendSupportMessage,
  type AiChatTurn,
  type ChatMessage,
  type SupportThread
} from '@/lib/api/chat';

type Tab = 'ai' | 'discussion' | 'support';
type AiMessage = AiChatTurn & { id: string };
const formatTime = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

const QUICK_STARTERS = [
  '🎧 Hướng dẫn luyện nghe chép chính tả',
  '📖 Cách luyện đọc Part 5-7 & tra từ nhanh',
  '🎯 Hướng dẫn thi thử Full Test 120 phút',
  '🩺 Sức khỏe & lưu ý dùng thuốc khi ôn thi',
  '⚽ Giải thích luật việt vị trong bóng đá',
  '💰 Quy tắc quản lý tài chính 50/30/20'
];

export function StudentChatBubble() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('ai');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [supportThreads, setSupportThreads] = useState<SupportThread[]>([]);
  const [supportLoaded, setSupportLoaded] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [isMockExamActive, setIsMockExamActive] = useState(false);
  const [aiLimit, setAiLimit] = useState(30);
  const [aiUsedToday, setAiUsedToday] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const openSupport = useCallback(async () => {
    try {
      if (user?.role === 'ADMIN') {
        const threads = await getSupportThreads();
        setSupportThreads(threads);
        setSupportLoaded(true);
        setThreadId((current) => (current && threads.some((thread) => thread.id === current) ? current : null));
      } else {
        const result = await getOrCreateSupportThread();
        setThreadId(result.threadId);
      }
    } catch {
      setError('Không thể mở cuộc trò chuyện hỗ trợ. Vui lòng đăng nhập lại.');
    }
  }, [user]);

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const used = Number(localStorage.getItem(`toeic_ai_chat_count_${today}`) || 0);
      setAiUsedToday(used);

      const savedAiChat = localStorage.getItem('toeic_ai_chat_history');
      if (savedAiChat) {
        const parsed = JSON.parse(savedAiChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validated: AiMessage[] = parsed.filter(
            (item): item is AiMessage =>
              Boolean(item) &&
              typeof item.id === 'string' &&
              (item.role === 'user' || item.role === 'model') &&
              typeof item.content === 'string'
          );
          if (validated.length > 0) {
            setAiMessages(validated);
          }
        }
      }

      const raw = localStorage.getItem('toeic_system_extended_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.aiDailyChatLimitFree === 'number') {
          setAiLimit(parsed.aiDailyChatLimitFree);
        }
      }
    } catch {}

    const handleSettingsChange = (event: Event) => {
      const custom = event as CustomEvent<{ aiDailyChatLimitFree?: number }>;
      if (custom.detail && typeof custom.detail.aiDailyChatLimitFree === 'number') {
        setAiLimit(custom.detail.aiDailyChatLimitFree);
      }
    };
    window.addEventListener('toeic:system-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('toeic:system-settings-changed', handleSettingsChange);
  }, []);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
    const openChat = (event: Event) => {
      const custom = event as CustomEvent<{ tab?: Tab }>;
      if (custom.detail?.tab) {
        setTab(custom.detail.tab);
      }
      setOpen(true);
    };
    const handleMockExamState = (event: Event) => {
      const examEvent = event as CustomEvent<{ isTaking: boolean }>;
      setIsMockExamActive(examEvent.detail?.isTaking === true);
    };
    window.addEventListener('toeic:open-chat', openChat);
    window.addEventListener('toeic:mock-exam-state', handleMockExamState);
    return () => {
      window.removeEventListener('toeic:open-chat', openChat);
      window.removeEventListener('toeic:mock-exam-state', handleMockExamState);
    };
  }, []);

  useEffect(() => {
    if (tab !== 'support' || !user || (user.role === 'ADMIN' ? supportLoaded : Boolean(threadId))) return;
    const timer = window.setTimeout(() => {
      void openSupport();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [tab, user, threadId, supportLoaded, openSupport]);

  const refresh = useCallback(async () => {
    try {
      if (tab === 'discussion') {
        const result = await getDiscussion();
        setMessages(result.messages);
        setOnlineCount(result.onlineCount);
      } else if (tab === 'support') {
        if (user?.role === 'ADMIN') setSupportThreads(await getSupportThreads());
        if (threadId) setMessages(await getSupportMessages(threadId));
        else setMessages([]);
      }
      setError('');
    } catch {
      setError('Không tải được tin nhắn. Kiểm tra kết nối rồi thử lại.');
    }
  }, [tab, threadId, user]);

  useEffect(() => {
    if (!open) return;
    const initialRefresh = window.setTimeout(() => {
      void refresh();
    }, 0);
    const timer = window.setInterval(() => {
      void refresh();
      if (user) void chatHeartbeat().then((r) => setOnlineCount(r.onlineCount)).catch(() => undefined);
    }, 4000);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(timer);
    };
  }, [open, refresh, user]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, aiMessages, tab]);

  const sendAiQuestion = async (content: string) => {
    if (!content.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      const today = new Date().toISOString().slice(0, 10);
      const used = Number(localStorage.getItem(`toeic_ai_chat_count_${today}`) || 0);
      if (aiLimit > 0 && used >= aiLimit) {
        setError(`Bạn đã dùng hết ${aiLimit} lượt hỏi Trợ lý AI hôm nay. Vui lòng quay lại vào ngày mai!`);
        setSending(false);
        return;
      }

      const nextMessages: AiMessage[] = [
        ...aiMessages,
        { id: crypto.randomUUID(), role: 'user' as const, content: content.trim() }
      ];
      setAiMessages(nextMessages);
      setDraft('');

      const history = nextMessages.slice(-12).map(({ role, content: text }) => ({ role, content: text }));
      const response = await askAiChat(history);
      const updatedMessages: AiMessage[] = [
        ...nextMessages,
        { id: crypto.randomUUID(), role: 'model' as const, content: response.reply }
      ];
      setAiMessages(updatedMessages);

      try {
        localStorage.setItem('toeic_ai_chat_history', JSON.stringify(updatedMessages.slice(-20)));
        localStorage.setItem(`toeic_ai_chat_count_${today}`, String(used + 1));
      } catch {}
      setAiUsedToday(used + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không gửi được câu hỏi đến Trợ lý AI.');
    } finally {
      setSending(false);
    }
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    if (tab === 'ai') {
      await sendAiQuestion(content);
      return;
    }

    setSending(true);
    setError('');
    try {
      if (tab === 'discussion') {
        await sendDiscussionMessage(content, replyTo?.id);
      } else if (threadId) {
        await sendSupportMessage(threadId, content, replyTo?.id);
      }
      setDraft('');
      setReplyTo(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không gửi được tin nhắn.');
    } finally {
      setSending(false);
    }
  }

  const clearAiChat = () => {
    setAiMessages([]);
    try {
      localStorage.removeItem('toeic_ai_chat_history');
    } catch {}
  };

  const selectTab = (next: Tab) => {
    setTab(next);
    setError('');
    setReplyTo(null);
  };

  if (isMockExamActive) return null;

  const isPracticeWorkspace = ['/mock-tests', '/listening', '/reading'].some((route) => pathname.startsWith(route));
  const positionClass = isPracticeWorkspace ? 'bottom-16' : 'bottom-5 sm:bottom-6';

  return (
    <div className={`fixed ${positionClass} right-5 z-[60] flex flex-col items-end gap-3 sm:right-6`}>
      {open ? (
        <section
          id="student-chat-panel"
          aria-labelledby="student-chat-title"
          className="flex h-[min(36rem,calc(100dvh-6rem))] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/25 dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="min-w-0 flex-1">
              <h2 id="student-chat-title" className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <span>{tab === 'ai' ? '✨ Trợ lý AI Toàn Năng' : tab === 'discussion' ? '💬 Thảo luận Học viên' : '🎧 Hỗ trợ Admin'}</span>
                {tab === 'discussion' && <span className="font-normal text-emerald-600 text-xs">• {onlineCount} online</span>}
                {tab === 'ai' && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                    Lượt hôm nay: {aiUsedToday}/{aiLimit === 0 ? '∞' : aiLimit}
                  </span>
                )}
              </h2>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {tab === 'ai'
                  ? 'Hỏi cách vận hành tính năng & kiến thức tổng hợp 24/7'
                  : tab === 'discussion'
                  ? 'Phòng chat giao lưu và chia sẻ kinh nghiệm học tập'
                  : 'Nhắn tin riêng giải quyết sự cố cùng Quản trị viên'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {tab === 'ai' && aiMessages.length > 0 && (
                <button
                  type="button"
                  onClick={clearAiChat}
                  title="Xóa lịch sử đoạn chat"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng chat"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </header>

          {/* 3 Tabs Navigation */}
          <nav className="flex gap-1.5 border-b border-slate-100 bg-slate-50/80 p-2 dark:border-slate-800/80 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={() => selectTab('ai')}
              className={`inline-flex flex-1 items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                tab === 'ai'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="size-3.5" />
              <span>Trợ lý AI</span>
            </button>
            <button
              type="button"
              onClick={() => selectTab('discussion')}
              className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                tab === 'discussion'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Thảo luận
            </button>
            <button
              type="button"
              onClick={() => selectTab('support')}
              className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                tab === 'support'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Hỗ trợ
            </button>
          </nav>

          {/* Sub-header notices */}
          {tab === 'discussion' && (
            <div className="border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] leading-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              🔔 Hãy chia sẻ lịch sự, văn minh, không spam hoặc đăng thông tin cá nhân.
            </div>
          )}

          {tab === 'support' && (
            <div className="border-b border-blue-100 bg-blue-50/70 px-3 py-2 text-[11px] text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
              <div className="flex items-start gap-1.5">
                <span className="font-bold">ℹ️</span>
                <div className="flex-1">
                  Kênh gửi tin nhắn tới Quản trị viên (Admin). Nếu cần hỗ trợ hướng dẫn tính năng hoặc giải đáp tức thì 24/7, hãy{' '}
                  <button
                    type="button"
                    onClick={() => selectTab('ai')}
                    className="font-bold text-blue-700 underline hover:text-blue-800 dark:text-blue-300 cursor-pointer"
                  >
                    Bấm sang Trợ lý AI
                  </button>
                  .
                </div>
              </div>
            </div>
          )}

          {tab === 'support' && user?.role === 'ADMIN' && threadId && (
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60">
              <button
                type="button"
                aria-label="Quay lại danh sách hỗ trợ"
                onClick={() => setThreadId(null)}
                className="rounded-lg p-1 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
              >
                <ArrowLeft className="size-4" />
              </button>
              <span className="flex size-7 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                {supportThreads.find((thread) => thread.id === threadId)?.userName.trim().split(/\s+/).slice(-1)[0]?.slice(0, 1).toUpperCase() || 'H'}
              </span>
              <span className="min-w-0">
                <b className="block truncate text-xs text-slate-800 dark:text-slate-200">
                  {supportThreads.find((thread) => thread.id === threadId)?.userName}
                </b>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400">Đang trò chuyện với học viên</span>
              </span>
            </div>
          )}

          {/* Message List Body */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-3 dark:bg-slate-950">
            {tab === 'ai' ? (
              aiMessages.length > 0 ? (
                aiMessages.map((message) => (
                  <article key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                        message.role === 'user'
                          ? 'rounded-tr-sm bg-blue-600 text-white'
                          : 'rounded-tl-sm border border-slate-200/80 bg-white text-slate-800 dark:border-slate-700/80 dark:bg-slate-850 dark:text-slate-100'
                      }`}
                    >
                      <p className="mb-1 text-[10px] font-bold opacity-75">
                        {message.role === 'user' ? 'Bạn' : '✨ Trợ lý TOEIC AI'}
                      </p>
                      <div className="whitespace-pre-wrap break-words leading-relaxed text-[13px]">
                        {message.content}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="flex h-full flex-col justify-between py-2">
                  <div className="py-4 text-center">
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900">
                      <Sparkles className="size-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Xin chào! Tôi có thể giúp gì cho bạn?</p>
                    <p className="mx-auto mt-1 max-w-[280px] text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Tôi nắm rõ mọi tính năng trên web (Luyện nghe, đọc, thi thử, SRS, tra từ...) và sẵn sàng giải đáp kiến thức đa lĩnh vực (sức khỏe, học tập, thể thao, tài chính).
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">
                      💡 Gợi ý câu hỏi nhanh:
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {QUICK_STARTERS.map((starter, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => void sendAiQuestion(starter)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-slate-800 dark:hover:text-blue-300 cursor-pointer shadow-sm"
                        >
                          {starter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ) : tab === 'support' && user?.role === 'ADMIN' && !threadId ? (
              supportThreads.length ? (
                supportThreads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => {
                      setThreadId(thread.id);
                      setReplyTo(null);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 text-left transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80 cursor-pointer"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                      {thread.userName.trim().split(/\s+/).slice(-1)[0]?.slice(0, 1).toUpperCase() || 'H'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-xs text-slate-800 dark:text-slate-200">{thread.userName}</b>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {thread.lastMessage || 'Chưa có tin nhắn'}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">Chưa có cuộc trò chuyện hỗ trợ.</p>
              )
            ) : messages.length ? (
              messages.map((message) => (
                <article key={message.id} className="flex gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {message.senderName.trim().split(/\s+/).slice(-1)[0]?.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline gap-1.5">
                      <span className="truncate text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {message.senderName}
                        {message.senderRole === 'ADMIN' ? ' · Admin' : ''}
                      </span>
                      <time className="shrink-0 text-[10px] text-slate-400">{formatTime(message.createdAt)}</time>
                    </div>
                    <div className="w-fit max-w-full rounded-2xl rounded-tl-sm border border-slate-200/80 bg-white px-3.5 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-850">
                      {message.replyToContent && (
                        <div className="mb-2 border-l-2 border-blue-400 pl-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <b>{message.replyToSenderName}</b>: {message.replyToContent}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap break-words text-[13px] leading-5 text-slate-800 dark:text-slate-100">
                        {message.content}
                      </p>
                    </div>
                    {user && (
                      <button
                        type="button"
                        onClick={() => setReplyTo(message)}
                        className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
                      >
                        <Reply className="size-3" />
                        Trả lời
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                {tab === 'support' && !user
                  ? 'Đăng nhập để nhắn tin với Admin'
                  : 'Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!'}
              </p>
            )}

            {sending && tab === 'ai' && (
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                <Sparkles className="size-4 animate-spin" />
                <span>Trợ lý AI đang soạn câu trả lời…</span>
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-xl bg-rose-50 p-2 text-xs font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                {error}
              </p>
            )}
          </div>

          {/* Footer Input */}
          {user ? (
            <form onSubmit={submit} className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              {replyTo && tab !== 'ai' && (
                <div className="mb-2 flex items-start justify-between gap-2 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] text-blue-900 dark:bg-blue-950/60 dark:text-blue-200">
                  <span className="line-clamp-2">
                    <b>Trả lời {replyTo.senderName}:</b> {replyTo.content}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    aria-label="Bỏ trả lời"
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={2000}
                  placeholder={
                    tab === 'ai'
                      ? 'Hỏi cách dùng web, đề TOEIC, sức khỏe, bóng đá...'
                      : tab === 'discussion'
                      ? 'Gửi tin nhắn thảo luận...'
                      : user.role === 'ADMIN'
                      ? 'Trả lời học viên...'
                      : 'Nhắn tin riêng cho Admin...'
                  }
                  className="h-10 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim() || (tab === 'support' && user.role !== 'ADMIN' && !threadId)}
                  aria-label="Gửi tin nhắn"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-slate-200 bg-white p-3 text-center text-xs dark:border-slate-800 dark:bg-slate-900">
              <Link href="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                Đăng nhập
              </Link>{' '}
              để {tab === 'ai' ? 'trò chuyện cùng Trợ lý AI' : tab === 'discussion' ? 'thảo luận cùng học viên' : 'nhắn tin với admin'}
            </div>
          )}
        </section>
      ) : null}

      {/* Floating Chat Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Đóng chat' : 'Mở chat'}
        aria-expanded={open}
        aria-controls="student-chat-panel"
        className="flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 cursor-pointer"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
