"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Calendar,
  Clock,
  Award,
  AlertCircle,
  Eye,
  X,
  BookOpen,
  Sparkles,
  BarChart3,
  Filter,
} from "lucide-react";
import { TestItem, HistoryAttempt, StudentSubmission } from "@/app/admin/content/mock-tests/types";
import { fetchMockTestSubmissions } from "@/lib/api/mockTests";

// ==========================================
// 1. NHẬT KÝ NỘP BÀI THI CỦA HỌC VIÊN & ĐIỂM TRUNG BÌNH BỘ ĐỀ
// ==========================================
interface SubmissionsViewProps {
  tests: TestItem[];
}

export const MockTestSubmissionsView: React.FC<SubmissionsViewProps> = ({ tests }) => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterScoreRange, setFilterScoreRange] = useState("ALL");
  const [selectedTestId, setSelectedTestId] = useState<number | "ALL">("ALL");

  const loadSubmissions = useCallback(async () => {
    try {
      const data = await fetchMockTestSubmissions();
      setSubmissions(data);
      setLoadError(null);
    } catch (error) {
      setSubmissions([]);
      setLoadError(error instanceof Error ? error.message : "Không thể tải bài nộp.");
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Lọc bài nộp theo bộ đề được chọn
  const testFilteredSubs = useMemo(() => {
    if (selectedTestId === "ALL") return submissions;
    return submissions.filter((s) => s.testId === selectedTestId);
  }, [submissions, selectedTestId]);

  // Tính toán số liệu thống kê: Điểm trung bình, số lượt thi, điểm cao nhất
  const stats = useMemo(() => {
    if (testFilteredSubs.length === 0) {
      return {
        total: 0,
        avgScore: 0,
        avgListening: 0,
        avgReading: 0,
        avgCorrect: 0,
        maxScore: 0,
        minScore: 0,
      };
    }
    const total = testFilteredSubs.length;
    const totalScoreSum = testFilteredSubs.reduce((acc, s) => acc + s.score, 0);
    const listeningSum = testFilteredSubs.reduce((acc, s) => acc + (s.listeningScore || 0), 0);
    const readingSum = testFilteredSubs.reduce((acc, s) => acc + (s.readingScore || 0), 0);
    const correctSum = testFilteredSubs.reduce((acc, s) => acc + (s.correctCount || 0), 0);
    const maxScore = Math.max(...testFilteredSubs.map((s) => s.score));
    const minScore = Math.min(...testFilteredSubs.map((s) => s.score));

    return {
      total,
      avgScore: Math.round(totalScoreSum / total),
      avgListening: Math.round(listeningSum / total),
      avgReading: Math.round(readingSum / total),
      avgCorrect: Math.round((correctSum / total) * 10) / 10,
      maxScore,
      minScore,
    };
  }, [testFilteredSubs]);

  // Lọc theo tìm kiếm và mức điểm
  const filteredSubmissions = useMemo(() => {
    return testFilteredSubs.filter((s) => {
      const matchSearch =
        (s.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.studentEmail || "").toLowerCase().includes(search.toLowerCase()) ||
        s.testTitle.toLowerCase().includes(search.toLowerCase());

      const matchScore =
        filterScoreRange === "ALL"
          ? true
          : filterScoreRange === "800+"
          ? s.score >= 800
          : filterScoreRange === "600-800"
          ? s.score >= 600 && s.score < 800
          : s.score < 600;

      return matchSearch && matchScore;
    });
  }, [testFilteredSubs, search, filterScoreRange]);

  const selectedTestObj = useMemo(() => {
    if (selectedTestId === "ALL") return null;
    return tests.find((t) => t.id === selectedTestId);
  }, [tests, selectedTestId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 4 THẺ THỐNG KÊ TỔNG QUAN VỀ ĐIỂM TRUNG BÌNH VÀ BÀI NỘP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Điểm trung bình của bộ đề */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
              {selectedTestId === "ALL" ? "Điểm TB Toàn Bộ Đề" : "Điểm TB Bộ Đề Này"}
            </p>
            <BarChart3 className="w-5 h-5 text-blue-200" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black tracking-tight text-amber-300">
              {stats.avgScore} <span className="text-lg text-white font-bold">/ 1000 điểm</span>
            </p>
            <p className="text-xs text-blue-100 font-medium mt-1">
              Listening: {stats.avgListening}đ • Reading: {stats.avgReading}đ (5đ/câu)
            </p>
          </div>
        </div>

        {/* Card 2: Tổng lượt học viên đã nộp */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase tracking-wider">Lượt Học Viên Làm</p>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.total} <span className="text-sm font-semibold text-slate-500">lượt thi</span>
            </p>
            <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã tự động gửi về Admin</span>
            </p>
          </div>
        </div>

        {/* Card 3: Điểm cao nhất của bộ đề */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase tracking-wider">Điểm Cao Nhất (Kỷ lục)</p>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-amber-600 tracking-tight">
              {stats.maxScore} <span className="text-sm font-semibold text-slate-500">/ 1000 điểm</span>
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Điểm thấp nhất: {stats.minScore} điểm
            </p>
          </div>
        </div>

        {/* Card 4: Số câu đúng trung bình */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase tracking-wider">Đúng Trung Bình</p>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-emerald-700 tracking-tight">
              {stats.avgCorrect} <span className="text-sm font-semibold text-slate-500">/ 200 câu</span>
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Quy chuẩn 5 điểm / mỗi câu trả lời đúng
            </p>
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR: CHỌN BỘ ĐỀ, TÌM KIẾM HỌC VIÊN, PHỔ ĐIỂM */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Bộ chọn xem điểm trung bình của từng bộ đề cụ thể */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-blue-600 shrink-0" />
            <select
              value={selectedTestId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTestId(val === "ALL" ? "ALL" : Number(val));
              }}
              className="px-3 py-2 rounded-2xl border border-blue-200 bg-blue-50/60 font-bold text-xs text-blue-900 outline-none cursor-pointer focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
            >
              <option value="ALL">📊 Xem tất cả bộ đề (Điểm TB chung)</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.volId === "vol1" || t.volId === "ets2024" ? "ETS 2024" : t.volId === "vol2" || t.volId === "ets2023" ? "ETS 2023" : "ETS 2022"})
                </option>
              ))}
            </select>
          </div>

          {/* Ô tìm kiếm học viên hoặc tên bài thi */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên học viên, email, đề thi..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Lọc theo phổ điểm & Số lượng */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          <select
            value={filterScoreRange}
            onChange={(e) => setFilterScoreRange(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả phổ điểm</option>
            <option value="800+">Xuất sắc (800+ điểm)</option>
            <option value="600-800">Khá (600 - 800 điểm)</option>
            <option value="<600">Dưới 600 điểm</option>
          </select>
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            Hiển thị <strong>{filteredSubmissions.length}</strong> bài nộp
          </span>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      )}

      {/* BẢNG KẾT QUẢ NỘP BÀI THI CỦA HỌC VIÊN */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[200px]">Học viên</th>
                <th className="py-3.5 px-4 min-w-[200px]">Đề thi TOEIC</th>
                <th className="py-3.5 px-4 min-w-[140px]">Thời gian nộp</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Listening (5đ/câu)</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Reading (5đ/câu)</th>
                <th className="py-3.5 px-4 text-center min-w-[140px]">Tổng điểm (Max 1000)</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Số câu đúng</th>
                <th className="py-3.5 px-4 min-w-[120px]">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">Chưa có bài nộp nào cho tiêu chí đã chọn.</p>
                    <p className="text-xs mt-1">Khi học viên hoàn thành bài thi thử, điểm số sẽ tự động hiển thị tại đây.</p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{s.studentName || "Chưa có tên hiển thị"}</p>
                      <p className="text-[11px] text-slate-400">{s.studentEmail || "Chưa có email"}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{s.testTitle}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Làm trong {Math.round(s.durationSeconds / 60)} phút
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{s.completedAt}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600 whitespace-nowrap">
                      {s.listeningScore} điểm
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-indigo-600 whitespace-nowrap">
                      {s.readingScore} điểm
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap shadow-xs">
                        {s.score} / 1000 điểm
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono font-bold text-slate-800">
                      {s.correctCount} / {s.totalCount} câu
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. BẢNG QUY ĐỔI ĐIỂM TOEIC (MỖI CÂU ĐÚNG 5 ĐIỂM)
// ==========================================
export const MockTestScoreConversionView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-150">
      <div className="rounded-3xl border border-blue-200 bg-blue-50/80 p-5 shadow-xs">
        <h3 className="text-sm font-black text-blue-950">Cách tính điểm hiện tại</h3>
        <p className="mt-2 text-sm leading-relaxed text-blue-900">
          Mỗi câu trả lời đúng được tính 5 điểm. Tổng điểm tối đa được tính theo số câu hỏi thực tế đã liên kết với đề thi.
          Bảng quy đổi TOEIC chính thức chưa được cấu hình.
        </p>
        <p className="mt-2 text-xs text-blue-800">
          Điểm số của từng học viên được hiển thị từ các lượt nộp bài đã lưu trên máy chủ.
        </p>
      </div>
    </div>
  );
};


// 3. QUẢN LÝ BỘ SƯU TẬP ĐỀ THI (COLLECTIONS)
// ==========================================
interface CollectionsViewProps {
  vol1Count: number;
  vol2Count: number;
  vol3Count?: number;
  onNavigateToTests?: (volId: "vol1" | "vol2" | "vol3") => void;
}

export const MockTestCollectionsView: React.FC<CollectionsViewProps> = ({
  vol1Count,
  vol2Count,
  vol3Count = 0,
  onNavigateToTests,
}) => {
  const collections = [
    { id: "vol1" as const, label: "Volume 1", count: vol1Count },
    { id: "vol2" as const, label: "Volume 2", count: vol2Count },
    { id: "vol3" as const, label: "Volume 3", count: vol3Count },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {collections.map((collection) => (
        <section key={collection.id} className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">{collection.label}</h3>
            <p className="mt-2 text-sm text-slate-600">
              {collection.count > 0
                ? `${collection.count} đề thi được lưu trong danh mục này.`
                : "Chưa có đề thi trong danh mục này."}
            </p>
          </div>
          {onNavigateToTests && (
            <button
              type="button"
              onClick={() => onNavigateToTests(collection.id)}
              className="mt-5 inline-flex items-center gap-1 self-start rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
            >
              <span>Xem đề thi</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </section>
      ))}
    </div>
  );
};
