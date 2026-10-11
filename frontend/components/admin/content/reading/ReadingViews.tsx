"use client";

import React, { useState } from "react";
import {
  FileText,
  Search,
  CheckCircle2,
  Sliders,
  TrendingUp,
  Clock,
  Eye,
  BookOpen,
  Filter,
  Layers,
  Save,
} from "lucide-react";
import { ExerciseCardData } from "@/app/admin/content/reading/types";

// ==========================================
// 1. KHO ĐOẠN VĂN READING PART 6 & 7 (PASSAGE BANK)
// ==========================================
export const ReadingPassageBankView: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [previewPassage, setPreviewPassage] = useState<{
    id: string;
    title: string;
    type: string;
    format: string;
    wordCount: number;
    text: string;
    translation: string;
  } | null>(null);

  const passages = [
    {
      id: "pas-101",
      title: "Notice of Office System Maintenance & Migration",
      type: "Part 7 Single",
      format: "Memo / Thông báo nội bộ",
      wordCount: 145,
      questionsCount: 3,
      topic: "Công nghệ thông tin",
      text: "Please be informed that the internal cloud server will undergo scheduled maintenance this Saturday, October 15, starting at 10:00 PM. Access to company email, remote shared folders, and ERP tools will be temporarily unavailable for approximately four hours.",
      translation: "Xin lưu ý rằng máy chủ đám mây nội bộ sẽ được bảo trì định kỳ vào thứ Bảy tuần này, ngày 15 tháng 10, bắt đầu từ 22:00. Quyền truy cập vào email công ty, thư mục chia sẻ từ xa và công cụ ERP sẽ tạm thời bị ngắt trong khoảng 4 giờ.",
    },
    {
      id: "pas-102",
      title: "Customer Order Confirmation & Return Policy",
      type: "Part 7 Double",
      format: "Email & Invoice / Hóa đơn đôi",
      wordCount: 280,
      questionsCount: 5,
      topic: "Bán lẻ & Hậu cần",
      text: "Dear Mr. Dawson, Thank you for purchasing with Vanguard Electronics. Your order #VG-8902 has been successfully processed and dispatched via express courier. Please retain the attached digital invoice for any future warranty or refund claims.",
      translation: "Kính gửi ông Dawson, Cảm ơn ông đã mua hàng tại Vanguard Electronics. Đơn hàng #VG-8902 của ông đã được xử lý thành công và gửi đi qua dịch vụ chuyển phát nhanh. Vui lòng giữ hóa đơn đính kèm cho các yêu cầu bảo hành hoặc hoàn tiền trong tương lai.",
    },
    {
      id: "pas-103",
      title: "Corporate Annual Conference Schedule & Speaker Biographies",
      type: "Part 7 Triple",
      format: "Schedule & Profiles / Đoạn ba",
      wordCount: 395,
      questionsCount: 5,
      topic: "Sự kiện & Hội nghị",
      text: "The 14th Global Leadership Summit will commence on November 3 at the Pacific Grand Hotel. Keynote speakers include Dr. Helena Vance, Chief Economist at Apex Financial, and Marcus Sterling, CEO of Sterling Innovations.",
      translation: "Hội nghị Thượng đỉnh Lãnh đạo Toàn cầu lần thứ 14 sẽ khai mạc vào ngày 3 tháng 11 tại Khách sạn Pacific Grand. Các diễn giả chính bao gồm Tiến sĩ Helena Vance, Chuyên gia kinh tế trưởng tại Apex Financial, và Marcus Sterling, Tổng giám đốc của Sterling Innovations.",
    },
    {
      id: "pas-104",
      title: "Quarterly Financial Performance & Dividend Announcement",
      type: "Part 6",
      format: "Press Release / Thông cáo báo chí",
      wordCount: 160,
      questionsCount: 4,
      topic: "Tài chính doanh nghiệp",
      text: "Apex Industrial announced record fiscal third-quarter results today, reporting a 22 percent increase in operating revenue compared to the same period last year, driven by expanding international shipments.",
      translation: "Apex Industrial hôm nay đã công bố kết quả tài chính quý ba kỷ lục, báo cáo mức tăng 22% doanh thu hoạt động so với cùng kỳ năm ngoái, nhờ vào việc mở rộng các lô hàng quốc tế.",
    },
  ];

  const filtered = passages.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.topic.toLowerCase().includes(search.toLowerCase()) ||
      p.format.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "ALL" || p.type.startsWith(filterType);
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề bài đọc, thể loại, chủ đề..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả định dạng đoạn văn</option>
            <option value="Part 6">Part 6 (Điền đoạn văn)</option>
            <option value="Part 7 Single">Part 7 (Đoạn đơn - Single)</option>
            <option value="Part 7 Double">Part 7 (Đoạn đôi - Double)</option>
            <option value="Part 7 Triple">Part 7 (Đoạn ba - Triple)</option>
          </select>
          <span className="text-xs font-bold text-slate-500">
            Tổng: <strong>{filtered.length}</strong> bài đọc
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 w-20">Mã</th>
                <th className="py-3.5 px-4 min-w-[280px]">Tiêu đề bài đọc TOEIC</th>
                <th className="py-3.5 px-4 min-w-[130px]">Định dạng</th>
                <th className="py-3.5 px-4 min-w-[180px]">Chủ đề bài đọc</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">Độ dài</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">Số câu hỏi</th>
                <th className="py-3.5 px-4 text-center min-w-[90px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{p.id}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 leading-snug">{p.title}</p>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-extrabold inline-block mt-0.5 whitespace-nowrap">
                      {p.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{p.format}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 whitespace-nowrap inline-flex items-center">
                      {p.topic}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-800 whitespace-nowrap">
                    {p.wordCount} từ
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900 whitespace-nowrap">
                    {p.questionsCount} câu
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setPreviewPassage(p)}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                      title="Xem trước bài đọc song ngữ"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Passage */}
      {previewPassage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {previewPassage.type} • {previewPassage.format}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {previewPassage.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPassage(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 leading-relaxed space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Đoạn văn gốc tiếng Anh:
                </span>
                <p className="font-serif text-sm leading-relaxed text-slate-800">
                  {previewPassage.text}
                </p>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 text-xs font-medium text-slate-800 leading-relaxed space-y-1">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Bản dịch đối chiếu tiếng Việt:
                </span>
                <p className="text-slate-700 italic">{previewPassage.translation}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewPassage(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. PHÂN TÍCH TỐC ĐỘ ĐỌC & ĐỘ HIỂU BÀI (READING ANALYTICS)
// ==========================================
export const ReadingAnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900">
          Biểu Đồ Phân Phối Tỷ Lệ Đạt Theo Dạng Bài Đọc
        </h3>
        <div className="space-y-3 text-xs font-semibold text-slate-700">
          <div>
            <div className="flex justify-between mb-1">
              <span>Part 5 - Câu đơn ngữ pháp &amp; từ vựng (Incomplete Sentences)</span>
              <span className="text-emerald-600 font-bold">78.5% đúng</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "78.5%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Part 6 - Điền từ đoạn văn (Text Completion)</span>
              <span className="text-blue-600 font-bold">72.0% đúng</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "72.0%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Part 7 - Đọc hiểu đoạn đơn (Single Passage)</span>
              <span className="text-indigo-600 font-bold">67.4% đúng</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: "67.4%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Part 7 - Đọc hiểu đoạn đôi &amp; ba (Multiple Passages)</span>
              <span className="text-rose-600 font-bold">58.2% đúng (Cần chú trọng)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: "58.2%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. CẤU HÌNH PHÂN LOẠI & LỘ TRÌNH READING
// ==========================================
export const ReadingCurriculumView: React.FC = () => {
  const [maxPart7Minutes, setMaxPart7Minutes] = useState(55);
  const [enableBilingualByDefault, setEnableBilingualByDefault] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-5 max-w-2xl">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Sliders className="w-5 h-5 text-blue-600" />
        <h3 className="text-sm font-black text-slate-900">
          Cấu Hình Phân Bổ Thời Gian &amp; Chế Độ Đọc Hiểu
        </h3>
      </div>

      <div className="space-y-4 text-xs font-semibold text-slate-700">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span>Thời gian khuyến nghị cho toàn bộ Part 7:</span>
            <span className="font-bold text-blue-600">{maxPart7Minutes} phút</span>
          </div>
          <input
            type="range"
            min="45"
            max="65"
            step="1"
            value={maxPart7Minutes}
            onChange={(e) => setMaxPart7Minutes(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl cursor-pointer">
          <input
            type="checkbox"
            checked={enableBilingualByDefault}
            onChange={(e) => setEnableBilingualByDefault(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
          />
          <span className="text-slate-800">
            Kích hoạt tính năng xem song ngữ Anh-Việt khi học viên review câu sai
          </span>
        </label>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saved ? "Đã lưu!" : "Lưu cấu hình"}</span>
        </button>
        {saved && (
          <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
            Đã lưu cấu hình bài đọc thành công!
          </span>
        )}
      </div>
    </div>
  );
};
