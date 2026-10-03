"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  Bookmark,
  FileText,
  RotateCcw,
  Trash2,
  Check,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  ArrowLeft,
  Volume2,
  Languages,
  HelpCircle,
  Flag,
  ShoppingBag,
  Search,
  Grid,
  Star,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Zap,
  Bell,
  BellOff,
} from "lucide-react";

export interface SampleQuestion {
  questionNum?: string;
  question: string;
  bilingual?: string;
  options: string[];
  optionMeanings?: string[];
  correctIndex: number;
  explanation: string;
  steps?: { title: string; desc: string }[];
  vocabList?: { word: string; pos: string; level: string; ipa: string; meaning: string }[];
}

export interface ExerciseCardData {
  id: string;
  title: string;
  category: "grammar" | "part5" | "part6" | "part7";
  subCategory?: "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types";
  subtitle?: string;
  tag?: string;
  totalQuestions: number;
  studiedQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  bookmarked?: boolean;
  passageText?: string;
  theory?: {
    summary: string;
    rules: string[];
    example: string;
  };
  sampleQuestions: SampleQuestion[];
}

const INITIAL_CARDS: ExerciseCardData[] = [
  // --- PART 5: LEVEL 1 ---
  {
    id: "p5-level-1",
    title: "Lv.1 Dưới 200",
    category: "part5",
    subCategory: "levels",
    tag: "Part 5 · Nhập môn",
    totalQuestions: 281,
    studiedQuestions: 63,
    correctAnswers: 63,
    wrongAnswers: 3,
    theory: {
      summary: "Phần 5 mức cơ bản: Từ vựng đơn giản, từ loại rõ ràng (Danh/Tính/Động/Trạng) và thì quá khứ/hiện tại cơ bản.",
      rules: [
        "Xác định thành phần câu S - V - O",
        "Nhìn nhanh từ đứng trước và sau chỗ trống để xác định loại từ cần điền",
      ],
      example: "Production of the garments will begin two weeks after the contract is signed.",
    },
    sampleQuestions: [
      {
        questionNum: "113",
        question: "Mr. Olivero praised the film in his review, even though he ------- disliked its aesthetic style.",
        bilingual: "Ông Olivero đã khen ngợi bộ phim trong bài đánh giá của mình, mặc dù đích thân ông không thích phong cách thẩm mỹ của nó.",
        options: ["personal", "personally", "personals", "person"],
        optionMeanings: [
          "(adj): cá nhân",
          "(adv): đích thân / về mặt cá nhân",
          "(n-plural): tin nhắn cá nhân",
          "(n): người"
        ],
        correctIndex: 1,
        explanation: "Trạng từ 'personally' bổ nghĩa cho động từ 'disliked'.",
        steps: [
          {
            title: "Bước 1: Xác định vị trí từ loại trong câu",
            desc: "Chủ ngữ 'he' + [Trạng từ] + Động từ 'disliked'."
          },
          {
            title: "Bước 2: Phân tích chọn đuôi từ loại",
            desc: "Bổ nghĩa cho động từ thường 'disliked' cần một trạng từ chỉ cách thức tận cùng bằng -ly ('personally')."
          },
          {
            title: "Bước 3: Chọn đáp án",
            desc: "Chọn (B) personally (đích thân / về phần cá nhân)."
          }
        ],
        vocabList: [
          { word: "praise", pos: "v", level: "B2", ipa: "/preɪz/", meaning: "khen ngợi" },
          { word: "personally", pos: "adv", level: "B1", ipa: "/ˈpɜːrsənəli/", meaning: "đích thân, về phần cá nhân" },
          { word: "dislike", pos: "v", level: "A2", ipa: "/dɪsˈlaɪk/", meaning: "không thích" },
          { word: "aesthetic", pos: "adj", level: "C1", ipa: "/esˈθetɪk/", meaning: "thẩm mỹ" }
        ]
      },
      {
        questionNum: "105",
        question: "------- of the garments will begin two weeks after the contract is signed.",
        bilingual: "Việc sản xuất hàng may mặc sẽ bắt đầu hai tuần sau khi hợp đồng được ký kết.",
        options: ["Product", "Produce", "Produced", "Production"],
        optionMeanings: [
          "(n): sản phẩm",
          "(v/n): sản xuất/nông sản",
          "(v-ed): đã sản xuất",
          "(n): sự sản xuất"
        ],
        correctIndex: 3,
        explanation: "Chọn danh từ 'Production' (việc sản xuất) làm chủ ngữ cho câu.",
        steps: [
          {
            title: "Bước 1: Xác định dạng câu hỏi",
            desc: "Bốn đáp án cùng gốc \"produc-\" nhưng khác hậu tố nên đây là câu từ loại, cần xét vị trí rồi xét nghĩa."
          },
          {
            title: "Bước 2: Phân tích câu để biết chỗ trống cần gì",
            desc: "Xét vị trí: chỗ trống đứng đầu câu, trước cụm giới từ \"of the garments\" và động từ \"will begin\", nên cần danh từ làm chủ ngữ; loại \"Produced\" (C) vì là V2 / V3."
          },
          {
            title: "Bước 3: Chọn đáp án",
            desc: "Xét nghĩa: thứ \"will begin two weeks after the contract is signed\" là một hoạt động; loại \"Product\" (A) vì chỉ sản phẩm và \"Produce\" (B) vì là động từ, chọn danh từ \"Production\" (D) (việc sản xuất)."
          }
        ],
        vocabList: [
          { word: "production", pos: "n", level: "B2", ipa: "/prəˈdʌkʃn/", meaning: "sự sản xuất" },
          { word: "begin", pos: "v", level: "B1", ipa: "/bɪˈɡɪn/", meaning: "bắt đầu" },
          { word: "contract", pos: "n", level: "B1", ipa: "/ˈkɑːntrækt/", meaning: "hợp đồng" },
          { word: "sign", pos: "v", level: "B1", ipa: "/saɪn/", meaning: "ký kết" }
        ]
      },
      {
        questionNum: "106",
        question: "Ms. Tanaka requested a detailed ------- of the quarterly expenses.",
        bilingual: "Bà Tanaka đã yêu cầu một bản tóm tắt chi tiết về các chi phí hàng quý.",
        options: ["summary", "summarize", "summarized", "summarily"],
        optionMeanings: [
          "(n): bản tóm tắt",
          "(v): tóm tắt",
          "(v-ed): đã tóm tắt",
          "(adv): một cách tóm tắt"
        ],
        correctIndex: 0,
        explanation: "Sau mạo từ 'a' và tính từ 'detailed' cần một Danh từ ('summary').",
        steps: [
          {
            title: "Bước 1: Xác định vị trí từ loại",
            desc: "Sau mạo từ 'a' + tính từ 'detailed' bắt buộc là Danh từ đếm được số ít."
          },
          {
            title: "Bước 2: Phân tích từ loại đáp án",
            desc: "Summary (n: bản tóm tắt), Summarize (v), Summarized (v-ed/adj), Summarily (adv)."
          },
          {
            title: "Bước 3: Chọn đáp án",
            desc: "Chọn (A) summary làm danh từ cho cụm 'a detailed summary'."
          }
        ],
        vocabList: [
          { word: "request", pos: "v", level: "B1", ipa: "/rɪˈkwest/", meaning: "yêu cầu" },
          { word: "summary", pos: "n", level: "B2", ipa: "/ˈsʌməri/", meaning: "bản tóm tắt" },
          { word: "quarterly", pos: "adj", level: "B2", ipa: "/ˈkwɔːrtərli/", meaning: "hàng quý" },
          { word: "expense", pos: "n", level: "B1", ipa: "/ɪkˈspens/", meaning: "chi phí" }
        ]
      }
    ]
  },

  // --- NGỮ PHÁP: TỪ LOẠI ---
  {
    id: "g-tu-loai-danh-tu",
    title: "Danh từ",
    category: "grammar",
    subCategory: "word_types",
    totalQuestions: 287,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Danh từ (Noun) thường đứng sau mạo từ (a/an/the), tính từ, tính từ sở hữu, hoặc làm chủ ngữ/tân ngữ.",
      rules: [
        "Đuôi danh từ phổ biến: -tion, -sion, -ment, -ance, -ence, -ty, -ness, -er, -or.",
        "Cấu trúc thường gặp: Adj + Noun; a/an/the + Noun; Preposition + Noun.",
      ],
      example: "The marketing director submitted an impressive proposal to the board.",
    },
    sampleQuestions: [
      {
        questionNum: "101",
        question: "Ms. Tanaka requested a detailed ______ of the quarterly expenses.",
        bilingual: "Bà Tanaka đã yêu cầu một bản tóm tắt chi tiết về chi phí hàng quý.",
        options: ["summary", "summarize", "summarized", "summarily"],
        optionMeanings: ["(n): bản tóm tắt", "(v): tóm tắt", "(v-ed): đã tóm tắt", "(adv): tóm tắt"],
        correctIndex: 0,
        explanation: "Sau mạo từ 'a' và tính từ 'detailed' cần một Danh từ ('summary').",
        steps: [
          { title: "Bước 1: Xác định cấu trúc", desc: "Mạo từ 'a' + Tính từ 'detailed' + [Danh từ]." },
          { title: "Bước 2: Chọn từ phù hợp", desc: "Summary là danh từ chỉ bản tóm tắt." }
        ],
        vocabList: [
          { word: "summary", pos: "n", level: "B2", ipa: "/ˈsʌməri/", meaning: "bản tóm tắt" },
          { word: "detailed", pos: "adj", level: "B1", ipa: "/ˈdiːteɪld/", meaning: "chi tiết" }
        ]
      }
    ]
  },
  {
    id: "g-tu-loai-tinh-tu",
    title: "Tính từ",
    category: "grammar",
    subCategory: "word_types",
    totalQuestions: 130,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Tính từ (Adjective) bổ nghĩa cho danh từ, đứng trước danh từ hoặc sau động từ to be/linking verbs (remain, seem, appear...).",
      rules: [
        "Đuôi tính từ phổ biến: -ful, -less, -ive, -able, -ible, -al, -ic, -ous.",
        "Vị trí: To be + Adj; Linking verb + Adj; Adj + Noun.",
      ],
      example: "The software update provides reliable performance across all workstations.",
    },
    sampleQuestions: [
      {
        questionNum: "103",
        question: "The technician found that the network server was completely ______.",
        bilingual: "Kỹ thuật viên nhận thấy rằng máy chủ mạng hoàn toàn đáng tin cậy.",
        options: ["reliability", "rely", "reliable", "reliably"],
        optionMeanings: ["(n): sự tin cậy", "(v): dựa vào", "(adj): đáng tin cậy", "(adv): một cách tin cậy"],
        correctIndex: 2,
        explanation: "Sau to be 'was' và trạng từ 'completely' cần một Tính từ ('reliable').",
        steps: [
          { title: "Bước 1: Nhận biết vị trí bổ nghĩa", desc: "To be 'was' + Trạng từ 'completely' + [Tính từ]." },
          { title: "Bước 2: Chọn đáp án", desc: "Reliable là tính từ mang nghĩa đáng tin cậy." }
        ],
        vocabList: [
          { word: "technician", pos: "n", level: "B2", ipa: "/tekˈnɪʃn/", meaning: "kỹ thuật viên" },
          { word: "reliable", pos: "adj", level: "B2", ipa: "/rɪˈlaɪəbl/", meaning: "đáng tin cậy" }
        ]
      }
    ]
  },
  {
    id: "g-tu-loai-trang-tu",
    title: "Trạng từ",
    category: "grammar",
    subCategory: "word_types",
    totalQuestions: 137,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Trạng từ (Adverb) bổ nghĩa cho động từ, tính từ hoặc trạng từ khác. Thường kết thúc bằng đuôi -ly.",
      rules: [
        "V-O-Adv hoặc Adv-V: Bổ nghĩa cho hành động.",
        "Trạng từ đứng trước tính từ: extremely successful, highly recommended.",
      ],
      example: "Please inspect the machinery thoroughly before operating it.",
    },
    sampleQuestions: [
      {
        questionNum: "104",
        question: "The financial auditor reviewed the fiscal accounts ______.",
        bilingual: "Kiểm toán viên tài chính đã xem xét các tài khoản tài chính một cách cẩn thận.",
        options: ["careful", "carefully", "care", "caring"],
        optionMeanings: ["(adj): cẩn thận", "(adv): một cách cẩn thận", "(v/n): chăm sóc", "(adj): quan tâm"],
        correctIndex: 1,
        explanation: "Bổ nghĩa cho động từ 'reviewed' cần một trạng từ chỉ cách thức ('carefully').",
        steps: [
          { title: "Bước 1: Xác định động từ bổ nghĩa", desc: "Động từ 'reviewed' cần trạng từ đi sau để làm rõ cách thức." },
          { title: "Bước 2: Chọn đáp án", desc: "Carefully (adv) là lựa chọn chính xác." }
        ],
        vocabList: [
          { word: "auditor", pos: "n", level: "C1", ipa: "/ˈɔːdɪtər/", meaning: "kiểm toán viên" },
          { word: "carefully", pos: "adv", level: "A2", ipa: "/ˈkerfəli/", meaning: "một cách cẩn thận" }
        ]
      }
    ]
  },
  {
    id: "p5-level-2",
    title: "Lv.2 200–300",
    category: "part5",
    subCategory: "levels",
    totalQuestions: 227,
    studiedQuestions: 117,
    correctAnswers: 99,
    wrongAnswers: 18,
    sampleQuestions: [
      {
        questionNum: "107",
        question: "The latest annual report was ______ distributed to all shareholders.",
        bilingual: "Báo cáo thường niên mới nhất đã được phân phát rộng rãi tới tất cả các cổ đông.",
        options: ["wide", "widely", "widen", "width"],
        optionMeanings: ["(adj): rộng", "(adv): rộng rãi", "(v): mở rộng", "(n): chiều rộng"],
        correctIndex: 1,
        explanation: "Trạng từ 'widely' đứng giữa trợ động từ 'was' và phân từ hai 'distributed'.",
        steps: [
          { title: "Bước 1: Vị trí bổ nghĩa", desc: "Dạng bị động Was + [Trạng từ] + V3/ed." },
          { title: "Bước 2: Chọn đáp án", desc: "Widely (adv) bổ nghĩa cho hành động distributed." }
        ],
        vocabList: [
          { word: "shareholder", pos: "n", level: "C1", ipa: "/ˈʃerhəʊldər/", meaning: "cổ đông" },
          { word: "widely", pos: "adv", level: "B2", ipa: "/ˈwaɪdli/", meaning: "rộng rãi" }
        ]
      }
    ]
  },
  {
    id: "p6-level-1",
    title: "Part 6 — Điền đoạn văn",
    category: "part6",
    subCategory: "levels",
    totalQuestions: 120,
    studiedQuestions: 18,
    correctAnswers: 16,
    wrongAnswers: 2,
    passageText: "Dear Valued Customer,\nThank you for choosing Zenith Express for your shipping needs. We are writing to confirm that your package #8921 has been processed and is currently in transit. Please review the shipment summary below to verify your delivery address.",
    sampleQuestions: [
      {
        questionNum: "131",
        question: "We appreciate your business and look forward to ______ you again in the near future.",
        bilingual: "Chúng tôi trân trọng sự ủng hộ của quý khách và rất mong được phục vụ quý khách trong tương lai gần.",
        options: ["serving", "served", "serve", "server"],
        optionMeanings: ["(v-ing): việc phục vụ", "(v-ed): đã phục vụ", "(v): phục vụ", "(n): người phục vụ"],
        correctIndex: 0,
        explanation: "Cấu trúc quen thuộc 'look forward to + V-ing' -> 'serving'.",
        steps: [
          { title: "Bước 1: Nhận diện cấu trúc", desc: "Look forward to + V-ing (mong chờ làm gì)." },
          { title: "Bước 2: Chọn đáp án", desc: "Serving (v-ing) là đáp án chuẩn xác." }
        ],
        vocabList: [
          { word: "appreciate", pos: "v", level: "B2", ipa: "/əˈpriːʃieɪt/", meaning: "trân trọng" },
          { word: "transit", pos: "n", level: "C1", ipa: "/ˈtrænzɪt/", meaning: "đang vận chuyển" }
        ]
      }
    ]
  },
  {
    id: "p7-level-1",
    title: "Part 7 — Đọc hiểu đoạn văn",
    category: "part7",
    subCategory: "levels",
    totalQuestions: 150,
    studiedQuestions: 12,
    correctAnswers: 11,
    wrongAnswers: 1,
    passageText: "MEMORANDUM\nTo: All Office Staff\nFrom: Facilities Management\nDate: October 5\nSubject: Elevator Maintenance Schedule\n\nPlease be advised that the main elevators in Building B will be undergoing mandatory safety inspections and maintenance this Saturday between 8:00 AM and 2:00 PM. During this timeframe, please use the service stairs or the secondary elevator located in the east wing.",
    sampleQuestions: [
      {
        questionNum: "147",
        question: "According to the notice, why will the main elevators be out of service on Saturday?",
        bilingual: "Theo thông báo, tại sao các thang máy chính sẽ ngừng hoạt động vào thứ Bảy?",
        options: [
          "For routine maintenance and safety inspection",
          "Because of a sudden power outage",
          "To install new digital screens",
          "For staff training exercises"
        ],
        optionMeanings: [
          "Do bảo trì định kỳ và kiểm tra an toàn",
          "Do sự cố mất điện đột ngột",
          "Để lắp đặt màn hình kỹ thuật số mới",
          "Phục vụ cho các bài tập huấn luyện nhân viên"
        ],
        correctIndex: 0,
        explanation: "Bài đọc nêu rõ 'undergoing mandatory safety inspections and maintenance' (kiểm tra an toàn và bảo trì bắt buộc).",
        steps: [
          { title: "Bước 1: Skim từ khóa", desc: "Tìm từ khóa 'elevators', 'Saturday', 'out of service' trong đoạn văn." },
          { title: "Bước 2: Đối chiếu thông tin", desc: "Thông tin trong bài: 'undergoing mandatory safety inspections and maintenance'." },
          { title: "Bước 3: Chọn đáp án", desc: "Chọn đáp án (A) vì khớp nghĩa hoàn toàn." }
        ],
        vocabList: [
          { word: "undergo", pos: "v", level: "C1", ipa: "/ˌʌndərˈɡəʊ/", meaning: "trải qua" },
          { word: "maintenance", pos: "n", level: "B2", ipa: "/ˈmeɪntənəns/", meaning: "bảo trì" },
          { word: "mandatory", pos: "adj", level: "C1", ipa: "/ˈmændətɔːri/", meaning: "bắt buộc" }
        ]
      }
    ]
  }
];

export default function ReadingLearningPage() {
  const [cards, setCards] = useState<ExerciseCardData[]>(INITIAL_CARDS);
  const [activeMainTab, setActiveMainTab] = useState<"grammar" | "part5" | "part6" | "part7">("grammar");
  const [activeSubFilter, setActiveSubFilter] = useState<"all" | "word_types" | "verbs" | "other_grammar">("all");

  // Full Screen Interactive Practice Workspace State
  const [activePracticeCard, setActivePracticeCard] = useState<ExerciseCardData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [sessionWrongCount, setSessionWrongCount] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [energyScore, setEnergyScore] = useState(0);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  // Workspace Controls Toggles
  const [isBilingual, setIsBilingual] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  const [showExplanation, setShowExplanation] = useState(true);
  const [showVocab, setShowVocab] = useState(true);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({});

  // Modals inside Practice Workspace
  const [showAnnotatorModal, setShowAnnotatorModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState("");
  const [showWordBasketModal, setShowWordBasketModal] = useState(false);
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [dictQuery, setDictQuery] = useState("");
  const [dictResult, setDictResult] = useState<{ word: string; meaning: string; ipa: string } | null>(null);
  const [showQuestionGridModal, setShowQuestionGridModal] = useState(false);

  // Theory Modal State
  const [theoryCard, setTheoryCard] = useState<ExerciseCardData | null>(null);

  // Wrong Answers Review Modal
  const [reviewWrongCard, setReviewWrongCard] = useState<ExerciseCardData | null>(null);

  // Reset Confirm Modal
  const [resetCardConfirm, setResetCardConfirm] = useState<ExerciseCardData | null>(null);

  // Card Create / Edit Modal State
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<ExerciseCardData | null>(null);
  const [cardFormTitle, setCardFormTitle] = useState("");
  const [cardFormCategory, setCardFormCategory] = useState<"grammar" | "part5" | "part6" | "part7">("grammar");
  const [cardFormSubCategory, setCardFormSubCategory] = useState<"word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types">("word_types");
  const [cardFormTag, setCardFormTag] = useState("");
  const [cardFormTotalQuestions, setCardFormTotalQuestions] = useState(50);
  const [cardFormTheorySummary, setCardFormTheorySummary] = useState("");
  const [cardFormTheoryRules, setCardFormTheoryRules] = useState("");
  const [cardFormTheoryExample, setCardFormTheoryExample] = useState("");
  const [deleteCardConfirm, setDeleteCardConfirm] = useState<ExerciseCardData | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Web Audio Sound Effects Synthesizer (Zero external dependency)
  const playSfx = (type: "correct" | "wrong" | "click") => {
    if (!isSfxEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "correct") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "wrong") {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {
      // AudioContext fallback
    }
  };

  // Text-To-Speech Pronunciation Audio
  const speakWord = (word: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Timer effect for Practice Session
  useEffect(() => {
    if (!activePracticeCard) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activePracticeCard]);

  // Card Management Handlers
  const handleOpenCreateCard = () => {
    setEditingCard(null);
    setCardFormTitle("");
    setCardFormCategory(activeMainTab);
    setCardFormSubCategory(
      activeMainTab === "grammar"
        ? (activeSubFilter === "all" ? "word_types" : activeSubFilter)
        : activeMainTab === "part5"
        ? "levels"
        : "text_types"
    );
    setCardFormTag("");
    setCardFormTotalQuestions(50);
    setCardFormTheorySummary("");
    setCardFormTheoryRules("");
    setCardFormTheoryExample("");
    setShowCreateCardModal(true);
  };

  const handleOpenEditCard = (card: ExerciseCardData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCard(card);
    setCardFormTitle(card.title);
    setCardFormCategory(card.category);
    setCardFormSubCategory(card.subCategory || "word_types");
    setCardFormTag(card.tag || "");
    setCardFormTotalQuestions(card.totalQuestions);
    setCardFormTheorySummary(card.theory?.summary || "");
    setCardFormTheoryRules((card.theory?.rules || []).join("\n"));
    setCardFormTheoryExample(card.theory?.example || "");
    setShowCreateCardModal(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFormTitle.trim()) {
      alert("Vui lòng nhập tên chủ điểm!");
      return;
    }

    const rulesArr = cardFormTheoryRules
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    if (editingCard) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === editingCard.id
            ? {
                ...c,
                title: cardFormTitle.trim(),
                category: cardFormCategory,
                subCategory: cardFormSubCategory,
                tag: cardFormTag.trim() || undefined,
                totalQuestions: cardFormTotalQuestions,
                theory: {
                  summary: cardFormTheorySummary.trim() || c.theory?.summary || "Tóm tắt ngữ pháp và mẹo thi TOEIC Reading.",
                  rules: rulesArr.length > 0 ? rulesArr : (c.theory?.rules || ["Nắm chắc dấu hiệu nhận biết."]),
                  example: cardFormTheoryExample.trim() || c.theory?.example || "Example sentence for TOEIC reading practice.",
                },
              }
            : c
        )
      );
      showToast(`Đã cập nhật chủ điểm "${cardFormTitle}"! 💾`);
    } else {
      const newId = `reading-${cards.length + 1}-${Date.now().toString().slice(-4)}`;
      const newCard: ExerciseCardData = {
        id: newId,
        title: cardFormTitle.trim(),
        category: cardFormCategory,
        subCategory: cardFormSubCategory,
        tag: cardFormTag.trim() || undefined,
        totalQuestions: cardFormTotalQuestions,
        studiedQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        theory: {
          summary: cardFormTheorySummary.trim() || "Tóm tắt ngữ pháp và mẹo thi TOEIC Reading.",
          rules: rulesArr.length > 0 ? rulesArr : ["Nắm chắc dấu hiệu nhận biết."],
          example: cardFormTheoryExample.trim() || "Example sentence for TOEIC reading practice.",
        },
        sampleQuestions: [
          {
            questionNum: "101",
            question: "The director approved the proposal after a ______ review of the budget.",
            bilingual: "Giám đốc đã phê duyệt đề xuất sau khi xem xét kỹ lưỡng ngân sách.",
            options: ["thorough", "thoroughly", "thoroughness", "more thorough"],
            optionMeanings: ["(adj): kỹ lưỡng", "(adv): một cách kỹ lưỡng", "(n): sự kỹ lưỡng", "(adj-er): kỹ lưỡng hơn"],
            correctIndex: 0,
            explanation: "Trước danh từ 'review' cần một tính từ ('thorough').",
            steps: [
              { title: "Bước 1: Phân tích cú pháp", desc: "Mạo từ 'a' + [Tính từ] + Danh từ 'review'." },
              { title: "Bước 2: Chọn từ loại", desc: "Thorough là tính từ chỉ sự kỹ lưỡng, thấu đáo." }
            ],
            vocabList: [
              { word: "thorough", pos: "adj", level: "B2", ipa: "/ˈθɜːrəʊ/", meaning: "kỹ lưỡng, thấu đáo" }
            ]
          },
        ],
      };
      setCards((prev) => [newCard, ...prev]);
      showToast(`Đã thêm chủ điểm "${newCard.title}" thành công! 🎉`);
    }
    setShowCreateCardModal(false);
  };

  const handleConfirmDeleteCard = () => {
    if (!deleteCardConfirm) return;
    setCards((prev) => prev.filter((c) => c.id !== deleteCardConfirm.id));
    showToast(`Đã xóa chủ điểm "${deleteCardConfirm.title}"! 🗑️`);
    setDeleteCardConfirm(null);
  };

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = !c.bookmarked;
          showToast(next ? `Đã lưu chủ điểm "${c.title}" vào mục yêu thích! 📌` : `Đã bỏ lưu chủ điểm "${c.title}"`);
          return { ...c, bookmarked: next };
        }
        return c;
      })
    );
  };

  const handleConfirmReset = () => {
    if (!resetCardConfirm) return;
    setCards((prev) =>
      prev.map((c) =>
        c.id === resetCardConfirm.id
          ? { ...c, studiedQuestions: 0, correctAnswers: 0, wrongAnswers: 0 }
          : c
      )
    );
    showToast(`Đã đặt lại tiến độ học của "${resetCardConfirm.title}" về ban đầu! 🔄`);
    setResetCardConfirm(null);
  };

  // Start Practice Workspace
  const handleStartPractice = (card: ExerciseCardData) => {
    setActivePracticeCard(card);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsChecked(false);
    setSessionCorrectCount(0);
    setSessionWrongCount(0);
    setTimerSeconds(0);
    setEnergyScore(0);
  };

  // Option selection handler - Clicking an option checks the answer and reveals details!
  const handleSelectOption = (idx: number) => {
    if (isChecked) return;
    setSelectedOption(idx);
    setIsChecked(true);

    const q = activePracticeCard?.sampleQuestions[currentQuestionIndex];
    if (!q) return;

    const isRight = idx === q.correctIndex;
    if (isRight) {
      playSfx("correct");
      setSessionCorrectCount((prev) => prev + 1);
      setEnergyScore((prev) => prev + 10);
    } else {
      playSfx("wrong");
      setSessionWrongCount((prev) => prev + 1);
    }

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === activePracticeCard?.id) {
          return {
            ...c,
            studiedQuestions: c.studiedQuestions + 1,
            correctAnswers: isRight ? c.correctAnswers + 1 : c.correctAnswers,
            wrongAnswers: isRight ? c.wrongAnswers : c.wrongAnswers + 1,
          };
        }
        return c;
      })
    );
  };

  const handleNextQuestion = () => {
    if (!activePracticeCard) return;
    playSfx("click");
    if (currentQuestionIndex < activePracticeCard.sampleQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
    } else {
      showToast(`Hoàn thành bài luyện tập! Đúng: ${sessionCorrectCount}/${activePracticeCard.sampleQuestions.length} câu 🎉`);
      setActivePracticeCard(null);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      playSfx("click");
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedOption(null);
      setIsChecked(false);
    }
  };

  // Add word to basket
  const handleAddWordToBasket = (wordObj: { word: string; meaning: string }) => {
    if (savedWords.includes(wordObj.word)) {
      showToast(`Từ "${wordObj.word}" đã có trong Giỏ từ của bạn!`);
      return;
    }
    setSavedWords((prev) => [...prev, wordObj.word]);
    showToast(`Đã thêm từ "${wordObj.word}" vào Giỏ từ 🧺`);
  };

  const handleAddAllWords = (list?: { word: string; meaning: string }[]) => {
    if (!list || list.length === 0) return;
    const newWords = list.map((w) => w.word).filter((w) => !savedWords.includes(w));
    if (newWords.length === 0) {
      showToast("Tất cả từ vựng bài này đã có trong Giỏ từ!");
      return;
    }
    setSavedWords((prev) => [...prev, ...newWords]);
    showToast(`Đã thêm ${newWords.length} từ vào Giỏ từ 🧺`);
  };

  // Dict search handler
  const handleSearchDict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dictQuery.trim()) return;
    const q = dictQuery.trim().toLowerCase();
    setDictResult({
      word: q,
      ipa: `/${q}/`,
      meaning: `Nghĩa tiếng Việt chi tiết cho từ "${q}" trong ngữ cảnh TOEIC Reading.`
    });
  };

  // Card list filtering
  const grammarWordTypes = cards.filter((c) => c.category === "grammar" && c.subCategory === "word_types");
  const grammarVerbs = cards.filter((c) => c.category === "grammar" && c.subCategory === "verbs");
  const grammarOther = cards.filter((c) => c.category === "grammar" && c.subCategory === "other_grammar");

  const currentTabLevels = cards.filter(
    (c) => c.category === activeMainTab && c.subCategory === "levels"
  );
  const currentTabTopics = cards.filter(
    (c) => c.category === activeMainTab && (c.subCategory === "by_topic" || c.subCategory === "text_types")
  );

  const renderCard = (card: ExerciseCardData) => {
    const isUnstudied = card.studiedQuestions === 0;

    return (
      <div
        key={card.id}
        className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-400/80 transition-all duration-200 flex flex-col justify-between min-h-[145px]"
      >
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-blue-500 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity" />

        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors">
              {card.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {card.bookmarked && (
                <span className="text-amber-500 text-xs flex items-center gap-0.5 font-semibold mr-1">
                  ★ Đã lưu
                </span>
              )}
              <button
                type="button"
                onClick={(e) => handleOpenEditCard(card, e)}
                className="w-6 h-6 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                title="Sửa chủ điểm đọc"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteCardConfirm(card);
                }}
                className="w-6 h-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                title="Xóa chủ điểm đọc"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {card.tag && (
            <div className="mt-1">
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md inline-block">
                {card.tag}
              </span>
            </div>
          )}

          <div className="mt-2 text-xs">
            {isUnstudied ? (
              <span className="font-medium text-slate-500">
                Chưa luyện tập · {card.totalQuestions} câu
              </span>
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-emerald-600 text-sm">
                  {card.studiedQuestions} / {card.totalQuestions}
                </span>
                <span className="font-semibold text-emerald-700 flex items-center gap-0.5">
                  ✓ {card.correctAnswers}
                </span>
                <span className="font-semibold text-rose-500 flex items-center gap-0.5">
                  ✕ {card.wrongAnswers}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => handleToggleBookmark(card.id, e)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                card.bookmarked
                  ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              }`}
              title={card.bookmarked ? "Bỏ lưu chủ điểm" : "Lưu chủ điểm này"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${card.bookmarked ? "fill-amber-500" : ""}`} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTheoryCard(card);
              }}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
              title="Xem tóm tắt lý thuyết & mẹo thi"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (card.wrongAnswers > 0) {
                    setReviewWrongCard(card);
                  } else {
                    showToast(`Chủ điểm "${card.title}" chưa có câu sai nào cần ôn lại! 👍`);
                  }
                }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  card.wrongAnswers > 0
                    ? "text-rose-600 hover:bg-rose-50"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
                title="Luyện tập lại các câu sai"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              {card.wrongAnswers > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-2xs pointer-events-none">
                  {card.wrongAnswers}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setResetCardConfirm(card);
              }}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
              title="Đặt lại tiến độ chủ điểm"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleStartPractice(card)}
            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Học ngay
          </button>
        </div>
      </div>
    );
  };

  // =========================================================================
  // VIEW 1: FULL SCREEN READING PRACTICE WORKSPACE (WHEN "HỌC NGAY" CLICKED)
  // =========================================================================
  if (activePracticeCard) {
    const q = activePracticeCard.sampleQuestions[currentQuestionIndex] || activePracticeCard.sampleQuestions[0];
    const totalQ = activePracticeCard.sampleQuestions.length;
    const isQuestionBookmarked = !!bookmarkedQuestions[`${activePracticeCard.id}-${currentQuestionIndex}`];

    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-screen overflow-hidden font-sans text-slate-900 animate-in fade-in duration-150">
        {/* --- TOP HEADER BAR --- */}
        <header className="h-14 bg-[#1e60f0] text-white px-4 sm:px-6 flex items-center justify-between shadow-md shrink-0 select-none">
          {/* Left Exit Button & Title (NO Mascot Cat Image per user directive!) */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setActivePracticeCard(null);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Thoát</span>
            </button>

            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
              {activePracticeCard.title}
            </h1>
          </div>

          {/* Right Action Controls: Song ngữ 👑 -> Ghi chú -> Annotator -> SFX -> Badges */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Song ngữ toggle */}
            <button
              type="button"
              onClick={() => {
                setIsBilingual(!isBilingual);
                playSfx("click");
                showToast(isBilingual ? "Đã tắt hiển thị song ngữ" : "Đã bật dịch song ngữ Tiếng Việt 👑");
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isBilingual
                  ? "bg-amber-400 text-amber-950 ring-2 ring-amber-300"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Song ngữ 👑</span>
            </button>

            {/* Ghi chú */}
            <button
              type="button"
              onClick={() => {
                setShowNotesModal(true);
                playSfx("click");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-800 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Ghi chú</span>
            </button>

            {/* Annotator */}
            <button
              type="button"
              onClick={() => {
                setShowAnnotatorModal(true);
                playSfx("click");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-800 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Annotator</span>
            </button>

            {/* SFX Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsSfxEnabled(!isSfxEnabled);
                showToast(isSfxEnabled ? "Đã tắt âm thanh" : "Đã bật âm thanh hiệu ứng SFX 🔊");
              }}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                isSfxEnabled ? "bg-amber-400 text-amber-950" : "bg-white/20 text-white"
              }`}
              title={isSfxEnabled ? "Tắt âm thanh" : "Bật âm thanh SFX"}
            >
              {isSfxEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>

            {/* Stats Badges */}
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/20 text-white text-xs font-mono font-bold shadow-2xs">
                <Clock className="w-3.5 h-3.5" />
                {formatTimer(timerSeconds)}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/90 text-white text-xs font-extrabold shadow-2xs">
                <Zap className="w-3.5 h-3.5 fill-white" />
                {energyScore}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/90 text-white text-xs font-extrabold shadow-2xs">
                ✓ {sessionCorrectCount}/{totalQ}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-700 text-white text-xs font-bold shadow-2xs font-mono">
                Câu {currentQuestionIndex + 1}/{totalQ}
              </span>
            </div>
          </div>
        </header>

        {/* --- MAIN DUAL PANE PRACTICE AREA --- */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
          {/* LEFT PANE: INSTRUCTION & PASSAGE CONTENT */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-[#fafafa] border-r border-slate-200/80 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Yêu cầu bài tập (Instruction)
              </div>
              <h2 className="text-xl font-bold text-slate-800 leading-snug">
                Select the best answer to complete the sentence.
              </h2>

              {activePracticeCard.passageText && (
                <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Đoạn văn đọc hiểu (Reading Passage):
                  </span>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-serif">
                    {activePracticeCard.passageText}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                💡 Mẹo thi TOEIC Reading:
              </p>
              <p className="leading-relaxed text-slate-600">
                Hãy chú ý tới từ loại đứng trước và sau khoảng trống để xác định loại từ cần điền trước khi xem nghĩa.
              </p>
            </div>
          </div>

          {/* RIGHT PANE: QUESTION & OPTIONS */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Question Outer Card Container (Matches User Image 4 Border Frame) */}
              <div className="p-6 rounded-3xl border-2 border-blue-200/90 bg-white shadow-xs relative space-y-5">
                {/* Tag & Controls Header inside Card */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold tracking-wide shadow-2xs">
                    {activePracticeCard.tag || "Lv.1"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Hỏi bài</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const key = `${activePracticeCard.id}-${currentQuestionIndex}`;
                        const next = !bookmarkedQuestions[key];
                        setBookmarkedQuestions((prev) => ({ ...prev, [key]: next }));
                        showToast(next ? "Đã đánh dấu sao câu hỏi này! 🌟" : "Đã bỏ đánh dấu sao câu hỏi");
                      }}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                        isQuestionBookmarked
                          ? "border-amber-300 bg-amber-50 text-amber-500"
                          : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      }`}
                      title="Đánh dấu câu hỏi"
                    >
                      <Star className={`w-4 h-4 ${isQuestionBookmarked ? "fill-amber-400 text-amber-500" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Main Question Sentence */}
                <div className="space-y-3">
                  <p className="text-base font-bold text-slate-900 leading-relaxed font-sans">
                    {q.questionNum ? `${q.questionNum}. ` : ""}{q.question}
                  </p>

                  {/* Bilingual Translation line (shown when answered OR when isBilingual enabled after check) */}
                  {isChecked && isBilingual && q.bilingual && (
                    <div className="border-l-3 border-blue-500 pl-3 py-1.5 text-sm font-semibold text-blue-800 bg-blue-50 rounded-r-xl animate-in fade-in duration-200">
                      {q.bilingual}
                    </div>
                  )}
                </div>

                {/* 4 OPTION CARDS (A, B, C, D) */}
                <div className="space-y-3 pt-1">
                  {q.options.map((opt, idx) => {
                    const letter = ["A", "B", "C", "D"][idx];
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === q.correctIndex;
                    const meaning = q.optionMeanings?.[idx];

                    // BEFORE ANSWERING (Image 4): Clean Radio Circle List
                    if (!isChecked) {
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectOption(idx)}
                          className="w-full p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-400 hover:bg-blue-50/40 text-slate-800 text-left flex items-center gap-3.5 transition-all duration-150 cursor-pointer shadow-2xs group"
                        >
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-blue-500 flex items-center justify-center shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-blue-500 transition-colors" />
                          </div>
                          <span className="text-sm font-semibold text-slate-800 font-sans">
                            ({letter}) {opt}
                          </span>
                        </button>
                      );
                    }

                    // AFTER ANSWERING (Images 1, 2, 3): Red (Wrong) / Green (Right) Result Cards
                    let cardStyle = "border-slate-200 bg-white text-slate-700 opacity-70";
                    let circleIcon = null;

                    if (isCorrect) {
                      cardStyle = "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                      circleIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;
                    } else if (isSelected) {
                      cardStyle = "border-rose-400 bg-rose-50/90 text-rose-950 font-bold ring-2 ring-rose-400/20";
                      circleIcon = <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
                    }

                    return (
                      <div
                        key={idx}
                        className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all duration-150 ${cardStyle}`}
                      >
                        {circleIcon ? (
                          circleIcon
                        ) : (
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5">
                            ({letter})
                          </span>
                        )}

                        <div className="flex-1">
                          <span className="text-sm font-semibold">({letter}) {opt}</span>
                          {isBilingual && meaning && (
                            <div className="text-xs font-normal text-blue-700/90 mt-0.5 pl-0.5">
                              {meaning}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* REVEALED SECTIONS AFTER ANSWERING (Images 2 & 3) */}
              {isChecked && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {/* Toggle 1: Giải thích chi tiết */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between py-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Giải thích chi tiết</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowExplanation(!showExplanation)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          showExplanation ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            showExplanation ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {showExplanation && (
                      <div className="mt-2 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-800 space-y-2.5 animate-in fade-in duration-150">
                        {q.steps && q.steps.length > 0 ? (
                          q.steps.map((st, i) => (
                            <div key={i} className="space-y-0.5">
                              <p className="font-bold text-blue-900">{st.title}</p>
                              <p className="text-slate-600 leading-relaxed pl-2 border-l-2 border-blue-300">
                                {st.desc}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="leading-relaxed">{q.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Toggle 2: Từ vựng nên học */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between py-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                        <span>Từ vựng nên học</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowVocab(!showVocab)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          showVocab ? "bg-amber-500" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            showVocab ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {showVocab && q.vocabList && q.vocabList.length > 0 && (
                      <div className="mt-2 p-4 rounded-2xl bg-[#fffdf5] border border-amber-200/90 space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-900">{q.vocabList.length} từ vựng mới</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddAllWords(q.vocabList)}
                              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                            >
                              + Thêm tất cả ({q.vocabList.length})
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {q.vocabList.map((vItem, vIdx) => {
                            const isAdded = savedWords.includes(vItem.word);
                            return (
                              <div
                                key={vIdx}
                                className="p-3 rounded-xl bg-white border border-amber-100/80 flex items-center justify-between gap-3 shadow-2xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-sm">{vItem.word}</span>
                                    <span className="text-xs italic text-slate-500">{vItem.pos}</span>
                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold text-[10px]">
                                      {vItem.level}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{vItem.ipa}</span>
                                    <button
                                      type="button"
                                      onClick={() => speakWord(vItem.word)}
                                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                      title="Phát âm từ vựng"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-xs font-semibold text-amber-900">{vItem.meaning}</p>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => showToast(`Đã gắn cờ từ "${vItem.word}" để xem lại!`)}
                                    className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                                    title="Gắn cờ"
                                  >
                                    <Flag className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddWordToBasket(vItem)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      isAdded
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                    }`}
                                  >
                                    {isAdded ? "✓ Đã thêm" : "+ Thêm"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Next Question Action */}
            {isChecked && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-500">
                  Đúng: <strong className="text-emerald-600">{sessionCorrectCount}</strong> | Sai:{" "}
                  <strong className="text-rose-500">{sessionWrongCount}</strong>
                </span>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold transition-all shadow-md cursor-pointer"
                >
                  {currentQuestionIndex < totalQ - 1 ? "Câu tiếp theo" : "Hoàn thành bài tập"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- BOTTOM NAVIGATION BAR --- */}
        <footer className="h-14 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
          {/* Left Buttons: Báo lỗi, Giỏ từ, Tra từ */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5 text-rose-500" />
              <span>Báo lỗi</span>
            </button>

            <button
              type="button"
              onClick={() => setShowWordBasketModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>Giỏ từ ({savedWords.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDictionaryModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Tra từ</span>
            </button>
          </div>

          {/* Right Navigation: Previous, Grid Jump, Next */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={handlePrevQuestion}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Câu trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowQuestionGridModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer"
            >
              <Grid className="w-4 h-4" />
              <span>{currentQuestionIndex + 1}/{totalQ}</span>
            </button>

            <button
              type="button"
              disabled={currentQuestionIndex === totalQ - 1}
              onClick={handleNextQuestion}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Câu tiếp theo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </footer>

        {/* --- MODAL WORKSPACE: ANNOTATOR --- */}
        {showAnnotatorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-blue-600" />
                  Công cụ Annotator
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAnnotatorModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tính năng vẽ & highlight đoạn văn đọc đang được bật! Bạn có thể chọn văn bản trên màn hình để đánh dấu từ quan trọng.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast("Đã bật chế độ Bút nhớ dòng (Highlighter) 🖍️");
                    setShowAnnotatorModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-bold transition-all cursor-pointer"
                >
                  Bút nhớ dòng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast("Đã xóa toàn bộ nét vẽ/đánh dấu!");
                    setShowAnnotatorModal(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL WORKSPACE: GHI CHÚ --- */}
        {showNotesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Ghi chú bài học
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNotesModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={4}
                placeholder="Ghi chép lại các cấu trúc bẫy ngữ pháp hoặc từ mới cần nhớ..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast("Đã lưu ghi chú thành công! 📝");
                    setShowNotesModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Lưu ghi chú
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL WORKSPACE: HỎI BÀI --- */}
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Trợ lý AI Trả lời câu hỏi
                </h3>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 space-y-2">
                <p className="font-bold">🤖 Phân tích AI:</p>
                <p className="leading-relaxed">
                  Tại sao chọn <strong>{q.options[q.correctIndex]}</strong>? Vì đây là câu hỏi từ loại cơ bản. {q.explanation}
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL WORKSPACE: BÁO LỖI --- */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Flag className="w-5 h-5 text-rose-600" />
                  Báo lỗi câu hỏi
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Mô tả nội dung câu hỏi bị sai hoặc thiếu..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-rose-500 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast("Cảm ơn bạn! Đã gửi báo lỗi thành công 🎉");
                    setReportText("");
                    setShowReportModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Gửi báo lỗi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL WORKSPACE: GIỎ TỪ --- */}
        {showWordBasketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  Giỏ từ vựng của bạn ({savedWords.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowWordBasketModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {savedWords.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  Giỏ từ hiện đang trống. Hãy nhấn nút &quot;+ Thêm&quot; ở các từ vựng để lưu vào đây!
                </p>
              ) : (
                <div className="space-y-2">
                  {savedWords.map((w, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{w}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSavedWords((prev) => prev.filter((item) => item !== w));
                          showToast(`Đã bỏ từ "${w}" khỏi Giỏ từ`);
                        }}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- MODAL WORKSPACE: TRA TỪ --- */}
        {showDictionaryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Tra từ điển nhanh
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDictionaryModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSearchDict} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập từ cần tra (ví dụ: contract)..."
                  value={dictQuery}
                  onChange={(e) => setDictQuery(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Tra ngay
                </button>
              </form>
              {dictResult && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-900 text-sm">{dictResult.word}</span>
                    <span className="text-xs text-slate-500">{dictResult.ipa}</span>
                  </div>
                  <p className="text-xs text-slate-700">{dictResult.meaning}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- MODAL WORKSPACE: MA TRẬN CÂU HỎI (QUESTION GRID) --- */}
        {showQuestionGridModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Grid className="w-5 h-5 text-emerald-600" />
                  Danh sách câu hỏi bài tập
                </h3>
                <button
                  type="button"
                  onClick={() => setShowQuestionGridModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2.5 max-h-[60vh] overflow-y-auto p-1">
                {activePracticeCard.sampleQuestions.map((_, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setSelectedOption(null);
                        setIsChecked(false);
                        setShowQuestionGridModal(false);
                        playSfx("click");
                      }}
                      className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-blue-600 text-white ring-2 ring-blue-400"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Câu {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ADMIN READING CONTENT MANAGEMENT PAGE (WHEN NO PRACTICE ACTIVE)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f8fafc]/90 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      {/* HEADER BANNER CHINH PHỤC TOEIC READING */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Luyện tập TOEIC
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Chinh phục <span className="text-blue-600">Toeic Reading</span> từ dễ đến khó
          </h1>
          <p className="text-sm font-medium text-slate-600 max-w-xl leading-relaxed">
            Ôn ngữ pháp theo điểm chủ và luyện tập Phần 5–7 theo 4 cấp độ.
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* MAIN TAB BAR */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/60 rounded-full w-fit">
        <button
          type="button"
          onClick={() => {
            setActiveMainTab("grammar");
            setActiveSubFilter("all");
          }}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            activeMainTab === "grammar"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          Ngữ pháp
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("part5")}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            activeMainTab === "part5"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          Phần 5
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("part6")}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            activeMainTab === "part6"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          Phần 6
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("part7")}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            activeMainTab === "part7"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          Phần 7
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* --- TAB 1: NGỮ PHÁP --- */}
      {activeMainTab === "grammar" && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSubFilter("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeSubFilter === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setActiveSubFilter("word_types")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeSubFilter === "word_types"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Từ loại
              </button>
              <button
                type="button"
                onClick={() => setActiveSubFilter("verbs")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeSubFilter === "verbs"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Động từ
              </button>
              <button
                type="button"
                onClick={() => setActiveSubFilter("other_grammar")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeSubFilter === "other_grammar"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Ngữ pháp khác
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateCard}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm chủ điểm đọc
            </button>
          </div>

          {(activeSubFilter === "all" || activeSubFilter === "word_types") && (
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Từ loại</h2>
                <p className="text-xs font-medium text-slate-500">
                  {grammarWordTypes.length} chủ điểm · 554 câu
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grammarWordTypes.map(renderCard)}
              </div>
            </div>
          )}

          {(activeSubFilter === "all" || activeSubFilter === "verbs") && (
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Động từ</h2>
                <p className="text-xs font-medium text-slate-500">
                  {grammarVerbs.length} chủ điểm · 582 câu
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {grammarVerbs.map(renderCard)}
              </div>
            </div>
          )}

          {(activeSubFilter === "all" || activeSubFilter === "other_grammar") && (
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Ngữ pháp khác</h2>
                <p className="text-xs font-medium text-slate-500">
                  {grammarOther.length} chủ điểm · 707 câu
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {grammarOther.map(renderCard)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: PHẦN 5 --- */}
      {activeMainTab === "part5" && (
        <div className="space-y-9 animate-in fade-in duration-150">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Phần 5 theo 4 Cấp độ</h2>
                <p className="text-xs font-medium text-slate-500">
                  Luyện theo mục tiêu điểm từ dưới 200 đến 495 điểm Reading.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateCard}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm chủ điểm đọc
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {currentTabLevels.map(renderCard)}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Luyện theo chủ điểm</h2>
              <p className="text-xs font-medium text-slate-500">
                Cùng bộ câu ở trên, chia theo chủ điểm ngữ pháp. Mỗi câu thuộc đúng một chủ điểm.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {currentTabTopics.map(renderCard)}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: PHẦN 6 --- */}
      {activeMainTab === "part6" && (
        <div className="space-y-9 animate-in fade-in duration-150">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Phần 6 theo Cấp độ</h2>
                <p className="text-xs font-medium text-slate-500">
                  Luyện điền đoạn văn bản TOEIC (Text Completion) theo độ khó thích ứng.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateCard}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm chủ điểm đọc
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {currentTabLevels.map(renderCard)}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Luyện theo dạng văn bản</h2>
              <p className="text-xs font-medium text-slate-500">
                Các dạng bài đọc thực tế: Email, Thông báo nội bộ, Thư mời, Báo cáo...
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {currentTabTopics.map(renderCard)}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: PHẦN 7 --- */}
      {activeMainTab === "part7" && (
        <div className="space-y-9 animate-in fade-in duration-150">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Phần 7 theo Cấp độ</h2>
                <p className="text-xs font-medium text-slate-500">
                  Đọc hiểu đoạn đơn, đoạn kép, đoạn ba với kỹ thuật Skimming & Scanning.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateCard}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm chủ điểm đọc
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {currentTabLevels.map(renderCard)}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Luyện theo cấu trúc bài đọc</h2>
              <p className="text-xs font-medium text-slate-500">
                Tập trung rèn luyện phản xạ đọc hiểu đoạn đơn (Single) và đoạn đa văn bản (Multi-Passages).
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {currentTabTopics.map(renderCard)}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TÀI LIỆU LÝ THUYẾT */}
      {theoryCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setTheoryCard(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Lý thuyết cốt lõi TOEIC
              </span>
              <h3 className="text-xl font-bold text-slate-900">{theoryCard.title}</h3>
            </div>

            {theoryCard.theory ? (
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-blue-900 font-medium">
                  {theoryCard.theory.summary}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Quy tắc & Dấu hiệu nhận biết:
                  </h4>
                  <ul className="space-y-1.5">
                    {theoryCard.theory.rules.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Ví dụ minh họa:
                  </span>
                  <p className="font-mono text-xs text-slate-800 italic">
                    &quot;{theoryCard.theory.example}&quot;
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Chủ điểm này đang tổng hợp thêm tài liệu ngữ pháp mở rộng.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const target = theoryCard;
                  setTheoryCard(null);
                  handleStartPractice(target);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Luyện tập ngay
              </button>
              <button
                type="button"
                onClick={() => setTheoryCard(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ÔN LẠI CÂU SAI */}
      {reviewWrongCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setReviewWrongCard(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                Sổ tay câu sai (Wrong Notebook)
              </span>
              <h3 className="text-xl font-bold text-slate-900">{reviewWrongCard.title}</h3>
              <p className="text-xs text-slate-500">
                Bạn có <strong>{reviewWrongCard.wrongAnswers} câu</strong> làm sai cần được ôn tập lại.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 text-xs text-rose-950 space-y-2">
              <p className="font-semibold">🎯 Lợi ích của việc làm lại câu sai:</p>
              <p className="leading-relaxed">
                Hệ thống AI sẽ tập trung đưa lại các bẫy ngữ pháp bạn từng chọn nhầm cho đến khi mức độ thành thạo đạt 100%.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const target = reviewWrongCard;
                  setReviewWrongCard(null);
                  handleStartPractice(target);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Bắt đầu làm lại các câu sai
              </button>
              <button
                type="button"
                onClick={() => setReviewWrongCard(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XÁC NHẬN ĐẶT LẠI TIẾN ĐỘ */}
      {resetCardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Đặt lại tiến độ học?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bạn có chắc chắn muốn xóa lịch sử đúng/sai của chủ điểm{" "}
                <strong className="text-slate-900">&quot;{resetCardConfirm.title}&quot;</strong> không?
              </p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setResetCardConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / SỬA CHỦ ĐIỂM ĐỌC */}
      {showCreateCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Reading Content</span>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCard ? "Chỉnh sửa chủ điểm đọc" : "Thêm chủ điểm đọc mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateCardModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên chủ điểm đọc *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đại từ & Tính từ sở hữu"
                  value={cardFormTitle}
                  onChange={(e) => setCardFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phần thi (Phân loại)</label>
                  <select
                    value={cardFormCategory}
                    onChange={(e) => setCardFormCategory(e.target.value as "grammar" | "part5" | "part6" | "part7")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="grammar">Ngữ pháp</option>
                    <option value="part5">Phần 5 (Part 5)</option>
                    <option value="part6">Phần 6 (Part 6)</option>
                    <option value="part7">Phần 7 (Part 7)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số câu hỏi</label>
                  <input
                    type="number"
                    min={1}
                    value={cardFormTotalQuestions}
                    onChange={(e) => setCardFormTotalQuestions(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nhóm con</label>
                  <select
                    value={cardFormSubCategory}
                    onChange={(e) => setCardFormSubCategory(e.target.value as "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="word_types">Từ loại</option>
                    <option value="verbs">Động từ</option>
                    <option value="other_grammar">Ngữ pháp khác</option>
                    <option value="levels">Theo cấp độ</option>
                    <option value="by_topic">Theo chủ điểm</option>
                    <option value="text_types">Theo dạng văn bản</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thẻ ghi chú (Tag)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cùng gốc, khác hậu tố"
                    value={cardFormTag}
                    onChange={(e) => setCardFormTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tóm tắt lý thuyết</label>
                <textarea
                  rows={2}
                  placeholder="Kiến thức nền tảng cần ghi nhớ..."
                  value={cardFormTheorySummary}
                  onChange={(e) => setCardFormTheorySummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mẹo thi & Quy tắc (mỗi dòng một mẹo)</label>
                <textarea
                  rows={2}
                  placeholder="Dấu hiệu nhận biết nhanh...&#10;Bẫy thường gặp..."
                  value={cardFormTheoryRules}
                  onChange={(e) => setCardFormTheoryRules(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ví dụ minh họa ngữ cảnh</label>
                <input
                  type="text"
                  placeholder="Ví dụ: The manager submitted the proposal on time."
                  value={cardFormTheoryExample}
                  onChange={(e) => setCardFormTheoryExample(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateCardModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingCard ? "Lưu thay đổi" : "Tạo chủ điểm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XÁC NHẬN XÓA CHỦ ĐIỂM ĐỌC */}
      {deleteCardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Xóa chủ điểm đọc?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn chủ điểm{" "}
                <strong className="text-slate-900">&quot;{deleteCardConfirm.title}&quot;</strong>? Toàn bộ câu hỏi và tiến độ thuộc chủ điểm này sẽ bị xóa.
              </p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeleteCardConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCard}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST THÔNG BÁO */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
