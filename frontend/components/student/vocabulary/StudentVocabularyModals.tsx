"use client";

import React, { useState } from "react";
import { X, Volume2, Gamepad2, ChevronLeft, ChevronRight, RotateCcw, BookOpen } from "lucide-react";
import { WordItem, TestItem } from "@/app/admin/content/vocabulary/types";

interface StudentVocabularyModalsProps {
  // Word list modal
  wordListModalTest: TestItem | null;
  onCloseWordList: () => void;
  playAudio: (text: string) => void;
  onStartFlashcardsFromList: (test: TestItem) => void;
  onStartGameFromList: (test: TestItem) => void;

  // Flashcards modal
  flashcardModalTest: TestItem | null;
  onCloseFlashcards: () => void;

  // Game modal
  gameModalTest: TestItem | null;
  onCloseGame: () => void;
}

export const StudentVocabularyModals: React.FC<StudentVocabularyModalsProps> = ({
  wordListModalTest,
  onCloseWordList,
  playAudio,
  onStartFlashcardsFromList,
  onStartGameFromList,
  flashcardModalTest,
  onCloseFlashcards,
  gameModalTest,
  onCloseGame,
}) => {
  // Flashcard local state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Game local state
  const [gameQuestionIndex, setGameQuestionIndex] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameSelectedOption, setGameSelectedOption] = useState<number | null>(null);
  const [gameAnswerChecked, setGameAnswerChecked] = useState(false);

  // Reset flashcard state when opened
  const [prevFlashcardTest, setPrevFlashcardTest] = useState(flashcardModalTest);
  if (flashcardModalTest !== prevFlashcardTest) {
    setPrevFlashcardTest(flashcardModalTest);
    if (flashcardModalTest) {
      setFlashcardIndex(0);
      setIsFlipped(false);
    }
  }

  // Reset game state when opened
  const [prevGameTest, setPrevGameTest] = useState(gameModalTest);
  if (gameModalTest !== prevGameTest) {
    setPrevGameTest(gameModalTest);
    if (gameModalTest) {
      setGameQuestionIndex(0);
      setGameScore(0);
      setGameSelectedOption(null);
      setGameAnswerChecked(false);
    }
  }

  return (
    <>
      {/* MODAL 1: DANH SÁCH TỪ VỰNG & PHÁT ÂM (VIEW ONLY CHO HỌC VIÊN) */}
      {wordListModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[88vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-xs z-10 -mt-2 pt-2">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {wordListModalTest.year} • {wordListModalTest.category === "600_essential" ? "600 Từ thiết yếu" : "ETS Test"}
                </span>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {wordListModalTest.title}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {(wordListModalTest.words || []).length} từ vựng
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseWordList}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(!wordListModalTest.words || wordListModalTest.words.length === 0) ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">Bộ từ này hiện chưa có từ vựng nào.</p>
                <p className="text-xs text-slate-400 mt-1">Vui lòng quay lại sau hoặc chọn bộ từ khác.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {wordListModalTest.words.map((w: WordItem, index: number) => (
                  <div key={w.id} className="py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
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
                          className="w-6 h-6 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Nghe phát âm chuẩn US"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{w.meaning}</p>
                      <p className="text-xs text-slate-500 italic leading-relaxed">&quot;{w.example}&quot;</p>
                      {w.exampleMeaning && (
                        <p className="text-xs text-blue-700 font-semibold leading-relaxed">👉 {w.exampleMeaning}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                        {w.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100 sticky bottom-0 bg-white/95 backdrop-blur-xs -mb-2 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!wordListModalTest.words || wordListModalTest.words.length === 0}
                  onClick={() => onStartFlashcardsFromList(wordListModalTest)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Lật Flashcard
                </button>
                <button
                  type="button"
                  disabled={!wordListModalTest.words || wordListModalTest.words.length === 0}
                  onClick={() => onStartGameFromList(wordListModalTest)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  Mini-game
                </button>
              </div>

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

      {/* MODAL 2: HỌC FLASHCARD GHI NHỚ CHỦ ĐỘNG */}
      {flashcardModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
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
                {flashcardIndex + 1} / {(flashcardModalTest.words || []).length}
              </span>
            </div>

            {(() => {
              const wordsList = flashcardModalTest.words || [];
              if (wordsList.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Bộ từ này hiện chưa có từ vựng nào.</p>
                  </div>
                );
              }
              const currentWord = wordsList[flashcardIndex];
              if (!currentWord) return null;

              return (
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="cursor-pointer transition-all duration-300 min-h-[260px] rounded-3xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/40 via-sky-50/30 to-white p-6 flex flex-col justify-between hover:border-blue-500 hover:shadow-lg shadow-xs"
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
                      <span className="font-mono text-sm text-slate-500 bg-white/80 px-3 py-1 rounded-full border border-slate-200">
                        {currentWord.ipa}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(currentWord.word);
                        }}
                        className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-transform active:scale-95 shadow-md cursor-pointer"
                        title="Phát âm"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <p className="text-xs text-slate-400 font-medium pt-2">
                        💡 Chạm vào thẻ để lật xem nghĩa tiếng Việt & ví dụ
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-center space-y-3 py-4 animate-in fade-in">
                      <span className="text-xs uppercase font-extrabold text-blue-600 tracking-wider">
                        Định nghĩa & Ngữ cảnh
                      </span>
                      <h4 className="text-2xl font-bold text-slate-900">
                        {currentWord.meaning}
                      </h4>
                      <p className="text-xs text-slate-600 italic bg-white/80 p-3 rounded-2xl border border-slate-100 max-w-xs leading-relaxed">
                        &quot;{currentWord.example}&quot;
                      </p>
                      {currentWord.exampleMeaning && (
                        <p className="text-xs text-blue-700 font-semibold max-w-xs">
                          👉 {currentWord.exampleMeaning}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 pt-1">
                        Chạm để quay lại mặt trước
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                    <span className="font-medium text-slate-500">Mức độ: {currentWord.level}</span>
                    <span className="text-blue-600 font-semibold">Thẻ ghi nhớ TOEIC</span>
                  </div>
                </div>
              );
            })()}

            {/* Điều hướng thẻ */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={flashcardIndex === 0}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Từ trước
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) =>
                      Math.min((flashcardModalTest.words || []).length - 1, prev + 1)
                    );
                  }}
                  disabled={flashcardIndex >= (flashcardModalTest.words || []).length - 1}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
                >
                  Từ tiếp theo <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) =>
                      prev < (flashcardModalTest.words || []).length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="flex-1 py-2 px-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer text-center"
                >
                  Chưa nhớ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) =>
                      prev < (flashcardModalTest.words || []).length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="flex-1 py-2 px-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition cursor-pointer text-center"
                >
                  Tạm nhớ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) =>
                      prev < (flashcardModalTest.words || []).length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="flex-1 py-2 px-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition cursor-pointer text-center"
                >
                  Đã thuộc ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MINI-GAME TRẮC NGHIỆM ÔN TẬP */}
      {gameModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
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
              const wordsList = gameModalTest.words || [];
              if (wordsList.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    <Gamepad2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Bộ từ này hiện chưa có từ vựng nào để chơi Mini-game.</p>
                  </div>
                );
              }
              const currentWord = wordsList[gameQuestionIndex];
              if (!currentWord) return null;

              // Lấy các phương án gây nhiễu từ các từ khác trong bộ từ
              const otherWords = (gameModalTest.words || []).filter((w: WordItem) => w.id !== currentWord.id);
              const distractors = otherWords
                .slice(0, 3)
                .map((w: WordItem) => w.meaning || "");

              while (distractors.length < 3) {
                distractors.push("Hoãn lại cuộc họp quan trọng của ban giám đốc");
              }

              const curMeaning = currentWord.meaning || currentWord.meanings?.[0]?.meaning || "";
              const options = [curMeaning, ...distractors.slice(0, 3)].sort(
                (a, b) => a.localeCompare(b)
              );

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
                  <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white text-center space-y-1 shadow-md">
                    <span className="text-xs uppercase tracking-wider text-blue-100 font-bold">
                      Chọn nghĩa đúng của từ:
                    </span>
                    <h3 className="text-2xl font-black">{currentWord.word}</h3>
                    <p className="text-xs text-blue-200 font-mono">{currentWord.ipa}</p>
                  </div>

                  <div className="space-y-2">
                    {options.map((opt, idx) => {
                      const isCorrect = opt === currentWord.meaning;
                      const isSelected = gameSelectedOption === idx;

                      let btnStyle =
                        "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800";
                      if (gameAnswerChecked) {
                        if (isCorrect) {
                          btnStyle =
                            "bg-emerald-500 text-white border-emerald-600 font-bold shadow-xs";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-500 text-white border-rose-600 font-bold shadow-xs";
                        } else {
                          btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePickOption(idx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${btnStyle}`}
                        >
                          <span className="font-bold mr-2">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {gameAnswerChecked && (
                    <div className="space-y-3 pt-2 animate-in fade-in duration-150">
                      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-blue-900 text-sm">{currentWord.word}</span>
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                              {currentWord.partOfSpeech} • {currentWord.level}
                            </span>
                            <span className="text-slate-500 font-mono text-[11px]">{currentWord.ipa}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => playAudio(currentWord.word)}
                            className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-slate-800">
                          <strong className="text-blue-900">Dịch nghĩa:</strong> {currentWord.meaning}
                        </div>

                        {currentWord.example && (
                          <div className="pt-1.5 border-t border-blue-200/60 space-y-0.5">
                            <p className="font-semibold text-slate-900">&quot;{currentWord.example}&quot;</p>
                            {currentWord.exampleMeaning && (
                              <p className="text-slate-600 italic">{currentWord.exampleMeaning}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setGameSelectedOption(null);
                          setGameAnswerChecked(false);
                          if (gameQuestionIndex < (gameModalTest.words || []).length - 1) {
                            setGameQuestionIndex((prev) => prev + 1);
                          } else {
                            alert(
                              `🎉 Chúc mừng bạn đã hoàn thành bài luyện tập với số điểm: ${gameScore} điểm!`
                            );
                            onCloseGame();
                          }
                        }}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {gameQuestionIndex < (gameModalTest.words || []).length - 1
                          ? "Từ tiếp theo 👉"
                          : "Xem tổng kết & Kết thúc 🎉"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
};
