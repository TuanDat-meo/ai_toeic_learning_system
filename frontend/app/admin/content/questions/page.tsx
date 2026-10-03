"use client";

import React, { useState, useMemo } from "react";
import {
  FileQuestion,
  Search,
  Plus,
  FileDown,
  FileUp,
  Eye,
  Pencil,
  Trash2,
  X,
  Check,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  Image as ImageIcon,
  Play,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// --- TYPES & INTERFACES ---
export type QuestionPart =
  | "Part 1"
  | "Part 2"
  | "Part 3"
  | "Part 4"
  | "Part 5"
  | "Part 6"
  | "Part 7";

export type QuestionDifficulty = "Easy" | "Medium" | "Hard";

export interface QuestionOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  isCorrect: boolean;
}

export interface QuestionItem {
  id: string;
  code?: string;
  part: QuestionPart;
  questionText: string;
  passage?: string;
  imageUrl?: string;
  audioUrl?: string;
  options: QuestionOption[];
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D'
  skill: string;
  difficulty: QuestionDifficulty;
  explanation: string;
  status: "PUBLISHED" | "DRAFT";
  createdAt?: string;
}

// --- CONSTANTS ---
export const DEFAULT_PARTS: { part: QuestionPart | "ALL"; label: string; desc: string }[] = [
  { part: "ALL", label: "Tất cả Part", desc: "Toàn bộ ngân hàng câu hỏi" },
  { part: "Part 1", label: "Part 1", desc: "Mô tả hình ảnh (Photographs)" },
  { part: "Part 2", label: "Part 2", desc: "Hỏi & Đáp (Question - Response)" },
  { part: "Part 3", label: "Part 3", desc: "Hội thoại ngắn (Conversations)" },
  { part: "Part 4", label: "Part 4", desc: "Bài nói ngắn (Short Talks)" },
  { part: "Part 5", label: "Part 5", desc: "Hoàn thành câu (Incomplete Sentences)" },
  { part: "Part 6", label: "Part 6", desc: "Điền đoạn văn (Text Completion)" },
  { part: "Part 7", label: "Part 7", desc: "Đọc hiểu văn bản (Reading)" },
];

export const DEFAULT_SKILLS = [
  "Grammar (Ngữ pháp)",
  "Vocabulary (Từ vựng)",
  "Inference (Suy luận)",
  "Detail (Thông tin chi tiết)",
  "Main Idea (Ý chính)",
  "Collocation (Cụm từ cố định)",
  "Connecting Words (Liên từ & Giới từ)",
  "Pronunciation & Listening (Nghe hiểu)",
];

// --- SAMPLE DATA 15 REALISTIC TOEIC QUESTIONS COVERING ALL 7 PARTS ---
const INITIAL_QUESTIONS: QuestionItem[] = [
  // --- PART 1: PHOTOGRAPHS ---
  {
    id: "q-101",
    code: "P1-001",
    part: "Part 1",
    questionText: "Look at the photograph and choose the statement that best describes what you see:",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    audioUrl: "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
    options: [
      { id: "A", text: "She is hanging a whiteboard on the wall.", isCorrect: false },
      { id: "B", text: "She is working at a computer workstation.", isCorrect: true },
      { id: "C", text: "She is filing paper documents into a metal cabinet.", isCorrect: false },
      { id: "D", text: "She is answering an incoming telephone call.", isCorrect: false },
    ],
    correctAnswer: "B",
    skill: "Detail (Thông tin chi tiết)",
    difficulty: "Easy",
    explanation:
      "Bức ảnh thể hiện rõ người phụ nữ đang tập trung gõ phím làm việc tại bàn máy tính ('She is working at a computer workstation'). Các phương án khác mô tả sai hành động.",
    status: "PUBLISHED",
  },
  {
    id: "q-102",
    code: "P1-002",
    part: "Part 1",
    questionText: "Look at the photograph and choose the best descriptive statement:",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80",
    options: [
      { id: "A", text: "Some ladders are leaning against the brick wall.", isCorrect: false },
      { id: "B", text: "Heavy trucks are parked along the highway.", isCorrect: false },
      { id: "C", text: "The workers are wearing protective safety helmets.", isCorrect: true },
      { id: "D", text: "Tools are being stored inside the warehouse.", isCorrect: false },
    ],
    correctAnswer: "C",
    skill: "Detail (Thông tin chi tiết)",
    difficulty: "Medium",
    explanation:
      "Phương án C mô tả chính xác đặc điểm của người trong ảnh: 'The workers are wearing protective safety helmets' (Các công nhân đang đội mũ bảo hộ lao động tại công trường).",
    status: "PUBLISHED",
  },

  // --- PART 2: QUESTION - RESPONSE ---
  {
    id: "q-201",
    code: "P2-015",
    part: "Part 2",
    questionText: "Audio Prompt: Where should I file the newly approved shipment invoices?",
    audioUrl: "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
    options: [
      { id: "A", text: "In the filing cabinet next to the reception desk.", isCorrect: true },
      { id: "B", text: "Yes, the delivery arrived yesterday afternoon.", isCorrect: false },
      { id: "C", text: "About fifty dollars per invoice.", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Pronunciation & Listening (Nghe hiểu)",
    difficulty: "Easy",
    explanation:
      "Câu hỏi bắt đầu bằng từ để hỏi 'Where' (Ở đâu). Câu trả lời chỉ địa điểm nơi chốn chính xác là 'In the filing cabinet next to the reception desk' (Trong tủ hồ sơ cạnh quầy lễ tân). Phương án B bẫy Yes/No không dùng cho câu hỏi Wh-.",
    status: "PUBLISHED",
  },
  {
    id: "q-202",
    code: "P2-016",
    part: "Part 2",
    questionText: "Audio Prompt: Has Mr. Kim finalized the contract negotiation with the Japanese supplier?",
    audioUrl: "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
    options: [
      { id: "A", text: "At the Tokyo international airport.", isCorrect: false },
      { id: "B", text: "He is still reviewing the final terms.", isCorrect: true },
      { id: "C", text: "Yes, I enjoyed my vacation there.", isCorrect: false },
    ],
    correctAnswer: "B",
    skill: "Pronunciation & Listening (Nghe hiểu)",
    difficulty: "Medium",
    explanation:
      "Câu hỏi Yes/No ở thì hiện tại hoàn thành. Phương án B đưa ra câu trả lời gián tiếp thường gặp trong đề thi TOEIC: 'He is still reviewing the final terms' (Anh ấy vẫn đang xem xét các điều khoản cuối cùng).",
    status: "PUBLISHED",
  },

  // --- PART 3: CONVERSATIONS ---
  {
    id: "q-301",
    code: "P3-301",
    part: "Part 3",
    passage:
      "Man: Hello, Ms. Gomez. Did the shipment of replacement toner cartridges arrive from the supplier yet?\nWoman: No, unfortunately. The logistics rep called and said the delivery truck was delayed due to the highway snowstorm.\nMan: Oh no. We need those cartridges for printing the annual conference booklets this afternoon.\nWoman: Don't worry. I will borrow two cartridges from the accounting department on the third floor.",
    questionText: "What does the woman offer to do to solve the immediate problem?",
    audioUrl: "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
    options: [
      { id: "A", text: "Cancel the annual conference", isCorrect: false },
      { id: "B", text: "Borrow supplies from another department", isCorrect: true },
      { id: "C", text: "Drive to the supplier's warehouse", isCorrect: false },
      { id: "D", text: "Reprint the documents tomorrow", isCorrect: false },
    ],
    correctAnswer: "B",
    skill: "Detail (Thông tin chi tiết)",
    difficulty: "Medium",
    explanation:
      "Trong lượt nói cuối cùng, người phụ nữ nói: 'I will borrow two cartridges from the accounting department on the third floor' -> Phương án đúng là B (Borrow supplies from another department).",
    status: "PUBLISHED",
  },

  // --- PART 4: SHORT TALKS ---
  {
    id: "q-401",
    code: "P4-401",
    part: "Part 4",
    passage:
      "Attention all passengers on flight VN-302 to Tokyo Narita. Due to scheduled runway maintenance, boarding will be delayed by thirty minutes. Please remain seated near Gate 14 until gate agents begin boarding group A.",
    questionText: "What is the main purpose of the airport announcement?",
    audioUrl: "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
    options: [
      { id: "A", text: "To announce a flight departure delay", isCorrect: true },
      { id: "B", text: "To report a lost piece of baggage", isCorrect: false },
      { id: "C", text: "To notify passengers of a gate change", isCorrect: false },
      { id: "D", text: "To request volunteers for a later flight", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Main Idea (Ý chính)",
    difficulty: "Easy",
    explanation:
      "Thông báo mở đầu bằng: 'Due to scheduled runway maintenance, boarding will be delayed by thirty minutes' -> Mục đích chính là thông báo hoãn giờ lên máy bay.",
    status: "PUBLISHED",
  },

  // --- PART 5: INCOMPLETE SENTENCES ---
  {
    id: "q-501",
    code: "P5-101",
    part: "Part 5",
    questionText:
      "Ms. Tanaka requested that all department managers submit their quarterly reports ______ Friday afternoon.",
    options: [
      { id: "A", text: "before", isCorrect: true },
      { id: "B", text: "until", isCorrect: false },
      { id: "C", text: "along", isCorrect: false },
      { id: "D", text: "between", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Connecting Words (Liên từ & Giới từ)",
    difficulty: "Easy",
    explanation:
      "Dùng giới từ 'before' để chỉ hành động hoàn tất trước một hạn chót thời gian cụ thể ('before Friday afternoon'). 'Until' dùng cho hành động diễn ra liên tục.",
    status: "PUBLISHED",
  },
  {
    id: "q-502",
    code: "P5-102",
    part: "Part 5",
    questionText:
      "The newly appointed CEO has proposed an ______ plan to expand commercial operations into Southeast Asia.",
    options: [
      { id: "A", text: "ambitious", isCorrect: true },
      { id: "B", text: "ambitiously", isCorrect: false },
      { id: "C", text: "ambition", isCorrect: false },
      { id: "D", text: "ambitiousness", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Vocabulary (Từ vựng)",
    difficulty: "Medium",
    explanation:
      "Đứng trước danh từ 'plan' cần một tính từ bổ nghĩa ('an ambitious plan' - một kế hoạch đầy tham vọng).",
    status: "PUBLISHED",
  },
  {
    id: "q-503",
    code: "P5-103",
    part: "Part 5",
    questionText:
      "Passengers must present their boarding pass and photo identification prior to ______ the aircraft.",
    options: [
      { id: "A", text: "board", isCorrect: false },
      { id: "B", text: "boarding", isCorrect: true },
      { id: "C", text: "boarded", isCorrect: false },
      { id: "D", text: "boards", isCorrect: false },
    ],
    correctAnswer: "B",
    skill: "Grammar (Ngữ pháp)",
    difficulty: "Easy",
    explanation:
      "Sau cụm giới từ 'prior to' cần danh động từ V-ing ('boarding the aircraft' - trước khi lên máy bay).",
    status: "PUBLISHED",
  },
  {
    id: "q-504",
    code: "P5-104",
    part: "Part 5",
    questionText:
      "All laboratory chemicals must be stored in ______ containers to prevent accidental leakage during transit.",
    options: [
      { id: "A", text: "secure", isCorrect: true },
      { id: "B", text: "securely", isCorrect: false },
      { id: "C", text: "securing", isCorrect: false },
      { id: "D", text: "security", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Vocabulary (Từ vựng)",
    difficulty: "Medium",
    explanation:
      "Trước danh từ 'containers' cần tính từ 'secure' mang nghĩa 'chắc chắn, an toàn'.",
    status: "PUBLISHED",
  },
  {
    id: "q-505",
    code: "P5-105",
    part: "Part 5",
    questionText:
      "Neither the marketing director ______ the project coordinator was aware of the sudden schedule alteration.",
    options: [
      { id: "A", text: "or", isCorrect: false },
      { id: "B", text: "nor", isCorrect: true },
      { id: "C", text: "and", isCorrect: false },
      { id: "D", text: "but", isCorrect: false },
    ],
    correctAnswer: "B",
    skill: "Grammar (Ngữ pháp)",
    difficulty: "Medium",
    explanation:
      "Cặp liên từ tương quan bắt buộc trong TOEIC: 'Neither ... nor ...' (Không ... cũng không ...).",
    status: "PUBLISHED",
  },
  {
    id: "q-506",
    code: "P5-106",
    part: "Part 5",
    questionText:
      "The executive team expressed gratitude to all employees ______ dedication contributed to the merger's success.",
    options: [
      { id: "A", text: "who", isCorrect: false },
      { id: "B", text: "whom", isCorrect: false },
      { id: "C", text: "whose", isCorrect: true },
      { id: "D", text: "which", isCorrect: false },
    ],
    correctAnswer: "C",
    skill: "Grammar (Ngữ pháp)",
    difficulty: "Hard",
    explanation:
      "Khoảng trống đứng trước danh từ 'dedication' và sau danh từ chỉ người 'all employees' thể hiện quan hệ sở hữu -> dùng đại từ quan hệ 'whose'.",
    status: "PUBLISHED",
  },

  // --- PART 6: TEXT COMPLETION ---
  {
    id: "q-601",
    code: "P6-201",
    part: "Part 6",
    passage:
      "Notice to all building tenants: Please note that the third-floor cafeteria will be closed ______ the entire month of August for comprehensive refurbishment. During this period, food trucks will be stationed outside the main entrance.",
    questionText:
      "Choose the appropriate preposition to complete the sentence in the notice:",
    options: [
      { id: "A", text: "for", isCorrect: true },
      { id: "B", text: "since", isCorrect: false },
      { id: "C", text: "while", isCorrect: false },
      { id: "D", text: "among", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Connecting Words (Liên từ & Giới từ)",
    difficulty: "Medium",
    explanation:
      "Giới từ 'for' đi với khoảng thời gian ('for the entire month of August' - trong suốt cả tháng Tám). 'Since' chỉ mốc thời gian bắt đầu.",
    status: "PUBLISHED",
  },

  // --- PART 7: READING COMPREHENSION ---
  {
    id: "q-701",
    code: "P7-501",
    part: "Part 7",
    passage:
      "To: All Staff Members\nFrom: Human Resources Department\nSubject: Mandatory Data Security Training Seminar\n\nPlease be reminded that attendance at the cybersecurity workshop on Oct 15th is mandatory for all team members hired within the past six months. The session will cover safe password handling and phishing detection.",
    questionText: "What is indicated about the upcoming cybersecurity workshop?",
    options: [
      { id: "A", text: "It is mandatory for all recently hired personnel", isCorrect: true },
      { id: "B", text: "It will be held at an off-site conference hall", isCorrect: false },
      { id: "C", text: "Participants must bring their personal laptops", isCorrect: false },
      { id: "D", text: "It has been rescheduled to next month", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Inference (Suy luận)",
    difficulty: "Hard",
    explanation:
      "Đoạn văn nêu rõ: 'attendance at the cybersecurity workshop on Oct 15th is mandatory for all team members hired within the past six months' -> Đáp án đúng là A.",
    status: "PUBLISHED",
  },
  {
    id: "q-702",
    code: "P7-502",
    part: "Part 7",
    passage:
      "PRESS RELEASE — Apex Logistics Corp has completed the acquisition of Pacific Express for $45 million. The deal expands Apex's freight forwarding network across seven Asian ports.",
    questionText: "According to the press release, what did Apex Logistics Corp do?",
    options: [
      { id: "A", text: "Acquired another freight company", isCorrect: true },
      { id: "B", text: "Opened a new headquarters in Europe", isCorrect: false },
      { id: "C", text: "Lowered shipping rates by 45 percent", isCorrect: false },
      { id: "D", text: "Sold its fleet of container ships", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Main Idea (Ý chính)",
    difficulty: "Medium",
    explanation:
      "Bản thông cáo báo chí nêu rõ: 'Apex Logistics Corp has completed the acquisition of Pacific Express' -> Apex đã thâu tóm/mua lại một công ty vận tải khác.",
    status: "PUBLISHED",
  },
];

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>(INITIAL_QUESTIONS);
  const [selectedPartTab, setSelectedPartTab] = useState<QuestionPart | "ALL">("ALL");
  const [keyword, setKeyword] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);
  const [userSelectedOption, setUserSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [deleteConfirmQuestion, setDeleteConfirmQuestion] = useState<QuestionItem | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form state
  const [formPart, setFormPart] = useState<QuestionPart>("Part 5");
  const [formSkill, setFormSkill] = useState(DEFAULT_SKILLS[0]);
  const [formDifficulty, setFormDifficulty] = useState<QuestionDifficulty>("Medium");
  const [formStatus, setFormStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [formPassage, setFormPassage] = useState("");
  const [formQuestionText, setFormQuestionText] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formAudioUrl, setFormAudioUrl] = useState("");
  const [formOptA, setFormOptA] = useState("");
  const [formOptB, setFormOptB] = useState("");
  const [formOptC, setFormOptC] = useState("");
  const [formOptD, setFormOptD] = useState("");
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<string>("A");
  const [formExplanation, setFormExplanation] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sound synthesis / audio play
  const playAudio = (textOrUrl: string) => {
    if (textOrUrl.startsWith("http")) {
      const audio = new Audio(textOrUrl);
      audio.play().catch(() => {
        showToast("Âm thanh mô phỏng đang phát...");
      });
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textOrUrl);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Part tab
      if (selectedPartTab !== "ALL" && q.part !== selectedPartTab) {
        return false;
      }
      // Skill filter
      if (selectedSkill && q.skill !== selectedSkill) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty && q.difficulty !== selectedDifficulty) {
        return false;
      }
      // Status filter
      if (selectedStatus && q.status !== selectedStatus) {
        return false;
      }
      // Search keyword
      if (keyword.trim()) {
        const lower = keyword.toLowerCase();
        const inCode = q.code?.toLowerCase().includes(lower);
        const inText = q.questionText.toLowerCase().includes(lower);
        const inPassage = q.passage?.toLowerCase().includes(lower);
        const inOptions = q.options.some((o) => o.text.toLowerCase().includes(lower));
        const inExpl = q.explanation.toLowerCase().includes(lower);
        if (!inCode && !inText && !inPassage && !inOptions && !inExpl) {
          return false;
        }
      }
      return true;
    });
  }, [questions, selectedPartTab, selectedSkill, selectedDifficulty, selectedStatus, keyword]);



  // Pagination calculations
  const totalItems = filteredQuestions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + pageSize);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedQuestions.map((q) => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const isAllSelected =
    paginatedQuestions.length > 0 &&
    paginatedQuestions.every((q) => selectedIds.includes(q.id));

  // Bulk actions
  const handleBulkPublish = () => {
    setQuestions((prev) =>
      prev.map((q) => (selectedIds.includes(q.id) ? { ...q, status: "PUBLISHED" } : q))
    );
    showToast(`Đã duyệt xuất bản ${selectedIds.length} câu hỏi! 🎉`);
    setSelectedIds([]);
  };

  const handleBulkDraft = () => {
    setQuestions((prev) =>
      prev.map((q) => (selectedIds.includes(q.id) ? { ...q, status: "DRAFT" } : q))
    );
    showToast(`Đã chuyển ${selectedIds.length} câu hỏi sang bản nháp! 📝`);
    setSelectedIds([]);
  };

  const handleBulkDeleteConfirm = () => {
    setQuestions((prev) => prev.filter((q) => !selectedIds.includes(q.id)));
    showToast(`Đã xóa ${selectedIds.length} câu hỏi đã chọn! 🗑️`);
    setSelectedIds([]);
    setBulkDeleteConfirm(false);
  };

  const confirmDeleteSingle = () => {
    if (!deleteConfirmQuestion) return;
    setQuestions((prev) => prev.filter((q) => q.id !== deleteConfirmQuestion.id));
    setSelectedIds((prev) => prev.filter((id) => id !== deleteConfirmQuestion.id));
    showToast(`Đã xóa câu hỏi ${deleteConfirmQuestion.code || deleteConfirmQuestion.id}! 🗑️`);
    setDeleteConfirmQuestion(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredQuestions.length === 0) {
      alert("Không có câu hỏi nào để xuất file!");
      return;
    }

    const headers = [
      "Mã",
      "Part",
      "Nội dung câu hỏi",
      "Đoạn văn/Ngữ cảnh",
      "Phương án A",
      "Phương án B",
      "Phương án C",
      "Phương án D",
      "Đáp án đúng",
      "Kỹ năng",
      "Độ khó",
      "Lời giải thích",
      "Trạng thái",
    ];

    const rows = filteredQuestions.map((q) => {
      const optA = q.options.find((o) => o.id === "A")?.text || "";
      const optB = q.options.find((o) => o.id === "B")?.text || "";
      const optC = q.options.find((o) => o.id === "C")?.text || "";
      const optD = q.options.find((o) => o.id === "D")?.text || "";

      return [
        `"${q.code || q.id}"`,
        `"${q.part}"`,
        `"${q.questionText.replace(/"/g, '""')}"`,
        `"${(q.passage || "").replace(/"/g, '""')}"`,
        `"${optA.replace(/"/g, '""')}"`,
        `"${optB.replace(/"/g, '""')}"`,
        `"${optC.replace(/"/g, '""')}"`,
        `"${optD.replace(/"/g, '""')}"`,
        `"${q.correctAnswer}"`,
        `"${q.skill}"`,
        `"${q.difficulty}"`,
        `"${q.explanation.replace(/"/g, '""')}"`,
        `"${q.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}"`,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ngan_hang_cau_hoi_toeic_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Đã xuất tệp CSV thành công! 📊");
  };

  // CSV Import Mock
  const handleImportCSV = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target?.files?.[0];
      if (file) {
        showToast(`Đã nhận file: "${file.name}". Đang kiểm tra cấu trúc và đồng bộ! 📥`);
      }
    };
    input.click();
  };

  // Open Modal Add
  const openAddModal = () => {
    setEditingQuestion(null);
    setFormPart("Part 5");
    setFormSkill(DEFAULT_SKILLS[0]);
    setFormDifficulty("Medium");
    setFormStatus("PUBLISHED");
    setFormPassage("");
    setFormImageUrl("");
    setFormAudioUrl("");
    setFormQuestionText("");
    setFormOptA("");
    setFormOptB("");
    setFormOptC("");
    setFormOptD("");
    setFormCorrectAnswer("A");
    setFormExplanation("");
    setEditModalOpen(true);
  };

  // Open Modal Edit
  const openEditModal = (q: QuestionItem) => {
    setEditingQuestion(q);
    setFormPart(q.part);
    setFormSkill(q.skill);
    setFormDifficulty(q.difficulty);
    setFormStatus(q.status);
    setFormPassage(q.passage || "");
    setFormImageUrl(q.imageUrl || "");
    setFormAudioUrl(q.audioUrl || "");
    setFormQuestionText(q.questionText);
    setFormOptA(q.options.find((o) => o.id === "A")?.text || "");
    setFormOptB(q.options.find((o) => o.id === "B")?.text || "");
    setFormOptC(q.options.find((o) => o.id === "C")?.text || "");
    setFormOptD(q.options.find((o) => o.id === "D")?.text || "");
    setFormCorrectAnswer(q.correctAnswer);
    setFormExplanation(q.explanation);
    setEditModalOpen(true);
  };

  // Open Preview Modal
  const openPreviewModal = (q: QuestionItem) => {
    setPreviewQuestion(q);
    setUserSelectedOption(null);
    setShowExplanation(false);
  };

  // Mock AI Generator for explanation & options
  const handleGenerateAiHelp = () => {
    if (!formQuestionText.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi trước khi nhờ AI hỗ trợ gợi ý giải thích!");
      return;
    }
    setAiGenerating(true);
    setTimeout(() => {
      setFormExplanation(
        `[Phân tích chuyên sâu TOEIC AI]: Câu hỏi kiểm tra kỹ năng ${formSkill}. Phương án ${formCorrectAnswer} là đáp án chính xác nhất theo quy tắc ngữ pháp và ngữ cảnh giao tiếp thương mại quốc tế ETS. Lưu ý các bẫy từ loại và thì động từ thường gặp trong Part này.`
      );
      setAiGenerating(false);
      showToast("AI đã sinh lời giải thích chi tiết thành công! 🤖✨");
    }, 700);
  };

  // Save Modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestionText.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi!");
      return;
    }
    if (!formOptA.trim() || !formOptB.trim()) {
      alert("Vui lòng nhập tối thiểu 2 phương án đáp án!");
      return;
    }

    const options: QuestionOption[] = [
      { id: "A", text: formOptA.trim(), isCorrect: formCorrectAnswer === "A" },
      { id: "B", text: formOptB.trim(), isCorrect: formCorrectAnswer === "B" },
    ];
    if (formOptC.trim()) {
      options.push({ id: "C", text: formOptC.trim(), isCorrect: formCorrectAnswer === "C" });
    }
    if (formOptD.trim()) {
      options.push({ id: "D", text: formOptD.trim(), isCorrect: formCorrectAnswer === "D" });
    }

    if (editingQuestion) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                part: formPart,
                skill: formSkill,
                difficulty: formDifficulty,
                status: formStatus,
                passage: formPassage.trim() || undefined,
                imageUrl: formImageUrl.trim() || undefined,
                audioUrl: formAudioUrl.trim() || undefined,
                questionText: formQuestionText.trim(),
                options,
                correctAnswer: formCorrectAnswer,
                explanation: formExplanation.trim() || "Chưa có giải thích chi tiết.",
              }
            : q
        )
      );
      showToast("Đã cập nhật câu hỏi thành công! 💾");
    } else {
      const newQuestion: QuestionItem = {
        id: `q-${Date.now()}`,
        code: `P${formPart.replace("Part ", "")}-${Math.floor(100 + Math.random() * 900)}`,
        part: formPart,
        skill: formSkill,
        difficulty: formDifficulty,
        status: formStatus,
        passage: formPassage.trim() || undefined,
        imageUrl: formImageUrl.trim() || undefined,
        audioUrl: formAudioUrl.trim() || undefined,
        questionText: formQuestionText.trim(),
        options,
        correctAnswer: formCorrectAnswer,
        explanation: formExplanation.trim() || "Chưa có giải thích chi tiết.",
      };
      setQuestions((prev) => [newQuestion, ...prev]);
      showToast("Đã thêm câu hỏi mới vào ngân hàng! 🚀");
    }
    setEditModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/90 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Toast message popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-blue-400 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* KHỐI 1: HEADER BANNER CHINH PHỤC NGÂN HÀNG CÂU HỎI (CHUẨN 100% THEO KHUNG TỪ VỰNG) */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Kho câu hỏi TOEIC chuẩn ETS
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Chinh phục <span className="text-blue-600">Ngân hàng câu hỏi</span>
          </h1>
          <p className="text-sm font-medium text-slate-600 max-w-2xl leading-relaxed">
            Luyện tập toàn diện các dạng câu hỏi Part 1 - Part 7: giải thích chi tiết từng đáp án, phân tích bẫy đề thi và tối ưu hóa điểm số.
          </p>
        </div>

        {/* Icon hộp xanh lớn góc phải (chuẩn 100% như khung Từ vựng) */}
        <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <FileQuestion className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* KHỐI 2: THANH TAB CHUYỂN NHANH THEO CÁC PART VÀ CỤM NÚT THAO TÁC */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl max-w-full overflow-x-auto no-scrollbar shadow-2xs">
          {DEFAULT_PARTS.map((p) => {
            const isActive = selectedPartTab === p.part;
            const countInPart =
              p.part === "ALL"
                ? questions.length
                : questions.filter((q) => q.part === p.part).length;

            return (
              <button
                key={p.part}
                type="button"
                onClick={() => {
                  setSelectedPartTab(p.part);
                  setCurrentPage(1);
                }}
                className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
                }`}
                title={p.desc}
              >
                <span>{p.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                    isActive
                      ? "bg-white/20 text-white border border-white/20"
                      : "bg-slate-200/90 text-slate-700 group-hover:bg-slate-300/80"
                  }`}
                >
                  {countInPart}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cụm nút thao tác xuất/nhập/thêm mới */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleImportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Nhập danh sách câu hỏi từ file CSV"
          >
            <FileUp className="w-4 h-4 text-slate-500" />
            Nhập CSV
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Xuất danh sách câu hỏi đang lọc ra tệp CSV"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            Xuất CSV
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/25 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm câu hỏi mới
          </button>
        </div>
      </div>


      {/* KHỐI 4: THANH TÌM KIẾM, BỘ LỌC & BULK ACTIONS */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3.5">
          {/* Ô Tìm kiếm */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo nội dung câu hỏi, đoạn văn, mã câu, đáp án..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
            {keyword && (
              <button
                onClick={() => setKeyword("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Lọc Kỹ năng */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold uppercase shrink-0">Kỹ năng:</span>
            <select
              value={selectedSkill}
              onChange={(e) => {
                setSelectedSkill(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">Tất cả kỹ năng</option>
              {DEFAULT_SKILLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Độ khó */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold uppercase shrink-0">Độ khó:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">Tất cả độ khó</option>
              <option value="Easy">Dễ (Easy)</option>
              <option value="Medium">Trung bình (Medium)</option>
              <option value="Hard">Khó (Hard)</option>
            </select>
          </div>

          {/* Lọc Trạng thái */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold uppercase shrink-0">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đã xuất bản</option>
              <option value="DRAFT">Bản nháp</option>
            </select>
          </div>

          {/* Chuyển đổi View: Bảng / Thẻ */}
          <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === "table" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Xem dạng bảng"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === "cards" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Xem dạng thẻ"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Thanh Bulk Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              Đang hiển thị: <strong className="text-blue-600 font-bold">{totalItems}</strong> câu hỏi
            </span>
            {selectedIds.length > 0 && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-blue-700 font-semibold">
                  Đã chọn {selectedIds.length} câu
                </span>
              </>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkPublish}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Duyệt xuất bản
              </button>
              <button
                type="button"
                onClick={handleBulkDraft}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Chuyển nháp
              </button>
              <button
                type="button"
                onClick={() => setBulkDeleteConfirm(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer border border-rose-200 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa ({selectedIds.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Bỏ chọn
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KHỐI 5: DANH SÁCH CÂU HỎI (DẠNG BẢNG HOẶC DẠNG THẺ) */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/90 rounded-3xl p-8 space-y-4 shadow-xs">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Không tìm thấy câu hỏi nào phù hợp</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Vui lòng thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại các bộ lọc Part, kỹ năng và độ khó.
          </p>
          <button
            onClick={() => {
              setKeyword("");
              setSelectedPartTab("ALL");
              setSelectedSkill("");
              setSelectedDifficulty("");
              setSelectedStatus("");
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* DẠNG BẢNG (TABLE VIEW) */
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4 w-72">Mã & Nội dung câu hỏi</th>
                  <th className="py-3.5 px-4">Các lựa chọn (A, B, C, D)</th>
                  <th className="py-3.5 px-4 w-44">Kỹ năng & Độ khó</th>
                  <th className="py-3.5 px-4 w-32">Trạng thái</th>
                  <th className="py-3.5 px-4 w-32 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedQuestions.map((q) => {
                  const isChecked = selectedIds.includes(q.id);

                  return (
                    <tr
                      key={q.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isChecked ? "bg-blue-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(q.id, e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Câu hỏi & Part */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-600 font-mono">
                              {q.part}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono font-semibold">
                              {q.code || `#${q.id}`}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 leading-snug line-clamp-2">
                            {q.questionText}
                          </p>
                          {q.passage && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 italic bg-slate-50 px-2 py-1 rounded border border-slate-200/60">
                              Ngữ cảnh: {q.passage}
                            </p>
                          )}
                          {(q.imageUrl || q.audioUrl) && (
                            <div className="flex items-center gap-2 pt-1">
                              {q.imageUrl && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                                  <ImageIcon className="w-3 h-3 text-blue-600" />
                                  Có ảnh
                                </span>
                              )}
                              {q.audioUrl && (
                                <button
                                  type="button"
                                  onClick={() => playAudio(q.audioUrl!)}
                                  className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer"
                                  title="Nghe audio"
                                >
                                  <Volume2 className="w-3 h-3 text-blue-600" />
                                  Nghe audio
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Các lựa chọn & Đáp án */}
                      <td className="py-3.5 px-4">
                        <div className="grid grid-cols-2 gap-1.5 max-w-md">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                                opt.isCorrect
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                                  : "bg-slate-50 border-slate-200/70 text-slate-600 font-medium"
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  opt.isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {opt.id}
                              </span>
                              <span className="truncate">{opt.text}</span>
                              {opt.isCorrect && <Check className="w-3 h-3 text-emerald-600 ml-auto shrink-0" />}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Kỹ năng & Độ khó */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold truncate max-w-[150px]">
                            {q.skill}
                          </span>
                          <div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                q.difficulty === "Easy"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                  : q.difficulty === "Medium"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                                  : "bg-rose-50 text-rose-700 border border-rose-200/60"
                              }`}
                            >
                              {q.difficulty === "Easy"
                                ? "Dễ (Easy)"
                                : q.difficulty === "Medium"
                                ? "Trung bình"
                                : "Khó (Hard)"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            q.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-amber-50 text-amber-700 border border-amber-200/60"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              q.status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {q.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openPreviewModal(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Xem thử / Làm thử câu này"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Chỉnh sửa câu hỏi"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmQuestion(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DẠNG THẺ (CARD VIEW) */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedQuestions.map((q) => {
            const isChecked = selectedIds.includes(q.id);

            return (
              <div
                key={q.id}
                className={`group rounded-2xl border bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                  isChecked
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-slate-200/90 hover:border-blue-400"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-600 font-mono">
                        {q.part}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono font-semibold">
                        {q.code || `#${q.id}`}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.difficulty === "Easy"
                          ? "bg-emerald-50 text-emerald-700"
                          : q.difficulty === "Medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-3">
                    {q.questionText}
                  </p>

                  {q.passage && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 line-clamp-3 italic">
                      {q.passage}
                    </div>
                  )}

                  {/* Options List */}
                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                          opt.isCorrect
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                            : "bg-slate-50 border-slate-200/70 text-slate-700 font-medium"
                        }`}
                      >
                        <span className="truncate">
                          <strong>{opt.id}.</strong> {opt.text}
                        </span>
                        {opt.isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[140px]">
                    {q.skill}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openPreviewModal(q)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Làm thử
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(q)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmQuestion(q)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PHÂN TRANG (PAGINATION) */}
      {filteredQuestions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-xs">
          <div className="text-slate-500 font-medium">
            Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} trên tổng số{" "}
            <strong className="text-slate-900 font-bold">{totalItems}</strong> câu hỏi
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Trước
            </button>

            <span className="px-3 py-1.5 font-bold text-slate-900">
              Trang {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Sau
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: XEM THỬ / LÀM THỬ CÂU HỎI (PREVIEW QUIZ MODAL) ================= */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setPreviewQuestion(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono bg-blue-50 px-2 py-0.5 rounded">
                  {previewQuestion.part}
                </span>
                <span className="text-xs font-bold text-slate-500">• {previewQuestion.skill}</span>
                <span className="text-xs font-bold text-emerald-600">• Độ khó: {previewQuestion.difficulty}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Thử Nghiệm Câu Hỏi ({previewQuestion.code || previewQuestion.id})
              </h3>
            </div>

            {/* Ảnh nếu có (Part 1) */}
            {previewQuestion.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-60 flex items-center justify-center bg-slate-100">
                <img
                  src={previewQuestion.imageUrl}
                  alt="Part 1 Photograph"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Audio nếu có */}
            {previewQuestion.audioUrl && (
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  <span>Âm thanh câu hỏi trích đoạn</span>
                </div>
                <button
                  type="button"
                  onClick={() => playAudio(previewQuestion.audioUrl!)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 fill-white" />
                  Phát âm thanh
                </button>
              </div>
            )}

            {/* Đoạn văn nếu có (Part 6, 7) */}
            {previewQuestion.passage && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 leading-relaxed">
                <p className="font-bold text-slate-500 uppercase text-[10px]">Đoạn văn đọc hiểu:</p>
                <p className="whitespace-pre-line">{previewQuestion.passage}</p>
              </div>
            )}

            {/* Câu hỏi */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                {previewQuestion.questionText}
              </p>
            </div>

            {/* 4 Phương án */}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {previewQuestion.options.map((opt) => {
                const isSelected = userSelectedOption === opt.id;
                const isCorrect = opt.id === previewQuestion.correctAnswer;

                let btnStyle = "bg-white border-slate-200 text-slate-800 hover:bg-slate-50";
                if (showExplanation) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-rose-50 border-rose-500 text-rose-900";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20";
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={showExplanation}
                    onClick={() => setUserSelectedOption(opt.id)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-2.5 cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          showExplanation && isCorrect
                            ? "bg-emerald-600 text-white"
                            : showExplanation && isSelected && !isCorrect
                            ? "bg-rose-600 text-white"
                            : isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>

                    {showExplanation && isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {showExplanation && isSelected && !isCorrect && (
                      <X className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Giải thích chi tiết khi bấm kiểm tra */}
            {showExplanation && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2 text-xs text-blue-950 animate-in fade-in duration-150">
                <div className="font-bold flex items-center gap-2 text-sm">
                  {userSelectedOption === previewQuestion.correctAnswer ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Bạn đã trả lời chính xác!
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Đáp án đúng là {previewQuestion.correctAnswer}
                    </span>
                  )}
                </div>
                <p className="leading-relaxed font-medium text-slate-700">
                  <strong>Giải thích:</strong> {previewQuestion.explanation}
                </p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                {userSelectedOption ? `Đã chọn: Phương án ${userSelectedOption}` : "Hãy chọn 1 phương án"}
              </span>

              <div className="flex items-center gap-2.5">
                {!showExplanation ? (
                  <button
                    type="button"
                    disabled={!userSelectedOption}
                    onClick={() => setShowExplanation(true)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Kiểm tra đáp án
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setUserSelectedOption(null);
                      setShowExplanation(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Làm lại
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewQuestion(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: THÊM / CHỈNH SỬA CÂU HỎI (ADD / EDIT MODAL) ================= */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  {editingQuestion ? "Chỉnh Sửa Câu Hỏi" : "Thêm Câu Hỏi Mới Vào Ngân Hàng"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phần thi (Part) *</label>
                  <select
                    value={formPart}
                    onChange={(e) => setFormPart(e.target.value as QuestionPart)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Part 1">Part 1 (Hình ảnh)</option>
                    <option value="Part 2">Part 2 (Hỏi đáp)</option>
                    <option value="Part 3">Part 3 (Hội thoại)</option>
                    <option value="Part 4">Part 4 (Bài nói)</option>
                    <option value="Part 5">Part 5 (Câu đơn)</option>
                    <option value="Part 6">Part 6 (Điền đoạn)</option>
                    <option value="Part 7">Part 7 (Đoạn văn)</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Kỹ năng đánh giá</label>
                  <select
                    value={formSkill}
                    onChange={(e) => setFormSkill(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                  >
                    {DEFAULT_SKILLS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Độ khó</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as QuestionDifficulty)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Easy">Dễ (Easy)</option>
                    <option value="Medium">Trung bình</option>
                    <option value="Hard">Khó (Hard)</option>
                  </select>
                </div>
              </div>

              {/* Ngữ cảnh hoặc đoạn văn (nếu là Part 3, 4, 6, 7) */}
              {(formPart === "Part 3" || formPart === "Part 4" || formPart === "Part 6" || formPart === "Part 7") && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Đoạn văn / Bài đọc / Lời thoại (Passage)</label>
                  <textarea
                    rows={3}
                    placeholder="Nhập nội dung đoạn văn hoặc bối cảnh trích dẫn..."
                    value={formPassage}
                    onChange={(e) => setFormPassage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              )}

              {/* URL ảnh & URL audio nếu có (Part 1, 2, 3, 4) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Liên kết Ảnh (Image URL - Part 1)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/photo.jpg"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Liên kết Âm thanh (Audio URL - Part 1-4)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/audio.mp3"
                    value={formAudioUrl}
                    onChange={(e) => setFormAudioUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Nội dung câu hỏi */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nội dung câu hỏi *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="ví dụ: Look at the photograph and choose the statement... hoặc All members must submit..."
                  value={formQuestionText}
                  onChange={(e) => setFormQuestionText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              {/* 4 Phương án A, B, C, D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Phương án A *</label>
                  <input
                    type="text"
                    required
                    value={formOptA}
                    onChange={(e) => setFormOptA(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Phương án B *</label>
                  <input
                    type="text"
                    required
                    value={formOptB}
                    onChange={(e) => setFormOptB(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Phương án C</label>
                  <input
                    type="text"
                    value={formOptC}
                    onChange={(e) => setFormOptC(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Phương án D</label>
                  <input
                    type="text"
                    value={formOptD}
                    onChange={(e) => setFormOptD(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Lựa chọn đáp án đúng */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Đáp án chính xác *</label>
                <div className="flex gap-3">
                  {(["A", "B", "C", "D"] as const).map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                        formCorrectAnswer === opt
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="formCorrectAnswer"
                        value={opt}
                        checked={formCorrectAnswer === opt}
                        onChange={() => setFormCorrectAnswer(opt)}
                        className="hidden"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Lời giải thích & Nút AI Generate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Lời giải thích chi tiết</label>
                  <button
                    type="button"
                    disabled={aiGenerating}
                    onClick={handleGenerateAiHelp}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiGenerating ? "AI đang phân tích..." : "AI Gợi ý giải thích"}
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="Giải thích ngữ pháp, từ vựng và lý do chọn đáp án..."
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              {/* Trạng thái xuất bản */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Trạng thái câu hỏi</label>
                <div className="flex gap-3">
                  <label
                    className={`flex-1 p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                      formStatus === "PUBLISHED"
                        ? "bg-blue-50 border-blue-500 text-blue-800"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="formStatus"
                      value="PUBLISHED"
                      checked={formStatus === "PUBLISHED"}
                      onChange={() => setFormStatus("PUBLISHED")}
                      className="hidden"
                    />
                    Xuất bản ngay
                  </label>
                  <label
                    className={`flex-1 p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                      formStatus === "DRAFT"
                        ? "bg-amber-50 border-amber-500 text-amber-800"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="formStatus"
                      value="DRAFT"
                      checked={formStatus === "DRAFT"}
                      onChange={() => setFormStatus("DRAFT")}
                      className="hidden"
                    />
                    Lưu bản nháp
                  </label>
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingQuestion ? "Cập nhật câu hỏi" : "Lưu vào ngân hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: XÁC NHẬN XÓA 1 CÂU HỎI ================= */}
      {deleteConfirmQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Xác nhận xóa câu hỏi?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn có chắc muốn xóa câu hỏi{" "}
                <strong className="text-slate-900 font-bold">
                  {deleteConfirmQuestion.code || deleteConfirmQuestion.id}
                </strong>{" "}
                khỏi ngân hàng không? Thao tác này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmQuestion(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDeleteSingle}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: XÁC NHẬN XÓA HÀNG LOẠT ================= */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Xóa các câu hỏi đã chọn?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn có chắc chắn muốn xóa{" "}
                <strong className="text-slate-900 font-bold">{selectedIds.length}</strong> câu hỏi đã chọn
                khỏi hệ thống?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setBulkDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Xóa tất cả đã chọn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
