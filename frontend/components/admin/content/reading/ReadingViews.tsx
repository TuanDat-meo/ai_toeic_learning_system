"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Zap,
  Gauge,
  AlertTriangle,
  Target,
  Sparkles,
  BarChart3,
  Timer,
  Check,
  RotateCcw,
  Info,
  ShieldCheck,
  Flame,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  TrendingDown,
  HelpCircle,
  Award,
  Play,
  Edit3,
  Trash2,
  Plus,
  Languages,
} from "lucide-react";
import { ExerciseCardData } from "@/app/admin/content/reading/types";

export interface ReadingPassageBankViewProps {
  cards?: ExerciseCardData[];
  onStartPractice?: (card: ExerciseCardData) => void;
  onOpenEditCard?: (card: ExerciseCardData, e?: React.MouseEvent) => void;
  onOpenDeleteConfirm?: (card: ExerciseCardData) => void;
  onOpenCreatePassage?: () => void;
}

interface PassageItem {
  id: string;
  title: string;
  type: string;
  format: string;
  wordCount: number;
  questionsCount: number;
  vocabCount: number;
  topic: string;
  text: string;
  translation: string;
  hasBilingual: boolean;
  card: ExerciseCardData;
}

// ==========================================
// 1. KHO ĐOẠN VĂN READING PART 6 & 7 (PASSAGE BANK)
// ==========================================
export const ReadingPassageBankView: React.FC<ReadingPassageBankViewProps> = ({
  cards = [],
  onStartPractice,
  onOpenEditCard,
  onOpenDeleteConfirm,
  onOpenCreatePassage,
}) => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [bilingualFilter, setBilingualFilter] = useState<"ALL" | "BILINGUAL" | "UNTRANSLATED">("ALL");
  const [previewPassage, setPreviewPassage] = useState<PassageItem | null>(null);

  // Unified list of passages derived from real cards + built-in examples
  const passageItems: PassageItem[] = useMemo(() => {
    // 1. Built-in fallback passages
    const builtinPassages: PassageItem[] = [
      {
        id: "pas-101",
        title: "Notice of Office System Maintenance & Migration",
        type: "Part 7 Single",
        format: "Memo / Thông báo nội bộ",
        wordCount: 145,
        questionsCount: 3,
        vocabCount: 2,
        topic: "Công nghệ thông tin",
        text: "Please be informed that the internal cloud server will undergo scheduled maintenance this Saturday, October 15, starting at 10:00 PM. Access to company email, remote shared folders, and ERP tools will be temporarily unavailable for approximately four hours.",
        translation:
          "Xin lưu ý rằng máy chủ đám mây nội bộ sẽ được bảo trì định kỳ vào thứ Bảy tuần này, ngày 15 tháng 10, bắt đầu từ 22:00. Quyền truy cập vào email công ty, thư mục chia sẻ từ xa và công cụ ERP sẽ tạm thời bị ngắt trong khoảng 4 giờ.",
        hasBilingual: true,
        card: {
          id: "pas-101",
          title: "Notice of Office System Maintenance & Migration",
          category: "part7",
          subCategory: "text_types",
          tag: "Part 7 Single · Memo nội bộ",
          totalQuestions: 3,
          studiedQuestions: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          passageText:
            "Please be informed that the internal cloud server will undergo scheduled maintenance this Saturday, October 15, starting at 10:00 PM. Access to company email, remote shared folders, and ERP tools will be temporarily unavailable for approximately four hours.",
          passageTextVi:
            "Xin lưu ý rằng máy chủ đám mây nội bộ sẽ được bảo trì định kỳ vào thứ Bảy tuần này, ngày 15 tháng 10, bắt đầu từ 22:00. Quyền truy cập vào email công ty, thư mục chia sẻ từ xa và công cụ ERP sẽ tạm thời bị ngắt trong khoảng 4 giờ.",
          sampleQuestions: [
            {
              questionNum: "147",
              question: "What is the main purpose of the notice?",
              bilingual: "Mục đích chính của thông báo là gì?",
              options: [
                "To announce a scheduled server maintenance",
                "To introduce a new cloud software",
                "To warn about an unexpected network outage",
                "To request password changes from employees",
              ],
              optionMeanings: [
                "Thông báo lịch bảo trì máy chủ định kỳ",
                "Giới thiệu phần mềm đám mây mới",
                "Cảnh báo về sự cố mạng bất ngờ",
                "Yêu cầu nhân viên đổi mật khẩu",
              ],
              correctIndex: 0,
              explanation: "Đoạn đầu nêu rõ 'the internal cloud server will undergo scheduled maintenance...'",
              vocabList: [
                { word: "maintenance", pos: "n", level: "B1", ipa: "/ˈmeɪntənəns/", meaning: "sự bảo trì, bảo dưỡng" },
                { word: "migration", pos: "n", level: "B2", ipa: "/maɪˈɡreɪʃn/", meaning: "sự di chuyển dữ liệu, chuyển đổi hệ thống" },
              ],
            },
          ],
        },
      },
      {
        id: "pas-102",
        title: "Customer Order Confirmation & Return Policy",
        type: "Part 7 Double",
        format: "Email & Invoice / Hóa đơn đôi",
        wordCount: 280,
        questionsCount: 5,
        vocabCount: 2,
        topic: "Bán lẻ & Hậu cần",
        text: "Dear Mr. Dawson, Thank you for purchasing with Vanguard Electronics. Your order #VG-8902 has been successfully processed and dispatched via express courier. Please retain the attached digital invoice for any future warranty or refund claims.",
        translation:
          "Kính gửi ông Dawson, Cảm ơn ông đã mua hàng tại Vanguard Electronics. Đơn hàng #VG-8902 của ông đã được xử lý thành công và gửi đi qua dịch vụ chuyển phát nhanh. Vui lòng giữ hóa đơn đính kèm cho các yêu cầu bảo hành hoặc hoàn tiền trong tương lai.",
        hasBilingual: true,
        card: {
          id: "pas-102",
          title: "Customer Order Confirmation & Return Policy",
          category: "part7",
          subCategory: "text_types",
          tag: "Part 7 Double · Email & Invoice",
          totalQuestions: 5,
          studiedQuestions: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          passageText:
            "Dear Mr. Dawson, Thank you for purchasing with Vanguard Electronics. Your order #VG-8902 has been successfully processed and dispatched via express courier. Please retain the attached digital invoice for any future warranty or refund claims.",
          passageTextVi:
            "Kính gửi ông Dawson, Cảm ơn ông đã mua hàng tại Vanguard Electronics. Đơn hàng #VG-8902 của ông đã được xử lý thành công và gửi đi qua dịch vụ chuyển phát nhanh. Vui lòng giữ hóa đơn đính kèm cho các yêu cầu bảo hành hoặc hoàn tiền trong tương lai.",
          sampleQuestions: [
            {
              questionNum: "153",
              question: "What is indicated about order #VG-8902?",
              bilingual: "Điều gì được chỉ ra về đơn hàng #VG-8902?",
              options: [
                "It has already been shipped",
                "It was delayed due to stock shortage",
                "It requires additional payment verification",
                "It cannot be returned or refunded",
              ],
              optionMeanings: [
                "Đơn hàng đã được gửi đi",
                "Bị chậm trễ do thiếu hàng",
                "Cần xác minh thanh toán bổ sung",
                "Không thể đổi trả hoặc hoàn tiền",
              ],
              correctIndex: 0,
              explanation: "Câu 'Your order #VG-8902 has been successfully processed and dispatched via express courier.' xác nhận đơn đã gửi đi.",
              vocabList: [
                { word: "dispatch", pos: "v", level: "B2", ipa: "/dɪˈspætʃ/", meaning: "gửi đi, phái đi" },
                { word: "warranty", pos: "n", level: "B1", ipa: "/ˈwɔːrənti/", meaning: "chế độ bảo hành" },
              ],
            },
          ],
        },
      },
      {
        id: "pas-103",
        title: "Corporate Annual Conference Schedule & Speaker Biographies",
        type: "Part 7 Triple",
        format: "Schedule & Profiles / Đoạn ba",
        wordCount: 395,
        questionsCount: 5,
        vocabCount: 1,
        topic: "Sự kiện & Hội nghị",
        text: "The 14th Global Leadership Summit will commence on November 3 at the Pacific Grand Hotel. Keynote speakers include Dr. Helena Vance, Chief Economist at Apex Financial, and Marcus Sterling, CEO of Sterling Innovations.",
        translation:
          "Hội nghị Thượng đỉnh Lãnh đạo Toàn cầu lần thứ 14 sẽ khai mạc vào ngày 3 tháng 11 tại Khách sạn Pacific Grand. Các diễn giả chính bao gồm Tiến sĩ Helena Vance, Chuyên gia kinh tế trưởng tại Apex Financial, và Marcus Sterling, Tổng giám đốc của Sterling Innovations.",
        hasBilingual: true,
        card: {
          id: "pas-103",
          title: "Corporate Annual Conference Schedule & Speaker Biographies",
          category: "part7",
          subCategory: "text_types",
          tag: "Part 7 Triple · Hội nghị & Diễn giả",
          totalQuestions: 5,
          studiedQuestions: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          passageText:
            "The 14th Global Leadership Summit will commence on November 3 at the Pacific Grand Hotel. Keynote speakers include Dr. Helena Vance, Chief Economist at Apex Financial, and Marcus Sterling, CEO of Sterling Innovations.",
          passageTextVi:
            "Hội nghị Thượng đỉnh Lãnh đạo Toàn cầu lần thứ 14 sẽ khai mạc vào ngày 3 tháng 11 tại Khách sạn Pacific Grand. Các diễn giả chính bao gồm Tiến sĩ Helena Vance, Chuyên gia kinh tế trưởng tại Apex Financial, và Marcus Sterling, Tổng giám đốc của Sterling Innovations.",
          sampleQuestions: [
            {
              questionNum: "160",
              question: "When will the summit begin?",
              bilingual: "Hội nghị thượng đỉnh sẽ bắt đầu khi nào?",
              options: ["On November 3", "On November 14", "On October 15", "On December 1"],
              optionMeanings: ["Vào ngày 3 tháng 11", "Vào ngày 14 tháng 11", "Vào ngày 15 tháng 10", "Vào ngày 1 tháng 12"],
              correctIndex: 0,
              explanation: "Câu đầu tiên: 'The 14th Global Leadership Summit will commence on November 3...'",
              vocabList: [
                { word: "commence", pos: "v", level: "B2", ipa: "/kəˈmens/", meaning: "bắt đầu, khởi sự" },
              ],
            },
          ],
        },
      },
      {
        id: "pas-104",
        title: "Quarterly Financial Performance & Dividend Announcement",
        type: "Part 6",
        format: "Press Release / Thông cáo báo chí",
        wordCount: 160,
        questionsCount: 4,
        vocabCount: 2,
        topic: "Tài chính doanh nghiệp",
        text: "Apex Industrial announced record fiscal third-quarter results today, reporting a 22 percent increase in operating revenue compared to the same period last year, driven by expanding international shipments.",
        translation:
          "Apex Industrial hôm nay đã công bố kết quả tài chính quý ba kỷ lục, báo cáo mức tăng 22% doanh thu hoạt động so với cùng kỳ năm ngoái, nhờ vào việc mở rộng các lô hàng quốc tế.",
        hasBilingual: true,
        card: {
          id: "pas-104",
          title: "Quarterly Financial Performance & Dividend Announcement",
          category: "part6",
          subCategory: "text_types",
          tag: "Part 6 · Báo cáo tài chính",
          totalQuestions: 4,
          studiedQuestions: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          passageText:
            "Apex Industrial announced record fiscal third-quarter results today, reporting a 22 percent increase in operating revenue compared to the same period last year, driven by expanding international shipments.",
          passageTextVi:
            "Apex Industrial hôm nay đã công bố kết quả tài chính quý ba kỷ lục, báo cáo mức tăng 22% doanh thu hoạt động so với cùng kỳ năm ngoái, nhờ vào việc mở rộng các lô hàng quốc tế.",
          sampleQuestions: [
            {
              questionNum: "131",
              question: "What is mentioned about Apex Industrial's revenue?",
              bilingual: "Điều gì được đề cập về doanh thu của Apex Industrial?",
              options: [
                "It grew by 22 percent",
                "It dropped significantly",
                "It remained unchanged",
                "It failed to meet expectations",
              ],
              optionMeanings: [
                "Tăng 22%",
                "Giảm đáng kể",
                "Không thay đổi",
                "Không đạt kỳ vọng",
              ],
              correctIndex: 0,
              explanation: "Đoạn văn nêu rõ 'reporting a 22 percent increase in operating revenue...'",
              vocabList: [
                { word: "revenue", pos: "n", level: "B2", ipa: "/ˈrevənuː/", meaning: "doanh thu, lợi tức" },
                { word: "dividend", pos: "n", level: "C1", ipa: "/ˈdɪvɪdend/", meaning: "cổ tức" },
              ],
            },
          ],
        },
      },
    ];

    // 2. Real cards from user & database that are Part 6 or Part 7 (or have passages)
    const realPartCards = (cards || []).filter(
      (c) =>
        c.category === "part6" ||
        c.category === "part7" ||
        Boolean(c.passageText?.trim()) ||
        Boolean(c.sampleQuestions?.some((q) => q.passageText?.trim()))
    );

    if (realPartCards.length === 0) {
      return builtinPassages;
    }

    const convertedRealCards: PassageItem[] = realPartCards.map((c, idx) => {
      const text = c.passageText || c.sampleQuestions?.[0]?.passageText || "";
      const translation = c.passageTextVi || c.sampleQuestions?.[0]?.passageTextVi || "";
      const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 150;
      const questionsCount = c.sampleQuestions?.length || c.totalQuestions || 2;
      const vocabCount = c.sampleQuestions?.reduce((acc, q) => acc + (q.vocabList?.length || 0), 0) || 0;

      // Determine Type (Part 6 / Part 7 Single / Double / Triple)
      let type = "Part 7 Single";
      if (c.category === "part6") {
        type = "Part 6";
      } else if (c.category === "part7") {
        const lowerTitle = c.title.toLowerCase();
        const lowerTag = (c.tag || "").toLowerCase();
        if (lowerTitle.includes("triple") || lowerTag.includes("triple") || (c.passages && c.passages.length >= 3)) {
          type = "Part 7 Triple";
        } else if (lowerTitle.includes("double") || lowerTag.includes("double") || (c.passages && c.passages.length === 2)) {
          type = "Part 7 Double";
        } else if (questionsCount >= 5) {
          type = "Part 7 Double";
        } else {
          type = "Part 7 Single";
        }
      }

      // Determine Format
      let format = c.tag?.split("·")[0]?.trim() || "Bài đọc chuẩn ETS";
      const lowerText = text.toLowerCase();
      if (lowerText.includes("to:") && lowerText.includes("from:") && lowerText.includes("subject:")) {
        format = "Email / Thư điện tử";
      } else if (lowerText.includes("memo") || lowerText.includes("memorandum")) {
        format = "Memo / Thông báo nội bộ";
      } else if (lowerText.includes("dear") && lowerText.includes("sincerely")) {
        format = "Letter / Thư tín thương mại";
      } else if (lowerText.includes("order") || lowerText.includes("invoice") || lowerText.includes("receipt")) {
        format = "Order / Hóa đơn & Đơn hàng";
      } else if (lowerText.includes("notice") || lowerText.includes("attention")) {
        format = "Notice / Thông báo chung";
      } else if (c.category === "part6") {
        format = "Text Completion / Điền đoạn văn";
      }

      // Determine Topic
      let topic = "Thương mại & Doanh nghiệp";
      if (lowerText.includes("server") || lowerText.includes("software") || lowerText.includes("cloud") || lowerText.includes("network")) {
        topic = "Công nghệ thông tin";
      } else if (lowerText.includes("shipment") || lowerText.includes("courier") || lowerText.includes("delivery") || lowerText.includes("package")) {
        topic = "Bán lẻ & Hậu cần";
      } else if (lowerText.includes("summit") || lowerText.includes("conference") || lowerText.includes("meeting") || lowerText.includes("hotel")) {
        topic = "Sự kiện & Hội nghị";
      } else if (lowerText.includes("revenue") || lowerText.includes("quarterly") || lowerText.includes("financial") || lowerText.includes("dividend")) {
        topic = "Tài chính doanh nghiệp";
      } else if (lowerText.includes("plumbing") || lowerText.includes("maintenance") || lowerText.includes("repair") || lowerText.includes("water")) {
        topic = "Bảo trì & Tòa nhà";
      }

      const displayId = c.id.startsWith("pas-") ? c.id : `pas-${String(100 + idx + 1)}`;

      return {
        id: displayId,
        title: c.title,
        type,
        format,
        wordCount,
        questionsCount,
        vocabCount,
        topic,
        text,
        translation,
        hasBilingual: Boolean(translation.trim()),
        card: c,
      };
    });

    return convertedRealCards;
  }, [cards]);

  const filtered = useMemo(() => {
    return passageItems.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.topic.toLowerCase().includes(search.toLowerCase()) ||
        p.format.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());

      const matchType = filterType === "ALL" || p.type.startsWith(filterType);

      const matchBilingual =
        bilingualFilter === "ALL"
          ? true
          : bilingualFilter === "BILINGUAL"
          ? p.hasBilingual
          : !p.hasBilingual;

      return matchSearch && matchType && matchBilingual;
    });
  }, [passageItems, search, filterType, bilingualFilter]);

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề, thể loại, chủ đề, mã..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        {/* Filter Selects & Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Format / Part filter */}
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

          {/* Bilingual Filter */}
          <select
            value={bilingualFilter}
            onChange={(e) => setBilingualFilter(e.target.value as "ALL" | "BILINGUAL" | "UNTRANSLATED")}
            className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái dịch</option>
            <option value="BILINGUAL">Đã có dịch song ngữ (EN-VI)</option>
            <option value="UNTRANSLATED">Chưa có bản dịch tiếng Việt</option>
          </select>

          {/* Create Button */}
          {onOpenCreatePassage && (
            <button
              type="button"
              onClick={onOpenCreatePassage}
              className="px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm đoạn văn mới</span>
            </button>
          )}

          <span className="text-xs font-bold text-slate-500 whitespace-nowrap pl-1">
            Tổng: <strong className="text-blue-700">{filtered.length}</strong> bài đọc
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 w-20">Mã</th>
                <th className="py-3.5 px-4 min-w-[280px]">Tiêu đề bài đọc TOEIC</th>
                <th className="py-3.5 px-4 min-w-[140px]">Định dạng</th>
                <th className="py-3.5 px-4 min-w-[160px]">Chủ đề bài đọc</th>
                <th className="py-3.5 px-4 text-center min-w-[80px]">Độ dài</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Số câu &amp; Từ</th>
                <th className="py-3.5 px-4 text-center min-w-[130px]">Bản dịch song ngữ</th>
                <th className="py-3.5 px-4 text-center min-w-[130px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600">Không tìm thấy đoạn văn nào phù hợp</p>
                    <p className="text-xs mt-1">Thử đổi từ khóa tìm kiếm hoặc lọc theo định dạng khác.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isPart6 = p.type === "Part 6";
                  const isPart7Double = p.type === "Part 7 Double";
                  const isPart7Triple = p.type === "Part 7 Triple";

                  const badgeColor = isPart6
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : isPart7Triple
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : isPart7Double
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-blue-50 text-blue-700 border-blue-200";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      {/* 1. MÃ */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {p.id}
                      </td>

                      {/* 2. TIÊU ĐỀ & PART BADGE */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 leading-snug">{p.title}</p>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold inline-block mt-1 whitespace-nowrap border ${badgeColor}`}
                        >
                          {p.type}
                        </span>
                      </td>

                      {/* 3. ĐỊNH DẠNG */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium">
                        {p.format}
                      </td>

                      {/* 4. CHỦ ĐỀ */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 whitespace-nowrap inline-flex items-center">
                          {p.topic}
                        </span>
                      </td>

                      {/* 5. ĐỘ DÀI */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-800 whitespace-nowrap">
                        {p.wordCount > 0 ? `${p.wordCount} từ` : "—"}
                      </td>

                      {/* 6. SỐ CÂU & TỪ VỰNG */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{p.questionsCount} câu</span>
                        {p.vocabCount > 0 && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-semibold border border-amber-200 inline-block mt-0.5">
                            {p.vocabCount} từ vựng
                          </span>
                        )}
                      </td>

                      {/* 7. BẢN DỊCH SONG NGỮ */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {p.hasBilingual ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span>Song ngữ EN-VI</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Chưa có bản dịch
                          </span>
                        )}
                      </td>

                      {/* 8. THAO TÁC (XEM TRƯỚC, LUYỆN TẬP, SỬA, XÓA) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* 1. XEM TRƯỚC (PREVIEW) */}
                          <button
                            type="button"
                            onClick={() => setPreviewPassage(p)}
                            className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-blue-600 transition cursor-pointer shadow-2xs"
                            title="Xem trước bài đọc song ngữ & câu hỏi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. VÀO LUYỆN TẬP / LÀM THỬ (PRACTICE) */}
                          {onStartPractice && (
                            <button
                              type="button"
                              onClick={() => onStartPractice(p.card)}
                              className="p-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer shadow-2xs"
                              title="Kiểm duyệt & xem chi tiết đề thi"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}

                          {/* 3. CHỈNH SỬA (EDIT) */}
                          {onOpenEditCard && (
                            <button
                              type="button"
                              onClick={(e) => onOpenEditCard(p.card, e)}
                              className="p-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition cursor-pointer shadow-2xs"
                              title="Chỉnh sửa bài đọc, câu hỏi & từ vựng"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 4. XÓA (DELETE) */}
                          {onOpenDeleteConfirm && (
                            <button
                              type="button"
                              onClick={() => onOpenDeleteConfirm(p.card)}
                              className="p-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer shadow-2xs"
                              title="Xóa bài đọc này khỏi hệ thống"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Passage & Bilingual & Questions */}
      {previewPassage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {previewPassage.type}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {previewPassage.format} • {previewPassage.topic}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {previewPassage.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPassage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
              {/* Stats pill bar */}
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
                <span>📏 Độ dài: <strong>{previewPassage.wordCount} từ</strong></span>
                <span>•</span>
                <span>❓ Bộ câu hỏi: <strong>{previewPassage.questionsCount} câu</strong></span>
                <span>•</span>
                <span>📚 Từ vựng trọng tâm: <strong>{previewPassage.vocabCount} từ</strong></span>
                <span>•</span>
                <span>
                  Trạng thái dịch:{" "}
                  <strong className={previewPassage.hasBilingual ? "text-emerald-700" : "text-slate-500"}>
                    {previewPassage.hasBilingual ? "Đã có dịch song ngữ ✓" : "Chưa có bản dịch"}
                  </strong>
                </span>
              </div>

              {/* Passage Texts (English & Vietnamese) */}
              <div className="space-y-3">
                <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block">
                    Đoạn văn gốc tiếng Anh (Reading Passage - English):
                  </span>
                  <p className="font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-line">
                    {previewPassage.text || "Chưa có nội dung bài đọc tiếng Anh."}
                  </p>
                </div>

                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-1.5">
                  <span className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider block flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bản dịch đối chiếu tiếng Việt (Vietnamese Translation):</span>
                  </span>
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                    {previewPassage.translation || "Chưa có bản dịch tiếng Việt cho đoạn văn này."}
                  </p>
                </div>
              </div>

              {/* Attached Questions Preview */}
              {previewPassage.card.sampleQuestions && previewPassage.card.sampleQuestions.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    Danh sách câu hỏi trắc nghiệm ({previewPassage.card.sampleQuestions.length} câu):
                  </span>
                  <div className="space-y-2.5">
                    {previewPassage.card.sampleQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            Câu {qIdx + 1} {q.questionNum ? `(#${q.questionNum})` : ""}: {q.question}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Đáp án: {["A", "B", "C", "D"][q.correctIndex] || "A"}
                          </span>
                        </div>
                        {q.bilingual && (
                          <p className="text-[11px] text-slate-500 italic">{q.bilingual}</p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] pt-1">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`px-2 py-1 rounded ${
                                optIdx === q.correctIndex
                                  ? "bg-emerald-100/70 text-emerald-900 font-bold border border-emerald-200"
                                  : "text-slate-600"
                              }`}
                            >
                              ({["A", "B", "C", "D"][optIdx]}) {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with quick action buttons */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                {onStartPractice && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = previewPassage.card;
                      setPreviewPassage(null);
                      onStartPractice(c);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Luyện tập bài này ngay</span>
                  </button>
                )}

                {onOpenEditCard && (
                  <button
                    type="button"
                    onClick={(e) => {
                      const c = previewPassage.card;
                      setPreviewPassage(null);
                      onOpenEditCard(c, e);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa bài này</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPreviewPassage(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition"
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
// 2. PHÂN TÍCH TỐC ĐỘ ĐỌC & ĐỘ CHÍNH XÁC (READING SPEED & ACCURACY ANALYTICS)
// ==========================================
export const ReadingAnalyticsView: React.FC = () => {
  const LOCAL_CONFIG_KEY = "toeic_reading_time_config";
  const [timeRange, setTimeRange] = useState<"7_days" | "30_days" | "90_days" | "all">("30_days");
  const [targetFilter, setTargetFilter] = useState<"all" | "500" | "700" | "850">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Đọc cấu hình thời gian thực tế đã lưu từ Cấu hình Lộ trình
  const [config, setConfig] = useState({
    part5Minutes: 12,
    part6Minutes: 10,
    part7SingleMinutes: 27,
    part7MultiMinutes: 26,
    targetWpm: 160,
    enableBilingualByDefault: true,
    enablePacingTimer: true,
    enableTimeoutAlert: true,
    speedDrillMode: false,
  });

  const loadConfig = () => {
    try {
      const raw = localStorage.getItem(LOCAL_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  };

  useEffect(() => {
    loadConfig();

    // Lắng nghe sự kiện khi giáo viên/admin điều chỉnh bất kỳ slider nào ở tab Cấu hình
    const handleConfigUpdated = (e: any) => {
      if (e.detail) {
        setConfig((prev) => ({ ...prev, ...e.detail }));
      } else {
        loadConfig();
      }
    };

    window.addEventListener("toeic-reading-config-updated", handleConfigUpdated);
    window.addEventListener("storage", handleConfigUpdated);

    return () => {
      window.removeEventListener("toeic-reading-config-updated", handleConfigUpdated);
      window.removeEventListener("storage", handleConfigUpdated);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const part7TotalConfigured = config.part7SingleMinutes + config.part7MultiMinutes;
  const totalStandardMinutes = config.part5Minutes + config.part6Minutes + part7TotalConfigured;
  const standardPerQSeconds = Math.round(((totalStandardMinutes * 60) / 100) * 10) / 10;

  // Cấu hình cơ sở dữ liệu mẫu phân tích theo từng phân khúc mục tiêu học viên
  const TARGET_PROFILES = useMemo(() => ({
    all: {
      targetLabel: "Toàn bộ học viên",
      wpm: 158,
      actualPerQSeconds: 47.8,
      onTimeRate: 65.8,
      accuracy: 71.5,
      estimatedScore: 355,
      actualPartMinutes: { part5: 13.0, part6: 10.0, part7Single: 27.0, part7Multi: 32.0 },
      partAccuracy: { part5: 78.5, part6: 72.0, part7Single: 67.4, part7Multi: 58.2 },
      skills: [
        { skill: "Skimming - Đọc lướt tìm ý chính & mục đích bài đọc", example: "Câu hỏi 'What is the purpose of this email?', 'Why was the memo sent?'", time: "36 giây / câu", standard: "≤ 40 giây", accuracy: "82.4%", status: "good" as const, statusLabel: "Đạt chuẩn" },
        { skill: "Scanning - Quét thông tin ngày giờ, số liệu, tên riêng", example: "Câu hỏi 'When will the conference take place?', 'How much is the discount?'", time: "42 giây / câu", standard: "≤ 45 giây", accuracy: "76.8%", status: "good" as const, statusLabel: "Đạt chuẩn" },
        { skill: "Vocabulary in Context - Từ vựng đồng nghĩa theo ngữ cảnh", example: "Câu hỏi 'The word \"address\" in paragraph 2 is closest in meaning to...'", time: "28 giây / câu", standard: "≤ 30 giây", accuracy: "85.1%", status: "good" as const, statusLabel: "Tốt" },
        { skill: "Sentence Insertion - Chèn câu vào vị trí thích hợp [1]-[4]", example: "Câu hỏi 'In which of the positions marked [1], [2], [3], and [4] does the sentence belong?'", time: "61 giây / câu", standard: "≤ 50 giây", accuracy: "64.5%", status: "warning" as const, statusLabel: "Hơi chậm" },
        { skill: "NOT / TRUE - Câu hỏi phủ định & kiểm tra loại trừ", example: "Câu hỏi 'What is NOT mentioned about the order?', 'What is TRUE according to the article?'", time: "72 giây / câu", standard: "≤ 55 giây", accuracy: "60.8%", status: "warning" as const, statusLabel: "Chậm (+17s)" },
        { skill: "Cross-Passage Inference - Suy luận thông tin liên kết 2-3 đoạn", example: "Câu hỏi kết nối ngày tháng ở email với mã sản phẩm ở hóa đơn đính kèm", time: "88 giây / câu", standard: "≤ 65 giây", accuracy: "52.4%", status: "danger" as const, statusLabel: "Điểm nghẽn" },
      ],
    },
    "500": {
      targetLabel: "Mục tiêu 500 - 650 (Cơ bản)",
      wpm: 132,
      actualPerQSeconds: 56.5,
      onTimeRate: 42.5,
      accuracy: 59.2,
      estimatedScore: 295,
      actualPartMinutes: { part5: 15.0, part6: 11.5, part7Single: 30.5, part7Multi: 37.0 },
      partAccuracy: { part5: 68.0, part6: 61.5, part7Single: 54.0, part7Multi: 46.2 },
      skills: [
        { skill: "Skimming - Đọc lướt tìm ý chính & mục đích bài đọc", example: "Câu hỏi 'What is the purpose of this email?', 'Why was the memo sent?'", time: "46 giây / câu", standard: "≤ 40 giây", accuracy: "72.0%", status: "warning" as const, statusLabel: "Hơi chậm (+6s)" },
        { skill: "Scanning - Quét thông tin ngày giờ, số liệu, tên riêng", example: "Câu hỏi 'When will the conference take place?', 'How much is the discount?'", time: "54 giây / câu", standard: "≤ 45 giây", accuracy: "65.4%", status: "warning" as const, statusLabel: "Chậm (+9s)" },
        { skill: "Vocabulary in Context - Từ vựng đồng nghĩa theo ngữ cảnh", example: "Câu hỏi 'The word \"address\" in paragraph 2 is closest in meaning to...'", time: "36 giây / câu", standard: "≤ 30 giây", accuracy: "74.2%", status: "warning" as const, statusLabel: "Hơi chậm (+6s)" },
        { skill: "Sentence Insertion - Chèn câu vào vị trí thích hợp [1]-[4]", example: "Câu hỏi 'In which of the positions marked [1], [2], [3], and [4] does the sentence belong?'", time: "76 giây / câu", standard: "≤ 50 giây", accuracy: "51.5%", status: "danger" as const, statusLabel: "Chậm nhiều (+26s)" },
        { skill: "NOT / TRUE - Câu hỏi phủ định & kiểm tra loại trừ", example: "Câu hỏi 'What is NOT mentioned about the order?', 'What is TRUE according to the article?'", time: "89 giây / câu", standard: "≤ 55 giây", accuracy: "47.0%", status: "danger" as const, statusLabel: "Điểm nghẽn (+34s)" },
        { skill: "Cross-Passage Inference - Suy luận thông tin liên kết 2-3 đoạn", example: "Câu hỏi kết nối ngày tháng ở email với mã sản phẩm ở hóa đơn đính kèm", time: "106 giây / câu", standard: "≤ 65 giây", accuracy: "38.5%", status: "danger" as const, statusLabel: "Điểm nghẽn nặng" },
      ],
    },
    "700": {
      targetLabel: "Mục tiêu 700 - 800 (Khá - Tốt)",
      wpm: 165,
      actualPerQSeconds: 45.4,
      onTimeRate: 76.8,
      accuracy: 78.4,
      estimatedScore: 390,
      actualPartMinutes: { part5: 12.0, part6: 9.5, part7Single: 26.0, part7Multi: 30.0 },
      partAccuracy: { part5: 84.0, part6: 78.5, part7Single: 74.2, part7Multi: 66.8 },
      skills: [
        { skill: "Skimming - Đọc lướt tìm ý chính & mục đích bài đọc", example: "Câu hỏi 'What is the purpose of this email?', 'Why was the memo sent?'", time: "34 giây / câu", standard: "≤ 40 giây", accuracy: "86.5%", status: "good" as const, statusLabel: "Đạt chuẩn" },
        { skill: "Scanning - Quét thông tin ngày giờ, số liệu, tên riêng", example: "Câu hỏi 'When will the conference take place?', 'How much is the discount?'", time: "39 giây / câu", standard: "≤ 45 giây", accuracy: "81.0%", status: "good" as const, statusLabel: "Đạt chuẩn" },
        { skill: "Vocabulary in Context - Từ vựng đồng nghĩa theo ngữ cảnh", example: "Câu hỏi 'The word \"address\" in paragraph 2 is closest in meaning to...'", time: "26 giây / câu", standard: "≤ 30 giây", accuracy: "88.5%", status: "good" as const, statusLabel: "Tốt" },
        { skill: "Sentence Insertion - Chèn câu vào vị trí thích hợp [1]-[4]", example: "Câu hỏi 'In which of the positions marked [1], [2], [3], and [4] does the sentence belong?'", time: "54 giây / câu", standard: "≤ 50 giây", accuracy: "72.8%", status: "warning" as const, statusLabel: "Sát chuẩn (+4s)" },
        { skill: "NOT / TRUE - Câu hỏi phủ định & kiểm tra loại trừ", example: "Câu hỏi 'What is NOT mentioned about the order?', 'What is TRUE according to the article?'", time: "63 giây / câu", standard: "≤ 55 giây", accuracy: "69.5%", status: "warning" as const, statusLabel: "Hơi chậm (+8s)" },
        { skill: "Cross-Passage Inference - Suy luận thông tin liên kết 2-3 đoạn", example: "Câu hỏi kết nối ngày tháng ở email với mã sản phẩm ở hóa đơn đính kèm", time: "76 giây / câu", standard: "≤ 65 giây", accuracy: "62.4%", status: "warning" as const, statusLabel: "Cần cải thiện" },
      ],
    },
    "850": {
      targetLabel: "Mục tiêu 850+ (Xuất sắc)",
      wpm: 194,
      actualPerQSeconds: 38.6,
      onTimeRate: 93.2,
      accuracy: 89.5,
      estimatedScore: 455,
      actualPartMinutes: { part5: 9.5, part6: 7.8, part7Single: 22.0, part7Multi: 25.0 },
      partAccuracy: { part5: 94.0, part6: 90.5, part7Single: 86.8, part7Multi: 82.4 },
      skills: [
        { skill: "Skimming - Đọc lướt tìm ý chính & mục đích bài đọc", example: "Câu hỏi 'What is the purpose of this email?', 'Why was the memo sent?'", time: "25 giây / câu", standard: "≤ 40 giây", accuracy: "95.0%", status: "good" as const, statusLabel: "Xuất sắc" },
        { skill: "Scanning - Quét thông tin ngày giờ, số liệu, tên riêng", example: "Câu hỏi 'When will the conference take place?', 'How much is the discount?'", time: "31 giây / câu", standard: "≤ 45 giây", accuracy: "92.5%", status: "good" as const, statusLabel: "Xuất sắc" },
        { skill: "Vocabulary in Context - Từ vựng đồng nghĩa theo ngữ cảnh", example: "Câu hỏi 'The word \"address\" in paragraph 2 is closest in meaning to...'", time: "20 giây / câu", standard: "≤ 30 giây", accuracy: "96.0%", status: "good" as const, statusLabel: "Xuất sắc" },
        { skill: "Sentence Insertion - Chèn câu vào vị trí thích hợp [1]-[4]", example: "Câu hỏi 'In which of the positions marked [1], [2], [3], and [4] does the sentence belong?'", time: "42 giây / câu", standard: "≤ 50 giây", accuracy: "85.0%", status: "good" as const, statusLabel: "Đạt chuẩn" },
        { skill: "NOT / TRUE - Câu hỏi phủ định & kiểm tra loại trừ", example: "Câu hỏi 'What is NOT mentioned about the order?', 'What is TRUE according to the article?'", time: "47 giây / câu", standard: "≤ 55 giây", accuracy: "83.5%", status: "good" as const, statusLabel: "Đạt chuẩn" },
        { skill: "Cross-Passage Inference - Suy luận thông tin liên kết 2-3 đoạn", example: "Câu hỏi kết nối ngày tháng ở email với mã sản phẩm ở hóa đơn đính kèm", time: "58 giây / câu", standard: "≤ 65 giây", accuracy: "78.0%", status: "good" as const, statusLabel: "Đạt chuẩn" },
      ],
    },
  }), []);

  // Điều chỉnh hệ số theo khoảng thời gian được chọn
  const TIME_RANGE_CONFIG = useMemo(() => ({
    "7_days": { label: "7 ngày qua", submissions: 142, wpmDelta: 3, perQDelta: -1.2, onTimeDelta: 3.2, accDelta: 1.8, scoreDelta: 10 },
    "30_days": { label: "30 ngày qua", submissions: 628, wpmDelta: 0, perQDelta: 0, onTimeDelta: 0, accDelta: 0, scoreDelta: 0 },
    "90_days": { label: "3 tháng qua", submissions: 1840, wpmDelta: -3, perQDelta: 1.4, onTimeDelta: -3.5, accDelta: -2.0, scoreDelta: -10 },
    all: { label: "Toàn bộ thời gian", submissions: 4920, wpmDelta: -6, perQDelta: 2.6, onTimeDelta: -6.2, accDelta: -3.8, scoreDelta: -20 },
  }), []);

  const baseProfile = TARGET_PROFILES[targetFilter] || TARGET_PROFILES.all;
  const timeMod = TIME_RANGE_CONFIG[timeRange];

  // Tính toán các chỉ số động hiện hành
  const currentWpm = Math.max(100, baseProfile.wpm + timeMod.wpmDelta);
  const currentActualPerQ = Math.max(25, Math.round((baseProfile.actualPerQSeconds + timeMod.perQDelta) * 10) / 10);
  const currentAccuracy = Math.min(99, Math.max(30, Math.round((baseProfile.accuracy + timeMod.accDelta) * 10) / 10));
  const currentScore = Math.min(495, Math.max(100, Math.round((baseProfile.estimatedScore + timeMod.scoreDelta) / 5) * 5));

  // Tỷ lệ kịp giờ tính theo dung sai của tổng thời gian chuẩn cấu hình so với 75 phút
  const timeTolerance = totalStandardMinutes - 75;
  const adjustedOnTimeRate = Math.min(
    99.5,
    Math.max(15, Math.round((baseProfile.onTimeRate + timeMod.onTimeDelta + timeTolerance * 1.5) * 10) / 10)
  );

  const diffPerQ = Math.round((currentActualPerQ - standardPerQSeconds) * 10) / 10;

  // Tính toán động dữ liệu đo lường tốc độ đọc từng Part dựa trên cấu hình người dùng vừa chỉnh
  const partSpeedBenchmarks = useMemo(() => {
    const p5Act = Math.round((baseProfile.actualPartMinutes.part5 + (timeMod.perQDelta * 30) / 60) * 10) / 10;
    const p6Act = Math.round((baseProfile.actualPartMinutes.part6 + (timeMod.perQDelta * 16) / 60) * 10) / 10;
    const p7sAct = Math.round((baseProfile.actualPartMinutes.part7Single + (timeMod.perQDelta * 29) / 60) * 10) / 10;
    const p7mAct = Math.round((baseProfile.actualPartMinutes.part7Multi + (timeMod.perQDelta * 25) / 60) * 10) / 10;

    const p5Diff = Math.round((p5Act - config.part5Minutes) * 10) / 10;
    const p6Diff = Math.round((p6Act - config.part6Minutes) * 10) / 10;
    const p7sDiff = Math.round((p7sAct - config.part7SingleMinutes) * 10) / 10;
    const p7mDiff = Math.round((p7mAct - config.part7MultiMinutes) * 10) / 10;

    return [
      {
        id: "part-5",
        part: "Part 5 - Câu đơn ngữ pháp & từ vựng",
        desc: "30 câu hỏi đơn (Câu 101 - 130)",
        actualMinutes: p5Act,
        actualPerQSeconds: Math.round((p5Act * 60) / 30),
        standardMinutes: config.part5Minutes,
        standardPerQSeconds: Math.round((config.part5Minutes * 60) / 30),
        minMinutes: 8,
        minLabel: "8 phút (Nhanh)",
        recommendedLabel: `Mục tiêu cấu hình: ${config.part5Minutes} phút (~${Math.round((config.part5Minutes * 60) / 30)}s/câu)`,
        maxMinutes: 18,
        maxLabel: "18 phút (Chậm)",
        progressPercent: Math.min(100, Math.max(0, ((config.part5Minutes - 8) / (18 - 8)) * 100)),
        accuracy: Math.min(99, Math.round((baseProfile.partAccuracy.part5 + timeMod.accDelta) * 10) / 10),
        diffText: p5Diff <= 0 ? `Nhanh hơn -${Math.abs(p5Diff)}p` : `Chậm +${p5Diff}p`,
        diffType: p5Diff <= 0 ? "good" : "warning",
      },
      {
        id: "part-6",
        part: "Part 6 - Hoàn thành đoạn văn",
        desc: "16 câu hỏi trong 4 đoạn văn (Câu 131 - 146)",
        actualMinutes: p6Act,
        actualPerQSeconds: Math.round((p6Act * 60) / 16),
        actualPerPassage: Math.round((p6Act / 4) * 10) / 10,
        standardMinutes: config.part6Minutes,
        standardPerQSeconds: Math.round((config.part6Minutes * 60) / 16),
        minMinutes: 6,
        minLabel: "6 phút (Nhanh)",
        recommendedLabel: `Mục tiêu cấu hình: ${config.part6Minutes} phút (~${Math.round((config.part6Minutes * 60) / 16)}s/câu)`,
        maxMinutes: 15,
        maxLabel: "15 phút (Chậm)",
        progressPercent: Math.min(100, Math.max(0, ((config.part6Minutes - 6) / (15 - 6)) * 100)),
        accuracy: Math.min(99, Math.round((baseProfile.partAccuracy.part6 + timeMod.accDelta) * 10) / 10),
        diffText: p6Diff <= 0 ? `Đúng tiến độ (-${Math.abs(p6Diff)}p)` : `Chậm +${p6Diff}p`,
        diffType: p6Diff <= 0 ? "good" : "warning",
      },
      {
        id: "part-7-single",
        part: "Part 7 - Đoạn đơn (Single Passages)",
        desc: "29 câu hỏi (Câu 147 - 175)",
        actualMinutes: p7sAct,
        actualPerQSeconds: Math.round((p7sAct * 60) / 29),
        standardMinutes: config.part7SingleMinutes,
        standardPerQSeconds: Math.round((config.part7SingleMinutes * 60) / 29),
        minMinutes: 20,
        minLabel: "20 phút",
        recommendedLabel: `Mục tiêu cấu hình: ${config.part7SingleMinutes} phút (~${Math.round((config.part7SingleMinutes * 60) / 29)}s/câu)`,
        maxMinutes: 35,
        maxLabel: "35 phút",
        progressPercent: Math.min(100, Math.max(0, ((config.part7SingleMinutes - 20) / (35 - 20)) * 100)),
        accuracy: Math.min(99, Math.round((baseProfile.partAccuracy.part7Single + timeMod.accDelta) * 10) / 10),
        diffText: p7sDiff <= 0 ? `Đúng chuẩn (-${Math.abs(p7sDiff)}p)` : `Chậm +${p7sDiff}p`,
        diffType: p7sDiff <= 0 ? "good" : "warning",
      },
      {
        id: "part-7-multi",
        part: "Part 7 - Đoạn đôi & Đoạn ba (Double & Triple)",
        desc: "25 câu hỏi tổng hợp chéo (Câu 176 - 200)",
        actualMinutes: p7mAct,
        actualPerQSeconds: Math.round((p7mAct * 60) / 25),
        actualPerPassage: Math.round((p7mAct / 5) * 10) / 10,
        standardMinutes: config.part7MultiMinutes,
        standardPerQSeconds: Math.round((config.part7MultiMinutes * 60) / 25),
        minMinutes: 20,
        minLabel: "20 phút",
        recommendedLabel: `Mục tiêu cấu hình: ${config.part7MultiMinutes} phút (~${Math.round((config.part7MultiMinutes * 60) / 25)}s/câu)`,
        maxMinutes: 35,
        maxLabel: "35 phút",
        progressPercent: Math.min(100, Math.max(0, ((config.part7MultiMinutes - 20) / (35 - 20)) * 100)),
        accuracy: Math.min(99, Math.round((baseProfile.partAccuracy.part7Multi + timeMod.accDelta) * 10) / 10),
        diffText: p7mDiff <= 0 ? `Kịp giờ (-${Math.abs(p7mDiff)}p)` : `Vượt +${p7mDiff} phút`,
        diffType: p7mDiff <= 0 ? "good" : "danger",
      },
    ];
  }, [config, baseProfile, timeMod]);

  // Kỹ năng đọc hiểu cập nhật theo nhóm mục tiêu và thời gian
  const skillsData = baseProfile.skills;

  const wpmPercent = Math.min(100, Math.max(0, ((config.targetWpm - 110) / (220 - 110)) * 100));
  const wpmBandText =
    config.targetWpm >= 180 ? "Band 850 - 990" : config.targetWpm >= 150 ? "Band 650 - 800" : "Band 450 - 600";

  // Hàm xuất file CSV thực tế tải trực tiếp về trình duyệt
  const handleExportCSV = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    let csv = "";
    csv += `BÁO CÁO PHÂN TÍCH TỐC ĐỘ ĐỌC & ĐỘ CHÍNH XÁC TOEIC READING\n`;
    csv += `Thời gian xuất báo cáo:,${now.toLocaleString("vi-VN")}\n`;
    csv += `Khoảng thời gian thống kê:,${timeMod.label} (${timeMod.submissions.toLocaleString("vi-VN")} lượt làm bài)\n`;
    csv += `Phân khúc học viên:,${baseProfile.targetLabel}\n`;
    csv += `Khung chuẩn đang áp dụng:,${totalStandardMinutes} phút (Part 5: ${config.part5Minutes}p • Part 6: ${config.part6Minutes}p • Part 7: ${part7TotalConfigured}p • Chuẩn WPM: ${config.targetWpm})\n\n`;

    csv += `1. CHỈ SỐ TỔNG QUAN\n`;
    csv += `Chỉ số,Giá trị thực tế,Mốc chuẩn đối chiếu,Chênh lệch & Nhận xét\n`;
    csv += `Tốc độ đọc trung bình,${currentWpm} WPM,${config.targetWpm} WPM,${
      currentWpm >= config.targetWpm ? `Đạt (+${currentWpm - config.targetWpm} WPM)` : `Thiếu -${config.targetWpm - currentWpm} WPM`
    }\n`;
    csv += `Thời gian trung bình / câu,${currentActualPerQ} giây / câu,${standardPerQSeconds} giây / câu,${
      diffPerQ <= 0 ? `Nhanh hơn -${Math.abs(diffPerQ)}s` : `Vượt +${diffPerQ}s`
    }\n`;
    csv += `Tỷ lệ hoàn thành kịp giờ,${adjustedOnTimeRate}%,Khung ${totalStandardMinutes} phút,${(100 - adjustedOnTimeRate).toFixed(1)}% bị thiếu thời gian\n`;
    csv += `Độ chính xác Reading chung,${currentAccuracy}%,Quy đổi điểm TOEIC,~${currentScore} / 495 điểm Reading\n\n`;

    csv += `2. PHÂN BỔ THỜI GIAN THEO TỪNG PHẦN THI\n`;
    csv += `Phần thi,Mô tả,Thời gian thực tế (phút),Thời gian chuẩn (phút),Thời gian thực tế / câu,Thời gian chuẩn / câu,Chênh lệch,Độ chính xác (%)\n`;
    partSpeedBenchmarks.forEach((p) => {
      csv += `"${p.part}","${p.desc}",${p.actualMinutes},${p.standardMinutes},${p.actualPerQSeconds}s,${p.standardPerQSeconds}s,"${p.diffText}",${p.accuracy}%\n`;
    });
    csv += `\n`;

    csv += `3. MA TRẬN 6 KỸ NĂNG ĐỌC HIỂU CHUYÊN SÂU\n`;
    csv += `Kỹ năng đọc hiểu,Dạng câu hỏi đại diện,Thời gian TB / câu,Chuẩn đề xuất,Độ chính xác,Đánh giá\n`;
    skillsData.forEach((s) => {
      csv += `"${s.skill}","${s.example.replace(/,/g, ";")}",${s.time},${s.standard},${s.accuracy},${s.statusLabel}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_cao_toc_do_doc_TOEIC_${timeRange}_${targetFilter}_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Đã xuất báo cáo CSV thành công (${timeMod.submissions} lượt làm bài)! 📊`);
  };

  return (
    <div className="space-y-6 text-slate-800 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

{/* 1. THANH CÔNG CỤ & BỘ LỌC */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Phân tích tốc độ đọc &amp; Quản lý thời gian làm bài
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
              {timeMod.submissions.toLocaleString("vi-VN")} bài nộp
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu {timeMod.label} của <span className="font-semibold text-slate-700">{baseProfile.targetLabel}</span> so với khung chuẩn {totalStandardMinutes} phút
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Lọc thời gian */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
            {[
              { id: "7_days", label: "7 ngày qua" },
              { id: "30_days", label: "30 ngày qua" },
              { id: "90_days", label: "3 tháng" },
              { id: "all", label: "Toàn bộ" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTimeRange(item.id as any)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  timeRange === item.id
                    ? "bg-white text-blue-700 font-bold shadow-2xs"
                    : "hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Lọc Target Band */}
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Tất cả mục tiêu</option>
            <option value="500">Mục tiêu 500 - 650</option>
            <option value="700">Mục tiêu 700 - 800</option>
            <option value="850">Mục tiêu 850+</option>
          </select>

          {/* Nút Xuất file */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất file</span>
          </button>
        </div>
      </div>

      {/* 2. 4 THẺ CHỈ SỐ TỔNG QUAN (KEY METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: WPM động theo cấu hình */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Tốc độ đọc trung bình</span>
            <Gauge className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">{currentWpm}</span>
            <span className="text-xs text-slate-500 font-medium">WPM (từ/phút)</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className={currentWpm >= config.targetWpm ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
              {currentWpm >= config.targetWpm ? `Đạt mục tiêu (+${currentWpm - config.targetWpm} WPM)` : `Thiếu -${config.targetWpm - currentWpm} WPM`}
            </span>
            <span className="text-slate-400">Chuẩn: {config.targetWpm} WPM</span>
          </div>
        </div>

        {/* Metric 2: Thời gian TB / Câu */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Thời gian trung bình / câu</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">{currentActualPerQ}</span>
            <span className="text-xs text-slate-500 font-medium">giây / câu</span>
          </div>
          <p className={`mt-1 text-[11px] font-semibold ${diffPerQ <= 0 ? "text-emerald-700" : "text-amber-700"}`}>
            {diffPerQ <= 0
              ? `Nhanh hơn -${Math.abs(diffPerQ)} giây so với chuẩn (${standardPerQSeconds}s/câu)`
              : `Vượt +${diffPerQ} giây so với mốc chuẩn (${standardPerQSeconds}s/câu)`}
          </p>
        </div>

        {/* Metric 3: Kịp giờ theo chuẩn đã cấu hình */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Tỷ lệ hoàn thành kịp giờ</span>
            <Timer className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">{adjustedOnTimeRate}%</span>
            <span className="text-xs text-slate-500 font-medium">học viên</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {(100 - adjustedOnTimeRate).toFixed(1)}% còn lại bị thiếu thời gian ở 10 - 15 câu cuối
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Độ chính xác Reading chung</span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">{currentAccuracy}%</span>
            <span className="text-xs text-slate-500 font-medium">tổng 100 câu</span>
          </div>
          <p className="mt-1 text-[11px] text-blue-700 font-semibold">
            Tương đương ~{currentScore} / 495 điểm Reading
          </p>
        </div>
      </div>

      {/* 3. KHUNG PHÂN BỔ THỜI GIAN THEO TỪNG PHẦN (ĐỒNG BỘ ĐỘNG THEO SLIDERS) */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Phân bổ thời gian thực tế cho từng phần thi (Part 5, 6, 7)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thời gian học viên hoàn thành đối chiếu với mốc chuẩn do giáo viên cấu hình ({totalStandardMinutes} phút)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
            Khung chuẩn đã thiết lập: {totalStandardMinutes} phút
          </span>
        </div>

        {/* Danh sách thanh đo tốc độ từng Part */}
        <div className="space-y-4">
          {partSpeedBenchmarks.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2.5"
            >
              {/* Header của row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{item.part}</span>
                  <span className="text-xs text-slate-500 block mt-0.5">{item.desc}</span>
                </div>
                <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600 text-base">{item.actualMinutes} phút</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        item.diffType === "good" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.diffText}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Thực tế: ~{item.actualPerQSeconds}s/câu • Chuẩn: {item.standardMinutes}p (~{item.standardPerQSeconds}s/câu)
                  </span>
                </div>
              </div>

              {/* Thanh trượt hiển thị vị trí thời gian cấu hình */}
              <div className="py-1">
                <div className="relative w-full h-1.5 bg-slate-200 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${item.progressPercent}%` }}
                  />
                  {/* Điểm nút tròn chỉ vị trí thời gian cấu hình */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs transition-all duration-300"
                    style={{ left: `${item.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Mốc thời gian 3 điểm: Nhanh - Khuyến nghị cấu hình - Chậm */}
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                <span>{item.minLabel}</span>
                <span className="text-blue-600 font-semibold">{item.recommendedLabel}</span>
                <span>{item.maxLabel}</span>
              </div>
            </div>
          ))}

          {/* Dòng tổng kết toàn bộ Part 7 */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">
              Tổng thời gian dành cho toàn bộ Part 7 (54 câu) theo cấu hình:
            </span>
            <span className="font-bold text-blue-700 font-mono text-sm">
              {part7TotalConfigured} phút / {totalStandardMinutes} phút
            </span>
          </div>
        </div>
      </div>

      {/* 4. MỤC TIÊU TỐC ĐỘ ĐỌC (TARGET WPM) - ĐỒNG BỘ ĐỘNG */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>Mục Tiêu Tốc Độ Đọc (Target WPM - Words Per Minute)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Tốc độ đọc lướt và quét thông tin khuyến nghị cho học viên khi đọc văn bản TOEIC.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="font-bold text-blue-600 text-base">{config.targetWpm} WPM</span>
            <span className="text-xs text-slate-500 block font-medium">{wpmBandText}</span>
          </div>
        </div>

        {/* Thanh gauge WPM với dot */}
        <div className="py-1">
          <div className="relative w-full h-1.5 bg-slate-200 rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${wpmPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs transition-all duration-300"
              style={{ left: `${wpmPercent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
          <span>110 WPM (Cơ bản)</span>
          <span className="text-blue-600 font-semibold">{config.targetWpm} WPM (Mục tiêu hiện hành)</span>
          <span>220 WPM (Bậc thầy)</span>
        </div>
      </div>

      {/* 5. BIỂU ĐỒ TỶ LỆ ĐẠT THEO DẠNG BÀI ĐỌC */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Biểu đồ phân phối tỷ lệ đạt theo dạng bài đọc
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tỷ lệ phần trăm câu trả lời đúng của {baseProfile.targetLabel} ({timeMod.label})
          </p>
        </div>

        <div className="space-y-3.5 text-xs font-semibold text-slate-700">
          <div>
            <div className="flex justify-between mb-1.5">
              <span>Part 5 - Câu đơn ngữ pháp &amp; từ vựng (Incomplete Sentences)</span>
              <span className="text-emerald-600 font-bold">{partSpeedBenchmarks[0].accuracy}% đúng</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${partSpeedBenchmarks[0].accuracy}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span>Part 6 - Hoàn thành đoạn văn (Text Completion)</span>
              <span className="text-blue-600 font-bold">{partSpeedBenchmarks[1].accuracy}% đúng</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${partSpeedBenchmarks[1].accuracy}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span>Part 7 - Đọc hiểu đoạn đơn (Single Passage)</span>
              <span className="text-indigo-600 font-bold">{partSpeedBenchmarks[2].accuracy}% đúng</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${partSpeedBenchmarks[2].accuracy}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span>Part 7 - Đọc hiểu đoạn đôi &amp; ba (Multiple Passages)</span>
              <span className="text-rose-600 font-bold">{partSpeedBenchmarks[3].accuracy}% đúng</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-300"
                style={{ width: `${partSpeedBenchmarks[3].accuracy}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 6. MA TRẬN KỸ NĂNG ĐỌC HIỂU */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Ma trận chẩn đoán kỹ năng đọc hiểu chuyên sâu
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Thời gian phản xạ và độ chính xác phân loại theo 6 kỹ năng đọc hiểu quan trọng
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px]">
                <th className="pb-3 pr-4">KỸ NĂNG &amp; DẠNG CÂU HỎI</th>
                <th className="pb-3 px-3 text-center">THỜI GIAN TB</th>
                <th className="pb-3 px-3 text-center">CHUẨN ĐỀ XUẤT</th>
                <th className="pb-3 px-3 text-center">ĐỘ CHÍNH XÁC</th>
                <th className="pb-3 pl-3 text-right">ĐÁNH GIÁ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {skillsData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-slate-900">{item.skill}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.example}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                    {item.time}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-400">
                    {item.standard}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                    {item.accuracy}
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        item.status === "good"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.status === "warning"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {item.statusLabel}
                    </span>
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
// 3. CẤU HÌNH PHÂN BỔ THỜI GIAN 75 PHÚT & CHIẾN LƯỢC ĐỌC HIỂU
// ==========================================
export const ReadingCurriculumView: React.FC = () => {
  const LOCAL_CONFIG_KEY = "toeic_reading_time_config";

  const [part5Minutes, setPart5Minutes] = useState(12);
  const [part6Minutes, setPart6Minutes] = useState(10);
  const [part7SingleMinutes, setPart7SingleMinutes] = useState(27);
  const [part7MultiMinutes, setPart7MultiMinutes] = useState(26);
  const [targetWpm, setTargetWpm] = useState(160);

  const [enableBilingualByDefault, setEnableBilingualByDefault] = useState(true);
  const [enablePacingTimer, setEnablePacingTimer] = useState(true);
  const [enableTimeoutAlert, setEnableTimeoutAlert] = useState(true);
  const [speedDrillMode, setSpeedDrillMode] = useState(false);

  const [saved, setSaved] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);

  // Load cấu hình từ localStorage nếu đã từng lưu
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.part5Minutes) setPart5Minutes(parsed.part5Minutes);
        if (parsed.part6Minutes) setPart6Minutes(parsed.part6Minutes);
        if (parsed.part7SingleMinutes) setPart7SingleMinutes(parsed.part7SingleMinutes);
        if (parsed.part7MultiMinutes) setPart7MultiMinutes(parsed.part7MultiMinutes);
        if (parsed.targetWpm) setTargetWpm(parsed.targetWpm);
        if (typeof parsed.enableBilingualByDefault === "boolean")
          setEnableBilingualByDefault(parsed.enableBilingualByDefault);
        if (typeof parsed.enablePacingTimer === "boolean")
          setEnablePacingTimer(parsed.enablePacingTimer);
        if (typeof parsed.enableTimeoutAlert === "boolean")
          setEnableTimeoutAlert(parsed.enableTimeoutAlert);
        if (typeof parsed.speedDrillMode === "boolean")
          setSpeedDrillMode(parsed.speedDrillMode);
      }
    } catch {} finally {
      setIsLoaded(true);
    }
  }, []);

  // Tự động đồng bộ ngay lập tức sang Tab Phân tích khi người dùng kéo sliders hoặc chọn Presets
  useEffect(() => {
    if (!isLoaded) return;
    const currentConfig = {
      part5Minutes,
      part6Minutes,
      part7SingleMinutes,
      part7MultiMinutes,
      targetWpm,
      enableBilingualByDefault,
      enablePacingTimer,
      enableTimeoutAlert,
      speedDrillMode,
    };
    try {
      localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(currentConfig));
      window.dispatchEvent(
        new CustomEvent("toeic-reading-config-updated", { detail: currentConfig })
      );
    } catch {}
  }, [
    isLoaded,
    part5Minutes,
    part6Minutes,
    part7SingleMinutes,
    part7MultiMinutes,
    targetWpm,
    enableBilingualByDefault,
    enablePacingTimer,
    enableTimeoutAlert,
    speedDrillMode,
  ]);

  const totalMinutes = part5Minutes + part6Minutes + part7SingleMinutes + part7MultiMinutes;
  const part7TotalMinutes = part7SingleMinutes + part7MultiMinutes;

  // Áp dụng bộ Preset chiến lược phân bổ nhanh
  const applyPreset = (type: "balanced" | "part7_focus" | "grammar_focus") => {
    if (type === "balanced") {
      setPart5Minutes(12);
      setPart6Minutes(10);
      setPart7SingleMinutes(27);
      setPart7MultiMinutes(26);
      setTargetWpm(160);
    } else if (type === "part7_focus") {
      setPart5Minutes(10);
      setPart6Minutes(8);
      setPart7SingleMinutes(29);
      setPart7MultiMinutes(28);
      setTargetWpm(175);
    } else {
      setPart5Minutes(15);
      setPart6Minutes(10);
      setPart7SingleMinutes(27);
      setPart7MultiMinutes(23);
      setTargetWpm(145);
    }
  };

  const handleSave = () => {
    try {
      const config = {
        part5Minutes,
        part6Minutes,
        part7SingleMinutes,
        part7MultiMinutes,
        targetWpm,
        enableBilingualByDefault,
        enablePacingTimer,
        enableTimeoutAlert,
        speedDrillMode,
      };
      localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(config));
      window.dispatchEvent(
        new CustomEvent("toeic-reading-config-updated", { detail: config })
      );
    } catch {}

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleResetDefault = () => {
    applyPreset("balanced");
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-150">
      {/* 1. KHUNG TỔNG THỜI GIAN 75 PHÚT & ĐÁNH GIÁ PHÂN BỔ */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-blue-50 text-blue-600">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Chiến Lược Phân Bổ Thời Gian Chuẩn 75 Phút TOEIC Reading
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấu hình thời gian tối đa và tốc độ đọc mục tiêu cho 100 câu hỏi (Part 5: 30 câu, Part 6: 16 câu, Part 7: 54 câu).
              </p>
            </div>
          </div>

          {/* Badge tổng thời gian */}
          <div className="flex items-center gap-2">
            <span
              className={`px-4 py-2 rounded-2xl font-black text-xs font-mono inline-flex items-center gap-1.5 shadow-xs transition-colors ${
                totalMinutes === 75
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : totalMinutes > 75
                  ? "bg-rose-100 text-rose-900 border border-rose-300"
                  : "bg-blue-100 text-blue-900 border border-blue-300"
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>Tổng: {totalMinutes} / 75 phút</span>
            </span>
          </div>
        </div>

{/* 3 PRESETS CHIẾN LƯỢC 1-CLICK */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Chọn nhanh chiến lược phân bổ thời gian:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => applyPreset("balanced")}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer group ${
                part5Minutes === 12 && part6Minutes === 10 && part7SingleMinutes === 27 && part7MultiMinutes === 26
                  ? "border-blue-500 bg-blue-50/70 shadow-xs"
                  : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                  🌟 Chuẩn ETS (Cân bằng)
                </span>
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                  Khuyên dùng
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                P5: 12p • P6: 10p • P7: 53p (27p đơn + 26p kép/ba). Tốc độ 160 WPM.
              </p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("part7_focus")}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer group ${
                part5Minutes === 10 && part6Minutes === 8 && part7SingleMinutes === 29 && part7MultiMinutes === 28
                  ? "border-indigo-500 bg-indigo-50/70 shadow-xs"
                  : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-700">
                  ⚡ Bứt phá Part 7 (750+)
                </span>
                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                  Target cao
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                P5: 10p • P6: 8p • P7: 57p (Dồn tối đa thời gian cho đoạn văn dài).
              </p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("grammar_focus")}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer group ${
                part5Minutes === 15 && part6Minutes === 10 && part7SingleMinutes === 27 && part7MultiMinutes === 23
                  ? "border-emerald-500 bg-emerald-50/70 shadow-xs"
                  : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                  🛡️ Vững ngữ pháp (500-650)
                </span>
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Cơ bản
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                P5: 15p • P6: 10p • P7: 50p (Làm chắc chắn điểm ngữ pháp Part 5-6).
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THANH TRƯỢT CHI TIẾT TỪNG PHẦN THI (SLIDERS CHUẨN TỪNG GIÂY) */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Tùy Chỉnh Thời Gian Chi Tiết Cho Từng Phần Thi (Sliders)</span>
        </h4>

        <div className="space-y-5 text-xs font-semibold text-slate-700">
          {/* Part 5 Slider */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 text-sm">Part 5 - Điền câu ngữ pháp &amp; từ vựng</span>
                <span className="text-[11px] text-slate-500 block">30 câu hỏi đơn (Câu 101 - 130)</span>
              </div>
              <div className="text-right">
                <span className="font-black text-blue-700 font-mono text-base">{part5Minutes} phút</span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  ~{Math.round((part5Minutes * 60) / 30)} giây / câu
                </span>
              </div>
            </div>
            <input
              type="range"
              min="8"
              max="18"
              step="1"
              value={part5Minutes}
              onChange={(e) => setPart5Minutes(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>8 phút (Siêu tốc: 16s/câu)</span>
              <span className="text-blue-600 font-bold">Khuyến nghị: 10 - 12 phút</span>
              <span>18 phút (Tối đa)</span>
            </div>
          </div>

          {/* Part 6 Slider */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 text-sm">Part 6 - Hoàn thành đoạn văn</span>
                <span className="text-[11px] text-slate-500 block">16 câu hỏi trong 4 đoạn văn (Câu 131 - 146)</span>
              </div>
              <div className="text-right">
                <span className="font-black text-blue-700 font-mono text-base">{part6Minutes} phút</span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  ~{Math.round((part6Minutes * 60) / 16)} giây / câu (~2.3p / đoạn)
                </span>
              </div>
            </div>
            <input
              type="range"
              min="6"
              max="15"
              step="1"
              value={part6Minutes}
              onChange={(e) => setPart6Minutes(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>6 phút (Nhanh)</span>
              <span className="text-blue-600 font-bold">Khuyến nghị: 8 - 10 phút</span>
              <span>15 phút (Chậm)</span>
            </div>
          </div>

          {/* Part 7 Single Slider */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 text-sm">Part 7 - Đoạn đơn (Single Passages)</span>
                <span className="text-[11px] text-slate-500 block">29 câu hỏi (Câu 147 - 175)</span>
              </div>
              <div className="text-right">
                <span className="font-black text-indigo-700 font-mono text-base">{part7SingleMinutes} phút</span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  ~{Math.round((part7SingleMinutes * 60) / 29)} giây / câu
                </span>
              </div>
            </div>
            <input
              type="range"
              min="20"
              max="35"
              step="1"
              value={part7SingleMinutes}
              onChange={(e) => setPart7SingleMinutes(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>20 phút</span>
              <span className="text-indigo-600 font-bold">Khuyến nghị: 26 - 28 phút (~55s/câu)</span>
              <span>35 phút</span>
            </div>
          </div>

          {/* Part 7 Multiple (Double & Triple) Slider */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 text-sm">Part 7 - Đoạn đôi &amp; Đoạn ba (Double &amp; Triple)</span>
                <span className="text-[11px] text-slate-500 block">25 câu hỏi tổng hợp chéo (Câu 176 - 200)</span>
              </div>
              <div className="text-right">
                <span className="font-black text-indigo-700 font-mono text-base">{part7MultiMinutes} phút</span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  ~{Math.round((part7MultiMinutes * 60) / 25)} giây / câu (~5p / bài đọc)
                </span>
              </div>
            </div>
            <input
              type="range"
              min="20"
              max="35"
              step="1"
              value={part7MultiMinutes}
              onChange={(e) => setPart7MultiMinutes(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>20 phút</span>
              <span className="text-indigo-600 font-bold">Khuyến nghị: 25 - 28 phút (~60s/câu)</span>
              <span>35 phút</span>
            </div>
          </div>

          {/* Tổng Part 7 Review Info */}
          <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-200/80 flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-900">
              Tổng thời gian dành cho toàn bộ Part 7 (54 câu):
            </span>
            <span className="font-black text-indigo-700 text-sm font-mono">
              {part7TotalMinutes} phút / 75 phút
            </span>
          </div>
        </div>
      </div>

      {/* 3. MỤC TIÊU TỐC ĐỘ ĐỌC (TARGET WPM) */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>Mục Tiêu Tốc Độ Đọc (Target WPM - Words Per Minute)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Tốc độ đọc lướt và quét thông tin khuyến nghị cho học viên trong khi đọc bài văn dài.
            </p>
          </div>
          <div className="text-right">
            <span className="font-black text-blue-700 text-lg font-mono">{targetWpm} WPM</span>
            <span className="text-[11px] text-slate-500 block font-medium">
              {targetWpm >= 180 ? "Band 850 - 990" : targetWpm >= 150 ? "Band 650 - 800" : "Band 450 - 600"}
            </span>
          </div>
        </div>

        <input
          type="range"
          min="110"
          max="220"
          step="5"
          value={targetWpm}
          onChange={(e) => setTargetWpm(Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>110 WPM (Cơ bản)</span>
          <span className="text-blue-600 font-bold">160 WPM (Chuẩn quốc tế TOEIC)</span>
          <span>220 WPM (Bậc thầy)</span>
        </div>
      </div>

      {/* 4. CHẾ ĐỘ HỖ TRỢ & CẢNH BÁO TIẾN ĐỘ THỜI GIAN THỰC */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Tùy Chọn Chế Độ Hỗ Trợ Đọc Hiểu &amp; Cảnh Báo Phòng Thi</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-800">
          <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl cursor-pointer border border-slate-200 transition">
            <input
              type="checkbox"
              checked={enableBilingualByDefault}
              onChange={(e) => setEnableBilingualByDefault(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
            />
            <div>
              <span className="block font-bold">Xem bản dịch song ngữ khi xem lại câu sai</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Hiển thị bản dịch tiếng Việt song song đoạn văn để đối chiếu từ vựng.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl cursor-pointer border border-slate-200 transition">
            <input
              type="checkbox"
              checked={enablePacingTimer}
              onChange={(e) => setEnablePacingTimer(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
            />
            <div>
              <span className="block font-bold">Đồng hồ tiến độ từng phần (Pacing Timer)</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Cảnh báo học viên khi dành quá thời gian khuyến nghị cho mỗi phần.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl cursor-pointer border border-slate-200 transition">
            <input
              type="checkbox"
              checked={enableTimeoutAlert}
              onChange={(e) => setEnableTimeoutAlert(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
            />
            <div>
              <span className="block font-bold">Cảnh báo dừng quá lâu ở 1 câu hỏi</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Nhắc nhở học viên chuyển câu nếu quá 45s (Part 5) hoặc 90s (Part 7).
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl cursor-pointer border border-slate-200 transition">
            <input
              type="checkbox"
              checked={speedDrillMode}
              onChange={(e) => setSpeedDrillMode(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
            />
            <div>
              <span className="block font-bold">Chế độ Luyện tốc độ cao (Speed Drill)</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Bấm giờ áp lực cao cho từng đoạn đơn lẻ để rèn luyện tốc độ đọc lướt.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 5. THANH THAO TÁC NÚT LƯU & RESET */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleResetDefault}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Khôi phục chuẩn 75 phút</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 animate-in fade-in flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã lưu cấu hình phân bổ thời gian thành công!</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saved ? "Đã lưu!" : "Lưu cấu hình"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
