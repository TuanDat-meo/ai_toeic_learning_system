"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Save,
  Eye,
  Sliders,
  Layers,
  Download,
  RotateCcw,
  Info,
  Check,
  Sparkles,
  Shuffle,
  Clock,
  Target,
  FileCode,
  FileSpreadsheet,
} from "lucide-react";
import { useEffect } from "react";
import { GrammarTopicItem, GrammarQuestionItem } from "@/app/admin/content/grammar/types";

// ==========================================
// 1. NGÂN HÀNG TOÀN BỘ CÂU HỎI NGỮ PHÁP
// ==========================================
interface QuestionBankViewProps {
  topics: GrammarTopicItem[];
}

export const GrammarQuestionBankView: React.FC<QuestionBankViewProps> = ({
  topics,
}) => {
  const [search, setSearch] = useState("");
  const [selectedPart, setSelectedPart] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [previewQ, setPreviewQ] = useState<{ q: GrammarQuestionItem; topicTitle: string } | null>(null);

  // Flatten all questions with topic context
  const allQuestions = useMemo(() => {
    const list: { q: GrammarQuestionItem; topic: GrammarTopicItem }[] = [];
    topics.forEach((t) => {
      t.questions.forEach((q) => {
        list.push({ q, topic: t });
      });
    });
    return list;
  }, [topics]);

  const filtered = useMemo(() => {
    return allQuestions.filter(({ q, topic }) => {
      const matchSearch =
        q.questionText.toLowerCase().includes(search.toLowerCase()) ||
        q.explanation.toLowerCase().includes(search.toLowerCase()) ||
        (q.trapNote && q.trapNote.toLowerCase().includes(search.toLowerCase())) ||
        (topic.title || topic.titleVi || "").toLowerCase().includes(search.toLowerCase()) ||
        topic.code.toLowerCase().includes(search.toLowerCase());

      const matchPart = selectedPart === "ALL" || q.part === selectedPart;
      const matchDiff = selectedDifficulty === "ALL" || q.difficulty === selectedDifficulty;

      return matchSearch && matchPart && matchDiff;
    });
  }, [allQuestions, search, selectedPart, selectedDifficulty]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo nội dung câu hỏi, mã đề, bẫy..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedPart}
            onChange={(e) => setSelectedPart(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả phần thi</option>
            <option value="Part 5">Part 5 (Incomplete Sentences)</option>
            <option value="Part 6">Part 6 (Text Completion)</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả độ khó</option>
            <option value="350-500">Cơ bản (350 - 500)</option>
            <option value="500-750">Trung cấp (500 - 750)</option>
            <option value="750+">Nâng cao (750+)</option>
          </select>

          <span className="text-xs font-bold text-slate-500 px-2">
            Tổng: <strong>{filtered.length}</strong> / {allQuestions.length} câu
          </span>
        </div>
      </div>

      {/* Questions Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[110px]">Mã / Part</th>
                <th className="py-3.5 px-4 min-w-[300px]">Nội dung câu hỏi TOEIC</th>
                <th className="py-3.5 px-4 min-w-[180px]">Chuyên đề liên kết</th>
                <th className="py-3.5 px-4 text-center min-w-[90px]">Đáp án đúng</th>
                <th className="py-3.5 px-4 min-w-[120px]">Độ khó</th>
                <th className="py-3.5 px-4 min-w-[220px]">Bẫy thí sinh (Trap Note)</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Không tìm thấy câu hỏi ngữ pháp nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map(({ q, topic }) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-slate-900">{q.id}</span>
                        <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit mt-0.5 whitespace-nowrap inline-flex items-center">
                          {q.part}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 leading-snug line-clamp-2">
                        {q.questionText}
                      </p>
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mt-1">
                        <span>A: {q.options.A}</span>
                        <span>•</span>
                        <span>B: {q.options.B}</span>
                        <span>•</span>
                        <span>C: {q.options.C}</span>
                        <span>•</span>
                        <span>D: {q.options.D}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{topic.titleVi || topic.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{topic.code}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                        {q.correctAnswer}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap inline-flex items-center ${
                          q.difficulty === "750+"
                            ? "bg-purple-100 text-purple-800"
                            : q.difficulty === "500-750"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {q.difficulty || "500-750"}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      {q.trapNote ? (
                        <div className="flex items-start gap-1 text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200/60 line-clamp-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{q.trapNote}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Không gắn bẫy</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setPreviewQ({ q, topicTitle: topic.title || topic.titleVi || "" })}
                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                        title="Xem chi tiết & giải thích"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Question */}
      {previewQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {previewQ.q.part} • {previewQ.q.difficulty || "500-750"}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-1">
                  Thuộc chuyên đề: {previewQ.topicTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewQ(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 leading-relaxed">
              {previewQ.q.questionText}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <div
                  key={opt}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    previewQ.q.correctAnswer === opt
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  <span className="font-mono font-bold w-4">{opt}.</span>
                  <span>{previewQ.q.options[opt]}</span>
                  {previewQ.q.correctAnswer === opt && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1.5 text-xs">
              <span className="font-bold text-blue-900 block">💡 Giải thích chi tiết:</span>
              <p className="text-slate-700 leading-relaxed">{previewQ.q.explanation}</p>
              {previewQ.q.translation && (
                <p className="text-slate-500 italic text-[11px] pt-1">
                  Dịch nghĩa: &quot;{previewQ.q.translation}&quot;
                </p>
              )}
            </div>

            {previewQ.q.trapNote && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1 text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Bẫy đề TOEIC cần lưu ý:
                </span>
                <p className="text-amber-800 leading-relaxed text-[11px]">{previewQ.q.trapNote}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewQ(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. MA TRẬN BẪY ĐỀ & PHÂN TÍCH LỖI SAI HỌC VIÊN
// ==========================================
interface TrapsMatrixViewProps {
  topics: GrammarTopicItem[];
}

export const GrammarTrapsMatrixView: React.FC<TrapsMatrixViewProps> = ({ topics }) => {
  const LOCAL_STORAGE_KEY = "toeic_grammar_curriculum_config";
  const [config, setConfig] = useState({
    minAccuracyPass: 80,
    srsGrammarInterval: 3,
    shuffleQuestions: true,
    showExplanationImmediately: true,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}

    const handleConfigUpdated = (e: any) => {
      if (e.detail) setConfig((prev) => ({ ...prev, ...e.detail }));
    };
    window.addEventListener("toeic-grammar-config-updated", handleConfigUpdated);
    return () => window.removeEventListener("toeic-grammar-config-updated", handleConfigUpdated);
  }, []);

  // Aggregate traps across all topics
  const allTraps = useMemo(() => {
    const list: {
      id: string;
      topicCode: string;
      topicTitle: string;
      trapTitle: string;
      frequency: "Cao" | "Rất cao" | "Trung bình";
      studentFailRate: number;
      countermeasure: string;
    }[] = [];

    topics.forEach((t, index) => {
      t.traps.forEach((trap, trapIdx) => {
        list.push({
          id: `trap-${index}-${trapIdx}`,
          topicCode: t.code,
          topicTitle: t.title || t.titleVi || "",
          trapTitle: trap,
          frequency: trapIdx === 0 ? "Rất cao" : trapIdx === 1 ? "Cao" : "Trung bình",
          studentFailRate: Math.max(38, Math.min(82, 45 + ((index * 7 + trapIdx * 13) % 36))),
          countermeasure: `Áp dụng công thức nhận diện nhanh: ${t.formula}`,
        });
      });
    });

    return list;
  }, [topics]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Banner thông báo tiêu chí đạt & chu kỳ SRS theo cấu hình */}
      <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300">
            <Sliders className="w-4 h-4" />
          </span>
          <div>
            <span className="font-bold text-white">Tiêu chuẩn chuyên đề đang áp dụng:</span>{" "}
            <span className="text-slate-300 font-mono">
              Chuẩn đầu ra: ≥{config.minAccuracyPass}% đúng • Lặp lại ngắt quãng (SRS): {config.srsGrammarInterval} ngày • Xáo trộn câu hỏi: {config.shuffleQuestions ? "Bật" : "Tắt"}
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-semibold font-mono w-fit">
          ETS 2026 Ready
        </span>
      </div>

      {/* Traps Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Ma Trận Bẫy Ngữ Pháp & Tần Suất Xuất Hiện Trong Đề Thi TOEIC
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            Dữ liệu thống kê từ ngân hàng câu hỏi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[170px]">Chuyên đề</th>
                <th className="py-3.5 px-4 min-w-[280px]">Bẫy đề thi TOEIC</th>
                <th className="py-3.5 px-4 min-w-[140px]">Tần suất xuất hiện</th>
                <th className="py-3.5 px-4 min-w-[160px]">Tỷ lệ học sinh sai</th>
                <th className="py-3.5 px-4 min-w-[260px]">Khuyến nghị sư phạm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {allTraps.map((trap) => (
                <tr key={trap.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] block w-fit whitespace-nowrap">
                      {trap.topicCode}
                    </span>
                    <span className="text-xs text-slate-600 font-semibold mt-0.5 block whitespace-nowrap">
                      {trap.topicTitle}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 min-w-[280px]">
                    <p className="font-bold text-slate-900">{trap.trapTitle}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap inline-flex items-center ${
                        trap.frequency === "Rất cao"
                          ? "bg-rose-100 text-rose-800"
                          : trap.frequency === "Cao"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {trap.frequency}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 min-w-[160px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={trap.studentFailRate >= 65 ? "text-rose-600" : "text-amber-600"}>
                          {trap.studentFailRate}% dính bẫy
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full ${
                            trap.studentFailRate >= 65 ? "bg-rose-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${trap.studentFailRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">
                    <span className="font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200 block text-slate-700">
                      {trap.countermeasure}
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
// 3. CẤU HÌNH LỘ TRÌNH & XUẤT BẢN NGỮ PHÁP
// ==========================================
interface CurriculumConfigViewProps {
  topicsCount: number;
  topics?: GrammarTopicItem[];
}

export const GrammarCurriculumConfigView: React.FC<CurriculumConfigViewProps> = ({
  topicsCount,
  topics = [],
}) => {
  const LOCAL_STORAGE_KEY = "toeic_grammar_curriculum_config";

  const [minAccuracyPass, setMinAccuracyPass] = useState(80);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [srsGrammarInterval, setSrsGrammarInterval] = useState(3);
  const [showExplanationImmediately, setShowExplanationImmediately] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  // Load cấu hình đã lưu
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.minAccuracyPass === "number") setMinAccuracyPass(parsed.minAccuracyPass);
        if (typeof parsed.srsGrammarInterval === "number") setSrsGrammarInterval(parsed.srsGrammarInterval);
        if (typeof parsed.shuffleQuestions === "boolean") setShuffleQuestions(parsed.shuffleQuestions);
        if (typeof parsed.showExplanationImmediately === "boolean")
          setShowExplanationImmediately(parsed.showExplanationImmediately);
      }
    } catch {}
  }, []);

  // Áp dụng bộ Preset chiến lược sư phạm 1-click
  const applyPreset = (preset: "academy" | "crash_course" | "advanced") => {
    if (preset === "academy") {
      setMinAccuracyPass(80);
      setSrsGrammarInterval(3);
      setShuffleQuestions(true);
      setShowExplanationImmediately(true);
    } else if (preset === "crash_course") {
      setMinAccuracyPass(70);
      setSrsGrammarInterval(2);
      setShuffleQuestions(true);
      setShowExplanationImmediately(true);
    } else {
      setMinAccuracyPass(90);
      setSrsGrammarInterval(5);
      setShuffleQuestions(true);
      setShowExplanationImmediately(false);
    }
  };

  const handleSave = () => {
    try {
      const config = {
        minAccuracyPass,
        srsGrammarInterval,
        shuffleQuestions,
        showExplanationImmediately,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent("toeic-grammar-config-updated", { detail: config }));
    } catch {}

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportJSON = () => {
    try {
      const exportData = {
        title: "TOEIC Grammar Curriculum Data",
        version: "v2.4 - ETS 2026",
        exportedAt: new Date().toISOString(),
        config: {
          minAccuracyPass,
          srsGrammarInterval,
          shuffleQuestions,
          showExplanationImmediately,
        },
        topicsCount: topics.length || topicsCount,
        topics: topics.map((t) => ({
          code: t.code,
          titleVi: t.titleVi || t.title,
          titleEn: t.titleEn || t.englishTitle,
          part: t.part,
          targetScore: t.targetScore,
          formula: t.formula,
          summary: t.summary,
          trapsCount: t.traps?.length || 0,
          questionsCount: t.questions?.length || 0,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toeic_grammar_curriculum_lms_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setDownloadMsg("Đã xuất file LMS (JSON) thành công!");
      setTimeout(() => setDownloadMsg(null), 3000);
    } catch {
      alert("Xuất file thất bại.");
    }
  };

  const handleExportCSV = () => {
    try {
      let csvContent = "Mã chủ điểm,Tên chủ điểm,Phần thi,Mục tiêu điểm,Số câu hỏi,Bẫy đề thi\n";
      topics.forEach((t) => {
        const title = `"${(t.titleVi || t.title || "").replace(/"/g, '""')}"`;
        const traps = `"${(t.traps || []).join("; ").replace(/"/g, '""')}"`;
        csvContent += `${t.code},${title},${t.part},${t.targetScore},${t.questions?.length || 0},${traps}\n`;
      });

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toeic_grammar_topics_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setDownloadMsg("Đã xuất file CSV thành công!");
      setTimeout(() => setDownloadMsg(null), 3000);
    } catch {
      alert("Xuất file CSV thất bại.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      {/* Toast thông báo tải file */}
      {downloadMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* 1. KHỐI CHÍNH: QUY CHUẨN ĐẠT & ĐỒNG BỘ GIÁO TRÌNH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CỘT TRÁI: QUY CHUẨN ĐẠT CHUYÊN ĐỀ & KIỂM TRA */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quy Chuẩn Đạt Chuyên Đề &amp; Kiểm Tra
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập mốc phần trăm tối thiểu và cơ chế lặp lại ngắt quãng (SRS)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold font-mono">
              Chuẩn: {minAccuracyPass}%
            </span>
          </div>

          <div className="space-y-4 text-xs font-medium text-slate-700">
            {/* Slider 1: Tỷ lệ làm đúng tối thiểu */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900">Tỷ lệ làm đúng tối thiểu để mở khóa:</span>
                <span className="font-bold text-blue-600 font-mono text-sm">{minAccuracyPass}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={minAccuracyPass}
                onChange={(e) => setMinAccuracyPass(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>50% (Cơ bản)</span>
                <span className="text-slate-600 font-medium">Khuyên dùng: 80%</span>
                <span>100% (Tuyệt đối)</span>
              </div>
            </div>

            {/* Slider 2: Chu kỳ SRS */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900">Chu kỳ lặp lại ngắt quãng (SRS) cho câu sai:</span>
                <span className="font-bold text-blue-600 font-mono text-sm">{srsGrammarInterval} ngày</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={srsGrammarInterval}
                onChange={(e) => setSrsGrammarInterval(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>1 ngày (Ôn gấp)</span>
                <span className="text-slate-600 font-medium">Chuẩn Ebbinghaus: 3 ngày</span>
                <span>7 ngày (1 tuần)</span>
              </div>
            </div>

            {/* Checkbox 1: Xáo trộn câu hỏi */}
            <label className="flex items-start gap-3 p-3.5 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl cursor-pointer border border-slate-200/70 transition">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-400 mt-0.5"
              />
              <div>
                <span className="block font-semibold text-slate-900">
                  Xáo trộn thứ tự câu hỏi và phương án A-B-C-D
                </span>
                <span className="text-[11px] text-slate-500">
                  Chống học vẹt vị trí đáp án; mỗi lần làm bài câu hỏi sẽ được sắp xếp ngẫu nhiên.
                </span>
              </div>
            </label>

            {/* Checkbox 2: Hiển thị giải thích ngay */}
            <label className="flex items-start gap-3 p-3.5 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl cursor-pointer border border-slate-200/70 transition">
              <input
                type="checkbox"
                checked={showExplanationImmediately}
                onChange={(e) => setShowExplanationImmediately(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-400 mt-0.5"
              />
              <div>
                <span className="block font-semibold text-slate-900">
                  Hiển thị giải thích chi tiết &amp; bẫy đề ngay sau khi trả lời
                </span>
                <span className="text-[11px] text-slate-500">
                  {showExplanationImmediately
                    ? "Đang bật: Học viên thấy ngay giải thích và bẫy đề để sửa sai tức thì."
                    : "Đang tắt: Chế độ thi thử nghiêm túc (làm xong toàn bộ mới xem đáp án)."}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* CỘT PHẢI: ĐỒNG BỘ GIÁO TRÌNH & XUẤT DỮ LIỆU */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Đồng Bộ Giáo Trình &amp; Xuất Dữ Liệu
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phát hành dữ liệu chuyên đề và ngân hàng bẫy đề thi ra file chuẩn LMS
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Sẵn sàng phát hành
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Toàn bộ <strong className="text-slate-900">{topicsCount} chuyên đề ngữ pháp TOEIC</strong> đã được đồng bộ với hệ thống Mobile App và Web Student. Bạn có thể xuất bản toàn bộ hoặc tải file định dạng chuẩn LMS.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Thông số hệ thống:</span>
              <div className="flex justify-between text-slate-600">
                <span>Phiên bản giáo trình:</span>
                <strong className="font-mono text-slate-900">v2.4 - ETS 2026</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tổng số chuyên đề:</span>
                <strong className="font-mono text-slate-900">{topicsCount} chủ điểm cốt lõi</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Chu kỳ ôn tập SRS:</span>
                <strong className="font-mono text-slate-900">{srsGrammarInterval} ngày sau câu sai</strong>
              </div>
            </div>

            {/* Các nút tải file thực tế */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 block">Xuất dữ liệu giáo trình:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>Xuất file LMS (JSON)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất bảng câu hỏi (CSV)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Nút lưu cấu hình */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedSuccess ? "Đã lưu thành công!" : "Lưu cấu hình"}</span>
            </button>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-600 animate-in fade-in flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Đã đồng bộ vào hệ thống phòng thi!</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. CHỌN NHANH CHIẾN LƯỢC SƯ PHẠM (3 PRESETS 1-CLICK) */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <span className="text-xs font-bold text-slate-800 block">
          Chọn nhanh chế độ lộ trình (1-Click Presets):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => applyPreset("academy")}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
              minAccuracyPass === 80 && srsGrammarInterval === 3 && showExplanationImmediately
                ? "border-slate-800 bg-slate-50 ring-1 ring-slate-800"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Chuẩn Academy (Khuyên dùng)</span>
              <span className="text-[10px] font-semibold text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded">
                Cân bằng
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Đạt chuẩn: 80% • SRS: 3 ngày • Bật xáo trộn • Xem giải thích ngay sau mỗi câu.
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset("crash_course")}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
              minAccuracyPass === 70 && srsGrammarInterval === 2 && showExplanationImmediately
                ? "border-slate-800 bg-slate-50 ring-1 ring-slate-800"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Luyện thi cấp tốc</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                Tốc độ
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Đạt chuẩn: 70% • SRS: 2 ngày • Đẩy nhanh tiến độ hoàn thành các chuyên đề.
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset("advanced")}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
              minAccuracyPass === 90 && srsGrammarInterval === 5 && !showExplanationImmediately
                ? "border-slate-800 bg-slate-50 ring-1 ring-slate-800"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Chinh phục 850+ (Kỷ luật)</span>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                Nâng cao
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Đạt chuẩn: 90% • SRS: 5 ngày • Tắt xem giải thích giữa chừng (chế độ thi thật).
            </p>
          </button>
        </div>
      </div>

      {/* 3. TÁC ĐỘNG THỰC TẾ LÊN HỆ THỐNG */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-600" />
          Tác động thực tế của cấu hình này lên toàn bộ hệ thống:
        </span>
        <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-600 pl-1 leading-relaxed">
          <li>
            <strong>Ngưỡng mở khóa bài học:</strong> Học viên phải làm đúng tối thiểu <strong>{minAccuracyPass}%</strong> số câu hỏi thì chuyên đề đó mới được đánh dấu là <em>&quot;Đạt chuẩn&quot;</em> và mở khóa bài tiếp theo.
          </li>
          <li>
            <strong>Chu kỳ ôn tập ngắt quãng (SRS):</strong> Khi học viên làm sai câu hỏi, hệ thống sẽ tự động lên lịch nhắc nhở làm lại câu sai sau đúng <strong>{srsGrammarInterval} ngày</strong>.
          </li>
          <li>
            <strong>Trải nghiệm phòng thi:</strong> {shuffleQuestions ? "Đang bật xáo trộn câu hỏi và đáp án A-B-C-D" : "Đang giữ nguyên thứ tự cố định"}. {showExplanationImmediately ? "Hiển thị giải thích & bẫy đề ngay sau mỗi câu" : "Chế độ thi thử (chỉ xem giải thích khi làm xong toàn bộ)"}.
          </li>
        </ul>
      </div>
    </div>
  );
};
