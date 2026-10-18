"use client";

import React, { useState } from "react";
import { X, Volume2, Gamepad2, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { WordItem, TestItem } from "@/app/admin/content/vocabulary/types";

function playMiniGameSfx(type: "correct" | "wrong" | "streak" | "gameover" | "win") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "correct") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.28);
    } else if (type === "wrong") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.setValueAtTime(170, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.28);
    } else if (type === "streak") {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.2);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.2);
      });
    } else if (type === "win") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.25);
        osc.start(ctx.currentTime + i * 0.09);
        osc.stop(ctx.currentTime + i * 0.09 + 0.25);
      });
    } else if (type === "gameover") {
      [330, 293.66, 261.63, 220].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.25);
      });
    }
  } catch {
    // Ignore audio errors
  }
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
  const [gameStreak, setGameStreak] = useState(0);
  const [gameMaxStreak, setGameMaxStreak] = useState(0);
  const [gameCorrectCount, setGameCorrectCount] = useState(0);
  const [gameWrongWordIds, setGameWrongWordIds] = useState<(string | number)[]>([]);
  const [gameFinished, setGameFinished] = useState(false);
  const [bookmarkedWordIds, setBookmarkedWordIds] = useState<(string | number)[]>([]);

  // Rich game features
  const [gameLives, setGameLives] = useState(3);
  const [isTimerEnabled, setIsTimerEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [isGameOverModal, setIsGameOverModal] = useState(false);

  const playAudioSlow = useCallback(
    (text: string) => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.75;
        window.speechSynthesis.speak(utterance);
      } else {
        playAudio(text);
      }
    },
    [playAudio]
  );

  const resetGameState = useCallback(() => {
    setGameQuestionIndex(0);
    setGameScore(0);
    setGameSelectedOption(null);
    setGameAnswerChecked(false);
    setGameStreak(0);
    setGameMaxStreak(0);
    setGameCorrectCount(0);
    setGameWrongWordIds([]);
    setGameFinished(false);
    setGameLives(3);
    setTimeLeft(15);
    setUsedFiftyFifty(false);
    setHiddenOptions([]);
    setHintRevealed(false);
    setIsGameOverModal(false);
  }, []);

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
      resetGameState();
    }
  }

  const currentWord = gameModalTest?.words[gameQuestionIndex];

  const currentOptions = useMemo(() => {
    if (!gameModalTest || !currentWord) return [];
    const others = gameModalTest.words.filter((w) => w.id !== currentWord.id);
    const distractors = others.slice(0, 3).map((w) => w.meaning);
    const fallbackList = [
      "Hoãn lại cuộc họp quan trọng của ban giám đốc",
      "Thương lượng các điều khoản hợp đồng kinh tế",
      "Gửi bản báo cáo tiến độ dự án cho khách hàng",
      "Phê duyệt đề xuất ngân sách quý tiếp theo",
    ];
    let fb = 0;
    while (distractors.length < 3) {
      distractors.push(fallbackList[fb++ % fallbackList.length]);
    }
    return [currentWord.meaning, ...distractors.slice(0, 3)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [gameModalTest, currentWord]);

  const handleNextQuestion = useCallback(() => {
    setGameSelectedOption(null);
    setGameAnswerChecked(false);
    setHiddenOptions([]);
    setHintRevealed(false);
    setTimeLeft(15);
    if (gameModalTest && gameQuestionIndex < gameModalTest.words.length - 1) {
      setGameQuestionIndex((prev) => prev + 1);
    } else {
      setGameFinished(true);
      if (isSoundEnabled) playMiniGameSfx("win");
    }
  }, [gameModalTest, gameQuestionIndex, isSoundEnabled]);

  const handlePickOption = useCallback(
    (idx: number) => {
      if (gameAnswerChecked || !currentWord) return;
      if (hiddenOptions.includes(idx)) return;

      setGameSelectedOption(idx);
      setGameAnswerChecked(true);

      const isCorrect = currentOptions[idx] === currentWord.meaning;
      if (isCorrect) {
        const comboBonus = gameStreak >= 1 ? 5 : 0;
        const gainedScore = 10 + comboBonus;
        setGameScore((prev) => prev + gainedScore);
        setGameStreak((prev) => {
          const next = prev + 1;
          setGameMaxStreak((max) => Math.max(max, next));
          if (next >= 3 && isSoundEnabled) {
            playMiniGameSfx("streak");
          } else if (isSoundEnabled) {
            playMiniGameSfx("correct");
          }
          return next;
        });
        setGameCorrectCount((prev) => prev + 1);
      } else {
        setGameStreak(0);
        if (isSoundEnabled) playMiniGameSfx("wrong");
        setGameWrongWordIds((prev) => [
          ...prev,
          currentWord.id || gameQuestionIndex + 1,
        ]);
      }

      if (gameModalTest) {
        saveItemProgress(
          `vocab-${gameModalTest.id}`,
          gameQuestionIndex + 1,
          gameModalTest.words.length
        );
      }
    },
    [
      gameAnswerChecked,
      currentWord,
      hiddenOptions,
      currentOptions,
      gameStreak,
      isSoundEnabled,
      gameModalTest,
      gameQuestionIndex,
    ]
  );

  const handleFiftyFifty = useCallback(() => {
    if (usedFiftyFifty || gameAnswerChecked || !currentWord) return;
    setUsedFiftyFifty(true);
    const incorrect = currentOptions
      .map((opt, i) => (opt !== currentWord.meaning ? i : -1))
      .filter((i) => i !== -1);
    const toHide = [...incorrect].sort(() => 0.5 - Math.random()).slice(0, 2);
    setHiddenOptions(toHide);
  }, [usedFiftyFifty, gameAnswerChecked, currentWord, currentOptions]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!gameModalTest || gameFinished || isGameOverModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (!gameAnswerChecked) {
        if (e.key === "1" || e.key === "a" || e.key === "A") {
          handlePickOption(0);
        } else if (e.key === "2" || e.key === "b" || e.key === "B") {
          handlePickOption(1);
        } else if (e.key === "3" || e.key === "c" || e.key === "C") {
          handlePickOption(2);
        } else if (e.key === "4" || e.key === "d" || e.key === "D") {
          handlePickOption(3);
        }
      } else {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    gameModalTest,
    gameFinished,
    isGameOverModal,
    gameAnswerChecked,
    handlePickOption,
    handleNextQuestion,
  ]);

  // Timer countdown per question
  useEffect(() => {
    if (
      !gameModalTest ||
      gameFinished ||
      isGameOverModal ||
      gameAnswerChecked ||
      !isTimerEnabled
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!gameAnswerChecked && currentWord) {
            setGameAnswerChecked(true);
            setGameStreak(0);
            if (isSoundEnabled) playMiniGameSfx("wrong");
            setGameWrongWordIds((w) => [
              ...w,
              currentWord.id || gameQuestionIndex + 1,
            ]);
            setGameLives((l) => {
              const nextL = Math.max(0, l - 1);
              if (nextL === 0) {
                setTimeout(() => {
                  setIsGameOverModal(true);
                  if (isSoundEnabled) playMiniGameSfx("gameover");
                }, 600);
              }
              return nextL;
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    gameModalTest,
    gameFinished,
    isGameOverModal,
    gameAnswerChecked,
    isTimerEnabled,
    gameQuestionIndex,
    currentWord,
    isSoundEnabled,
  ]);

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

            <div className="divide-y divide-slate-100">
              {wordListModalTest.words?.map((w: WordItem, index: number) => (
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

            <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100 sticky bottom-0 bg-white/95 backdrop-blur-xs -mb-2 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onStartFlashcardsFromList(wordListModalTest)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Lật Flashcard
                </button>
                <button
                  type="button"
                  onClick={() => onStartGameFromList(wordListModalTest)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
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
              const currentWord = (flashcardModalTest.words || [])[flashcardIndex];
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

      {/* MODAL 3: MINI-GAME TRẮC NGHIỆM ÔN TẬP GỌN GÀNG & CÂN ĐỐI */}
      {gameModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl sm:max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Nút đóng modal */}
            <button
              type="button"
              onClick={onCloseGame}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shadow-2xs z-20"
              title="Đóng mini-game"
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
              const currentWord = (gameModalTest.words || [])[gameQuestionIndex];
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

                {/* Thẻ thống kê kết quả */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-xl mx-auto">
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-center">
                    <span className="text-xs text-blue-700 font-bold block mb-1">Tổng điểm đạt được</span>
                    <span className="text-3xl font-black text-blue-900">{gameScore}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center">
                    <span className="text-xs text-emerald-700 font-bold block mb-1">Độ chính xác</span>
                    <span className="text-3xl font-black text-emerald-900">
                      {Math.round((gameCorrectCount / gameModalTest.words.length) * 100)}%
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                      ({gameCorrectCount}/{gameModalTest.words.length} từ đúng)
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center">
                    <span className="text-xs text-amber-700 font-bold block mb-1">Kỷ lục Chuỗi (Streak)</span>
                    <span className="text-3xl font-black text-amber-900">{gameMaxStreak}x</span>
                  </div>
                </div>

                {/* Bảng xem lại các từ đã ôn tập */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2 max-h-[30vh] overflow-y-auto">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Danh sách từ đã ôn tập:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {gameModalTest.words.map((w, idx) => {
                      const isWrong = gameWrongWordIds.includes(w.id || idx + 1);
                      return (
                        <div
                          key={w.id || idx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                            isWrong
                              ? "bg-rose-50/70 border-rose-200 text-rose-900"
                              : "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isWrong ? (
                              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                            <div>
                              <span className="font-bold">{w.word}</span>
                              <span className="text-[11px] opacity-75 block">{w.meaning}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => playAudio(w.word)}
                            className="p-1 rounded-md hover:bg-black/5 text-slate-500 cursor-pointer"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Các nút hành động cuối bài */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetGameState}
                    className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Chơi lại từ đầu
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onCloseGame();
                      onStartFlashcardsFromList(gameModalTest);
                    }}
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-sm cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Lật thẻ Flashcard
                  </button>

                  <button
                    type="button"
                    onClick={onCloseGame}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Đóng hoàn thành
                  </button>
                </div>
              </div>
            ) : (
              /* MÀN HÌNH CHƠI GAME TỪNG CÂU HỎI */
              (() => {
                if (!currentWord) return null;
                const totalWords = gameModalTest.words.length;
                const isBookmarked = bookmarkedWordIds.includes(currentWord.id || gameQuestionIndex + 1);

                const toggleBookmark = () => {
                  const qId = currentWord.id || gameQuestionIndex + 1;
                  setBookmarkedWordIds((prev) =>
                    prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
                  );
                };

                return (
                  <div className="space-y-4">
                    {/* THANH TIẾN ĐỘ CÂU HỎI */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                          Câu hỏi {gameQuestionIndex + 1} / {totalWords}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={toggleBookmark}
                            className={`flex items-center gap-1 text-xs font-semibold transition cursor-pointer ${
                              isBookmarked ? "text-amber-600 font-bold" : "text-slate-400 hover:text-slate-600"
                            }`}
                            title="Lưu từ vựng khó để xem lại"
                          >
                            {isBookmarked ? (
                              <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                            ) : (
                              <Bookmark className="w-3.5 h-3.5" />
                            )}
                            <span>{isBookmarked ? "Đã lưu từ" : "Lưu từ"}</span>
                          </button>
                          <span>{Math.round(((gameQuestionIndex + 1) / totalWords) * 100)}%</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 transition-all duration-300 rounded-full"
                          style={{ width: `${((gameQuestionIndex + 1) / totalWords) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* KHỐI TỪ VỰNG TRUNG TÂM (CÂN ĐỐI, GỌN GÀNG) */}
                    <div className="py-3 px-4 sm:py-3.5 sm:px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl text-white text-center space-y-1.5 shadow-md relative overflow-hidden">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-100">
                        <span className="uppercase tracking-wider text-[10px] bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs font-semibold">
                          Chọn nghĩa đúng của từ
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            {currentWord.partOfSpeech}
                          </span>
                          <span className="bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-2xs">
                            {currentWord.level}
                          </span>
                        </div>
                      </div>

                      {/* TỪ VỰNG TIẾNG ANH & CẶP NÚT PHÁT ÂM (1.0x & 0.8x) */}
                      <div className="flex items-center justify-center gap-2.5 flex-wrap">
                        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight drop-shadow-xs">
                          {currentWord.word}
                        </h3>

                        <div className="flex items-center gap-1 bg-white/15 p-0.5 rounded-lg backdrop-blur-xs border border-white/20">
                          <button
                            type="button"
                            onClick={() => playAudio(currentWord.word)}
                            className="p-1 rounded-md bg-white/20 hover:bg-white text-white hover:text-blue-600 transition active:scale-95 cursor-pointer"
                            title="Nghe phát âm chuẩn (1.0x)"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => playAudioSlow(currentWord.word)}
                            className="px-1.5 py-0.5 rounded-md bg-white/20 hover:bg-white text-white hover:text-blue-600 transition active:scale-95 text-[10px] font-black cursor-pointer"
                            title="Nghe phát âm chậm (0.8x)"
                          >
                            0.8x
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setGameSelectedOption(null);
                          setGameAnswerChecked(false);
                          if (gameQuestionIndex < (gameModalTest.words || []).length - 1) {
                            setGameQuestionIndex((prev) => prev + 1);
                          } else {
                            cardStyle = "bg-slate-50 border-slate-200/60 text-slate-400 opacity-60";
                            badgeStyle = "bg-slate-200 text-slate-400 border-slate-300";
                          }
                        }}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {gameQuestionIndex < (gameModalTest.words || []).length - 1
                          ? "Từ tiếp theo 👉"
                          : "Xem tổng kết & Kết thúc 🎉"}
                      </button>
                    </div>

                    {/* KHỐI GIẢI THÍCH CHI TIẾT & NGỮ CẢNH TOEIC KHI ĐÃ CHỌN ĐÁP ÁN */}
                    {gameAnswerChecked && (
                      <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                        <div
                          className={`p-4 sm:p-5 rounded-2xl border-2 text-left space-y-3 ${
                            currentOptions[gameSelectedOption || 0] === currentWord.meaning
                              ? "bg-emerald-50/60 border-emerald-200"
                              : "bg-blue-50/70 border-blue-200"
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              {currentOptions[gameSelectedOption || 0] === currentWord.meaning ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Chính xác! (+10đ)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Chưa chính xác
                                </span>
                              )}
                              <span className="font-extrabold text-slate-900 text-base">
                                {currentWord.word}
                              </span>
                              <span className="text-slate-500 font-mono text-xs">
                                {currentWord.ipa}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => playAudio(currentWord.word)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                              title="Nghe lại phát âm"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Nghe lại</span>
                            </button>
                          </div>

                          <div className="text-sm text-slate-800 leading-relaxed">
                            <strong className="text-slate-900 font-bold">Định nghĩa chuẩn: </strong>
                            <span className="text-blue-900 font-semibold">{currentWord.meaning}</span>
                          </div>

                          {/* PHÂN TÍCH CÂU VÍ DỤ — HIGHLIGHT TỪ TRONG CÂU */}
                          {currentWord.example && (
                            <div className="pt-2 border-t border-slate-200/60 space-y-2.5">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                📖 Phân tích câu ví dụ TOEIC:
                              </span>

                              {/* Câu ví dụ — từ khóa được highlight vàng */}
                              <p className="text-sm text-slate-800 italic leading-relaxed bg-white/80 px-3 py-2 rounded-xl border border-slate-200">
                                &quot;{currentWord.example.split(new RegExp(`(${currentWord.word})`, "gi")).map((part, pi) =>
                                  part.toLowerCase() === currentWord.word.toLowerCase()
                                    ? <mark key={pi} className="bg-amber-200 text-amber-950 font-bold not-italic px-0.5 rounded">{part}</mark>
                                    : part
                                )}&quot;
                              </p>

                              {/* Dịch nghĩa câu ví dụ */}
                              {currentWord.exampleMeaning && (
                                <div className="flex items-start gap-2">
                                  <span className="text-blue-500 font-bold shrink-0">👉</span>
                                  <p className="text-xs text-blue-800 font-semibold leading-relaxed">
                                    {currentWord.exampleMeaning}
                                  </p>
                                </div>
                              )}

                              {/* Bảng phân tích: từ / loại từ / nghĩa cốt lõi */}
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-indigo-50 border border-indigo-200/80 rounded-xl px-2 py-2 text-center">
                                  <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block mb-0.5">Từ vựng</span>
                                  <span className="text-xs font-black text-indigo-900 break-all">{currentWord.word}</span>
                                </div>
                                <div className="bg-violet-50 border border-violet-200/80 rounded-xl px-2 py-2 text-center">
                                  <span className="text-[10px] text-violet-500 font-bold uppercase tracking-wider block mb-0.5">Loại từ</span>
                                  <span className="text-xs font-black text-violet-900">{currentWord.partOfSpeech}</span>
                                </div>
                                <div className="bg-sky-50 border border-sky-200/80 rounded-xl px-2 py-2 text-center">
                                  <span className="text-[10px] text-sky-500 font-bold uppercase tracking-wider block mb-0.5">Nghĩa cốt lõi</span>
                                  <span className="text-[11px] font-black text-sky-900 leading-tight line-clamp-2">{currentWord.meaning.split(/[,;]/)[0].trim()}</span>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>

                        {/* NÚT CHUYỂN CÂU TIẾP THEO HOẶC XEM TỔNG KẾT */}
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.005] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>
                            {gameQuestionIndex < totalWords - 1
                              ? "Từ tiếp theo (Nhấn Space)"
                              : "Xem kết quả tổng kết"}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </>
  );
};
