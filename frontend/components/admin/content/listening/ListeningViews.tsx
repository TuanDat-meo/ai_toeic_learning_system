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
// 1. QUẢN LÝ TỆP AUDIO & GIỌNG ĐỌC BẢN XỨ (AUDIO BANK)
// ==========================================
export const ListeningAudioAssetsView: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filterAccent, setFilterAccent] = useState("ALL");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const audioAssets = [
    {
      id: "aud-001",
      fileName: "ets2024_test01_part1_q01.mp3",
      part: "Part 1",
      speakerAccent: "Mỹ (American)",
      duration: "0:18",
      bitrate: "192 kbps",
      transcriptSnippet: "A) She is adjusting her glasses. B) She is typing on a keyboard...",
      status: "Sẵn sàng",
    },
    {
      id: "aud-002",
      fileName: "ets2024_test01_part2_q07.mp3",
      part: "Part 2",
      speakerAccent: "Anh (British)",
      duration: "0:14",
      bitrate: "192 kbps",
      transcriptSnippet: "Where should I submit the reimbursement form? - In the accounting office.",
      status: "Sẵn sàng",
    },
    {
      id: "aud-003",
      fileName: "ets2024_test01_part3_c01.mp3",
      part: "Part 3",
      speakerAccent: "Úc (Australian)",
      duration: "0:42",
      bitrate: "192 kbps",
      transcriptSnippet: "Hello, this is Brenda calling from Apex logistics regarding our delivery...",
      status: "Sẵn sàng",
    },
    {
      id: "aud-004",
      fileName: "ets2024_test01_part4_t01.mp3",
      part: "Part 4",
      speakerAccent: "Canada (Canadian)",
      duration: "0:56",
      bitrate: "192 kbps",
      transcriptSnippet: "Attention all passengers on flight QA-402 to Chicago...",
      status: "Sẵn sàng",
    },
  ];

  const filtered = audioAssets.filter((a) => {
    const matchSearch =
      a.fileName.toLowerCase().includes(search.toLowerCase()) ||
      a.transcriptSnippet.toLowerCase().includes(search.toLowerCase());
    const matchAccent =
      filterAccent === "ALL" || a.speakerAccent.includes(filterAccent);
    return matchSearch && matchAccent;
  });

  const handleTogglePlay = (id: string, text: string) => {
    if (playingId === id) {
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
      setPlayingId(null);
    } else {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "en-US";
        u.rate = 0.9;
        u.onend = () => setPlayingId(null);
        window.speechSynthesis.speak(u);
      }
      setPlayingId(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên file audio, nội dung câu thoại..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={filterAccent}
            onChange={(e) => setFilterAccent(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả giọng đọc bản xứ</option>
            <option value="Mỹ">Giọng Mỹ (American)</option>
            <option value="Anh">Giọng Anh (British)</option>
            <option value="Úc">Giọng Úc (Australian)</option>
            <option value="Canada">Giọng Canada</option>
          </select>
          <span className="text-xs font-bold text-slate-500">
            Tổng: <strong>{filtered.length}</strong> tệp audio
          </span>
        </div>
      </div>

      {/* Audio Assets Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[200px]">Tên file MP3</th>
                <th className="py-3.5 px-4 min-w-[120px]">Phần thi</th>
                <th className="py-3.5 px-4 min-w-[170px]">Giọng đọc bản ngữ</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">Thời lượng</th>
                <th className="py-3.5 px-4 min-w-[280px]">Nội dung Transcript mẫu</th>
                <th className="py-3.5 px-4 min-w-[130px]">Trạng thái</th>
                <th className="py-3.5 px-4 text-center min-w-[90px]">Nghe thử</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((aud) => (
                <tr key={aud.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FileAudio className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <p className="font-mono font-bold text-slate-900 leading-snug">
                          {aud.fileName}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {aud.bitrate}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 whitespace-nowrap inline-flex items-center">
                      {aud.part}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 whitespace-nowrap inline-flex items-center">
                      {aud.speakerAccent}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-700 whitespace-nowrap">
                    {aud.duration}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 line-clamp-2 min-w-[280px]">
                    {aud.transcriptSnippet}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {aud.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleTogglePlay(aud.id, aud.transcriptSnippet)}
                      className={`p-1.5 rounded-xl border transition cursor-pointer ${
                        playingId === aud.id
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-slate-200 hover:bg-blue-50 text-blue-600"
                      }`}
                      title="Nghe thử audio"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
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
