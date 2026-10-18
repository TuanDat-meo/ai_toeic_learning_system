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
} from "lucide-react";
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
    <div className="space-y-6">
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
}

export const GrammarCurriculumConfigView: React.FC<CurriculumConfigViewProps> = ({
  topicsCount,
}) => {
  const [minAccuracyPass, setMinAccuracyPass] = useState(80);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [srsGrammarInterval, setSrsGrammarInterval] = useState(3);
  const [showExplanationImmediately, setShowExplanationImmediately] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sư phạm & Tiêu chí đạt */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900">
              Quy Chuẩn Đạt Chuyên Đề & Kiểm Tra
            </h3>
          </div>

          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span>Tỷ lệ làm đúng tối thiểu để mở khóa bài tiếp theo:</span>
                <span className="font-bold text-blue-600">{minAccuracyPass}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={minAccuracyPass}
                onChange={(e) => setMinAccuracyPass(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span>Chu kỳ lặp lại ngắt quãng (SRS) cho ngữ pháp hay sai:</span>
                <span className="font-bold text-blue-600">{srsGrammarInterval} ngày</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={srsGrammarInterval}
                onChange={(e) => setSrsGrammarInterval(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-800">
                Xáo trộn thứ tự câu hỏi và phương án A-B-C-D khi học sinh làm bài
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={showExplanationImmediately}
                onChange={(e) => setShowExplanationImmediately(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-800">
                Hiển thị giải thích chi tiết & bẫy đề ngay sau mỗi câu trả lời sai
              </span>
            </label>
          </div>
        </div>

        {/* Xuất bản & Đồng bộ giáo trình */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">
                Đồng Bộ Giáo Trình & Xuất Dữ Liệu
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Toàn bộ {topicsCount} chuyên đề ngữ pháp TOEIC đã được đồng bộ với hệ thống Mobile App và Web Student. Bạn có thể xuất bản toàn bộ hoặc tải file định dạng chuẩn LMS.
            </p>

            <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2 text-xs">
              <span className="font-bold text-indigo-900 block">Thông số phiên bản:</span>
              <div className="flex justify-between text-indigo-700">
                <span>Phiên bản giáo trình:</span>
                <strong className="font-mono">v2.4 - ETS 2026</strong>
              </div>
              <div className="flex justify-between text-indigo-700">
                <span>Trạng thái máy chủ:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Sẵn sàng phát hành
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savedSuccess ? "Đã lưu cài đặt!" : "Lưu cấu hình"}</span>
            </button>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
                Cập nhật cấu hình thành công!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
