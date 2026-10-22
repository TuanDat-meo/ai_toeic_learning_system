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
import { fetchMockTestSubmissions, getLocalSubmissions } from "@/lib/api/mockTests";

// ==========================================
// 1. NHẬT KÝ NỘP BÀI THI CỦA HỌC VIÊN & ĐIỂM TRUNG BÌNH BỘ ĐỀ
// ==========================================
interface SubmissionsViewProps {
  tests: TestItem[];
}

export const MockTestSubmissionsView: React.FC<SubmissionsViewProps> = ({ tests }) => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [search, setSearch] = useState("");
  const [filterScoreRange, setFilterScoreRange] = useState("ALL");
  const [selectedTestId, setSelectedTestId] = useState<number | "ALL">("ALL");

  const loadSubmissions = useCallback(async () => {
    try {
      const data = await fetchMockTestSubmissions();
      if (Array.isArray(data) && data.length > 0) {
        setSubmissions(data);
      } else {
        setSubmissions(getLocalSubmissions());
      }
    } catch {
      setSubmissions(getLocalSubmissions());
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
    const handleSync = () => { loadSubmissions(); };
    window.addEventListener("toeic-submissions-updated", handleSync);
    window.addEventListener("toeic-mock-tests-updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("toeic-submissions-updated", handleSync);
      window.removeEventListener("toeic-mock-tests-updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
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
        s.studentName.toLowerCase().includes(search.toLowerCase()) ||
        s.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
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
                      <p className="font-bold text-slate-900">{s.studentName}</p>
                      <p className="text-[11px] text-slate-400">{s.studentEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{s.testTitle}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Làm trong {Math.round((s.durationSeconds || 7200) / 60)} phút
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
                      {s.correctCount} / {s.totalCount || 200} câu
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
  const conversionMatrix = [
    { raw: "96 - 100", lc: "480 - 500", rc: "480 - 500", total: "960 - 1000", band: "C1 Master" },
    { raw: "91 - 95", lc: "455 - 475", rc: "455 - 475", total: "910 - 950", band: "B2 Advanced" },
    { raw: "86 - 90", lc: "430 - 450", rc: "430 - 450", total: "860 - 900", band: "B2 Advanced" },
    { raw: "81 - 85", lc: "405 - 425", rc: "405 - 425", total: "810 - 850", band: "B2 Upper Intermediate" },
    { raw: "76 - 80", lc: "380 - 400", rc: "380 - 400", total: "760 - 800", band: "B1 Intermediate" },
    { raw: "71 - 75", lc: "355 - 375", rc: "355 - 375", total: "710 - 750", band: "B1 Intermediate" },
    { raw: "61 - 70", lc: "305 - 350", rc: "305 - 350", total: "610 - 700", band: "B1 Intermediate" },
    { raw: "51 - 60", lc: "255 - 300", rc: "255 - 300", total: "510 - 600", band: "A2 Pre-Intermediate" },
    { raw: "41 - 50", lc: "205 - 250", rc: "205 - 250", total: "410 - 500", band: "A2 Basic" },
    { raw: "0 - 40", lc: "0 - 200", rc: "0 - 200", total: "0 - 400", band: "A1 Novice" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="p-5 rounded-3xl bg-blue-50/80 border border-blue-200/90 flex items-start gap-3.5 shadow-xs">
        <Sliders className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-black text-blue-950">
            Quy Chuẩn Tính Điểm: Mỗi Câu Đúng 5 Điểm (Thang Điểm Tối Đa 1000)
          </h3>
          <p className="text-xs text-blue-900 leading-relaxed font-medium">
            Hệ thống áp dụng chuẩn tính điểm trực quan: mỗi câu hỏi học viên trả lời chính xác được tính <strong>5 điểm</strong>. Toàn bộ bài thi gồm 200 câu hỏi (100 câu Listening + 100 câu Reading), tổng điểm tối đa là <strong>1000 điểm</strong>.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[180px]">Số câu đúng mỗi phần</th>
                <th className="py-3.5 px-4 text-center min-w-[140px]">Listening (5đ/câu)</th>
                <th className="py-3.5 px-4 text-center min-w-[140px]">Reading (5đ/câu)</th>
                <th className="py-3.5 px-4 text-center min-w-[150px]">Tổng điểm tương ứng</th>
                <th className="py-3.5 px-4 min-w-[140px]">Khung năng lực</th>
                <th className="py-3.5 px-4 min-w-[220px]">Đánh giá chuẩn năng lực</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {conversionMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{row.raw} câu đúng</td>
                  <td className="py-3.5 px-4 text-center font-bold text-blue-600 font-mono whitespace-nowrap">
                    {row.lc} điểm
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-600 font-mono whitespace-nowrap">
                    {row.rc} điểm
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono font-black text-amber-700">
                    <span className="px-2.5 py-0.5 bg-amber-50 rounded-full border border-amber-200">
                      {row.total} điểm
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 whitespace-nowrap inline-flex items-center">
                      {row.band}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                    Tiêu chuẩn năng lực giao tiếp và công sở quốc tế
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

interface CollectionDetailItem {
  id: string;
  name: string;
  publisher: string;
  testsCount: number;
  year: string;
  status: "PUBLISHED" | "SCHEDULED";
  description: string;
  volKey?: "vol1" | "vol2";
  targetScore: string;
  audioStandard: string;
  tests: {
    id: number;
    title: string;
    difficulty: "Trung bình" | "Khó" | "Nâng cao";
    score: number;
    listeningScore: number;
    readingScore: number;
  }[];
}

export const MockTestCollectionsView: React.FC<CollectionsViewProps> = ({
  vol1Count,
  vol2Count,
  vol3Count = 10,
  onNavigateToTests,
}) => {
  const [selectedCol, setSelectedCol] = useState<CollectionDetailItem | null>(null);

  const collections: CollectionDetailItem[] = [
    {
      id: "col-vol1",
      name: "ETS TOEIC 2024 Official",
      publisher: "ETS Academic Publisher",
      testsCount: vol1Count,
      year: "2024",
      status: "PUBLISHED",
      volKey: "vol1",
      targetScore: "650 - 800+",
      audioStandard: "Bắc Mỹ & Anh - Úc chuẩn ETS",
      description: "Bộ 10 đề thi sát cấu trúc đề thi thật ETS, giọng đọc đa quốc gia (Mỹ, Anh, Úc, Canada). Chuẩn hóa toàn bộ câu hỏi Part 1 đến Part 7 với ngân hàng giải thích chi tiết.",
      tests: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Test ${i + 1}`,
        difficulty: i < 4 ? "Trung bình" : i < 8 ? "Khó" : "Nâng cao",
        score: 620 + (i * 15) % 90,
        listeningScore: 320 + (i * 10) % 50,
        readingScore: 300 + (i * 10) % 50,
      })),
    },
    {
      id: "col-vol2",
      name: "ETS TOEIC 2023 Official",
      publisher: "ETS Academic Publisher",
      testsCount: vol2Count,
      year: "2025",
      status: "PUBLISHED",
      volKey: "vol2",
      targetScore: "750 - 950+",
      audioStandard: "Nhiều biến âm & nuốt âm đề ETS mới",
      description: "Cập nhật các dạng bẫy ngữ pháp mới của Part 5 và bài đọc đôi/ba Part 7 nâng cao. Tăng cường bẫy suy luận ngầm và từ đồng nghĩa chuyên sâu.",
      tests: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Test ${i + 1}`,
        difficulty: i < 3 ? "Trung bình" : i < 7 ? "Khó" : "Nâng cao",
        score: 660 + (i * 12) % 110,
        listeningScore: 340 + (i * 8) % 60,
        readingScore: 320 + (i * 8) % 60,
      })),
    },
    {
      id: "col-ets2026",
      name: "ETS TOEIC 2026 Official",
      publisher: "ETS Global",
      testsCount: 10,
      year: "2026",
      status: "SCHEDULED",
      targetScore: "Mọi cấp độ (500 - 990)",
      audioStandard: "Giọng đọc bản xứ phòng thu 4K",
      description: "Bộ đề dự kiến phát hành quý 4 năm 2026 với ngân hàng câu hỏi mới nhất từ viện khảo thí ETS Hoa Kỳ, bám sát xu hướng đề thi các năm 2026 - 2027.",
      tests: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Official Test ${i + 1} (Dự kiến)`,
        difficulty: "Khó",
        score: 650,
        listeningScore: 330,
        readingScore: 320,
      })),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {collections.map((col) => (
          <div
            key={col.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 hover:shadow-md transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Năm {col.year}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    col.status === "PUBLISHED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {col.status === "PUBLISHED" ? "Đang phát hành" : "Lên lịch"}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">{col.name}</h3>
                <p className="text-xs text-slate-400 font-medium">{col.publisher}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{col.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{col.testsCount} đề full-test</span>
              <button
                type="button"
                onClick={() => setSelectedCol(col)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-semibold py-1 px-2.5 rounded-lg hover:bg-blue-50 transition"
              >
                <span>Chi tiết</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CHI TIẾT BỘ SƯU TẬP ĐỀ THI */}
      {selectedCol && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Năm {selectedCol.year}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedCol.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {selectedCol.status === "PUBLISHED" ? "Đang phát hành" : "Lên lịch"}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{selectedCol.name}</h2>
                <p className="text-xs text-slate-500 font-medium">{selectedCol.publisher}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCol(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Thông tin mô tả & tiêu chuẩn */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <p className="text-xs text-slate-700 leading-relaxed">{selectedCol.description}</p>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block font-semibold">Mục tiêu điểm thi:</span>
                    <strong className="text-slate-800">{selectedCol.targetScore}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block font-semibold">Tiêu chuẩn âm thanh:</span>
                    <strong className="text-slate-800">{selectedCol.audioStandard}</strong>
                  </div>
                </div>
              </div>

              {/* Thông số định dạng đề thi */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-600 uppercase block">Số lượng đề</span>
                  <strong className="text-base font-black text-blue-900">{selectedCol.testsCount} đề</strong>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase block">Số câu / đề</span>
                  <strong className="text-base font-black text-indigo-900">200 câu</strong>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase block">Thời gian làm</span>
                  <strong className="text-base font-black text-emerald-900">120 phút</strong>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-600 uppercase block">Thang điểm</span>
                  <strong className="text-base font-black text-amber-900">10 - 990</strong>
                </div>
              </div>

              {/* Danh sách các đề thi bên trong */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Danh sách các đề thi trong bộ ({selectedCol.tests.length} đề)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">Chuẩn ETS Format</span>
                </div>

                <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {selectedCol.tests.map((test) => (
                    <div
                      key={test.id}
                      className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {test.id}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{test.title}</h4>
                          <span className="text-[11px] text-slate-500">200 câu (100 LC + 100 RC) • 120 phút</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            test.difficulty === "Nâng cao"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : test.difficulty === "Khó"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {test.difficulty}
                        </span>
                        <span className="text-slate-600 font-bold hidden sm:inline">
                          TB: <strong className="text-blue-600">{test.score}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedCol(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Đóng
              </button>

              {selectedCol.volKey && onNavigateToTests && (
                <button
                  type="button"
                  onClick={() => {
                    const key = selectedCol.volKey;
                    setSelectedCol(null);
                    if (key) onNavigateToTests(key);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Chuyển đến quản trị 10 đề thi này</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

