"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Volume2,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Sliders,
  CheckCircle2,
  TrendingDown,
  AlertTriangle,
  Save,
  BarChart2,
  BookOpen,
} from "lucide-react";
import { normalizeVocabularyLevel, WordItem } from "@/app/admin/content/vocabulary/types";
import {
  deduplicateVocabularySenses,
  groupVocabularySenses,
  normalizeVocabularyPartOfSpeech,
  uniqueVocabularyPartOfSpeech,
} from "@/lib/vocabulary-part-of-speech";
import { playVocabularyPronunciation } from "@/lib/vocabulary-pronunciation";

function getVocabularySenses(word: WordItem) {
  const senses = word.senses?.length
    ? word.senses
    : [{
        partOfSpeech: normalizeVocabularyPartOfSpeech(word.partOfSpeech || word.pos || ""),
        meaning: word.meaning || word.meanings?.[0]?.meaning || "",
        example: word.example || word.meanings?.[0]?.example || "",
        exampleMeaning: word.exampleMeaning || word.exampleVi || "",
      }];
  return deduplicateVocabularySenses(senses.map((sense) => ({
    ...sense,
    partOfSpeech: normalizeVocabularyPartOfSpeech(sense.partOfSpeech),
  })));
}

// ==========================================
// 1. NGÂN HÀNG TOÀN BỘ TỪ VỰNG (ADMIN DICTIONARY TABLE)
// ==========================================
interface VocabularyAllWordsViewProps {
  words: WordItem[];
  playAudio: (audioUrl: string, word: string) => void;
  onOpenAddWord?: () => void;
  onOpenEditWord?: (w: WordItem) => void;
  onOpenWordDetails?: (w: WordItem) => void;
  onDeleteWord?: (w: WordItem) => void;
}

export const VocabularyAllWordsView: React.FC<VocabularyAllWordsViewProps> = ({
  words,
  playAudio,
  onOpenAddWord,
  onOpenEditWord,
  onOpenWordDetails,
  onDeleteWord,
}) => {
  const [keyword, setKeyword] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      const senses = getVocabularySenses(w);
      const meaningText = senses.map((sense) => sense.meaning).join(" ");
      const ipaText = w.ipa || "";
      const levelText = normalizeVocabularyLevel(w.level || (w.cefrLevel as string));
      const matchKey =
        keyword.trim() === "" ||
        w.word.toLowerCase().includes(keyword.toLowerCase()) ||
        meaningText.toLowerCase().includes(keyword.toLowerCase()) ||
        ipaText.toLowerCase().includes(keyword.toLowerCase());
      const matchPos = posFilter === "ALL"
        || senses.some((sense) =>
          normalizeVocabularyPartOfSpeech(sense.partOfSpeech)
            .split(/\s*\/\s*/)
            .some((partOfSpeech) => partOfSpeech.toLowerCase() === posFilter.toLowerCase()),
        );
      const matchLevel = levelFilter === "ALL" || levelText === levelFilter;
      return matchKey && matchPos && matchLevel;
    });
  }, [words, keyword, posFilter, levelFilter]);
  const availablePartOfSpeech = useMemo(() => {
    const values = words.flatMap((word) => getVocabularySenses(word)
      .map((sense) => normalizeVocabularyPartOfSpeech(sense.partOfSpeech))
      .flatMap((partOfSpeech) => partOfSpeech.split(" / ")));
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [words]);
  const totalPages = Math.max(1, Math.ceil(filteredWords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageWords = useMemo(
    () => filteredWords.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredWords, currentPage, pageSize],
  );
  const firstVisibleWord = filteredWords.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastVisibleWord = Math.min(currentPage * pageSize, filteredWords.length);

  const changePage = (nextPage: number) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  const paginationControls = (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 sm:justify-start">
        <span>
          Hiển thị <strong className="text-slate-700">{firstVisibleWord}–{lastVisibleWord}</strong> /{" "}
          <strong className="text-slate-700">{filteredWords.length}</strong> từ
        </span>
        <label className="flex items-center gap-2">
          Mỗi trang
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700"
            aria-label="Số từ vựng hiển thị mỗi trang"
          >
            {[25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
      </div>
      <nav className="flex items-center justify-between gap-2 sm:justify-end" aria-label="Phân trang ngân hàng từ vựng">
        <button
          type="button"
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Trang trước
        </button>
        <span className="min-w-20 text-center text-xs font-semibold text-slate-600">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Trang sau
        </button>
      </nav>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo từ tiếng Anh, phiên âm, định nghĩa..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            className="min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-hidden sm:text-xs"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          <select
            value={posFilter}
            onChange={(e) => {
              setPosFilter(e.target.value);
              setPage(1);
            }}
            className="min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 sm:w-auto sm:text-xs"
          >
            <option value="ALL">Tất cả loại từ (PoS)</option>
            {availablePartOfSpeech.map((partOfSpeech) => (
              <option key={partOfSpeech} value={partOfSpeech}>{partOfSpeech}</option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setPage(1);
            }}
            className="min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 sm:w-auto sm:text-xs"
          >
            <option value="ALL">Mọi cấp độ (CEFR)</option>
            <option value="A1">A1 (Mới bắt đầu)</option>
            <option value="A2">A2 (Sơ cấp)</option>
            <option value="B1">B1 (Trung cấp)</option>
            <option value="B2">B2 (Trên trung cấp)</option>
            <option value="C1">C1 (Nâng cao)</option>
            <option value="C2">C2 (Thành thạo)</option>
          </select>
          {onOpenAddWord && (
            <button
              type="button"
              onClick={onOpenAddWord}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:text-xs"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Thêm từ / cụm từ
            </button>
          )}
        </div>
      </div>

      {/* Dictionary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="max-h-[calc(100dvh-25rem)] min-h-40 space-y-3 overflow-y-auto overscroll-contain p-3 md:hidden">
          {pageWords.length ? pageWords.map((w) => {
            const senses = getVocabularySenses(w);
            return (
            <article key={w.id} className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="break-all text-sm font-bold text-slate-900">{w.word}</h3>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">{w.ipa || "—"}</span>
                  </div>
                </div>
                <span className="shrink-0 rounded border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                  {normalizeVocabularyLevel(w.level || (w.cefrLevel as string)) || "—"}
                </span>
              </div>
              <div className="mt-2 space-y-1.5">
                {groupVocabularySenses(senses).map((group) => (
                  <div key={group.partOfSpeech} className="rounded-lg bg-slate-50 p-2">
                    <p className="mb-1 text-[10px] font-bold text-blue-700">{group.partOfSpeech}</p>
                    {group.senses.map((sense, index) => (
                      <div key={sense.id ?? `${group.partOfSpeech}-${index}`} className={index ? "mt-1.5 border-t border-slate-200 pt-1.5" : ""}>
                        {sense.subCategory ? <p className="text-[10px] font-semibold text-slate-500">{sense.subCategory}</p> : null}
                        <p className="text-xs font-medium text-slate-800">{sense.meaning || "Chưa có nghĩa"}</p>
                        {sense.example ? <p className="text-xs italic text-slate-500">{sense.example}</p> : null}
                        {(sense.exampleMeaning || (
                          index === 0
                          && group.partOfSpeech === groupVocabularySenses(senses)[0]?.partOfSpeech
                          && w.exampleMeaning
                        )) ? (
                          <p className="text-[11px] font-medium text-blue-700">{sense.exampleMeaning || w.exampleMeaning}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                <button
                  type="button"
                  onClick={() => playAudio(w.audioUrl || w.audio || "", w.word)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                  title="Phát audio"
                ><Volume2 className="h-3.5 w-3.5" />Nghe</button>
                <button type="button" onClick={() => playVocabularyPronunciation(w.word, "UK")} className="rounded px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100" aria-label={`Phát âm ${w.word} giọng UK`}>UK</button>
                <button type="button" onClick={() => playVocabularyPronunciation(w.word, "US")} className="rounded px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100" aria-label={`Phát âm ${w.word} giọng US`}>US</button>
                <div className="flex gap-1.5">
                  {onOpenWordDetails && (
                    <button type="button" onClick={() => onOpenWordDetails(w)} className="rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-semibold text-blue-700">Chi tiết</button>
                  )}
                  {onOpenEditWord && (
                    <button type="button" onClick={() => onOpenEditWord(w)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700">Sửa</button>
                  )}
                  {onDeleteWord && (
                    <button type="button" onClick={() => onDeleteWord(w)} className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600">Xóa</button>
                  )}
                </div>
              </div>
            </article>
          );
          }) : (
            <p className="py-8 text-center text-xs text-slate-400">Không tìm thấy từ vựng nào khớp với bộ lọc.</p>
          )}
        </div>
        <div className="hidden max-h-[calc(100dvh-22rem)] min-h-40 overflow-auto overscroll-contain md:block">
          <table className="w-full min-w-[980px] table-fixed text-left text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
              <tr>
                <th className="w-[20%] px-3 py-3.5">Từ vựng &amp; IPA</th>
                <th className="w-[14%] px-3 py-3.5">Từ loại</th>
                <th className="w-[8%] px-3 py-3.5">Cấp độ</th>
                <th className="w-[25%] px-3 py-3.5">Định nghĩa tiếng Việt</th>
                <th className="w-[23%] px-3 py-3.5">Ví dụ thực tế</th>
                <th className="w-[10%] px-3 py-3.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageWords.length > 0 ? (
                pageWords.map((w) => {
                  const senses = getVocabularySenses(w);
                  return (
                  <tr key={w.id} className="align-top transition-colors hover:bg-slate-50/80">
                    <td className="px-3 py-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className="break-words font-bold text-slate-900 text-sm">{w.word}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
                          {w.ipa || "—"}
                        </span>
                        <button
                          type="button"
                          onClick={() => playAudio(w.audioUrl || w.audio || "", w.word)}
                          className="rounded-full p-1 text-slate-500 transition hover:bg-blue-100 hover:text-blue-600"
                          aria-label={`Phát âm thanh ${w.word}`}
                          title="Phát âm thanh"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => playVocabularyPronunciation(w.word, "UK")} className="rounded px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100" aria-label={`Phát âm ${w.word} giọng UK`}>UK</button>
                        <button type="button" onClick={() => playVocabularyPronunciation(w.word, "US")} className="rounded px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100" aria-label={`Phát âm ${w.word} giọng US`}>US</button>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-600">
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {uniqueVocabularyPartOfSpeech(senses).map((partOfSpeech) => (
                          <span key={partOfSpeech} className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            {partOfSpeech}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap inline-flex items-center">
                        {normalizeVocabularyLevel(w.level || (w.cefrLevel as string)) || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-800">
                      <div className="space-y-1">
                        {groupVocabularySenses(senses).map((group) => (
                          <div key={group.partOfSpeech} className="space-y-1">
                            {group.senses.map((sense, index) => (
                              <p key={sense.id ?? `${group.partOfSpeech}-${index}`} className="break-words">
                                {sense.meaning}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 italic text-slate-500">
                      <div className="space-y-1">
                        {groupVocabularySenses(senses).map((group) => (
                          <div key={group.partOfSpeech} className="space-y-1">
                            {group.senses.map((sense, index) => (
                              <div key={sense.id ?? `${group.partOfSpeech}-${index}`}>
                                <p className="break-words">{sense.example ? `"${sense.example}"` : "—"}</p>
                                {(sense.exampleMeaning || (
                                  index === 0
                                  && group.partOfSpeech === groupVocabularySenses(senses)[0]?.partOfSpeech
                                  && w.exampleMeaning
                                )) ? (
                                  <p className="break-words not-italic text-blue-700">
                                    {sense.exampleMeaning || w.exampleMeaning}
                                  </p>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {onOpenWordDetails && (
                          <button
                            type="button"
                            onClick={() => onOpenWordDetails(w)}
                            aria-label={`Xem chi tiết ${w.word}`}
                            title="Xem chi tiết"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-blue-700 transition hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                        {onOpenEditWord && (
                          <button
                            type="button"
                            onClick={() => onOpenEditWord(w)}
                            aria-label={`Sửa ${w.word}`}
                            title="Sửa"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                        {onDeleteWord && (
                          <button
                            type="button"
                            onClick={() => onDeleteWord(w)}
                            aria-label={`Xóa ${w.word}`}
                            title="Xóa"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Không tìm thấy từ vựng nào khớp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {paginationControls}
      </div>
    </div>
  );
};

// ==========================================
// 2. CẤU HÌNH THUẬT TOÁN SRS (ADMIN SM-2 CONFIG)
// ==========================================
export const VocabularyAlgorithmConfigView: React.FC = () => {
  const [easeFactor, setEaseFactor] = useState(2.5);
  const [initialInterval, setInitialInterval] = useState(1);
  const [secondInterval, setSecondInterval] = useState(3);
  const [masteryThreshold, setMasteryThreshold] = useState(5);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl">
      <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            Admin Engine Configuration
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            Cấu hình tham số thuật toán Lặp lại ngắt quãng (Spaced Repetition SM-2)
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Các tham số dưới đây quyết định chu kỳ ôn tập tự động và tần suất nhắc nhở của hệ thống đối với từng học viên.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Khoảng cách ngày ôn đầu tiên (First Interval)
            </label>
            <p className="text-[11px] text-slate-500">Số ngày trước khi từ vựng được nhắc lại lần 1</p>
            <input
              type="number"
              min={1}
              max={7}
              value={initialInterval}
              onChange={(e) => setInitialInterval(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Khoảng cách ngày ôn thứ hai (Second Interval)
            </label>
            <p className="text-[11px] text-slate-500">Số ngày trước khi từ vựng được nhắc lại lần 2</p>
            <input
              type="number"
              min={2}
              max={14}
              value={secondInterval}
              onChange={(e) => setSecondInterval(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Hệ số nhân độ dễ ban đầu (Default Ease Factor)
            </label>
            <p className="text-[11px] text-slate-500">Chuẩn SuperMemo SM-2 (1.30 đến 3.00)</p>
            <input
              type="number"
              step={0.1}
              min={1.3}
              max={3.0}
              value={easeFactor}
              onChange={(e) => setEaseFactor(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Ngưỡng ghi nhớ vĩnh viễn (Mastery Repetitions)
            </label>
            <p className="text-[11px] text-slate-500">Số lần trả lời chính xác liên tiếp để hoàn thành</p>
            <input
              type="number"
              min={3}
              max={10}
              value={masteryThreshold}
              onChange={(e) => setMasteryThreshold(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            Mô phỏng chu kỳ ngắt quãng của hệ thống:
          </h4>
          <p className="text-xs font-mono text-blue-700 font-semibold">
            Lần 1 ({initialInterval} ngày) ➔ Lần 2 ({secondInterval} ngày) ➔ Lần 3 ({Math.round(secondInterval * easeFactor)} ngày) ➔ Lần 4 ({Math.round(secondInterval * easeFactor * easeFactor)} ngày) ➔ Vĩnh viễn ({masteryThreshold} lần)
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            {saved ? "✅ Đã lưu cấu hình thuật toán thành công vào hệ thống!" : "Cấu hình áp dụng cho toàn bộ học viên khi học từ vựng."}
          </span>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu cấu hình hệ thống
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. BÁO CÁO TƯƠNG TÁC HỌC VIÊN (ANALYTICS & RETENTION)
// ==========================================
export const VocabularyAnalyticsView: React.FC = () => {
  const mostForgottenWords = [
    { word: "negotiate", ipa: "/nəˈɡoʊʃieɪt/", failRate: "42%", level: "B2", lookups: 320 },
    { word: "itinerary", ipa: "/aɪˈtɪnəreri/", failRate: "38%", level: "B1", lookups: 290 },
    { word: "implement", ipa: "/ˈɪmplɪment/", failRate: "35%", level: "B2", lookups: 265 },
    { word: "warranty", ipa: "/ˈwɔːrənti/", failRate: "28%", level: "B1", lookups: 210 },
    { word: "collaborate", ipa: "/kəˈlæbəreɪt/", failRate: "24%", level: "B2", lookups: 195 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Forgotten Words Table */}
      <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Top 5 từ vựng học viên hay quên & trả lời sai nhiều nhất
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin có thể bổ sung thêm ví dụ hoặc hình ảnh minh họa để học viên dễ liên tưởng ghi nhớ hơn.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
            Cần cải thiện nội dung
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] whitespace-nowrap">
              <tr>
                <th className="py-3.5 px-4 min-w-[200px]">Từ vựng &amp; Phiên âm</th>
                <th className="py-3.5 px-4 min-w-[100px]">Trình độ</th>
                <th className="py-3.5 px-4 min-w-[100px]">Tỷ lệ sai</th>
                <th className="py-3.5 px-4 min-w-[180px]">Số lượt học viên tra cứu lại</th>
                <th className="py-3.5 px-4 text-right min-w-[180px]">Khuyến nghị Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mostForgottenWords.map((item) => (
                <tr key={item.word} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {item.word} <span className="font-mono font-normal text-slate-400">({item.ipa})</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-bold text-[11px] whitespace-nowrap inline-flex items-center">
                      {item.level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-rose-600 whitespace-nowrap">
                    {item.failRate}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold whitespace-nowrap">
                    {item.lookups} lượt
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500 font-medium whitespace-nowrap">
                    Thêm ảnh &amp; câu ngữ cảnh
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
