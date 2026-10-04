"use client";

import React, { useState } from "react";
import { X, Plus, Pencil, Trash2, Volume2, Gamepad2 } from "lucide-react";
import { WordItem, TestItem } from "@/app/admin/content/vocabulary/types";

interface VocabularyModalsProps {
  // Word list modal
  wordListModalTest: TestItem | null;
  onCloseWordList: () => void;
  playAudio: (text: string) => void;
  onOpenAddWord: () => void;
  onOpenEditWord: (w: WordItem) => void;
  onDeleteWordClick: (w: WordItem) => void;
  onStartFlashcardsFromList: (test: TestItem) => void;

  // Flashcards modal
  flashcardModalTest: TestItem | null;
  onCloseFlashcards: () => void;

  // Game modal
  gameModalTest: TestItem | null;
  onCloseGame: () => void;

  // Create / Edit Test modal
  showCreateTestModal: boolean;
  editingTest: TestItem | null;
  onCloseTestForm: () => void;
  onSaveTestForm: (title: string, year: string, category: "2026" | "600_essential" | "2023") => void;

  // Delete Test modal
  deleteTestConfirm: TestItem | null;
  onCloseDeleteTest: () => void;
  onConfirmDeleteTest: () => void;

  // Add / Edit Word modal
  showAddWordModal: boolean;
  editingWord: WordItem | null;
  onCloseWordForm: () => void;
  onSaveWordForm: (w: {
    word: string;
    ipa: string;
    partOfSpeech: string;
    meaning: string;
    example: string;
    level: string;
  }) => void;

  // Delete Word modal
  deleteWordConfirm: WordItem | null;
  onCloseDeleteWord: () => void;
  onConfirmDeleteWord: () => void;
}

export const VocabularyModals: React.FC<VocabularyModalsProps> = ({
  wordListModalTest,
  onCloseWordList,
  playAudio,
  onOpenAddWord,
  onOpenEditWord,
  onDeleteWordClick,
  onStartFlashcardsFromList,
  flashcardModalTest,
  onCloseFlashcards,
  gameModalTest,
  onCloseGame,
  showCreateTestModal,
  editingTest,
  onCloseTestForm,
  onSaveTestForm,
  deleteTestConfirm,
  onCloseDeleteTest,
  onConfirmDeleteTest,
  showAddWordModal,
  editingWord,
  onCloseWordForm,
  onSaveWordForm,
  deleteWordConfirm,
  onCloseDeleteWord,
  onConfirmDeleteWord,
}) => {
  // Flashcard local state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Game local state
  const [gameQuestionIndex, setGameQuestionIndex] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameSelectedOption, setGameSelectedOption] = useState<number | null>(null);
  const [gameAnswerChecked, setGameAnswerChecked] = useState(false);

  // Test form state
  const [testTitle, setTestTitle] = useState("");
  const [testYear, setTestYear] = useState("2026");
  const [testCategory, setTestCategory] = useState<"2026" | "600_essential" | "2023">("2026");

  // Word form state
  const [wordText, setWordText] = useState("");
  const [wordIpa, setWordIpa] = useState("");
  const [wordPos, setWordPos] = useState("Verb");
  const [wordMeaning, setWordMeaning] = useState("");
  const [wordExample, setWordExample] = useState("");
  const [wordLevel, setWordLevel] = useState("B2");

  React.useEffect(() => {
    if (editingTest) {
      setTestTitle(editingTest.title);
      setTestYear(editingTest.year);
      setTestCategory(editingTest.category);
    } else {
      setTestTitle("");
      setTestYear("2026");
      setTestCategory("2026");
    }
  }, [editingTest, showCreateTestModal]);

  React.useEffect(() => {
    if (editingWord) {
      setWordText(editingWord.word);
      setWordIpa(editingWord.ipa);
      setWordPos(editingWord.partOfSpeech);
      setWordMeaning(editingWord.meaning);
      setWordExample(editingWord.example);
      setWordLevel(editingWord.level);
    } else {
      setWordText("");
      setWordIpa("");
      setWordPos("Verb");
      setWordMeaning("");
      setWordExample("");
      setWordLevel("B2");
    }
  }, [editingWord, showAddWordModal]);

  return (
    <>
      {/* MODAL 1: XEM TỪ (WORD LIST MODAL) */}
      {wordListModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[88vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={onCloseWordList}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between gap-4 pr-10">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Danh sách từ vựng
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {wordListModalTest.title} ({wordListModalTest.wordCount} từ)
                </h3>
              </div>
              <button
                type="button"
                onClick={onOpenAddWord}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm từ
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {wordListModalTest.words.map((w, index) => (
                <div key={w.id} className="py-3.5 flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {index + 1}. {w.word}
                      </span>
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {w.ipa}
                      </span>
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {w.partOfSpeech}
                      </span>
                      <button
                        type="button"
                        onClick={() => playAudio(w.word)}
                        className="w-6 h-6 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{w.meaning}</p>
                    <p className="text-xs text-slate-500 italic leading-relaxed">&quot;{w.example}&quot;</p>
                    {w.exampleMeaning && (
                      <p className="text-xs text-blue-700 font-semibold leading-relaxed">👉 {w.exampleMeaning}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      {w.level}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenEditWord(w)}
                      className="p-1 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Chỉnh sửa từ"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteWordClick(w)}
                      className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Xóa từ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onStartFlashcardsFromList(wordListModalTest)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Bắt đầu học Flashcard
              </button>
              <button
                type="button"
                onClick={onCloseWordList}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: HỌC FLASHCARD */}
      {flashcardModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={onCloseFlashcards}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pr-8">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Flashcard • {flashcardModalTest.title}
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full">
                {flashcardIndex + 1} / {flashcardModalTest.words.length}
              </span>
            </div>

            {(() => {
              const currentWord = flashcardModalTest.words[flashcardIndex];
              if (!currentWord) return null;

              return (
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="cursor-pointer transition-all duration-300 min-h-[250px] rounded-3xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/40 via-sky-50/30 to-white p-6 flex flex-col justify-between hover:border-blue-500 hover:shadow-lg shadow-sm"
                >
                  {!isFlipped ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center space-y-3 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">
                          {currentWord.word}
                        </span>
                        <span className="px-2.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
                          {currentWord.partOfSpeech}
                        </span>
                      </div>
                      <div className="text-sm font-mono text-slate-500 bg-white/80 border border-blue-100 px-3 py-1 rounded-lg">
                        {currentWord.ipa}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(currentWord.word);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Nghe phát âm
                      </button>
                      <p className="text-xs text-slate-400 pt-2 font-medium">
                        👆 Chạm vào thẻ để xem nghĩa & ví dụ
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 text-left py-2">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Định nghĩa tiếng Việt:
                        </span>
                        <p className="text-lg font-bold text-blue-900 mt-0.5">
                          {currentWord.meaning}
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Ví dụ ngữ cảnh TOEIC:
                        </span>
                        <div className="mt-1 bg-white/90 p-3 rounded-xl border border-blue-100 shadow-2xs space-y-1.5">
                          <p className="text-xs text-slate-800 leading-relaxed font-medium italic">
                            &quot;{currentWord.example}&quot;
                          </p>
                          {currentWord.exampleMeaning && (
                            <p className="text-xs text-blue-700 leading-relaxed font-semibold border-t border-slate-100 pt-1.5">
                              👉 {currentWord.exampleMeaning}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-center text-xs text-slate-400 pt-1 font-medium">
                        👆 Chạm để lật lại từ tiếng Anh
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                Mức độ ghi nhớ của bạn:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) =>
                      prev < flashcardModalTest.words.length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="flex-1 py-2 px-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Chưa nhớ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) =>
                      prev < flashcardModalTest.words.length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="flex-1 py-2 px-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Tạm nhớ (3 ngày)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) =>
                      prev < flashcardModalTest.words.length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="flex-1 py-2 px-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Nhớ rõ (7 ngày)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: GAME TRẮC NGHIỆM */}
      {gameModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={onCloseGame}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pr-8">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5" />
                Mini-game Ôn Từ Nhanh
              </span>
              <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-full border border-amber-200">
                Điểm: {gameScore}
              </span>
            </div>

            {(() => {
              const currentWord = gameModalTest.words[gameQuestionIndex];
              if (!currentWord) return null;

              const options = [
                currentWord.meaning,
                "Hoãn lại cuộc họp quan trọng của ban giám đốc",
                "Phân tích dữ liệu tài chính quý",
                "Chấp thuận chính sách tiền lương mới",
              ].sort(() => 0.5 - Math.random());

              const handlePickOption = (idx: number) => {
                if (gameAnswerChecked) return;
                setGameSelectedOption(idx);
                setGameAnswerChecked(true);
                if (options[idx] === currentWord.meaning) {
                  setGameScore((prev) => prev + 10);
                }
              };

              return (
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white text-center space-y-1">
                    <span className="text-xs uppercase tracking-wider text-blue-100 font-bold">
                      Từ tiếng Anh:
                    </span>
                    <h3 className="text-2xl font-black">{currentWord.word}</h3>
                    <p className="text-xs font-mono text-blue-200">{currentWord.ipa}</p>
                  </div>

                  <p className="text-xs font-semibold text-slate-500 text-center">
                    Hãy chọn định nghĩa tiếng Việt chính xác nhất:
                  </p>

                  <div className="space-y-2">
                    {options.map((opt, i) => {
                      const isCorrect = opt === currentWord.meaning;
                      const isSelected = gameSelectedOption === i;

                      let btnStyle = "bg-white border-slate-200 hover:bg-slate-50 text-slate-800";
                      if (gameAnswerChecked) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-50 border-rose-500 text-rose-900 font-bold";
                        } else {
                          btnStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={gameAnswerChecked}
                          onClick={() => handlePickOption(i)}
                          className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {gameAnswerChecked && (
                    <button
                      type="button"
                      onClick={() => {
                        setGameAnswerChecked(false);
                        setGameSelectedOption(null);
                        setGameQuestionIndex((prev) =>
                          prev < gameModalTest.words.length - 1 ? prev + 1 : 0
                        );
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                    >
                      Từ tiếp theo →
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL 4: THÊM / SỬA BỘ TỪ VỰNG */}
      {(showCreateTestModal || editingTest) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={onCloseTestForm}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Quản lý nội dung</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {editingTest ? "Sửa bộ từ vựng" : "Thêm bộ từ vựng mới"}
              </h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveTestForm(testTitle, testYear, testCategory);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên bộ từ vựng *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Test 5 (ETS 2026)"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nhãn / Năm</label>
                  <input
                    type="text"
                    placeholder="2026"
                    value={testYear}
                    onChange={(e) => setTestYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phân loại</label>
                  <select
                    value={testCategory}
                    onChange={(e) => setTestCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  >
                    <option value="2026">ETS 2026</option>
                    <option value="600_essential">600 Essential Words</option>
                    <option value="2023">ETS 2023</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onCloseTestForm}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  {editingTest ? "Lưu thay đổi" : "Tạo bộ từ vựng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: XÁC NHẬN XÓA BỘ TỪ VỰNG */}
      {deleteTestConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Xóa bộ từ vựng?</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa bộ &quot;{deleteTestConfirm.title}&quot;? Toàn bộ từ vựng trong bộ này sẽ bị xóa khỏi hệ thống.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onCloseDeleteTest}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={onConfirmDeleteTest}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: THÊM / SỬA TỪ VỰNG */}
      {showAddWordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={onCloseWordForm}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Từ vựng</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {editingWord ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}
              </h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveWordForm({
                  word: wordText,
                  ipa: wordIpa,
                  partOfSpeech: wordPos,
                  meaning: wordMeaning,
                  example: wordExample,
                  level: wordLevel,
                });
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Từ tiếng Anh *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: allocate"
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phiên âm IPA</label>
                  <input
                    type="text"
                    placeholder="/ˈæləkeɪt/"
                    value={wordIpa}
                    onChange={(e) => setWordIpa(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Từ loại</label>
                  <select
                    value={wordPos}
                    onChange={(e) => setWordPos(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  >
                    <option value="Noun">Noun (Danh từ)</option>
                    <option value="Verb">Verb (Động từ)</option>
                    <option value="Adjective">Adjective (Tính từ)</option>
                    <option value="Adverb">Adverb (Trạng từ)</option>
                    <option value="Preposition">Preposition (Giới từ)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nghĩa tiếng Việt *</label>
                <input
                  type="text"
                  required
                  placeholder="Phân bổ, chỉ định ngân sách hoặc nguồn lực"
                  value={wordMeaning}
                  onChange={(e) => setWordMeaning(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ví dụ ngữ cảnh TOEIC</label>
                <textarea
                  rows={2}
                  placeholder="The committee allocated funds for the new research laboratory."
                  value={wordExample}
                  onChange={(e) => setWordExample(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cấp độ CEFR / TOEIC</label>
                <select
                  value={wordLevel}
                  onChange={(e) => setWordLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                >
                  <option value="A2">A2 (300-400 TOEIC)</option>
                  <option value="B1">B1 (450-600 TOEIC)</option>
                  <option value="B2">B2 (650-800 TOEIC)</option>
                  <option value="C1">C1 (850-990 TOEIC)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onCloseWordForm}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  {editingWord ? "Cập nhật từ" : "Thêm vào danh sách"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: XÁC NHẬN XÓA TỪ VỰNG */}
      {deleteWordConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Xóa từ vựng?</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa từ &quot;{deleteWordConfirm.word}&quot; khỏi bộ từ vựng này?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onCloseDeleteWord}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={onConfirmDeleteWord}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
