"use client";

import React, { useState, useMemo } from "react";
import { ExerciseCardData, SampleQuestion, VocabItem } from "@/app/admin/content/reading/types";
import { lookupWordDetail, WordDetail } from "./richDictionaryData";
import {
  X,
  BookOpen,
  FileText,
  ListOrdered,
  BookMarked,
  CheckCircle2,
  Volume2,
  Edit3,
  Play,
  Layers,
  Clock,
  Sparkles,
  Languages,
  Check,
  Tag,
  ArrowRight,
} from "lucide-react";

export interface ReadingTheoryModalProps {
  card: ExerciseCardData;
  onClose: () => void;
  onStartPractice: (card: ExerciseCardData) => void;
  onEditCard?: (card: ExerciseCardData) => void;
}

type ModalDetailTab = "info" | "passage" | "questions" | "vocab";

export const ReadingTheoryModal: React.FC<ReadingTheoryModalProps> = ({
  card,
  onClose,
  onStartPractice,
  onEditCard,
}) => {
  const isPart5 = card.category === "part5" || card.category === "grammar";
  const [activeTab, setActiveTab] = useState<ModalDetailTab>("info");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [showBilingualPassage, setShowBilingualPassage] = useState(true);
  const [playingRegion, setPlayingRegion] = useState<"UK" | "US" | null>(null);
  const [selectedVocabDetail, setSelectedVocabDetail] = useState<WordDetail | null>(null);

  const handleOpenVocabDetail = (vocab: VocabItem | { word: string; pos?: string; meaning?: string }) => {
    const detail = lookupWordDetail(vocab.word);
    if (vocab.meaning && (!detail.contextMeaning || detail.contextMeaning.startsWith("Thuật ngữ"))) {
      detail.contextMeaning = vocab.meaning;
    }
    if (vocab.pos) {
      detail.pos = vocab.pos;
    }
    setSelectedVocabDetail(detail);
  };

  // Extract questions
  const questions: SampleQuestion[] = useMemo(() => {
    if (card.sampleQuestions && card.sampleQuestions.length > 0) {
      return card.sampleQuestions;
    }
    return [
      {
        questionNum: isPart5 ? "101" : card.category === "part6" ? "131" : "147",
        question: card.theory?.example || "Example TOEIC reading question",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: 0,
        explanation: "Phương án chính xác dựa trên ngữ cảnh và ngữ pháp.",
        steps: [
          { title: "Bước 1: Phân tích ngữ cảnh", desc: "Xác định từ loại hoặc ý nghĩa cần điền." },
          { title: "Bước 2: Đối chiếu & chọn đáp án", desc: "So sánh các phương án để chọn đáp án chuẩn xác nhất." },
        ],
        vocabList: [],
      },
    ];
  }, [card, isPart5]);

  const activeQuestion = questions[selectedQuestionIndex] || questions[0];

  // Aggregate all vocabularies
  const allVocabularies = useMemo(() => {
    const list: { item: VocabItem; qNum: string }[] = [];
    questions.forEach((q, qIdx) => {
      (q.vocabList || []).forEach((item) => {
        list.push({
          item,
          qNum: q.questionNum || String(100 + qIdx + 1),
        });
      });
    });
    return list;
  }, [questions]);

  // Audio Pronunciation Synth for UK / US
  const playWordAudio = (word: string, region: "UK" | "US") => {
    if (!word || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setPlayingRegion(region);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = region === "UK" ? "en-GB" : "en-US";
    utterance.rate = 0.88;
    utterance.onend = () => setPlayingRegion(null);
    utterance.onerror = () => setPlayingRegion(null);
    window.speechSynthesis.speak(utterance);
  };

  // Word count helper
  const passageWordCount = useMemo(() => {
    if (!card.passageText) return 0;
    return card.passageText.trim().split(/\s+/).filter(Boolean).length;
  }, [card.passageText]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-100 relative flex flex-col animate-in zoom-in-95 duration-150 font-sans overflow-hidden">
        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 via-blue-50/20 to-white shrink-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${
                  card.category === "part5"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : card.category === "part6"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {card.category === "part5"
                  ? "Part 5 • Incomplete Sentences"
                  : card.category === "part6"
                  ? "Part 6 • Text Completion"
                  : "Part 7 • Reading Comprehension"}
              </span>

              {card.tag && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span>{card.tag}</span>
                </span>
              )}

              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200/60">
                {questions.length} câu hỏi
              </span>

              {allVocabularies.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200/60">
                  {allVocabularies.length} từ vựng
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {card.title}
            </h3>
            {card.subtitle && (
              <p className="text-xs text-slate-500 line-clamp-1">{card.subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Đóng (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TAB NAVIGATION (ẨN TAB ĐOẠN VĂN NẾU LÀ PART 5) */}
        <div className="flex shrink-0 items-center gap-1 border-b border-slate-100 bg-slate-50/70 px-5 sm:px-6 py-2 overflow-x-auto text-xs font-bold custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "info"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Thông tin &amp; Lý thuyết</span>
          </button>

          {/* CHỈ HIỂN THỊ ĐOẠN VĂN CHO PART 6 & PART 7 */}
          {!isPart5 && (
            <button
              type="button"
              onClick={() => setActiveTab("passage")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "passage"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2. Đoạn văn đọc (Passage)</span>
              {passageWordCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
                  {passageWordCount} từ
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "questions"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>{isPart5 ? "2. Bộ câu hỏi & Đáp án" : "3. Bộ câu hỏi & Đáp án"}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
              {questions.length} câu
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vocab")}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "vocab"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>{isPart5 ? "3. Từ vựng cần học" : "4. Từ vựng cần học"}</span>
            {allVocabularies.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px]">
                {allVocabularies.length} từ
              </span>
            )}
          </button>
        </div>

        {/* TAB BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs custom-scrollbar space-y-4">
          {/* TAB 1: THÔNG TIN & LÝ THUYẾT */}
          {activeTab === "info" && (
            <div className="space-y-4">
              {/* Box chỉ dẫn chuẩn ETS */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border border-blue-100 space-y-2">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Hướng dẫn làm bài chuẩn ETS (Directions)
                </span>
                <p className="text-xs text-blue-950 font-medium leading-relaxed">
                  {card.theory?.summary ||
                    (isPart5
                      ? "Mỗi câu dưới đây bị khuyết một từ hoặc cụm từ. Bốn phương án trả lời được cung cấp bên dưới mỗi câu. Chọn đáp án thích hợp nhất để hoàn thành câu."
                      : card.category === "part6"
                      ? "Đoạn văn bị khuyết 4 vị trí ([131]-[134]). Đọc kỹ đoạn văn và chọn phương án thích hợp nhất để điền vào chỗ trống."
                      : "Đọc các đoạn văn và trả lời các câu hỏi đọc hiểu đi kèm. Chọn phương án chính xác nhất (A, B, C hoặc D).")}
                </p>
              </div>

              {/* Quy tắc & Dấu hiệu nhận biết */}
              {card.theory?.rules && card.theory.rules.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quy tắc cốt lõi &amp; Dấu hiệu nhận biết:</span>
                  </span>
                  <ul className="space-y-2">
                    {card.theory.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ví dụ minh họa */}
              {card.theory?.example && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Ví dụ minh họa ngữ cảnh TOEIC:
                  </span>
                  <p className="font-mono text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-200/80 italic">
                    &quot;{card.theory.example}&quot;
                  </p>
                </div>
              )}

              {/* Thông số khuyến nghị thời gian */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-2xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Thời gian khuyến nghị:</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                    {isPart5
                      ? "~25 - 30 giây / câu"
                      : card.category === "part6"
                      ? "~40 - 45 giây / câu"
                      : "~55 - 60 giây / câu"}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Định dạng câu hỏi:</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                    {isPart5
                      ? "Điền câu đơn (Single Sentence)"
                      : card.category === "part6"
                      ? "Điền đoạn văn (Text Completion)"
                      : "Đoạn văn đọc hiểu (Comprehension)"}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Phân loại / Chủ điểm:</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">
                    {card.subCategory || "Luyện đề chuẩn"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ĐOẠN VĂN ĐỌC (PASSAGE) - CHỈ CÓ Ở PART 6 & PART 7 */}
          {!isPart5 && activeTab === "passage" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    Nội dung văn bản đọc ({card.category === "part6" ? "Part 6" : "Part 7"})
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                    {passageWordCount} từ
                  </span>
                </div>

                {card.passageTextVi && (
                  <button
                    type="button"
                    onClick={() => setShowBilingualPassage(!showBilingualPassage)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>{showBilingualPassage ? "Ẩn bản dịch" : "Hiện bản dịch song ngữ"}</span>
                  </button>
                )}
              </div>

              {card.passageText ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bản tiếng Anh */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Tiếng Anh (Reading Passage):
                    </span>
                    <div className="whitespace-pre-line font-serif text-slate-800 leading-relaxed text-[13px] bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      {card.passageText}
                    </div>
                  </div>

                  {/* Bản tiếng Việt song ngữ */}
                  {showBilingualPassage && (
                    <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Bản dịch tiếng Việt (Bilingual):
                      </span>
                      <div className="whitespace-pre-line text-emerald-950 leading-relaxed text-[13px] bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
                        {card.passageTextVi || "Chưa có bản dịch tiếng Việt cho đoạn văn này."}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
                  <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
                  <p className="font-semibold text-xs">Chưa có nội dung đoạn văn cho bài này.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Bấm &quot;Chỉnh sửa bài này&quot; để bổ sung đoạn văn đọc.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BỘ CÂU HỎI & ĐÁP ÁN */}
          {activeTab === "questions" && (
            <div className="space-y-4">
              {/* Question pagination pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                {questions.map((q, idx) => {
                  const isSelected = idx === selectedQuestionIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedQuestionIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>Câu {idx + 1}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                          isSelected ? "bg-blue-700 text-blue-100" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        #{q.questionNum || String(100 + idx + 1)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Question Detail */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                {/* Question Prompt */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-extrabold">
                      Câu #{activeQuestion.questionNum || String(100 + selectedQuestionIndex + 1)}
                    </span>
                    {isPart5 && (
                      <span className="text-[11px] text-slate-400 font-semibold">Điền câu đơn</span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {activeQuestion.question || "(Chưa có nội dung câu hỏi)"}
                  </p>

                  {activeQuestion.bilingual && (
                    <p className="text-xs text-slate-500 italic">
                      Dịch nghĩa: {activeQuestion.bilingual}
                    </p>
                  )}
                </div>

                {/* 4 Choices */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                    4 Phương án trả lời &amp; Đáp án đúng:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeQuestion.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === activeQuestion.correctIndex;
                      const letter = String.fromCharCode(65 + optIdx);
                      const optMeaning = activeQuestion.optionMeanings?.[optIdx];

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border transition flex items-start gap-2.5 ${
                            isCorrect
                              ? "bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-2xs"
                              : "bg-slate-50/50 border-slate-200 text-slate-700"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {letter}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-xs font-semibold ${
                                  isCorrect ? "font-bold text-emerald-900" : "text-slate-800"
                                }`}
                              >
                                {opt || `(Phương án ${letter})`}
                              </span>
                              {isCorrect && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md shrink-0">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Đúng</span>
                                </span>
                              )}
                            </div>
                            {optMeaning && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{optMeaning}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                {activeQuestion.explanation && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                      💡 Giải thích chi tiết đáp án:
                    </span>
                    <p className="text-xs text-amber-950 leading-relaxed font-medium">
                      {activeQuestion.explanation}
                    </p>
                  </div>
                )}

                {/* Steps if any */}
                {activeQuestion.steps && activeQuestion.steps.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Các bước tư duy làm bài:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeQuestion.steps.map((st, sIdx) => (
                        <div key={sIdx} className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-xs font-bold text-blue-700 block">{st.title}</span>
                          <span className="text-[11px] text-slate-600 mt-0.5 block">{st.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question Vocabularies */}
                {activeQuestion.vocabList && activeQuestion.vocabList.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Từ vựng trọng tâm câu này ({activeQuestion.vocabList.length} từ):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeQuestion.vocabList.map((v, vIdx) => (
                        <button
                          key={vIdx}
                          type="button"
                          onClick={() => handleOpenVocabDetail(v)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200/90 hover:border-blue-400 text-left transition flex items-center gap-1.5 text-xs cursor-pointer shadow-2xs group hover:scale-102"
                          title="Bấm để xem giải thích chi tiết, phát âm, họ từ và mẹo thi TOEIC"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform"></span>
                          <span className="font-bold text-blue-900 group-hover:text-blue-700">
                            {v.word}
                          </span>
                          {v.pos && (
                            <span className="text-[10px] text-blue-600 font-medium">({v.pos})</span>
                          )}
                          <span className="text-blue-300">•</span>
                          <span className="text-slate-700">{v.meaning}</span>
                          <span className="text-[10px] text-blue-600 opacity-60 group-hover:opacity-100 ml-1 font-semibold flex items-center gap-0.5">
                            🔍 Chi tiết
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TỪ VỰNG CẦN HỌC */}
          {activeTab === "vocab" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">
                  Danh sách từ vựng liên kết ({allVocabularies.length} từ)
                </span>
                <span className="text-[11px] text-slate-500">
                  Học viên có thể tra cứu nhanh khi làm bài
                </span>
              </div>

              {allVocabularies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allVocabularies.map((entry, idx) => {
                    const item = entry.item;
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 hover:border-blue-300 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{item.word}</span>
                              {item.pos && (
                                <span className="px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase">
                                  {item.pos}
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-slate-400">
                                Câu #{entry.qNum}
                              </span>
                            </div>
                            {item.ipa && (
                              <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                                {item.ipa}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenVocabDetail(item)}
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                              title="Xem giải thích chi tiết"
                            >
                              <span>Chi tiết</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => playWordAudio(item.word, "UK")}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                              title="Nghe phát âm UK"
                            >
                              <Volume2 className="w-3 h-3 text-blue-600" />
                              <span>UK</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => playWordAudio(item.word, "US")}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                              title="Nghe phát âm US"
                            >
                              <Volume2 className="w-3 h-3 text-red-600" />
                              <span>US</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 text-xs font-medium text-slate-800">
                          {item.meaning}
                        </div>

                        {item.example && (
                          <div className="text-[11px] text-slate-600 space-y-0.5">
                            <p className="italic text-slate-700">&quot;{item.example.en}&quot;</p>
                            {item.example.vi && (
                              <p className="text-slate-500">{item.example.vi}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
                  <BookMarked className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
                  <p className="font-semibold text-xs">Chưa có từ vựng nào được gán cho bài đọc này.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Bấm &quot;Chỉnh sửa bài này&quot; để bổ sung từ vựng trọng tâm.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* POPUP GIẢI THÍCH CHI TIẾT TỪ VỰNG TRỌNG TÂM KHI BẤM VÀO */}
        {selectedVocabDetail && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150 font-sans max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedVocabDetail(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header Word */}
              <div className="space-y-1.5 pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase tracking-wider">
                    Từ vựng trọng tâm TOEIC
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold uppercase">
                    {selectedVocabDetail.pos}
                  </span>
                </div>

                <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                  {selectedVocabDetail.word}
                </h4>

                {/* Pronunciation & Audio */}
                <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                  <span>UK: {selectedVocabDetail.ukIpa || `/${selectedVocabDetail.word}/`}</span>
                  <button
                    type="button"
                    onClick={() => playWordAudio(selectedVocabDetail.word, "UK")}
                    className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-blue-600 cursor-pointer"
                    title="Nghe phát âm UK"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-slate-300">|</span>
                  <span>US: {selectedVocabDetail.usIpa || `/${selectedVocabDetail.word}/`}</span>
                  <button
                    type="button"
                    onClick={() => playWordAudio(selectedVocabDetail.word, "US")}
                    className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-red-600 cursor-pointer"
                    title="Nghe phát âm US"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Nghĩa trọng tâm */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-200 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Định nghĩa &amp; Ý nghĩa tiếng Việt:
                </span>
                <p className="text-sm font-bold text-blue-950">
                  {selectedVocabDetail.contextMeaning}
                </p>
              </div>

              {/* Mẹo thi TOEIC */}
              {selectedVocabDetail.toeicTip && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mẹo thi TOEIC độc quyền (Bẫy thường gặp):</span>
                  </span>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    {selectedVocabDetail.toeicTip}
                  </p>
                </div>
              )}

              {/* Ví dụ minh họa */}
              {selectedVocabDetail.exampleEn && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Ví dụ ngữ cảnh thực tế:
                  </span>
                  <p className="text-xs font-semibold text-slate-900 italic">
                    &quot;{selectedVocabDetail.exampleEn}&quot;
                  </p>
                  {selectedVocabDetail.exampleVi && (
                    <p className="text-[11px] text-slate-600">
                      {selectedVocabDetail.exampleVi}
                    </p>
                  )}
                </div>
              )}

              {/* Họ từ vựng (Word Family) */}
              {selectedVocabDetail.wordFamily && selectedVocabDetail.wordFamily.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Họ từ vựng (Word Family - Phân biệt từ loại Part 5):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedVocabDetail.wordFamily.map((wf, wfIdx) => (
                      <div
                        key={wfIdx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{wf.word}</span>
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[10px] font-extrabold uppercase text-blue-800">
                            {wf.pos}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{wf.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collocations */}
              {selectedVocabDetail.collocations && selectedVocabDetail.collocations.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Cụm từ Collocations TOEIC hay gặp:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVocabDetail.collocations.map((cl, clIdx) => (
                      <div
                        key={clIdx}
                        className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs"
                      >
                        <span className="font-bold">{cl.phrase}</span>
                        <span className="text-purple-400 mx-1">•</span>
                        <span className="text-[11px] text-purple-700">{cl.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Từ đồng nghĩa & trái nghĩa */}
              {((selectedVocabDetail.synonyms && selectedVocabDetail.synonyms.length > 0) ||
                (selectedVocabDetail.antonyms && selectedVocabDetail.antonyms.length > 0)) && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {selectedVocabDetail.synonyms && selectedVocabDetail.synonyms.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Đồng nghĩa:</span>
                      <p className="text-[11px] text-emerald-950 font-semibold truncate">
                        {selectedVocabDetail.synonyms.map(s => s.word).join(", ")}
                      </p>
                    </div>
                  )}

                  {selectedVocabDetail.antonyms && selectedVocabDetail.antonyms.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-rose-800 uppercase block">Trái nghĩa:</span>
                      <p className="text-[11px] text-rose-950 font-semibold truncate">
                        {selectedVocabDetail.antonyms.map(a => a.word).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedVocabDetail(null)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {onEditCard && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditCard(card);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-blue-600 font-bold text-xs border border-blue-200 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa bài này</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onStartPractice(card);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Vào học / Luyện tập</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
