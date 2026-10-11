"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Volume2,
  Sliders,
  CheckCircle2,
  TrendingDown,
  AlertTriangle,
  Save,
  BarChart2,
  BookOpen,
} from "lucide-react";
import { WordItem } from "@/app/admin/content/vocabulary/types";

// ==========================================
// 1. NGÂN HÀNG TOÀN BỘ TỪ VỰNG (ADMIN DICTIONARY TABLE)
// ==========================================
interface VocabularyAllWordsViewProps {
  words: WordItem[];
  playAudio: (text: string) => void;
  onOpenAddWord?: () => void;
  onOpenEditWord?: (w: WordItem) => void;
  onDeleteWord?: (w: WordItem) => void;
}

export const VocabularyAllWordsView: React.FC<VocabularyAllWordsViewProps> = ({
  words,
  playAudio,
  onOpenEditWord,
  onDeleteWord,
}) => {
  const [keyword, setKeyword] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      const matchKey =
        keyword.trim() === "" ||
        w.word.toLowerCase().includes(keyword.toLowerCase()) ||
        w.meaning.toLowerCase().includes(keyword.toLowerCase()) ||
        w.ipa.toLowerCase().includes(keyword.toLowerCase());
      const matchPos = posFilter === "ALL" || w.partOfSpeech.toLowerCase() === posFilter.toLowerCase();
      const matchLevel = levelFilter === "ALL" || w.level === levelFilter;
      return matchKey && matchPos && matchLevel;
    });
  }, [words, keyword, posFilter, levelFilter]);

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo từ tiếng Anh, phiên âm, định nghĩa..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={posFilter}
            onChange={(e) => setPosFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">Tất cả loại từ (PoS)</option>
            <option value="Noun">Noun (Danh từ)</option>
            <option value="Verb">Verb (Động từ)</option>
            <option value="Adjective">Adjective (Tính từ)</option>
            <option value="Adverb">Adverb (Phó từ)</option>
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">Mọi cấp độ (CEFR)</option>
            <option value="B1">B1 (Căn bản)</option>
            <option value="B2">B2 (Trung cấp)</option>
            <option value="C1">C1 (Nâng cao)</option>
          </select>
        </div>
      </div>

      {/* Dictionary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
              <tr>
                <th className="py-3.5 px-4 min-w-[200px]">Từ vựng &amp; IPA</th>
                <th className="py-3.5 px-4 min-w-[100px]">Từ loại</th>
                <th className="py-3.5 px-4 min-w-[90px]">Cấp độ</th>
                <th className="py-3.5 px-4 min-w-[220px]">Định nghĩa tiếng Việt</th>
                <th className="py-3.5 px-4 min-w-[260px]">Ví dụ thực tế</th>
                <th className="py-3.5 px-4 text-right min-w-[100px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWords.length > 0 ? (
                filteredWords.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{w.word}</span>
                        <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {w.ipa}
                        </span>
                        <button
                          type="button"
                          onClick={() => playAudio(w.word)}
                          className="p-1 rounded-full hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition"
                          title="Phát âm thanh"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] whitespace-nowrap inline-flex items-center">
                        {w.partOfSpeech}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap inline-flex items-center">
                        {w.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs truncate">
                      {w.meaning}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                      &quot;{w.example}&quot;
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onOpenEditWord && (
                          <button
                            type="button"
                            onClick={() => onOpenEditWord(w)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition"
                          >
                            Sửa
                          </button>
                        )}
                        {onDeleteWord && (
                          <button
                            type="button"
                            onClick={() => onDeleteWord(w)}
                            className="px-2 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold transition"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
