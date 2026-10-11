'use client';

import Link from 'next/link';
import { ArrowLeft, Brain, BookOpen, Clock, TrendingUp } from 'lucide-react';

export function SystemTrainingShowcase() {
  const features = [
    {
      icon: Brain,
      title: 'Lộ trình Adaptive AI',
      desc: 'Tự động chẩn đoán lỗ hổng kiến thức từng Part, tối ưu bài luyện cá nhân.',
    },
    {
      icon: BookOpen,
      title: '50.000+ Câu hỏi chuẩn ETS',
      desc: 'Bám sát format đề thi 2026, giải thích chi tiết bẫy câu hỏi từ AI Tutor.',
    },
    {
      icon: Clock,
      title: 'Mô phỏng thi & Dự đoán 95%',
      desc: 'Phòng thi ảo 120 phút chuẩn áp lực, dự đoán điểm thực tế chính xác.',
    },
    {
      icon: TrendingUp,
      title: 'Ghi nhớ Spaced Repetition',
      desc: 'Phương pháp lặp lại ngắt quãng giúp thuộc làu 3.000+ từ vựng trọng tâm.',
    },
  ];

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0b1c44] via-[#122b68] to-[#0a1e3f] p-5 text-white sm:p-6 lg:p-7">
      {/* Background ambient light */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-tertiary-container/20 blur-3xl" />

      {/* Top Section */}
      <div className="relative z-10 space-y-4">
        {/* Back Link to Home */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/75 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Về trang giới thiệu</span>
          </Link>
        </div>

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white shadow-sm backdrop-blur-sm">
            <span className="material-symbols-outlined text-[18px]">school</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">TOEIC AI</span>
              <span className="rounded bg-amber-400/20 px-1.5 py-0.2 text-[9px] font-semibold text-amber-300">
                ACADEMY
              </span>
            </div>
            <p className="text-[10px] text-white/60">Hệ thống đào tạo & Luyện thi thông minh</p>
          </div>
        </div>

        {/* Pitch */}
        <div>
          <h2 className="text-base font-bold leading-snug tracking-tight text-white sm:text-lg">
            Đột phá điểm số với Lộ trình Đào tạo Cá nhân hóa
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-white/75 sm:text-xs">
            Ứng dụng AI giúp chẩn đoán lỗ hổng, học đúng trọng tâm và rút ngắn 50% thời gian ôn thi.
          </p>
        </div>

        {/* Compact Feature List */}
        <div className="space-y-2 pt-0.5">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.04] p-2 backdrop-blur-sm transition hover:bg-white/[0.08]"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10 text-amber-300">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-white">{item.title}</h3>
                  <p className="text-[11px] leading-tight text-white/70">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Metrics Bar */}
      <div className="relative z-10 mt-4 border-t border-white/10 pt-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-sm font-bold text-amber-300">50.000+</div>
            <div className="text-[10px] text-white/70">Học viên</div>
          </div>
          <div className="border-x border-white/10">
            <div className="text-sm font-bold text-amber-300">+215</div>
            <div className="text-[10px] text-white/70">Điểm tăng TB</div>
          </div>
          <div>
            <div className="text-sm font-bold text-amber-300">94.8%</div>
            <div className="text-[10px] text-white/70">Đạt mục tiêu</div>
          </div>
        </div>
      </div>
    </div>
  );
}
