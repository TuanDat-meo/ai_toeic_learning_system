'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Sparkles, X } from 'lucide-react';

export function StudentChatBubble() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener('toeic:open-chat', openChat);
    return () => window.removeEventListener('toeic:open-chat', openChat);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          id="student-chat-panel"
          aria-labelledby="student-chat-title"
          className="w-[min(21rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest shadow-xl shadow-slate-900/15"
        >
          <div className="flex items-center justify-between gap-3 bg-primary px-4 py-3.5 text-on-primary">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-white/15">
                <MessageCircle className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="student-chat-title" className="text-sm font-bold">Trò chuyện</h2>
                <p className="mt-0.5 text-xs text-white/75">TOEIC AI</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng cửa sổ trò chuyện"
              className="flex size-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="p-4">
            <div className="rounded-xl bg-surface-container-low p-4">
              <span className="mb-2 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-on-surface">Tính năng chat đang được phát triển</p>
              <p className="mt-1.5 text-xs leading-5 text-on-surface-variant">
                Khi sẵn sàng, bạn có thể trò chuyện và nhận hỗ trợ học TOEIC ngay tại đây.
              </p>
            </div>
          </div>
        </section>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-label={open ? 'Đóng trò chuyện' : 'Mở trò chuyện'}
        aria-expanded={open}
        aria-controls="student-chat-panel"
        className="group flex size-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {open ? <X className="size-6" aria-hidden="true" /> : <MessageCircle className="size-6" aria-hidden="true" />}
      </button>
    </div>
  );
}
