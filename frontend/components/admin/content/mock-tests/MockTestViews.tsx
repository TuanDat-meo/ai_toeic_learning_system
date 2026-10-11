"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { TestItem, HistoryAttempt } from "@/app/admin/content/mock-tests/types";

// ==========================================
// 1. NHẬT KÝ NỘP BÀI THI CỦA HỌC VIÊN
// ==========================================
interface SubmissionsViewProps {
  tests: TestItem[];
}

export const MockTestSubmissionsView: React.FC<SubmissionsViewProps> = ({ tests }) => {
  const [search, setSearch] = useState("");
  const [filterScoreRange, setFilterScoreRange] = useState("ALL");

  // Mock student submission records based on tests
  const submissions = [
    {
      id: "sub-101",
      studentName: "Nguyễn Văn An",
      studentEmail: "an.nguyen@example.com",
      testTitle: "Test 1 - Crack TOEIC Vol 1",
      submittedAt: "10/10/2026 14:35",
      duration: "115 phút",
      listeningScore: 385,
      readingScore: 360,
      totalScore: 745,
      correctCount: 152,
      status: "Đã chấm điểm",
    },
    {
      id: "sub-102",
      studentName: "Trần Thị Mai",
      studentEmail: "mai.tran@example.com",
      testTitle: "Test 2 - Crack TOEIC Vol 1",
      submittedAt: "10/10/2026 11:20",
      duration: "118 phút",
      listeningScore: 440,
      readingScore: 425,
      totalScore: 865,
      correctCount: 178,
      status: "Đã chấm điểm",
    },
    {
      id: "sub-103",
      studentName: "Lê Hoàng Long",
      studentEmail: "long.le@example.com",
      testTitle: "Test 1 - Crack TOEIC Vol 2",
      submittedAt: "09/10/2026 20:15",
      duration: "120 phút",
      listeningScore: 290,
      readingScore: 280,
      totalScore: 570,
      correctCount: 118,
      status: "Đã chấm điểm",
    },
    {
      id: "sub-104",
      studentName: "Phạm Hải Đăng",
      studentEmail: "dang.pham@example.com",
      testTitle: "Test 3 - Crack TOEIC Vol 1",
      submittedAt: "09/10/2026 16:40",
      duration: "95 phút",
      listeningScore: 410,
      readingScore: 375,
      totalScore: 785,
      correctCount: 161,
      status: "Đã chấm điểm",
    },
    {
      id: "sub-105",
      studentName: "Vũ Phương Thảo",
      studentEmail: "thao.vu@example.com",
      testTitle: "Test 4 - Crack TOEIC Vol 1",
      submittedAt: "08/10/2026 09:30",
      duration: "119 phút",
      listeningScore: 475,
      readingScore: 460,
      totalScore: 935,
      correctCount: 191,
      status: "Đã chấm điểm",
    },
  ];

  const filteredSubmissions = submissions.filter((s) => {
    const matchSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      s.testTitle.toLowerCase().includes(search.toLowerCase());

    const matchScore =
      filterScoreRange === "ALL"
        ? true
        : filterScoreRange === "800+"
        ? s.totalScore >= 800
        : filterScoreRange === "600-800"
        ? s.totalScore >= 600 && s.totalScore < 800
        : s.totalScore < 600;

    return matchSearch && matchScore;
  });

  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên học viên, email, mã đề..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={filterScoreRange}
            onChange={(e) => setFilterScoreRange(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả phổ điểm</option>
            <option value="800+">Xuất sắc (800+)</option>
            <option value="600-800">Khá (600 - 800)</option>
            <option value="<600">Dưới 600</option>
          </select>
          <span className="text-xs font-bold text-slate-500">
            Hiển thị <strong>{filteredSubmissions.length}</strong> bài nộp
          </span>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[180px]">Học viên</th>
                <th className="py-3.5 px-4 min-w-[180px]">Bài thi TOEIC</th>
                <th className="py-3.5 px-4 min-w-[140px]">Thời gian nộp</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">Listening</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">Reading</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Tổng điểm</th>
                <th className="py-3.5 px-4 min-w-[130px]">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredSubmissions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <p className="font-bold text-slate-900">{s.studentName}</p>
                    <p className="text-[11px] text-slate-400">{s.studentEmail}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{s.testTitle}</span>
                    <span className="text-[10px] text-slate-500 block">Làm trong {s.duration}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{s.submittedAt}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-blue-600 whitespace-nowrap">
                    {s.listeningScore}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-600 whitespace-nowrap">
                    {s.readingScore}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                      {s.totalScore} / 990
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {s.status}
                    </span>
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

// ==========================================
// 2. BẢNG QUY ĐỔI ĐIỂM TOEIC (RAW SCORE TO SCALED SCORE)
// ==========================================
export const MockTestScoreConversionView: React.FC = () => {
  // Standard TOEIC raw to scale preview sample
  const conversionMatrix = [
    { raw: "96 - 100", lc: 495, rc: 495, band: "C1 Master" },
    { raw: "91 - 95", lc: 480, rc: 460, band: "B2 Advanced" },
    { raw: "86 - 90", lc: 450, rc: 420, band: "B2 Advanced" },
    { raw: "81 - 85", lc: 420, rc: 390, band: "B2 Upper Intermediate" },
    { raw: "76 - 80", lc: 390, rc: 355, band: "B1 Intermediate" },
    { raw: "71 - 75", lc: 360, rc: 320, band: "B1 Intermediate" },
    { raw: "61 - 70", lc: 315, rc: 275, band: "B1 Intermediate" },
    { raw: "51 - 60", lc: 260, rc: 220, band: "A2 Pre-Intermediate" },
    { raw: "41 - 50", lc: 210, rc: 170, band: "A2 Basic" },
    { raw: "0 - 40", lc: "5 - 190", rc: "5 - 150", band: "A1 Novice" },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-3xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
        <Sliders className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-black text-blue-950">
            Thang Điểm Quy Đổi Chuẩn ETS TOEIC (Standard Conversion Matrix)
          </h3>
          <p className="text-xs text-blue-800 leading-relaxed mt-1">
            Mỗi bài thi TOEIC 200 câu được quy đổi từ số câu đúng (Raw Score 0 - 100 cho mỗi phần) sang thang điểm 5 - 495 theo thuật toán phân phối chuẩn của ETS.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[200px]">Số câu trả lời đúng (Raw Score)</th>
                <th className="py-3.5 px-4 text-center min-w-[130px]">Điểm Listening (0 - 495)</th>
                <th className="py-3.5 px-4 text-center min-w-[130px]">Điểm Reading (0 - 495)</th>
                <th className="py-3.5 px-4 min-w-[150px]">Khung năng lực CEFR</th>
                <th className="py-3.5 px-4 min-w-[240px]">Đánh giá chuẩn năng lực</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {conversionMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{row.raw} câu</td>
                  <td className="py-3.5 px-4 text-center font-bold text-blue-600 font-mono whitespace-nowrap">
                    {row.lc}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-600 font-mono whitespace-nowrap">
                    {row.rc}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 whitespace-nowrap inline-flex items-center">
                      {row.band}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                    Thích ứng tiêu chuẩn giao tiếp và công sở quốc tế
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

// ==========================================
// 3. QUẢN LÝ BỘ SƯU TẬP ĐỀ THI (COLLECTIONS)
// ==========================================
interface CollectionsViewProps {
  vol1Count: number;
  vol2Count: number;
  onNavigateToTests?: (volId: "vol1" | "vol2") => void;
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
  onNavigateToTests,
}) => {
  const [selectedCol, setSelectedCol] = useState<CollectionDetailItem | null>(null);

  const collections: CollectionDetailItem[] = [
    {
      id: "col-vol1",
      name: "Crack TOEIC Vol 1",
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
      name: "Crack TOEIC Vol 2",
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

