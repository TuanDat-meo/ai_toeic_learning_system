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
  ArrowLeft,
  Pause,
  Bell,
  BellOff,
  BookOpen,
  XCircle,
  Star,
  MessageSquare,
  EyeOff,
  Flag,
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
  const [showScript, setShowScript] = useState(false);
  const [showExplanationDetails, setShowExplanationDetails] = useState(true);
  const [showVocabSection, setShowVocabSection] = useState(true);
  const [isVocabExpanded, setIsVocabExpanded] = useState(true);
  const [addedVocabItems, setAddedVocabItems] = useState<string[]>([]);
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

  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<"0.8" | "1.0" | "1.2">("1.0");

  const playSfx = (type?: "correct" | "wrong" | "click") => {
    if (!isSfxEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Ignore
    }
  };

  // Sound synthesis / audio play
  const playAudio = (textOrUrl: string) => {
    if (!isSfxEnabled) return; // Silent when muted
    if (textOrUrl.startsWith("http")) {
      const audio = new Audio(textOrUrl);
      audio.playbackRate = parseFloat(audioSpeed);
      audio.play().catch(() => {
        showToast("Âm thanh mô phỏng đang phát...");
      });
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textOrUrl);
      utterance.lang = "en-US";
      utterance.rate = parseFloat(audioSpeed);
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
    setShowScript(false);
    setShowExplanationDetails(true);
    setShowVocabSection(true);
    setIsVocabExpanded(true);
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

      {/* ================= MODAL 1: XEM THỬ / LÀM THỬ CÂU HỎI (PREVIEW QUIZ MODAL - FULLSCREEN DUAL-PANE) ================= */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150 font-sans text-slate-800">
          <div className="bg-white w-full h-full flex flex-col overflow-hidden">
            {/* Header Modal - Fullscreen Blue Header */}
            <header className="h-16 bg-blue-600 text-white px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-md select-none">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    setPreviewQuestion(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Thoát</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-700/90 border border-blue-400/40 text-white text-xs font-extrabold tracking-wide">
                    {previewQuestion.part === "Part 1" && "Part 1 • Mô tả hình ảnh"}
                    {previewQuestion.part === "Part 2" && "Part 2 • Hỏi & Đáp"}
                    {previewQuestion.part === "Part 3" && "Part 3 • Hội thoại ngắn"}
                    {previewQuestion.part === "Part 4" && "Part 4 • Bài nói ngắn"}
                    {previewQuestion.part === "Part 5" && "Part 5 • Hoàn thành câu"}
                    {previewQuestion.part === "Part 6" && "Part 6 • Điền đoạn văn"}
                    {previewQuestion.part === "Part 7" && "Part 7 • Đọc hiểu văn bản"}
                  </span>
                  <span className="text-xs font-bold text-blue-100 font-mono bg-blue-700/60 px-2.5 py-1 rounded-full border border-blue-400/30">
                    {previewQuestion.code || previewQuestion.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-blue-700/90 text-white text-xs font-bold border border-blue-400/30">
                  {previewQuestion.skill}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-extrabold shadow-2xs">
                  Độ khó: {previewQuestion.difficulty}
                </span>

                {/* Nút Chuông âm thanh */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !isSfxEnabled;
                    setIsSfxEnabled(next);
                    if (!next) {
                      setIsPlayingAudio(false);
                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                      }
                    } else {
                      playSfx("click");
                    }
                    showToast(next ? "🔊 Đã bật âm thanh 🔔" : "🔕 Đã tắt âm thanh");
                  }}
                  className={`p-2 rounded-full transition cursor-pointer ${
                    isSfxEnabled ? "bg-amber-400 text-amber-950 shadow-xs" : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                  title={isSfxEnabled ? "Đang bật âm thanh - Bấm để tắt" : "Đang tắt âm thanh - Bấm để bật"}
                >
                  {isSfxEnabled ? <Bell className="w-4 h-4 text-amber-950" /> : <BellOff className="w-4 h-4 text-white" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    setPreviewQuestion(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Body 2 Cột Dual-Pane chuẩn như Listening & Reading & Mock Tests */}
            {(() => {
              const cleanQuestionText = previewQuestion.questionText
                ? previewQuestion.questionText.replace(/^Audio Prompt:\s*/i, "")
                : "";
              const isPart1 = previewQuestion.part === "Part 1";
              const isPart2 = previewQuestion.part === "Part 2";
              const hideOptionText = (isPart1 || isPart2) && !showExplanation && !showScript;

              return (
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
                  
                  {/* CỘT TRÁI (LEFT PANE) */}
                  <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-[#fafafa] border-r border-slate-200/80 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Yêu cầu bài tập ({previewQuestion.part})
                    </div>

                    {/* PART 1: HÌNH ẢNH MINH HỌA */}
                    {previewQuestion.part === "Part 1" && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-800 leading-relaxed">
                          Quan sát bức ảnh bên dưới và chọn câu mô tả chính xác nhất hành động/trạng thái trong hình:
                        </h2>

                        {previewQuestion.imageUrl && (
                          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-center overflow-hidden">
                            <img
                              src={previewQuestion.imageUrl}
                              alt="Part 1 Photograph"
                              className="max-h-[380px] w-auto max-w-full rounded-xl object-contain"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* PART 2: AUDIO PROMPT & HƯỚNG DẪN */}
                    {previewQuestion.part === "Part 2" && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-800 leading-relaxed">
                          Lắng nghe câu hỏi/câu nói ngắn và chọn 1 trong 3 câu phản hồi thích hợp nhất (A, B hoặc C):
                        </h2>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-800 uppercase tracking-wider">
                            <Volume2 className="w-4 h-4 text-blue-600" />
                            Audio Prompt (Nội dung nghe câu hỏi)
                          </div>
                          <p className="text-sm font-bold text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
                            {cleanQuestionText}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* PART 3 & 4: SCRIPT HỘI THOẠI / BÀI NÓI */}
                    {(previewQuestion.part === "Part 3" || previewQuestion.part === "Part 4") && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-800 leading-relaxed">
                          Nghe đoạn hội thoại/bài nói ngắn và tham khảo Lời thoại Script bên dưới để chọn đáp án đúng:
                        </h2>

                        {previewQuestion.passage && (
                          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
                            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                              Audio Script (Lời thoại bài nghe):
                            </p>
                            <div className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                              {previewQuestion.passage}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* PART 5: HOÀN THÀNH CÂU */}
                    {previewQuestion.part === "Part 5" && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-800 leading-relaxed">
                          Đọc câu hỏi bên dưới và chọn 1 từ/cụm từ thích hợp nhất để điền vào chỗ trống:
                        </h2>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                          <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 font-extrabold text-xs">
                            Câu hỏi Part 5
                          </span>
                          <p className="text-base font-bold text-slate-900 leading-relaxed pt-1">
                            {cleanQuestionText}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* PART 6 & 7: ĐOẠN VĂN ĐỌC HIỂU */}
                    {(previewQuestion.part === "Part 6" || previewQuestion.part === "Part 7") && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-800 leading-relaxed">
                          Đọc kỹ văn bản bên dưới để tìm thông tin trả lời câu hỏi:
                        </h2>

                        {previewQuestion.passage && (
                          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                            <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 font-extrabold text-xs uppercase tracking-wider">
                              Văn bản đọc hiểu ({previewQuestion.part})
                            </span>
                            <div className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-xl border border-slate-200">
                              {previewQuestion.passage}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TRÌNH PHÁT AUDIO CHO CÁC PART CÓ ÂM THANH */}
                    {previewQuestion.audioUrl && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                playSfx("click");
                                setIsPlayingAudio(!isPlayingAudio);
                                playAudio(previewQuestion.audioUrl!);
                              }}
                              className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition cursor-pointer"
                            >
                              {isPlayingAudio ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 ml-0.5 fill-white" />}
                            </button>
                            <div>
                              <p className="text-xs font-bold text-slate-800">Bấm nghe âm thanh câu hỏi</p>
                              <p className="text-[11px] text-slate-400">Nghe lại nhiều lần nếu cần</p>
                            </div>
                          </div>

                          <span className="font-mono text-xs font-bold text-slate-600 shrink-0">
                            00:15
                          </span>
                        </div>

                        {/* Tốc độ phát audio */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-600">Tốc độ phát:</span>
                          <div className="flex items-center gap-2">
                            {(["0.8", "1.0", "1.2"] as const).map((spd) => (
                              <button
                                key={spd}
                                type="button"
                                onClick={() => {
                                  playSfx("click");
                                  setAudioSpeed(spd);
                                  showToast(`Đã đổi tốc độ phát sang ${spd}x`);
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  audioSpeed === spd
                                    ? "bg-blue-600 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {spd}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CỘT PHẢI (RIGHT PANE): CÂU HỎI, CÁC ĐÁP ÁN & GIẢI THÍCH */}
                  <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white flex flex-col justify-between space-y-6">
                    <div className="space-y-6">
                      {/* Khung nội dung câu hỏi & Dịch câu hỏi (Ảnh 3 Style) */}
                      <div className="space-y-3">
                        {/* Thanh Tiêu đề Câu Hỏi: Level Badge, Hỏi bài, Favorite Star */}
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold shadow-2xs">
                            {previewQuestion.difficulty === "Easy" ? "Lv.1" : previewQuestion.difficulty === "Hard" ? "Lv.3" : "Lv.2"}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => showToast("Đã gửi yêu cầu hỏi bài đến giảng viên/AI!")}
                              className="px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                              <span>Hỏi bài</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast("Đã lưu câu hỏi vào danh sách yêu thích! ⭐")}
                              className="p-1.5 rounded-xl border border-slate-200 text-amber-500 hover:bg-slate-50 transition cursor-pointer"
                            >
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            </button>
                          </div>
                        </div>

                        {/* Nội dung chính câu hỏi */}
                        {previewQuestion.part === "Part 2" ? (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                              Câu hỏi (Part 2):
                            </span>
                            <p className="text-sm font-bold text-slate-900 leading-relaxed">
                              {cleanQuestionText}
                            </p>
                          </div>
                        ) : previewQuestion.part !== "Part 1" ? (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <p className="text-sm font-bold text-slate-900 leading-relaxed">
                              {cleanQuestionText}
                            </p>
                          </div>
                        ) : null}

                        {/* Dịch nghĩa câu hỏi tiếng Việt (Bilingual translation - Ảnh 3) */}
                        {showExplanation && (
                          <div className="border-l-3 border-blue-500 pl-3 py-2.5 text-xs font-semibold text-blue-800 bg-blue-50/80 rounded-r-xl animate-in fade-in duration-200 leading-relaxed">
                            {previewQuestion.part === "Part 1" && "Bức ảnh thể hiện rõ người phụ nữ đang tập trung gõ phím làm việc tại bàn máy tính ('She is working at a computer workstation')."}
                            {previewQuestion.part === "Part 2" && "Tôi nên cất giữ các hóa đơn lô hàng mới được phê duyệt ở đâu?"}
                            {(previewQuestion.part === "Part 3" || previewQuestion.part === "Part 4") && "Người phụ nữ đề nghị làm gì để giải quyết vấn đề trước mắt?"}
                            {previewQuestion.part === "Part 5" && "Khoản hoàn trả chi phí đi lại sẽ được bao gồm trong phiếu lương ngày 1 tháng 10 của bạn."}
                            {(previewQuestion.part === "Part 6" || previewQuestion.part === "Part 7") && "Đọc kỹ văn bản bên dưới để tìm thông tin trả lời câu hỏi."}
                          </div>
                        )}
                      </div>

                      {/* CÁC PHƯƠNG ÁN ĐÁP ÁN (Chuẩn thiết kế Ảnh 3) */}
                      <div className="space-y-3">
                        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                          Chọn phương án đúng:
                        </p>

                        <div className="space-y-3">
                          {previewQuestion.options
                            .filter((opt) => previewQuestion.part !== "Part 2" || opt.id !== "D")
                            .map((opt) => {
                              const isSelected = userSelectedOption === opt.id;
                              const isCorrect = opt.id === previewQuestion.correctAnswer;
                              const isPart1Or2 = previewQuestion.part === "Part 1" || previewQuestion.part === "Part 2";
                              const hideScriptBeforeCheck = isPart1Or2 && !showExplanation;

                              const cleanOptText = opt.text ? opt.text.replace(/^[A-D][\.\:\)]\s*/i, "").trim() : "";
                              const mainText = hideScriptBeforeCheck ? "" : (cleanOptText || opt.text || "");

                              let subtext = "";
                              if (previewQuestion.part === "Part 1") {
                                if (opt.id === "A") subtext = "| Dịch: Cô ấy đang treo một chiếc bảng trắng lên tường";
                                if (opt.id === "B") subtext = "| Dịch: Cô ấy đang làm việc tại bàn máy tính làm việc";
                                if (opt.id === "C") subtext = "| Dịch: Cô ấy đang sắp xếp tài liệu giấy vào tủ kim loại";
                                if (opt.id === "D") subtext = "| Dịch: Cô ấy đang trả lời một cuộc điện thoại gọi đến";
                              } else if (previewQuestion.part === "Part 2") {
                                if (opt.id === "A") subtext = "| Dịch: Ở tủ hồ sơ ngay bên cạnh bàn lễ tân";
                                if (opt.id === "B") subtext = "| Dịch: Có, đơn giao hàng đã đến vào chiều qua";
                                if (opt.id === "C") subtext = "| Dịch: Khoảng 50 đô la cho mỗi hóa đơn";
                              } else if (previewQuestion.part === "Part 5") {
                                if (opt.id === "A") subtext = "| (pron): bạn";
                                if (opt.id === "B") subtext = "| (adj sở hữu): của bạn";
                                if (opt.id === "C") subtext = "| (pron sở hữu): cái của bạn";
                                if (opt.id === "D") subtext = "| (pron): chính bạn";
                              } else if (previewQuestion.part === "Part 3" || previewQuestion.part === "Part 4") {
                                if (opt.id === "A") subtext = "| Dịch: Cung cấp thiết bị thay thế";
                                if (opt.id === "B") subtext = "| Dịch: Hoàn lại tiền cho khách hàng";
                                if (opt.id === "C") subtext = "| Dịch: Sửa chữa linh kiện bị hỏng";
                                if (opt.id === "D") subtext = "| Dịch: Hủy bỏ hợp đồng dịch vụ";
                              } else {
                                if (opt.id === "A") subtext = "| Dịch: Thông báo thay đổi chính sách công ty";
                                if (opt.id === "B") subtext = "| Dịch: Yêu cầu xác nhận đơn đặt hàng";
                                if (opt.id === "C") subtext = "| Dịch: Cung cấp lịch trình bảo trì thiết bị";
                                if (opt.id === "D") subtext = "| Dịch: Gửi lời mời tham dự hội thảo";
                              }

                              let cardStyle = "border-slate-200 bg-white text-slate-800 hover:bg-slate-50";
                              let iconNode = (
                                <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 transition">
                                  {opt.id}
                                </span>
                              );

                              if (showExplanation) {
                                if (isCorrect) {
                                  cardStyle = "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                                  iconNode = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;
                                } else if (isSelected) {
                                  cardStyle = "border-rose-400 bg-rose-50/90 text-rose-950 font-bold ring-2 ring-rose-400/20";
                                  iconNode = <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
                                } else {
                                  cardStyle = "border-slate-200 bg-white text-slate-700 opacity-75";
                                }
                              } else if (isSelected) {
                                cardStyle = "border-2 border-blue-600 bg-blue-50/90 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-xs";
                              }

                              return (
                                <div
                                  key={opt.id}
                                  onClick={() => {
                                    if (showExplanation) return;
                                    playSfx("click");
                                    setUserSelectedOption(opt.id);
                                  }}
                                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all duration-150 cursor-pointer ${cardStyle}`}
                                >
                                  {iconNode}

                                  <div className="flex-1 space-y-1">
                                    <span className="text-sm font-semibold">
                                      ({opt.id}){mainText ? ` ${mainText}` : ""}
                                    </span>
                                    {showExplanation && subtext && (
                                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 pt-0.5">
                                        <span>{subtext}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* NÚT KIỂM TRA ĐÁP ÁN */}
                      {!showExplanation ? (
                        <button
                          type="button"
                          disabled={!userSelectedOption}
                          onClick={() => {
                            playSfx("click");
                            setShowExplanation(true);
                          }}
                          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-sm font-extrabold transition-all shadow-md cursor-pointer active:scale-95"
                        >
                          Kiểm tra đáp án
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            setUserSelectedOption(null);
                            setShowExplanation(false);
                          }}
                          className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Làm lại câu hỏi này
                        </button>
                      )}

                      {/* GIẢI THÍCH CHI TIẾT & TỪ VỰNG NÊN HỌC KHI KIỂM TRA (Images 2 & 3) */}
                      {showExplanation && (() => {
                        const vocabList = (previewQuestion as any).vocabList || (
                          previewQuestion.part === "Part 1"
                            ? [
                                {
                                  word: "workstation",
                                  pos: "n",
                                  level: "B1",
                                  ipa: "/ˈwɜːrksteɪʃn/",
                                  meaning: "bàn làm việc máy tính",
                                  exampleEn: "She is sitting focused at her computer workstation.",
                                  exampleVi: "Cô ấy đang ngồi tập trung tại bàn máy tính làm việc của mình.",
                                  collocations: ["computer workstation – trạm máy tính làm việc", "workstation setup – thiết lập bàn làm việc"],
                                  synonyms: ["desk – bàn làm việc"],
                                  antonyms: ["field – ngoài trời/công trường"],
                                  wordFamily: ["work v – làm việc", "worker n – người lao động"],
                                },
                                {
                                  word: "cabinet",
                                  pos: "n",
                                  level: "B1",
                                  ipa: "/ˈkæbɪnət/",
                                  meaning: "tủ tài liệu/hồ sơ",
                                  exampleEn: "Important paper documents are organized into a metal cabinet.",
                                  exampleVi: "Tài liệu giấy quan trọng được sắp xếp vào tủ hồ sơ kim loại.",
                                  collocations: ["filing cabinet – tủ đựng hồ sơ", "cabinet drawer – ngăn kéo tủ"],
                                  synonyms: ["cupboard – tủ đựng đồ"],
                                  antonyms: [],
                                  wordFamily: [],
                                },
                                {
                                  word: "whiteboard",
                                  pos: "n",
                                  level: "A2",
                                  ipa: "/ˈwaɪtbɔːrd/",
                                  meaning: "bảng viết bút lông",
                                  exampleEn: "She is hanging a new whiteboard on the wall.",
                                  exampleVi: "Cô ấy đang treo một chiếc bảng trắng mới lên tường.",
                                  collocations: ["whiteboard marker – bút viết bảng"],
                                  synonyms: [],
                                  antonyms: [],
                                  wordFamily: [],
                                },
                              ]
                            : previewQuestion.part === "Part 2"
                            ? [
                                {
                                  word: "invoice",
                                  pos: "n",
                                  level: "B2",
                                  ipa: "/ˈɪnvɔɪs/",
                                  meaning: "hóa đơn thanh toán/giao hàng",
                                  exampleEn: "Where should I file the newly approved shipment invoices?",
                                  exampleVi: "Tôi nên cất giữ các hóa đơn lô hàng mới được phê duyệt ở đâu?",
                                  collocations: ["tax invoice – hóa đơn thuế", "paid invoice – hóa đơn đã thanh toán"],
                                  synonyms: ["bill – hóa đơn"],
                                  antonyms: [],
                                  wordFamily: ["invoicing n – việc lập hóa đơn"],
                                },
                                {
                                  word: "shipment",
                                  pos: "n",
                                  level: "B2",
                                  ipa: "/ˈʃɪpmənt/",
                                  meaning: "lô hàng, việc vận chuyển",
                                  exampleEn: "Yes, the shipment arrived yesterday afternoon.",
                                  exampleVi: "Có, đơn giao lô hàng đã đến vào chiều qua.",
                                  collocations: ["shipment tracking – theo dõi lô hàng"],
                                  synonyms: ["delivery – giao hàng"],
                                  antonyms: [],
                                  wordFamily: ["ship v – vận chuyển"],
                                },
                                {
                                  word: "approved",
                                  pos: "adj",
                                  level: "B1",
                                  ipa: "/əˈpruːvd/",
                                  meaning: "đã được phê duyệt",
                                  exampleEn: "The newly approved plan will take effect tomorrow.",
                                  exampleVi: "Kế hoạch mới được phê duyệt sẽ có hiệu lực vào ngày mai.",
                                  collocations: ["approved budget – ngân sách đã phê duyệt"],
                                  synonyms: ["authorized – được ủy quyền"],
                                  antonyms: ["rejected – bị từ chối"],
                                  wordFamily: ["approve v – phê duyệt", "approval n – sự phê duyệt"],
                                },
                              ]
                            : previewQuestion.part === "Part 5"
                            ? [
                                {
                                  word: "include",
                                  pos: "v",
                                  level: "B1",
                                  ipa: "/ɪnˈkluːd/",
                                  meaning: "bao gồm",
                                  exampleEn: "The price does not include breakfast.",
                                  exampleVi: "Giá này không bao gồm bữa sáng.",
                                  collocations: ["include tax – bao gồm thuế", "include the details – bao gồm cả chi tiết"],
                                  synonyms: ["contain – chứa"],
                                  antonyms: ["exclude – loại trừ"],
                                  wordFamily: ["including prep – bao gồm cả", "inclusion n – sự bao gồm", "inclusive adj – bao gồm tất cả"],
                                },
                                {
                                  word: "reimbursement",
                                  pos: "n",
                                  level: "B2",
                                  ipa: "/ˌriːɪmˈbɜːrsmənt/",
                                  meaning: "khoản hoàn trả chi phí",
                                  exampleEn: "Reimbursement for travel expenses will be included in your paycheck.",
                                  exampleVi: "Khoản hoàn trả chi phí đi lại sẽ được bao gồm trong phiếu lương của bạn.",
                                  collocations: ["expense reimbursement – hoàn trả chi phí", "reimbursement policy – chính sách hoàn trả"],
                                  synonyms: ["refund – tiền hoàn lại"],
                                  antonyms: [],
                                  wordFamily: ["reimburse v – hoàn lại tiền"],
                                },
                                {
                                  word: "paycheck",
                                  pos: "n",
                                  level: "B1",
                                  ipa: "/ˈpeɪtʃek/",
                                  meaning: "phiếu lương, tiền lương",
                                  exampleEn: "Reimbursement will be included in your October 1 paycheck.",
                                  exampleVi: "Khoản hoàn trả sẽ được bao gồm trong phiếu lương ngày 1 tháng 10 của bạn.",
                                  collocations: ["monthly paycheck – phiếu lương hàng tháng"],
                                  synonyms: ["salary – tiền lương"],
                                  antonyms: [],
                                  wordFamily: [],
                                },
                              ]
                            : [
                                {
                                  word: "replacement",
                                  pos: "n",
                                  level: "B2",
                                  ipa: "/rɪˈpleɪsmənt/",
                                  meaning: "sự thay thế, vật thay thế",
                                  exampleEn: "We will offer a free replacement cartridge.",
                                  exampleVi: "Chúng tôi sẽ cung cấp hộp mực thay thế miễn phí.",
                                  collocations: ["replacement part – linh kiện thay thế"],
                                  synonyms: ["substitute – vật thay thế"],
                                  antonyms: [],
                                  wordFamily: ["replace v – thay thế"],
                                },
                                {
                                  word: "supplier",
                                  pos: "n",
                                  level: "B2",
                                  ipa: "/səˈplaɪər/",
                                  meaning: "nhà cung cấp",
                                  exampleEn: "The logistics supplier responded to our inquiry.",
                                  exampleVi: "Nhà cung cấp hậu cần đã phản hồi yêu cầu của chúng tôi.",
                                  collocations: ["equipment supplier – nhà cung cấp thiết bị"],
                                  synonyms: ["vendor – nhà bán hàng"],
                                  antonyms: [],
                                  wordFamily: ["supply v/n – cung cấp/nguồn cung"],
                                },
                              ]
                        );

                        const steps = previewQuestion.part === "Part 1"
                          ? [
                              { title: "Bước 1: Quan sát bức ảnh", desc: "Xác định các chủ thể hành động và vật thể chính trong không gian phòng làm việc." },
                              { title: "Bước 2: Phân tích hành động", desc: previewQuestion.explanation || "Bức ảnh thể hiện rõ người trong hình đang thao tác làm việc với thiết bị máy tính." },
                              { title: "Bước 3: Chọn đáp án", desc: "Phương án B mô tả chính xác nhất hành động làm việc tại bàn máy tính." },
                            ]
                          : previewQuestion.part === "Part 2"
                          ? [
                              { title: "Bước 1: Xác định từ hỏi (Where)", desc: "Lắng nghe từ hỏi 'Where' chỉ vị trí/nơi chốn để loại trừ các đáp án trả lời Yes/No hay số lượng." },
                              { title: "Bước 2: Phân tích nội dung câu hỏi", desc: previewQuestion.explanation || "Hỏi vị trí cất giữ tài liệu hóa đơn lô hàng mới được phê duyệt." },
                              { title: "Bước 3: Chọn đáp án", desc: "Phương án A chỉ rõ vị trí tủ hồ sơ cạnh bàn lễ tân." },
                            ]
                          : [
                              { title: "Bước 1: Xác định dạng câu hỏi & từ loại", desc: "Phân tích cấu trúc ngữ pháp và vị trí đại từ / tính từ sở hữu cần điền vào câu." },
                              { title: "Bước 2: Phân tích ngữ cảnh & nghĩa của câu", desc: previewQuestion.explanation || "Chỗ trống nằm trước cụm danh từ 'October 1 paycheck' nên cần tính từ sở hữu 'your'." },
                              { title: "Bước 3: Chọn đáp án chính xác", desc: "Chọn tính từ sở hữu 'your' bổ nghĩa cho cụm danh từ phía sau." },
                            ];

                        return (
                          <div className="space-y-4 animate-in fade-in">
                            {/* TOGGLE 1: GIẢI THÍCH CHI TIẾT (Ảnh 2) */}
                            <div className="pt-2">
                              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Giải thích chi tiết</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    playSfx("click");
                                    setShowExplanationDetails(!showExplanationDetails);
                                  }}
                                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                                    showExplanationDetails ? "bg-blue-600" : "bg-slate-300"
                                  }`}
                                >
                                  <div
                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                      showExplanationDetails ? "translate-x-5" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>

                              {showExplanationDetails && (
                                <div className="mt-2 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-800 space-y-2.5 animate-in fade-in duration-150 shadow-2xs">
                                  {steps.map((st, i) => (
                                    <div key={i} className="space-y-0.5">
                                      <p className="font-bold text-blue-900">{st.title}</p>
                                      <p className="text-slate-600 leading-relaxed pl-2 border-l-2 border-blue-300">
                                        {st.desc}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* TOGGLE 2: TỪ VỰNG NÊN HỌC (Ảnh 1 & Ảnh 2) */}
                            <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-3 shadow-xs">
                              {/* Thanh tiêu đề chính của Từ vựng */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-extrabold text-amber-900 text-sm">
                                  <BookOpen className="w-4.5 h-4.5 text-amber-600" />
                                  <span>Từ vựng nên học</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    playSfx("click");
                                    setShowVocabSection(!showVocabSection);
                                  }}
                                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                                    showVocabSection ? "bg-blue-600" : "bg-slate-300"
                                  }`}
                                >
                                  <div
                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                      showVocabSection ? "translate-x-5" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>

                              {/* Khung nội dung danh sách từ vựng khi BẬT toggle */}
                              {showVocabSection && (
                                <div className="space-y-3 animate-in fade-in">
                                  {/* Thanh thao tác: Số lượng từ, Nút Xem chi tiết / Thu gọn, Nút Thêm tất cả */}
                                  <div className="flex items-center justify-between pt-1 pb-1 border-t border-amber-200/50">
                                    <span className="text-xs font-semibold text-slate-600">
                                      {vocabList.length} từ
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          playSfx("click");
                                          setIsVocabExpanded(!isVocabExpanded);
                                        }}
                                        className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-amber-100/70 transition cursor-pointer flex items-center gap-1.5"
                                      >
                                        {isVocabExpanded ? (
                                          <>
                                            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                                            <span>Thu gọn</span>
                                          </>
                                        ) : (
                                          <>
                                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                                            <span>Xem chi tiết</span>
                                          </>
                                        )}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          playSfx("click");
                                          setAddedVocabItems(vocabList.map((v: any) => v.word));
                                          showToast(`Đã thêm tất cả ${vocabList.length} từ vào sổ từ vựng! ✨`);
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Thêm tất cả ({vocabList.length})</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Danh sách các từ vựng */}
                                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                    {vocabList.map((v: any, idx: number) => {
                                      const isSaved = addedVocabItems.includes(v.word);

                                      // Dạng xem chi tiết (Ảnh 2)
                                      if (isVocabExpanded) {
                                        return (
                                          <div
                                            key={idx}
                                            className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-3 transition"
                                          >
                                            {/* Dòng 1: Từ, Loại từ, Cấp độ, Nút lưu */}
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                  <span className="font-extrabold text-slate-900 text-base">{v.word}</span>
                                                  <span className="italic font-serif text-slate-500 text-xs">{v.pos}</span>
                                                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold text-[10px]">
                                                    {v.level}
                                                  </span>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                                                  <span>{v.ipa}</span>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      playSfx("click");
                                                      playAudio(v.word);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 p-0.5 rounded transition cursor-pointer"
                                                    title="Nghe phát âm"
                                                  >
                                                    <Volume2 className="w-3.5 h-3.5 inline" />
                                                  </button>
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                  type="button"
                                                  onClick={() => showToast(`Đã ghim từ "${v.word}"!`)}
                                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-slate-50 transition cursor-pointer"
                                                  title="Đánh dấu từ"
                                                >
                                                  <Flag className="w-3.5 h-3.5" />
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    playSfx("click");
                                                    if (isSaved) {
                                                      setAddedVocabItems(addedVocabItems.filter((item) => item !== v.word));
                                                    } else {
                                                      setAddedVocabItems([...addedVocabItems, v.word]);
                                                      showToast(`Đã lưu từ "${v.word}" vào sổ từ vựng!`);
                                                    }
                                                  }}
                                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                                    isSaved
                                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                      : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                                                  }`}
                                                >
                                                  {isSaved ? (
                                                    <>
                                                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã lưu
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Plus className="w-3.5 h-3.5" /> Thêm
                                                    </>
                                                  )}
                                                </button>
                                              </div>
                                            </div>

                                            {/* Định nghĩa nghĩa tiếng Việt */}
                                            <p className="text-sm font-bold text-slate-800 leading-snug">{v.meaning}</p>

                                            {/* Ví dụ mẫu (Example Sentence) */}
                                            {v.exampleEn && (
                                              <div className="p-3 rounded-xl bg-slate-50 border border-slate-150/80 text-xs space-y-1">
                                                <p className="text-slate-800 font-medium">{v.exampleEn}</p>
                                                <p className="text-slate-500">{v.exampleVi}</p>
                                              </div>
                                            )}

                                            {/* Cụm từ (Collocations) */}
                                            {v.collocations && v.collocations.length > 0 && (
                                              <div className="space-y-1 text-xs pt-1">
                                                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Cụm từ</span>
                                                <div className="space-y-0.5 text-slate-700">
                                                  {v.collocations.map((c: string, cIdx: number) => (
                                                    <p key={cIdx} className="leading-tight">• {c}</p>
                                                  ))}
                                                </div>
                                              </div>
                                            )}

                                            {/* Đồng nghĩa & Trái nghĩa */}
                                            {((v.synonyms && v.synonyms.length > 0) || (v.antonyms && v.antonyms.length > 0)) && (
                                              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                                                {v.synonyms && v.synonyms.length > 0 && (
                                                  <div>
                                                    <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Đồng nghĩa</span>
                                                    <p className="text-slate-700 text-[11px] font-medium">{v.synonyms.join(", ")}</p>
                                                  </div>
                                                )}
                                                {v.antonyms && v.antonyms.length > 0 && (
                                                  <div>
                                                    <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wider">Trái nghĩa</span>
                                                    <p className="text-slate-700 text-[11px] font-medium">{v.antonyms.join(", ")}</p>
                                                  </div>
                                                )}
                                              </div>
                                            )}

                                            {/* Họ từ (Word Family) */}
                                            {v.wordFamily && v.wordFamily.length > 0 && (
                                              <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Họ từ</span>
                                                <div className="space-y-0.5 text-slate-700 text-[11px]">
                                                  {v.wordFamily.map((wf: string, wfIdx: number) => (
                                                    <p key={wfIdx}>• {wf}</p>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }

                                      // Dạng gọn (Ảnh 1)
                                      return (
                                        <div
                                          key={idx}
                                          className="p-3 rounded-xl border border-amber-200/80 bg-white flex items-center justify-between gap-3 text-xs shadow-2xs"
                                        >
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <span className="font-extrabold text-slate-900 text-sm">{v.word}</span>
                                              <span className="italic text-slate-500 font-semibold">{v.pos}</span>
                                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800">
                                                {v.level}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                                              <span className="font-mono text-slate-500">{v.ipa}</span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  playSfx("click");
                                                  playAudio(v.word);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 cursor-pointer p-0.5 rounded hover:bg-blue-50 transition"
                                                title="Phát âm từ này"
                                              >
                                                <Volume2 className="w-3.5 h-3.5" />
                                              </button>
                                              <span className="text-slate-300">•</span>
                                              <span className="font-medium text-slate-800">{v.meaning}</span>
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              playSfx("click");
                                              if (isSaved) {
                                                setAddedVocabItems(addedVocabItems.filter((item) => item !== v.word));
                                              } else {
                                                setAddedVocabItems([...addedVocabItems, v.word]);
                                                showToast(`Đã lưu từ "${v.word}" vào sổ từ vựng!`);
                                              }
                                            }}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                              isSaved
                                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                            }`}
                                          >
                                            {isSaved ? (
                                              <>
                                                <Check className="w-3 h-3 text-emerald-600" /> Đã lưu
                                              </>
                                            ) : (
                                              <>
                                                <Plus className="w-3 h-3" /> Lưu từ
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                </div>
              );
            })()}

            {/* Bottom Navigation Footer */}
            <footer className="h-14 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  showToast("Đã ghi nhận phản hồi về câu hỏi này!");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                <span>Báo lỗi câu hỏi</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    setPreviewQuestion(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition cursor-pointer shadow-xs"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </footer>
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
