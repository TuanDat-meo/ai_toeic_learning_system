"use client";

import React, { useState } from "react";
import { X, Volume2, Gamepad2, ChevronLeft, ChevronRight, RotateCcw, BookOpen, Award, Check } from "lucide-react";
import { WordItem, TestItem } from "@/app/admin/content/vocabulary/types";
import { recordQuestionAnswer } from "@/lib/practiceProgress";
import { QuestionErrorReportButton } from "@/components/support/QuestionErrorReportButton";

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
  initialFlashcardIndex?: number;

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
  initialFlashcardIndex = 0,
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
  const [gameFinished, setGameFinished] = useState(false);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [sessionWrongWords, setSessionWrongWords] = useState<WordItem[]>([]);
  const [customWordsList, setCustomWordsList] = useState<WordItem[] | null>(null);

  // Reset flashcard state when opened
  const [prevFlashcardTest, setPrevFlashcardTest] = useState(flashcardModalTest);
  if (flashcardModalTest !== prevFlashcardTest) {
    setPrevFlashcardTest(flashcardModalTest);
    if (flashcardModalTest) {
      setFlashcardIndex(initialFlashcardIndex || 0);
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
      setGameFinished(false);
      setSessionCorrectCount(0);
      setSessionWrongWords([]);
      setCustomWordsList(null);
    }
  }

  return (
    <>
      {/* MODAL 1: DANH SÁCH TỪ VỰNG & PHÁT ÂM (VIEW ONLY CHO HỌC VIÊN) */}
      {wordListModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 shrink-0 bg-white z-10">
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

            {/* DANH SÁCH CUỘN VỚI THANH KÉO RÕ RÀNG */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pr-4">
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
                          onClick={() => playAudio(w.audio || w.audioUrl || w.word)}
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
                      <QuestionErrorReportButton
                        source="QUESTION_BANK"
                        questionRef={w.id || `vocab-${wordListModalTest.id}-${index + 1}`}
                        relatedContent={`Từ vựng: "${w.word}" (${wordListModalTest.title})`}
                        questionSnapshot={{
                          word: w.word,
                          ipa: w.ipa,
                          partOfSpeech: w.partOfSpeech,
                          meaning: w.meaning,
                          example: w.example,
                          exampleMeaning: w.exampleMeaning,
                          setName: wordListModalTest.title,
                        }}
                        compact
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            </div>

            {/* FOOTER CỐ ĐỊNH Ở ĐÁY */}
            <div className="p-4 px-6 border-t border-slate-100 shrink-0 flex items-center justify-between gap-2.5 bg-slate-50/70 z-10">
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <span className="text-xs font-black text-blue-600 uppercase tracking-wider line-clamp-1">
                Flashcard • {flashcardModalTest.title}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {flashcardModalTest.words && flashcardModalTest.words[flashcardIndex] && (
                  <QuestionErrorReportButton
                    source="QUESTION_BANK"
                    questionRef={flashcardModalTest.words[flashcardIndex].id || `vocab-fc-${flashcardIndex + 1}`}
                    relatedContent={`Flashcard: "${flashcardModalTest.words[flashcardIndex].word}" (${flashcardModalTest.title})`}
                    questionSnapshot={{
                      word: flashcardModalTest.words[flashcardIndex].word,
                      ipa: flashcardModalTest.words[flashcardIndex].ipa,
                      partOfSpeech: flashcardModalTest.words[flashcardIndex].partOfSpeech,
                      meaning: flashcardModalTest.words[flashcardIndex].meaning,
                      example: flashcardModalTest.words[flashcardIndex].example,
                      exampleMeaning: flashcardModalTest.words[flashcardIndex].exampleMeaning,
                      setName: flashcardModalTest.title,
                    }}
                    compact
                  />
                )}
                <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full font-mono whitespace-nowrap shadow-2xs">
                  {flashcardIndex + 1} / {(flashcardModalTest.words || []).length}
                </span>
                <button
                  type="button"
                  onClick={onCloseFlashcards}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Đóng Flashcard"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
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
                          playAudio(currentWord.audio || currentWord.audioUrl || currentWord.word);
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
                    const totalW = (flashcardModalTest as any)?.originalTotalWords || flashcardModalTest.wordCount || (flashcardModalTest.words || []).length || 200;
                    const curWord = (flashcardModalTest.words || [])[flashcardIndex];
                    recordQuestionAnswer(`vocab-${flashcardModalTest.id}`, (curWord as any)?.id || curWord?.word || flashcardIndex + 1, false, totalW);
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
                    const totalW = (flashcardModalTest as any)?.originalTotalWords || flashcardModalTest.wordCount || (flashcardModalTest.words || []).length || 200;
                    const curWord = (flashcardModalTest.words || [])[flashcardIndex];
                    recordQuestionAnswer(`vocab-${flashcardModalTest.id}`, (curWord as any)?.id || curWord?.word || flashcardIndex + 1, true, totalW);
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header Mini-game */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5 truncate">
                  <Gamepad2 className="w-4 h-4 text-blue-600 shrink-0" />
                  {(gameModalTest as any)?.isRedoMode ? "Làm Lại Câu Sai Mini-game" : "Mini-game Ôn Từ Nhanh"}
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  {!gameFinished
                    ? `Câu ${gameQuestionIndex + 1} / ${(customWordsList || gameModalTest.words || []).length}`
                    : "Kết quả luyện tập"}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!gameFinished && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                    <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      {sessionCorrectCount}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-red-500 font-extrabold flex items-center gap-0.5">
                      <X className="w-3 h-3 stroke-[2.5]" />
                      {sessionWrongWords.length}
                    </span>
                  </div>
                )}
                <span className="text-xs bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full border border-amber-200 whitespace-nowrap shadow-2xs">
                  Điểm: {gameScore}
                </span>
                <button
                  type="button"
                  onClick={onCloseGame}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Đóng Mini-game"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {(() => {
              const wordsList = customWordsList || gameModalTest.words || [];
              if (wordsList.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    <Gamepad2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Bộ từ này hiện chưa có từ vựng nào để chơi Mini-game.</p>
                  </div>
                );
              }

              // MÀN HÌNH KẾT QUẢ KHI LÀM XONG MINI-GAME
              if (gameFinished) {
                const totalPlayed = wordsList.length;
                const accuracy = totalPlayed > 0 ? Math.round((sessionCorrectCount / totalPlayed) * 100) : 0;
                return (
                  <div className="text-center py-5 space-y-5 animate-in fade-in duration-150">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
                      <Award className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-2xl font-extrabold text-slate-900">Hoàn Thành Mini-game!</h2>
                      <p className="text-xs text-slate-500 font-medium">
                        {sessionWrongWords.length === 0
                          ? "Xuất sắc! Bạn đã trả lời chính xác tất cả các từ trong bài."
                          : `Bạn đã hoàn thành ${totalPlayed} câu hỏi. Hãy làm lại các câu chưa chính xác nhé!`}
                      </p>
                    </div>

                    {/* Thống kê: Đúng - Sai - Tỷ lệ chính xác */}
                    <div className="inline-flex items-center gap-4 sm:gap-6 px-6 sm:px-8 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                      <div>
                        <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Số câu đúng</p>
                        <p className="text-2xl font-extrabold text-emerald-600 flex items-center justify-center gap-1">
                          <Check className="w-5 h-5 stroke-[3]" />
                          {sessionCorrectCount} / {totalPlayed}
                        </p>
                      </div>
                      <div className="w-px h-8 bg-slate-200" />
                      <div>
                        <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Số câu sai</p>
                        <p className="text-2xl font-extrabold text-red-500 flex items-center justify-center gap-1">
                          <X className="w-5 h-5 stroke-[3]" />
                          {sessionWrongWords.length}
                        </p>
                      </div>
                      <div className="w-px h-8 bg-slate-200" />
                      <div>
                        <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Tỷ lệ chính xác</p>
                        <p className="text-2xl font-extrabold text-blue-600">{accuracy}%</p>
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                      {sessionWrongWords.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomWordsList([...sessionWrongWords]);
                            setGameQuestionIndex(0);
                            setGameSelectedOption(null);
                            setGameAnswerChecked(false);
                            setGameFinished(false);
                            setSessionCorrectCount(0);
                            setSessionWrongWords([]);
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Làm lại {sessionWrongWords.length} câu sai
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setCustomWordsList(null);
                          setGameQuestionIndex(0);
                          setGameSelectedOption(null);
                          setGameAnswerChecked(false);
                          setGameFinished(false);
                          setGameScore(0);
                          setSessionCorrectCount(0);
                          setSessionWrongWords([]);
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Làm lại từ đầu
                      </button>

                      <button
                        type="button"
                        onClick={onCloseGame}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                );
              }

              const currentWord = wordsList[gameQuestionIndex];
              if (!currentWord) return null;

              // Lấy các phương án gây nhiễu từ kho từ đầy đủ
              const allSourceWords = (gameModalTest as any)?.allWords || gameModalTest.words || [];
              const otherWords = allSourceWords.filter((w: WordItem) => w.word !== currentWord.word);
              const curMeaning = currentWord.meaning || currentWord.meanings?.[0]?.meaning || "";
              
              const candidateDistractors: string[] = [];
              for (let i = 0; i < otherWords.length; i++) {
                const candMeaning = otherWords[i].meaning || otherWords[i].meanings?.[0]?.meaning || "";
                if (candMeaning && candMeaning !== curMeaning && !candidateDistractors.includes(candMeaning)) {
                  candidateDistractors.push(candMeaning);
                  if (candidateDistractors.length >= 3) break;
                }
              }
              while (candidateDistractors.length < 3) {
                candidateDistractors.push("Hoãn lại cuộc họp quan trọng của ban giám đốc");
              }

              const options = [curMeaning, ...candidateDistractors.slice(0, 3)].sort((a, b) => a.localeCompare(b));

              const handlePickOption = (idx: number) => {
                if (gameAnswerChecked) return;
                setGameSelectedOption(idx);
                setGameAnswerChecked(true);

                const isCorrect = options[idx] === curMeaning;
                const wordId = (currentWord as any)?.id || currentWord.word || gameQuestionIndex + 1;
                const totalW = (gameModalTest as any)?.originalTotalWords || gameModalTest.wordCount || (gameModalTest.words || []).length || 200;

                // Đồng bộ kết quả vào practiceProgress giống Đọc & Nghe
                recordQuestionAnswer(`vocab-${gameModalTest.id}`, wordId, isCorrect, totalW);

                if (isCorrect) {
                  setGameScore((prev) => prev + 5);
                  setSessionCorrectCount((prev) => prev + 1);
                } else {
                  setSessionWrongWords((prev) => {
                    const alreadyExists = prev.some((w) => (w.id && w.id === currentWord.id) || w.word === currentWord.word);
                    return alreadyExists ? prev : [...prev, currentWord];
                  });
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
                      const isCorrect = opt === curMeaning;
                      const isSelected = gameSelectedOption === idx;

                      let btnStyle = "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800";
                      if (gameAnswerChecked) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500 text-white border-emerald-600 font-bold shadow-xs";
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
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => playAudio(currentWord.audio || currentWord.audioUrl || currentWord.word)}
                              className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <QuestionErrorReportButton
                              source="QUESTION_BANK"
                              questionRef={currentWord.id || `vocab-game-${currentWord.word}`}
                              relatedContent={`Mini-game: "${currentWord.word}" (${gameModalTest.title})`}
                              questionSnapshot={{
                                word: currentWord.word,
                                ipa: currentWord.ipa,
                                partOfSpeech: currentWord.partOfSpeech,
                                meaning: currentWord.meaning,
                                example: currentWord.example,
                                exampleMeaning: currentWord.exampleMeaning,
                                setName: gameModalTest.title,
                              }}
                              compact
                            />
                          </div>
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
                          if (gameQuestionIndex < wordsList.length - 1) {
                            setGameQuestionIndex((prev) => prev + 1);
                          } else {
                            setGameFinished(true);
                          }
                        }}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {gameQuestionIndex < wordsList.length - 1
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
