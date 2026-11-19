import React, { useState } from "react";
import {
  ShoppingBag,
  Bookmark,
  FileText,
  Trash2,
  X,
  Plus,
  Upload,
  Copy,
  Layers,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { DictationCardData, LevelCategoryCardData, DictationQuestion, TranscriptSegment } from "@/app/admin/content/listening/types";
import { uploadListeningMediaFile, buildTranscriptSegmentsFromText } from "@/lib/api/listening";

// --- 1. MODAL GIỎ TỪ VỰNG ---
interface VocabBagModalProps {
  vocabBagModalData: {
    title: string;
    items: { word: string; ipa: string; meaning: string; example?: string }[];
  } | null;
  setVocabBagModalData: (data: null) => void;
  savedVocabBag: string[];
  handleToggleSaveWord: (word: string) => void;
}

export const VocabBagModal: React.FC<VocabBagModalProps> = ({
  vocabBagModalData,
  setVocabBagModalData,
  savedVocabBag,
  handleToggleSaveWord,
}) => {
  if (!vocabBagModalData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">{vocabBagModalData.title}</h3>
              <p className="text-[11px] text-slate-500">Từ vựng trọng điểm cần ghi nhớ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVocabBagModalData(null)}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
          {vocabBagModalData.items.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Chưa có từ vựng nào trong danh mục này.</p>
          ) : (
            vocabBagModalData.items.map((it, idx) => {
              const isSaved = savedVocabBag.includes(it.word);

              return (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/90 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{it.word}</span>
                      <span className="text-[11px] font-mono text-blue-600 font-semibold">{it.ipa}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{it.meaning}</p>
                    {it.example && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">&quot;{it.example}&quot;</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSaveWord(it.word)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                      isSaved
                        ? "bg-amber-100 text-amber-700 border-amber-300"
                        : "bg-white text-slate-400 border-slate-200 hover:text-blue-600"
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-amber-600" : ""}`} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={() => setVocabBagModalData(null)}
          className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

// --- 2. MODAL LÝ THUYẾT & MẸO ---
interface TheoryModalProps {
  theoryModalData: {
    title: string;
    summary: string;
    rules: string[];
  } | null;
  setTheoryModalData: (data: null) => void;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({ theoryModalData, setTheoryModalData }) => {
  if (!theoryModalData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">{theoryModalData.title}</h3>
              <p className="text-[11px] text-slate-500">Mẹo tránh bẫy và quy tắc làm bài</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTheoryModalData(null)}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3.5 text-xs pr-2">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-blue-900 leading-relaxed">
            <p className="font-bold mb-1">Tóm tắt kỹ năng:</p>
            <p>{theoryModalData.summary}</p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Quy tắc & Bẫy thường gặp:
            </p>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-600 leading-relaxed">
              {theoryModalData.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTheoryModalData(null)}
          className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
};

// --- 3. MODAL XÓA TIẾN ĐỘ ---
interface DeleteProgressModalProps {
  deleteConfirmTarget: {
    type: "dictation" | "level";
    id: string;
    title: string;
  } | null;
  setDeleteConfirmTarget: (target: null) => void;
  handleConfirmDeleteProgress: () => void;
}

export const DeleteProgressModal: React.FC<DeleteProgressModalProps> = ({
  deleteConfirmTarget,
  setDeleteConfirmTarget,
  handleConfirmDeleteProgress,
}) => {
  if (!deleteConfirmTarget) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-slate-900">
            Xóa tiến độ {deleteConfirmTarget.title}?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Thao tác này sẽ đặt lại toàn bộ số câu đã làm, số câu đúng/sai về trạng thái &quot;Chưa luyện tập&quot;.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDeleteConfirmTarget(null)}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirmDeleteProgress}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 4. MODAL CÂU CẦN LUYỆN LẠI ---
interface ReviewQuestionsModalProps {
  showReviewQuestionsModal: boolean;
  setShowReviewQuestionsModal: (show: boolean) => void;
  flaggedReviewIds: number[];
  questions: DictationQuestion[];
  handleToggleFlagReview: (qId: number) => void;
}

export const ReviewQuestionsModal: React.FC<ReviewQuestionsModalProps> = ({
  showReviewQuestionsModal,
  setShowReviewQuestionsModal,
  flaggedReviewIds,
  questions,
  handleToggleFlagReview,
}) => {
  if (!showReviewQuestionsModal) return null;
  const flaggedQuestions = questions.filter((question) => flaggedReviewIds.includes(question.id));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Bookmark className="w-5 h-5 fill-amber-600 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Danh sách câu cần luyện lại</h3>
              <p className="text-[11px] text-slate-500">Các câu hỏi bạn đã đánh dấu để ôn tập thêm</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowReviewQuestionsModal(false)}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
          {flaggedQuestions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Hiện không có câu hỏi thực tế nào được đánh dấu cần luyện lại.
            </p>
          ) : (
            flaggedQuestions.map((q) => (
              <div key={q.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    {q.part} • Câu {q.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleFlagReview(q.id)}
                    className="text-xs text-rose-500 hover:underline font-semibold"
                  >
                    Bỏ đánh dấu
                  </button>
                </div>

                <p className="text-sm font-semibold text-slate-900 leading-relaxed">{q.fullTranscript}</p>
                <p className="text-sm text-slate-600 italic leading-relaxed">{q.vietnameseTranslation}</p>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowReviewQuestionsModal(false)}
          className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

// --- 5. MODAL THÊM / SỬA BÀI NGHE CHÉP ---
interface DictationFormModalProps {
  showDictationModal: boolean;
  setShowDictationModal: (show: boolean) => void;
  editingDictationCard: DictationCardData | null;
  dictationFormTitle: string;
  setDictationFormTitle: (val: string) => void;
  dictationFormAudioUrl: string;
  setDictationFormAudioUrl: (val: string) => void;
  dictationFormTranscript: string;
  setDictationFormTranscript: (val: string) => void;
  dictationFormTranslation: string;
  setDictationFormTranslation: (val: string) => void;
  dictationFormTestNum: number;
  setDictationFormTestNum: (val: number) => void;
  dictationFormPart: "Part 1" | "Part 2" | "Part 3" | "Part 4";
  setDictationFormPart: (val: "Part 1" | "Part 2" | "Part 3" | "Part 4") => void;
  dictationFormYear: "2026" | "2024" | "2023" | "2022";
  setDictationFormYear: (val: "2026" | "2024" | "2023" | "2022") => void;
  dictationFormQuestions: number;
  setDictationFormQuestions: (val: number) => void;
  dictationFormContentStatus: "DRAFT" | "PUBLISHED";
  setDictationFormContentStatus: (val: "DRAFT" | "PUBLISHED") => void;
  dictationQuestionsList: DictationQuestion[];
  setDictationQuestionsList: React.Dispatch<React.SetStateAction<DictationQuestion[]>>;
  handleSaveDictation: (e: React.FormEvent, statusOverride?: "DRAFT" | "PUBLISHED") => void;
}

export const DictationFormModal: React.FC<DictationFormModalProps> = ({
  showDictationModal,
  setShowDictationModal,
  editingDictationCard,
  dictationFormTitle,
  setDictationFormTitle,
  dictationFormTestNum,
  setDictationFormTestNum,
  dictationFormPart,
  setDictationFormPart,
  dictationFormYear,
  setDictationFormYear,
  setDictationFormQuestions,
  dictationFormContentStatus,
  setDictationFormContentStatus,
  dictationQuestionsList,
  setDictationQuestionsList,
  handleSaveDictation,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [uploadingField, setUploadingField] = useState<"audio" | "image" | null>(null);

  if (!showDictationModal) return null;

  const safeIdx = Math.min(activeIdx, Math.max(0, dictationQuestionsList.length - 1));
  const currentQ: DictationQuestion = dictationQuestionsList[safeIdx] || {
    id: 1,
    part: dictationFormPart,
    audioUrl: "",
    fullTranscript: "",
    vietnameseTranslation: "",
    explanation: "",
  };

  const updateCurrentQuestion = (patch: Partial<DictationQuestion>) => {
    setDictationQuestionsList((prev) => {
      if (prev.length === 0) {
        return [{ id: 1, part: dictationFormPart, audioUrl: "", fullTranscript: "", vietnameseTranslation: "", explanation: "", ...patch }];
      }
      return prev.map((item, idx) => (idx === safeIdx ? { ...item, ...patch } : item));
    });
  };

  const handleAddQuestion = () => {
    const nextList: DictationQuestion[] = [
      ...dictationQuestionsList,
      {
        id: dictationQuestionsList.length + 1,
        part: dictationFormPart,
        audioUrl: currentQ.audioUrl || "",
        fullTranscript: "",
        vietnameseTranslation: "",
        explanation: "",
      },
    ];
    setDictationQuestionsList(nextList);
    setDictationFormQuestions(nextList.length);
    setActiveIdx(nextList.length - 1);
  };

  const handleDuplicateQuestion = () => {
    const cloned: DictationQuestion = {
      ...currentQ,
      id: dictationQuestionsList.length + 1,
    };
    const nextList = [...dictationQuestionsList];
    nextList.splice(safeIdx + 1, 0, cloned);
    const reindexed = nextList.map((q, idx) => ({ ...q, id: idx + 1 }));
    setDictationQuestionsList(reindexed);
    setDictationFormQuestions(reindexed.length);
    setActiveIdx(safeIdx + 1);
  };

  const handleRemoveQuestion = (idxToRemove: number) => {
    if (dictationQuestionsList.length <= 1) return;
    const nextList = dictationQuestionsList
      .filter((_, idx) => idx !== idxToRemove)
      .map((q, idx) => ({ ...q, id: idx + 1 }));
    setDictationQuestionsList(nextList);
    setDictationFormQuestions(nextList.length);
    setActiveIdx(Math.max(0, Math.min(safeIdx, nextList.length - 1)));
  };

  const handleFileUpload = async (file: File | undefined, kind: "audio" | "image") => {
    if (!file) return;
    setUploadingField(kind);
    setErrorMsg(null);
    try {
      const uploaded = await uploadListeningMediaFile(file);
      if (kind === "audio") {
        updateCurrentQuestion({ audioUrl: uploaded.url });
      } else {
        updateCurrentQuestion({ imageUrl: uploaded.url });
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Tải tệp lên thất bại.");
    } finally {
      setUploadingField(null);
    }
  };

  const triggerSubmitWithStatus = (e: React.FormEvent, targetStatus: "DRAFT" | "PUBLISHED") => {
    e.preventDefault();
    setDictationFormContentStatus(targetStatus);
    if (!dictationFormTitle.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề bài nghe chép chính tả.");
      return;
    }
    if (targetStatus === "PUBLISHED") {
      const invalidIdx = dictationQuestionsList.findIndex(
        (q) => !q.audioUrl?.trim() || !q.fullTranscript?.trim()
      );
      if (invalidIdx !== -1) {
        setActiveIdx(invalidIdx);
        setErrorMsg(`Để xuất bản, câu số ${invalidIdx + 1} cần có đủ Audio URL và Transcript tiếng Anh (hoặc chọn "Lưu bản nháp").`);
        return;
      }
    }
    setErrorMsg(null);
    handleSaveDictation(e, targetStatus);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Listening Studio • Dictation</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {editingDictationCard ? "Chỉnh sửa bài nghe chép chính tả" : "Tạo bài nghe chép chính tả mới"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowDictationModal(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={(e) => triggerSubmitWithStatus(e, dictationFormContentStatus)} className="space-y-3.5 text-xs font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                Tiêu đề bài nghe <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Test 1 - Part 1: Bối cảnh làm việc văn phòng"
                value={dictationFormTitle}
                onChange={(e) => {
                  setDictationFormTitle(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Trạng thái hiển thị</label>
              <select
                value={dictationFormContentStatus}
                onChange={(e) => setDictationFormContentStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold focus:outline-hidden ${
                  dictationFormContentStatus === "PUBLISHED"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-amber-300 bg-amber-50 text-amber-800"
                }`}
              >
                <option value="PUBLISHED">🟢 Đã xuất bản</option>
                <option value="DRAFT">🟡 Bản nháp (Ẩn)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Test số</label>
              <select
                value={dictationFormTestNum}
                onChange={(e) => setDictationFormTestNum(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>Test {num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Phần thi</label>
              <select
                value={dictationFormPart}
                onChange={(e) => setDictationFormPart(e.target.value as "Part 1" | "Part 2" | "Part 3" | "Part 4")}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              >
                <option value="Part 1">Part 1 (Tranh)</option>
                <option value="Part 2">Part 2 (Hỏi đáp)</option>
                <option value="Part 3">Part 3 (Hội thoại)</option>
                <option value="Part 4">Part 4 (Bài nói)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Năm đề thi</label>
              <select
                value={dictationFormYear}
                onChange={(e) => setDictationFormYear(e.target.value as "2026" | "2024" | "2023" | "2022")}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              >
                <option value="2026">ETS 2026</option>
                <option value="2024">ETS 2024</option>
                <option value="2023">ETS 2023</option>
                <option value="2022">ETS 2022</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tổng số câu</label>
              <input
                type="number"
                readOnly
                value={dictationQuestionsList.length}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-blue-700 bg-slate-50"
              />
            </div>
          </div>

          {/* DANH SÁCH CÂU HỎI TRONG BÀI CHÉP CHÍNH TẢ */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 flex-wrap">
                {dictationQuestionsList.map((qItem, idx) => {
                  const isReady = Boolean(qItem.audioUrl?.trim() && qItem.fullTranscript?.trim());
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1 ${
                        idx === safeIdx
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>Câu {idx + 1}</span>
                      {isReady && <CheckCircle2 className={`w-3 h-3 ${idx === safeIdx ? "text-emerald-200" : "text-emerald-600"}`} />}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm câu</span>
                </button>
                <button
                  type="button"
                  onClick={handleDuplicateQuestion}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer"
                  title="Nhân bản câu hiện tại"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Nhân bản</span>
                </button>
              </div>

              {dictationQuestionsList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(safeIdx)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa câu {safeIdx + 1}</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-700 font-bold">
                  Tệp âm thanh Audio MP3/WAV (Câu {safeIdx + 1}) <span className="text-red-500">*</span>
                </label>
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold cursor-pointer transition">
                  {uploadingField === "audio" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingField === "audio" ? "Đang tải lên..." : "Tải file Audio lên"}</span>
                  <input
                    type="file"
                    accept=".mp3,.wav,.ogg,.m4a,audio/*"
                    className="hidden"
                    disabled={uploadingField !== null}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      void handleFileUpload(f, "audio");
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <input
                type="text"
                placeholder="/ets_2024_lc/test_1/audio/test1_q1.mp3 hoặc bấm 'Tải file Audio lên'"
                value={currentQ.audioUrl || ""}
                onChange={(e) => {
                  updateCurrentQuestion({ audioUrl: e.target.value });
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              />
              {currentQ.audioUrl?.trim() && (
                <audio controls src={currentQ.audioUrl} className="w-full h-8 mt-1" preload="metadata" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-700 font-bold">
                  Hình ảnh minh họa (Part 1 / Sơ đồ nếu có)
                </label>
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold cursor-pointer transition">
                  {uploadingField === "image" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingField === "image" ? "Đang tải ảnh..." : "Tải ảnh lên"}</span>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,image/*"
                    className="hidden"
                    disabled={uploadingField !== null}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      void handleFileUpload(f, "image");
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <input
                type="text"
                placeholder="/ets_2024_lc/test_1/images/test1_q1.png hoặc bấm 'Tải ảnh lên'"
                value={currentQ.imageUrl || ""}
                onChange={(e) => updateCurrentQuestion({ imageUrl: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              />
              {currentQ.imageUrl?.trim() && (
                <div className="pt-1">
                  <img
                    src={currentQ.imageUrl}
                    alt="Preview"
                    className="h-24 w-auto rounded-xl border border-slate-200 object-contain bg-white p-1"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Đoạn Transcript Tiếng Anh (Câu {safeIdx + 1}) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Some workers are setting up a conference room for the annual shareholders meeting."
                value={currentQ.fullTranscript || ""}
                onChange={(e) => {
                  updateCurrentQuestion({ fullTranscript: e.target.value });
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Bản dịch nghĩa Tiếng Việt (Câu {safeIdx + 1})</label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Một số công nhân đang sắp xếp phòng hội thảo cho cuộc họp cổ đông thường niên."
                value={currentQ.vietnameseTranslation || ""}
                onChange={(e) => updateCurrentQuestion({ vietnameseTranslation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white resize-none"
              />
            </div>

            {/* CHIA CÂU KÈM TIMESTAMP CHO DICTATION */}
            <div className="rounded-xl border border-blue-200/80 bg-white p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-800 text-xs">
                    ⏱ Chia câu kèm Timestamp ({(currentQ.segments || []).length} đoạn câu)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Tách đoạn nghe thành từng câu nhỏ kèm giây bắt đầu – kết thúc để học viên luyện chép theo từng câu
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const autoSegs = buildTranscriptSegmentsFromText(
                        currentQ.fullTranscript || "",
                        currentQ.vietnameseTranslation || ""
                      );
                      updateCurrentQuestion({ segments: autoSegs });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold cursor-pointer transition"
                  >
                    ⚡ Tự động chia câu &amp; Timestamp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const prevSegs = currentQ.segments || [];
                      const lastEnd = prevSegs.length > 0 ? prevSegs[prevSegs.length - 1].endTime : 0;
                      const nextSeg: TranscriptSegment = {
                        id: prevSegs.length + 1,
                        startTime: lastEnd,
                        endTime: Math.round((lastEnd + 3.0) * 10) / 10,
                        text: "",
                        translation: "",
                      };
                      updateCurrentQuestion({ segments: [...prevSegs, nextSeg] });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold cursor-pointer transition"
                  >
                    + Thêm đoạn
                  </button>
                </div>
              </div>

              {(currentQ.segments || []).length > 0 && (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {(currentQ.segments || []).map((seg, sIdx) => (
                    <div
                      key={seg.id || sIdx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">
                            Đoạn {sIdx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-500">Từ (s):</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={seg.startTime}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                const next = (currentQ.segments || []).map((item, i) =>
                                  i === sIdx ? { ...item, startTime: val } : item
                                );
                                updateCurrentQuestion({ segments: next });
                              }}
                              className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-500">Đến (s):</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={seg.endTime}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                const next = (currentQ.segments || []).map((item, i) =>
                                  i === sIdx ? { ...item, endTime: val } : item
                                );
                                updateCurrentQuestion({ segments: next });
                              }}
                              className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const next = (currentQ.segments || [])
                              .filter((_, i) => i !== sIdx)
                              .map((item, i) => ({ ...item, id: i + 1 }));
                            updateCurrentQuestion({ segments: next });
                          }}
                          className="text-rose-500 hover:text-rose-700 text-[11px] font-bold cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Câu tiếng Anh của đoạn này..."
                        value={seg.text}
                        onChange={(e) => {
                          const next = (currentQ.segments || []).map((item, i) =>
                            i === sIdx ? { ...item, text: e.target.value } : item
                          );
                          updateCurrentQuestion({ segments: next });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Dịch nghĩa tiếng Việt của đoạn này (tùy chọn)..."
                        value={seg.translation || ""}
                        onChange={(e) => {
                          const next = (currentQ.segments || []).map((item, i) =>
                            i === sIdx ? { ...item, translation: e.target.value } : item
                          );
                          updateCurrentQuestion({ segments: next });
                        }}
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-600"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              Tổng cộng <strong>{dictationQuestionsList.length} câu</strong> trong bài nghe chép này
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDictationModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={(e) => triggerSubmitWithStatus(e, "DRAFT")}
                className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold cursor-pointer"
              >
                📝 Lưu bản nháp
              </button>
              <button
                type="button"
                onClick={(e) => triggerSubmitWithStatus(e, "PUBLISHED")}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                🚀 {editingDictationCard ? "Lưu & Xuất bản" : "Tạo & Xuất bản"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 6. MODAL XÁC NHẬN XÓA BÀI NGHE CHÉP ---
interface DeleteDictationModalProps {
  deleteDictationConfirm: DictationCardData | null;
  setDeleteDictationConfirm: (card: DictationCardData | null) => void;
  handleConfirmDeleteDictationCard: () => void;
}

export const DeleteDictationModal: React.FC<DeleteDictationModalProps> = ({
  deleteDictationConfirm,
  setDeleteDictationConfirm,
  handleConfirmDeleteDictationCard,
}) => {
  if (!deleteDictationConfirm) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-slate-900">Xóa bài nghe chép?</h3>
          <p className="text-xs text-slate-500">
            Bạn có chắc chắn muốn xóa bài {deleteDictationConfirm.part} (Test {deleteDictationConfirm.testNumber}) năm {deleteDictationConfirm.year}? Dữ liệu sẽ không thể khôi phục.
          </p>
        </div>
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => setDeleteDictationConfirm(null)}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirmDeleteDictationCard}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Xóa ngay
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 7. MODAL THÊM / SỬA CHỦ ĐIỂM ---
interface LevelFormModalProps {
  showLevelModal: boolean;
  setShowLevelModal: (show: boolean) => void;
  editingLevelCard: LevelCategoryCardData | null;
  levelFormPart: "Part 1" | "Part 2" | "Part 3" | "Part 4";
  setLevelFormPart: (part: "Part 1" | "Part 2" | "Part 3" | "Part 4") => void;
  levelFormTitle: string;
  setLevelFormTitle: (title: string) => void;
  levelFormQuestions: number;
  setLevelFormQuestions: (num: number) => void;
  levelFormTheory: string;
  setLevelFormTheory: (theory: string) => void;
  levelFormRules: string;
  setLevelFormRules: (rules: string) => void;
  levelFormContentStatus: "DRAFT" | "PUBLISHED";
  setLevelFormContentStatus: (status: "DRAFT" | "PUBLISHED") => void;
  levelFormQuestionsList: DictationQuestion[];
  setLevelFormQuestionsList: React.Dispatch<React.SetStateAction<DictationQuestion[]>>;
  handleSaveLevel: (e: React.FormEvent, statusOverride?: "DRAFT" | "PUBLISHED") => void;
}

export const LevelFormModal: React.FC<LevelFormModalProps> = ({
  showLevelModal,
  setShowLevelModal,
  editingLevelCard,
  levelFormPart,
  setLevelFormPart,
  levelFormTitle,
  setLevelFormTitle,
  setLevelFormQuestions,
  levelFormTheory,
  setLevelFormTheory,
  levelFormRules,
  setLevelFormRules,
  levelFormContentStatus,
  setLevelFormContentStatus,
  levelFormQuestionsList,
  setLevelFormQuestionsList,
  handleSaveLevel,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [uploadingField, setUploadingField] = useState<"audio" | "image" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!showLevelModal) return null;

  const safeIdx = Math.min(activeIdx, Math.max(0, levelFormQuestionsList.length - 1));
  const currentQ: DictationQuestion = levelFormQuestionsList[safeIdx] || {
    id: 1,
    part: levelFormPart,
    audioUrl: "",
    fullTranscript: "",
    vietnameseTranslation: "",
    options: { A: "", B: "", C: "", D: "" },
    optionTranslations: { A: "", B: "", C: "", D: "" },
    correctAnswer: "A",
    explanation: "",
    trapNote: "",
  };

  const updateCurrentQuestion = (patch: Partial<DictationQuestion>) => {
    setLevelFormQuestionsList((prev) => {
      if (prev.length === 0) {
        return [{
          id: 1,
          part: levelFormPart,
          audioUrl: "",
          fullTranscript: "",
          vietnameseTranslation: "",
          options: { A: "", B: "", C: "", D: "" },
          optionTranslations: { A: "", B: "", C: "", D: "" },
          correctAnswer: "A",
          explanation: "",
          trapNote: "",
          ...patch,
        }];
      }
      return prev.map((item, idx) => (idx === safeIdx ? { ...item, ...patch } : item));
    });
  };

  const handleAddQuestion = () => {
    const nextList: DictationQuestion[] = [
      ...levelFormQuestionsList,
      {
        id: levelFormQuestionsList.length + 1,
        part: levelFormPart,
        audioUrl: currentQ.audioUrl || "",
        fullTranscript: levelFormPart === "Part 3" || levelFormPart === "Part 4" ? currentQ.fullTranscript || "" : "",
        vietnameseTranslation: levelFormPart === "Part 3" || levelFormPart === "Part 4" ? currentQ.vietnameseTranslation || "" : "",
        question: "",
        options: { A: "", B: "", C: "", D: "" },
        optionTranslations: { A: "", B: "", C: "", D: "" },
        correctAnswer: "A",
        explanation: "",
        trapNote: "",
      },
    ];
    setLevelFormQuestionsList(nextList);
    setLevelFormQuestions(nextList.length);
    setActiveIdx(nextList.length - 1);
  };

  const handleAddGroupOfThree = () => {
    const sharedAudio = currentQ.audioUrl || "";
    const sharedTranscript = currentQ.fullTranscript || "";
    const sharedTranslation = currentQ.vietnameseTranslation || "";
    const baseId = levelFormQuestionsList.length;
    const newThree: DictationQuestion[] = [1, 2, 3].map((offset) => ({
      id: baseId + offset,
      part: levelFormPart,
      audioUrl: sharedAudio,
      fullTranscript: sharedTranscript,
      vietnameseTranslation: sharedTranslation,
      question: "",
      options: { A: "", B: "", C: "", D: "" },
      optionTranslations: { A: "", B: "", C: "", D: "" },
      correctAnswer: "A",
      explanation: "",
      trapNote: "",
    }));
    const nextList = [...levelFormQuestionsList, ...newThree];
    setLevelFormQuestionsList(nextList);
    setLevelFormQuestions(nextList.length);
    setActiveIdx(baseId);
  };

  const handleDuplicateQuestion = () => {
    const cloned: DictationQuestion = {
      ...currentQ,
      id: levelFormQuestionsList.length + 1,
      options: { ...(currentQ.options || { A: "", B: "", C: "", D: "" }) },
      optionTranslations: { ...(currentQ.optionTranslations || { A: "", B: "", C: "", D: "" }) },
    };
    const nextList = [...levelFormQuestionsList];
    nextList.splice(safeIdx + 1, 0, cloned);
    const reindexed = nextList.map((q, idx) => ({ ...q, id: idx + 1 }));
    setLevelFormQuestionsList(reindexed);
    setLevelFormQuestions(reindexed.length);
    setActiveIdx(safeIdx + 1);
  };

  const handleApplyAudioToGroupOfThree = () => {
    const groupStart = Math.floor(safeIdx / 3) * 3;
    setLevelFormQuestionsList((prev) =>
      prev.map((q, idx) =>
        idx >= groupStart && idx < groupStart + 3
          ? {
              ...q,
              audioUrl: currentQ.audioUrl,
              fullTranscript: currentQ.fullTranscript,
              vietnameseTranslation: currentQ.vietnameseTranslation,
            }
          : q
      )
    );
  };

  const handleRemoveQuestion = (idxToRemove: number) => {
    if (levelFormQuestionsList.length <= 1) return;
    const nextList = levelFormQuestionsList
      .filter((_, idx) => idx !== idxToRemove)
      .map((q, idx) => ({ ...q, id: idx + 1 }));
    setLevelFormQuestionsList(nextList);
    setLevelFormQuestions(nextList.length);
    setActiveIdx(Math.max(0, Math.min(safeIdx, nextList.length - 1)));
  };

  const handleFileUpload = async (file: File | undefined, kind: "audio" | "image") => {
    if (!file) return;
    setUploadingField(kind);
    setErrorMsg(null);
    try {
      const uploaded = await uploadListeningMediaFile(file);
      if (kind === "audio") {
        updateCurrentQuestion({ audioUrl: uploaded.url });
      } else {
        updateCurrentQuestion({ imageUrl: uploaded.url });
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Tải tệp lên thất bại.");
    } finally {
      setUploadingField(null);
    }
  };

  const triggerSubmitWithStatus = (e: React.FormEvent, targetStatus: "DRAFT" | "PUBLISHED") => {
    e.preventDefault();
    setLevelFormContentStatus(targetStatus);
    if (!levelFormTitle.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề chủ điểm luyện nghe.");
      return;
    }
    if (targetStatus === "PUBLISHED") {
      const requiredKeys = levelFormPart === "Part 2" ? ["A", "B", "C"] : ["A", "B", "C", "D"];
      const invalidIdx = levelFormQuestionsList.findIndex((q) => {
        const opts = q.options || {};
        return !q.audioUrl?.trim() || !q.fullTranscript?.trim() || !requiredKeys.every((k) => opts[k]?.trim());
      });
      if (invalidIdx !== -1) {
        setActiveIdx(invalidIdx);
        setErrorMsg(`Để xuất bản, câu số ${invalidIdx + 1} cần có đủ Audio, Transcript và các đáp án ${requiredKeys.join(", ")} (hoặc bấm "Lưu bản nháp").`);
        return;
      }
    }
    setErrorMsg(null);
    handleSaveLevel(e, targetStatus);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{levelFormPart}</span>
            <h3 className="text-lg font-bold text-slate-900">
              {editingLevelCard ? "Chỉnh sửa chủ điểm" : "Thêm chủ điểm luyện nghe mới"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowLevelModal(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={(e) => triggerSubmitWithStatus(e, levelFormContentStatus)} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề chủ điểm *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Level 5 – 450–495 hoặc Tranh phong cảnh"
                value={levelFormTitle}
                onChange={(e) => setLevelFormTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái hiển thị</label>
              <select
                value={levelFormContentStatus}
                onChange={(e) => setLevelFormContentStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold focus:outline-hidden ${
                  levelFormContentStatus === "PUBLISHED"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-amber-300 bg-amber-50 text-amber-800"
                }`}
              >
                <option value="PUBLISHED">🟢 Đã xuất bản</option>
                <option value="DRAFT">🟡 Bản nháp (Ẩn)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phần thi</label>
              <select
                value={levelFormPart}
                onChange={(e) => setLevelFormPart(e.target.value as "Part 1" | "Part 2" | "Part 3" | "Part 4")}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              >
                <option value="Part 1">Part 1</option>
                <option value="Part 2">Part 2</option>
                <option value="Part 3">Part 3</option>
                <option value="Part 4">Part 4</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tổng số câu hỏi</label>
              <input
                type="number"
                readOnly
                value={levelFormQuestionsList.length}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-blue-700 bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lý thuyết kỹ năng / Tóm tắt</label>
            <textarea
              rows={2}
              placeholder="Mô tả kỹ năng cần thiết để xử lý dạng câu hỏi này..."
              value={levelFormTheory}
              onChange={(e) => setLevelFormTheory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quy tắc / Mẹo làm bài (mỗi dòng 1 mẹo)</label>
            <textarea
              rows={2}
              placeholder="Bẫy từ vựng cần tránh...&#10;Cấu trúc thường gặp..."
              value={levelFormRules}
              onChange={(e) => setLevelFormRules(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 resize-none"
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 flex-wrap">
                {levelFormQuestionsList.map((qItem, idx) => {
                  const reqKeys = levelFormPart === "Part 2" ? ["A", "B", "C"] : ["A", "B", "C", "D"];
                  const isReady = Boolean(
                    qItem.audioUrl?.trim() &&
                      qItem.fullTranscript?.trim() &&
                      reqKeys.every((k) => qItem.options?.[k]?.trim())
                  );
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1 ${
                        idx === safeIdx
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>Câu {idx + 1}</span>
                      {isReady && <CheckCircle2 className={`w-3 h-3 ${idx === safeIdx ? "text-emerald-200" : "text-emerald-600"}`} />}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm câu</span>
                </button>
                {(levelFormPart === "Part 3" || levelFormPart === "Part 4") && (
                  <button
                    type="button"
                    onClick={handleAddGroupOfThree}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300 text-xs font-bold transition cursor-pointer"
                    title="Thêm nhanh nhóm 3 câu dùng chung Audio hội thoại/bài nói"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>+ Cụm 3 câu</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDuplicateQuestion}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer"
                  title="Nhân bản câu hiện tại"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Nhân bản</span>
                </button>
              </div>

              {levelFormQuestionsList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(safeIdx)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa câu {safeIdx + 1}</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Audio URL (Câu {safeIdx + 1}) *
                </label>
                <div className="flex items-center gap-2">
                  {(levelFormPart === "Part 3" || levelFormPart === "Part 4") && levelFormQuestionsList.length >= 3 && (
                    <button
                      type="button"
                      onClick={handleApplyAudioToGroupOfThree}
                      className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-bold cursor-pointer transition"
                      title="Sao chép Audio & Transcript của câu này sang 3 câu trong cùng nhóm hội thoại"
                    >
                      🔗 Đồng bộ cho nhóm 3 câu ({Math.floor(safeIdx / 3) * 3 + 1}–{Math.min(levelFormQuestionsList.length, Math.floor(safeIdx / 3) * 3 + 3)})
                    </button>
                  )}
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold cursor-pointer transition">
                    {uploadingField === "audio" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{uploadingField === "audio" ? "Đang tải lên..." : "Tải file Audio lên"}</span>
                    <input
                      type="file"
                      accept=".mp3,.wav,.ogg,.m4a,audio/*"
                      className="hidden"
                      disabled={uploadingField !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        void handleFileUpload(f, "audio");
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
              <input
                type="text"
                placeholder="/ets_2024_lc/test_1/audio/test1_q1.mp3 hoặc bấm 'Tải file Audio lên'"
                value={currentQ.audioUrl || ""}
                onChange={(e) => updateCurrentQuestion({ audioUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
              />
              {currentQ.audioUrl?.trim() && (
                <audio controls src={currentQ.audioUrl} className="w-full h-8 mt-1" preload="metadata" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Image URL (Part 1 / Bảng biểu nếu có)
                </label>
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold cursor-pointer transition">
                  {uploadingField === "image" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingField === "image" ? "Đang tải ảnh..." : "Tải ảnh lên"}</span>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,image/*"
                    className="hidden"
                    disabled={uploadingField !== null}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      void handleFileUpload(f, "image");
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <input
                type="text"
                placeholder="/ets_2024_lc/test_1/images/test1_q1.png hoặc bấm 'Tải ảnh lên'"
                value={currentQ.imageUrl || ""}
                onChange={(e) => updateCurrentQuestion({ imageUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
              />
              {currentQ.imageUrl?.trim() && (
                <div className="pt-1">
                  <img
                    src={currentQ.imageUrl}
                    alt="Preview"
                    className="h-24 w-auto rounded-xl border border-slate-200 object-contain bg-white p-1"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Transcript (Câu {safeIdx + 1}) *</label>
              <textarea
                rows={2}
                value={currentQ.fullTranscript || ""}
                onChange={(e) => updateCurrentQuestion({ fullTranscript: e.target.value })}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Câu dẫn (Câu {safeIdx + 1})</label>
              <input
                type="text"
                value={currentQ.question || ""}
                onChange={(e) => updateCurrentQuestion({ question: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {((levelFormPart === "Part 2" ? ["A", "B", "C"] : ["A", "B", "C", "D"]) as readonly ("A" | "B" | "C" | "D")[]).map((key) => (
                <div key={key} className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <label className="block text-xs font-bold text-slate-700">Lựa chọn {key} *</label>
                  <input
                    type="text"
                    placeholder={`Nội dung tiếng Anh đáp án ${key}`}
                    value={currentQ.options?.[key] || ""}
                    onChange={(e) =>
                      updateCurrentQuestion({
                        options: { ...(currentQ.options || { A: "", B: "", C: "", D: "" }), [key]: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    placeholder={`Dịch nghĩa tiếng Việt đáp án ${key} (tùy chọn)`}
                    value={currentQ.optionTranslations?.[key] || ""}
                    onChange={(e) =>
                      updateCurrentQuestion({
                        optionTranslations: {
                          ...(currentQ.optionTranslations || { A: "", B: "", C: "", D: "" }),
                          [key]: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Đáp án đúng *</label>
                <select
                  value={currentQ.correctAnswer || "A"}
                  onChange={(e) =>
                    updateCurrentQuestion({
                      correctAnswer: e.target.value as DictationQuestion["correctAnswer"],
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700"
                >
                  {(levelFormPart === "Part 2" ? ["A", "B", "C"] : ["A", "B", "C", "D"]).map((answer) => <option key={answer}>{answer}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Dịch nghĩa toàn bài / lời thoại</label>
                <input
                  type="text"
                  value={currentQ.vietnameseTranslation || ""}
                  onChange={(e) => updateCurrentQuestion({ vietnameseTranslation: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Giải thích chi tiết</label>
                <textarea
                  rows={2}
                  value={currentQ.explanation || ""}
                  onChange={(e) => updateCurrentQuestion({ explanation: e.target.value })}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Bẫy đề thi cần tránh (Trap Note)</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Bẫy đồng âm 'coffee' vs 'copy'..."
                  value={currentQ.trapNote || ""}
                  onChange={(e) => updateCurrentQuestion({ trapNote: e.target.value })}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              Tổng cộng <strong>{levelFormQuestionsList.length} câu hỏi</strong> trong chủ điểm này
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLevelModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={(e) => triggerSubmitWithStatus(e, "DRAFT")}
                className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold cursor-pointer"
              >
                📝 Lưu bản nháp
              </button>
              <button
                type="button"
                onClick={(e) => triggerSubmitWithStatus(e, "PUBLISHED")}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                🚀 {editingLevelCard ? "Lưu & Xuất bản" : "Tạo & Xuất bản"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 8. MODAL XÁC NHẬN XÓA CHỦ ĐIỂM ---
interface DeleteLevelModalProps {
  deleteLevelConfirm: LevelCategoryCardData | null;
  setDeleteLevelConfirm: (card: LevelCategoryCardData | null) => void;
  handleConfirmDeleteLevelCard: () => void;
}

export const DeleteLevelModal: React.FC<DeleteLevelModalProps> = ({
  deleteLevelConfirm,
  setDeleteLevelConfirm,
  handleConfirmDeleteLevelCard,
}) => {
  if (!deleteLevelConfirm) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-slate-900">Xóa chủ điểm luyện nghe?</h3>
          <p className="text-xs text-slate-500">
            Bạn có chắc chắn muốn xóa &quot;{deleteLevelConfirm.title}&quot;? Mọi tiến độ và câu hỏi trong chủ điểm này sẽ bị xóa.
          </p>
        </div>
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => setDeleteLevelConfirm(null)}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirmDeleteLevelCard}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Xóa ngay
          </button>
        </div>
      </div>
    </div>
  );
};
