import React from "react";
import { ShoppingBag, Bookmark, FileText, Trash2, X } from "lucide-react";
import { DictationCardData, LevelCategoryCardData, DictationQuestion } from "@/app/admin/content/listening/types";
import { SAMPLE_DICTATION_QUESTIONS } from "@/app/admin/content/listening/mockData";

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

        <div className="flex-1 overflow-y-auto space-y-3">
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

        <div className="flex-1 overflow-y-auto space-y-3.5 text-xs">
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
  handleToggleFlagReview: (qId: number) => void;
}

export const ReviewQuestionsModal: React.FC<ReviewQuestionsModalProps> = ({
  showReviewQuestionsModal,
  setShowReviewQuestionsModal,
  flaggedReviewIds,
  handleToggleFlagReview,
}) => {
  if (!showReviewQuestionsModal) return null;

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

        <div className="flex-1 overflow-y-auto space-y-3">
          {flaggedReviewIds.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Hiện không có câu nào được đánh dấu cần luyện lại.
            </p>
          ) : (
            SAMPLE_DICTATION_QUESTIONS.filter((q) => flaggedReviewIds.includes(q.id)).map((q) => (
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

                <p className="text-xs font-semibold text-slate-800">{q.fullTranscript}</p>
                <p className="text-xs text-slate-500 italic">{q.vietnameseTranslation}</p>
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
  dictationFormTestNum: number;
  setDictationFormTestNum: (val: number) => void;
  dictationFormPart: "Part 1" | "Part 2" | "Part 3" | "Part 4";
  setDictationFormPart: (val: "Part 1" | "Part 2" | "Part 3" | "Part 4") => void;
  dictationFormYear: "2026" | "2024" | "2023" | "2022";
  setDictationFormYear: (val: "2026" | "2024" | "2023" | "2022") => void;
  dictationFormQuestions: number;
  setDictationFormQuestions: (val: number) => void;
  handleSaveDictation: (e: React.FormEvent) => void;
}

export const DictationFormModal: React.FC<DictationFormModalProps> = ({
  showDictationModal,
  setShowDictationModal,
  editingDictationCard,
  dictationFormTestNum,
  setDictationFormTestNum,
  dictationFormPart,
  setDictationFormPart,
  dictationFormYear,
  setDictationFormYear,
  dictationFormQuestions,
  setDictationFormQuestions,
  handleSaveDictation,
}) => {
  if (!showDictationModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Quản lý nội dung</span>
            <h3 className="text-lg font-bold text-slate-900">
              {editingDictationCard ? "Chỉnh sửa bài nghe" : "Thêm bài nghe chép mới"}
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

        <form onSubmit={handleSaveDictation} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Test số</label>
              <select
                value={dictationFormTestNum}
                onChange={(e) => setDictationFormTestNum(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              >
                <option value={1}>Test 1</option>
                <option value={2}>Test 2</option>
                <option value={3}>Test 3</option>
                <option value={4}>Test 4</option>
                <option value={5}>Test 5</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phần thi (Part)</label>
              <select
                value={dictationFormPart}
                onChange={(e) => setDictationFormPart(e.target.value as "Part 1" | "Part 2" | "Part 3" | "Part 4")}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              >
                <option value="Part 1">Part 1 (Mô tả tranh)</option>
                <option value="Part 2">Part 2 (Hỏi & Đáp)</option>
                <option value="Part 3">Part 3 (Hội thoại)</option>
                <option value="Part 4">Part 4 (Bài nói)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Năm đề thi</label>
              <select
                value={dictationFormYear}
                onChange={(e) => setDictationFormYear(e.target.value as "2026" | "2024" | "2023" | "2022")}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              >
                <option value="2026">ETS 2026</option>
                <option value="2024">ETS 2024</option>
                <option value="2023">ETS 2023</option>
                <option value="2022">ETS 2022</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số câu hỏi</label>
              <input
                type="number"
                min={1}
                max={200}
                value={dictationFormQuestions}
                onChange={(e) => setDictationFormQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowDictationModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {editingDictationCard ? "Lưu thay đổi" : "Tạo bài nghe"}
            </button>
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
  handleSaveLevel: (e: React.FormEvent) => void;
}

export const LevelFormModal: React.FC<LevelFormModalProps> = ({
  showLevelModal,
  setShowLevelModal,
  editingLevelCard,
  levelFormPart,
  setLevelFormPart,
  levelFormTitle,
  setLevelFormTitle,
  levelFormQuestions,
  setLevelFormQuestions,
  levelFormTheory,
  setLevelFormTheory,
  levelFormRules,
  setLevelFormRules,
  handleSaveLevel,
}) => {
  if (!showLevelModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSaveLevel} className="space-y-3.5">
          <div>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Số câu hỏi</label>
              <input
                type="number"
                min={1}
                value={levelFormQuestions}
                onChange={(e) => setLevelFormQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
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
              rows={3}
              placeholder="Bẫy từ vựng cần tránh...&#10;Cấu trúc thường gặp..."
              value={levelFormRules}
              onChange={(e) => setLevelFormRules(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowLevelModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {editingLevelCard ? "Lưu thay đổi" : "Tạo chủ điểm"}
            </button>
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
