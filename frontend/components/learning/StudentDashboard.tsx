'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  Flame,
  Headphones,
  ListChecks,
  MessagesSquare,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { LEARNING_CAPABILITIES } from '@/lib/learning-capabilities';
import { LearningOnboardingPrompt } from './LearningOnboardingPrompt';

const moduleIcons: Record<(typeof LEARNING_CAPABILITIES)[number]['key'], typeof BookOpen> = {
  VOCABULARY: BookOpen,
  GRAMMAR: Brain,
  LISTENING: Headphones,
  READING: ListChecks,
  MOCK_TEST: ClipboardCheck,
};

const weekdayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Chào buổi sáng';
  if (hour < 14) return 'Chào buổi trưa';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function formatToday() {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
  }).format(new Date());
}

export function StudentDashboard() {
  const displayDate = formatToday();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <section aria-label="Bắt đầu học" className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
        <div className="relative flex min-h-56 flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-500 p-6 text-white shadow-lg sm:min-h-60 sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-16 size-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-8 size-48 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 right-20 size-56 rounded-full bg-white/[0.08] blur-2xl" />
          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-medium text-blue-100">
              {getGreeting()}, học viên 👋
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Xây dựng lộ trình TOEIC của bạn
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100">
              Thiết lập mục tiêu học tập phù hợp để bắt đầu theo dõi hành trình TOEIC của bạn.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
              >
                <Target className="size-4" aria-hidden="true" />
                Thiết lập mục tiêu
              </Link>
              <a
                href="#learning-tools"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500/70 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-blue-500"
              >
                <Sparkles className="size-4" aria-hidden="true" />
                Khám phá bài học
              </a>
            </div>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute bottom-5 right-7 hidden size-24 items-center justify-center rounded-[2rem] bg-white/15 text-white/90 rotate-6 sm:flex">
            <BookOpen className="size-12" strokeWidth={1.5} />
            <Sparkles className="absolute -right-2 -top-2 size-6 text-amber-200" />
          </div>
        </div>

        <section aria-labelledby="streak-title" className="flex flex-col rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Flame className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h2 id="streak-title" className="font-bold text-on-surface">Chuỗi ngày học</h2>
                <p className="mt-0.5 text-xs text-on-surface-variant">Duy trì thói quen mỗi ngày</p>
              </div>
            </div>
            <CalendarDays className="mt-1 size-5 text-on-surface-variant" aria-hidden="true" />
          </div>
          <div className="my-5 flex flex-1 flex-col justify-center rounded-xl bg-surface-container-low px-4 py-4">
            <p className="text-sm font-semibold text-on-surface">Chưa có dữ liệu hoạt động</p>
            <p className="mt-1 text-xs leading-5 text-on-surface-variant">
              Hoạt động học sẽ được hiển thị tại đây khi dữ liệu được ghi nhận.
            </p>
          </div>
          <div className="grid grid-cols-7 gap-2" aria-label="Các ngày trong tuần">
            {weekdayLabels.map((day) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-medium text-on-surface-variant">{day}</span>
                <span className="size-7 rounded-full border border-outline-variant/60 bg-surface-container-low" aria-hidden="true" />
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-outline-variant/40 pt-3 text-xs text-on-surface-variant">
            Hôm nay · {displayDate}
          </p>
        </section>
      </section>

      <LearningOnboardingPrompt />

      <section aria-labelledby="progress-title" className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="progress-title" className="text-lg font-bold text-on-surface">Tiến độ học tập</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Hoạt động của bạn · {displayDate}
            </p>
          </div>
          <Link href="/onboarding" className="inline-flex items-center gap-2 self-start rounded-lg border border-outline-variant/60 px-3.5 py-2 text-sm font-semibold text-primary transition hover:bg-surface-container-low sm:self-auto">
            <Target className="size-4" aria-hidden="true" />
            Đặt mục tiêu
          </Link>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl bg-surface-container-low p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-[1.15fr_repeat(4,1fr)]">
          <div className="flex items-center gap-4 sm:col-span-2 xl:col-span-1">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-outline-variant/60 text-xs font-bold text-on-surface-variant">
              —
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Chưa có dữ liệu</p>
              <p className="mt-1 text-xs text-on-surface-variant">Bắt đầu học để theo dõi tiến độ</p>
            </div>
          </div>
          <Metric icon={Clock3} label="Thời gian học" />
          <Metric icon={ListChecks} label="Câu đã luyện" />
          <Metric icon={BookOpen} label="Từ vựng" />
          <Metric icon={Zap} label="XP hôm nay" />
        </div>

        <div id="learning-tools" className="mt-6 scroll-mt-24">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h3 className="font-bold text-on-surface">Khu vực học tập</h3>
              <p className="mt-1 text-sm text-on-surface-variant">Các công cụ luyện TOEIC sẽ xuất hiện tại đây.</p>
            </div>
            <span className="hidden items-center gap-1 text-xs text-on-surface-variant sm:inline-flex">
              Dữ liệu cập nhật khi có hoạt động
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {LEARNING_CAPABILITIES.map(({ key, label, description }) => {
              const Icon = moduleIcons[key as keyof typeof moduleIcons];
              return (
                <article key={key} className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-4 transition hover:border-primary/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <h4 className="truncate text-sm font-bold text-on-surface">{label}</h4>
                    </div>
                    <span className="shrink-0 rounded-full bg-surface-container px-2 py-1 text-[10px] font-medium text-on-surface-variant">
                      Đang phát triển
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-on-surface-variant">{description}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-outline-variant/40 pt-3 text-xs text-on-surface-variant">
                    <span>Chưa khả dụng</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary/70">
                      Đang hoàn thiện <ArrowRight className="size-3" aria-hidden="true" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="community" aria-labelledby="community-title" className="scroll-mt-24 overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <MessagesSquare className="size-6" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="community-title" className="text-lg font-bold text-on-surface">Cộng đồng học viên</h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">Đã mở</span>
              </div>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-on-surface-variant">
                Đặt câu hỏi TOEIC, chia sẻ kinh nghiệm và cùng các học viên khác thảo luận.
              </p>
            </div>
          </div>
          <Link href="/community" className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
            <MessagesSquare className="size-4" aria-hidden="true" /> Mở cộng đồng
          </Link>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label }: { icon: typeof Clock3; label: string }) {
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-lg bg-surface-container-lowest px-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-on-surface">Chưa có dữ liệu</p>
        <p className="mt-0.5 text-xs text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}
