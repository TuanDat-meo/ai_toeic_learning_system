"use client";

import React, { useMemo, useRef, useState } from "react";
import { VocabItem } from "@/app/admin/content/reading/types";
import {
  ReadingQuestionLike,
  ReadingSubPassageLike,
  ReadingVocabCandidate,
  enrichReadingVocabBatch,
  enrichReadingVocabWord,
  extractReadingVocabCandidates,
} from "@/lib/readingVocabExtractor";
import {
  Sparkles,
  Check,
  Plus,
  Trash2,
  Volume2,
  Loader2,
  Search,
  Wand2,
  BookOpen,
  FileQuestion,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export interface AppliedVocabEntry {
  item: VocabItem;
  targetQuestionIndex: number | null;
}

export interface ReadingVocabExtractorPanelProps {
  passageText?: string;
  passages?: ReadingSubPassageLike[];
  questions?: ReadingQuestionLike[];
  existingWords?: string[];
  allowCardLevelTarget?: boolean;
  defaultTargetQuestionIndex?: number | null;
  applyButtonLabel?: string;
  compact?: boolean;
  onApplyVocab: (entries: AppliedVocabEntry[]) => void;
}

interface DraftVocabEntry {
  id: string;
  word: string;
  loading: boolean;
  targetQuestionIndex: number | null;
  sources: string[];
  item: VocabItem;
}

export const ReadingVocabExtractorPanel: React.FC<ReadingVocabExtractorPanelProps> = ({
  passageText,
  passages,
  questions = [],
  existingWords = [],
  allowCardLevelTarget = false,
  defaultTargetQuestionIndex = 0,
  applyButtonLabel = "Áp dụng vào bản preview",
  compact = false,
  onApplyVocab,
}) => {
  const [sourceFilter, setSourceFilter] = useState<"all" | "passage" | "question">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customWordInput, setCustomWordInput] = useState("");
  const [drafts, setDrafts] = useState<DraftVocabEntry[]>([]);
  const [batchEnriching, setBatchEnriching] = useState(false);
  const [applyFeedback, setApplyFeedback] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [scanLimit, setScanLimit] = useState(32);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const resolvedDefaultTarget = useMemo(() => {
    if (questions.length === 0) return null;
    if (defaultTargetQuestionIndex === null && allowCardLevelTarget) return null;
    const idx = typeof defaultTargetQuestionIndex === "number" ? defaultTargetQuestionIndex : 0;
    return Math.min(Math.max(0, idx), questions.length - 1);
  }, [questions.length, defaultTargetQuestionIndex, allowCardLevelTarget]);

  const candidates = useMemo(() => {
    return extractReadingVocabCandidates({
      passageText,
      passages,
      questions,
      existingWords,
      maxCandidates: scanLimit,
    });
  }, [passageText, passages, questions, existingWords, scanLimit]);

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return candidates.filter((cand) => {
      if (sourceFilter === "passage" && !cand.hasPassageSource) return false;
      if (sourceFilter === "question" && !cand.hasQuestionSource) return false;
      if (q && !cand.word.toLowerCase().includes(q) && !(cand.previewMeaning || "").toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [candidates, sourceFilter, searchQuery]);

  const selectedWordKeys = useMemo(
    () => new Set(drafts.map((d) => d.id.toLowerCase())),
    [drafts]
  );

  const playSpeech = (word: string, region: "UK" | "US", id: string) => {
    if (!word || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setPlayingId(`${id}-${region}`);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = region === "UK" ? "en-GB" : "en-US";
    utterance.rate = 0.88;
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleCandidate = async (cand: ReadingVocabCandidate) => {
    const idKey = cand.word.toLowerCase();
    setApplyFeedback(null);

    if (selectedWordKeys.has(idKey)) {
      const existingController = abortControllersRef.current.get(idKey);
      existingController?.abort();
      abortControllersRef.current.delete(idKey);
      setDrafts((prev) => prev.filter((d) => d.id.toLowerCase() !== idKey));
      return;
    }

    const targetIdx =
      cand.suggestedQuestionIndex !== null && cand.suggestedQuestionIndex < questions.length
        ? cand.suggestedQuestionIndex
        : resolvedDefaultTarget;

    const placeholder: DraftVocabEntry = {
      id: idKey,
      word: cand.word,
      loading: true,
      targetQuestionIndex: targetIdx,
      sources: cand.sources,
      item: {
        word: cand.word,
        pos: cand.previewPos || "n",
        level: "B1",
        ipa: cand.previewIpa || "",
        meaning: cand.previewMeaning || "Đang tra cứu & hoàn thiện nghĩa...",
        example: cand.contextSentence ? { en: cand.contextSentence, vi: "" } : undefined,
      },
    };

    setDrafts((prev) => [...prev, placeholder]);

    const controller = new AbortController();
    abortControllersRef.current.set(idKey, controller);

    try {
      const enriched = await enrichReadingVocabWord(cand.word, {
        contextSentence: cand.contextSentence,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setDrafts((prev) =>
        prev.map((d) =>
          d.id.toLowerCase() === idKey
            ? { ...d, loading: false, item: enriched }
            : d
        )
      );
    } catch {
      if (!controller.signal.aborted) {
        setDrafts((prev) =>
          prev.map((d) =>
            d.id.toLowerCase() === idKey
              ? { ...d, loading: false }
              : d
          )
        );
      }
    } finally {
      abortControllersRef.current.delete(idKey);
    }
  };

  const handleSelectTopRecommended = async () => {
    const toSelect = filteredCandidates
      .filter((c) => !c.alreadyAdded && !selectedWordKeys.has(c.word.toLowerCase()))
      .slice(0, 6);

    if (toSelect.length === 0) return;

    setApplyFeedback(null);
    setBatchEnriching(true);

    const placeholders: DraftVocabEntry[] = toSelect.map((cand) => ({
      id: cand.word.toLowerCase(),
      word: cand.word,
      loading: true,
      targetQuestionIndex:
        cand.suggestedQuestionIndex !== null && cand.suggestedQuestionIndex < questions.length
          ? cand.suggestedQuestionIndex
          : resolvedDefaultTarget,
      sources: cand.sources,
      item: {
        word: cand.word,
        pos: cand.previewPos || "n",
        level: "B1",
        ipa: cand.previewIpa || "",
        meaning: cand.previewMeaning || "Đang hoàn thiện...",
        example: cand.contextSentence ? { en: cand.contextSentence, vi: "" } : undefined,
      },
    }));

    setDrafts((prev) => [...prev, ...placeholders]);

    try {
      const enrichedMap = await enrichReadingVocabBatch(
        toSelect.map((c) => ({ word: c.word, contextSentence: c.contextSentence })),
        4
      );
      setDrafts((prev) =>
        prev.map((d) => {
          const match = enrichedMap.get(d.id.toLowerCase());
          return match ? { ...d, loading: false, item: match } : { ...d, loading: false };
        })
      );
    } finally {
      setBatchEnriching(false);
    }
  };

  const handleAddCustomWord = async () => {
    const clean = customWordInput.trim();
    if (!clean || !/^[a-zA-Z][a-zA-Z' -]*$/.test(clean)) return;

    const idKey = clean.toLowerCase();
    setCustomWordInput("");
    setApplyFeedback(null);

    if (selectedWordKeys.has(idKey)) return;

    const contextCandidate = candidates.find((c) => c.word.toLowerCase() === idKey);
    const placeholder: DraftVocabEntry = {
      id: idKey,
      word: clean,
      loading: true,
      targetQuestionIndex: resolvedDefaultTarget,
      sources: ["Thêm thủ công"],
      item: {
        word: clean,
        pos: "n",
        level: "B1",
        ipa: "",
        meaning: "Đang tra cứu từ điển...",
        example: contextCandidate?.contextSentence
          ? { en: contextCandidate.contextSentence, vi: "" }
          : undefined,
      },
    };
    setDrafts((prev) => [...prev, placeholder]);

    const enriched = await enrichReadingVocabWord(clean, {
      contextSentence: contextCandidate?.contextSentence,
    });
    setDrafts((prev) =>
      prev.map((d) => (d.id.toLowerCase() === idKey ? { ...d, loading: false, item: enriched } : d))
    );
  };

  const handleUpdateDraftItem = (id: string, patch: Partial<VocabItem>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, item: { ...d.item, ...patch } } : d))
    );
  };

  const handleUpdateDraftTarget = (id: string, targetIdx: number | null) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, targetQuestionIndex: targetIdx } : d))
    );
  };

  const handleApplyAll = () => {
    if (drafts.length === 0) return;
    const readyEntries: AppliedVocabEntry[] = drafts.map((d) => ({
      item: {
        ...d.item,
        word: d.item.word.trim() || d.word,
        meaning: d.item.meaning.trim() || "Từ vựng trọng tâm TOEIC",
      },
      targetQuestionIndex: d.targetQuestionIndex,
    }));

    onApplyVocab(readyEntries);
    setApplyFeedback(`Đã tự hoàn thiện và áp dụng ${readyEntries.length} từ vựng vào bản xem trước!`);
    setDrafts([]);
  };

  const hasContentToScan =
    Boolean(passageText?.trim()) ||
    Boolean(passages && passages.some((p) => p.text?.trim())) ||
    questions.some((q) => Boolean((q.question || q.questionText || "").trim()));

  return (
    <div
      className={`rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 ${
        compact ? "p-3.5 space-y-3" : "p-4 sm:p-5 space-y-4"
      } shadow-2xs`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Trích xuất &amp; Gợi ý từ vựng từ Đoạn văn / Câu hỏi
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold">
                {candidates.length} từ gợi ý
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Chọn các từ cần học bên dưới — hệ thống sẽ tự tra IPA, từ loại, nghĩa và ví dụ ngữ cảnh ra bản xem trước.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={filteredCandidates.filter((c) => !c.alreadyAdded && !selectedWordKeys.has(c.word.toLowerCase())).length === 0 || batchEnriching}
            onClick={handleSelectTopRecommended}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            {batchEnriching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>Chọn nhanh 6 từ gợi ý</span>
          </button>

          {drafts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                abortControllersRef.current.forEach((c) => c.abort());
                abortControllersRef.current.clear();
                setDrafts([]);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-600 transition cursor-pointer"
            >
              Bỏ chọn ({drafts.length})
            </button>
          )}
        </div>
      </div>

      {applyFeedback && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{applyFeedback}</span>
        </div>
      )}

      {!hasContentToScan ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-white/80 text-center text-xs text-slate-500">
          Chưa có nội dung đoạn văn hoặc câu hỏi để trích xuất từ vựng. Hãy nhập hoặc dán đề thi trước!
        </div>
      ) : (
        <>
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSourceFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  sourceFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Tất cả ({candidates.length})
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter("passage")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  sourceFilter === "passage"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Đoạn văn ({candidates.filter((c) => c.hasPassageSource).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter("question")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  sourceFilter === "question"
                    ? "bg-purple-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileQuestion className="w-3 h-3" />
                <span>Câu hỏi &amp; Đáp án ({candidates.filter((c) => c.hasQuestionSource).length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lọc từ gợi ý..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              {scanLimit < 60 && candidates.length >= scanLimit && (
                <button
                  type="button"
                  onClick={() => setScanLimit(60)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 cursor-pointer shrink-0"
                  title="Mở rộng danh sách quét"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Xem thêm</span>
                </button>
              )}
            </div>
          </div>

          {/* Step 1: Extracted Candidate Word Chips */}
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
            {filteredCandidates.length === 0 ? (
              <span className="text-xs text-slate-400 py-2">
                Không có từ nào phù hợp bộ lọc hiện tại.
              </span>
            ) : (
              filteredCandidates.map((cand) => {
                const isSelected = selectedWordKeys.has(cand.word.toLowerCase());
                return (
                  <button
                    key={cand.id}
                    type="button"
                    onClick={() => handleToggleCandidate(cand)}
                    title={cand.contextSentence || cand.sources.join(", ")}
                    className={`group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold"
                        : cand.alreadyAdded
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:border-emerald-300"
                        : cand.inCuratedDict
                        ? "bg-white border-indigo-200 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/50"
                        : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold">{cand.word}</span>
                    {cand.previewPos && (
                      <span
                        className={`text-[10px] px-1 rounded ${
                          isSelected
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {cand.previewPos}
                      </span>
                    )}
                    <span
                      className={`text-[10px] ${
                        isSelected ? "text-indigo-100" : "text-slate-400"
                      }`}
                    >
                      {cand.sources[0]}
                    </span>
                    {cand.alreadyAdded && !isSelected && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 rounded-full">
                        Đã có
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Custom word quick add */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customWordInput}
              onChange={(e) => setCustomWordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAddCustomWord();
                }
              }}
              placeholder="Hoặc nhập thêm từ/cụm từ bất kỳ để tự tra & hoàn thiện..."
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-hidden focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => void handleAddCustomWord()}
              disabled={!customWordInput.trim()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 disabled:opacity-50 text-indigo-700 text-xs font-bold transition cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm vào preview</span>
            </button>
          </div>
        </>
      )}

      {/* Step 2: Live Auto-Completed Preview Section */}
      {drafts.length > 0 && (
        <div className="pt-3 border-t border-indigo-200/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h5 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                Bản xem trước từ vựng đã tự hoàn thiện ({drafts.length} từ)
              </h5>
              <p className="text-[11px] text-slate-500">
                Bạn có thể chỉnh nhanh IPA, nghĩa tiếng Việt, câu ví dụ hoặc đổi câu gắn trước khi áp dụng.
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplyAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {applyButtonLabel} ({drafts.length})
              </span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="p-3 rounded-xl bg-white border border-indigo-200 shadow-2xs space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      {draft.item.word}
                    </span>
                    {draft.loading ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Đang tra từ điển...
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        Đã tự hoàn thiện
                      </span>
                    )}
                    {draft.sources.map((src) => (
                      <span
                        key={src}
                        className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                      >
                        {src}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => playSpeech(draft.item.word, "UK", draft.id)}
                      className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 text-[10px] font-bold text-slate-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                      title="Nghe phát âm Anh-Anh"
                    >
                      <Volume2 className={`w-3 h-3 ${playingId === `${draft.id}-UK` ? "text-blue-600 animate-pulse" : ""}`} />
                      UK
                    </button>
                    <button
                      type="button"
                      onClick={() => playSpeech(draft.item.word, "US", draft.id)}
                      className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 text-[10px] font-bold text-slate-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                      title="Nghe phát âm Anh-Mỹ"
                    >
                      <Volume2 className={`w-3 h-3 ${playingId === `${draft.id}-US` ? "text-blue-600 animate-pulse" : ""}`} />
                      US
                    </button>

                    {(questions.length > 0 || allowCardLevelTarget) && (
                      <select
                        value={draft.targetQuestionIndex === null ? "__card__" : String(draft.targetQuestionIndex)}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateDraftTarget(draft.id, val === "__card__" ? null : Number(val));
                        }}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-800 focus:outline-hidden"
                      >
                        {allowCardLevelTarget && (
                          <option value="__card__">Chung bài đọc</option>
                        )}
                        {questions.map((q, qIdx) => (
                          <option key={qIdx} value={String(qIdx)}>
                            Câu {qIdx + 1} {q.questionNum ? `(#${q.questionNum})` : ""}
                          </option>
                        ))}
                      </select>
                    )}

                    <button
                      type="button"
                      onClick={() => setDrafts((prev) => prev.filter((d) => d.id !== draft.id))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Bỏ từ này khỏi bản xem trước"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Editable Auto-Completed Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Phiên âm IPA</label>
                    <input
                      type="text"
                      value={draft.item.ipa}
                      onChange={(e) => handleUpdateDraftItem(draft.id, { ipa: e.target.value })}
                      placeholder="/.../"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Từ loại</label>
                    <select
                      value={draft.item.pos}
                      onChange={(e) => handleUpdateDraftItem(draft.id, { pos: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="n">n</option>
                      <option value="v">v</option>
                      <option value="adj">adj</option>
                      <option value="adv">adv</option>
                      <option value="prep">prep</option>
                      <option value="conj">conj</option>
                      <option value="phr">phr</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Trình độ</label>
                    <select
                      value={draft.item.level || "B1"}
                      onChange={(e) => handleUpdateDraftItem(draft.id, { level: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                    </select>
                  </div>
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nghĩa tiếng Việt</label>
                    <input
                      type="text"
                      value={draft.item.meaning}
                      onChange={(e) => handleUpdateDraftItem(draft.id, { meaning: e.target.value })}
                      placeholder="Nhập nghĩa tiếng Việt..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Ví dụ ngữ cảnh</label>
                  <input
                    type="text"
                    value={draft.item.example?.en || ""}
                    onChange={(e) =>
                      handleUpdateDraftItem(draft.id, {
                        example: {
                          en: e.target.value,
                          vi: draft.item.example?.vi || "",
                        },
                      })
                    }
                    placeholder="Câu ví dụ trích từ bài đọc hoặc từ điển..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] italic text-slate-700 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
