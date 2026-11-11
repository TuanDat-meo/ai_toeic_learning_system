"use client";

import React, { useState, useMemo } from "react";
import { ExerciseCardData, SampleQuestion, VocabItem } from "@/app/admin/content/reading/types";
import {
  X,
  BookOpen,
  AlertCircle,
  Sparkles,
  Zap,
  CheckCircle2,
  FileText,
  Layers,
  Plus,
  Trash2,
  Check,
  ListOrdered,
  BookMarked,
  Info,
  Volume2,
} from "lucide-react";

export interface ReadingCreateCardModalProps {
  editingCard: ExerciseCardData | null;
  cardFormTitle: string;
  setCardFormTitle: (val: string) => void;
  cardFormCategory: "grammar" | "part5" | "part6" | "part7";
  setCardFormCategory: (val: "grammar" | "part5" | "part6" | "part7") => void;
  cardFormSubCategory: "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types";
  setCardFormSubCategory: (val: "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types") => void;
  cardFormTag: string;
  setCardFormTag: (val: string) => void;
  cardFormTotalQuestions: number;
  setCardFormTotalQuestions: (val: number) => void;
  cardFormTheorySummary: string;
  setCardFormTheorySummary: (val: string) => void;
  cardFormTheoryRules: string;
  setCardFormTheoryRules: (val: string) => void;
  cardFormTheoryExample: string;
  setCardFormTheoryExample: (val: string) => void;
  cardFormPassageText: string;
  setCardFormPassageText: (val: string) => void;
  cardFormPassageTextVi: string;
  setCardFormPassageTextVi: (val: string) => void;
  cardFormSampleQuestions: SampleQuestion[];
  setCardFormSampleQuestions: React.Dispatch<React.SetStateAction<SampleQuestion[]>>;
  onSaveCard: (e: React.FormEvent) => void;
  onClose: () => void;
}

interface PartPreset {
  category: "part5" | "part6" | "part7";
  label: string;
  subCategory: "word_types" | "text_types" | "levels";
  tag: string;
  defaultQuestions: number;
  startQuestionNum: string;
  titleSuggestion: string;
  directionsEn: string;
  directionsVi: string;
  rules: string[];
  example: string;
  defaultPassage?: string;
  defaultPassageVi?: string;
}

const PART_PRESETS: Record<"part5" | "part6" | "part7", PartPreset> = {
  part5: {
    category: "part5",
    label: "Part 5: Incomplete Sentences",
    subCategory: "word_types",
    tag: "Part 5 - Điền câu đơn",
    defaultQuestions: 30,
    startQuestionNum: "101",
    titleSuggestion: "ETS TOEIC Reading - Part 5 (Câu 101 - 130)",
    directionsEn:
      "Directions: A word or phrase is missing in each of the sentences below. Four answer choices are given below each sentence. Select the best answer to complete the sentence. Then mark the letter (A), (B), (C), or (D) on your answer sheet.",
    directionsVi:
      "Hướng dẫn: Mỗi câu dưới đây bị khuyết một từ hoặc cụm từ. Bốn phương án trả lời được cung cấp bên dưới mỗi câu. Chọn đáp án thích hợp nhất để hoàn thành câu và đánh dấu vào phiếu trả lời.",
    rules: [
      "Quy tắc 1: Xác định cấu trúc câu S + V + O trước khi chọn từ loại.",
      "Quy tắc 2: Phân biệt nhanh dạng câu từ vựng (dịch nghĩa) và dạng câu ngữ pháp (nhìn trước sau chỗ trống).",
      "Quy tắc 3: Tốc độ chuẩn ETS là tối đa 30 giây/câu để dành thời gian cho Part 7.",
    ],
    example: "Ms. Reynolds requested that all department managers submit their quarterly budget estimates by Friday.",
  },
  part6: {
    category: "part6",
    label: "Part 6: Text Completion",
    subCategory: "text_types",
    tag: "Part 6 - Điền đoạn văn",
    defaultQuestions: 4,
    startQuestionNum: "131",
    titleSuggestion: "ETS TOEIC Reading - Part 6 (Điền đoạn 131 - 134)",
    directionsEn:
      "Directions: Read the texts that follow. A word, phrase, or sentence is missing in parts of each text. Four answer choices for each question are given below the text. Select the best answer to complete the text. Then mark the letter (A), (B), (C), or (D) on your answer sheet.",
    directionsVi:
      "Hướng dẫn: Đọc các đoạn văn sau. Một số vị trí trong đoạn văn bị khuyết từ, cụm từ hoặc câu ([131], [132], [133], [134]). Chọn phương án trả lời thích hợp nhất để điền vào chỗ trống.",
    rules: [
      "Quy tắc 1: Đoạn văn gồm 4 câu khuyết ([131]-[134]). Luôn đọc câu trước và câu sau chỗ trống.",
      "Quy tắc 2: Đối với câu điền nguyên câu văn (Sentence insertion), đọc lướt cả đoạn để nắm mạch logic.",
      "Quy tắc 3: Chú ý liên từ chuyển ý (However, Therefore, In addition) và thì của toàn đoạn văn.",
    ],
    example: "The technicians will need to enter each bathroom to inspect the water pipes.",
    defaultPassage: "To: All Residents <residents@parkview.com>\nFrom: Building Management\nDate: March 15\nSubject: Scheduled Plumbing Maintenance\n\nPlease be advised that our maintenance team will conduct routine inspections of the water heating system on Thursday, March 18. Work will begin promptly at 9:00 A.M. and is expected to finish by 3:00 P.M.\n\nDuring this period, water service will be temporarily [131]------ throughout the building. We recommend storing sufficient water for your morning needs. In addition, technicians [132]------ access to utility closets located on each floor. [133]------. We apologize for any inconvenience this essential maintenance work may cause. Please contact the front desk if you have any urgent [134]------.",
    defaultPassageVi: "Gửi: Toàn thể cư dân <residents@parkview.com>\nTừ: Ban quản lý tòa nhà\nNgày: 15 tháng 3\nTiêu đề: Bảo trì hệ thống ống nước theo lịch\n\nXin lưu ý rằng đội bảo trì của chúng tôi sẽ tiến hành kiểm tra định kỳ hệ thống đun nước nóng vào thứ Năm, ngày 18 tháng 3. Công việc sẽ bắt đầu đúng 9:00 sáng và dự kiến hoàn tất trước 3:00 chiều.\n\nTrong thời gian này, dịch vụ cấp nước sẽ tạm thời bị [131] gián đoạn trên toàn bộ tòa nhà. Chúng tôi khuyến nghị quý cư dân dự trữ đủ nước cho nhu cầu buổi sáng. Ngoài ra, kỹ thuật viên sẽ [132] yêu cầu quyền tiếp cận các tủ kỹ thuật ở mỗi tầng. [133] Chúng tôi rất tiếc vì sự bất tiện mà công việc bảo trì thiết yếu này có thể gây ra. Vui lòng liên hệ quầy lễ tân nếu bạn có bất kỳ [134] thắc mắc khẩn cấp nào.",
  },
  part7: {
    category: "part7",
    label: "Part 7: Reading Comprehension",
    subCategory: "levels",
    tag: "Part 7 - Đọc hiểu văn bản",
    defaultQuestions: 2,
    startQuestionNum: "147",
    titleSuggestion: "ETS TOEIC Reading - Part 7 (Đọc hiểu 147 - 148)",
    directionsEn:
      "Directions: In this part you will read a selection of texts, such as magazine and newspaper articles, letters, and advertisements. Each text is followed by several questions. Select the best answer for each question and mark the letter (A), (B), (C), or (D) on your answer sheet.",
    directionsVi:
      "Hướng dẫn: Trong phần này bạn sẽ đọc tuyển tập các văn bản (bài báo, thư từ, quảng cáo, email, tin nhắn). Mỗi bài đọc có một số câu hỏi đi kèm. Chọn phương án trả lời chính xác nhất.",
    rules: [
      "Quy tắc 1: Đọc lướt tiêu đề văn bản, người gửi/người nhận và mục đích trước khi đọc chi tiết.",
      "Quy tắc 2: Với bài đọc đôi/ba (Double & Triple Passages), câu hỏi số 4 & 5 thường yêu cầu liên kết thông tin giữa 2 văn bản.",
      "Quy tắc 3: Cảnh giác bẫy từ đồng nghĩa (paraphrasing) - từ trong đáp án đúng thường diễn đạt lại từ trong bài.",
    ],
    example: "According to the email, what discount will customers receive if they book before June 1st?",
    defaultPassage: "SILVERLINE LOGISTICS\nClient Update - Policy Changes\nEffective: October 1\n\nSilverline Logistics is pleased to announce the opening of our new distribution center in Chicago. With this expansion, standard ground delivery times to Midwestern destinations will be reduced from three business days to just 24 hours.\n\nFurthermore, all corporate clients registered under our Gold Tier program are now eligible for complimentary shipment tracking and priority weekend processing at no extra charge. If your account details need updating, please log in to your portal before October 15.",
    defaultPassageVi: "HÃNG VẬN TẢI SILVERLINE\nThông báo cập nhật khách hàng - Thay đổi chính sách\nHiệu lực: Ngày 1 tháng 10\n\nSilverline Logistics hân hạnh thông báo việc khai trương trung tâm phân phối mới tại Chicago. Với sự mở rộng này, thời gian giao hàng đường bộ tiêu chuẩn tới các điểm đến ở vùng Trung Tây sẽ được rút ngắn từ ba ngày làm việc xuống chỉ còn 24 giờ.\n\nHơn nữa, tất cả khách hàng doanh nghiệp thuộc chương trình Hạng Vàng hiện đủ điều kiện nhận dịch vụ theo dõi đơn hàng miễn phí và xử lý ưu tiên cuối tuần mà không phải trả thêm phí. Nếu thông tin tài khoản của bạn cần cập nhật, vui lòng đăng nhập vào cổng thông tin trước ngày 15 tháng 10.",
  },
};

const COMMON_TOEIC_OPTION_TRANSLATIONS: Record<string, string> = {
  // Question 147 sample options
  "to confirm an order and notify about shipping": "Xác nhận đơn hàng và thông báo về việc giao hàng",
  "to request updated billing information": "Yêu cầu cập nhật thông tin thanh toán",
  "to apologize for a delay in production": "Xin lỗi vì sự chậm trễ trong sản xuất",
  "to advertise a new line of office furniture": "Quảng cáo dòng sản phẩm nội thất văn phòng mới",

  // Question 148 sample options
  "the order will be permanently canceled": "Đơn hàng sẽ bị hủy vĩnh viễn",
  "the courier will leave redelivery instructions": "Nhân viên giao hàng sẽ để lại hướng dẫn giao lại",
  "the package will be left at the front door": "Kiện hàng sẽ được để lại ở cửa trước",
  "an extra delivery charge will be billed": "Phí giao hàng bổ sung sẽ được tính",

  // Frequent Part 7 business purposes
  "to confirm an order": "Xác nhận một đơn hàng",
  "to confirm a reservation": "Xác nhận đặt chỗ",
  "to confirm an appointment": "Xác nhận một cuộc hẹn",
  "to request a refund": "Yêu cầu hoàn tiền",
  "to request additional information": "Yêu cầu thêm thông tin",
  "to request an estimate": "Yêu cầu bảng báo giá",
  "to announce a policy change": "Thông báo thay đổi chính sách",
  "to introduce a new employee": "Giới thiệu nhân viên mới",
  "to schedule an interview": "Lên lịch phỏng vấn",
  "to schedule a meeting": "Lên lịch cuộc họp",
  "to submit an application": "Nộp đơn ứng tuyển",
  "to submit a proposal": "Nộp đề xuất dự án",
  "to invite attendees to an event": "Mời người tham dự sự kiện",
  "to report a technical issue": "Báo cáo sự cố kỹ thuật",
  "to report maintenance progress": "Báo cáo tiến độ bảo trì",
  "to inquire about product availability": "Hỏi về tình trạng còn hàng",
  "to inquire about opening hours": "Hỏi về giờ mở cửa",
  "to offer a special discount": "Cung cấp mức giảm giá đặc biệt",
  "to complain about poor service": "Khiếu nại về chất lượng dịch vụ",
  "to complain about damaged goods": "Khiếu nại về hàng hóa bị hỏng",
  "to thank customers for their patronage": "Cảm ơn khách hàng đã ủng hộ",
  "to thank clients for their business": "Cảm ơn đối tác đã hợp tác",
  "to verify customer information": "Xác minh thông tin khách hàng",
  "to cancel a reservation": "Hủy đặt chỗ",
  "to cancel an order": "Hủy đơn hàng",
  "to extend a contract deadline": "Gia hạn thời hạn hợp đồng",
  "to promote a seasonal sale": "Quảng bá chương trình giảm giá theo mùa",
  "to renew an agreement": "Gia hạn thỏa thuận",
};

const resolveOptionMeaning = (text: string): string => {
  if (!text) return "";
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. Direct dictionary match
  if (COMMON_TOEIC_OPTION_TRANSLATIONS[lower]) {
    return COMMON_TOEIC_OPTION_TRANSLATIONS[lower];
  }

  // 2. Direct dictionary match without leading "to "
  const withoutTo = lower.replace(/^to\s+/, "");
  if (COMMON_TOEIC_OPTION_TRANSLATIONS[withoutTo]) {
    return `Để ${COMMON_TOEIC_OPTION_TRANSLATIONS[withoutTo].toLowerCase()}`;
  }

  // 3. Pattern-based heuristic translation for TOEIC purpose infinitives
  if (lower.startsWith("to confirm")) return clean.replace(/^to confirm/i, "Để xác nhận");
  if (lower.startsWith("to request")) return clean.replace(/^to request/i, "Để yêu cầu");
  if (lower.startsWith("to announce")) return clean.replace(/^to announce/i, "Để thông báo");
  if (lower.startsWith("to notify")) return clean.replace(/^to notify/i, "Để thông báo");
  if (lower.startsWith("to apologize")) return clean.replace(/^to apologize/i, "Để xin lỗi");
  if (lower.startsWith("to invite")) return clean.replace(/^to invite/i, "Để mời");
  if (lower.startsWith("to introduce")) return clean.replace(/^to introduce/i, "Để giới thiệu");
  if (lower.startsWith("to report")) return clean.replace(/^to report/i, "Để báo cáo");
  if (lower.startsWith("to inquire")) return clean.replace(/^to inquire/i, "Để tìm hiểu / hỏi về");
  if (lower.startsWith("to advertise")) return clean.replace(/^to advertise/i, "Để quảng cáo");
  if (lower.startsWith("to provide")) return clean.replace(/^to provide/i, "Để cung cấp");
  if (lower.startsWith("to remind")) return clean.replace(/^to remind/i, "Để nhắc nhở");
  if (lower.startsWith("to cancel")) return clean.replace(/^to cancel/i, "Để hủy");
  if (lower.startsWith("to schedule")) return clean.replace(/^to schedule/i, "Để lên lịch");
  if (lower.startsWith("to offer")) return clean.replace(/^to offer/i, "Để cung cấp / tặng");
  if (lower.startsWith("to thank")) return clean.replace(/^to thank/i, "Để cảm ơn");

  return "";
};

type ModalTab = "info" | "passage" | "questions" | "vocab" | "quick_paste";

export const ReadingCreateCardModal: React.FC<ReadingCreateCardModalProps> = ({
  editingCard,
  cardFormTitle,
  setCardFormTitle,
  cardFormCategory,
  setCardFormCategory,
  cardFormSubCategory,
  setCardFormSubCategory,
  cardFormTag,
  setCardFormTag,
  cardFormTotalQuestions,
  setCardFormTotalQuestions,
  cardFormTheorySummary,
  setCardFormTheorySummary,
  cardFormTheoryRules,
  setCardFormTheoryRules,
  cardFormTheoryExample,
  setCardFormTheoryExample,
  cardFormPassageText,
  setCardFormPassageText,
  cardFormPassageTextVi,
  setCardFormPassageTextVi,
  cardFormSampleQuestions,
  setCardFormSampleQuestions,
  onSaveCard,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>("info");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [partTransitionNotice, setPartTransitionNotice] = useState<{
    fromPart: string;
    toPart: string;
    count: number;
  } | null>(null);

  // Form State for "Thêm từ vựng mới" (Identical to VocabularyModals layout)
  const [vocabInputWord, setVocabInputWord] = useState("");
  const [vocabInputIpa, setVocabInputIpa] = useState("");
  const [vocabInputPos, setVocabInputPos] = useState("Verb");
  const [vocabInputSubCategory, setVocabInputSubCategory] = useState("");
  const [vocabInputMeaning, setVocabInputMeaning] = useState("");
  const [vocabInputExample, setVocabInputExample] = useState("");
  const [vocabInputSynonyms, setVocabInputSynonyms] = useState("");
  const [vocabInputAntonyms, setVocabInputAntonyms] = useState("");
  const [vocabFormError, setVocabFormError] = useState<string | null>(null);
  const [playingRegion, setPlayingRegion] = useState<"UK" | "US" | null>(null);

  // Scope filter for Tab 4 Vocab list ("all" or question index)
  const [vocabFilterScope, setVocabFilterScope] = useState<number | "all">("all");
  const [vocabTargetQuestionIdx, setVocabTargetQuestionIdx] = useState<number>(0);

  // Quick Paste raw text
  const [rawPasteText, setRawPasteText] = useState("");
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);

  // Smart Auto-Detection State
  const [detectorInput, setDetectorInput] = useState("");
  const [showAutoDetector, setShowAutoDetector] = useState(false);

  const detectedInfo = useMemo(() => {
    if (!detectorInput.trim()) return null;
    const text = detectorInput;
    const lower = text.toLowerCase();
    const hasGapTokens =
      lower.includes("[131]") ||
      lower.includes("[132]") ||
      lower.includes("[133]") ||
      lower.includes("[134]");
    const hasMultiQuestions =
      /questions?\s*\d+\s*[-–to]+\s*\d+/i.test(text) ||
      /câu\s*\d+\s*[-–đến]+\s*\d+/i.test(text);

    if (hasGapTokens) {
      return { part: "part6" as const, title: "Part 6: Text Completion (Điền đoạn văn)" };
    }
    if (hasMultiQuestions || lower.includes("dear ") || lower.includes("subject:") || text.split("\n").length > 6) {
      return { part: "part7" as const, title: "Part 7: Reading Comprehension (Đọc hiểu văn bản)" };
    }
    return { part: "part5" as const, title: "Part 5: Incomplete Sentences (Điền câu đơn)" };
  }, [detectorInput]);

  // Audio Pronunciation Synth for UK / US
  const playRegionalPronunciation = (region: "UK" | "US") => {
    const word = vocabInputWord.trim();
    if (!word) {
      setVocabFormError("Vui lòng nhập từ tiếng Anh trước khi nghe phát âm.");
      return;
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setVocabFormError(null);
    setPlayingRegion(region);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = region === "UK" ? "en-GB" : "en-US";
    utterance.rate = 0.88;
    utterance.onend = () => setPlayingRegion(null);
    utterance.onerror = () => setPlayingRegion(null);
    window.speechSynthesis.speak(utterance);
  };

  // Ensure there is at least one question
  const questions = useMemo(() => {
    if (!cardFormSampleQuestions || cardFormSampleQuestions.length === 0) {
      return [
        {
          questionNum: "101",
          question: "",
          bilingual: "",
          options: ["", "", "", ""],
          optionMeanings: ["", "", "", ""],
          correctIndex: 0,
          explanation: "",
          steps: [
            { title: "Bước 1: Phân tích ngữ cảnh", desc: "Xác định từ loại hoặc ý nghĩa cần điền." },
            { title: "Bước 2: Đối chiếu & chọn đáp án", desc: "So sánh các phương án để chọn đáp án chuẩn xác nhất." },
          ],
          vocabList: [],
        },
      ];
    }
    return cardFormSampleQuestions;
  }, [cardFormSampleQuestions]);

  const activeQuestion = questions[selectedQuestionIndex] || questions[0];

  // Total vocab count across all questions
  const totalVocabCount = useMemo(() => {
    return questions.reduce((acc, q) => acc + (q.vocabList?.length || 0), 0);
  }, [questions]);

  // Vocab list displayed according to vocabFilterScope (supports all words or per question)
  const displayedVocabList = useMemo(() => {
    if (vocabFilterScope === "all") {
      const list: { item: VocabItem; qIdx: number; qNum: string; itemIdx: number }[] = [];
      questions.forEach((q, qIdx) => {
        (q.vocabList || []).forEach((item, itemIdx) => {
          list.push({
            item,
            qIdx,
            qNum: q.questionNum || String(100 + qIdx + 1),
            itemIdx,
          });
        });
      });
      return list;
    } else {
      const targetIdx = typeof vocabFilterScope === "number" ? Math.min(vocabFilterScope, questions.length - 1) : 0;
      const q = questions[targetIdx] || questions[0];
      return (q.vocabList || []).map((item, itemIdx) => ({
        item,
        qIdx: targetIdx,
        qNum: q.questionNum || String(100 + targetIdx + 1),
        itemIdx,
      }));
    }
  }, [vocabFilterScope, questions]);

  const handleDeleteVocabGlobal = (qIdx: number, itemIdx: number) => {
    setCardFormSampleQuestions((prev) => {
      const copy = [...prev];
      if (copy[qIdx]) {
        const q = { ...copy[qIdx] };
        q.vocabList = (q.vocabList || []).filter((_, i) => i !== itemIdx);
        copy[qIdx] = q;
      }
      return copy;
    });
  };

  // Apply a Preset
  const handleApplyPreset = (presetKey: "part5" | "part6" | "part7") => {
    const preset = PART_PRESETS[presetKey];
    const prevCategory = cardFormCategory;
    setCardFormCategory(preset.category);
    setCardFormSubCategory(preset.subCategory);
    setCardFormTag(preset.tag);
    setCardFormTotalQuestions(preset.defaultQuestions);
    if (!cardFormTitle.trim() || cardFormTitle.includes("Part") || cardFormTitle.includes("Reading")) {
      setCardFormTitle(preset.titleSuggestion);
    }
    setCardFormTheorySummary(preset.directionsVi);
    setCardFormTheoryRules(preset.rules.join("\n"));
    setCardFormTheoryExample(preset.example);

    // Nếu đổi sang Part 5 mà đang đứng ở tab đoạn văn thì chuyển ngay về tab câu hỏi
    if (preset.category === "part5" && activeTab === "passage") {
      setActiveTab("questions");
    }

    if (questions.length > 0 && !questions[0].question.trim()) {
      setCardFormSampleQuestions([
        {
          questionNum: preset.startQuestionNum,
          question: "",
          bilingual: "",
          options: ["", "", "", ""],
          optionMeanings: ["", "", "", ""],
          correctIndex: 0,
          explanation: "",
          steps: [
            { title: "Bước 1: Phân tích ngữ cảnh", desc: "Xác định từ loại hoặc ý nghĩa cần điền." },
            { title: "Bước 2: Đối chiếu & chọn đáp án", desc: "So sánh các phương án để chọn đáp án chuẩn xác nhất." },
          ],
          vocabList: [],
        },
      ]);
      setPartTransitionNotice(null);
    } else if (prevCategory !== presetKey && questions.some((q) => q.question.trim().length > 0)) {
      setPartTransitionNotice({
        fromPart: prevCategory,
        toPart: presetKey,
        count: questions.filter((q) => q.question.trim().length > 0).length,
      });
    }
    setErrorMsg(null);
  };

  // Tự động đánh số lại câu hỏi theo chuẩn Part (101+, 131+, 147+)
  const handleRenumberQuestions = () => {
    const startNum =
      cardFormCategory === "part5" ? 101 : cardFormCategory === "part6" ? 131 : 147;
    setCardFormSampleQuestions((prev) =>
      prev.map((q, idx) => ({
        ...q,
        questionNum: String(startNum + idx),
      }))
    );
  };

  // Gộp các câu hỏi Part 5 thành đoạn văn Part 6 có mã chỗ trống [131]-[134]
  const handleMergeQuestionsToPart6Passage = () => {
    const filledQuestions = questions.filter((q) => q.question.trim().length > 0);
    if (filledQuestions.length === 0) {
      setErrorMsg("Chưa có nội dung câu hỏi nào để gộp thành đoạn văn!");
      return;
    }

    const sentences = filledQuestions.map((q, idx) => {
      const qNum = 131 + idx;
      let s = q.question.trim();
      if (s.includes("______") || /_{2,}/.test(s)) {
        s = s.replace(/_{2,}/g, `[${qNum}]------`);
      } else if (/\[\d+\]/.test(s)) {
        s = s.replace(/\[\d+\]/g, `[${qNum}]`);
      } else {
        s = `${s} [${qNum}]------.`;
      }
      return s;
    });

    const mergedPassage = sentences.join(" ");
    setCardFormPassageText(mergedPassage);

    // Đánh số lại câu hỏi thành 131, 132...
    setCardFormSampleQuestions((prev) =>
      prev.map((q, idx) => ({
        ...q,
        questionNum: String(131 + idx),
      }))
    );

    setActiveTab("passage");
    setPartTransitionNotice(null);
  };

  // Question editing helpers
  const handleUpdateCurrentQuestion = (updater: (q: SampleQuestion) => SampleQuestion) => {
    setCardFormSampleQuestions((prev) => {
      const copy = prev.length > 0 ? [...prev] : [{ ...questions[0] }];
      const idx = Math.min(selectedQuestionIndex, copy.length - 1);
      copy[idx] = updater({ ...copy[idx] });
      return copy;
    });
  };

  const handleAddQuestion = () => {
    const nextNum = String(100 + questions.length + 1);
    const newQ: SampleQuestion = {
      questionNum: nextNum,
      question: "",
      bilingual: "",
      options: ["", "", "", ""],
      optionMeanings: ["", "", "", ""],
      correctIndex: 0,
      explanation: "",
      steps: [
        { title: "Bước 1: Phân tích cú pháp / ngữ cảnh", desc: "Xác định từ loại hoặc ý cần tìm trong đoạn văn." },
        { title: "Bước 2: Đối chiếu phương án", desc: "Loại trừ các phương án sai và chọn đáp án chính xác." },
      ],
      vocabList: [],
    };
    setCardFormSampleQuestions((prev) => [...prev, newQ]);
    setSelectedQuestionIndex(questions.length);
    setCardFormTotalQuestions(Math.max(cardFormTotalQuestions, questions.length + 1));
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      setErrorMsg("Phải giữ lại ít nhất 1 câu hỏi!");
      return;
    }
    setCardFormSampleQuestions((prev) => prev.filter((_, i) => i !== idx));
    setSelectedQuestionIndex((prev) => Math.max(0, Math.min(prev, questions.length - 2)));
    setCardFormTotalQuestions(Math.max(1, questions.length - 1));
  };

  // Add Vocabulary Item into active question (Matching "Thêm từ vựng mới" form)
  const handleAddVocabFromForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!vocabInputWord.trim()) {
      setVocabFormError("Vui lòng nhập từ tiếng Anh.");
      return;
    }
    if (!vocabInputMeaning.trim()) {
      setVocabFormError("Vui lòng nhập nghĩa tiếng Việt cho từ.");
      return;
    }

    const newItem: VocabItem = {
      word: vocabInputWord.trim(),
      pos: vocabInputPos.toLowerCase(),
      level: "B1",
      ipa: vocabInputIpa.trim(),
      meaning: vocabInputMeaning.trim(),
      example: vocabInputExample.trim() ? { en: vocabInputExample.trim(), vi: "" } : undefined,
      synonyms: vocabInputSynonyms.trim()
        ? vocabInputSynonyms.split(",").map((s) => ({ en: s.trim(), vi: "" }))
        : undefined,
      antonyms: vocabInputAntonyms.trim()
        ? vocabInputAntonyms.split(",").map((a) => ({ en: a.trim(), vi: "" }))
        : undefined,
    };

    setCardFormSampleQuestions((prev) => {
      const copy = prev.length > 0 ? [...prev] : [{ ...questions[0] }];
      const targetIdx = Math.min(Math.max(0, vocabTargetQuestionIdx), copy.length - 1);
      const targetQ = { ...copy[targetIdx] };
      targetQ.vocabList = [...(targetQ.vocabList || []), newItem];
      copy[targetIdx] = targetQ;
      return copy;
    });

    // Reset vocab inputs
    setVocabInputWord("");
    setVocabInputIpa("");
    setVocabInputMeaning("");
    setVocabInputExample("");
    setVocabInputSynonyms("");
    setVocabInputAntonyms("");
    setVocabFormError(null);
  };

  const handleDeleteVocabItem = (vIdx: number) => {
    handleUpdateCurrentQuestion((q) => ({
      ...q,
      vocabList: (q.vocabList || []).filter((_, i) => i !== vIdx),
    }));
  };

  // Step handlers
  const handleAddStep = () => {
    handleUpdateCurrentQuestion((q) => ({
      ...q,
      steps: [
        ...(q.steps || []),
        { title: `Bước ${(q.steps || []).length + 1}: `, desc: "" },
      ],
    }));
  };

  const handleUpdateStep = (sIdx: number, field: "title" | "desc", val: string) => {
    handleUpdateCurrentQuestion((q) => {
      const steps = [...(q.steps || [])];
      if (steps[sIdx]) {
        steps[sIdx] = { ...steps[sIdx], [field]: val };
      }
      return { ...q, steps };
    });
  };

  const handleDeleteStep = (sIdx: number) => {
    handleUpdateCurrentQuestion((q) => ({
      ...q,
      steps: (q.steps || []).filter((_, i) => i !== sIdx),
    }));
  };

  // Smart Parser for Quick Paste (Supports text from either Tab 1 detector or Tab 5 raw paste)
  const handleParseRawText = (textOverride?: string) => {
    const textToParse = (typeof textOverride === "string" ? textOverride : (rawPasteText || detectorInput)).trim();
    if (!textToParse) {
      setErrorMsg("Vui lòng dán văn bản bài đọc và câu hỏi vào ô trước khi bóc tách!");
      return;
    }

    const lines = textToParse.split(/\r?\n/).map((l) => l.trim());
    let extractedPassage = "";
    let extractedPassageVi = "";
    let customTitle = "";
    let customTag = "";
    let customDirections = "";
    let readingMode: "none" | "passage" | "passageVi" | "question" = "none";

    const parsedQuestions: SampleQuestion[] = [];
    let currentQ: Partial<SampleQuestion> | null = null;
    let currentVocab: VocabItem[] = [];
    const globalVocab: VocabItem[] = [];
    let currentSteps: { title: string; desc: string }[] = [];

    const commitCurrentQ = () => {
      if (currentQ && (currentQ.question || (currentQ.options && currentQ.options.some((o) => !!o.trim())))) {
        const rawOpts = [
          currentQ.options?.[0] || "",
          currentQ.options?.[1] || "",
          currentQ.options?.[2] || "",
          currentQ.options?.[3] || "",
        ];
        const rawMeanings = [
          currentQ.optionMeanings?.[0] || "",
          currentQ.optionMeanings?.[1] || "",
          currentQ.optionMeanings?.[2] || "",
          currentQ.optionMeanings?.[3] || "",
        ];

        // Auto-resolve option meanings if not provided in raw text
        for (let oIdx = 0; oIdx < 4; oIdx++) {
          if (!rawMeanings[oIdx].trim() && rawOpts[oIdx].trim()) {
            const autoMeaning = resolveOptionMeaning(rawOpts[oIdx]);
            if (autoMeaning) rawMeanings[oIdx] = autoMeaning;
          }
        }

        parsedQuestions.push({
          questionNum: currentQ.questionNum || String(100 + parsedQuestions.length + 1),
          question: currentQ.question || "",
          bilingual: currentQ.bilingual || "",
          options: rawOpts,
          optionMeanings: rawMeanings,
          correctIndex: currentQ.correctIndex !== undefined ? currentQ.correctIndex : 0,
          explanation: currentQ.explanation || "",
          steps: currentSteps.length > 0 ? currentSteps : [
            { title: "Bước 1: Phân tích ngữ cảnh", desc: "Đọc kỹ câu hỏi và các manh mối." },
            { title: "Bước 2: Chọn đáp án chính xác", desc: "So sánh với bài đọc để chốt đáp án." },
          ],
          vocabList: [...currentVocab],
        });
      }
      currentQ = null;
      currentVocab = [];
      currentSteps = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const lower = line.toLowerCase();

      // Custom metadata triggers
      if (lower.startsWith("[tiêu đề]") || lower.startsWith("tiêu đề:") || lower.startsWith("[title]")) {
        customTitle = line.replace(/^(\[tiêu đề\]|tiêu đề\:|\[title\])\s*/i, "").trim();
        continue;
      }
      if (lower.startsWith("[thẻ]") || lower.startsWith("thẻ:") || lower.startsWith("[tag]")) {
        customTag = line.replace(/^(\[thẻ\]|thẻ\:|\[tag\])\s*/i, "").trim();
        continue;
      }
      if (lower.startsWith("[hướng dẫn]") || lower.startsWith("hướng dẫn:") || lower.startsWith("[directions]")) {
        customDirections = line.replace(/^(\[hướng dẫn\]|hướng dẫn\:|\[directions\])\s*/i, "").trim();
        continue;
      }

      // Section triggers
      if (lower.startsWith("[đoạn văn]") || lower.startsWith("đoạn văn:") || lower.startsWith("[passage]")) {
        readingMode = "passage";
        continue;
      }
      if (lower.startsWith("[dịch đoạn văn]") || lower.startsWith("bản dịch đoạn văn:") || lower.startsWith("[passage vi]")) {
        readingMode = "passageVi";
        continue;
      }

      // Check for Question start: e.g. "101. What..." or "Question 1: ..." or "Câu 1: ..."
      const qMatch = line.match(/^(?:question\s*|câu\s*)?(\d{1,3})[\.\:\)]\s*(.*)$/i);
      if (qMatch && !lower.startsWith("(a)") && !lower.startsWith("(b)") && !lower.startsWith("(c)") && !lower.startsWith("(d)")) {
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

      if (readingMode === "passage") {
        extractedPassage += (extractedPassage ? "\n" : "") + line;
        continue;
      }
      if (readingMode === "passageVi") {
        extractedPassageVi += (extractedPassageVi ? "\n" : "") + line;
        continue;
      }

      // Inside question block
      if (currentQ) {
        // Dedicated option translation lines: e.g. "Dịch A: ..." or "Dịch đáp án A: ..." or "A. Dịch: ..."
        const optViMatch = line.match(/^(?:dịch\s*(?:đáp án|phương án)?\s*([A-Da-d])|([A-Da-d])\s*(?:\.|\))\s*dịch)[\s\:\-]+(.*)$/i);
        if (optViMatch) {
          const optLetter = (optViMatch[1] || optViMatch[2]).toUpperCase();
          const optIdx = optLetter.charCodeAt(0) - 65;
          if (optIdx >= 0 && optIdx < 4) {
            currentQ.optionMeanings = currentQ.optionMeanings || ["", "", "", ""];
            currentQ.optionMeanings[optIdx] = (optViMatch[3] || "").trim();
          }
          continue;
        }

        // Options A, B, C, D (supports "(A) text", "A. text", "A) text")
        const optMatch = line.match(/^[\(\[\{]?([A-Da-d])[\)\]\}\.\:]\s*(.*)$/);
        if (optMatch) {
          const optLetter = optMatch[1].toUpperCase();
          const optContent = optMatch[2].trim();
          const optIdx = optLetter.charCodeAt(0) - 65;
          if (optIdx >= 0 && optIdx < 4) {
            currentQ.options = currentQ.options || ["", "", "", ""];
            currentQ.optionMeanings = currentQ.optionMeanings || ["", "", "", ""];

            // Check if there is Vietnamese meaning in parentheses or after colon/dash
            const meaningMatch = optContent.match(/^([^\(]+?)(?:\s*\((.*?)\)|\s*[\-–]\s*(.*?))$/);
            if (meaningMatch && (meaningMatch[2] || meaningMatch[3])) {
              currentQ.options[optIdx] = meaningMatch[1].trim();
              currentQ.optionMeanings[optIdx] = (meaningMatch[2] || meaningMatch[3]).trim();
            } else {
              currentQ.options[optIdx] = optContent;
            }
          }
          continue;
        }

        // Key / Correct Answer
        const keyMatch = line.match(/^(?:đáp án|key|answer|đa)[\s\:\-]+([A-Da-d])/i);
        if (keyMatch) {
          const correctLetter = keyMatch[1].toUpperCase();
          currentQ.correctIndex = correctLetter.charCodeAt(0) - 65;
          continue;
        }

        // Bilingual question
        const viMatch = line.match(/^(?:dịch|dịch câu|bilingual)[\s\:\-]+(.*)$/i);
        if (viMatch) {
          currentQ.bilingual = viMatch[1].trim();
          continue;
        }

        // Explanation
        const expMatch = line.match(/^(?:giải thích|explanation|phân tích)[\s\:\-]+(.*)$/i);
        if (expMatch) {
          currentQ.explanation = expMatch[1].trim();
          continue;
        }

        // Steps
        const stepMatch = line.match(/^(?:bước|step)\s*(\d+)[\s\:\-]+(.*)$/i);
        if (stepMatch) {
          currentSteps.push({
            title: `Bước ${stepMatch[1]}`,
            desc: stepMatch[2].trim(),
          });
          continue;
        }
      }

      // Vocab item (Can be inside question or general section)
      if (line.startsWith("-") || line.startsWith("•") || lower.startsWith("từ vựng:")) {
        if (lower.startsWith("từ vựng:")) continue;
        const cleanLine = line.replace(/^[\-\•\*\d\.]\s*/, "").trim();
        let word = "";
        let pos = "n";
        let ipa = "";
        let meaning = "";

        const ipaMatch = cleanLine.match(/\/([^\/]+)\//);
        if (ipaMatch) {
          ipa = `/${ipaMatch[1].trim()}/`;
        }

        const posMatch = cleanLine.match(/\((n|v|adj|adv|prep|conj)[^\)]*\)/i);
        if (posMatch) {
          pos = posMatch[1].toLowerCase();
        }

        // Clean line step by step to avoid leaving empty `()`
        const noIpaNoPos = cleanLine
          .replace(/\(\s*\/[^\/]+\/\s*\)/g, "") // remove (/ipa/)
          .replace(/\/([^\/]+)\//g, "")         // remove /ipa/
          .replace(/\((?:n|v|adj|adv|prep|conj)[^\)]*\)/gi, "") // remove (n), (v)...
          .replace(/\(\s*\)/g, "")              // remove empty ()
          .replace(/\[\s*\]/g, "")              // remove empty []
          .trim();

        const splitColon = noIpaNoPos.split(/[\:\-–]\s*(.+)/);
        if (splitColon.length >= 2) {
          word = splitColon[0].trim();
          meaning = splitColon[1].trim();
        } else {
          word = noIpaNoPos;
        }

        // Strip any residual brackets/parentheses around word
        word = word.replace(/[\(\)\[\]]/g, "").trim();

        if (word) {
          const item: VocabItem = {
            word,
            pos,
            ipa,
            meaning,
            level: "B1",
          };
          if (currentQ) {
            currentVocab.push(item);
          } else {
            globalVocab.push(item);
          }
        }
        continue;
      }
    }

    commitCurrentQ();

    // Attach globalVocab to first question if present
    if (globalVocab.length > 0 && parsedQuestions.length > 0) {
      parsedQuestions[0].vocabList = [...(parsedQuestions[0].vocabList || []), ...globalVocab];
    }

    if (extractedPassage.trim()) {
      setCardFormPassageText(extractedPassage.trim());
    }
    if (extractedPassageVi.trim()) {
      setCardFormPassageTextVi(extractedPassageVi.trim());
    }
    if (parsedQuestions.length > 0) {
      setCardFormSampleQuestions(parsedQuestions);
      setCardFormTotalQuestions(parsedQuestions.length);
      setSelectedQuestionIndex(0);
    }

    // Determine Part Category
    const hasGapTokens =
      extractedPassage.includes("[131]") ||
      extractedPassage.includes("[132]") ||
      extractedPassage.includes("[133]") ||
      extractedPassage.includes("[134]");

    const firstQNum = Number(parsedQuestions[0]?.questionNum || 0);
    const detectedCategory: "part5" | "part6" | "part7" =
      hasGapTokens
        ? "part6"
        : extractedPassage.trim() || parsedQuestions.length >= 2 || firstQNum >= 147
        ? "part7"
        : "part5";

    const preset = PART_PRESETS[detectedCategory];
    setCardFormCategory(detectedCategory);
    setCardFormSubCategory(preset.subCategory);

    // Question number range
    const qNums = parsedQuestions.map((q) => Number(q.questionNum)).filter((n) => !isNaN(n) && n > 0);
    const minQ = qNums.length > 0 ? Math.min(...qNums) : (detectedCategory === "part7" ? 147 : detectedCategory === "part6" ? 131 : 101);
    const maxQ = qNums.length > 0 ? Math.max(...qNums) : (minQ + Math.max(1, parsedQuestions.length) - 1);
    const titleRange = minQ === maxQ ? `Câu ${minQ}` : `${minQ} - ${maxQ}`;

    // 1. Tên chủ điểm / Bài đọc
    let passageHeader = "";
    if (extractedPassage.trim()) {
      const pLines = extractedPassage.trim().split("\n");
      const firstLine = pLines[0].trim();
      if (firstLine.length < 45 && !firstLine.startsWith("[") && !firstLine.includes("@") && !firstLine.includes(":")) {
        passageHeader = firstLine;
      }
    }

    const generatedTitle = passageHeader
      ? `${passageHeader} - Part ${detectedCategory === "part7" ? "7" : detectedCategory === "part6" ? "6" : "5"} (${titleRange})`
      : detectedCategory === "part7"
      ? `ETS TOEIC Reading - Part 7 (Đọc hiểu ${titleRange})`
      : detectedCategory === "part6"
      ? `ETS TOEIC Reading - Part 6 (Điền đoạn ${titleRange})`
      : `ETS TOEIC Reading - Part 5 (Câu ${titleRange})`;

    setCardFormTitle(customTitle || generatedTitle);

    // 2. Thẻ ghi chú
    const generatedTag =
      detectedCategory === "part7"
        ? `Part 7 - Email doanh nghiệp · Đọc hiểu ${titleRange}`
        : detectedCategory === "part6"
        ? `Part 6 - Thông báo nội bộ · Điền đoạn ${titleRange}`
        : `Part 5 - Câu đơn · Ngữ pháp & Từ vựng`;
    setCardFormTag(customTag || generatedTag);

    // 3. Hướng dẫn làm bài chuẩn ETS (Directions)
    setCardFormTheorySummary(customDirections || preset.directionsVi);

    // 4. Theory Rules & Example
    setCardFormTheoryRules(preset.rules.join("\n"));
    setCardFormTheoryExample(preset.example);

    // Reset vocab filter to "all" so user sees all extracted words immediately
    setVocabFilterScope("all");

    const totalParsedVocab = parsedQuestions.reduce((acc, q) => acc + (q.vocabList?.length || 0), 0);
    setParseSuccessMsg(
      `Đã bóc tách thành công: ${parsedQuestions.length} câu hỏi trắc nghiệm, ${totalParsedVocab} từ vựng trọng tâm${
        extractedPassage ? " & đoạn văn đọc" : ""
      }! Toàn bộ Thông tin (Tab 1), Đoạn văn (Tab 2), Đáp án & Dịch (Tab 3), Từ vựng (Tab 4) đã được tự động điền đầy đủ 100%.`
    );
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFormTitle.trim()) {
      setErrorMsg("Vui lòng nhập tên chủ điểm đọc (không được để trống).");
      setActiveTab("info");
      return;
    }
    if (cardFormTitle.trim().length < 3) {
      setErrorMsg("Tên chủ điểm đọc phải có ít nhất 3 ký tự.");
      setActiveTab("info");
      return;
    }

    const validQuestions = questions.filter(
      (q) => q.question.trim().length > 0 || q.options.some((opt) => opt.trim().length > 0)
    );

    if (validQuestions.length === 0) {
      setErrorMsg("Vui lòng nhập nội dung câu hỏi và ít nhất các đáp án A/B/C/D ở tab 'Bộ câu hỏi & Đáp án' trước khi lưu!");
      setActiveTab("questions");
      return;
    }

    const q1 = validQuestions[0];
    const filledOptions = q1.options.filter((o) => o.trim().length > 0);
    if (filledOptions.length < 2) {
      setErrorMsg("Câu hỏi cần có ít nhất 2 phương án trả lời (A, B...)!");
      setActiveTab("questions");
      return;
    }

    setErrorMsg(null);
    onSaveCard(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 font-sans">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        {/* HEADER (Styling matching VocabularyModals) */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
              READING
            </span>
            <h3 className="mt-1 text-base sm:text-lg font-bold text-slate-900">
              {editingCard ? "Chỉnh sửa bài đọc / chuyên đề TOEIC" : "Thêm bài đọc Reading mới"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex shrink-0 items-center gap-1 border-b border-slate-100 bg-slate-50/50 px-6 py-2 overflow-x-auto text-xs font-bold custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "info"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Thông tin bài đọc</span>
          </button>

{(cardFormCategory !== "part5" && cardFormCategory !== "grammar") && (
            <button
              type="button"
              onClick={() => setActiveTab("passage")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "passage"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2. Đoạn văn đọc (Passage)</span>
              <span className="text-rose-500 font-extrabold text-xs">*</span>
              {cardFormPassageText.trim() ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Đã có bài đọc"></span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">Bắt buộc</span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "questions"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>{cardFormCategory === "part5" ? "2. Bộ câu hỏi & Đáp án" : "3. Bộ câu hỏi & Đáp án"}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
              {questions.length} câu
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vocab")}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "vocab"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>{cardFormCategory === "part5" ? "3. Từ vựng cần học" : "4. Từ vựng cần học"}</span>
            {totalVocabCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px]">
                {totalVocabCount} từ
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quick_paste")}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "quick_paste"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-amber-700 hover:bg-amber-100/60"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Dán nhanh tự động</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl animate-in fade-in shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SCROLLABLE CONTENT BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 text-xs custom-scrollbar md:p-6 space-y-4">
          {/* TAB 1: THÔNG TIN BÀI ĐỌC */}
          {activeTab === "info" && (
            <div className="space-y-4">
              {/* THÔNG BÁO CHUYỂN ĐỔI PART */}
              {partTransitionNotice && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>
                        Chuyển đổi phần thi ({partTransitionNotice.fromPart.toUpperCase()} ➔ {partTransitionNotice.toPart.toUpperCase()}):
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPartTransitionNotice(null)}
                      className="text-[10px] text-amber-700 hover:underline cursor-pointer"
                    >
                      Bỏ qua
                    </button>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    Hệ thống đã <strong>bảo toàn nguyên vẹn toàn bộ {partTransitionNotice.count} câu hỏi</strong> và phương án của bạn mà không bị mất.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <button
                      type="button"
                      onClick={handleRenumberQuestions}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300 transition cursor-pointer flex items-center gap-1"
                    >
                      <ListOrdered className="w-3.5 h-3.5 text-amber-700" />
                      <span>
                        Đánh số lại theo chuẩn {partTransitionNotice.toPart.toUpperCase()} ({partTransitionNotice.toPart === "part5" ? "#101+" : partTransitionNotice.toPart === "part6" ? "#131+" : "#147+"})
                      </span>
                    </button>

                    {partTransitionNotice.toPart === "part6" && (
                      <button
                        type="button"
                        onClick={handleMergeQuestionsToPart6Passage}
                        className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Gộp các câu thành đoạn văn Part 6 ([131]-[134])</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* THÔNG BÁO PART 5 ẨN ĐOẠN VĂN */}
              {cardFormCategory === "part5" && (
                <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Chế độ Part 5 (Incomplete Sentences):</strong> Vì Part 5 chỉ bao gồm các câu đơn riêng biệt nên hệ thống đã tự động ẩn tab nhập đoạn văn đọc. Bạn chỉ cần nhập các câu hỏi trắc nghiệm ở tab kế tiếp!
                  </span>
                </div>
              )}

              {/* KHUÔN MẪU PART CHUẨN TOEIC */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/30 border border-blue-100/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Khuôn mẫu Part chuẩn TOEIC (1-Click áp dụng)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAutoDetector(!showAutoDetector)}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{showAutoDetector ? "Ẩn tự động nhận diện" : "Tự động nhận diện câu hỏi"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("part5")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      cardFormCategory === "part5"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white hover:bg-emerald-50/60 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80">
                        Part 5
                      </span>
                      <span className="text-xs font-bold block mt-0.5">Incomplete Sentences</span>
                    </div>
                    <span className="text-[10px] mt-1.5 opacity-90 block">30 câu (101-130) • Điền câu đơn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset("part6")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      cardFormCategory === "part6"
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-white hover:bg-purple-50/60 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80">
                        Part 6
                      </span>
                      <span className="text-xs font-bold block mt-0.5">Text Completion</span>
                    </div>
                    <span className="text-[10px] mt-1.5 opacity-90 block">16 câu (131-146) • 4 đoạn khuyết</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset("part7")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      cardFormCategory === "part7"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white hover:bg-blue-50/60 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80">
                        Part 7
                      </span>
                      <span className="text-xs font-bold block mt-0.5">Reading Comprehension</span>
                    </div>
                    <span className="text-[10px] mt-1.5 opacity-90 block">54 câu (147-200) • Đoạn đơn &amp; đa</span>
                  </button>
                </div>
              </div>

              {/* AUTO-DETECTION ACCORDION */}
              {showAutoDetector && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Nhận diện tự động Part dựa trên nội dung nhập</span>
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Dán câu hỏi hoặc bài đọc vào ô bên dưới
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    placeholder="Dán câu hỏi trắc nghiệm hoặc bài đọc vào đây để hệ thống tự nhận diện Part 5, 6 hay 7..."
                    value={detectorInput}
                    onChange={(e) => setDetectorInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-xs font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-200"
                  />

                  {detectorInput.trim() && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/80">
                      <span className="text-[11px] text-amber-900 font-semibold">
                        {detectedInfo ? detectedInfo.title : "Đã nhận văn bản đề thi"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleParseRawText(detectorInput);
                          setActiveTab("passage");
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                      >
                        <Zap className="w-4 h-4" />
                        <span>⚡ Bóc tách toàn bộ bài đọc &amp; câu hỏi vào form ngay</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 1. TÊN BÀI ĐỌC (FULL WIDTH WITH HELPER TEXT) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên chủ điểm / Bài đọc *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: allocate / ETS TOEIC Reading - Part 7 (Đọc hiểu 147 - 148)"
                  value={cardFormTitle}
                  onChange={(e) => {
                    setCardFormTitle(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium transition-all focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 bg-white"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  Tên bài đọc hiển thị cho học viên trong danh mục chuyên đề luyện thi TOEIC.
                </p>
              </div>

              {/* 3 COLUMNS PERFECT HORIZONTAL ALIGNMENT (h-6 LABEL, h-10 INPUT) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-start">
                <div>
                  <label className="h-6 flex items-center text-xs font-bold text-slate-700 mb-1">
                    Phần thi (Part)
                  </label>
                  <select
                    value={cardFormCategory}
                    onChange={(e) => {
                      const cat = e.target.value as "grammar" | "part5" | "part6" | "part7";
                      setCardFormCategory(cat);
                      if (cat === "part5" || cat === "part6" || cat === "part7") {
                        handleApplyPreset(cat);
                      }
                    }}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="part5">Part 5 (Điền câu đơn)</option>
                    <option value="part6">Part 6 (Điền đoạn văn)</option>
                    <option value="part7">Part 7 (Đọc hiểu văn bản)</option>
                    <option value="grammar">Ngữ pháp đọc (Grammar)</option>
                  </select>
                </div>

                <div>
                  <label className="h-6 flex items-center text-xs font-bold text-slate-700 mb-1">
                    Nhóm con
                  </label>
                  <select
                    value={cardFormSubCategory}
                    onChange={(e) =>
                      setCardFormSubCategory(
                        e.target.value as "word_types" | "verbs" | "other_grammar" | "levels" | "by_topic" | "text_types"
                      )
                    }
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="word_types">Từ loại (Word Types)</option>
                    <option value="verbs">Thì &amp; Động từ (Verbs)</option>
                    <option value="other_grammar">Ngữ pháp khác</option>
                    <option value="text_types">Theo dạng văn bản TOEIC</option>
                    <option value="levels">Theo cấp độ (Levels)</option>
                    <option value="by_topic">Theo chủ đề thực tế</option>
                  </select>
                </div>

                <div>
                  <label className="h-6 flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span className="truncate">Số câu hỏi bài tập *</span>
                    <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-1">(Trắc nghiệm)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={cardFormTotalQuestions}
                    onChange={(e) => setCardFormTotalQuestions(Math.max(1, Number(e.target.value)))}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Tag & Directions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thẻ ghi chú (tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Part 7 - Email doanh nghiệp | Bẫy paraphrasing"
                  value={cardFormTag}
                  onChange={(e) => setCardFormTag(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:border-blue-500 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hướng dẫn làm bài chuẩn ETS (Directions)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Mỗi câu dưới đây bị khuyết một từ hoặc cụm từ. Bốn phương án trả lời..."
                  value={cardFormTheorySummary}
                  onChange={(e) => setCardFormTheorySummary(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:border-blue-500 focus:outline-hidden bg-white resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ĐOẠN VĂN ĐỌC (PASSAGE) & BẢN DỊCH SONG NGỮ */}
          {activeTab === "passage" && cardFormCategory !== "part5" && cardFormCategory !== "grammar" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/90 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Đoạn văn đọc dùng cho Part 6 &amp; Part 7 (hoặc Part 5 nâng cao)</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Khi học viên bắt đầu luyện tập, đoạn văn đọc sẽ hiển thị ở <strong>khung bên trái</strong>. Học viên có thể tra cứu nhanh từ điển hoặc bật nút <strong>&quot;Dịch song ngữ&quot;</strong> để xem bản dịch tiếng Việt tương ứng.
                </p>
                {cardFormCategory === "part6" && questions.length > 0 && questions.some((q) => q.question.trim().length > 0) && (
                <button
                  type="button"
                  onClick={handleMergeQuestionsToPart6Passage}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 text-purple-900 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Nhét {questions.filter((q) => q.question.trim().length > 0).length} câu hỏi hiện có vào đoạn văn Part 6 (tự động tạo [131]-[134])</span>
                  </div>
                  <span className="text-[10px] bg-purple-200 text-purple-950 px-2.5 py-1 rounded-lg">1-Click gộp</span>
                </button>
              )}

              {cardFormCategory === "part6" && (
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-medium">
                    📌 <strong>Mẹo Part 6:</strong> Hãy chèn các mã <code className="bg-purple-200 px-1 py-0.5 rounded font-bold">[131]</code>, <code className="bg-purple-200 px-1 py-0.5 rounded font-bold">[132]</code>, <code className="bg-purple-200 px-1 py-0.5 rounded font-bold">[133]</code>, <code className="bg-purple-200 px-1 py-0.5 rounded font-bold">[134]</code> vào các vị trí cần điền trong đoạn văn để giao diện tự đánh dấu chỗ trống chuẩn ETS!
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  {cardFormPassageText.trim() ? "Đã có nội dung bài đọc" : "Chưa có bài đọc (hãy dán bài đọc của bạn vào bên dưới)"}
                </span>
                <div className="flex items-center gap-2">
                  {cardFormPassageText.trim() ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCardFormPassageText("");
                        setCardFormPassageTextVi("");
                      }}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa trắng bài đọc</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const preset = PART_PRESETS[cardFormCategory === "part6" ? "part6" : cardFormCategory === "part7" ? "part7" : "part5"];
                        if (preset.defaultPassage) setCardFormPassageText(preset.defaultPassage);
                        if (preset.defaultPassageVi) setCardFormPassageTextVi(preset.defaultPassageVi);
                      }}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Nạp bài đọc mẫu ({cardFormCategory === "part6" ? "Part 6" : "Part 7"}) để tham khảo</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Nội dung đoạn văn đọc tiếng Anh (Reading Passage - English) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {cardFormPassageText.trim() ? `${cardFormPassageText.split(/\s+/).filter(Boolean).length} từ` : "Chưa nhập"}
                  </span>
                </label>
                <textarea
                  rows={7}
                  placeholder={`Dán nội dung bài đọc tiếng Anh vào đây...\nVí dụ:\nSILVERLINE LOGISTICS\nClient Update - Policy Changes\nEffective: October 1...`}
                  value={cardFormPassageText}
                  onChange={(e) => setCardFormPassageText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono leading-relaxed focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Bản dịch tiếng Việt của đoạn văn (Vietnamese Translation)</span>
                  <span className="text-[10px] text-emerald-600 font-normal">Hiển thị khi học viên bật Dịch song ngữ</span>
                </label>
                <textarea
                  rows={5}
                  placeholder={`Dán bản dịch tiếng Việt của bài đọc vào đây...\nVí dụ:\nHÃNG VẬN TẢI SILVERLINE\nThông báo cập nhật khách hàng - Thay đổi chính sách...`}
                  value={cardFormPassageTextVi}
                  onChange={(e) => setCardFormPassageTextVi(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs leading-relaxed focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-100 bg-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: BỘ CÂU HỎI TRẮC NGHIỆM & ĐÁP ÁN */}
          {activeTab === "questions" && (
            <div className="space-y-4">
              {/* Question selector pill bar */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {questions.map((q, idx) => {
                    const isSelected = idx === selectedQuestionIndex;
                    const hasData = q.question.trim().length > 0;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedQuestionIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <span>Câu {idx + 1}</span>
                        {q.questionNum && (
                          <span className={`text-[10px] px-1 rounded ${isSelected ? "bg-blue-700 text-blue-100" : "bg-slate-100 text-slate-500"}`}>
                            #{q.questionNum}
                          </span>
                        )}
                        {hasData && (
                          <Check className={`w-3 h-3 ${isSelected ? "text-white" : "text-emerald-600"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleRenumberQuestions}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Tự động đánh số lại câu hỏi theo chuẩn Part hiện tại"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-blue-600" />
                    <span>Đánh số ({cardFormCategory === "part5" ? "#101+" : cardFormCategory === "part6" ? "#131+" : "#147+"})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm câu</span>
                  </button>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(selectedQuestionIndex)}
                      className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Xóa câu hỏi hiện tại"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Active Question Fields */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">
                    Nội dung câu hỏi {selectedQuestionIndex + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-500 font-medium">Mã số câu:</label>
                    <input
                      type="text"
                      placeholder="101"
                      value={activeQuestion.questionNum || ""}
                      onChange={(e) =>
                        handleUpdateCurrentQuestion((q) => ({ ...q, questionNum: e.target.value }))
                      }
                      className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-center bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Câu hỏi tiếng Anh *
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: According to the email, what discount will customers receive?"
                    value={activeQuestion.question}
                    onChange={(e) =>
                      handleUpdateCurrentQuestion((q) => ({ ...q, question: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:border-blue-500 focus:outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dịch câu hỏi tiếng Việt (Bilingual)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Theo email, khách hàng sẽ nhận được mức giảm giá nào?"
                    value={activeQuestion.bilingual || ""}
                    onChange={(e) =>
                      handleUpdateCurrentQuestion((q) => ({ ...q, bilingual: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-hidden bg-white"
                  />
                </div>

                {/* 4 Options A, B, C, D */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      4 Phương án trả lời (A, B, C, D) &amp; Chọn đáp án đúng:
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold">
                      Bấm vào nút tròn để chọn đáp án đúng
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {["A", "B", "C", "D"].map((letter, optIdx) => {
                      const isCorrect = (activeQuestion.correctIndex ?? 0) === optIdx;
                      return (
                        <div
                          key={letter}
                          className={`p-2 rounded-xl border transition flex items-center gap-2.5 ${
                            isCorrect
                              ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200"
                              : "bg-slate-50/50 border-slate-200"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCurrentQuestion((q) => ({ ...q, correctIndex: optIdx }))
                            }
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition cursor-pointer shrink-0 ${
                              isCorrect
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white border-2 border-slate-300 text-slate-600 hover:border-emerald-500"
                            }`}
                          >
                            {letter}
                          </button>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder={`Nội dung (${letter}) tiếng Anh...`}
                              value={activeQuestion.options?.[optIdx] || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateCurrentQuestion((q) => {
                                  const opts = [...(q.options || ["", "", "", ""])];
                                  opts[optIdx] = val;
                                  return { ...q, options: opts };
                                });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white focus:outline-hidden focus:border-blue-500"
                            />

                            <input
                              type="text"
                              placeholder={`Nghĩa tiếng Việt (${letter})...`}
                              value={activeQuestion.optionMeanings?.[optIdx] || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateCurrentQuestion((q) => {
                                  const meanings = [...(q.optionMeanings || ["", "", "", ""])];
                                  meanings[optIdx] = val;
                                  return { ...q, optionMeanings: meanings };
                                });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 bg-white focus:outline-hidden focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation & Steps */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Giải thích chi tiết (Tại sao đáp án này đúng)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ví dụ: Đoạn 2 nêu rõ '...reduced to just 24 hours', đồng nghĩa với việc rút ngắn thời gian giao hàng."
                      value={activeQuestion.explanation || ""}
                      onChange={(e) =>
                        handleUpdateCurrentQuestion((q) => ({ ...q, explanation: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden bg-white resize-none"
                    />
                  </div>

                  {/* Steps */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Các bước làm bài (Steps to solve)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddStep}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm bước</span>
                      </button>
                    </div>

                    {(activeQuestion.steps || []).map((step, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Bước 1: Quét từ khóa"
                          value={step.title}
                          onChange={(e) => handleUpdateStep(sIdx, "title", e.target.value)}
                          className="w-1/3 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-slate-50"
                        />
                        <input
                          type="text"
                          placeholder="Mô tả hành động giải..."
                          value={step.desc}
                          onChange={(e) => handleUpdateStep(sIdx, "desc", e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteStep(sIdx)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TỪ VỰNG CẦN HỌC (THIẾT KẾ Y CHANG KHUNG TỪ VỰNG TRONG ẢNH USER GỬI) */}
          {activeTab === "vocab" && (
            <div className="space-y-5">
              {/* FORM THÊM TỪ VỰNG MỚI (EXACT LAYOUT FROM USER'S SCREENSHOT) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      TỪ VỰNG
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-slate-900">
                      Thêm từ vựng mới vào bài đọc
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-600">Gắn vào câu:</label>
                    <select
                      value={vocabTargetQuestionIdx}
                      onChange={(e) => setVocabTargetQuestionIdx(Number(e.target.value))}
                      className="rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-blue-800 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                    >
                      {questions.map((q, qIdx) => (
                        <option key={qIdx} value={qIdx}>
                          Câu {qIdx + 1} {q.questionNum ? `(#${q.questionNum})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {vocabFormError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-2.5 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{vocabFormError}</span>
                  </div>
                )}

                {/* 1. TỪ TIẾNG ANH * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Từ tiếng Anh *
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: allocate"
                    value={vocabInputWord}
                    onChange={(e) => {
                      setVocabInputWord(e.target.value);
                      if (vocabFormError) setVocabFormError(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium transition-all focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Gợi ý từ điển là dữ liệu tham khảo riêng; chỉ nội dung bạn áp dụng hoặc thêm thành nghĩa riêng mới được lưu.
                  </p>
                </div>

                {/* 2 COLUMNS: PHIÊN ÂM IPA vs TỪ LOẠI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: Phiên âm IPA + nút nghe UK / US */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phiên âm IPA
                    </label>
                    <input
                      type="text"
                      placeholder="/ˈæləkeɪt/"
                      value={vocabInputIpa}
                      onChange={(e) => setVocabInputIpa(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono font-medium focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 bg-white"
                    />
                    <div className="mt-1.5 flex items-center gap-4 text-xs font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <span>UK</span>
                        <button
                          type="button"
                          onClick={() => playRegionalPronunciation("UK")}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                          title="Nghe phát âm UK"
                        >
                          <Volume2 className={`h-3.5 w-3.5 ${playingRegion === "UK" ? "text-blue-600 animate-pulse" : ""}`} />
                        </button>
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <span>US</span>
                        <button
                          type="button"
                          onClick={() => playRegionalPronunciation("US")}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                          title="Nghe phát âm US"
                        >
                          <Volume2 className={`h-3.5 w-3.5 ${playingRegion === "US" ? "text-blue-600 animate-pulse" : ""}`} />
                        </button>
                      </span>
                    </div>
                  </div>

                  {/* Right: Từ loại & Nhóm nhỏ */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-0.5">
                      Từ loại
                    </label>
                    <p className="mb-1 text-[10px] text-slate-400">Chọn độc lập với từ loại trong gợi ý.</p>
                    <select
                      value={vocabInputPos}
                      onChange={(e) => setVocabInputPos(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                    >
                      <option value="Verb">Verb — Động từ (V)</option>
                      <option value="Noun">Noun — Danh từ (N)</option>
                      <option value="Adjective">Adjective — Tính từ (Adj)</option>
                      <option value="Adverb">Adverb — Trạng từ (Adv)</option>
                      <option value="Preposition">Preposition — Giới từ (Prep)</option>
                      <option value="Conjunction">Conjunction — Liên từ (Conj)</option>
                    </select>

                    <label className="mt-2 block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Nhóm nhỏ (tùy chọn)
                    </label>
                    <select
                      value={vocabInputSubCategory}
                      onChange={(e) => setVocabInputSubCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-600 focus:border-blue-500 focus:outline-hidden"
                    >
                      <option value="">Không chọn nhóm nhỏ</option>
                      <option value="business">Kinh doanh &amp; Tài chính</option>
                      <option value="office">Văn phòng &amp; Nhân sự</option>
                      <option value="logistics">Vận tải &amp; Hậu cần</option>
                      <option value="marketing">Tiếp thị &amp; Bán hàng</option>
                    </select>
                  </div>
                </div>

                {/* 2 COLUMNS: NGHĨA TIẾNG VIỆT * vs VÍ DỤ NGỮ CẢNH TOEIC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nghĩa tiếng Việt *
                    </label>
                    <input
                      type="text"
                      placeholder="Phân bổ, chỉ định ngân sách hoặc nguồn lực"
                      value={vocabInputMeaning}
                      onChange={(e) => setVocabInputMeaning(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:border-blue-500 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ví dụ ngữ cảnh TOEIC
                    </label>
                    <input
                      type="text"
                      placeholder="The committee allocated funds for the new research laboratory."
                      value={vocabInputExample}
                      onChange={(e) => setVocabInputExample(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:border-blue-500 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>

                {/* 2 COLUMNS: TỪ ĐỒNG NGHĨA vs TỪ TRÁI NGHĨA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Từ đồng nghĩa (tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: area, district, assign"
                      value={vocabInputSynonyms}
                      onChange={(e) => setVocabInputSynonyms(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-blue-500 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Từ trái nghĩa (tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: withhold, keep"
                      value={vocabInputAntonyms}
                      onChange={(e) => setVocabInputAntonyms(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-blue-500 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>

                {/* NÚT THÊM NGHĨA / THÊM TỪ */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400">
                    Mỗi từ vựng lưu riêng từ loại, phiên âm, ví dụ ngữ cảnh, từ đồng nghĩa và trái nghĩa.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddVocabFromForm}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm vào danh sách từ vựng</span>
                  </button>
                </div>
              </div>

              {/* DANH SÁCH TỪ VỰNG ĐÃ THÊM (CÓ BỘ LỌC TẤT CẢ / THEO CÂU) */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {vocabFilterScope === "all"
                        ? `Danh sách từ vựng toàn bài đọc (${totalVocabCount} từ):`
                        : `Danh sách từ vựng của Câu ${(typeof vocabFilterScope === "number" ? vocabFilterScope : 0) + 1} (${
                            questions[typeof vocabFilterScope === "number" ? vocabFilterScope : 0]?.vocabList?.length || 0
                          } từ):`}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Tổng cộng toàn bài đọc: {totalVocabCount} từ vựng trọng tâm
                    </span>
                  </div>

                  {/* SCOPE FILTER PILLS */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    <button
                      type="button"
                      onClick={() => setVocabFilterScope("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        vocabFilterScope === "all"
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>Tất cả bài đọc</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        vocabFilterScope === "all" ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-700"
                      }`}>
                        {totalVocabCount}
                      </span>
                    </button>

                    {questions.map((q, qIdx) => {
                      const count = q.vocabList?.length || 0;
                      const isSelected = vocabFilterScope === qIdx;
                      return (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => setVocabFilterScope(qIdx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <span>Câu {qIdx + 1}</span>
                          {q.questionNum && <span className="opacity-80 text-[10px]">#{q.questionNum}</span>}
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            isSelected ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {displayedVocabList.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    Chưa có từ vựng nào trong mục này. Hãy nhập thông tin ở biểu mẫu phía trên và bấm <strong>&quot;Thêm vào danh sách từ vựng&quot;</strong> hoặc dùng công cụ <strong>&quot;⚡ Dán nhanh tự động&quot;</strong>.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {displayedVocabList.map(({ item: v, qIdx, qNum, itemIdx }) => (
                      <div
                        key={`${qIdx}-${itemIdx}`}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-200 transition flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">{v.word}</span>
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] uppercase border border-blue-200">
                              {v.pos}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] border border-slate-200">
                              Câu {qIdx + 1} (#{qNum})
                            </span>
                            {v.ipa && (
                              <span className="font-mono text-slate-500 text-[11px]">
                                {v.ipa}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setVocabInputWord(v.word);
                                playRegionalPronunciation("US");
                              }}
                              className="text-slate-400 hover:text-blue-600 transition cursor-pointer"
                              title="Nghe phát âm US"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-slate-700 font-semibold">
                            {v.meaning}
                          </p>

                          {v.example && (
                            <p className="text-[11px] text-slate-500 italic">
                              &quot;{v.example.en}&quot;
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteVocabGlobal(qIdx, itemIdx)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition cursor-pointer shrink-0"
                          title="Xóa từ này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DÁN NHANH TOÀN BỘ ĐỀ THI & BÓC TÁCH TỰ ĐỘNG */}
          {activeTab === "quick_paste" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Công cụ Dán nhanh &amp; Tự động bóc tách (Quick Paste &amp; Auto-Parse)</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Bạn có thể copy toàn bộ đề thi (gồm đoạn văn, câu hỏi 1, 2, 3..., các đáp án A/B/C/D, đáp án đúng, dịch, giải thích và từ vựng) dán vào ô bên dưới. Hệ thống sẽ <strong>tự động nhận diện và điền vào các trường</strong> tương ứng mà bạn không cần phải gõ từng ô một!
                </p>
              </div>

              {parseSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{parseSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-800 font-bold text-xs mb-1.5">
                  Dán nội dung bài đọc &amp; câu hỏi thô vào đây:
                </label>
                <textarea
                  rows={10}
                  placeholder={`[Đoạn văn]\nSILVERLINE LOGISTICS\nClient Update - Policy Changes...\n\n[Dịch đoạn văn]\nHÃNG VẬN TẢI SILVERLINE\nThông báo cập nhật khách hàng...\n\n147. What is indicated about the package delivery?\n(A) It requires an extra fee (Yêu cầu trả thêm phụ phí)\n(B) It will be completed within 24 hours (Sẽ hoàn tất trong vòng 24 giờ)\n(C) It is available only on weekends (Chỉ có vào cuối tuần)\n(D) It must be booked two weeks in advance (Phải đặt trước hai tuần)\nĐáp án: B\nDịch: Điều gì được chỉ ra về việc giao kiện hàng?\nGiải thích: Trong bài có nêu rõ 'reduced to just 24 hours'.\nTừ vựng:\n- logistics (/ləˈdʒɪstɪks/) (n): hậu cần\n- destination (/ˌdestɪˈneɪʃn/) (n): điểm đến`}
                  value={rawPasteText}
                  onChange={(e) => setRawPasteText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono leading-relaxed focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100 bg-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Hỗ trợ định dạng chuẩn ETS TOEIC
                </span>
                <button
                  type="button"
                  onClick={() => handleParseRawText()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>⚡ Phân tích &amp; Điền tự động vào form</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER (Matching VocabularyModals layout: Helper text on left, Hủy & Submit on right) */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-6 py-3.5 bg-slate-50/50">
          <p className="text-[11px] text-slate-400 truncate max-w-sm">
            {totalVocabCount > 0
              ? `Đã liên kết ${totalVocabCount} từ vựng và ${questions.length} câu hỏi vào bài đọc.`
              : "Chưa có từ vựng riêng. Khi các dạng liên quan được thêm vào, hệ thống sẽ tự phát hiện và liên kết."}
          </p>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{editingCard ? "Lưu thay đổi" : "Thêm vào danh sách"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
