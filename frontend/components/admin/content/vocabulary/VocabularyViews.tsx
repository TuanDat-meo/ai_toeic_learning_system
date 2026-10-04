"use client";

import React from "react";
import { Flame, Star, Volume2 } from "lucide-react";
import { WordItem } from "@/app/admin/content/vocabulary/types";

export const VocabularyProgressView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Đã nhớ vĩnh viễn
          </span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">342 từ</p>
          <span className="text-xs text-slate-500 mt-1 block">Vượt qua chu kỳ 30 ngày</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Đang trong chu kỳ học
          </span>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">128 từ</p>
          <span className="text-xs text-slate-500 mt-1 block">Ôn lại theo ngắt quãng</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Cần ôn tập hôm nay
          </span>
          <p className="text-3xl font-extrabold text-amber-500 mt-2">24 từ</p>
          <span className="text-xs text-slate-500 mt-1 block">Đến thời điểm vàng ghi nhớ</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Chuỗi học liên tục
          </span>
          <p className="text-3xl font-extrabold text-rose-500 mt-2 flex items-center gap-1.5">
            7 ngày <Flame className="w-6 h-6 fill-rose-500 text-rose-500" />
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Rất chăm chỉ!</span>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900">
          Đường cong quên lãng Ebbinghaus & Dự báo khả năng ghi nhớ
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
          Hệ thống TOEIC AI theo dõi chính xác thời điểm bạn chuẩn bị quên từ để kích hoạt thông báo ôn tập,
          giúp biến trí nhớ ngắn hạn thành trí nhớ vĩnh viễn.
        </p>
        <div className="h-44 w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-semibold">
          📊 Biểu đồ trực quan tiến độ ghi nhớ theo thời gian thực (Real-time SRS Visualizer)
        </div>
      </div>
    </div>
  );
};

interface VocabularyStarredViewProps {
  words: WordItem[];
  playAudio: (text: string) => void;
}

export const VocabularyStarredView: React.FC<VocabularyStarredViewProps> = ({ words, playAudio }) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Từ vựng đã đánh dấu yêu thích</h2>
          <p className="text-xs text-slate-500">Các từ vựng quan trọng bạn đã lưu lại để ôn tập chuyên sâu.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
          {words.length} từ đã lưu
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {words.map((w) => (
          <div
            key={w.id}
            className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">{w.word}</span>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {w.ipa}
                </span>
                <button
                  type="button"
                  onClick={() => playAudio(w.word)}
                  className="w-6 h-6 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-semibold text-blue-900">{w.meaning}</p>
              <p className="text-xs text-slate-500 italic">&quot;{w.example}&quot;</p>
            </div>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const VocabularyAlgorithmView: React.FC = () => {
  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6 animate-in fade-in duration-150">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Cơ chế cốt lõi
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Thuật toán lặp lại ngắt quãng (Spaced Repetition) & BKT
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            1
          </span>
          <h3 className="font-bold text-sm text-blue-950">Đúng từ cần học</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tập trung vào 600 từ xuất hiện nhiều nhất trong đề thi TOEIC thực tế thay vì học dàn trải.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
            2
          </span>
          <h3 className="font-bold text-sm text-indigo-950">Đúng thời điểm vàng</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Chu kỳ ngắt quãng: Lần 1 (1 ngày) ➔ Lần 2 (3 ngày) ➔ Lần 3 (7 ngày) ➔ Lần 4 (14 ngày) ➔ Lần 5 (30 ngày).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
          <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            3
          </span>
          <h3 className="font-bold text-sm text-emerald-950">Nhớ lâu tốn ít công</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Chỉ dành 10 - 15 phút mỗi ngày, hệ thống sẽ tự động lọc ra các từ bạn sắp quên để nhắc học.
          </p>
        </div>
      </div>
    </div>
  );
};
