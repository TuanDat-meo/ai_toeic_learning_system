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
  Eye,
} from "lucide-react";

// --- TYPES & INTERFACES ---
export interface DictationQuestion {
  id: number;
  part: "Part 1" | "Part 2" | "Part 3" | "Part 4";
  audioUrl: string;
  imageUrl?: string;
  fullTranscript: string;
  vietnameseTranslation: string;
  options?: { [key: string]: string };
  correctAnswer?: string;
  explanation: string;
  trapNote?: string;
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
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    fullTranscript: "Some executives are seated around a conference table in the boardroom.",
    vietnameseTranslation: "Một số chuyên viên điều hành đang ngồi quanh chiếc bàn hội nghị trong phòng họp.",
    options: {
      A: "Some executives are seated around a conference table.",
      B: "Documents are being filed in the cabinet.",
      C: "A presentation is currently being displayed.",
      D: "The office windows are being replaced.",
    },
    correctAnswer: "A",
    explanation: "Động từ 'are seated around' miêu tả chính xác trạng thái ngồi quanh bàn của các nhân sự trong ảnh.",
    trapNote: "Bẫy thì tiếp diễn dạng bị động: 'are being filed' miêu tả hành động đang được thực hiện bởi người khác, không có trong hình.",
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
  // Part 3
  {
    id: 5,
    part: "Part 3",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    fullTranscript: "The client requested an expedited delivery for the customized promotional banners.",
    vietnameseTranslation: "Khách hàng đã yêu cầu giao hàng nhanh hỏa tốc cho các biểu ngữ quảng cáo tùy chỉnh.",
    options: {
      A: "A revised invoice calculation error.",
      B: "An expedited shipping request for banners.",
      C: "A scheduled software update interruption.",
      D: "A sudden venue cancellation.",
    },
    correctAnswer: "B",
    explanation: "Đoạn hội thoại đề cập cụm từ 'expedited delivery for the customized promotional banners'.",
    trapNote: "Bẫy từ đồng nghĩa: 'expedited delivery' tương đương với 'expedited shipping'.",
  },
  // Part 4
  {
    id: 6,
    part: "Part 4",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    fullTranscript: "Attention passengers on flight two forty eight to Vancouver, the departure gate has been relocated.",
    vietnameseTranslation: "Xin hành khách trên chuyến bay 248 đến Vancouver chú ý, cổng khởi hành đã được chuyển sang vị trí mới.",
    options: {
      A: "A boarding gate location change.",
      B: "A flight cancellation due to fog.",
      C: "A baggage claim conveyor breakdown.",
      D: "A complimentary meal voucher offer.",
    },
    correctAnswer: "A",
    explanation: "Thông báo sân bay thông báo về việc thay đổi cổng lên máy bay ('gate has been relocated').",
    trapNote: "Bẫy số hiệu chuyến bay và thông tin hành lý.",
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
    questions: [SAMPLE_DICTATION_QUESTIONS[4]],
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
    questions: [SAMPLE_DICTATION_QUESTIONS[5]],
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
    questions: [SAMPLE_DICTATION_QUESTIONS[4]],
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
    questions: [SAMPLE_DICTATION_QUESTIONS[5]],
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
    questions: [SAMPLE_DICTATION_QUESTIONS[4]],
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
    questions: [SAMPLE_DICTATION_QUESTIONS[5]],
  },
];

// --- DỮ LIỆU BAN ĐẦU CHO TAB "PART 1" (ẢNH 3 & 4) ---
const INITIAL_PART1_LEVELS: LevelCategoryCardData[] = [
  {
    id: "p1-l1",
    part: "Part 1",
    type: "level",
    title: "Level 1 – Dưới 200",
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
    title: "Level 2 – 200–300",
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
    title: "Level 3 – 300–400",
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
    title: "Level 4 – 400–495",
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
    title: "Level 1 – Dưới 200",
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
    title: "Level 2 – 200–300",
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
    title: "Level 3 – 300–400",
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
    title: "Level 4 – 400–495",
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
    title: "Level 1 – Dưới 200",
    totalQuestions: 50,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Hội thoại 2 người với câu hỏi nghe từ khóa trực diện trong câu đầu tiên.",
    rules: ["Đọc lướt 3 câu hỏi trước khi audio bắt đầu."],
    vocabBag: [{ word: "reception", ipa: "/rɪˈsepʃn/", meaning: "Quầy lễ tân" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[4]],
  },
  {
    id: "p3-l2",
    part: "Part 3",
    type: "level",
    title: "Level 2 – 200–300",
    totalQuestions: 80,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Hội thoại công sở về đặt vé, giao hàng, đổi lịch họp.",
    rules: ["Để ý ai nói gì (man vs woman)."],
    vocabBag: [{ word: "reschedule", ipa: "/ˌriːˈskedʒuːl/", meaning: "Đổi lại lịch trình" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[4]],
  },
  {
    id: "p3-l3",
    part: "Part 3",
    type: "level",
    title: "Level 3 – 300–400",
    totalQuestions: 110,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Hội thoại 3 người và câu hỏi suy luận ngụ ý câu nói.",
    rules: ["Câu hỏi 'What does the speaker imply' đòi hỏi hiểu ngữ cảnh."],
    vocabBag: [{ word: "feasibility", ipa: "/ˌfiːzəˈbɪləti/", meaning: "Tính khả thi" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[4]],
  },
  {
    id: "p3-l4",
    part: "Part 3",
    type: "level",
    title: "Level 4 – 400–495",
    totalQuestions: 60,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Hội thoại kết hợp sơ đồ, bản đồ và biểu đồ hình ảnh (Graphics).",
    rules: ["Nhìn thông tin trên biểu đồ và nghe dữ kiện đối chiếu."],
    vocabBag: [{ word: "discrepancy", ipa: "/dɪˈskrepənsi/", meaning: "Sự sai khác số liệu" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[4]],
  },
];

const INITIAL_PART4_LEVELS: LevelCategoryCardData[] = [
  {
    id: "p4-l1",
    part: "Part 4",
    type: "level",
    title: "Level 1 – Dưới 200",
    totalQuestions: 40,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Các bài thông báo đơn giản tại ga tàu, sân bay và siêu thị.",
    rules: ["Nghe câu đầu tiên để biết bài nói diễn ra ở đâu."],
    vocabBag: [{ word: "passengers", ipa: "/ˈpæsɪndʒərz/", meaning: "Hành khách" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[5]],
  },
  {
    id: "p4-l2",
    part: "Part 4",
    type: "level",
    title: "Level 2 – 200–300",
    totalQuestions: 65,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Tin nhắn thoại để lại qua điện thoại và thông báo nội bộ công ty.",
    rules: ["Xác định mục đích gọi điện ('I'm calling to...')."],
    vocabBag: [{ word: "inquire", ipa: "/ɪnˈkwaɪər/", meaning: "Hỏi thăm thông tin" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[5]],
  },
  {
    id: "p4-l3",
    part: "Part 4",
    type: "level",
    title: "Level 3 – 300–400",
    totalQuestions: 90,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Bản tin thời tiết, tin tức tài chính và quảng cáo thương mại.",
    rules: ["Để ý các con số, dự báo thời tiết và chương trình khuyến mãi."],
    vocabBag: [{ word: "forecast", ipa: "/ˈfɔːrkæst/", meaning: "Dự báo thời tiết" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[5]],
  },
  {
    id: "p4-l4",
    part: "Part 4",
    type: "level",
    title: "Level 4 – 400–495",
    totalQuestions: 50,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Bài phát biểu giới thiệu nhân vật và bài nói kết hợp biểu đồ hình ảnh.",
    rules: ["Kết hợp nghe và dò thông tin trên bảng biểu song song."],
    vocabBag: [{ word: "accolades", ipa: "/ˈækəleɪdz/", meaning: "Giải thưởng vinh danh" }],
    questions: [SAMPLE_DICTATION_QUESTIONS[5]],
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
  const [part3Levels, setPart3Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART3_LEVELS);
  const [part4Levels, setPart4Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART4_LEVELS);

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
  const [audioSpeed, setAudioSpeed] = useState<"0.8" | "1.0" | "1.2">("1.0");

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
    setPart3Levels((prev) => prev.map(updateCard));
    setPart4Levels((prev) => prev.map(updateCard));

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
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/60 rounded-full w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("dictation")}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "dictation"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          Nghe chép
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("part1")}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "part1"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          Part 1
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("part2")}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "part2"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          Part 2
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("part3")}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "part3"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          Part 3
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("part4")}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "part4"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
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
          {/* Thanh lọc theo Năm & Nút "Câu cần luyện lại" */}
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
                        {/* Hàng trên: Huy hiệu Part & 2 Icon Sổ từ / Ghi chú */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
                            {card.part}
                          </span>

                          <div className="flex items-center gap-2 text-slate-400">
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

                {/* Hàng dưới: 4 icon + Nút "Học ngay" */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-slate-400">
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
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirmTarget({
                          type: "level",
                          id: lvl.id,
                          title: lvl.title,
                        })
                      }
                      title="Xóa tiến độ"
                      className="hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Theo dạng tranh
              </h3>
              <p className="text-xs text-slate-500">
                Cùng bộ câu ở trên, chia theo bức tranh mô tả gì. Mỗi câu thuộc đúng một dạng.
              </p>
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
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirmTarget({
                            type: "level",
                            id: cat.id,
                            title: cat.title,
                          })
                        }
                        title="Xóa tiến độ"
                        className="hover:text-rose-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
      {/* NỘI DUNG 3: TAB PART 2 (ẢNH 5) */}
      {/* ======================================================== */}
      {activeTab === "part2" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {part2Levels.map((lvl) => {
              const hasProgress = lvl.completedQuestions > 0;

              return (
                <div
                  key={lvl.id}
                  className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {lvl.title}
                    </h3>

                    {/* Dòng trạng thái (nếu có làm dở hiển thị: 1/154 ✓ 1 ✗ 0 hệt ảnh 5) */}
                    <div className="text-xs mb-4">
                      {hasProgress ? (
                        <div className="flex items-center gap-2 font-semibold">
                          <span className="text-slate-800">
                            {lvl.completedQuestions}/{lvl.totalQuestions}
                          </span>
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            ✓ {lvl.correctCount}
                          </span>
                          <span className="text-rose-500 flex items-center gap-0.5">
                            ✗ {lvl.wrongCount}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">
                          {lvl.status} · {lvl.totalQuestions} câu
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 icon + Nút Học ngay */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <button
                        type="button"
                        onClick={() =>
                          setVocabBagModalData({
                            title: `Từ vựng - ${lvl.title}`,
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
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirmTarget({
                            type: "level",
                            id: lvl.id,
                            title: lvl.title,
                          })
                        }
                        title="Xóa tiến độ"
                        className="hover:text-rose-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenQuizPractice(lvl)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shadow-2xs ${
                        hasProgress
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                          : "border border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      Học ngay
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* NỘI DUNG 4: TAB PART 3 & PART 4 */}
      {/* ======================================================== */}
      {(activeTab === "part3" || activeTab === "part4") && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(activeTab === "part3" ? part3Levels : part4Levels).map((lvl) => (
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
                      onClick={() =>
                        setVocabBagModalData({
                          title: `Từ vựng - ${lvl.title}`,
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
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirmTarget({
                          type: "level",
                          id: lvl.id,
                          title: lvl.title,
                        })
                      }
                      title="Xóa tiến độ"
                      className="hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
      {quizModalCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    Luyện nghe: {quizModalCard.title} ({quizModalCard.part})
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Luyện đề trắc nghiệm sát format ETS có giải thích chi tiết
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQuizModalCard(null)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung câu hỏi trắc nghiệm */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {quizModalCard.questions[activeQuizQIndex] && (
                (() => {
                  const q = quizModalCard.questions[activeQuizQIndex];
                  const chosenOpt = quizSelectedOption[q.id];
                  const isChecked = !!quizAnswerChecked[q.id];
                  const isCorrect = chosenOpt === q.correctAnswer;

                  return (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                          {q.part} • Câu {activeQuizQIndex + 1} / {quizModalCard.questions.length}
                        </span>

                        <span className="text-xs text-slate-500 font-medium">
                          Tiến độ: {quizModalCard.correctCount} Đúng / {quizModalCard.wrongCount} Sai
                        </span>
                      </div>

                      {/* Ảnh minh họa nếu Part 1 */}
                      {q.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 max-w-sm mx-auto shadow-xs">
                          <img src={q.imageUrl} alt="TOEIC" className="w-full h-48 object-cover" />
                        </div>
                      )}

                      {/* Trình phát Audio */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                            className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition cursor-pointer"
                          >
                            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>
                          <span className="text-xs font-bold text-slate-800">Phát audio bài nghe</span>
                        </div>
                      </div>

                      {/* Lựa chọn A / B / C / D */}
                      {q.options && (
                        <div className="space-y-2.5">
                          {Object.entries(q.options).map(([optKey, optVal]) => {
                            const isChosen = chosenOpt === optKey;
                            const isRight = optKey === q.correctAnswer;

                            let style = "bg-white border-slate-200 hover:bg-slate-50 text-slate-800";
                            if (isChecked) {
                              if (isRight) style = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                              else if (isChosen) style = "bg-rose-50 border-rose-400 text-rose-950";
                            } else if (isChosen) {
                              style = "bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20";
                            }

                            return (
                              <button
                                key={optKey}
                                type="button"
                                disabled={isChecked}
                                onClick={() => setQuizSelectedOption({ ...quizSelectedOption, [q.id]: optKey })}
                                className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition cursor-pointer ${style}`}
                              >
                                <span className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-xs flex items-center justify-center shrink-0">
                                  {optKey}
                                </span>
                                <span className="text-xs leading-relaxed">{optVal}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Nút kiểm tra kết quả */}
                      {!isChecked ? (
                        <button
                          type="button"
                          disabled={!chosenOpt}
                          onClick={() => handleCheckQuizAnswer(q)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs transition cursor-pointer"
                        >
                          Kiểm tra đáp án
                        </button>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs leading-relaxed">
                          <div className="flex items-center gap-1.5 font-bold">
                            {isCorrect ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Chính xác! Rất tốt.
                              </span>
                            ) : (
                              <span className="text-rose-600 flex items-center gap-1">
                                <X className="w-4 h-4" /> Chưa đúng. Đáp án chính xác là {q.correctAnswer}.
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700">
                            <span className="font-bold text-slate-900">Giải thích AI:</span> {q.explanation}
                          </p>
                          {q.trapNote && (
                            <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                              <span className="font-bold">Cảnh báo bẫy thi:</span> {q.trapNote}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Chuyển câu trước / sau */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <button
                          type="button"
                          disabled={activeQuizQIndex === 0}
                          onClick={() => setActiveQuizQIndex((prev) => Math.max(0, prev - 1))}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
                        >
                          Câu trước
                        </button>

                        <button
                          type="button"
                          disabled={activeQuizQIndex === quizModalCard.questions.length - 1}
                          onClick={() => setActiveQuizQIndex((prev) => Math.min(quizModalCard.questions.length - 1, prev + 1))}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-40 transition cursor-pointer"
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
    </div>
  );
}
