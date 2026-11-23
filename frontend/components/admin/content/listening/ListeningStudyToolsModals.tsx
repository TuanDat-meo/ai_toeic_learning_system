"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Volume2,
  Bookmark,
  ShoppingBag,
  Sparkles,
  Send,
  Loader2,
  Trash2,
  History,
  Clock,
  Zap,
  CheckCircle2,
} from "lucide-react";
import {
  lookupEnglishDictionary,
  type EnglishDictionarySuggestion,
} from "@/lib/api/english-dictionary";
import { askAiChat, type AiChatTurn } from "@/lib/api/chat";
import {
  fetchListeningAttempts,
  type ListeningAttemptRecord,
} from "@/lib/api/listening";

export interface SavedListeningVocabItem {
  word: string;
  ipa?: string;
  pos?: string;
  meaning: string;
  example?: string;
}

const SAVED_VOCAB_STORAGE_KEY = "toeic_listening_saved_vocab_items";

export function loadSavedListeningVocabItems(): SavedListeningVocabItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_VOCAB_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedListeningVocabItem[]) : [];
  } catch {
    return [];
  }
}

export function saveListeningVocabItemsToStorage(items: SavedListeningVocabItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SAVED_VOCAB_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

// ==========================================
// 1. MODAL TRA TỪ NHANH (DICTIONARY LOOKUP)
// ==========================================
interface ListeningDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWord: (item: SavedListeningVocabItem) => void;
  savedWords: SavedListeningVocabItem[];
  playAudio: (textOrUrl: string) => void;
}

export const ListeningDictionaryModal: React.FC<ListeningDictionaryModalProps> = ({
  isOpen,
  onClose,
  onSaveWord,
  savedWords,
  playAudio,
}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EnglishDictionarySuggestion | null>(null);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await lookupEnglishDictionary(query.trim());
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Không thể tra từ lúc này.");
    } finally {
      setLoading(false);
    }
  };

  const isSaved = result
    ? savedWords.some((w) => w.word.toLowerCase() === result.word.toLowerCase())
    : false;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Tra từ điển Anh – Việt nhanh</h3>
              <p className="text-[11px] text-slate-500">Tra phiên âm IPA, nghĩa tiếng Việt và lưu vào Giỏ từ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleLookup(e)} className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập từ vựng tiếng Anh (ví dụ: schedule, maintenance...)"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Tra cứu</span>
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {result ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-slate-900">{result.word}</span>
                  {result.phonetic && (
                    <span className="text-xs font-mono text-blue-600 font-semibold">{result.phonetic}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => playAudio(result.word)}
                    className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onSaveWord({
                      word: result.word,
                      ipa: result.phonetic,
                      pos: result.meanings[0]?.partOfSpeech || "vocab",
                      meaning: result.meanings[0]?.definition || "",
                      example: result.meanings[0]?.example || "",
                    })
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    isSaved
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-amber-600" : ""}`} />
                  <span>{isSaved ? "Đã lưu trong Giỏ" : "Lưu vào Giỏ từ"}</span>
                </button>
              </div>

              <div className="space-y-2">
                {result.meanings.slice(0, 5).map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs space-y-1">
                    {m.partOfSpeech && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                        {m.partOfSpeech}
                      </span>
                    )}
                    <p className="font-bold text-slate-800">{m.definition}</p>
                    {m.example && <p className="text-slate-500 italic">&ldquo;{m.example}&rdquo;</p>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !loading &&
            !error && (
              <p className="text-xs text-slate-400 text-center py-8">
                Nhập một từ tiếng Anh bất kỳ để xem phiên âm, nghĩa tiếng Việt và ví dụ.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MODAL GIỎ TỪ VỰNG CÁ NHÂN TRONG BÀI HỌC
// ==========================================
interface ListeningPersonalVocabBagModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedWords: SavedListeningVocabItem[];
  lessonVocab: SavedListeningVocabItem[];
  onToggleSaveWord: (item: SavedListeningVocabItem) => void;
  playAudio: (textOrUrl: string) => void;
  isLocked?: boolean;
}

export const ListeningPersonalVocabBagModal: React.FC<ListeningPersonalVocabBagModalProps> = ({
  isOpen,
  onClose,
  savedWords,
  lessonVocab,
  onToggleSaveWord,
  playAudio,
  isLocked = false,
}) => {
  const [tab, setTab] = useState<"saved" | "lesson">("saved");
  if (!isOpen) return null;

  const listToRender = tab === "saved" ? savedWords : isLocked ? [] : lessonVocab;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Giỏ từ vựng cá nhân</h3>
              <p className="text-[11px] text-slate-500">Quản lý từ vựng bạn đã lưu khi luyện nghe</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setTab("saved")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              tab === "saved" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-600"
            }`}
          >
            Đã lưu ({savedWords.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("lesson")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              tab === "lesson" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-600"
            }`}
          >
            Từ vựng câu hiện tại ({isLocked ? "Đang khóa" : lessonVocab.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {tab === "lesson" && isLocked ? (
            <p className="text-xs text-slate-400 text-center py-8">
              Hãy hoàn thành câu hỏi hiện tại trước để mở khóa từ vựng của câu này.
            </p>
          ) : listToRender.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              {tab === "saved"
                ? "Bạn chưa lưu từ vựng nào vào giỏ. Hãy bấm lưu từ ở cột Từ vựng hoặc công cụ Tra từ nhé!"
                : "Câu hỏi này chưa có danh sách từ vựng đi kèm."}
            </p>
          ) : (
            listToRender.map((it, idx) => {
              const isSaved = savedWords.some((w) => w.word.toLowerCase() === it.word.toLowerCase());
              return (
                <div
                  key={`${it.word}-${idx}`}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{it.word}</span>
                      {it.pos && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                          {it.pos}
                        </span>
                      )}
                      {it.ipa && <span className="text-xs font-mono text-blue-600">{it.ipa}</span>}
                      <button
                        type="button"
                        onClick={() => playAudio(it.word)}
                        className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{it.meaning}</p>
                    {it.example && <p className="text-[11px] text-slate-500 italic">&ldquo;{it.example}&rdquo;</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleSaveWord(it)}
                    className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${
                      isSaved
                        ? "bg-amber-100 text-amber-700 border-amber-300"
                        : "bg-white text-slate-400 border-slate-200 hover:text-blue-600"
                    }`}
                    title={isSaved ? "Bỏ lưu" : "Lưu vào giỏ từ"}
                  >
                    {tab === "saved" ? (
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-amber-600" : ""}`} />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. MODAL HỎI BÀI TRỢ LÝ AI (AI TUTOR)
// ==========================================
interface ListeningAiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: string;
  questionText?: string;
  transcript?: string;
  options?: Record<string, string>;
  correctAnswer?: string;
  explanation?: string;
  trapNote?: string;
  isAnswerUnlocked: boolean;
}

export const ListeningAiTutorModal: React.FC<ListeningAiTutorModalProps> = ({
  isOpen,
  onClose,
  part,
  questionText,
  transcript,
  options,
  correctAnswer,
  explanation,
  trapNote,
  isAnswerUnlocked,
}) => {
  const [messages, setMessages] = useState<{ role: "user" | "model"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const buildLocalFallbackReply = (promptText: string): string => {
    if (!isAnswerUnlocked) {
      return `💡 **Gợi ý chiến thuật làm ${part} (không tiết lộ đáp án):**\n- Đối với ${part}, hãy chú ý nghe kỹ động từ hành động chính và từ để hỏi ở đầu câu.\n- Tránh các phương án lặp lại từ đồng âm hoặc xuất hiện danh từ không có trong ngữ cảnh.\n- Hãy chọn đáp án trước để mình phân tích chi tiết lời thoại và đáp án đúng cho bạn nhé!`;
    }
    const optsSummary = options
      ? Object.entries(options)
          .map(([k, v]) => `(${k}) ${v}`)
          .join("\n")
      : "";
    return [
      `🎯 **Phân tích câu hỏi (${part}):**`,
      questionText ? `- **Câu hỏi:** ${questionText}` : "",
      transcript ? `- **Lời thoại gốc:** ${transcript}` : "",
      optsSummary ? `- **Các lựa chọn:**\n${optsSummary}` : "",
      correctAnswer ? `- **Đáp án đúng:** Chọn **${correctAnswer}**` : "",
      explanation ? `- **Giải thích:** ${explanation}` : "",
      trapNote ? `- **Bẫy cần tránh:** ${trapNote}` : "",
      promptText ? `\nNếu bạn cần giải thích sâu hơn về từ vựng hoặc cấu trúc câu trên, hãy hỏi tiếp nhé!` : "",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleSend = async (customPrompt?: string) => {
    const userPrompt = (customPrompt ?? input).trim();
    if (!userPrompt || loading) return;
    if (!customPrompt) setInput("");

    const nextMessages: { role: "user" | "model"; content: string }[] = [
      ...messages,
      { role: "user", content: userPrompt },
    ];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const contextInstruction = isAnswerUnlocked
        ? `Ngữ cảnh câu hỏi TOEIC ${part}: Câu hỏi="${questionText || ""}", Transcript="${transcript || ""}", Đáp án đúng="${correctAnswer || ""}", Giải thích="${explanation || ""}". Hãy trả lời ngắn gọn, súc tích bằng tiếng Việt cho câu hỏi sau của học viên: ${userPrompt}`
        : `Học viên đang làm câu hỏi TOEIC ${part} (chưa nộp bài nên TUYỆT ĐỐI KHÔNG tiết lộ đáp án đúng là ${correctAnswer || ""}). Câu hỏi="${questionText || ""}". Hãy gợi ý phương pháp nghe và từ khóa cần chú ý bằng tiếng Việt cho yêu cầu: ${userPrompt}`;

      const apiTurns: AiChatTurn[] = [
        ...messages.slice(-4),
        { role: "user", content: contextInstruction },
      ];
      const res = await askAiChat(apiTurns);
      setMessages([...nextMessages, { role: "model", content: res.reply || buildLocalFallbackReply(userPrompt) }]);
    } catch {
      setMessages([...nextMessages, { role: "model", content: buildLocalFallbackReply(userPrompt) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[86vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Hỏi bài Trợ lý AI TOEIC ({part})</h3>
              <p className="text-[11px] text-slate-500">
                {isAnswerUnlocked
                  ? "Phân tích chi tiết lời thoại, cấu trúc ngữ pháp và bẫy đáp án"
                  : "Chế độ gợi ý phương pháp (Không tiết lộ đáp án trước khi bạn làm bài)"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-1.5">
          {(isAnswerUnlocked
            ? [
                "Giải thích vì sao đáp án này đúng?",
                "Phân tích bẫy và từ đồng âm trong câu",
                "Rút trích cấu trúc & từ vựng quan trọng",
              ]
            : [
                "Gợi ý mẹo nghe bắt từ khóa câu này",
                "Cần lưu ý bẫy gì ở dạng bài này?",
              ]
          ).map((qPrompt) => (
            <button
              key={qPrompt}
              type="button"
              onClick={() => void handleSend(qPrompt)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition cursor-pointer"
            >
              ✨ {qPrompt}
            </button>
          ))}
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 min-h-[220px]">
          {messages.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-10 space-y-1">
              <p className="font-bold text-slate-700">Chọn một gợi ý phía trên hoặc đặt câu hỏi cho Trợ lý AI!</p>
              <p>Trợ lý sẽ phân tích dựa trên đúng nội dung câu nghe bạn đang mở.</p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-blue-600 text-white font-semibold ml-10"
                    : "bg-white border border-slate-200 text-slate-800 mr-6 shadow-2xs"
                }`}
              >
                {m.content}
              </div>
            ))
          )}
          {loading && (
            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 inline-flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Trợ lý AI đang phân tích câu hỏi...</span>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi của bạn về bài nghe này..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. MODAL LỊCH SỬ LÀM BÀI (ATTEMPT HISTORY)
// ==========================================
interface ListeningAttemptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId?: string;
  title?: string;
}

export const ListeningAttemptHistoryModal: React.FC<ListeningAttemptHistoryModalProps> = ({
  isOpen,
  onClose,
  targetId,
  title,
}) => {
  const [attempts, setAttempts] = useState<ListeningAttemptRecord[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);
    fetchListeningAttempts(targetId, 40)
      .then((list) => {
        if (!active) return;
        setAttempts(list);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen, targetId]);

  if (!isOpen) return null;

  const totalSessions = attempts.length;
  const totalXp = attempts.reduce((acc, a) => acc + (a.xpEarned || 0), 0);
  const totalDurationSec = attempts.reduce((acc, a) => acc + (a.durationSeconds || 0), 0);
  const avgAccuracy =
    totalSessions > 0
      ? Math.round(attempts.reduce((acc, a) => acc + (a.accuracyPercent || 0), 0) / totalSessions)
      : 0;

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return rem > 0 ? `${mins}p ${rem}s` : `${mins} phút`;
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {title || "Lịch sử luyện nghe & Chép chính tả"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Đồng bộ trực tiếp trên cơ sở dữ liệu PostgreSQL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <p className="text-[11px] font-semibold text-slate-500">Số lần làm bài</p>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">{totalSessions} lượt</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <p className="text-[11px] font-semibold text-emerald-700">Độ chính xác TB</p>
            <p className="text-base font-extrabold text-emerald-800 mt-0.5">{avgAccuracy}%</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80">
            <p className="text-[11px] font-semibold text-amber-700">Tổng điểm thưởng</p>
            <p className="text-base font-extrabold text-amber-800 mt-0.5">+{totalXp} XP</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80">
            <p className="text-[11px] font-semibold text-blue-700">Tổng thời gian</p>
            <p className="text-base font-extrabold text-blue-800 mt-0.5">{formatDuration(totalDurationSec)}</p>
          </div>
        </div>

        {/* List of attempts */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Đang tải lịch sử làm bài từ máy chủ...</span>
            </div>
          ) : attempts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-1">
              <p className="font-bold text-slate-600">Chưa có lịch sử làm bài nào được ghi nhận.</p>
              <p>Khi bạn nộp câu hỏi nghe chép hoặc bài luyện Part 1–4, kết quả sẽ được lưu tại đây.</p>
            </div>
          ) : (
            attempts.map((att) => (
              <div
                key={att.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px]">
                      {att.targetType === "DICTATION" ? "Nghe chép" : "Luyện Part"} • {att.part}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {att.targetTitle || att.targetId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>🕒 {new Date(att.createdAt).toLocaleString("vi-VN")}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(att.durationSeconds)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Đúng {att.correctCount}/{Math.max(att.completedQuestions, att.correctCount + att.wrongCount)} ({att.accuracyPercent}%)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-bold">
                    <Zap className="w-3 h-3 fill-amber-500 text-amber-600" />
                    +{att.xpEarned} XP
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};


