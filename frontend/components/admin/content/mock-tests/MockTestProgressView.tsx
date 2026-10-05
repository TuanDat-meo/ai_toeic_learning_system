"use client";

import React from "react";
import { TestItem } from "@/app/admin/content/mock-tests/types";
import {
  ClipboardCheck,
  Trophy,
  TrendingUp,
  Bookmark,
  BarChart2,
  History,
  AlertCircle,
} from "lucide-react";

interface MockTestProgressViewProps {
  currentTests: TestItem[];
  savedVocabBagCount: number;
  onGoToStudyTab: () => void;
}

export const MockTestProgressView: React.FC<MockTestProgressViewProps> = ({
  currentTests,
  savedVocabBagCount,
  onGoToStudyTab,
}) => {
  const completedTests = currentTests.filter((t) => t.score !== null);
  const highestScore = Math.max(...currentTests.map((t) => t.score || 0), 0);
  const avgScore =
    completedTests.length > 0
      ? Math.round(completedTests.reduce((acc, cur) => acc + (cur.score || 0), 0) / completedTests.length)
      : 0;

  const allAttempts = currentTests.flatMap((t) => t.historyAttempts);

  return (
    <div className="space-y-6">
      {/* Thẻ thống kê tổng quát */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold">Đề đã làm</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {completedTests.length} / {currentTests.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold">Điểm cao nhất</p>
            <p className="text-2xl font-extrabold text-amber-600">
              {highestScore > 0 ? `${highestScore}/990` : "--"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold">Điểm trung bình</p>
            <p className="text-2xl font-extrabold text-emerald-600">
              {avgScore > 0 ? `${avgScore}/990` : "--"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold">Từ vựng đã lưu</p>
            <p className="text-2xl font-extrabold text-indigo-600">{savedVocabBagCount} từ</p>
          </div>
        </div>
      </div>

      {/* Bảng phân tích năng lực từng Part */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-blue-600" />
          Phân tích độ chính xác theo từng Part thi TOEIC
        </h3>
        <div className="space-y-4">
          {[
            { part: "Part 1 - Mô tả tranh", accuracy: 85, color: "bg-blue-600" },
            { part: "Part 2 - Hỏi đáp (Q&A)", accuracy: 78, color: "bg-indigo-600" },
            { part: "Part 3 - Hội thoại ngắn", accuracy: 72, color: "bg-cyan-600" },
            { part: "Part 4 - Bài nói ngắn", accuracy: 68, color: "bg-emerald-600" },
            { part: "Part 5 - Hoàn thành câu", accuracy: 82, color: "bg-amber-600" },
            { part: "Part 6 - Hoàn thành đoạn văn", accuracy: 75, color: "bg-purple-600" },
            { part: "Part 7 - Đọc hiểu đoạn văn", accuracy: 70, color: "bg-rose-600" },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{item.part}</span>
                <span className="font-bold">{item.accuracy}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${item.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bảng lịch sử các lần thi gần nhất */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Nhật ký luyện thi gần đây
        </h3>

        {allAttempts.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-500 text-sm font-medium">Bạn chưa thực hiện bài thi thử nào.</p>
            <button
              type="button"
              onClick={onGoToStudyTab}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
            >
              Chọn đề và thi thử ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Thời lượng</th>
                  <th className="py-3 px-4">Listening</th>
                  <th className="py-3 px-4">Reading</th>
                  <th className="py-3 px-4">Tổng điểm</th>
                  <th className="py-3 px-4">Số câu đúng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allAttempts.map((att, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-800">{att.date}</td>
                    <td className="py-3 px-4 text-slate-600">{att.duration}</td>
                    <td className="py-3 px-4 text-blue-600 font-bold">{att.listening}/495</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">{att.reading}/495</td>
                    <td className="py-3 px-4 text-amber-600 font-extrabold">{att.score}/990</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {att.correctCount}/{att.totalCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
