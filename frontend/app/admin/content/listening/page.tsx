"use client";

import React, { useState, useMemo } from "react";
import {
  Headphones,
  Sparkles,
  Bookmark,
  FileText,
  RotateCcw,
  Trash2,
  X,
  Play,
  Pause,
  CheckCircle2,
  Languages,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Eye,
  Plus,
  Pencil,
  AlertTriangle,
  Star,
  BookOpen,
  Volume2,
  ArrowLeft,
  Clock,
  Zap,
  Grid,
  Search,
  Flag,
  Bell,
  BellOff,
  HelpCircle,
} from "lucide-react";

// --- TYPES & INTERFACES ---
export interface DictationQuestion {
  id: number;
  question?: string;
  part: "Part 1" | "Part 2" | "Part 3" | "Part 4";
  audioUrl: string;
  imageUrl?: string;
  fullTranscript: string;
  vietnameseTranslation: string;
  options?: { [key: string]: string };
  optionTranslations?: { [key: string]: string };
  correctAnswer?: string;
  explanation: string;
  trapNote?: string;
  vocabList?: {
    word: string;
    pos: string;
    level: string;
    ipa: string;
    meaning: string;
  }[];
}

export interface DictationCardData {
  id: string; // e.g. "t1-p1"
  testNumber: number; // 1, 2, 3
  part: "Part 1" | "Part 2" | "Part 3" | "Part 4";
  year: "2026" | "2024" | "2023" | "2022";
  totalQuestions: number;
  completedQuestions: number;
  status: "Chưa bắt đầu" | "Đang luyện tập" | "Đã hoàn thành";
  notesCount: number;
  vocabItems: {
    word: string;
    ipa: string;
    meaning: string;
    example: string;
  }[];
  questions: DictationQuestion[];
}

export interface LevelCategoryCardData {
  id: string;
  part: "Part 1" | "Part 2" | "Part 3" | "Part 4";
  type: "level" | "category";
  title: string;
  targetLevel?: string;
  totalQuestions: number;
  completedQuestions: number;
  correctCount: number;
  wrongCount: number;
  status: "Chưa luyện tập" | "Đang học" | "Đã hoàn thành";
  theorySummary: string;
  rules: string[];
  vocabBag: {
    word: string;
    ipa: string;
    meaning: string;
  }[];
  questions: DictationQuestion[];
}

// --- DỮ LIỆU CÂU HỎI MẪU CHO NGHE CHÉP & TRẮC NGHIỆM ---
const SAMPLE_DICTATION_QUESTIONS: DictationQuestion[] = [
  // Part 1
  {
    id: 1,
    part: "Part 1",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80",
    fullTranscript: "He's climbing a ladder.",
    vietnameseTranslation: "Anh ấy đang leo lên một chiếc thang.",
    options: {
      A: "He's standing on a rug.",
      B: "He's turning a doorknob.",
      C: "He's climbing a ladder.",
      D: "He's painting a wall.",
    },
    optionTranslations: {
      A: "Anh ấy đang đứng trên một tấm thảm.",
      B: "Anh ấy đang vặn nắm cửa.",
      C: "Anh ấy đang leo lên một chiếc thang.",
      D: "Anh ấy đang sơn một bức tường.",
    },
    correctAnswer: "C",
    explanation: "Động từ 'is climbing a ladder' mô tả chính xác người đàn ông đang bước leo lên chiếc thang trong hình.",
    trapNote: "Chú ý quan sát bức tranh: Người đàn ông đang ở trên nấc thang chứ không đứng dưới thảm hay sơn tường.",
    vocabList: [
      { word: "rug", pos: "n", level: "B2", ipa: "/rʌɡ/", meaning: "tấm thảm" },
      { word: "doorknob", pos: "n", level: "C1", ipa: "/ˈdɔːrnɑːb/", meaning: "nắm cửa" },
      { word: "climb", pos: "v", level: "B1", ipa: "/klaɪm/", meaning: "leo" },
      { word: "ladder", pos: "n", level: "B1", ipa: "/ˈlædər/", meaning: "cái thang" },
    ],
  },
  {
    id: 2,
    part: "Part 1",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    fullTranscript: "Cardboard boxes are stacked neatly in the distribution warehouse.",
    vietnameseTranslation: "Các thùng bìa các-tông được xếp chồng gọn gàng trong kho phân phối.",
    options: {
      A: "A forklift is unloading cargo from the ship.",
      B: "Cardboard boxes are stacked neatly in the warehouse.",
      C: "Workers are inspecting conveyor machinery.",
      D: "A delivery van is parked beside the platform.",
    },
    correctAnswer: "B",
    explanation: "Hình ảnh tập trung vào các thùng hàng carton được xếp ngay ngắn thành nhiều tầng trong kho bãi.",
    trapNote: "Bẫy danh từ liên quan: Nhắc đến 'warehouse' dễ nghĩ đến 'forklift' (xe nâng) nhưng trong tranh không có xe nâng.",
  },
  // Part 2
  {
    id: 3,
    part: "Part 2",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    fullTranscript: "When is the quarterly financial audit report due for submission?",
    vietnameseTranslation: "Khi nào bản báo cáo kiểm toán tài chính hàng quý đến hạn phải nộp?",
    options: {
      A: "Yes, our team audited it yesterday.",
      B: "By five o'clock this Friday afternoon.",
      C: "In the conference hall on the fifth floor.",
    },
    correctAnswer: "B",
    explanation: "Câu hỏi bắt đầu bằng 'When' (Khi nào) hỏi thời hạn -> 'By five o'clock this Friday afternoon' là câu trả lời trực tiếp.",
    trapNote: "Bẫy Yes/No: Câu hỏi có từ để hỏi Wh- không bao giờ trả lời bằng Yes hoặc No (loại A ngay lập tức).",
  },
  {
    id: 4,
    part: "Part 2",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    fullTranscript: "Why was the regional sales conference postponed until next month?",
    vietnameseTranslation: "Tại sao hội nghị bán hàng khu vực lại bị hoãn đến tháng sau?",
    options: {
      A: "Severe storm warnings disrupted regional airline schedules.",
      B: "No, we already booked eighty hotel rooms.",
      C: "Mr. Campbell is the keynote speaker.",
    },
    correctAnswer: "A",
    explanation: "Câu hỏi 'Why' hỏi lý do -> (A) giải thích do cảnh báo bão lớn làm gián đoạn lịch trình các chuyến bay.",
    trapNote: "Bẫy từ cùng chủ đề: Nhắc đến conference đưa ra keynote speaker để gây nhầm lẫn nội dung.",
  },
  // Part 3 - Set 83-85
  {
    id: 5,
    part: "Part 3",
    question: "What type of business does the speaker own?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    fullTranscript: "Welcome to Pottery Studio. Today we will demonstrate crafting ceramic bowls.",
    vietnameseTranslation: "Chào mừng đến với xưởng xốm Pottery Studio.",
    options: {
      A: "A tea shop",
      B: "A childcare center",
      C: "A pottery studio",
      D: "A party supply store",
    },
    optionTranslations: {
      A: "Một quán trà",
      B: "Một trung tâm chăm sóc trẻ em",
      C: "Một xưởng làm đồ gốm",
      D: "Một cửa hàng tiệc tùng",
    },
    correctAnswer: "C",
    explanation: "Bài nói bắt đầu bằng việc chào mừng tới 'Pottery Studio'.",
    vocabList: [
      { word: "pottery", pos: "n", level: "B2", ipa: "/ˈpɑːtəri/", meaning: "nghề làm gốm, xưởng gốm" },
      { word: "demonstrate", pos: "v", level: "B2", ipa: "/ˈdemənstreɪt/", meaning: "trình diễn, hướng dẫn" },
    ],
  },
  {
    id: 6,
    part: "Part 3",
    question: "What does the speaker imply when she says, \"you've worked here for five months now\"?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    fullTranscript: "You've worked here for five months now, so you should be familiar with this.",
    vietnameseTranslation: "Bạn đã làm việc ở đây 5 tháng rồi, nên bạn đã đủ khả năng thực hiện.",
    options: {
      A: "The listener is capable of doing a task.",
      B: "The listener should apply for a promotion.",
      C: "The listener is taking too long to complete a project.",
      D: "The listener qualifies for a salary raise.",
    },
    optionTranslations: {
      A: "Người nghe đủ khả năng thực hiện công việc.",
      B: "Người nghe nên nộp đơn xin thăng chức.",
      C: "Người nghe tốn quá nhiều thời gian hoàn thành dự án.",
      D: "Người nghe đủ điều kiện tăng lương.",
    },
    correctAnswer: "A",
    explanation: "Câu nói ngụ ý người nghe đã làm 5 tháng nên hoàn toàn đủ khả năng tự hoàn thành nhiệm vụ.",
  },
  {
    id: 7,
    part: "Part 3",
    question: "What will the speakers do next?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    fullTranscript: "Now let's head over to the kiln room to inspect the fired clay products.",
    vietnameseTranslation: "Bây giờ chúng ta hãy cùng sang phòng lò nung để hướng dẫn kỹ thuật.",
    options: {
      A: "Inspect an oven",
      B: "Review a contract",
      C: "Clean a storage room",
      D: "Demonstrate a technique",
    },
    optionTranslations: {
      A: "Kiểm tra lò nung",
      B: "Xem xét hợp đồng",
      C: "Dọn dẹp phòng kho",
      D: "Trình diễn một kỹ thuật mới",
    },
    correctAnswer: "D",
    explanation: "Người nói mời tiếp tục theo dõi buổi thực hành trình diễn kỹ thuật.",
  },

  // Part 4 - Set 95-97
  {
    id: 8,
    part: "Part 4",
    question: "What is the main purpose of the announcement?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    fullTranscript: "Attention all staff, routine elevator maintenance is scheduled for this Friday.",
    vietnameseTranslation: "Xin chú ý, lịch bảo trì thang máy định kỳ sẽ diễn ra vào thứ Sáu.",
    options: {
      A: "To report a schedule delay",
      B: "To introduce a new department head",
      C: "To announce a facility maintenance schedule",
      D: "To invite staff to a company picnic",
    },
    optionTranslations: {
      A: "Báo cáo việc chậm lịch trình",
      B: "Giới thiệu trưởng bộ phận mới",
      C: "Thông báo lịch bảo trì cơ sở vật chất",
      D: "Mời nhân viên tham gia dã ngoại công ty",
    },
    correctAnswer: "C",
    explanation: "Thông báo về việc bảo trì thang máy tòa nhà.",
  },
  {
    id: 9,
    part: "Part 4",
    question: "According to the speaker, what should employees do before Friday?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    fullTranscript: "Please archive all client files properly before Friday noon.",
    vietnameseTranslation: "Vui lòng lưu trữ các tệp hồ sơ khách hàng trước trưa thứ Sáu.",
    options: {
      A: "Submit time sheets",
      B: "Archive client files",
      C: "Confirm hotel reservations",
      D: "Update passwords",
    },
    optionTranslations: {
      A: "Nộp bảng chấm công",
      B: "Lưu trữ tệp hồ sơ khách hàng",
      C: "Xác định đặt phòng khách sạn",
      D: "Cập nhật mật khẩu",
    },
    correctAnswer: "B",
    explanation: "Yêu cầu nhân viên lưu trữ hồ sơ client files.",
  },
  {
    id: 10,
    part: "Part 4",
    question: "What will happen at 5:00 PM?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    fullTranscript: "The main elevators will be shut down at 5:00 PM.",
    vietnameseTranslation: "Thang máy chính sẽ ngừng hoạt động lúc 5:00 chiều.",
    options: {
      A: "The elevators will be shut down",
      B: "The main lobby will be closed",
      C: "A staff meeting will commence",
      D: "A system backup will run",
    },
    optionTranslations: {
      A: "Thang máy sẽ ngừng hoạt động",
      B: "Sảnh chính sẽ bị đóng cửa",
      C: "Cuộc họp nhân viên sẽ bắt đầu",
      D: "Hệ thống sẽ chạy sao lưu",
    },
    correctAnswer: "A",
    explanation: "Thang máy chính ngắt điện bảo trì từ 5:00 chiều.",
  },
];

// --- DỮ LIỆU BAN ĐẦU CHO TAB "NGHE CHÉP" (ẢNH 1 & ẢNH 2) ---
const INITIAL_DICTATION_CARDS: DictationCardData[] = [
  // --- TEST 1 ---
  {
    id: "t1-p1",
    testNumber: 1,
    part: "Part 1",
    year: "2026",
    totalQuestions: 24,
    completedQuestions: 0,
    status: "Chưa bắt đầu",
    notesCount: 0,
    vocabItems: [
      { word: "boardroom", ipa: "/ˈbɔːrdruːm/", meaning: "Phòng họp ban giám đốc", example: "The executives gathered in the boardroom." },
      { word: "stacked", ipa: "/stækt/", meaning: "Được xếp chồng lên nhau", example: "Boxes were stacked neatly." },
    ],
    questions: [SAMPLE_DICTATION_QUESTIONS[0], SAMPLE_DICTATION_QUESTIONS[1]],
  },
  {
    id: "t1-p2",
    testNumber: 1,
    part: "Part 2",
    year: "2026",
    totalQuestions: 100,
    completedQuestions: 0,
    status: "Chưa bắt đầu",
    notesCount: 0,
    vocabItems: [
      { word: "audit", ipa: "/ˈɔːdɪt/", meaning: "Kiểm toán tài chính", example: "An annual audit is required." },
      { word: "postpone", ipa: "/poʊˈspoʊn/", meaning: "Hoãn lại lịch trình", example: "The summit was postponed." },
    ],
    questions: [SAMPLE_DICTATION_QUESTIONS[2], SAMPLE_DICTATION_QUESTIONS[3]],
  },
  {
    id: "t1-p3",
    testNumber: 1,
    part: "Part 3",
    year: "2026",
    totalQuestions: 111,
    completedQuestions: 0,
    status: "Chưa bắt đầu",
    notesCount: 0,
    vocabItems: [
      { word: "expedited", ipa: "/ˈekspədaɪtɪd/", meaning: "Hỏa tốc, xúc tiến nhanh", example: "We paid for expedited freight." },
    ],
    questions: [SAMPLE_DICTATION_QUESTIONS[4], SAMPLE_DICTATION_QUESTIONS[5], SAMPLE_DICTATION_QUESTIONS[6]],
  },
  {
    id: "t1-p4",
    testNumber: 1,
    part: "Part 4",
    year: "2026",
    totalQuestions: 75,
    completedQuestions: 0,
    status: "Chưa bắt đầu",
    notesCount: 0,
    vocabItems: [
      { word: "relocate", ipa: "/ˌriːˈloʊkeɪt/", meaning: "Chuyển địa điểm, dời chỗ", example: "The boarding gate was relocated." },
    ],
    questions: [SAMPLE_DICTATION_QUESTIONS[7], SAMPLE_DICTATION_QUESTIONS[8], SAMPLE_DICTATION_QUESTIONS[9]],
  },

  // --- TEST 2 ---
  {
    id: "t2-p1",
    testNumber: 2,
    part: "Part 1",
    year: "2026",
    totalQuestions: 24,
    completedQuestions: 0,
    status: "Chưa bắt đầu",
    notesCount: 0,
    vocabItems: [],
    questions: [SAMPLE_DICTATION_QUESTIONS[0], SAMPLE_DICTATION_QUESTIONS[1]],
  },
  {
    id: "t2-p2",
    testNumber: 2,
    part: "Part 2",
    year: "2026",
    totalQuestions: 100,
    completedQuestions: 0,
    status: "Chưa bắt đầu",
    notesCount: 0,
    vocabItems: [],
    questions: [SAMPLE_DICTATION_QUESTIONS[2], SAMPLE_DICTATION_QUESTIONS[3]],
  },
  {
    id: "t2-p3",
    testNumber: 2,
    part: "Part 3",
    year: "2026",
    totalQuestions: 132,
    completedQuestions: 0,
    status: "Chưa bắt đầu",
    notesCount: 0,
    vocabItems: [],
    questions: [SAMPLE_DICTATION_QUESTIONS[4], SAMPLE_DICTATION_QUESTIONS[5], SAMPLE_DICTATION_QUESTIONS[6]],
  },
  {
    id: "t2-p4",
    testNumber: 2,
    part: "Part 4",
    year: "2026",
    totalQuestions: 79,
    completedQuestions: 0,
    status: "Chưa bắt đầu",
    notesCount: 0,
    vocabItems: [],
    questions: [SAMPLE_DICTATION_QUESTIONS[7], SAMPLE_DICTATION_QUESTIONS[8], SAMPLE_DICTATION_QUESTIONS[9]],
  },

  // --- TEST 3 ---
  {
    id: "t3-p1",
    testNumber: 3,
    part: "Part 1",
    year: "2026",
    totalQuestions: 24,
    completedQuestions: 0,
    status: "Chưa bắt đầu",
    notesCount: 0,
    vocabItems: [],
    questions: [SAMPLE_DICTATION_QUESTIONS[0], SAMPLE_DICTATION_QUESTIONS[1]],
  },
  {
    id: "t3-p2",
    testNumber: 3,
    part: "Part 2",
    year: "2026",
    totalQuestions: 100,
    completedQuestions: 0,
    status: "Chưa bắt đầu",
    notesCount: 0,
    vocabItems: [],
    questions: [SAMPLE_DICTATION_QUESTIONS[2], SAMPLE_DICTATION_QUESTIONS[3]],
  },
  {
    id: "t3-p3",
    testNumber: 3,
    part: "Part 3",
    year: "2026",
    totalQuestions: 120,
    completedQuestions: 0,
    status: "Chưa bắt đầu",
    notesCount: 0,
    vocabItems: [],
    questions: [SAMPLE_DICTATION_QUESTIONS[4], SAMPLE_DICTATION_QUESTIONS[5], SAMPLE_DICTATION_QUESTIONS[6]],
  },
  {
    id: "t3-p4",
    testNumber: 3,
    part: "Part 4",
    year: "2026",
    totalQuestions: 82,
    completedQuestions: 0,
    status: "Chưa bắt đầu",
    notesCount: 0,
    vocabItems: [],
    questions: [SAMPLE_DICTATION_QUESTIONS[7], SAMPLE_DICTATION_QUESTIONS[8], SAMPLE_DICTATION_QUESTIONS[9]],
  },
];

// --- DỮ LIỆU BAN ĐẦU CHO TAB "PART 1" (ẢNH 3 & 4) ---
const INITIAL_PART1_LEVELS: LevelCategoryCardData[] = [
  {
    id: "p1-l1",
    part: "Part 1",
    type: "level",
    title: "Lv.1 Dưới 200",
    targetLevel: "Dưới 200",
    totalQuestions: 27,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Tập trung các động tác rõ ràng của 1 người: ngồi, đứng, cầm nắm đồ vật, nhìn vào tài liệu.",
    rules: [
      "Nghe rõ động từ chỉ hành động cơ bản: holding, looking at, typing, carrying, sitting.",
      "Quan sát danh từ chỉ đồ vật gần người nhất.",
    ],
    vocabBag: [
      { word: "holding", ipa: "/ˈhoʊldɪŋ/", meaning: "Đang cầm, nắm vật thể" },
      { word: "gazing", ipa: "/ˈɡeɪzɪŋ/", meaning: "Nhìn chăm chú vào" },
    ],
    questions: [SAMPLE_DICTATION_QUESTIONS[0]],
  },
  {
    id: "p1-l2",
    part: "Part 1",
    type: "level",
    title: "Lv.2 200–500",
    targetLevel: "200–300",
    totalQuestions: 65,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Các bức tranh có 2 người trở lên, miêu tả hành động tương tác hoặc cùng nhìn về một hướng.",
    rules: [
      "Phân biệt hành động của từng người (one person vs both people).",
      "Chú ý các động từ giao tiếp: talking, listening, discussing, handing.",
    ],
    vocabBag: [
      { word: "handing", ipa: "/ˈhændɪŋ/", meaning: "Đưa vật gì đó cho người khác" },
      { word: "assembling", ipa: "/əˈsemblɪŋ/", meaning: "Tập hợp lại cùng nhau" },
    ],
    questions: [SAMPLE_DICTATION_QUESTIONS[0]],
  },
  {
    id: "p1-l3",
    part: "Part 1",
    type: "level",
    title: "Lv.3 500–750",
    targetLevel: "300–400",
    totalQuestions: 60,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Tranh miêu tả đồ vật và cảnh quan tĩnh, thường dùng cấu trúc bị động chỉ trạng thái (have been arranged).",
    rules: [
      "Bẫy thì hiện tại tiếp diễn bị động 'being + V3' (chỉ có người đang thao tác mới được chọn).",
      "Dùng cấu trúc trạng thái: 'have been placed', 'are lined up', 'scattered'.",
    ],
    vocabBag: [
      { word: "arranged", ipa: "/əˈreɪndʒd/", meaning: "Được sắp đặt ngăn nắp" },
      { word: "displayed", ipa: "/dɪˈspleɪd/", meaning: "Được trưng bày trên kệ" },
    ],
    questions: [SAMPLE_DICTATION_QUESTIONS[1]],
  },
  {
    id: "p1-l4",
    part: "Part 1",
    type: "level",
    title: "Lv.4 750–990",
    targetLevel: "400–495",
    totalQuestions: 23,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Tranh trừu tượng, từ vựng khó chỉ góc nhìn cảnh vật thiên nhiên hoặc chi tiết máy móc phức tạp.",
    rules: [
      "Bẫy từ vựng lạ: awning, pier, pedestrian crossing, partition, wheelbarrow.",
      "Mô tả vị trí tương đối: overlooking, stretching, flanking.",
    ],
    vocabBag: [
      { word: "overlooking", ipa: "/ˌoʊvərˈlʊkɪŋ/", meaning: "Nhìn ra hướng (sông, bờ biển)" },
      { word: "sheltered", ipa: "/ˈʃeltərd/", meaning: "Được che chắn khỏi mưa nắng" },
    ],
    questions: [SAMPLE_DICTATION_QUESTIONS[1]],
  },
];

// --- DỮ LIỆU THEO DẠNG TRANH CHO PART 1 (ẢNH 4) ---
const INITIAL_PART1_CATEGORIES: LevelCategoryCardData[] = [
  {
    id: "p1-c1",
    part: "Part 1",
    type: "category",
    title: "Tranh một người",
    totalQuestions: 66,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Tập trung tuyệt đối vào người trong ảnh: tay đang làm gì, mắt nhìn đâu, trang phục đang mặc (wearing vs putting on).",
    rules: ["Phân biệt 'wearing' (đang mặc trên người) và 'putting on' (đang xỏ tay vào mặc)."],
    vocabBag: [{ word: "adjusting", ipa: "/əˈdʒʌstɪŋ/", meaning: "Đang chỉnh kính/đồng hồ" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[0]],
  },
  {
    id: "p1-c2",
    part: "Part 1",
    type: "category",
    title: "Tranh nhiều người",
    totalQuestions: 33,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Tìm điểm chung của đám đông hoặc sự khác biệt nổi bật của 1 nhân vật trong nhóm.",
    rules: ["Nhận diện các đại từ: 'Some people', 'All of them', 'One of the men'."],
    vocabBag: [{ word: "gathering", ipa: "/ˈɡæðərɪŋ/", meaning: "Đang tụ họp lại" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[0]],
  },
  {
    id: "p1-c3",
    part: "Part 1",
    type: "category",
    title: "Tranh tả cảnh",
    totalQuestions: 14,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Không có người hoặc người rất nhỏ ở phía xa, tập trung vào đường phố, công viên, bến cảng.",
    rules: ["Loại ngay các đáp án có người làm chủ ngữ hoặc có chữ 'being'."],
    vocabBag: [{ word: "paved", ipa: "/peɪvd/", meaning: "Được lát gạch / trải nhựa" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[1]],
  },
  {
    id: "p1-c4",
    part: "Part 1",
    type: "category",
    title: "Tranh tả vật",
    totalQuestions: 62,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Đồ đạc nội thất, kệ hàng siêu thị, giá sách, phương tiện giao thông xếp hàng.",
    rules: ["Chú ý vị trí sắp xếp: 'arranged in rows', 'placed on top of'."],
    vocabBag: [{ word: "stacked", ipa: "/stækt/", meaning: "Được xếp chồng gọn gàng" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[1]],
  },
];

// --- DỮ LIỆU CHO TAB "PART 2" (ẢNH 5) ---
const INITIAL_PART2_LEVELS: LevelCategoryCardData[] = [
  {
    id: "p2-l1",
    part: "Part 2",
    type: "level",
    title: "Lv.1 Dưới 200",
    targetLevel: "Dưới 200",
    totalQuestions: 174,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Các câu hỏi trực tiếp Wh-questions đơn giản (Who, Where, When) có đáp án rõ ràng trực diện.",
    rules: ["Who -> Tên người/chức danh; Where -> Địa điểm; When -> Mốc thời gian."],
    vocabBag: [{ word: "tomorrow", ipa: "/təˈmɔːroʊ/", meaning: "Ngày mai" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[2]],
  },
  {
    id: "p2-l2",
    part: "Part 2",
    type: "level",
    title: "Lv.2 200–500",
    targetLevel: "200–300",
    totalQuestions: 154,
    completedQuestions: 1,
    correctCount: 1,
    wrongCount: 0,
    status: "Đang học",
    theorySummary: "Câu hỏi Why, How và câu hỏi Yes/No có trợ động từ cơ bản (Do, Does, Did, Is, Are).",
    rules: ["Why -> Lý do (Because, due to hoặc đưa ra giải thích hoàn cảnh)."],
    vocabBag: [{ word: "cancelled", ipa: "/ˈkænsld/", meaning: "Đã bị hủy bỏ" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[3]],
  },
  {
    id: "p2-l3",
    part: "Part 2",
    type: "level",
    title: "Lv.3 500–750",
    targetLevel: "300–400",
    totalQuestions: 347,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Câu hỏi lựa chọn Or, câu hỏi phủ định (Didn't you...), câu hỏi đuôi (Tag questions) và câu trần thuật.",
    rules: ["Không trả lời Yes/No cho câu hỏi Or."],
    vocabBag: [{ word: "either", ipa: "/ˈaɪðər/", meaning: "Cái nào trong hai cái cũng được" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[2]],
  },
  {
    id: "p2-l4",
    part: "Part 2",
    type: "level",
    title: "Lv.4 750–990",
    targetLevel: "400–495",
    totalQuestions: 75,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Câu trả lời gián tiếp cực kỳ khó: trả lời bằng một câu hỏi khác, người nói không biết, hoặc từ chối lịch sự.",
    rules: ["Câu trả lời không trực tiếp: 'I have no idea', 'Check with Mr. Davis' thường là đáp án đúng."],
    vocabBag: [{ word: "itinerary", ipa: "/aɪˈtɪnəreri/", meaning: "Lịch trình chuyến đi" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[3]],
  },
];

// --- DỮ LIỆU CHO TAB "PART 3" & "PART 4" ---
const INITIAL_PART3_LEVELS: LevelCategoryCardData[] = [
  {
    id: "p3-l1",
    part: "Part 3",
    type: "level",
    title: "Lv.1 Dưới 200",
    totalQuestions: 50,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Hội thoại 2 người với câu hỏi nghe từ khóa trực diện trong câu đầu tiên.",
    rules: ["Đọc lướt 3 câu hỏi trước khi audio bắt đầu."],
    vocabBag: [{ word: "reception", ipa: "/rɪˈsepʃn/", meaning: "Quầy lễ tân" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[4], SAMPLE_DICTATION_QUESTIONS[5], SAMPLE_DICTATION_QUESTIONS[6]],
  },
  {
    id: "p3-l2",
    part: "Part 3",
    type: "level",
    title: "Lv.2 200–500",
    totalQuestions: 80,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Hội thoại công sở về đặt vé, giao hàng, đổi lịch họp.",
    rules: ["Để ý ai nói gì (man vs woman)."],
    vocabBag: [{ word: "reschedule", ipa: "/ˌriːˈskedʒuːl/", meaning: "Đổi lại lịch trình" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[4], SAMPLE_DICTATION_QUESTIONS[5], SAMPLE_DICTATION_QUESTIONS[6]],
  },
  {
    id: "p3-l3",
    part: "Part 3",
    type: "level",
    title: "Lv.3 500–750",
    totalQuestions: 110,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Hội thoại 3 người và câu hỏi suy luận ngụ ý câu nói.",
    rules: ["Câu hỏi 'What does the speaker imply' đòi hỏi hiểu ngữ cảnh."],
    vocabBag: [{ word: "feasibility", ipa: "/ˌfiːzəˈbɪləti/", meaning: "Tính khả thi" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[4], SAMPLE_DICTATION_QUESTIONS[5], SAMPLE_DICTATION_QUESTIONS[6]],
  },
  {
    id: "p3-l4",
    part: "Part 3",
    type: "level",
    title: "Lv.4 750–990",
    totalQuestions: 60,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Hội thoại kết hợp sơ đồ, bản đồ và biểu đồ hình ảnh (Graphics).",
    rules: ["Nhìn thông tin trên biểu đồ và nghe dữ kiện đối chiếu."],
    vocabBag: [{ word: "discrepancy", ipa: "/dɪˈskrepənsi/", meaning: "Sự sai khác số liệu" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[4], SAMPLE_DICTATION_QUESTIONS[5], SAMPLE_DICTATION_QUESTIONS[6]],
  },
];

const INITIAL_PART4_LEVELS: LevelCategoryCardData[] = [
  {
    id: "p4-l1",
    part: "Part 4",
    type: "level",
    title: "Lv.1 Dưới 200",
    totalQuestions: 40,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Các bài thông báo đơn giản tại ga tàu, sân bay và siêu thị.",
    rules: ["Nghe câu đầu tiên để biết bài nói diễn ra ở đâu."],
    vocabBag: [{ word: "passengers", ipa: "/ˈpæsɪndʒərz/", meaning: "Hành khách" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[7], SAMPLE_DICTATION_QUESTIONS[8], SAMPLE_DICTATION_QUESTIONS[9]],
  },
  {
    id: "p4-l2",
    part: "Part 4",
    type: "level",
    title: "Lv.2 200–500",
    totalQuestions: 65,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Tin nhắn thoại để lại qua điện thoại và thông báo nội bộ công ty.",
    rules: ["Xác định mục đích gọi điện ('I'm calling to...')."],
    vocabBag: [{ word: "inquire", ipa: "/ɪnˈkwaɪər/", meaning: "Hỏi thăm thông tin" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[7], SAMPLE_DICTATION_QUESTIONS[8], SAMPLE_DICTATION_QUESTIONS[9]],
  },
  {
    id: "p4-l3",
    part: "Part 4",
    type: "level",
    title: "Lv.3 500–750",
    totalQuestions: 90,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Bản tin thời tiết, tin tức tài chính và quảng cáo thương mại.",
    rules: ["Để ý các con số, dự báo thời tiết và chương trình khuyến mãi."],
    vocabBag: [{ word: "forecast", ipa: "/ˈfɔːrkæst/", meaning: "Dự báo thời tiết" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[7], SAMPLE_DICTATION_QUESTIONS[8], SAMPLE_DICTATION_QUESTIONS[9]],
  },
  {
    id: "p4-l4",
    part: "Part 4",
    type: "level",
    title: "Lv.4 750–990",
    totalQuestions: 50,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Bài phát biểu giới thiệu nhân vật và bài nói kết hợp biểu đồ hình ảnh.",
    rules: ["Kết hợp nghe và dò thông tin trên bảng biểu song song."],
    vocabBag: [{ word: "accolades", ipa: "/ˈækəleɪdz/", meaning: "Giải thưởng vinh danh" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[7], SAMPLE_DICTATION_QUESTIONS[8], SAMPLE_DICTATION_QUESTIONS[9]],
  },
];


// --- DỮ LIỆU THEO DẠNG CÂU HỎI CHO PART 2 ---
const INITIAL_PART2_CATEGORIES: LevelCategoryCardData[] = [
  {
    id: "p2-c1",
    part: "Part 2",
    type: "category",
    title: "Câu hỏi Wh- (Who, Where, When)",
    totalQuestions: 54,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Các câu hỏi hỏi thông tin trực tiếp về Người, Địa điểm, Thời gian.",
    rules: ["Who -> Tên người/chức danh; Where -> Địa điểm; When -> Mốc thời gian."],
    vocabBag: [{ word: "tomorrow", ipa: "/təˈmɔːroʊ/", meaning: "Ngày mai" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[2]],
  },
  {
    id: "p2-c2",
    part: "Part 2",
    type: "category",
    title: "Câu hỏi Why & How",
    totalQuestions: 48,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Hỏi lý do (Why) và cách thức/phương tiện/số lượng (How).",
    rules: ["Why -> Because / Due to; How -> Phương tiện hoặc cách thực hiện."],
    vocabBag: [{ word: "cancelled", ipa: "/ˈkænsld/", meaning: "Đã bị hủy" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[3]],
  },
  {
    id: "p2-c3",
    part: "Part 2",
    type: "category",
    title: "Câu hỏi Yes/No & Trợ động từ",
    totalQuestions: 62,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Câu hỏi bắt đầu bằng Do/Does/Did/Have/Has/Is/Are.",
    rules: ["Chú ý thì của câu hỏi và đại từ xưng hô trong câu trả lời."],
    vocabBag: [{ word: "available", ipa: "/əˈveɪləbl/", meaning: "Có sẵn / Rảnh" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[2]],
  },
  {
    id: "p2-c4",
    part: "Part 2",
    type: "category",
    title: "Câu bẫy & Trả lời gián tiếp",
    totalQuestions: 45,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Câu trả lời không chứa thông tin trực diện mà giải thích ngữ cảnh.",
    rules: ["Các câu trả lời kiểu 'I have no idea', 'Check with Mr. Davis' thường đúng."],
    vocabBag: [{ word: "itinerary", ipa: "/aɪˈtɪnəreri/", meaning: "Lịch trình" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[3]],
  },
];

// --- DỮ LIỆU THEO CHỦ ĐỀ HỘI THOẠI CHO PART 3 ---
const INITIAL_PART3_CATEGORIES: LevelCategoryCardData[] = [
  {
    id: "p3-c1",
    part: "Part 3",
    type: "category",
    title: "Công sở & Văn phòng",
    totalQuestions: 42,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Hội thoại thảo luận dự án, họp hành, phân công công việc.",
    rules: ["Lắng nghe tên dự án và thời hạn hoàn thành."],
    vocabBag: [{ word: "deadline", ipa: "/ˈdedlaɪn/", meaning: "Hạn chót" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[4], SAMPLE_DICTATION_QUESTIONS[5], SAMPLE_DICTATION_QUESTIONS[6]],
  },
  {
    id: "p3-c2",
    part: "Part 3",
    type: "category",
    title: "Dịch vụ & Đặt hàng",
    totalQuestions: 38,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Hội thoại mua sắm, đặt bàn nhà hàng, đổi trả hàng hóa.",
    rules: ["Để ý lý do khách hàng gọi và phương án giải quyết."],
    vocabBag: [{ word: "refund", ipa: "/ˈriːfʌnd/", meaning: "Hoàn tiền" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[4], SAMPLE_DICTATION_QUESTIONS[5], SAMPLE_DICTATION_QUESTIONS[6]],
  },
  {
    id: "p3-c3",
    part: "Part 3",
    type: "category",
    title: "Hội thoại 3 người",
    totalQuestions: 28,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Cần phân biệt giọng nói của 3 nhân vật khác nhau.",
    rules: ["Nhận diện giọng nam 1, giọng nam 2 hoặc giọng nữ."],
    vocabBag: [{ word: "collaboration", ipa: "/kəˌlæbəˈreɪʃn/", meaning: "Sự hợp tác" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[4], SAMPLE_DICTATION_QUESTIONS[5], SAMPLE_DICTATION_QUESTIONS[6]],
  },
  {
    id: "p3-c4",
    part: "Part 3",
    type: "category",
    title: "Hội thoại kèm Biểu đồ / Sơ đồ",
    totalQuestions: 30,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Hội thoại có hình ảnh đính kèm (sơ đồ chỗ ngồi, hóa đơn, lịch trình).",
    rules: ["Nhìn nhanh hình ảnh trước khi nghe audio đối chiếu."],
    vocabBag: [{ word: "chart", ipa: "/tʃɑːrt/", meaning: "Biểu đồ" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[4], SAMPLE_DICTATION_QUESTIONS[5], SAMPLE_DICTATION_QUESTIONS[6]],
  },
];

// --- DỮ LIỆU THEO DẠNG BÀI NÓI CHO PART 4 ---
const INITIAL_PART4_CATEGORIES: LevelCategoryCardData[] = [
  {
    id: "p4-c1",
    part: "Part 4",
    type: "category",
    title: "Thông báo công cộng & Ga tàu",
    totalQuestions: 35,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Bài phát thanh tại sân bay, ga tàu, siêu thị, triển lãm.",
    rules: ["Nghe câu đầu tiên để xác định địa điểm bài nói."],
    vocabBag: [{ word: "departure", ipa: "/dɪˈpɑːrtʃər/", meaning: "Chuyến khởi hành" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[7], SAMPLE_DICTATION_QUESTIONS[8], SAMPLE_DICTATION_QUESTIONS[9]],
  },
  {
    id: "p4-c2",
    part: "Part 4",
    type: "category",
    title: "Tin nhắn thoại & Điện thoại",
    totalQuestions: 40,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Lời nhắn để lại trong hộp thư thoại công việc.",
    rules: ["Xác định lý do người nói để lại lời nhắn ('I am calling to...')."],
    vocabBag: [{ word: "voicemail", ipa: "/ˈvɔɪsmeɪl/", meaning: "Hộp thư thoại" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[7], SAMPLE_DICTATION_QUESTIONS[8], SAMPLE_DICTATION_QUESTIONS[9]],
  },
  {
    id: "p4-c3",
    part: "Part 4",
    type: "category",
    title: "Tin tức & Dự báo thời tiết",
    totalQuestions: 25,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Bản tin phát thanh về giao thông, thời tiết, kinh tế.",
    rules: ["Ghi nhớ số liệu và danh từ chỉ khu vực."],
    vocabBag: [{ word: "traffic", ipa: "/ˈtræfɪk/", meaning: "Giao thông" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[7], SAMPLE_DICTATION_QUESTIONS[8], SAMPLE_DICTATION_QUESTIONS[9]],
  },
  {
    id: "p4-c4",
    part: "Part 4",
    type: "category",
    title: "Bài phát biểu & Hướng dẫn",
    totalQuestions: 32,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Lời giới thiệu diễn giả, bài phát biểu khai mạc hội thảo.",
    rules: ["Chú ý tên diễn giả và chủ đề hội thảo."],
    vocabBag: [{ word: "keynote", ipa: "/ˈkiːnoʊt/", meaning: "Bài phát biểu chủ đề chính" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[7], SAMPLE_DICTATION_QUESTIONS[8], SAMPLE_DICTATION_QUESTIONS[9]],
  },
];

export default function ListeningPage() {
  // --- STATES CHÍNH ---
  const [activeTab, setActiveTab] = useState<"dictation" | "part1" | "part2" | "part3" | "part4">("dictation");
  const [selectedYear, setSelectedYear] = useState<"2026" | "2024" | "2023" | "2022">("2026");

  // Dữ liệu cards
  const [dictationCards, setDictationCards] = useState<DictationCardData[]>(INITIAL_DICTATION_CARDS);
  const [part1Levels, setPart1Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART1_LEVELS);
  const [part1Categories, setPart1Categories] = useState<LevelCategoryCardData[]>(INITIAL_PART1_CATEGORIES);
  const [part2Levels, setPart2Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART2_LEVELS);
  const [part2Categories, setPart2Categories] = useState<LevelCategoryCardData[]>(INITIAL_PART2_CATEGORIES);
  const [part3Levels, setPart3Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART3_LEVELS);
  const [part3Categories, setPart3Categories] = useState<LevelCategoryCardData[]>(INITIAL_PART3_CATEGORIES);
  const [part4Levels, setPart4Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART4_LEVELS);
  const [part4Categories, setPart4Categories] = useState<LevelCategoryCardData[]>(INITIAL_PART4_CATEGORIES);

  // Giỏ từ vựng cá nhân
  const [savedVocabBag, setSavedVocabBag] = useState<string[]>([]);
  // Danh sách câu cần luyện lại
  const [flaggedReviewIds, setFlaggedReviewIds] = useState<number[]>([3]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper hiển thị thông báo
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- MODAL STATES ---
  // 1. Modal Luyện tập Nghe chép chính tả (Dictation Studio)
  const [dictationModalCard, setDictationModalCard] = useState<DictationCardData | null>(null);
  const [activeDictationQIndex, setActiveDictationQIndex] = useState(0);
  const [dictationUserInputs, setDictationUserInputs] = useState<{ [qId: number]: string }>({});
  const [dictationChecked, setDictationChecked] = useState<{ [qId: number]: boolean }>({});
  const [showDictationScript, setShowDictationScript] = useState<{ [qId: number]: boolean }>({});

  // 2. Modal Học ngay trắc nghiệm (Practice Quiz Modal)
  const [quizModalCard, setQuizModalCard] = useState<LevelCategoryCardData | null>(null);
  const [activeQuizQIndex, setActiveQuizQIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<{ [qId: number]: string }>({});
  const [quizAnswerChecked, setQuizAnswerChecked] = useState<{ [qId: number]: boolean }>({});

  // 3. Modal Giỏ từ vựng (Shopping Bag Modal)
  const [vocabBagModalData, setVocabBagModalData] = useState<{
    title: string;
    items: { word: string; ipa: string; meaning: string; example?: string }[];
  } | null>(null);

  // 4. Modal Lý thuyết & Mẹo (FileText Modal)
  const [theoryModalData, setTheoryModalData] = useState<{
    title: string;
    summary: string;
    rules: string[];
  } | null>(null);

  // 5. Modal Xóa tiến độ (Trash2 Modal)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: "dictation" | "level";
    id: string;
    title: string;
  } | null>(null);

  // 6. Modal Xem lại câu cần luyện lại
  const [showReviewQuestionsModal, setShowReviewQuestionsModal] = useState(false);

  // Trình phát audio mô phỏng
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  // Web Audio Sound Effects Synthesizer (SFX chọn đáp án giống Part 5, 6, 7)
    // Web Audio Sound Effects Synthesizer (Chuẩn 100% theo Part 5)
  const playSfx = (type: "correct" | "wrong" | "click") => {
    if (!isSfxEnabled) return; // Im lặng 100% khi tắt nút chuông
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
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "wrong") {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {
      // Fallback
    }
  };

  const [audioSpeed, setAudioSpeed] = useState<"0.8" | "1.0" | "1.2">("1.0");

  // Part 1 practice states
  const [showVocabListToggle, setShowVocabListToggle] = useState(true);
  const [addedVocabItems, setAddedVocabItems] = useState<string[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState("Từ vựng sai");
  const [reportText, setReportText] = useState("");

  // --- CRUD STATES FOR DICTATION CARDS ---
  const [showDictationModal, setShowDictationModal] = useState(false);
  const [editingDictationCard, setEditingDictationCard] = useState<DictationCardData | null>(null);
  const [dictationFormTestNum, setDictationFormTestNum] = useState(1);
  const [dictationFormPart, setDictationFormPart] = useState<"Part 1" | "Part 2" | "Part 3" | "Part 4">("Part 1");
  const [dictationFormYear, setDictationFormYear] = useState<"2026" | "2024" | "2023" | "2022">("2026");
  const [dictationFormQuestions, setDictationFormQuestions] = useState(24);
  const [deleteDictationConfirm, setDeleteDictationConfirm] = useState<DictationCardData | null>(null);

  // --- CRUD STATES FOR LEVEL / CATEGORY CARDS ---
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [editingLevelCard, setEditingLevelCard] = useState<LevelCategoryCardData | null>(null);
  const [levelFormPart, setLevelFormPart] = useState<"Part 1" | "Part 2" | "Part 3" | "Part 4">("Part 1");
  const [levelFormType, setLevelFormType] = useState<"level" | "category">("level");
  const [levelFormTitle, setLevelFormTitle] = useState("");
  const [levelFormQuestions, setLevelFormQuestions] = useState(30);
  const [levelFormTheory, setLevelFormTheory] = useState("");
  const [levelFormRules, setLevelFormRules] = useState("");
  const [deleteLevelConfirm, setDeleteLevelConfirm] = useState<LevelCategoryCardData | null>(null);

  // Dictation CRUD Handlers
  const handleOpenAddDictation = () => {
    setEditingDictationCard(null);
    setDictationFormTestNum(1);
    setDictationFormPart("Part 1");
    setDictationFormYear(selectedYear);
    setDictationFormQuestions(24);
    setShowDictationModal(true);
  };

  const handleOpenEditDictation = (card: DictationCardData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDictationCard(card);
    setDictationFormTestNum(card.testNumber);
    setDictationFormPart(card.part);
    setDictationFormYear(card.year);
    setDictationFormQuestions(card.totalQuestions);
    setShowDictationModal(true);
  };

  const handleSaveDictation = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDictationCard) {
      setDictationCards((prev) =>
        prev.map((c) =>
          c.id === editingDictationCard.id
            ? {
                ...c,
                testNumber: dictationFormTestNum,
                part: dictationFormPart,
                year: dictationFormYear,
                totalQuestions: dictationFormQuestions,
              }
            : c
        )
      );
      triggerToast(`Đã cập nhật bài nghe ${dictationFormPart} - Test ${dictationFormTestNum}! 💾`);
    } else {
      const newCard: DictationCardData = {
        id: `dict-${Date.now()}`,
        testNumber: dictationFormTestNum,
        part: dictationFormPart,
        year: dictationFormYear,
        totalQuestions: dictationFormQuestions,
        completedQuestions: 0,
        status: "Chưa bắt đầu",
        notesCount: 0,
        vocabItems: [],
        questions: [...SAMPLE_DICTATION_QUESTIONS.slice(0, 2)],
      };
      setDictationCards((prev) => [newCard, ...prev]);
      triggerToast(`Đã thêm bài nghe ${newCard.part} - Test ${newCard.testNumber}! 🎉`);
    }
    setShowDictationModal(false);
  };

  const handleConfirmDeleteDictationCard = () => {
    if (!deleteDictationConfirm) return;
    setDictationCards((prev) => prev.filter((c) => c.id !== deleteDictationConfirm.id));
    triggerToast(`Đã xóa bài nghe ${deleteDictationConfirm.part} - Test ${deleteDictationConfirm.testNumber}! 🗑️`);
    setDeleteDictationConfirm(null);
  };

  // Level / Category CRUD Handlers
  const handleOpenAddLevel = (part: "Part 1" | "Part 2" | "Part 3" | "Part 4", type: "level" | "category" = "level") => {
    setEditingLevelCard(null);
    setLevelFormPart(part);
    setLevelFormType(type);
    setLevelFormTitle("");
    setLevelFormQuestions(30);
    setLevelFormTheory("");
    setLevelFormRules("");
    setShowLevelModal(true);
  };

  const handleOpenEditLevel = (card: LevelCategoryCardData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingLevelCard(card);
    setLevelFormPart(card.part);
    setLevelFormType(card.type);
    setLevelFormTitle(card.title);
    setLevelFormQuestions(card.totalQuestions);
    setLevelFormTheory(card.theorySummary);
    setLevelFormRules(card.rules.join("\n"));
    setShowLevelModal(true);
  };

  const handleSaveLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelFormTitle.trim()) {
      alert("Vui lòng nhập tên chủ điểm!");
      return;
    }
    const rulesArray = levelFormRules
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const updateInList = (list: LevelCategoryCardData[]) =>
      list.map((c) =>
        c.id === editingLevelCard?.id
          ? {
              ...c,
              title: levelFormTitle.trim(),
              totalQuestions: levelFormQuestions,
              theorySummary: levelFormTheory.trim(),
              rules: rulesArray.length > 0 ? rulesArray : c.rules,
            }
          : c
      );

    if (editingLevelCard) {
      if (editingLevelCard.part === "Part 1") {
        if (editingLevelCard.type === "level") setPart1Levels(updateInList);
        else setPart1Categories(updateInList);
      } else if (editingLevelCard.part === "Part 2") {
        setPart2Levels(updateInList);
      } else if (editingLevelCard.part === "Part 3") {
        setPart3Levels(updateInList);
      } else if (editingLevelCard.part === "Part 4") {
        setPart4Levels(updateInList);
      }
      triggerToast(`Đã cập nhật chủ điểm "${levelFormTitle}"! 💾`);
    } else {
      const newCard: LevelCategoryCardData = {
        id: `lvl-${Date.now()}`,
        part: levelFormPart,
        type: levelFormType,
        title: levelFormTitle.trim(),
        totalQuestions: levelFormQuestions,
        completedQuestions: 0,
        correctCount: 0,
        wrongCount: 0,
        status: "Chưa luyện tập",
        theorySummary: levelFormTheory.trim() || "Chủ điểm luyện nghe chuyên sâu với phương pháp làm bài chi tiết.",
        rules: rulesArray.length > 0 ? rulesArray : ["Lắng nghe cẩn thận các từ khóa quan trọng trong audio."],
        vocabBag: [],
        questions: [...SAMPLE_DICTATION_QUESTIONS.slice(0, 1)],
      };
      if (levelFormPart === "Part 1") {
        if (levelFormType === "level") setPart1Levels((prev) => [newCard, ...prev]);
        else setPart1Categories((prev) => [newCard, ...prev]);
      } else if (levelFormPart === "Part 2") {
        if (levelFormType === "level") setPart2Levels((prev) => [newCard, ...prev]);
        else setPart2Categories((prev) => [newCard, ...prev]);
      } else if (levelFormPart === "Part 3") {
        if (levelFormType === "level") setPart3Levels((prev) => [newCard, ...prev]);
        else setPart3Categories((prev) => [newCard, ...prev]);
      } else if (levelFormPart === "Part 4") {
        if (levelFormType === "level") setPart4Levels((prev) => [newCard, ...prev]);
        else setPart4Categories((prev) => [newCard, ...prev]);
      }
      triggerToast(`Đã thêm chủ điểm "${newCard.title}"! 🎉`);
    }
    setShowLevelModal(false);
  };

  const handleConfirmDeleteLevelCard = () => {
    if (!deleteLevelConfirm) return;
    const filterOut = (list: LevelCategoryCardData[]) => list.filter((c) => c.id !== deleteLevelConfirm.id);
    if (deleteLevelConfirm.part === "Part 1") {
      if (deleteLevelConfirm.type === "level") setPart1Levels(filterOut);
      else setPart1Categories(filterOut);
    } else if (deleteLevelConfirm.part === "Part 2") {
      if (deleteLevelConfirm.type === "level") setPart2Levels(filterOut);
      else setPart2Categories(filterOut);
    } else if (deleteLevelConfirm.part === "Part 3") {
      if (deleteLevelConfirm.type === "level") setPart3Levels(filterOut);
      else setPart3Categories(filterOut);
    } else if (deleteLevelConfirm.part === "Part 4") {
      if (deleteLevelConfirm.type === "level") setPart4Levels(filterOut);
      else setPart4Categories(filterOut);
    }
    triggerToast(`Đã xóa chủ điểm "${deleteLevelConfirm.title}"! 🗑️`);
    setDeleteLevelConfirm(null);
  };

  // --- ACTIONS XỬ LÝ ---

  // Mở modal Nghe chép chính tả
  const handleOpenDictationPractice = (card: DictationCardData) => {
    setDictationModalCard(card);
    setActiveDictationQIndex(0);
    setDictationUserInputs({});
    setDictationChecked({});
    setShowDictationScript({});
    setIsPlayingAudio(false);
  };

  // Mở modal Học ngay (cho Level / Category)
  const handleOpenQuizPractice = (card: LevelCategoryCardData) => {
    setQuizModalCard(card);
    setActiveQuizQIndex(0);
    setQuizSelectedOption({});
    setQuizAnswerChecked({});
    setIsPlayingAudio(false);
  };

  // Kiểm tra chính tả
  const handleCheckDictation = (qId: number) => {
    setDictationChecked((prev) => ({ ...prev, [qId]: true }));
    triggerToast("Đã đối chiếu với audio script gốc!");
  };

  // Kiểm tra đáp án trắc nghiệm
  const handleCheckQuizAnswer = (q: DictationQuestion) => {
    const chosen = quizSelectedOption[q.id];
    if (!chosen || !quizModalCard) return;

    const isCorrect = chosen === q.correctAnswer;
    setQuizAnswerChecked((prev) => ({ ...prev, [q.id]: true }));

    // Cập nhật card state
    const updateCard = (c: LevelCategoryCardData): LevelCategoryCardData => {
      if (c.id === quizModalCard.id) {
        return {
          ...c,
          completedQuestions: c.completedQuestions + 1,
          correctCount: c.correctCount + (isCorrect ? 1 : 0),
          wrongCount: c.wrongCount + (isCorrect ? 0 : 1),
          status: "Đang học",
        };
      }
      return c;
    };

    setPart1Levels((prev) => prev.map(updateCard));
    setPart1Categories((prev) => prev.map(updateCard));
    setPart2Levels((prev) => prev.map(updateCard));
    setPart2Categories((prev) => prev.map(updateCard));
    setPart3Levels((prev) => prev.map(updateCard));
    setPart3Categories((prev) => prev.map(updateCard));
    setPart4Levels((prev) => prev.map(updateCard));
    setPart4Categories((prev) => prev.map(updateCard));

    triggerToast(isCorrect ? "✨ Xuất sắc! Đáp án chính xác." : "Chưa chính xác! Xem giải thích chi tiết bên dưới.");
  };

  // Lưu từ vào giỏ
  const handleToggleSaveWord = (word: string) => {
    if (savedVocabBag.includes(word)) {
      setSavedVocabBag((prev) => prev.filter((w) => w !== word));
      triggerToast(`Đã bỏ từ "${word}" khỏi giỏ từ.`);
    } else {
      setSavedVocabBag((prev) => [...prev, word]);
      triggerToast(`✨ Đã lưu từ "${word}" vào giỏ từ vựng cá nhân!`);
    }
  };

  // Gắn cờ câu cần luyện lại
  const handleToggleFlagReview = (qId: number) => {
    if (flaggedReviewIds.includes(qId)) {
      setFlaggedReviewIds((prev) => prev.filter((id) => id !== qId));
      triggerToast(`Đã gỡ câu ${qId} khỏi danh sách cần luyện lại.`);
    } else {
      setFlaggedReviewIds((prev) => [...prev, qId]);
      triggerToast(`Đã thêm câu ${qId} vào "Câu cần luyện lại"!`);
    }
  };

  // Xác nhận xóa tiến độ
  const handleConfirmDeleteProgress = () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.type === "dictation") {
      setDictationCards((prev) =>
        prev.map((c) =>
          c.id === deleteConfirmTarget.id
            ? { ...c, completedQuestions: 0, status: "Chưa bắt đầu" }
            : c
        )
      );
    } else {
      const reset = (c: LevelCategoryCardData) =>
        c.id === deleteConfirmTarget.id
          ? { ...c, completedQuestions: 0, correctCount: 0, wrongCount: 0, status: "Chưa luyện tập" as const }
          : c;
      setPart1Levels((prev) => prev.map(reset));
      setPart1Categories((prev) => prev.map(reset));
      setPart2Levels((prev) => prev.map(reset));
      setPart3Levels((prev) => prev.map(reset));
      setPart4Levels((prev) => prev.map(reset));
    }

    triggerToast(`Đã đặt lại tiến độ cho ${deleteConfirmTarget.title}!`);
    setDeleteConfirmTarget(null);
  };

  // Lọc cards nghe chép theo năm đã chọn
  const filteredDictationCards = useMemo(() => {
    return dictationCards.filter((c) => c.year === selectedYear);
  }, [dictationCards, selectedYear]);

  // Gom nhóm theo Test 1, Test 2, Test 3
  const testsGrouped = useMemo(() => {
    const groups: { [testNum: number]: DictationCardData[] } = {};
    filteredDictationCards.forEach((c) => {
      if (!groups[c.testNumber]) groups[c.testNumber] = [];
      groups[c.testNumber].push(c);
    });
    return groups;
  }, [filteredDictationCards]);

  return (
    <div className="min-h-screen bg-[#f8fafc]/90 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Toast thông báo nổi */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-blue-400 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* KHỐI 1: HEADER BANNER CHINH PHỤC TOEIC LISTENING (CHUẨN 100% THEO CÁC HÌNH CỦA BẠN) */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Luyện nghe TOEIC
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Chinh phục <span className="text-blue-600">TOEIC Listening</span> từ dễ đến khó
          </h1>
          <p className="text-sm font-medium text-slate-600 max-w-2xl leading-relaxed">
            Nghe chép chính tả và luyện Part 1–4 theo 4 cấp độ.
          </p>
        </div>

        {/* Hộp icon Tai nghe Xanh lớn góc phải (chuẩn 100% như các ảnh mẫu) */}
        <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <Headphones className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* KHỐI 2: THANH TAB CHÍNH (NGHE CHÉP, PART 1, PART 2, PART 3, PART 4) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl max-w-full overflow-x-auto no-scrollbar shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("dictation")}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "dictation"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Nghe chép
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("part1")}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "part1"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Part 1
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("part2")}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "part2"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Part 2
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("part3")}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "part3"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Part 3
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("part4")}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "part4"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Part 4
        </button>
      </div>

      {/* ======================================================== */}
      {/* NỘI DUNG 1: TAB NGHE CHÉP CHÍNH TẢ (ẢNH 1 & ẢNH 2) */}
      {/* ======================================================== */}
      {activeTab === "dictation" && (
        <div className="space-y-6">
          {/* Thanh lọc theo Năm & Nút "Câu cần luyện lại" & Thêm bài */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Lọc Năm */}
            <div className="flex items-center gap-2">
              {(["2026", "2024", "2023", "2022"] as const).map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    selectedYear === year
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddDictation}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm bài nghe chép
              </button>
              {/* Nút Câu cần luyện lại */}
              <button
                type="button"
                onClick={() => setShowReviewQuestionsModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-800 text-xs font-bold transition cursor-pointer shadow-2xs"
              >
                <Bookmark className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
                Câu cần luyện lại ({flaggedReviewIds.length})
              </button>
            </div>
          </div>

          {/* Danh sách các phần Test: | Test 1, | Test 2, | Test 3 */}
          {[1, 2, 3].map((testNum) => {
            const cardsInTest = testsGrouped[testNum] || [];
            if (cardsInTest.length === 0) return null;

            return (
              <div key={testNum} className="space-y-3">
                {/* Tiêu đề Test có gạch đứng màu xanh bên trái */}
                <div className="flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-600 rounded-full" />
                  <h3 className="text-base font-extrabold text-slate-900">
                    Test {testNum}
                  </h3>
                </div>

                {/* 4 Cards trong Test: Part 1, Part 2, Part 3, Part 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cardsInTest.map((card) => (
                    <div
                      key={card.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Hàng trên: Huy hiệu Part & 2 Icon Sổ từ / Ghi chú & Sửa / Xóa */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
                            {card.part}
                          </span>

                          <div className="flex items-center gap-1.5 text-slate-400">
                            {/* Icon Sửa bài */}
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditDictation(card, e)}
                              title="Sửa bài nghe"
                              className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Icon Xóa bài */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDictationConfirm(card);
                              }}
                              title="Xóa bài nghe"
                              className="p-1 rounded-md hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Icon A - Sổ từ */}
                            <button
                              type="button"
                              onClick={() =>
                                setVocabBagModalData({
                                  title: `Từ vựng ${card.part} - Test ${card.testNumber}`,
                                  items: card.vocabItems,
                                })
                              }
                              title="Xem từ vựng của Part"
                              className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                            >
                              <Languages className="w-3.5 h-3.5" />
                            </button>

                            {/* Icon Document kèm số */}
                            <button
                              type="button"
                              onClick={() =>
                                setTheoryModalData({
                                  title: `Ghi chú & Transcript ${card.part} - Test ${card.testNumber}`,
                                  summary: `Tổng hợp ${card.totalQuestions} câu nghe chép của ${card.part} Test ${card.testNumber}.`,
                                  rules: [
                                    "Nghe trọn vẹn câu trước khi gõ.",
                                    "Chú ý âm nối và trọng âm câu.",
                                  ],
                                })
                              }
                              title="Transcript & Ghi chú"
                              className="flex items-center gap-1 text-[11px] p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{card.notesCount}</span>
                            </button>
                          </div>
                        </div>

                        {/* Hàng giữa: Icon Tai nghe và số câu */}
                        <div className="flex items-center gap-2 my-2">
                          <Headphones className="w-5 h-5 text-blue-600" />
                          <span className="text-base font-extrabold text-slate-900">
                            {card.totalQuestions} câu
                          </span>
                        </div>
                      </div>

                      {/* Hàng dưới: Trạng thái & Nút Luyện tập > */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                        <span className="text-xs text-slate-500 font-medium">
                          {card.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenDictationPractice(card)}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                        >
                          Luyện tập
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* NỘI DUNG 2: TAB PART 1 (ẢNH 3 & ẢNH 4) */}
      {/* ======================================================== */}
      {activeTab === "part1" && (
        <div className="space-y-8">
          {/* Header Part 1 Level */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Theo cấp độ điểm</h3>
              <p className="text-xs text-slate-500">Bộ đề luyện nghe phân cấp độ chuẩn TOEIC.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAddLevel("Part 1", "level")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm chủ điểm
            </button>
          </div>

          {/* 4 Cấp độ: Level 1, Level 2, Level 3, Level 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {part1Levels.map((lvl) => (
              <div
                key={lvl.id}
                className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {lvl.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {lvl.status} · {lvl.totalQuestions} câu
                  </p>
                </div>

                {/* Hàng dưới: icon + Nút "Học ngay" */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditLevel(lvl, e)}
                      title="Sửa chủ điểm"
                      className="hover:text-blue-600 transition cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteLevelConfirm(lvl)}
                      title="Xóa chủ điểm"
                      className="hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setVocabBagModalData({
                          title: `Giỏ từ vựng - ${lvl.title}`,
                          items: lvl.vocabBag,
                        })
                      }
                      title="Giỏ từ vựng"
                      className="hover:text-blue-600 transition cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTheoryModalData({
                          title: `Lý thuyết kỹ năng - ${lvl.title}`,
                          summary: lvl.theorySummary,
                          rules: lvl.rules,
                        })
                      }
                      title="Lý thuyết & Mẹo làm bài"
                      className="hover:text-blue-600 transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenQuizPractice(lvl)}
                      title="Làm lại bộ câu này"
                      className="hover:text-blue-600 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenQuizPractice(lvl)}
                    className="px-4 py-1.5 rounded-full border border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer shadow-2xs"
                  >
                    Học ngay
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Phân loại: Theo dạng tranh (Ảnh 4) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Theo dạng tranh
                </h3>
                <p className="text-xs text-slate-500">
                  Cùng bộ câu ở trên, chia theo bức tranh mô tả gì. Mỗi câu thuộc đúng một dạng.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddLevel("Part 1", "category")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dạng tranh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {part1Categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      {cat.status} · {cat.totalQuestions} câu
                    </p>
                  </div>

                  {/* 4 icon + Nút "Học ngay" */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditLevel(cat, e)}
                        title="Sửa dạng tranh"
                        className="hover:text-blue-600 transition cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteLevelConfirm(cat)}
                        title="Xóa dạng tranh"
                        className="hover:text-rose-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setVocabBagModalData({
                            title: `Từ vựng - ${cat.title}`,
                            items: cat.vocabBag,
                          })
                        }
                        title="Giỏ từ"
                        className="hover:text-blue-600 transition cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setTheoryModalData({
                            title: `Mẹo làm bài - ${cat.title}`,
                            summary: cat.theorySummary,
                            rules: cat.rules,
                          })
                        }
                        title="Lý thuyết & Mẹo"
                        className="hover:text-blue-600 transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenQuizPractice(cat)}
                        title="Làm lại"
                        className="hover:text-blue-600 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenQuizPractice(cat)}
                      className="px-4 py-1.5 rounded-full border border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer shadow-2xs"
                    >
                      Học ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

            {/* ======================================================== */}
      {/* NỘI DUNG 3: TAB PART 2 */}
      {/* ======================================================== */}
      {activeTab === "part2" && (
        <div className="space-y-8">
          {/* Header Part 2 Level */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Theo 4 Cấp độ điểm</h3>
              <p className="text-xs text-slate-500">Bộ đề Hỏi & Đáp phân cấp độ từ cơ bản đến phản xạ nâng cao.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAddLevel("Part 2", "level")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm cấp độ
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {part2Levels.map((lvl) => (
              <div
                key={lvl.id}
                className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {lvl.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {lvl.status} · {lvl.totalQuestions} câu
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditLevel(lvl, e)}
                      title="Sửa cấp độ"
                      className="hover:text-blue-600 transition cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteLevelConfirm(lvl)}
                      title="Xóa cấp độ"
                      className="hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setVocabBagModalData({
                          title: `Giỏ từ vựng - ${lvl.title}`,
                          items: lvl.vocabBag,
                        })
                      }
                      title="Giỏ từ"
                      className="hover:text-blue-600 transition cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTheoryModalData({
                          title: `Lý thuyết kỹ năng - ${lvl.title}`,
                          summary: lvl.theorySummary,
                          rules: lvl.rules,
                        })
                      }
                      title="Lý thuyết & Mẹo"
                      className="hover:text-blue-600 transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenQuizPractice(lvl)}
                      title="Làm lại"
                      className="hover:text-blue-600 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenQuizPractice(lvl)}
                    className="px-4 py-1.5 rounded-full border border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer shadow-2xs"
                  >
                    Học ngay
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Part 2 Categories */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Theo dạng câu hỏi</h3>
                <p className="text-xs text-slate-500">Phân loại câu hỏi Wh-, Yes/No, Lựa chọn và bẫy gián tiếp.</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddLevel("Part 2", "category")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dạng câu hỏi
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {part2Categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">{cat.title}</h3>
                    <p className="text-xs text-slate-500 mb-4">{cat.status} · {cat.totalQuestions} câu</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <button type="button" onClick={(e) => handleOpenEditLevel(cat, e)} title="Sửa dạng câu hỏi" className="hover:text-blue-600 transition cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setDeleteLevelConfirm(cat)} title="Xóa dạng câu hỏi" className="hover:text-rose-500 transition cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setVocabBagModalData({ title: `Từ vựng - ${cat.title}`, items: cat.vocabBag })} title="Giỏ từ" className="hover:text-blue-600 transition cursor-pointer">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setTheoryModalData({ title: `Mẹo làm bài - ${cat.title}`, summary: cat.theorySummary, rules: cat.rules })} title="Lý thuyết & Mẹo" className="hover:text-blue-600 transition cursor-pointer">
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => handleOpenQuizPractice(cat)} title="Làm lại" className="hover:text-blue-600 transition cursor-pointer">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button type="button" onClick={() => handleOpenQuizPractice(cat)} className="px-4 py-1.5 rounded-full border border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer shadow-2xs">
                      Học ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* NỘI DUNG 4: TAB PART 3 */}
      {/* ======================================================== */}
      {activeTab === "part3" && (
        <div className="space-y-8">
          {/* Header Part 3 Level */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Theo 4 Cấp độ điểm</h3>
              <p className="text-xs text-slate-500">Luyện nghe hiểu hội thoại Part 3 theo độ khó tăng dần.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAddLevel("Part 3", "level")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm cấp độ
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {part3Levels.map((lvl) => (
              <div
                key={lvl.id}
                className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{lvl.title}</h3>
                  <p className="text-xs text-slate-500 mb-4">{lvl.status} · {lvl.totalQuestions} câu</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <button type="button" onClick={(e) => handleOpenEditLevel(lvl, e)} title="Sửa cấp độ" className="hover:text-blue-600 transition cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => setDeleteLevelConfirm(lvl)} title="Xóa cấp độ" className="hover:text-rose-500 transition cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => setVocabBagModalData({ title: `Giỏ từ - ${lvl.title}`, items: lvl.vocabBag })} title="Giỏ từ" className="hover:text-blue-600 transition cursor-pointer">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => setTheoryModalData({ title: `Lý thuyết - ${lvl.title}`, summary: lvl.theorySummary, rules: lvl.rules })} title="Lý thuyết & Mẹo" className="hover:text-blue-600 transition cursor-pointer">
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleOpenQuizPractice(lvl)} title="Làm lại" className="hover:text-blue-600 transition cursor-pointer">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button type="button" onClick={() => handleOpenQuizPractice(lvl)} className="px-4 py-1.5 rounded-full border border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer shadow-2xs">
                    Học ngay
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Part 3 Categories */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Theo chủ đề hội thoại</h3>
                <p className="text-xs text-slate-500">Công sở, dịch vụ, hội thoại 3 người và bài đọc kèm sơ đồ.</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddLevel("Part 3", "category")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm chủ đề
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {part3Categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">{cat.title}</h3>
                    <p className="text-xs text-slate-500 mb-4">{cat.status} · {cat.totalQuestions} câu</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <button type="button" onClick={(e) => handleOpenEditLevel(cat, e)} title="Sửa chủ đề" className="hover:text-blue-600 transition cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setDeleteLevelConfirm(cat)} title="Xóa chủ đề" className="hover:text-rose-500 transition cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setVocabBagModalData({ title: `Từ vựng - ${cat.title}`, items: cat.vocabBag })} title="Giỏ từ" className="hover:text-blue-600 transition cursor-pointer">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setTheoryModalData({ title: `Mẹo - ${cat.title}`, summary: cat.theorySummary, rules: cat.rules })} title="Lý thuyết & Mẹo" className="hover:text-blue-600 transition cursor-pointer">
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => handleOpenQuizPractice(cat)} title="Làm lại" className="hover:text-blue-600 transition cursor-pointer">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button type="button" onClick={() => handleOpenQuizPractice(cat)} className="px-4 py-1.5 rounded-full border border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer shadow-2xs">
                      Học ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* NỘI DUNG 5: TAB PART 4 */}
      {/* ======================================================== */}
      {activeTab === "part4" && (
        <div className="space-y-8">
          {/* Header Part 4 Level */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Theo 4 Cấp độ điểm</h3>
              <p className="text-xs text-slate-500">Luyện nghe bài nói ngắn Part 4 theo mục tiêu điểm số.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAddLevel("Part 4", "level")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm cấp độ
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {part4Levels.map((lvl) => (
              <div
                key={lvl.id}
                className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{lvl.title}</h3>
                  <p className="text-xs text-slate-500 mb-4">{lvl.status} · {lvl.totalQuestions} câu</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <button type="button" onClick={(e) => handleOpenEditLevel(lvl, e)} title="Sửa cấp độ" className="hover:text-blue-600 transition cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => setDeleteLevelConfirm(lvl)} title="Xóa cấp độ" className="hover:text-rose-500 transition cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => setVocabBagModalData({ title: `Giỏ từ - ${lvl.title}`, items: lvl.vocabBag })} title="Giỏ từ" className="hover:text-blue-600 transition cursor-pointer">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => setTheoryModalData({ title: `Lý thuyết - ${lvl.title}`, summary: lvl.theorySummary, rules: lvl.rules })} title="Lý thuyết & Mẹo" className="hover:text-blue-600 transition cursor-pointer">
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleOpenQuizPractice(lvl)} title="Làm lại" className="hover:text-blue-600 transition cursor-pointer">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button type="button" onClick={() => handleOpenQuizPractice(lvl)} className="px-4 py-1.5 rounded-full border border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer shadow-2xs">
                    Học ngay
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Part 4 Categories */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Theo dạng bài nói</h3>
                <p className="text-xs text-slate-500">Thông báo ga tàu, hộp thư thoại, bản tin thời tiết & bài phát biểu.</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddLevel("Part 4", "category")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dạng bài nói
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {part4Categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">{cat.title}</h3>
                    <p className="text-xs text-slate-500 mb-4">{cat.status} · {cat.totalQuestions} câu</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <button type="button" onClick={(e) => handleOpenEditLevel(cat, e)} title="Sửa dạng bài nói" className="hover:text-blue-600 transition cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setDeleteLevelConfirm(cat)} title="Xóa dạng bài nói" className="hover:text-rose-500 transition cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setVocabBagModalData({ title: `Từ vựng - ${cat.title}`, items: cat.vocabBag })} title="Giỏ từ" className="hover:text-blue-600 transition cursor-pointer">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setTheoryModalData({ title: `Mẹo - ${cat.title}`, summary: cat.theorySummary, rules: cat.rules })} title="Lý thuyết & Mẹo" className="hover:text-blue-600 transition cursor-pointer">
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => handleOpenQuizPractice(cat)} title="Làm lại" className="hover:text-blue-600 transition cursor-pointer">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button type="button" onClick={() => handleOpenQuizPractice(cat)} className="px-4 py-1.5 rounded-full border border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer shadow-2xs">
                      Học ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: LUYỆN TẬP NGHE CHÉP CHÍNH TẢ (DICTATION STUDIO) */}
      {/* ======================================================== */}
      {dictationModalCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    Nghe chép chính tả: {dictationModalCard.part} (Test {dictationModalCard.testNumber})
                  </h3>
                  <p className="text-xs text-blue-100">
                    Nghe từng câu, gõ lại chính tả và đối chiếu kết quả tức thì
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDictationModalCard(null)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung bài nghe chép */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {dictationModalCard.questions[activeDictationQIndex] && (
                (() => {
                  const q = dictationModalCard.questions[activeDictationQIndex];
                  const userInput = dictationUserInputs[q.id] || "";
                  const isChecked = !!dictationChecked[q.id];
                  const isScriptShown = !!showDictationScript[q.id];
                  const isFlagged = flaggedReviewIds.includes(q.id);

                  return (
                    <div className="space-y-5">
                      {/* Thanh công cụ câu hỏi */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                          Câu {activeDictationQIndex + 1} / {dictationModalCard.questions.length}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleFlagReview(q.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            isFlagged
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? "fill-amber-600 text-amber-600" : ""}`} />
                          {isFlagged ? "Đã lưu vào câu cần luyện lại" : "Lưu vào câu cần luyện lại"}
                        </button>
                      </div>

                      {/* Hình ảnh (nếu Part 1) */}
                      {q.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 max-w-sm mx-auto shadow-xs">
                          <img src={q.imageUrl} alt="Part 1 Illustration" className="w-full h-48 object-cover" />
                        </div>
                      )}

                      {/* Trình phát Audio nghe có chỉnh tốc độ */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                            className="w-11 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition cursor-pointer"
                          >
                            {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                          </button>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Bấm nghe câu thoại</p>
                            <p className="text-[11px] text-slate-400">Nghe lại nhiều lần nếu cần</p>
                          </div>
                        </div>

                        {/* Tốc độ phát */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Tốc độ:</span>
                          {(["0.8", "1.0", "1.2"] as const).map((spd) => (
                            <button
                              key={spd}
                              type="button"
                              onClick={() => {
                                playSfx("click");
                                setAudioSpeed(spd);
                                triggerToast(`Đã đổi tốc độ phát sang ${spd}x`);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                audioSpeed === spd
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {spd}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Ô nhập chính tả */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                          <Languages className="w-4 h-4 text-blue-600" />
                          Gõ những từ bạn nghe được vào đây:
                        </label>
                        <textarea
                          rows={3}
                          value={userInput}
                          placeholder="Gõ chính tả câu bạn vừa nghe được tại đây..."
                          onChange={(e) => setDictationUserInputs({ ...dictationUserInputs, [q.id]: e.target.value })}
                          className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 leading-relaxed font-sans"
                        />
                      </div>

                      {/* Nút Kiểm tra và Hiện Transcript */}
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleCheckDictation(q.id)}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                          Kiểm tra chính tả
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowDictationScript((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {isScriptShown ? "Ẩn đáp án & Lời thoại" : "Xem đáp án & Dịch nghĩa"}
                        </button>
                      </div>

                      {/* Hiển thị đối chiếu kết quả */}
                      {isChecked && (
                        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2 text-xs leading-relaxed animate-in fade-in">
                          <p className="font-bold text-blue-900">Audio Script chuẩn:</p>
                          <p className="text-sm font-semibold text-blue-950 font-serif bg-white p-3 rounded-xl border border-blue-100">
                            {q.fullTranscript}
                          </p>
                          <p className="text-slate-600 italic">
                            <span className="font-bold text-slate-700">Dịch nghĩa:</span> {q.vietnameseTranslation}
                          </p>
                        </div>
                      )}

                      {/* Điều hướng câu trước / câu sau */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <button
                          type="button"
                          disabled={activeDictationQIndex === 0}
                          onClick={() => setActiveDictationQIndex((prev) => Math.max(0, prev - 1))}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
                        >
                          Câu trước
                        </button>

                        <button
                          type="button"
                          disabled={activeDictationQIndex === dictationModalCard.questions.length - 1}
                          onClick={() => setActiveDictationQIndex((prev) => Math.min(dictationModalCard.questions.length - 1, prev + 1))}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 transition cursor-pointer"
                        >
                          Câu tiếp theo
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: HỌC NGAY TRẮC NGHIỆM (QUIZ PRACTICE MODAL) */}
      {/* ======================================================== */}
            {/* ======================================================== */}
      {/* MODAL 2: HỌC NGAY TRẮC NGHIỆM (QUIZ PRACTICE MODAL) */}
      {/* ======================================================== */}
      {quizModalCard && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-screen overflow-hidden font-sans text-slate-900 animate-in fade-in duration-150">
          {/* --- TOP HEADER BAR --- */}
          <header className="h-14 bg-[#1e60f0] text-white px-4 sm:px-6 flex items-center justify-between shadow-md shrink-0 select-none">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQuizModalCard(null)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Thoát</span>
              </button>

              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                {quizModalCard.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => triggerToast(showBilingualQuiz ? "Đã tắt hiển thị song ngữ" : "Đã bật dịch song ngữ Tiếng Việt 👑")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-amber-950 ring-2 ring-amber-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>Song ngữ 👑</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast("Mở ghi chú bài học!")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-800 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Ghi chú</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast("Mở công cụ vẽ Annotator!")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-800 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Annotator</span>
              </button>

              <button
                type="button"
                onClick={() => {
                                playSfx("click");
                  const next = !isSfxEnabled;
                  setIsSfxEnabled(next);
                  setIsPlayingAudio(next);
                  if (next) playSfx("correct");
                  else playSfx("click");
                  triggerToast(next ? "🔊 Đã bật âm thanh SFX chọn đáp án 👑" : "⏸ Đã tắt âm thanh SFX");
                }}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  isPlayingAudio
                    ? "bg-amber-400 text-amber-950 shadow-xs animate-pulse"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
                title={isPlayingAudio ? "Đang bật âm thanh - Bấm để tắt" : "Đang tắt âm thanh - Bấm để bật"}
              >
                {isPlayingAudio ? <Bell className="w-4 h-4 text-amber-950" /> : <BellOff className="w-4 h-4 text-white" />}
              </button>

              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/20 text-white text-xs font-mono font-bold shadow-2xs">
                  <Clock className="w-3.5 h-3.5" />
                  00:02
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/90 text-white text-xs font-extrabold shadow-2xs">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  0
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/90 text-white text-xs font-extrabold shadow-2xs">
                  ✓ {quizModalCard.correctCount}/{quizModalCard.totalQuestions}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-700 text-white text-xs font-bold shadow-2xs font-mono">
                  Câu {activeQuizQIndex + 1}/{quizModalCard.questions.length}
                </span>
              </div>
            </div>
          </header>

          {/* --- MAIN DUAL PANE PRACTICE AREA --- */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
            {quizModalCard.questions[activeQuizQIndex] && (() => {
              const q = quizModalCard.questions[activeQuizQIndex];
              const chosenOpt = quizSelectedOption[q.id];
              const isChecked = !!quizAnswerChecked[q.id];
              const isCorrect = chosenOpt === q.correctAnswer;
              const vocabItems = q.vocabList || [
                { word: "rug", pos: "n", level: "B2", ipa: "/rʌɡ/", meaning: "tấm thảm" },
                { word: "doorknob", pos: "n", level: "C1", ipa: "/ˈdɔːrnɑːb/", meaning: "nắm cửa" },
                { word: "climb", pos: "v", level: "B1", ipa: "/klaɪm/", meaning: "leo" },
                { word: "ladder", pos: "n", level: "B1", ipa: "/ˈlædər/", meaning: "cái thang" },
              ];

              return (
                <React.Fragment>
                  {/* LEFT PANE: INSTRUCTION & AUDIO / PHOTOGRAPH CONTENT */}
                  <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-[#fafafa] border-r border-slate-200/80 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Yêu cầu bài tập (Instruction)
                      </div>
                      <h2 className="text-sm font-bold text-slate-800 leading-relaxed">
                        {(() => {
                          const p = q.part || quizModalCard.part;
                          if (p === "Part 1") return "Listen to the audio and select the best statement describing the photograph.";
                          if (p === "Part 2") return "Listen to the question and select the best response.";
                          if (p === "Part 3") return "Listen to the conversation and answer the questions below.";
                          if (p === "Part 4") return "Listen to the talk and answer the questions below.";
                          return "Listen to the audio and answer the questions.";
                        })()}
                      </h2>

                      {/* Audio Player Box */}
                      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-md shrink-0 cursor-pointer"
                          >
                            {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                          </button>
                          
                          <div className="flex-1 flex items-center gap-1 h-9 px-3 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                            {[40, 65, 30, 85, 95, 40, 60, 30, 75, 90, 50, 35, 70, 80, 45, 90, 60, 40, 80, 50, 30, 70, 85, 40].map((h, i) => (
                              <div
                                key={i}
                                className={`flex-1 rounded-full transition-all duration-300 ${
                                  isPlayingAudio ? "bg-blue-600 animate-pulse" : "bg-slate-300"
                                }`}
                                style={{ height: `${isPlayingAudio ? Math.max(20, (h * (i % 3 + 1)) % 100) : h}%` }}
                              />
                            ))}
                          </div>

                          <span className="font-mono text-xs font-bold text-slate-600 shrink-0">
                            00:00 / 00:00
                          </span>
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                            1x
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-1.5">
                            <button type="button" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer">
                              ↺ 3s
                            </button>
                            <button type="button" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer">
                              ↺ 5s
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                            <span><kbd className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Ctrl</kbd> Phát/Dừng</span>
                            <span><kbd className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">1-4</kbd> Chọn đáp án</span>
                          </div>
                        </div>
                      </div>

                      {/* Photograph Image */}
                      {q.imageUrl && (
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-center overflow-hidden">
                          <img
                            src={q.imageUrl}
                            alt="Part 1 Photograph"
                            className="max-h-[380px] w-auto max-w-full rounded-xl object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT PANE: QUESTION & OPTIONS */}
                  <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white flex flex-col justify-between space-y-6">
                    {(() => {
                      const isGroupPart = quizModalCard.part === "Part 3" || quizModalCard.part === "Part 4";

                      if (isGroupPart) {
                        const isAllGroupAnswered = quizModalCard.questions.every(
                          (q) => !!quizSelectedOption[q.id]
                        );

                        // Consolidated vocabulary list across all questions in the set
                        const combinedVocabItems = (() => {
                          const map = new Map<string, { word: string; pos: string; level: string; ipa: string; meaning: string }>();
                          quizModalCard.questions.forEach((q) => {
                            const list = q.vocabList || [
                              { word: "pottery", pos: "n", level: "B2", ipa: "/ˈpɑːtəri/", meaning: "xưởng gốm" },
                              { word: "demonstrate", pos: "v", level: "B2", ipa: "/ˈdemənstreɪt/", meaning: "trình diễn" },
                            ];
                            list.forEach((item) => map.set(item.word, item));
                          });
                          return Array.from(map.values());
                        })();

                        return (
                          <div className="space-y-5">
                            {/* Group Header */}
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-2 shrink-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold tracking-wide shadow-2xs">
                                  {quizModalCard.targetLevel || "Lv.2"}
                                </span>
                                <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
                                  {quizModalCard.title.includes("Nhóm") ? quizModalCard.title : "Nhóm câu 83-85"}
                                </span>
                                <span className="text-xs text-slate-500 font-semibold">
                                  ({quizModalCard.questions.length} câu hỏi)
                                </span>
                                {!isAllGroupAnswered && (
                                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                    Vui lòng chọn hết đáp án ({Object.keys(quizSelectedOption).filter(id => quizModalCard.questions.some(q => q.id === Number(id))).length}/{quizModalCard.questions.length})
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => triggerToast("Trợ lý AI đang sẵn sàng giải đáp câu hỏi của bạn!")}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer shrink-0"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>Hỏi bài</span>
                              </button>
                            </div>

                            {/* Render All Questions in Group */}
                            <div className="space-y-6">
                              {quizModalCard.questions.map((qItem, idx) => {
                                const chosenOpt = quizSelectedOption[qItem.id];
                                const isChecked = isAllGroupAnswered || !!quizAnswerChecked[qItem.id];
                                const qNumDisplay = 83 + idx;
                                const qPrompt = qItem.question || (
                                  idx === 0 ? "What type of business does the speaker own?" :
                                  idx === 1 ? 'What does the speaker imply when she says, "you\'ve worked here for five months now"?' :
                                  "What will the speakers do next?"
                                );

                                return (
                                  <div key={qItem.id} className="p-5 rounded-3xl border-2 border-blue-200/90 bg-white shadow-xs relative space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="text-sm font-extrabold text-slate-900 leading-snug">
                                        {qNumDisplay}. {qPrompt}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleToggleFlagReview(qItem.id)}
                                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                          flaggedReviewIds.includes(qItem.id)
                                            ? "border-amber-300 bg-amber-50 text-amber-500"
                                            : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                        }`}
                                      >
                                        <Star className={`w-4 h-4 ${flaggedReviewIds.includes(qItem.id) ? "fill-amber-400 text-amber-500" : ""}`} />
                                      </button>
                                    </div>

                                    {/* Options */}
                                    {qItem.options && (
                                      <div className="space-y-2.5">
                                        {Object.entries(qItem.options).map(([optKey, optVal]) => {
                                          const isChosen = chosenOpt === optKey;
                                          const isRight = optKey === qItem.correctAnswer;
                                          const optTrans = qItem.optionTranslations ? qItem.optionTranslations[optKey] : "";

                                          let cardStyle = "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800";
                                          let iconNode = (
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                                              {isChosen && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                            </div>
                                          );
                                          let textColor = "text-slate-900";

                                          if (isChosen && !isChecked) {
                                            cardStyle = "bg-blue-50/70 border-blue-500 text-blue-950 font-semibold ring-1 ring-blue-400/30";
                                          }

                                          if (isChecked) {
                                            if (isRight) {
                                              cardStyle = "bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                                              textColor = "text-emerald-700 font-bold";
                                              iconNode = (
                                                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-black">
                                                  ✓
                                                </div>
                                              );
                                            } else if (isChosen) {
                                              cardStyle = "bg-rose-50/90 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-400/20";
                                              textColor = "text-rose-700 font-bold";
                                              iconNode = (
                                                <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 text-xs font-black">
                                                  ✕
                                                </div>
                                              );
                                            }
                                          }

                                          return (
                                            <div
                                              key={optKey}
                                              onClick={() => {
                                playSfx("click");
                                                if (isChecked) return;
                                                const nextSelected = { ...quizSelectedOption, [qItem.id]: optKey };
                                                setQuizSelectedOption(nextSelected);

                                                const allDone = quizModalCard.questions.every((q) => !!nextSelected[q.id]);
                                                if (allDone) {
                                                  const nextChecked = { ...quizAnswerChecked };
                                                  quizModalCard.questions.forEach((q) => {
                                                    nextChecked[q.id] = true;
                                                  });
                                                  setQuizAnswerChecked(nextChecked);
                                                }
                                              }}
                                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${cardStyle}`}
                                            >
                                              <div className="flex items-center gap-3">
                                                {iconNode}
                                                <span className={`text-sm ${textColor}`}>
                                                  ({optKey}) {optVal}
                                                </span>
                                              </div>

                                              {isChecked && (
                                                <div className="flex items-center gap-2 pl-8 pt-0.5">
                                                  <span className="text-blue-500 font-bold text-xs">|</span>
                                                  <span className="text-xs font-semibold text-blue-700">
                                                    {optTrans || "Dịch nghĩa đáp án theo ngữ cảnh."}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* SINGLE CONSOLIDATED VOCABULARY CONTAINER FOR THE ENTIRE GROUP */}
                            {isAllGroupAnswered && combinedVocabItems.length > 0 && (
                              <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-3 mt-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                                    <BookOpen className="w-4 h-4 text-amber-600" />
                                    <span>Từ vựng nên học (Tất cả các câu trong đề)</span>
                                  </div>

                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={showVocabListToggle}
                                      onChange={(e) => setShowVocabListToggle(e.target.checked)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                  </label>
                                </div>

                                {showVocabListToggle && (
                                  <div className="bg-white rounded-xl border border-amber-200 p-3 space-y-3 shadow-2xs">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
                                      <span>{combinedVocabItems.length} từ</span>

                                      <div className="flex items-center gap-2">
                                        <button type="button" className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer">
                                          <Eye className="w-3.5 h-3.5" /> Chi tiết
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                playSfx("click");
                                            setAddedVocabItems(combinedVocabItems.map((v) => v.word));
                                            triggerToast(`Đã thêm tất cả ${combinedVocabItems.length} từ vào giỏ! ✨`);
                                          }}
                                          className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                                        >
                                          + Thêm tất cả ({combinedVocabItems.length})
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                      {combinedVocabItems.map((v, vIdx) => {
                                        const isAdded = addedVocabItems.includes(v.word);
                                        return (
                                          <div key={vIdx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                                            <div className="space-y-0.5">
                                              <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900">{v.word}</span>
                                                <span className="italic text-slate-500 font-semibold">{v.pos}</span>
                                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">{v.level}</span>
                                              </div>
                                              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                                                <span>{v.ipa}</span>
                                                <button
                                                  type="button"
                                                  onClick={() => playAudio(v.word)}
                                                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                                >
                                                  <Volume2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                              <p className="font-bold text-slate-800">{v.meaning}</p>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <button
                                                type="button"
                                                onClick={() => triggerToast(`Đã gắn cờ báo lỗi từ "${v.word}"`)}
                                                className="p-1 rounded text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                                title="Báo lỗi từ vựng"
                                              >
                                                ⚐
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() => {
                                playSfx("click");
                                                  if (isAdded) {
                                                    setAddedVocabItems(addedVocabItems.filter((item) => item !== v.word));
                                                    triggerToast(`Đã bỏ từ "${v.word}"`);
                                                  } else {
                                                    setAddedVocabItems([...addedVocabItems, v.word]);
                                                    triggerToast(`✨ Đã thêm từ "${v.word}" vào giỏ!`);
                                                  }
                                                }}
                                                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                                                  isAdded
                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                    : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
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
                            )}
                          </div>
                        );
                      }

                      // Single Question Mode (Part 1, Part 2)
                      const q = quizModalCard.questions[activeQuizQIndex] || quizModalCard.questions[0];
                      const chosenOpt = quizSelectedOption[q.id];
                      const isChecked = !!quizAnswerChecked[q.id];
                      const vocabItems = q.vocabList || [
                        { word: "rug", pos: "n", level: "B2", ipa: "/rʌɡ/", meaning: "tấm thảm" },
                        { word: "doorknob", pos: "n", level: "C1", ipa: "/ˈdɔːrnɑːb/", meaning: "nắm cửa" },
                        { word: "climb", pos: "v", level: "B1", ipa: "/klaɪm/", meaning: "leo" },
                        { word: "ladder", pos: "n", level: "B1", ipa: "/ˈlædər/", meaning: "cái thang" },
                      ];

                      return (
                        <div className="space-y-5">
                          <div className="p-6 rounded-3xl border-2 border-blue-200/90 bg-white shadow-xs relative space-y-5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold tracking-wide shadow-2xs">
                                {quizModalCard.targetLevel || "Lv.1"}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => triggerToast("Trợ lý AI đang sẵn sàng giải đáp câu hỏi của bạn!")}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                                >
                                  <HelpCircle className="w-3.5 h-3.5" />
                                  <span>Hỏi bài</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleFlagReview(q.id)}
                                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                                    flaggedReviewIds.includes(q.id)
                                      ? "border-amber-300 bg-amber-50 text-amber-500"
                                      : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  <Star className={`w-4 h-4 ${flaggedReviewIds.includes(q.id) ? "fill-amber-400 text-amber-500" : ""}`} />
                                </button>
                              </div>
                            </div>

                            <div className="text-base font-extrabold text-slate-900">
                              {activeQuizQIndex + 1}.
                            </div>

                            {/* OPTIONS LIST */}
                            {q.options && (() => {
                              const currentPart = q.part || quizModalCard.part;
                              const isPart1 = currentPart === "Part 1";
                              const isPart2 = currentPart === "Part 2";
                              const hideTextBeforeCheck = isPart1 || isPart2;

                              let entries = Object.entries(q.options);
                              if (isPart2) {
                                entries = entries.filter(([optKey]) => optKey !== "D");
                              }

                              return (
                                <div className="space-y-3">
                                  {entries.map(([optKey, optVal]) => {
                                    const isChosen = chosenOpt === optKey;
                                    const isRight = optKey === q.correctAnswer;
                                    const optTrans = q.optionTranslations ? q.optionTranslations[optKey] : "";

                                    let cardStyle = "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800";
                                    let iconNode = (
                                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                                        {isChosen && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                      </div>
                                    );
                                    let textColor = "text-slate-900";

                                    if (isChecked) {
                                      if (isRight) {
                                        cardStyle = "bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                                        textColor = "text-emerald-700 font-bold";
                                        iconNode = (
                                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-black">
                                            ✓
                                          </div>
                                        );
                                      } else if (isChosen) {
                                        cardStyle = "bg-rose-50/90 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-400/20";
                                        textColor = "text-rose-700 font-bold";
                                        iconNode = (
                                          <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 text-xs font-black">
                                            ✕
                                          </div>
                                        );
                                      }
                                    }

                                    const labelText = (!isChecked && hideTextBeforeCheck) ? `(${optKey})` : `(${optKey}) ${optVal}`;

                                    return (
                                      <div
                                        key={optKey}
                                        onClick={() => {
                                playSfx("click");
                                          if (isChecked) return;
                                          setQuizSelectedOption({ ...quizSelectedOption, [q.id]: optKey });
                                          setQuizAnswerChecked({ ...quizAnswerChecked, [q.id]: true });
                                        }}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${cardStyle}`}
                                      >
                                        <div className="flex items-center gap-3">
                                          {iconNode}
                                          <span className={`text-sm ${textColor}`}>
                                            {labelText}
                                          </span>
                                        </div>

                                        {/* Translation when checked */}
                                        {isChecked && (
                                          <div className="flex items-center gap-2 pl-8 pt-0.5">
                                            <span className="text-blue-500 font-bold text-xs">|</span>
                                            <span className="text-xs font-semibold text-blue-700">
                                              {optTrans || "Dịch nghĩa đáp án theo ngữ cảnh."}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>

                          {/* CONTAINER "TỪ VỰNG NÊN HỌC" */}
                          {isChecked && (
                            <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                                  <BookOpen className="w-4 h-4 text-amber-600" />
                                  <span>Từ vựng nên học</span>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={showVocabListToggle}
                                    onChange={(e) => setShowVocabListToggle(e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </div>

                              {showVocabListToggle && (
                                <div className="bg-white rounded-xl border border-amber-200 p-3 space-y-3 shadow-2xs">
                                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
                                    <span>{vocabItems.length} từ</span>

                                    <div className="flex items-center gap-2">
                                      <button type="button" className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer">
                                        <Eye className="w-3.5 h-3.5" /> Chi tiết
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                playSfx("click");
                                          setAddedVocabItems(vocabItems.map((v) => v.word));
                                          triggerToast(`Đã thêm tất cả ${vocabItems.length} từ vào giỏ! ✨`);
                                        }}
                                        className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                                      >
                                        + Thêm tất cả ({vocabItems.length})
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                                    {vocabItems.map((v, idx) => {
                                      const isAdded = addedVocabItems.includes(v.word);
                                      return (
                                        <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                                          <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-slate-900">{v.word}</span>
                                              <span className="italic text-slate-500 font-semibold">{v.pos}</span>
                                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">{v.level}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                                              <span>{v.ipa}</span>
                                              <button
                                                type="button"
                                                onClick={() => playAudio(v.word)}
                                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                              >
                                                <Volume2 className="w-3 h-3" />
                                              </button>
                                            </div>
                                            <p className="font-bold text-slate-800">{v.meaning}</p>
                                          </div>

                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => triggerToast(`Đã gắn cờ báo lỗi từ "${v.word}"`)}
                                              className="p-1 rounded text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                              title="Báo lỗi từ vựng"
                                            >
                                              ⚐
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() => {
                                playSfx("click");
                                                if (isAdded) {
                                                  setAddedVocabItems(addedVocabItems.filter((item) => item !== v.word));
                                                  triggerToast(`Đã bỏ từ "${v.word}"`);
                                                } else {
                                                  setAddedVocabItems([...addedVocabItems, v.word]);
                                                  triggerToast(`✨ Đã thêm từ "${v.word}" vào giỏ!`);
                                                }
                                              }}
                                              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                                                isAdded
                                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                  : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
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
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </React.Fragment>
              );
            })()}
          </div>

          {/* --- BOTTOM NAVIGATION BAR --- */}
          <footer className="h-14 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
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
                onClick={() => triggerToast("Mở giỏ từ vựng cá nhân!")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                <span>Giỏ từ ({addedVocabItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast("Mở công cụ tra từ nhanh!")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>Tra từ</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeQuizQIndex === 0}
                onClick={() => setActiveQuizQIndex((prev) => Math.max(0, prev - 1))}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Câu trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => triggerToast("Xem danh sách câu hỏi!")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer"
              >
                <Grid className="w-4 h-4" />
                <span>{activeQuizQIndex + 1}/{quizModalCard.questions.length}</span>
              </button>

              <button
                type="button"
                disabled={activeQuizQIndex === quizModalCard.questions.length - 1}
                onClick={() => setActiveQuizQIndex((prev) => Math.min(quizModalCard.questions.length - 1, prev + 1))}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Câu tiếp"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3:
      {/* MODAL 3: GIỎ TỪ VỰNG (SHOPPING BAG MODAL) */}
      {/* ======================================================== */}
      {vocabBagModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{vocabBagModalData.title}</h3>
                  <p className="text-[11px] text-slate-500">Từ vựng trọng điểm cần ghi nhớ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVocabBagModalData(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {vocabBagModalData.items.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Chưa có từ vựng nào trong danh mục này.</p>
              ) : (
                vocabBagModalData.items.map((it, idx) => {
                  const isSaved = savedVocabBag.includes(it.word);

                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/90 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{it.word}</span>
                          <span className="text-[11px] font-mono text-blue-600 font-semibold">{it.ipa}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{it.meaning}</p>
                        {it.example && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">&quot;{it.example}&quot;</p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleSaveWord(it.word)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                          isSaved
                            ? "bg-amber-100 text-amber-700 border-amber-300"
                            : "bg-white text-slate-400 border-slate-200 hover:text-blue-600"
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-amber-600" : ""}`} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => setVocabBagModalData(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: LÝ THUYẾT & MẸO (THEORY MODAL) */}
      {/* ======================================================== */}
      {theoryModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{theoryModalData.title}</h3>
                  <p className="text-[11px] text-slate-500">Mẹo tránh bẫy và quy tắc làm bài</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTheoryModalData(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-blue-900 leading-relaxed">
                <p className="font-bold mb-1">Tóm tắt kỹ năng:</p>
                <p>{theoryModalData.summary}</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Quy tắc & Bẫy thường gặp:
                </p>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-600 leading-relaxed">
                  {theoryModalData.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTheoryModalData(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: XÓA TIẾN ĐỘ (DELETE MODAL) */}
      {/* ======================================================== */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Xóa tiến độ {deleteConfirmTarget.title}?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thao tác này sẽ đặt lại toàn bộ số câu đã làm, số câu đúng/sai về trạng thái &quot;Chưa luyện tập&quot;.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProgress}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: CÂU CẦN LUYỆN LẠI */}
      {/* ======================================================== */}
      {showReviewQuestionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 fill-amber-600 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Danh sách câu cần luyện lại</h3>
                  <p className="text-[11px] text-slate-500">Các câu hỏi bạn đã đánh dấu để ôn tập thêm</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewQuestionsModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {flaggedReviewIds.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  Hiện không có câu nào được đánh dấu cần luyện lại.
                </p>
              ) : (
                SAMPLE_DICTATION_QUESTIONS.filter((q) => flaggedReviewIds.includes(q.id)).map((q) => (
                  <div key={q.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                        {q.part} • Câu {q.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleFlagReview(q.id)}
                        className="text-xs text-rose-500 hover:underline font-semibold"
                      >
                        Bỏ đánh dấu
                      </button>
                    </div>

                    <p className="text-xs font-semibold text-slate-800">{q.fullTranscript}</p>
                    <p className="text-xs text-slate-500 italic">{q.vietnameseTranslation}</p>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowReviewQuestionsModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: THÊM / SỬA BÀI NGHE CHÉP (DICTATION) */}
      {/* ======================================================== */}
      {showDictationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Quản lý nội dung</span>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingDictationCard ? "Chỉnh sửa bài nghe" : "Thêm bài nghe chép mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDictationModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDictation} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Test số</label>
                  <select
                    value={dictationFormTestNum}
                    onChange={(e) => setDictationFormTestNum(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value={1}>Test 1</option>
                    <option value={2}>Test 2</option>
                    <option value={3}>Test 3</option>
                    <option value={4}>Test 4</option>
                    <option value={5}>Test 5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phần thi (Part)</label>
                  <select
                    value={dictationFormPart}
                    onChange={(e) => setDictationFormPart(e.target.value as "Part 1" | "Part 2" | "Part 3" | "Part 4")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="Part 1">Part 1 (Mô tả tranh)</option>
                    <option value="Part 2">Part 2 (Hỏi & Đáp)</option>
                    <option value="Part 3">Part 3 (Hội thoại)</option>
                    <option value="Part 4">Part 4 (Bài nói)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Năm đề thi</label>
                  <select
                    value={dictationFormYear}
                    onChange={(e) => setDictationFormYear(e.target.value as "2026" | "2024" | "2023" | "2022")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="2026">ETS 2026</option>
                    <option value="2024">ETS 2024</option>
                    <option value="2023">ETS 2023</option>
                    <option value="2022">ETS 2022</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số câu hỏi</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={dictationFormQuestions}
                    onChange={(e) => setDictationFormQuestions(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDictationModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingDictationCard ? "Lưu thay đổi" : "Tạo bài nghe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: XÁC NHẬN XÓA BÀI NGHE CHÉP */}
      {/* ======================================================== */}
      {deleteDictationConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Xóa bài nghe chép?</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa bài {deleteDictationConfirm.part} (Test {deleteDictationConfirm.testNumber}) năm {deleteDictationConfirm.year}? Dữ liệu sẽ không thể khôi phục.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteDictationConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDictationCard}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: THÊM / SỬA CHỦ ĐIỂM LUYỆN NGHE (LEVEL / CATEGORY) */}
      {/* ======================================================== */}
      {showLevelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{levelFormPart}</span>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingLevelCard ? "Chỉnh sửa chủ điểm" : "Thêm chủ điểm luyện nghe mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLevelModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLevel} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề chủ điểm *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Level 5 – 450–495 hoặc Tranh phong cảnh"
                  value={levelFormTitle}
                  onChange={(e) => setLevelFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phần thi</label>
                  <select
                    value={levelFormPart}
                    onChange={(e) => setLevelFormPart(e.target.value as "Part 1" | "Part 2" | "Part 3" | "Part 4")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="Part 1">Part 1</option>
                    <option value="Part 2">Part 2</option>
                    <option value="Part 3">Part 3</option>
                    <option value="Part 4">Part 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số câu hỏi</label>
                  <input
                    type="number"
                    min={1}
                    value={levelFormQuestions}
                    onChange={(e) => setLevelFormQuestions(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lý thuyết kỹ năng / Tóm tắt</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả kỹ năng cần thiết để xử lý dạng câu hỏi này..."
                  value={levelFormTheory}
                  onChange={(e) => setLevelFormTheory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quy tắc / Mẹo làm bài (mỗi dòng 1 mẹo)</label>
                <textarea
                  rows={3}
                  placeholder="Bẫy từ vựng cần tránh...&#10;Cấu trúc thường gặp..."
                  value={levelFormRules}
                  onChange={(e) => setLevelFormRules(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLevelModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingLevelCard ? "Lưu thay đổi" : "Tạo chủ điểm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: XÁC NHẬN XÓA CHỦ ĐIỂM (LEVEL / CATEGORY) */}
      {/* ======================================================== */}
      {deleteLevelConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Xóa chủ điểm luyện nghe?</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa &quot;{deleteLevelConfirm.title}&quot;? Mọi tiến độ và câu hỏi trong chủ điểm này sẽ bị xóa.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteLevelConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLevelCard}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
