"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Volume2, Gamepad2, ChevronLeft, ChevronRight, ChevronDown, RotateCcw, BookOpen, Award, Check } from "lucide-react";
import { WordItem, TestItem } from "@/app/admin/content/vocabulary/types";
import { recordQuestionAnswer } from "@/lib/practiceProgress";
import { QuestionErrorReportButton } from "@/components/support/QuestionErrorReportButton";
import { recordVocabularyAnswer, type VocabularySrsRating } from "@/lib/api/vocabulary";

function getWordSenses(word: WordItem) {
  return word.senses?.length
    ? word.senses
    : [{
        partOfSpeech: word.partOfSpeech || word.pos || "",
        meaning: word.meaning || word.meanings?.[0]?.meaning || "",
        example: word.example || word.meanings?.[0]?.example || "",
      }];
}

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
  const [flashcardSaving, setFlashcardSaving] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [flashcardSwipeOffset, setFlashcardSwipeOffset] = useState(0);
  const [flashcardIsDragging, setFlashcardIsDragging] = useState(false);
  const [flashcardSwipeDirection, setFlashcardSwipeDirection] = useState<"left" | "right" | null>(null);
  const [flashcardRatingMenuOpen, setFlashcardRatingMenuOpen] = useState(false);
  const flashcardStartedAt = useRef(0);
  const flashcardRequestIds = useRef(new Map<string, string>());
  const flashcardSavingRef = useRef(false);
  const flashcardPointerStart = useRef<{ x: number; y: number; time: number; pointerId: number } | null>(null);
  const flashcardDidSwipe = useRef(false);

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
      setProgressError(null);
      setFlashcardSwipeOffset(0);
      setFlashcardSwipeDirection(null);
      setFlashcardRatingMenuOpen(false);
    }
  }

  useEffect(() => {
    if (flashcardModalTest) {
      flashcardStartedAt.current = Date.now();
      flashcardRequestIds.current.clear();
      flashcardSavingRef.current = false;
    }
  }, [flashcardModalTest]);

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
      setProgressError(null);
    }
  }

  const rateFlashcard = async (rating: VocabularySrsRating) => {
    const words = flashcardModalTest?.words || [];
    const word = words[flashcardIndex];
    if (!flashcardModalTest || !word || !isFlipped || flashcardSavingRef.current) return;
    flashcardSavingRef.current = true;
    const requestKey = `${flashcardModalTest.id}:${word.id}:${rating}`;
    let requestId = flashcardRequestIds.current.get(requestKey);
    if (!requestId) {
      requestId = crypto.randomUUID();
      flashcardRequestIds.current.set(requestKey, requestId);
    }

    setFlashcardSaving(true);
    setProgressError(null);
    try {
      await recordVocabularyAnswer({
        requestId,
        wordId: word.id,
        activityType: flashcardModalTest.id === "due-review" ? "REVIEW" : "FLASHCARD",
        questionType: "FLASHCARD_RATING",
        rating,
        responseTimeMs: Math.max(0, Date.now() - flashcardStartedAt.current),
      });
      flashcardRequestIds.current.delete(requestKey);
      const totalWords = flashcardModalTest.wordCount || words.length;
      recordQuestionAnswer(
        `vocab-${flashcardModalTest.id}`,
        word.id,
        rating === "GOOD" || rating === "EASY",
        totalWords,
      );
      await new Promise((resolve) => window.setTimeout(resolve, 260));
      setIsFlipped(false);
      setFlashcardSwipeDirection(null);
      setFlashcardSwipeOffset(0);
      setFlashcardRatingMenuOpen(false);
      setFlashcardIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
      flashcardStartedAt.current = Date.now();
    } catch (error) {
      setFlashcardSwipeDirection(null);
      setFlashcardSwipeOffset(0);
      setProgressError(error instanceof Error ? error.message : "Không thể lưu tiến độ từ vựng.");
    } finally {
      flashcardSavingRef.current = false;
      setFlashcardSaving(false);
    }
  };

  const submitFlashcardRating = (rating: VocabularySrsRating, direction: "left" | "right") => {
    if (!isFlipped || flashcardSavingRef.current) return;
    setFlashcardRatingMenuOpen(false);
    setFlashcardSwipeDirection(direction);
    setFlashcardSwipeOffset(direction === "left" ? -320 : 320);
    void rateFlashcard(rating);
  };

  const handleFlashcardPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isFlipped || flashcardSavingRef.current || flashcardRatingMenuOpen) return;
    const target = event.target;
    if (target instanceof Element && target.closest("button, a, input, select, textarea, [role='menu']")) return;
    flashcardPointerStart.current = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      pointerId: event.pointerId,
    };
    setFlashcardIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleFlashcardPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = flashcardPointerStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2 && Math.abs(deltaY) > 24) {
      flashcardPointerStart.current = null;
      setFlashcardIsDragging(false);
      setFlashcardSwipeOffset(0);
      return;
    }
    setFlashcardSwipeOffset(Math.max(-320, Math.min(320, deltaX)));
  };

  const handleFlashcardPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = flashcardPointerStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    flashcardPointerStart.current = null;
    setFlashcardIsDragging(false);
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const elapsed = Math.max(1, performance.now() - start.time);
    const velocity = Math.abs(deltaX) / elapsed;
    const crossedThreshold = Math.abs(deltaX) >= 90 || (Math.abs(deltaX) >= 48 && velocity >= 0.65);
    if (Math.abs(deltaY) > Math.abs(deltaX) || !crossedThreshold) {
      setFlashcardSwipeOffset(0);
      return;
    }
    flashcardDidSwipe.current = true;
    window.setTimeout(() => {
      flashcardDidSwipe.current = false;
    }, 0);
    submitFlashcardRating(deltaX < 0 ? "AGAIN" : "GOOD", deltaX < 0 ? "left" : "right");
  };

  const handleFlashcardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target;
    if (target instanceof Element && target.closest("button, a, input, select, textarea, [role='menu']")) return;
    if ((event.key === " " || event.key === "Enter") && !isFlipped) {
      event.preventDefault();
      setIsFlipped(true);
    } else if (isFlipped && event.key === "ArrowLeft") {
      event.preventDefault();
      submitFlashcardRating("AGAIN", "left");
    } else if (isFlipped && event.key === "ArrowRight") {
      event.preventDefault();
      submitFlashcardRating("GOOD", "right");
    }
  };

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
                {wordListModalTest.words.map((w: WordItem, index: number) => {
                  const senses = getWordSenses(w);
                  return (
                  <div key={w.id} className="py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">
                          {index + 1}. {w.word}
                        </span>
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {w.ipa}
                        </span>
                        {senses.map((sense, senseIndex) => (
                          <span key={sense.id ?? `${sense.partOfSpeech}-${senseIndex}`} className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {sense.partOfSpeech}
                            {sense.subCategory ? ` · ${sense.subCategory}` : ""}
                          </span>
                        ))}
                        <button
                          type="button"
                          onClick={() => playAudio(w.audio || w.audioUrl || w.word)}
                          className="w-6 h-6 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Nghe phát âm chuẩn US"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {senses.map((sense, senseIndex) => (
                        <div key={sense.id ?? `${sense.partOfSpeech}-${senseIndex}`} className="space-y-0.5">
                          {sense.meaning ? (
                            <p className="text-xs font-bold text-slate-800">{sense.meaning}</p>
                          ) : sense.definitionEn ? (
                            <p className="text-xs text-slate-700"><span className="font-semibold">English definition:</span> {sense.definitionEn}</p>
                          ) : null}
                          {sense.example ? (
                            <p className="whitespace-pre-line text-xs text-slate-500 italic leading-relaxed">&quot;{sense.example}&quot;</p>
                          ) : null}
                          {(sense.exampleMeaning || (senseIndex === 0 && w.exampleMeaning)) ? (
                            <p className="text-xs text-blue-700 font-semibold leading-relaxed">
                              👉 {sense.exampleMeaning || w.exampleMeaning}
                            </p>
                          ) : null}
                        </div>
                      ))}
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
                  );
                })}
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
                  disabled={flashcardSaving}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Đóng Flashcard"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {progressError ? (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {progressError}
              </p>
            ) : null}

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
              const senses = getWordSenses(currentWord);

              return (
                <div
                  tabIndex={0}
                  onClick={() => {
                    if (flashcardDidSwipe.current) {
                      flashcardDidSwipe.current = false;
                      return;
                    }
                    if (!flashcardSavingRef.current) setIsFlipped((value) => !value);
                  }}
                  onKeyDown={handleFlashcardKeyDown}
                  onPointerDown={handleFlashcardPointerDown}
                  onPointerMove={handleFlashcardPointerMove}
                  onPointerUp={handleFlashcardPointerUp}
                  onPointerCancel={() => {
                    flashcardPointerStart.current = null;
                    setFlashcardIsDragging(false);
                    setFlashcardSwipeOffset(0);
                  }}
                  style={{ transform: `translateX(${flashcardSwipeOffset}px) rotate(${flashcardSwipeOffset / 32}deg)` }}
                  className={`relative cursor-pointer touch-pan-y overflow-hidden ${flashcardIsDragging ? "transition-none" : "transition-transform duration-300"} min-h-[260px] rounded-3xl border-2 border-dashed p-6 flex flex-col justify-between hover:shadow-lg shadow-xs ${
                    flashcardSwipeDirection === "left"
                      ? "border-rose-300 bg-rose-50"
                      : flashcardSwipeDirection === "right"
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-blue-200 bg-gradient-to-br from-blue-50/40 via-sky-50/30 to-white hover:border-blue-500"
                  }`}
                >
                  {flashcardSwipeOffset !== 0 ? (
                    <div className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-opacity-10 text-2xl font-black uppercase tracking-widest ${
                      flashcardSwipeOffset < 0 ? "bg-rose-500/10 text-rose-700" : "bg-emerald-500/10 text-emerald-700"
                    }`}>
                      {flashcardSwipeOffset < 0 ? "Chưa nhớ" : "Đã nhớ"}
                    </div>
                  ) : null}
                  {!isFlipped ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center space-y-3 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">
                          {currentWord.word}
                        </span>
                        {senses.map((sense, senseIndex) => (
                          <span key={sense.id ?? `${sense.partOfSpeech}-${senseIndex}`} className="px-2.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
                            {sense.partOfSpeech}
                          </span>
                        ))}
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
                        💡 Chạm vào thẻ để lật xem nghĩa và ví dụ
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-center space-y-3 py-4 animate-in fade-in">
                      <span className="text-xs uppercase font-extrabold text-blue-600 tracking-wider">
                        Định nghĩa & Ngữ cảnh
                      </span>
                      <div className="max-h-40 w-full max-w-sm space-y-3 overflow-y-auto">
                        {senses.map((sense, senseIndex) => (
                          <div key={sense.id ?? `${sense.partOfSpeech}-${senseIndex}`} className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
                              {sense.partOfSpeech}{sense.subCategory ? ` · ${sense.subCategory}` : ""}
                            </span>
                            {sense.meaning ? (
                              <h4 className="text-xl font-bold text-slate-900">{sense.meaning}</h4>
                            ) : sense.definitionEn ? (
                              <p className="text-sm text-slate-800"><strong>English definition:</strong> {sense.definitionEn}</p>
                            ) : null}
                            {sense.example ? (
                              <p className="whitespace-pre-line text-xs text-slate-600 italic bg-white/80 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                                &quot;{sense.example}&quot;
                              </p>
                            ) : null}
                            {(sense.exampleMeaning || (senseIndex === 0 && currentWord.exampleMeaning)) ? (
                              <p className="text-xs text-blue-700 font-semibold max-w-xs">
                                👉 {sense.exampleMeaning || currentWord.exampleMeaning}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
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
                  disabled={flashcardIndex === 0 || flashcardSaving}
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
                  disabled={flashcardIndex >= (flashcardModalTest.words || []).length - 1 || flashcardSaving}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
                >
                  Từ tiếp theo <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <p className="col-span-2 text-center text-xs font-semibold text-slate-500">
                  {isFlipped
                    ? "Vuốt trái: chưa nhớ · vuốt phải: đã nhớ · dùng phím ← / →"
                    : "Lật thẻ để đánh giá khả năng ghi nhớ"}
                </p>
                <button
                  type="button"
                  onClick={() => submitFlashcardRating("AGAIN", "left")}
                  disabled={!isFlipped || flashcardSaving}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-black text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {flashcardSaving ? "Đang lưu..." : "← Chưa nhớ"}
                </button>
                <button
                  type="button"
                  onClick={() => submitFlashcardRating("GOOD", "right")}
                  disabled={!isFlipped || flashcardSaving}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-black text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Đã nhớ →
                </button>
                <div className="relative col-span-2 flex justify-center">
                  <button
                    type="button"
                    disabled={!isFlipped || flashcardSaving}
                    aria-expanded={flashcardRatingMenuOpen}
                    onClick={() => setFlashcardRatingMenuOpen((open) => !open)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Mức đánh giá khác <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {flashcardRatingMenuOpen ? (
                    <div role="menu" className="absolute bottom-full z-20 mb-1 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                      <button
                        type="button"
                        role="menuitem"
                        disabled={flashcardSaving}
                        onClick={() => submitFlashcardRating("HARD", "left")}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-amber-50"
                      >
                        Khó nhớ
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        disabled={flashcardSaving}
                        onClick={() => submitFlashcardRating("EASY", "right")}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-emerald-50"
                      >
                        Rất dễ
                      </button>
                    </div>
                  ) : null}
                </div>
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
                  {gameModalTest.isRedoMode ? "Làm Lại Câu Sai Mini-game" : "Mini-game Ôn Từ Nhanh"}
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

            {progressError ? (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                Không đồng bộ được tiến độ lên máy chủ: {progressError}
              </p>
            ) : null}

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
              const allSourceWords = gameModalTest.allWords || gameModalTest.words || [];
              const otherWords = allSourceWords.filter((w: WordItem) => w.word !== currentWord.word);
              const primarySense = getWordSenses(currentWord)[0];
              const curMeaning = currentWord.meaning || primarySense?.meaning || primarySense?.definitionEn || "";
              
              const candidateDistractors: string[] = [];
              for (let i = 0; i < otherWords.length; i++) {
                const candidateSense = getWordSenses(otherWords[i])[0];
                const candMeaning = otherWords[i].meaning || candidateSense?.meaning || candidateSense?.definitionEn || "";
                if (candMeaning && candMeaning !== curMeaning && !candidateDistractors.includes(candMeaning)) {
                  candidateDistractors.push(candMeaning);
                  if (candidateDistractors.length >= 3) break;
                }
              }
              const options = [curMeaning, ...candidateDistractors.slice(0, 3)].sort((a, b) => a.localeCompare(b));

              const handlePickOption = (idx: number) => {
                if (gameAnswerChecked) return;
                setGameSelectedOption(idx);
                setGameAnswerChecked(true);

                const isCorrect = options[idx] === curMeaning;
                const wordId = currentWord.id;
                const totalW = gameModalTest.originalTotalWords || gameModalTest.wordCount || (gameModalTest.words || []).length || 0;

                // Đồng bộ kết quả vào practiceProgress giống Đọc & Nghe
                recordQuestionAnswer(`vocab-${gameModalTest.id}`, wordId, isCorrect, totalW);
                void recordVocabularyAnswer({
                  requestId: crypto.randomUUID(),
                  wordId,
                  activityType: "GAME",
                  questionType: "ENGLISH_TO_VIETNAMESE",
                  answer: options[idx],
                  responseTimeMs: 0,
                }).catch((error: unknown) => {
                  setProgressError(error instanceof Error ? error.message : "Không thể lưu kết quả game.");
                });

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
                          {currentWord.meaning ? (
                            <><strong className="text-blue-900">Dịch nghĩa:</strong> {currentWord.meaning}</>
                          ) : getWordSenses(currentWord)[0]?.definitionEn ? (
                            <><strong className="text-blue-900">English definition:</strong> {getWordSenses(currentWord)[0].definitionEn}</>
                          ) : null}
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
