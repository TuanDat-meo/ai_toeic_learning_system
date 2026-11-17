"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ExerciseCardData, VocabItem } from "@/app/admin/content/reading/types";
import {
  X,
  ShoppingBag,
  Bookmark,
  Volume2,
  Search,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from "lucide-react";

export interface StudentReadingVocabCartModalProps {
  card: ExerciseCardData | null;
  onClose: () => void;
}

const LOCAL_SAVED_VOCAB_KEY = "toeic_reading_saved_vocab";

export const StudentReadingVocabCartModal: React.FC<StudentReadingVocabCartModalProps> = ({
  card,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "saved">("all");
  const [savedBag, setSavedBag] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LOCAL_SAVED_VOCAB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync saved vocabulary when updated elsewhere
  useEffect(() => {
    const handleUpdate = (ev: Event) => {
      const customEv = ev as CustomEvent<{ savedBag?: string[] }>;
      if (customEv.detail?.savedBag) {
        setSavedBag(customEv.detail.savedBag);
      }
    };
    window.addEventListener("toeic-saved-vocab-updated", handleUpdate);
    return () => {
      window.removeEventListener("toeic-saved-vocab-updated", handleUpdate);
    };
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 3000);
    return () => clearTimeout(t);
  }, [toastMsg]);

  // Extract all unique vocabulary from card & questions
  const allVocab = useMemo<VocabItem[]>(() => {
    if (!card) return [];
    const seen = new Set<string>();
    const list: VocabItem[] = [];

    const add = (items?: VocabItem[]) => {
      (items || []).forEach((v) => {
        if (!v || !v.word?.trim()) return;
        const k = v.word.trim().toLowerCase();
        if (!seen.has(k)) {
          seen.add(k);
          list.push(v);
        }
      });
    };

    add(card.vocabList);
    (card.sampleQuestions || []).forEach((q) => add(q.vocabList));

    return list;
  }, [card]);

  // Filtered vocabulary list
  const filteredVocab = useMemo(() => {
    return allVocab.filter((v) => {
      const isSaved = savedBag.includes(v.word.toLowerCase());
      if (filterMode === "saved" && !isSaved) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        v.word.toLowerCase().includes(q) ||
        (v.meaning && v.meaning.toLowerCase().includes(q)) ||
        (v.ipa && v.ipa.toLowerCase().includes(q))
      );
    });
  }, [allVocab, savedBag, filterMode, search]);

  const toggleSaveWord = (word: string) => {
    const k = word.trim().toLowerCase();
    setSavedBag((prev) => {
      let next: string[];
      if (prev.includes(k)) {
        next = prev.filter((w) => w !== k);
        setToastMsg(`Đã bỏ lưu "${word}" khỏi giỏ từ vựng.`);
      } else {
        next = [...prev, k];
        setToastMsg(`✨ Đã lưu "${word}" vào giỏ từ vựng cá nhân!`);
      }
      try {
        localStorage.setItem(LOCAL_SAVED_VOCAB_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent("toeic-saved-vocab-updated", { detail: { savedBag: next } }));
      } catch {}
      return next;
    });
  };

  const saveAllToCart = () => {
    const newWords = allVocab.map((v) => v.word.trim().toLowerCase());
    setSavedBag((prev) => {
      const combined = Array.from(new Set([...prev, ...newWords]));
      try {
        localStorage.setItem(LOCAL_SAVED_VOCAB_KEY, JSON.stringify(combined));
        window.dispatchEvent(new CustomEvent("toeic-saved-vocab-updated", { detail: { savedBag: combined } }));
      } catch {}
      setToastMsg(`🎉 Đã lưu toàn bộ ${allVocab.length} từ vựng vào giỏ cá nhân!`);
      return combined;
    });
  };

  const speakWord = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = "en-US";
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shrink-0 shadow-inner">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg leading-snug truncate">
                Giỏ từ vựng: {card.title}
              </h3>
              <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-0.5">
                <span>{allVocab.length} từ vựng trọng tâm bài đọc</span>
                <span>•</span>
                <span className="font-semibold text-amber-200">
                  {allVocab.filter((v) => savedBag.includes(v.word.toLowerCase())).length} từ đã lưu
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filters & Actions */}
        <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm từ vựng, phiên âm hoặc nghĩa tiếng Việt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterMode === "all"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tất cả ({allVocab.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("saved")}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterMode === "saved"
                    ? "bg-amber-500 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>Đã lưu ({allVocab.filter((v) => savedBag.includes(v.word.toLowerCase())).length})</span>
              </button>
            </div>

            {allVocab.length > 0 && (
              <button
                type="button"
                onClick={saveAllToCart}
                className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap active:scale-95"
                title="Lưu tất cả từ vựng trong bài đọc này vào giỏ"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Lưu tất cả</span>
              </button>
            )}
          </div>
        </div>

        {/* Toast alert */}
        {toastMsg && (
          <div className="mx-4 mt-3 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Vocabulary List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
          {filteredVocab.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-bold text-slate-600">
                {filterMode === "saved"
                  ? "Bạn chưa lưu từ vựng nào trong bài đọc này vào giỏ cá nhân."
                  : "Không tìm thấy từ vựng nào phù hợp với từ khóa tìm kiếm."}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {filterMode === "saved"
                  ? "Bấm vào biểu tượng đánh dấu bookmark trên mỗi từ để lưu vào giỏ từ của bạn!"
                  : "Thử tìm kiếm với từ khóa khác hoặc bấm nút 'Tất cả' để xem toàn bộ từ vựng."}
              </p>
            </div>
          ) : (
            filteredVocab.map((item, idx) => {
              const isSaved = savedBag.includes(item.word.toLowerCase());

              return (
                <div
                  key={`${item.word}-${idx}`}
                  className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3.5 ${
                    isSaved
                      ? "bg-amber-50/40 border-amber-200 shadow-2xs hover:bg-amber-50/70"
                      : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-xs"
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900">
                        {item.word}
                      </span>
                      {item.ipa && (
                        <span className="text-xs font-mono text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {item.ipa}
                        </span>
                      )}
                      {item.pos && (
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {item.pos}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => speakWord(item.word, e)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                        title="Phát âm từ này"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                      {item.meaning}
                    </p>

                    {item.example && (
                      <div className="pt-1 text-xs text-slate-600 font-sans border-t border-slate-100 mt-1 space-y-0.5">
                        <p className="italic text-slate-700">
                          &quot;{typeof item.example === "string" ? item.example : item.example.en}&quot;
                        </p>
                        {typeof item.example === "object" && item.example.vi && (
                          <p className="text-[11px] text-slate-500">
                            → {item.example.vi}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSaveWord(item.word)}
                    title={isSaved ? "Bỏ lưu từ này" : "Lưu vào giỏ từ vựng cá nhân"}
                    className={`p-2.5 rounded-xl transition cursor-pointer shrink-0 active:scale-90 flex items-center justify-center ${
                      isSaved
                        ? "bg-amber-500 text-white shadow-xs hover:bg-amber-600"
                        : "bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-200"
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Mẹo: Nhấn vào biểu tượng loa để nghe giọng đọc bản xứ.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
