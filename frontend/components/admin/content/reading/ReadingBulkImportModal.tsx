"use client";

import React, { useMemo, useState } from "react";
import { ExerciseCardData, SampleQuestion, VocabItem } from "@/app/admin/content/reading/types";
import {
  ReadingVocabExtractorPanel,
  type AppliedVocabEntry,
} from "./ReadingVocabExtractorPanel";
import { enrichInlineParsedVocab } from "@/lib/readingVocabExtractor";
import { parseAdminReadingFile } from "@/lib/api/reading";
import {
  X,
  Upload,
  ClipboardPaste,
  FileSpreadsheet,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Download,
  Check,
  Trash2,
  Volume2,
  Loader2,
} from "lucide-react";

function normalizeCsvHeader(raw: string): string {
  return raw
    .replace(/^\uFEFF/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function parseCsvRows(text: string): string[][] {
  const cleanText = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const ch = cleanText[i];
    if (inQuotes) {
      if (ch === '"') {
        if (cleanText[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && cleanText[i + 1] === "\n") i++;
      currentRow.push(currentField.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += ch;
    }
  }
  currentRow.push(currentField.trim());
  if (currentRow.some((cell) => cell.length > 0)) {
    rows.push(currentRow);
  }
  return rows;
}

function parseBulkVocabToken(raw: string): VocabItem | null {
  const clean = raw.replace(/^[\-\•\*\d\.]+\s*/, "").trim();
  if (!clean) return null;
  let word = "";
  let pos = "n";
  let ipa = "";
  let meaning = "";

  const ipaMatch = clean.match(/\/([^\/]+)\//);
  if (ipaMatch) ipa = `/${ipaMatch[1].trim()}/`;
  const posMatch = clean.match(/\((n|v|adj|adv|prep|conj)[^\)]*\)/i);
  if (posMatch) pos = posMatch[1].toLowerCase();

  const stripped = clean
    .replace(/\(\s*\/[^\/]+\/\s*\)/g, "")
    .replace(/\/([^\/]+)\//g, "")
    .replace(/\((?:n|v|adj|adv|prep|conj)[^\)]*\)/gi, "")
    .replace(/\(\s*\)/g, "")
    .trim();
  const split = stripped.split(/[\:\-\=]\s*(.+)/);
  if (split.length >= 2) {
    word = split[0].trim();
    meaning = split[1].trim();
  } else {
    word = stripped;
  }
  word = word.replace(/[\(\)\[\]]/g, "").trim();
  if (!word || !/^[a-zA-Z][a-zA-Z\s'\-]*$/.test(word)) return null;
  return enrichInlineParsedVocab({ word, ipa, pos, meaning, level: "B1" });
}

function parseBulkVocabList(raw: string): VocabItem[] {
  return raw
    .split(/[,;]/)
    .map((part) => parseBulkVocabToken(part))
    .filter((item): item is VocabItem => item !== null);
}

export interface ReadingBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newCard: ExerciseCardData) => void;
}

export const ReadingBulkImportModal: React.FC<ReadingBulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"paste" | "file">("paste");

  // Form Metadata
  const [title, setTitle] = useState("ETS 2024 Test 5 - Part 5 Mini Test");
  const [category, setCategory] = useState<"part5" | "part6" | "part7" | "grammar">("part5");
  const [subCategory] = useState<
    "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types"
  >("word_types");
  const [tag, setTag] = useState("Thương mại & Hợp đồng");

  // Passage Data (optional for Part 6/7)
  const [passageText, setPassageText] = useState("");
  const [passageTextVi, setPassageTextVi] = useState("");

  // Raw Paste Text
  const [rawText, setRawText] = useState("");

  // Parsed Output
  const [parsedQuestions, setParsedQuestions] = useState<SampleQuestion[]>([]);
  const [cardVocabList, setCardVocabList] = useState<VocabItem[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const parsedVocabCount = useMemo(
    () => cardVocabList.length + parsedQuestions.reduce((sum, q) => sum + (q.vocabList?.length || 0), 0),
    [cardVocabList, parsedQuestions]
  );

  const existingVocabWords = useMemo(() => {
    const words: string[] = [];
    cardVocabList.forEach((v) => {
      if (v.word?.trim()) words.push(v.word.trim().toLowerCase());
    });
    parsedQuestions.forEach((q) => {
      (q.vocabList || []).forEach((v) => {
        if (v.word?.trim()) words.push(v.word.trim().toLowerCase());
      });
    });
    return words;
  }, [cardVocabList, parsedQuestions]);

  const playPreviewWord = (word: string) => {
    if (!word || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  };

  const handleApplyExtractedVocab = (entries: AppliedVocabEntry[]) => {
    if (entries.length === 0) return;
    const cardEntries = entries.filter((e) => e.targetQuestionIndex === null || parsedQuestions.length === 0);
    const qEntries = entries.filter((e) => e.targetQuestionIndex !== null && parsedQuestions.length > 0);

    if (cardEntries.length > 0) {
      setCardVocabList((prev) => {
        const seen = new Set(prev.map((v) => v.word.trim().toLowerCase()));
        const next = [...prev];
        cardEntries.forEach(({ item }) => {
          const k = item.word.trim().toLowerCase();
          if (k && !seen.has(k)) {
            seen.add(k);
            next.push(item);
          }
        });
        return next;
      });
    }

    if (qEntries.length > 0) {
      setParsedQuestions((prev) => {
        const copy = prev.map((q) => ({ ...q, vocabList: [...(q.vocabList || [])] }));
        qEntries.forEach(({ item, targetQuestionIndex }) => {
          const idx = Math.min(Math.max(0, targetQuestionIndex ?? 0), copy.length - 1);
          const seen = new Set((copy[idx].vocabList || []).map((v) => v.word.trim().toLowerCase()));
          const k = item.word.trim().toLowerCase();
          if (k && !seen.has(k)) {
            copy[idx].vocabList = [...(copy[idx].vocabList || []), item];
          }
        });
        return copy;
      });
    }
  };

  const handleRemoveCardVocab = (idx: number) => {
    setCardVocabList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveQuestionVocab = (qIdx: number, vIdx: number) => {
    setParsedQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIdx ? { ...q, vocabList: (q.vocabList || []).filter((_, i) => i !== vIdx) } : q
      )
    );
  };

  if (!isOpen) return null;

  // Mẫu template có sẵn để admin click test ngay
  const SAMPLE_PART5 = `[Tiêu đề] ETS 2024 Test 5 - Part 5 Cấu trúc Từ loại
[Phần thi] Part 5
[Thẻ] Từ loại & Ngữ pháp trọng tâm

101. When she held her last meeting, Ms. Toba ------- her sales staff to perform even better next quarter.
(A) encourage
(B) is encouraging
(C) encouraged
(D) was encouraged
Đáp án: C
Dịch: Khi cô ấy tổ chức cuộc họp trước, bà Toba đã khuyến khích đội ngũ bán hàng của mình làm việc tốt hơn nữa trong quý tới.
Giải thích: Cần động từ chia ở thì quá khứ đơn vì mệnh đề trước có "held" (quá khứ của hold) và diễn tả một sự việc đã xảy ra trong quá khứ.
Từ vựng: encourage (v): khuyến khích, quarterly (adv): hàng quý, staff (n): đội ngũ nhân viên

102. All visitors are required to show photo identification ------- entering the research laboratory.
(A) before
(B) while
(C) during
(D) until
Đáp án: A
Dịch: Tất cả khách tham quan được yêu cầu xuất trình giấy tờ tùy thân có ảnh trước khi vào phòng thí nghiệm nghiên cứu.
Giải thích: "Before + V-ing" diễn tả hành động xảy ra trước một hành động khác. "During" chỉ đi với danh từ, không đi với V-ing.
Từ vựng: laboratory (n): phòng thí nghiệm, identification (n): giấy tờ tùy thân

103. The marketing team proposed an ------- strategy that significantly boosted our online customer retention rate.
(A) innovate
(B) innovation
(C) innovative
(D) innovatively
Đáp án: C
Dịch: Đội ngũ tiếp thị đã đề xuất một chiến lược mang tính đổi mới, giúp gia tăng đáng kể tỷ lệ giữ chân khách hàng trực tuyến.
Giải thích: Chỗ trống đứng trước danh từ "strategy" và sau mạo từ "an", do đó cần một tính từ (innovative) để bổ nghĩa cho danh từ.
Từ vựng: innovative (adj): có tính sáng tạo đổi mới, retention (n): sự giữ chân duy trì`;

  const SAMPLE_PART6 = `[Tiêu đề] Thông báo nội bộ công ty NexaCorp
[Phần thi] Part 6
[Thẻ] Điền đoạn văn Part 6

[Đoạn văn]
To: All Staff Members
From: Human Resources Department
Date: October 14
Subject: Office Renovation Schedule

Please be advised that the main office on the 4th floor will undergo extensive renovations beginning next Monday. Construction crews will be working daily from 6:00 PM to 10:00 PM to minimize disruptions to your regular workday.

During this period, access to the eastern wing will be ------- restricted. Only authorized maintenance staff will be allowed in that section. If you currently work in the eastern wing, please pack your essential files by Friday afternoon. You will be assigned a temporary workstation on the 3rd floor.

We appreciate your patience and cooperation as we work to ------- our workplace facilities. Should you have any special requirements, please contact HR at extension 402.

[Bản dịch đoạn văn]
Kính gửi: Toàn thể nhân viên
Từ: Phòng Nhân sự
Ngày: 14 tháng 10
Chủ đề: Lịch trình nâng cấp văn phòng

Xin lưu ý rằng văn phòng chính tại tầng 4 sẽ trải qua đợt nâng cấp toàn diện bắt đầu từ thứ Hai tuần tới. Đội ngũ thi công sẽ làm việc hàng ngày từ 18:00 đến 22:00 để giảm thiểu gián đoạn cho ngày làm việc của bạn.

Trong giai đoạn này, việc tiếp cận cánh phía Đông sẽ bị hạn chế nghiêm ngặt. Chỉ có nhân viên bảo trì được ủy quyền mới được vào khu vực đó. Nếu bạn đang làm việc tại cánh phía Đông, vui lòng đóng gói tài liệu cần thiết trước chiều thứ Sáu. Bạn sẽ được bố trí chỗ làm việc tạm thời tại tầng 3.

Chúng tôi rất cảm kích sự kiên nhẫn và hợp tác của các bạn khi chúng tôi nỗ lực nâng cấp cơ sở vật chất nơi làm việc. Nếu bạn có yêu cầu đặc biệt, vui lòng liên hệ HR tại máy lẻ 402.

131. During this period, access to the eastern wing will be ------- restricted.
(A) strict
(B) strictly
(C) strictness
(D) strictly speaking
Đáp án: B
Dịch: Trong giai đoạn này, việc tiếp cận cánh phía đông sẽ bị hạn chế nghiêm ngặt.
Giải thích: Chỗ trống đứng giữa trợ động từ "will be" và quá khứ phân từ "restricted" (bị động), do đó cần một trạng từ (strictly) để bổ nghĩa cho động từ.
Từ vựng: restrict (v): hạn chế, strictly (adv): một cách nghiêm ngặt

132. We appreciate your patience and cooperation as we work to ------- our workplace facilities.
(A) improve
(B) improves
(C) improved
(D) improving
Đáp án: A
Dịch: Chúng tôi đánh giá cao sự kiên nhẫn và hợp tác khi chúng tôi nỗ lực cải thiện cơ sở vật chất nơi làm việc.
Giải thích: Cấu trúc "work to + V nguyên mẫu" chỉ mục đích hành động (nỗ lực để làm gì). Do đó chọn đáp án (A) improve.
Từ vựng: facilities (n): cơ sở vật chất tiện nghi, cooperation (n): sự hợp tác`;

  const SAMPLE_PART7 = `[Tiêu đề] Email đặt phòng hội nghị khách sạn Grand Palace
[Phần thi] Part 7
[Thẻ] Đọc hiểu đoạn đơn

[Đoạn văn]
Dear Mr. Ramirez,

Thank you for contacting the Grand Palace Hotel regarding your upcoming conference booking on November 20. We are pleased to confirm that the Sapphire Ballroom has been reserved for your organization from 8:00 AM to 5:00 PM.

As requested in your initial inquiry, audiovisual equipment including two digital projectors, wireless microphones, and high-speed Wi-Fi access will be set up prior to your arrival. Our catering team will serve coffee and pastries at 10:00 AM, followed by a buffet lunch at 12:30 PM.

Please review the attached invoice and return a signed copy along with the 30% deposit by November 5 to secure your reservation.

Warm regards,
Elena Rostova
Events Coordinator, Grand Palace Hotel

[Bản dịch đoạn văn]
Kính gửi ông Ramirez,

Cảm ơn ông đã liên hệ với Khách sạn Grand Palace về việc đặt phòng hội nghị vào ngày 20 tháng 11 sắp tới. Chúng tôi hân hạnh xác nhận rằng Phòng đại tiệc Sapphire đã được đặt chỗ cho tổ chức của ông từ 8:00 sáng đến 5:00 chiều.

Theo yêu cầu trong thư hỏi ban đầu của ông, các thiết bị nghe nhìn bao gồm hai máy chiếu kỹ thuật số, micrô không dây và truy cập Wi-Fi tốc độ cao sẽ được thiết lập trước khi ông đến. Đội ngũ phục vụ ẩm thực sẽ phục vụ cà phê và bánh ngọt lúc 10:00 sáng, tiếp theo là bữa trưa tự chọn lúc 12:30 trưa.

Vui lòng xem lại hóa đơn đính kèm và gửi lại bản sao đã ký cùng với khoản đặt cọc 30% trước ngày 5 tháng 11 để đảm bảo việc đặt phòng của ông.

Trân trọng,
Elena Rostova
Điều phối viên sự kiện, Khách sạn Grand Palace

147. What is the main purpose of the email?
(A) To request payment for an overdue bill
(B) To confirm details of an event reservation
(C) To advertise discounts on hotel accommodations
(D) To cancel a scheduled catering order
Đáp án: B
Dịch: Mục đích chính của bức thư điện tử là gì?
Giải thích: Đoạn đầu tiên nêu rõ: "We are pleased to confirm that the Sapphire Ballroom has been reserved...", chứng tỏ thư để xác nhận chi tiết đặt chỗ sự kiện.
Từ vựng: reservation (n): sự đặt chỗ trước, ballroom (n): phòng khiêu vũ hội trường lớn

148. What is Mr. Ramirez asked to do by November 5?
(A) Submit a list of conference speakers
(B) Choose the menu for the buffet lunch
(C) Send a signed document and a deposit
(D) Test the audiovisual equipment
Đáp án: C
Dịch: Ông Ramirez được yêu cầu làm gì trước ngày 5 tháng 11?
Giải thích: Câu cuối cùng: "return a signed copy along with the 30% deposit by November 5". Do đó chọn (C).
Từ vựng: deposit (n): tiền đặt cọc, invoice (n): hóa đơn`;

  // Hàm Parser thông minh
  const handleParseText = (inputText?: string) => {
    const text = (typeof inputText === "string" ? inputText : rawText).trim();
    if (!text) {
      setErrorMsg("Vui lòng dán văn bản đề thi vào ô bên dưới!");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setCardVocabList([]);

    const lines = text.split(/\r?\n/).map((l) => l.trim());
    let extPassage = "";
    let extPassageVi = "";
    let extTitle = "";
    let extTag = "";
    let readingMode: "none" | "passage" | "passageVi" | "question" = "none";

    const questions: SampleQuestion[] = [];
    let currentQ: Partial<SampleQuestion> | null = null;
    let currentVocabs: VocabItem[] = [];
    const globalVocabs: VocabItem[] = [];
    let totalVocabCount = 0;

    const commitCurrentQ = () => {
      if (currentQ && (currentQ.question || (currentQ.options && currentQ.options.some((o) => !!o.trim())))) {
        questions.push({
          questionNum: currentQ.questionNum || String(100 + questions.length + 1),
          question: currentQ.question || "",
          bilingual: currentQ.bilingual || "",
          options: [
            currentQ.options?.[0] || "",
            currentQ.options?.[1] || "",
            currentQ.options?.[2] || "",
            currentQ.options?.[3] || "",
          ],
          optionMeanings: [
            currentQ.optionMeanings?.[0] || "",
            currentQ.optionMeanings?.[1] || "",
            currentQ.optionMeanings?.[2] || "",
            currentQ.optionMeanings?.[3] || "",
          ],
          correctIndex: currentQ.correctIndex !== undefined ? currentQ.correctIndex : 0,
          explanation: currentQ.explanation || "",
          steps: [
            { title: "Bước 1: Phân tích ngữ cảnh", desc: "Xác định từ loại hoặc ý nghĩa cần điền." },
            { title: "Bước 2: Đối chiếu & chọn đáp án", desc: "So sánh các phương án để chọn đáp án chuẩn xác nhất." },
          ],
          vocabList: [...currentVocabs],
        });
        totalVocabCount += currentVocabs.length;
      }
      currentQ = null;
      currentVocabs = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) {
        if (readingMode === "passage") extPassage += "\n\n";
        else if (readingMode === "passageVi") extPassageVi += "\n\n";
        continue;
      }

      const lower = line.toLowerCase();

      // Metadata headers
      if (lower.startsWith("[tiêu đề]") || lower.startsWith("tiêu đề:") || lower.startsWith("[title]")) {
        extTitle = line.replace(/^(\[tiêu đề\]|tiêu đề\:|\[title\])\s*/i, "").trim();
        continue;
      }
      if (lower.startsWith("[phần thi]") || lower.startsWith("phần thi:") || lower.startsWith("[part]")) {
        const pStr = line.toLowerCase();
        if (pStr.includes("part 6")) setCategory("part6");
        else if (pStr.includes("part 7")) setCategory("part7");
        else if (pStr.includes("part 5")) setCategory("part5");
        else if (pStr.includes("ngữ pháp") || pStr.includes("grammar")) setCategory("grammar");
        continue;
      }
      if (lower.startsWith("[thẻ]") || lower.startsWith("thẻ:") || lower.startsWith("[tag]")) {
        extTag = line.replace(/^(\[thẻ\]|thẻ\:|\[tag\])\s*/i, "").trim();
        continue;
      }

      // Passage blocks
      if (lower.startsWith("[đoạn văn]") || lower.startsWith("[passage]") || lower === "passage:") {
        readingMode = "passage";
        continue;
      }
      if (
        lower.startsWith("[bản dịch đoạn văn]") ||
        lower.startsWith("[bản dịch]") ||
        lower.startsWith("[passage vi]") ||
        lower === "bản dịch:"
      ) {
        readingMode = "passageVi";
        continue;
      }

      // Detect Question Start: e.g. "101.", "Câu 101:", "101)"
      const qMatch = line.match(/^(?:câu\s*|question\s*)?(\d{1,3})[\.\:\)\s]+(.+)/i);
      if (qMatch) {
        commitCurrentQ();
        readingMode = "question";
        currentQ = {
          questionNum: qMatch[1],
          question: qMatch[2].trim(),
          options: ["", "", "", ""],
          optionMeanings: ["", "", "", ""],
          correctIndex: 0,
        };
        continue;
      }

      // Inside Question Mode
      if (currentQ) {
        // Detect Options: (A), (B), (C), (D) or A., B., C., D.
        const optMatch = line.match(/^\(?([A-Da-d])[\.\)\:\s]+(.+)/);
        if (optMatch) {
          const letter = optMatch[1].toUpperCase();
          const optContent = optMatch[2].trim();
          const optIdx = letter.charCodeAt(0) - 65;
          if (optIdx >= 0 && optIdx <= 3) {
            currentQ.options = currentQ.options || ["", "", "", ""];
            currentQ.options[optIdx] = optContent;
            continue;
          }
        }

        // Inline multiple options: (A) ... (B) ... (C) ... (D) ...
        const inlineOpts = line.match(/\(?([A-Da-d])[\.\)]\s*([^\(]+)/g);
        if (inlineOpts && inlineOpts.length >= 2) {
          currentQ.options = currentQ.options || ["", "", "", ""];
          inlineOpts.forEach((seg) => {
            const m = seg.match(/\(?([A-Da-d])[\.\)]\s*(.+)/);
            if (m) {
              const idx = m[1].toUpperCase().charCodeAt(0) - 65;
              if (idx >= 0 && idx <= 3) currentQ!.options![idx] = m[2].trim();
            }
          });
          continue;
        }

        // Correct Answer Key
        const ansMatch = line.match(/^(?:đáp án|answer|key|chọn)[\:\s]+(?:\()?([A-Da-d])(?:\))?/i);
        if (ansMatch) {
          const ansLetter = ansMatch[1].toUpperCase();
          currentQ.correctIndex = ansLetter.charCodeAt(0) - 65;
          continue;
        }

        // Explanation
        const expMatch = line.match(/^(?:giải thích|lời giải|explanation|hướng dẫn giải)[\:\s]+(.+)/i);
        if (expMatch) {
          currentQ.explanation = expMatch[1].trim();
          continue;
        }

        // Translation
        const viMatch = line.match(/^(?:dịch|bản dịch|translation|dịch câu)[\:\s]+(.+)/i);
        if (viMatch) {
          currentQ.bilingual = viMatch[1].trim();
          continue;
        }

        // Vocabulary inline
        const vocabMatch = line.match(/^(?:từ vựng|vocab|vocabulary)\s*\:?\s*(.*)$/i);
        if (vocabMatch && (lower.startsWith("từ vựng:") || lower.startsWith("vocab:") || lower.startsWith("vocabulary:"))) {
          const payload = vocabMatch[1].trim();
          if (payload) {
            currentVocabs.push(...parseBulkVocabList(payload));
          }
          continue;
        }
      }

      // Vocabulary bullet lines (outside passage sections)
      if (readingMode !== "passage" && readingMode !== "passageVi" && (line.startsWith("-") || line.startsWith("•"))) {
        const parsedItem = parseBulkVocabToken(line);
        if (parsedItem) {
          if (currentQ) currentVocabs.push(parsedItem);
          else {
            globalVocabs.push(parsedItem);
            totalVocabCount++;
          }
          continue;
        }
      }
      if (lower === "[từ vựng]" || lower === "từ vựng:" || lower === "[vocabulary]") {
        readingMode = "none";
        continue;
      }

      // Appending to passage
      if (readingMode === "passage") {
        extPassage += (extPassage ? "\n" : "") + line;
      } else if (readingMode === "passageVi") {
        extPassageVi += (extPassageVi ? "\n" : "") + line;
      }
    }

    commitCurrentQ();

    if (extTitle) setTitle(extTitle);
    if (extTag) setTag(extTag);
    if (extPassage) setPassageText(extPassage.trim());
    if (extPassageVi) setPassageTextVi(extPassageVi.trim());

    if (questions.length === 0) {
      setErrorMsg("Không tìm thấy câu hỏi hợp lệ trong văn bản. Vui lòng kiểm tra định dạng câu hỏi (Ví dụ: 101. ... (A) ... (B) ...)");
      return;
    }

    setCardVocabList(globalVocabs);
    setParsedQuestions(questions);

    const hasExtPassage = !!extPassage || !!passageText.trim();
    if ((category === "part6" || category === "part7") && !hasExtPassage) {
      setErrorMsg(`⚠️ Cảnh báo sai định dạng: Bạn đang chọn chuyên đề ${category.toUpperCase()}, nhưng nội dung dán vào không có Đoạn văn/Bài đọc (Passage). Đề thi ${category.toUpperCase()} bắt buộc phải có đoạn văn/bài đọc đi kèm!`);
    } else {
      setSuccessMsg(`Bóc tách thành công ${questions.length} câu hỏi và ${totalVocabCount} từ vựng! ✨`);
    }
  };

  // Import từ file (XLSX / CSV / JSON / TXT)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUploadingFile(true);

    try {
      if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
        const parsedCard = await parseAdminReadingFile(file);
        setTitle(parsedCard.title);
        setCategory(parsedCard.category);
        if (parsedCard.tag) setTag(parsedCard.tag);
        setPassageText(parsedCard.passageText || "");
        setPassageTextVi(parsedCard.passageTextVi || "");
        setCardVocabList(parsedCard.vocabList || []);
        const loadedQs = parsedCard.sampleQuestions || [];
        setParsedQuestions(loadedQs);
        setSuccessMsg(`Đã nạp file Excel "${file.name}" gồm ${loadedQs.length} câu hỏi! ✨`);
        return;
      }

      const content = await file.text();
      if (!content.trim()) {
        setErrorMsg("File tải lên không có nội dung.");
        return;
      }

      if (lowerName.endsWith(".json")) {
        try {
          const rawJson = JSON.parse(content);
          const root = Array.isArray(rawJson?.items) ? rawJson.items[0] : rawJson;
          if (Array.isArray(root)) {
            const firstObj = root[0] as Record<string, unknown> | undefined;
            if (firstObj && (Array.isArray(firstObj.sampleQuestions) || Array.isArray(firstObj.questions))) {
              const cardObj = firstObj as Record<string, unknown>;
              if (typeof cardObj.title === "string") setTitle(cardObj.title);
              if (typeof cardObj.category === "string") setCategory(cardObj.category as "part5" | "part6" | "part7" | "grammar");
              if (typeof cardObj.tag === "string") setTag(cardObj.tag);
              setPassageText(String(cardObj.passageText || cardObj.content || ""));
              setPassageTextVi(String(cardObj.passageTextVi || ""));
              const cardVocab = Array.isArray(cardObj.vocabList) ? (cardObj.vocabList as VocabItem[]) : [];
              setCardVocabList(cardVocab);
              const qs = ((cardObj.sampleQuestions || cardObj.questions) as SampleQuestion[]) || [];
              setParsedQuestions(qs);
              setSuccessMsg(`Đã nạp chuyên đề "${String(cardObj.title || file.name)}" với ${qs.length} câu hỏi! 🎉`);
            } else {
              setCardVocabList([]);
              setParsedQuestions(root as SampleQuestion[]);
              setSuccessMsg(`Đã nạp ${root.length} câu hỏi từ file JSON! 🎉`);
            }
          } else if (root && typeof root === "object") {
            const cardObj = root as Record<string, unknown>;
            const rawQs = Array.isArray(cardObj.sampleQuestions)
              ? (cardObj.sampleQuestions as Record<string, unknown>[])
              : Array.isArray(cardObj.questions)
                ? (cardObj.questions as Record<string, unknown>[])
                : [];
            if (rawQs.length === 0) {
              setErrorMsg("File JSON chưa có mảng câu hỏi (sampleQuestions / questions).");
              return;
            }
            if (typeof cardObj.title === "string" && cardObj.title.trim()) setTitle(cardObj.title);
            const rawCat = String(cardObj.category || cardObj.part || "").toLowerCase();
            if (rawCat.includes("6")) setCategory("part6");
            else if (rawCat.includes("7")) setCategory("part7");
            else if (rawCat.includes("grammar")) setCategory("grammar");
            else if (rawCat.includes("5")) setCategory("part5");
            if (typeof cardObj.tag === "string") setTag(cardObj.tag);
            setPassageText(String(cardObj.passageText || cardObj.content || cardObj.passage || ""));
            setPassageTextVi(String(cardObj.passageTextVi || ""));
            const loadedCardVocab = Array.isArray(cardObj.vocabList)
              ? (cardObj.vocabList as VocabItem[])
              : Array.isArray(cardObj.vocabulary)
                ? (cardObj.vocabulary as VocabItem[])
                : [];
            setCardVocabList(loadedCardVocab);
            const mappedQs: SampleQuestion[] = rawQs.map((q, idx) => {
              let opts = ["", "", "", ""];
              if (Array.isArray(q.options)) {
                opts = [0, 1, 2, 3].map((i) => String((q.options as unknown[])[i] ?? ""));
              } else if (q.options && typeof q.options === "object") {
                const obj = q.options as Record<string, string>;
                opts = [obj.A || "", obj.B || "", obj.C || "", obj.D || ""];
              }
              let correctIdx = typeof q.correctIndex === "number" ? q.correctIndex : -1;
              if (correctIdx < 0 || correctIdx > 3) {
                const letter = String(q.correctAnswer || "A").trim().toUpperCase();
                correctIdx = Math.max(0, ["A", "B", "C", "D"].indexOf(letter));
              }
              return {
                questionNum: String(q.questionNum ?? q.id ?? idx + 1),
                question: String(q.question ?? q.questionText ?? ""),
                bilingual: typeof q.bilingual === "string" ? q.bilingual : undefined,
                options: opts,
                optionMeanings: Array.isArray(q.optionMeanings) ? (q.optionMeanings as string[]) : undefined,
                correctIndex: correctIdx,
                explanation: String(q.explanation ?? ""),
                vocabList: Array.isArray(q.vocabList) ? (q.vocabList as VocabItem[]) : [],
              };
            });
            setParsedQuestions(mappedQs);
            setSuccessMsg(`Đã nạp chuyên đề "${String(cardObj.title || "Mới")}" với ${mappedQs.length} câu hỏi! 🎉`);
          }
        } catch {
          setErrorMsg("File JSON không hợp lệ hoặc sai cấu trúc!");
        }
        return;
      }

      if (lowerName.endsWith(".csv")) {
        const csvRows = parseCsvRows(content);
        if (csvRows.length >= 2) {
          const headers = csvRows[0].map(normalizeCsvHeader);
          const colIdx = (aliases: string[]) => {
            const exact = headers.findIndex((h) => aliases.some((a) => h === a));
            return exact !== -1 ? exact : headers.findIndex((h) => aliases.some((a) => a.length >= 4 && h.includes(a)));
          };
          const idxQText = colIdx(["debaitienganh", "questiontext", "question", "debai"]);
          if (idxQText >= 0) {
            const idxNum = colIdx(["causo", "questionnum", "stt", "no"]);
            const idxVi = colIdx(["bandichtiengviet", "bilingual", "translation", "dichcau", "dich"]);
            const idxA = colIdx(["dapana", "optiona", "a"]);
            const idxB = colIdx(["dapanb", "optionb", "b"]);
            const idxC = colIdx(["dapanc", "optionc", "c"]);
            const idxD = colIdx(["dapand", "optiond", "d"]);
            const idxAns = colIdx(["dapandung", "correctanswer", "answer", "key"]);
            const idxExp = colIdx(["giaithichchitiet", "giaithich", "explanation", "loigiai"]);
            const idxVocab = colIdx(["tuvung", "vocab", "vocabulary"]);
            const idxPassage = colIdx(["doanvan", "passagetext", "passage", "content"]);
            const idxPassageVi = colIdx(["bandichdoanvan", "passagetextvi"]);

            const csvQuestions: SampleQuestion[] = [];
            let csvPassage = "";
            let csvPassageVi = "";
            csvRows.slice(1).forEach((cells, rIdx) => {
              const qText = cells[idxQText] || "";
              if (!qText) return;
              if (idxPassage >= 0 && !csvPassage && cells[idxPassage]?.trim()) csvPassage = cells[idxPassage].trim();
              if (idxPassageVi >= 0 && !csvPassageVi && cells[idxPassageVi]?.trim()) csvPassageVi = cells[idxPassageVi].trim();
              const ansChar = (idxAns >= 0 ? cells[idxAns] || "A" : "A").trim().toUpperCase().slice(0, 1);
              const ansIdx = Math.max(0, ["A", "B", "C", "D"].indexOf(ansChar));
              const vocabRaw = idxVocab >= 0 ? cells[idxVocab] || "" : "";
              csvQuestions.push({
                questionNum: (idxNum >= 0 && cells[idxNum]) || String(101 + rIdx),
                question: qText,
                bilingual: idxVi >= 0 ? cells[idxVi] || "" : "",
                options: [
                  idxA >= 0 ? cells[idxA] || "" : "",
                  idxB >= 0 ? cells[idxB] || "" : "",
                  idxC >= 0 ? cells[idxC] || "" : "",
                  idxD >= 0 ? cells[idxD] || "" : "",
                ],
                correctIndex: ansIdx,
                explanation: idxExp >= 0 ? cells[idxExp] || "" : "",
                vocabList: vocabRaw ? parseBulkVocabList(vocabRaw) : [],
              });
            });

            if (csvQuestions.length > 0) {
              if (csvPassage) setPassageText(csvPassage);
              if (csvPassageVi) setPassageTextVi(csvPassageVi);
              setCardVocabList([]);
              setParsedQuestions(csvQuestions);
              setSuccessMsg(`Đã nạp ${csvQuestions.length} câu hỏi từ file CSV "${file.name}"! 🎉`);
              return;
            }
          }
        }
      }

      setRawText(content);
      handleParseText(content);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể đọc file vừa chọn!");
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
  };

  // Tải file mẫu CSV
  const handleDownloadCsvTemplate = () => {
    const csvContent =
      "Câu số,Đề bài tiếng Anh,Bản dịch tiếng Việt,Đáp án A,Đáp án B,Đáp án C,Đáp án D,Đáp án đúng (A/B/C/D),Giải thích chi tiết,Từ vựng\n" +
      '101,"When she held her last meeting, Ms. Toba ------- her sales staff to perform even better next quarter.","Khi cô ấy tổ chức cuộc họp trước, bà Toba đã khuyến khích nhân viên...","encourage","is encouraging","encouraged","was encouraged","C","Cần động từ chia ở thì quá khứ đơn vì mệnh đề trước có held.","encourage (v): khuyến khích; staff (n): nhân viên"\n' +
      '102,"All visitors are required to show photo identification ------- entering the research laboratory.","Tất cả khách tham quan được yêu cầu xuất trình giấy tờ tùy thân trước khi vào...","before","while","during","until","A","Before + V-ing chỉ hành động xảy ra trước.","laboratory (n): phòng thí nghiệm; identification (n): giấy tờ tùy thân"\n';

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mau_nhap_de_thi_toeic_reading.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Lưu chuyên đề vào kho
  const handleSaveToBank = () => {
    if (parsedQuestions.length === 0) {
      setErrorMsg("Chưa có câu hỏi nào được bóc tách! Vui lòng bấm 'Phân tích văn bản đề thi' trước.");
      return;
    }

    const hasAnyPassage = !!passageText.trim() || parsedQuestions.some((q) => !!q.passageText);

    // Kiểm tra định dạng: Không cho nhập câu đơn Part 5 vào Part 6 hoặc Part 7
    if (category === "part6" || category === "part7") {
      if (!hasAnyPassage) {
        const partLabel = category === "part6" ? "Part 6 (Điền đoạn văn)" : "Part 7 (Đọc hiểu văn bản)";
        setErrorMsg(`❌ Sai định dạng: Đề thi ${partLabel} bắt buộc phải có Đoạn văn/Bài đọc (Passage). Bạn không thể nhập các câu đơn của Part 5 vào ${partLabel}!`);
        return;
      }
    }

    // Kiểm tra định dạng: Không cho đưa bài đọc vào Part 5
    if (category === "part5" && passageText.trim().length > 0) {
      setErrorMsg("❌ Sai định dạng: Part 5 là phần thi câu đơn độc lập (Incomplete Sentences), không chứa đoạn văn bài đọc. Vui lòng chuyển Phần thi sang Part 6 hoặc Part 7!");
      return;
    }

    const newId = `reading-import-${Date.now().toString().slice(-6)}`;
    const finalCard: ExerciseCardData = {
      id: newId,
      title: title.trim() || `Chuyên đề Reading TOEIC ${parsedQuestions.length} câu`,
      category,
      subCategory,
      tag: tag.trim() || "Chuyên đề tổng hợp",
      totalQuestions: parsedQuestions.length,
      studiedQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      passageText: passageText.trim() || undefined,
      passageTextVi: passageTextVi.trim() || undefined,
      ...(cardVocabList.length > 0 ? { vocabList: cardVocabList } : {}),
      theory: {
        summary: `Chuyên đề ${category.toUpperCase()} gồm ${parsedQuestions.length} câu hỏi chọn lọc có đáp án và giải thích chi tiết.`,
        rules: ["Nắm chắc dấu hiệu nhận biết ngữ pháp và từ vựng trọng tâm.", "Đọc kỹ đề và loại trừ phương án sai."],
        example: parsedQuestions[0]?.question || "Example sentence for reading practice.",
      },
      sampleQuestions: parsedQuestions,
    };

    onImportSuccess(finalCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Import Đề Thi
                </h2>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên bài đọc / Chuyên đề <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: ETS 2024 Test 5 - Part 5"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phần thi (Part)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as "part5" | "part6" | "part7" | "grammar")}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="part5">Part 5 - Câu đơn (Incomplete Sentences)</option>
                <option value="part6">Part 6 - Điền đoạn văn (Text Completion)</option>
                <option value="part7">Part 7 - Đọc hiểu đoạn văn (Reading Comprehension)</option>
                <option value="grammar">Chuyên đề Ngữ pháp & Từ vựng</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề / Nhãn (Tag)</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="VD: Hợp đồng & Doanh nghiệp"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer text-left ${
                  activeTab === "paste"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ClipboardPaste className="w-4 h-4 shrink-0" />
                <span>1. Copy-Paste Văn Bản Đề Thi Trực Tiếp</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer text-left ${
                  activeTab === "file"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>2. Tải Lên File (Excel / CSV / JSON)</span>
              </button>
            </div>

            {/* Quick Sample Presets */}
            {activeTab === "paste" && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Dán nhanh mẫu:</span>
                <button
                  type="button"
                  onClick={() => {
                    setRawText(SAMPLE_PART5);
                    handleParseText(SAMPLE_PART5);
                  }}
                  className="font-bold text-slate-700 hover:text-blue-600 hover:underline transition cursor-pointer"
                >
                  Mẫu Part 5
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setRawText(SAMPLE_PART6);
                    handleParseText(SAMPLE_PART6);
                  }}
                  className="font-bold text-slate-700 hover:text-blue-600 hover:underline transition cursor-pointer"
                >
                  Mẫu Part 6
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setRawText(SAMPLE_PART7);
                    handleParseText(SAMPLE_PART7);
                  }}
                  className="font-bold text-slate-700 hover:text-blue-600 hover:underline transition cursor-pointer"
                >
                  Mẫu Part 7
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: COPY-PASTE */}
          {activeTab === "paste" && (
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Dán toàn bộ văn bản đề thi vào đây (Copy từ Word, PDF, Web hoặc ETS):</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleParseText()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Phân tích văn bản ngay</span>
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Dán văn bản câu hỏi tại đây theo định dạng tự nhiên:

101. When she held her last meeting, Ms. Toba ------- her sales staff to perform even better next quarter.
(A) encourage
(B) is encouraging
(C) encouraged
(D) was encouraged
Đáp án: C
Dịch: Khi cô ấy tổ chức cuộc họp trước, bà Toba đã khuyến khích nhân viên...
Giải thích: Cần động từ chia ở thì quá khứ đơn vì mệnh đề trước có "held"...
Từ vựng: encourage (v): khuyến khích, staff (n): nhân viên

102. All visitors are required to show photo identification ------- entering the research laboratory.
(A) before
(B) while
(C) during
(D) until
Đáp án: A
...`}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-white text-xs font-mono text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"
                />
              </div>

              {/* Optional Passage text for Part 6 & 7 */}
              {(category === "part6" || category === "part7") && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <p className="text-xs font-bold text-amber-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    <span>Đoạn văn đọc hiểu dành cho Part 6 &amp; 7 (Nếu chưa gắn thẻ [Đoạn văn] ở trên):</span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Đoạn văn tiếng Anh (English Passage)
                      </label>
                      <textarea
                        rows={4}
                        value={passageText}
                        onChange={(e) => setPassageText(e.target.value)}
                        placeholder="Nội dung đoạn văn tiếng Anh..."
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Bản dịch tiếng Việt (Vietnamese Translation)
                      </label>
                      <textarea
                        rows={4}
                        value={passageTextVi}
                        onChange={(e) => setPassageTextVi(e.target.value)}
                        placeholder="Bản dịch tiếng Việt tương ứng..."
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FILE UPLOAD */}
          {activeTab === "file" && (
            <div className="space-y-4">
              <div className="p-8 rounded-3xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 text-center transition flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Kéo thả file đề thi vào đây, hoặc nhấn để chọn file
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hỗ trợ định dạng file: <strong>.xlsx, .csv, .json, .txt</strong>
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-sm">
                  {isUploadingFile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploadingFile ? "Đang xử lý file..." : "Chọn file từ máy tính"}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.json,.csv,.txt"
                    disabled={isUploadingFile}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/80 border border-blue-200">
                <div className="flex items-start sm:items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-700 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <p className="text-xs font-bold text-blue-950">Chưa có file mẫu Excel chuẩn?</p>
                    <p className="text-[11px] text-blue-700">
                      Tải file mẫu có sẵn các cột (Câu số, Đề bài, Đáp án A-B-C-D, Đáp án đúng, Lời giải, Từ vựng) để điền nhanh.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadCsvTemplate}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-blue-300 text-xs font-bold text-blue-800 hover:bg-blue-50 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file mẫu CSV</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Interactive Vocab Extractor from Passage & Questions */}
          {(parsedQuestions.length > 0 || passageText.trim().length > 0) && (
            <ReadingVocabExtractorPanel
              passageText={passageText}
              questions={parsedQuestions}
              existingWords={existingVocabWords}
              allowCardLevelTarget
              defaultTargetQuestionIndex={parsedQuestions.length > 0 ? 0 : null}
              compact
              applyButtonLabel="Đưa từ đã chọn vào bản preview"
              onApplyVocab={handleApplyExtractedVocab}
            />
          )}

          {/* Live Questions & Vocab Preview */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Bảng xem trước câu hỏi đã nhận diện ({parsedQuestions.length} câu)
                  </h3>
                  <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {parsedVocabCount} từ vựng
                  </span>
                  {(passageText || parsedQuestions[0]?.passageText) && (
                    <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      Có đoạn văn đọc hiểu
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Kiểm tra câu hỏi trước khi lưu vào kho
                </span>
              </div>

              {cardVocabList.length > 0 && (
                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                  <div className="text-[11px] font-bold text-indigo-900">
                    Từ vựng chung toàn bài ({cardVocabList.length} từ)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cardVocabList.map((v, vIdx) => (
                      <div
                        key={`${v.word}-${vIdx}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-indigo-200 text-[11px] shadow-2xs"
                      >
                        <span className="font-bold text-indigo-800">{v.word}</span>
                        {v.pos && <span className="text-slate-500">({v.pos})</span>}
                        {v.ipa && <span className="font-mono text-slate-400 text-[10px]">{v.ipa}</span>}
                        <span className="text-slate-700 font-medium">: {v.meaning}</span>
                        <button
                          type="button"
                          onClick={() => playPreviewWord(v.word)}
                          className="text-slate-400 hover:text-blue-600 cursor-pointer"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCardVocab(vIdx)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Xóa từ này"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="max-h-72 overflow-y-auto space-y-2.5 rounded-2xl border border-slate-200 p-3 bg-slate-50/50">
                {parsedQuestions.map((q, idx) => {
                  const letters = ["A", "B", "C", "D"];
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono text-[11px] font-bold">
                            Câu {q.questionNum}
                          </span>
                          <span className="text-xs font-bold text-slate-900 leading-snug">
                            {q.question}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                          Đáp án: {letters[q.correctIndex]}
                        </span>
                      </div>

                      {q.bilingual && (
                        <p className="text-[11px] text-slate-500 italic pl-1">
                          Dịch: {q.bilingual}
                        </p>
                      )}

                      {/* Options grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-1.5 px-2.5 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 ${
                              oIdx === q.correctIndex
                                ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-600"
                            }`}
                          >
                            <span className="font-bold">({letters[oIdx]})</span>
                            <span className="truncate">{opt || "---"}</span>
                          </div>
                        ))}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <p className="text-[11px] text-slate-600 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60 leading-relaxed">
                          <strong>💡 Lời giải:</strong> {q.explanation}
                        </p>
                      )}

                      {/* Question Vocab List */}
                      {q.vocabList && q.vocabList.length > 0 && (
                        <div className="pt-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-500 mr-0.5">
                            Từ vựng ({q.vocabList.length}):
                          </span>
                          {q.vocabList.map((v, vIdx) => (
                            <span
                              key={`${v.word}-${vIdx}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50/70 border border-blue-200 text-[11px] text-slate-800"
                            >
                              <strong className="text-blue-700">{v.word}</strong>
                              {v.pos && <span className="text-slate-500">({v.pos})</span>}
                              {v.ipa && <span className="font-mono text-slate-400 text-[10px]">{v.ipa}</span>}
                              <span>: {v.meaning}</span>
                              <button
                                type="button"
                                onClick={() => playPreviewWord(v.word)}
                                className="text-slate-400 hover:text-blue-600 cursor-pointer"
                                title="Nghe phát âm"
                              >
                                <Volume2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestionVocab(idx, vIdx)}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Xóa từ này"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Mỗi câu đúng tương đương 5 điểm TOEIC theo thang điểm chuẩn.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSaveToBank}
              disabled={parsedQuestions.length === 0}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition cursor-pointer shadow-md whitespace-nowrap ${
                parsedQuestions.length > 0
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>Lưu {parsedQuestions.length} câu vào Kho bài đọc</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
