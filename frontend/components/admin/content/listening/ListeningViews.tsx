"use client";

import React, { useState } from "react";
import {
  Headphones,
  Search,
  CheckCircle2,
  Sliders,
  Globe,
  Play,
  Volume2,
  Eye,
  Layers,
  Sparkles,
  FileAudio,
} from "lucide-react";

// ==========================================
// 1. QUẢN LÝ TỆP AUDIO & GIỌNG ĐỌC BẢN XỨ (AUDIO BANK TỪ E:\Data)
// ==========================================
export const ListeningAudioAssetsView: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [filterPart, setFilterPart] = useState("all");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioUnits, setAudioUnits] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const currentAudioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    let active = true;
    const fetchUnits = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());
        if (filterYear !== "all") params.set("year", filterYear);
        if (filterPart !== "all") params.set("part", filterPart);
        params.set("limit", "150");

        const res = await fetch(`/api/listening/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setAudioUnits(data.items || []);
            setTotalCount(data.total || 0);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch listening audio units:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(fetchUnits, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, filterYear, filterPart]);

  const handleTogglePlay = (id: string, audioUrl?: string, textFallback?: string) => {
    if (playingId === id) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      setPlayingId(id);
      audio.play().catch(() => {
        // Fallback to speech synthesis if audio file cannot be played
        if (textFallback && typeof window !== "undefined") {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(textFallback);
          u.lang = "en-US";
          u.rate = 0.9;
          u.onend = () => setPlayingId(null);
          window.speechSynthesis.speak(u);
        } else {
          setPlayingId(null);
        }
      });
      audio.onended = () => {
        setPlayingId(null);
        currentAudioRef.current = null;
      };
    } else if (textFallback && typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(textFallback);
      u.lang = "en-US";
      u.rate = 0.9;
      u.onend = () => setPlayingId(null);
      window.speechSynthesis.speak(u);
      setPlayingId(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã câu, đề thi, nội dung transcript..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
          >
            <option value="all">Tất cả các bộ đề (2024, 2023, 2022)</option>
            <option value="2024">Bộ ETS 2024 (540 audio)</option>
            <option value="2023">Bộ ETS 2023 (486 audio)</option>
            <option value="2022">Bộ ETS 2022 (540 audio)</option>
          </select>

          <select
            value={filterPart}
            onChange={(e) => setFilterPart(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
          >
            <option value="all">Tất cả các Part</option>
            <option value="Part 1">Part 1 (Hình ảnh)</option>
            <option value="Part 2">Part 2 (Hỏi - Đáp)</option>
            <option value="Part 3">Part 3 (Hội thoại)</option>
            <option value="Part 4">Part 4 (Bài nói)</option>
          </select>

          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            {loading ? "Đang tải..." : <>Tổng: <strong className="text-blue-600">{totalCount}</strong> tệp audio</>}
          </span>
        </div>
      </div>

      {/* Audio Assets Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[190px]">Mã Audio / Tệp MP3</th>
                <th className="py-3.5 px-4 min-w-[130px]">Bộ đề thi</th>
                <th className="py-3.5 px-4 min-w-[110px]">Phần thi</th>
                <th className="py-3.5 px-4 min-w-[140px]">Độ khó / Cấp độ</th>
                <th className="py-3.5 px-4 min-w-[320px]">Nội dung Transcript &amp; Dịch nghĩa</th>
                <th className="py-3.5 px-4 min-w-[100px]">Hình ảnh</th>
                <th className="py-3.5 px-4 text-center min-w-[90px]">Nghe MP3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {audioUnits.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy tệp audio phù hợp trong kho dữ liệu Data.
                  </td>
                </tr>
              )}
              {audioUnits.map((aud) => (
                <tr key={aud.unitId} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FileAudio className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <p className="font-mono font-bold text-slate-900 leading-snug">
                          {aud.unitId}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {aud.audioFile || "MP3 audio"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold text-slate-800">
                      {aud.testCode || `ETS ${aud.year} Test ${aud.testNumber}`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 whitespace-nowrap inline-flex items-center">
                      {aud.partName ? aud.partName.split(":")[0] : `Part ${aud.partNumber}`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 whitespace-nowrap inline-flex items-center">
                      {aud.difficultySummary?.tier || "Tiêu chuẩn ETS"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 min-w-[320px]">
                    <p className="text-slate-800 font-semibold line-clamp-2">
                      {aud.transcriptEn || "Chưa có transcript"}
                    </p>
                    {aud.transcriptVi && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 italic">
                        {aud.transcriptVi}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {aud.imageUrl ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Có hình ảnh
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">Không</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleTogglePlay(aud.unitId, aud.audioUrl, aud.transcriptEn)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        playingId === aud.unitId
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "border-slate-200 hover:bg-blue-50 text-blue-600 bg-white"
                      }`}
                      title={playingId === aud.unitId ? "Dừng phát" : "Nghe audio cắt từng câu"}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
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

// ==========================================
// 2. MA TRẬN TỶ LỆ GIỌNG ĐỌC BẢN XỨ (ACCENT MATRIX)
// ==========================================
export const ListeningAccentMatrixView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900">
          Chỉ Dẫn Sư Phạm Về Biến Âm &amp; Nối Âm Thường Gặp Trong TOEIC
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-black text-slate-900">1. Âm /t/ giữa hai nguyên âm (Flap T)</h4>
            <p className="text-slate-600 leading-relaxed">
              Người Mỹ phát âm nhẹ thành âm /d/ (water -&gt; &apos;wader&apos;). Người Anh giữ nguyên âm bật /t/ rõ ràng.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-black text-slate-900">2. Nuốt âm /r/ cuối từ (Non-rhoticity)</h4>
            <p className="text-slate-600 leading-relaxed">
              Giọng Anh và Úc thường nuốt âm /r/ ở cuối từ (car, water, schedule) và kéo dài nguyên âm trước đó.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
