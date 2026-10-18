"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Volume2,
  VolumeX,
  Gamepad2,
  Trophy,
  Sparkles,
  CheckCircle2,
  XCircle,
  Flame,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  RotateCcw,
  Heart,
  Timer,
  Lightbulb,
  HelpCircle,
  SkipForward,
  Keyboard,
} from "lucide-react";

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
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
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
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      });
    }
  } catch {
    // Ignore audio errors
  }
}
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
  onSaveTestForm: (title: string, year: string, category: string) => void;
  existingCategories?: string[];

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
  existingCategories = [],
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
  const [gameStreak, setGameStreak] = useState(0);
  const [gameMaxStreak, setGameMaxStreak] = useState(0);
  const [gameCorrectCount, setGameCorrectCount] = useState(0);
  const [gameWrongWordIds, setGameWrongWordIds] = useState<(string | number)[]>([]);
  const [gameFinished, setGameFinished] = useState(false);
  const [bookmarkedWordIds, setBookmarkedWordIds] = useState<(string | number)[]>([]);

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

  // Reset game state when test changes
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
    },
    [
      gameAnswerChecked,
      currentWord,
      hiddenOptions,
      currentOptions,
      gameStreak,
      isSoundEnabled,
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

  // Test form state
  const [testTitle, setTestTitle] = useState("");
  const [testYear, setTestYear] = useState("2024");
  const [testCategory, setTestCategory] = useState<string>("2024");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // Word form state
  const [wordText, setWordText] = useState("");
  const [wordIpa, setWordIpa] = useState("");
  const [wordPos, setWordPos] = useState("Verb");
  const [wordMeaning, setWordMeaning] = useState("");
  const [wordExample, setWordExample] = useState("");
  const [wordLevel, setWordLevel] = useState("B2");

  React.useEffect(() => {
    if (editingTest) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTestTitle(editingTest.title || editingTest.nameVi || "");
      setTestYear(String(editingTest.year || "2024"));
      const cat = String(editingTest.category || "2024");
      const standardList = ["2024", "2026", "600_essential", "2023", "HACKERS", "BUSINESS", "COLLOCATIONS"];
      if (standardList.includes(cat) || existingCategories.includes(cat)) {
        setTestCategory(cat);
        setIsCustomCategory(false);
        setCustomCategoryInput("");
      } else {
        setTestCategory("__CUSTOM__");
        setIsCustomCategory(true);
        setCustomCategoryInput(cat);
      }
    } else {
      setTestTitle("");
      setTestYear("2024");
      setTestCategory("2024");
      setIsCustomCategory(false);
      setCustomCategoryInput("");
    }
  }, [editingTest, showCreateTestModal, existingCategories]);

  React.useEffect(() => {
    if (editingWord) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWordText(editingWord.word || "");
      setWordIpa(editingWord.ipa || "");
      setWordPos(editingWord.partOfSpeech || editingWord.pos || "Verb");
      setWordMeaning(editingWord.meaning || editingWord.meanings?.[0]?.meaning || "");
      setWordExample(editingWord.example || editingWord.meanings?.[0]?.example || "");
      setWordLevel(editingWord.level || (editingWord.cefrLevel as string) || "B2");
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
              {wordListModalTest.words?.map((w: WordItem, index: number) => (
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
                {flashcardIndex + 1} / {(flashcardModalTest.words || []).length}
              </span>
            </div>

            {(() => {
              const currentWord = (flashcardModalTest.words || [])[flashcardIndex];
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
                      prev < (flashcardModalTest.words || []).length - 1 ? prev + 1 : 0
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
                      prev < (flashcardModalTest.words || []).length - 1 ? prev + 1 : 0
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
                      prev < (flashcardModalTest.words || []).length - 1 ? prev + 1 : 0
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

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsGameOverModal(false);
                      setGameLives(3);
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-sm shadow-lg shadow-rose-500/25 transition cursor-pointer flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    Hồi sinh (+3 Tim tiếp tục ôn)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsGameOverModal(false);
                      setGameFinished(true);
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition cursor-pointer flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Xem tổng kết điểm số
                  </button>
                </div>
              </div>
            ) : gameFinished ? (
              /* MÀN HÌNH TỔNG KẾT NẾU ĐÃ HOÀN THÀNH */
              <div className="py-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center mx-auto shadow-xl ring-8 ring-amber-50 animate-bounce">
                    <Trophy className="w-12 h-12 text-white fill-white" />
                  </div>
                  <Sparkles className="w-7 h-7 text-amber-500 absolute -top-1 -right-1 animate-spin" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    🎉 Hoàn Thành Bài Ôn Từ Nhanh!
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Bạn vừa hoàn thành toàn bộ {gameModalTest.words.length} câu hỏi ôn tập từ vựng của chủ đề này!
                  </p>
                </div>

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

                  {gameAnswerChecked && (
                    <button
                      type="button"
                      onClick={() => {
                        setGameAnswerChecked(false);
                        setGameSelectedOption(null);
                        setGameQuestionIndex((prev) =>
                          prev < (gameModalTest.words || []).length - 1 ? prev + 1 : 0
                        );
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                    >
                      Từ tiếp theo →
                    </button>
                  )}
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

                      {/* PHIÊN ÂM IPA */}
                      <div>
                        <span className="font-mono text-xs text-blue-100 bg-white/10 px-3 py-0.5 rounded-full border border-white/20 inline-block">
                          {currentWord.ipa}
                        </span>
                      </div>
                    </div>

                    {/* CÁC PHƯƠNG ÁN LỰA CHỌN (A, B, C, D) */}
                    <div className="space-y-2">
                      {currentOptions.map((opt, idx) => {
                        const isCorrect = opt === currentWord.meaning;
                        const isSelected = gameSelectedOption === idx;
                        const isHidden = hiddenOptions.includes(idx);

                        if (isHidden) {
                          return (
                            <div
                              key={idx}
                              className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-300 text-xs flex items-center justify-between line-through select-none"
                            >
                              <span className="font-bold">{String.fromCharCode(65 + idx)}. Đã loại trừ bởi 50:50</span>
                              <span className="text-[10px] text-slate-400">Trợ giúp 50:50</span>
                            </div>
                          );
                        }

                        let cardStyle =
                          "bg-white hover:bg-blue-50/40 border-slate-200 text-slate-800 hover:border-blue-300 hover:shadow-xs";
                        let badgeStyle = "bg-slate-100 text-slate-600 border border-slate-200";

                        if (gameAnswerChecked) {
                          if (isCorrect) {
                            cardStyle =
                              "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-md ring-2 ring-emerald-400/40";
                            badgeStyle = "bg-emerald-500 text-white border-emerald-600";
                          } else if (isSelected) {
                            cardStyle =
                              "bg-rose-50 border-rose-500 text-rose-900 font-bold shadow-md ring-2 ring-rose-400/40";
                            badgeStyle = "bg-rose-500 text-white border-rose-600";
                          } else {
                            cardStyle = "bg-slate-50 border-slate-200/60 text-slate-400 opacity-60";
                            badgeStyle = "bg-slate-200 text-slate-400 border-slate-300";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={gameAnswerChecked}
                            onClick={() => handlePickOption(idx)}
                            className={`w-full text-left py-2.5 px-3.5 sm:py-2.5 sm:px-4 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${cardStyle}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-colors relative ${badgeStyle}`}
                              >
                                {String.fromCharCode(65 + idx)}
                                <span className="absolute -bottom-1 -right-1 text-[8px] font-mono opacity-60 hidden sm:inline">
                                  {idx + 1}
                                </span>
                              </span>
                              <span className="text-xs sm:text-sm font-semibold leading-relaxed">
                                {opt}
                              </span>
                            </div>

                            {gameAnswerChecked && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                            )}
                            {gameAnswerChecked && isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
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
                const finalCategory = isCustomCategory ? (customCategoryInput.trim() || "Khác") : testCategory;
                onSaveTestForm(testTitle, testYear, finalCategory);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên bộ từ vựng *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Test 5 (ETS 2026) hoặc Hackers TOEIC"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thao tác phân loại</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      if (!isCustomCategory) {
                        setCustomCategoryInput("");
                      }
                    }}
                    className="w-full py-2 px-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer text-[11px]"
                  >
                    {isCustomCategory ? "← Chọn danh sách có sẵn" : "✏️ Tự gõ phân loại mới"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isCustomCategory ? "Nhập tên phân loại mới *" : "Chọn phân loại *"}
                </label>
                {!isCustomCategory ? (
                  <select
                    value={testCategory}
                    onChange={(e) => {
                      if (e.target.value === "__CUSTOM__") {
                        setIsCustomCategory(true);
                        setCustomCategoryInput("");
                      } else {
                        setTestCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  >
                    <optgroup label="Danh mục phổ biến">
                      <option value="2024">ETS 2024</option>
                      <option value="2026">ETS 2026</option>
                      <option value="600_essential">600 Essential Words</option>
                      <option value="2023">ETS 2023</option>
                      <option value="HACKERS">Hackers TOEIC</option>
                      <option value="BUSINESS">Kinh tế &amp; Công sở (Business)</option>
                      <option value="COLLOCATIONS">Cụm từ Collocations</option>
                    </optgroup>
                    {existingCategories.filter(
                      (c) => !["2024", "2026", "600_essential", "2023", "HACKERS", "BUSINESS", "COLLOCATIONS"].includes(c)
                    ).length > 0 && (
                      <optgroup label="Danh mục khác hiện có trong hệ thống">
                        {existingCategories
                          .filter(
                            (c) =>
                              !["2024", "2026", "600_essential", "2023", "HACKERS", "BUSINESS", "COLLOCATIONS"].includes(c)
                          )
                          .map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    <option value="__CUSTOM__">+ Tự nhập phân loại mới khác...</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: YBM 2024, Từ vựng Part 7, Kinh tế..."
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-blue-400 bg-blue-50/20 text-xs font-medium focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <p className="text-[11px] text-slate-400">
                      💡 Phân loại này sẽ tự động xuất hiện thành một tab lọc ngoài màn hình chính.
                    </p>
                  </div>
                )}
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
