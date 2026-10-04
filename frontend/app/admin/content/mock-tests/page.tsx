"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  Grid,
  HelpCircle,
  Headphones,
  Target,
  ClipboardCheck,
  Sparkles,
  BookOpen,
  TrendingUp,
  BarChart2,
  Bell,
  BellOff,
  Star,
  Volume2,
  Signal,
  Trophy,
  Trash2,
  History,
  RotateCcw,
  FileText,
  Languages,
  Play,
  CheckCircle2,
  X,
  Clock,
  Search,
  Pause,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Send,
  Eye,
  FileCheck,
  Bookmark,
  Plus,
  Pencil,
} from "lucide-react";

// --- TYPES & INTERFACES ---
export interface TestItem {
  id: number;
  volId: string; // 'vol1' | 'vol2' | 'ets2024'
  title: string;
  difficulty: "Khó" | "Trung bình" | "Vừa sức";
  score: number | null; // e.g. 785/990 or null
  listeningScore: number | null; // out of 495
  readingScore: number | null; // out of 495
  status: string; // 'Chưa luyện tập' | 'Đã hoàn thành lúc ...'
  completedAt: string | null;
  historyAttempts: {
    id: string;
    date: string;
    duration: string;
    score: number;
    listening: number;
    reading: number;
    correctCount: number;
    totalCount: number;
  }[];
  keyVocab: {
    word: string;
    ipa: string;
    pos: string;
    meaning: string;
    example: string;
  }[];
}

export interface PracticeQuestion {
  id: number;
  part: string;
  questionText: string;
  passage?: string;
  bilingualPassage?: string;
  evidence?: string;
  audioUrl?: string;
  imageUrl?: string;
  options: { [key: string]: string };
  groupTitle?: string;
  groupId?: string;
  groupTotal?: number;
  optionGlosses?: { [key: string]: string };
  step1?: string;
  step2?: string;
  step3?: string;
  note?: string;
  optionGlosses?: { [key: string]: string };
  correctAnswer: string;
  explanation: string;
  transcript?: string;
  translation?: string;
}

// DỮ LIỆU CÂU HỎI MẪU CHO MÔ PHỎNG THI THỬ & LUYỆN TẬP
// DỮ LIỆU CÂU HỎI MẪU CHUẨN ĐỦ 7 PART (PART 1,2,3,4 LISTENING & PART 5,6,7 READING)
const SAMPLE_EXAM_QUESTIONS: PracticeQuestion[] = [
  // ================= LISTENING SECTION (PART 1 - 4) =================
  // --- PART 1: PHOTOGRAPHS (6 câu) ---
  {
    id: 1,
    part: "Part 1",
    questionText: "Look at the photograph and choose the statement that best describes what you see.",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    options: {
      A: "A chef is preparing food in a commercial kitchen.",
      B: "Plates are being washed in a sink.",
      C: "Food is being served to restaurant customers.",
      D: "Groceries are being loaded into a delivery truck.",
    },
    correctAnswer: "A",
    transcript: "(A) A chef is preparing food in a commercial kitchen. (B) Plates are being washed in a sink. (C) Food is being served to restaurant customers. (D) Groceries are being loaded into a delivery truck.",
    translation: "(A) Một đầu bếp đang chuẩn bị đồ ăn trong bếp thương mại. (B) Bát đĩa đang được rửa trong bồn. (C) Thức ăn đang được phục vụ cho khách hàng. (D) Hàng hóa đang được chất lên xe giao hàng.",
    explanation: "Bức ảnh thể hiện người đầu bếp đang đứng nấu ăn bên bếp lò trong nhà bếp nhà hàng -> Phương án (A) mô tả đúng nhất.",
  },
  {
    id: 2,
    part: "Part 1",
    questionText: "Look at the photograph and choose the best description.",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    options: {
      A: "Some people are seated around a conference table.",
      B: "Documents are being filed in the cabinet.",
      C: "A presentation is being displayed on the monitor.",
      D: "The office windows are currently being cleaned.",
    },
    correctAnswer: "A",
    transcript: "(A) Some people are seated around a conference table.",
    translation: "(A) Một số người đang ngồi quanh bàn họp.",
    explanation: "Nhân sự đang ngồi trao đổi xung quanh bàn họp lớn.",
  },

  // --- PART 2: QUESTION - RESPONSE (25 câu - chỉ có A, B, C) ---
  {
    id: 7,
    part: "Part 2",
    questionText: "When is the annual budget proposal scheduled to be submitted?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    options: {
      A: "Yes, our team approved it yesterday.",
      B: "By the end of business hours this Friday.",
      C: "In the main boardroom on the fifth floor.",
    },
    correctAnswer: "B",
    transcript: "Question: When is the annual budget proposal scheduled to be submitted? (A) Yes, approved yesterday. (B) By Friday. (C) On the fifth floor.",
    translation: "Câu hỏi: Khi nào đề xuất ngân sách hàng năm dự kiến được nộp? (A) Vâng, đã duyệt. (B) Trước thứ Sáu này. (C) Ở tầng 5.",
    explanation: "Câu hỏi 'When' hỏi về thời gian -> (B) đưa ra thời hạn cụ thể.",
  },
  {
    id: 8,
    part: "Part 2",
    questionText: "Why hasn't the overseas shipment from Tokyo arrived yet?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    options: {
      A: "Severe weather conditions delayed international flights.",
      B: "No, we only received forty cartons.",
      C: "Mr. Sato is the chief logistics coordinator.",
    },
    correctAnswer: "A",
    translation: "Tại sao lô hàng từ Tokyo chưa tới?",
    explanation: "Câu hỏi 'Why' hỏi nguyên nhân -> (A) giải thích do thời tiết xấu hoãn chuyến bay.",
  },

  // --- PART 3: SHORT CONVERSATIONS (39 câu - Nhóm 3 câu) ---
  {
    id: 32,
    part: "Part 3",
    groupTitle: "Questions 32–34 refer to the following conversation.",
    groupId: "32–34",
    groupTotal: 3,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    questionText: "32. Where does the conversation most likely take place?",
    options: {
      A: "At an electronics retail store",
      B: "In a corporate medical clinic",
      C: "At an airport check-in counter",
      D: "In a hotel reception lobby",
    },
    optionGlosses: {
      A: "Cửa hàng bán lẻ đồ điện tử",
      B: "Phòng khám y tế doanh nghiệp",
      C: "Quầy làm thủ tục sân bay",
      D: "Sảnh lễ tân khách sạn",
    },
    correctAnswer: "D",
    translation: "Cuộc trò chuyện có khả năng diễn ra ở đâu nhất?",
    explanation: "Người đàn ông hỏi về reservation phòng và chìa khóa phòng -> sảnh lễ tân khách sạn.",
  },
  {
    id: 33,
    part: "Part 3",
    groupTitle: "Questions 32–34 refer to the following conversation.",
    groupId: "32–34",
    groupTotal: 3,
    questionText: "33. What problem does the woman mention?",
    options: {
      A: "The executive suite is not cleaned yet.",
      B: "A credit card payment was declined.",
      C: "The shuttle bus service has been cancelled.",
      D: "The air conditioning unit is broken.",
    },
    correctAnswer: "A",
    translation: "Người phụ nữ nhắc tới sự cố gì?",
    explanation: "Nhân viên báo phòng suite chưa dọn dẹp xong.",
  },

  // --- PART 4: SHORT TALKS (30 câu - Nhóm 3 câu) ---
  {
    id: 71,
    part: "Part 4",
    groupTitle: "Questions 71–73 refer to the following announcement.",
    groupId: "71–73",
    groupTotal: 3,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    questionText: "71. Who is the speaker most likely addressing?",
    options: {
      A: "Factory assembly line workers",
      B: "New corporate employees at orientation",
      C: "Passengers on a guided tour bus",
      D: "Store managers at a sales conference",
    },
    correctAnswer: "B",
    translation: "Người nói đang hướng tới đối tượng nào?",
    explanation: "Thông báo chào mừng nhân viên mới trong ngày định hướng công ty.",
  },

  // ================= READING SECTION (PART 5 - 7) =================
  // --- PART 5: INCOMPLETE SENTENCES (30 câu) ---
  {
    id: 101,
    part: "Part 5",
    questionText: "The board must be given written notice of -------- to the retirement plan at least 30 days in advance.",
    options: {
      A: "revisions",
      B: "revising",
      C: "revised",
      D: "revises",
    },
    optionGlosses: {
      A: "(n-plural): những sự sửa đổi",
      B: "(v-ing): đang sửa đổi",
      C: "(v-ed): đã sửa đổi",
      D: "(v-s): sửa đổi",
    },
    correctAnswer: "A",
    translation: "Hội đồng quản trị phải được thông báo bằng văn bản về những sửa đổi đối với chương trình hưu trí ít nhất 30 ngày trước.",
    step1: 'Bốn đáp án là các dạng khác nhau của đại từ "revisions" nên cần xét vị trí chỗ trống.',
    step2: 'Sau giới từ "of" cần danh từ đóng vai trò tân ngữ -> loại động từ revising/revised/revises.',
    step3: 'Chọn danh từ số nhiều "revisions" (những sự sửa đổi).',
    explanation: "Sau giới từ 'of' cần danh từ số nhiều 'revisions'.",
  },
  {
    id: 102,
    part: "Part 5",
    questionText: "Upon the two founders' retirement, the foundation released a booklet describing ------- earliest projects.",
    options: {
      A: "they",
      B: "them",
      C: "their",
      D: "themselves",
    },
    optionGlosses: {
      A: "(pron): họ",
      B: "(pron): họ (tân ngữ)",
      C: "(adj sở hữu): của họ",
      D: "(pron): chính họ",
    },
    correctAnswer: "C",
    translation: "Nhân dịp hai nhà sáng lập nghỉ hưu, quỹ đã phát hành một cuốn sách nhỏ mô tả những dự án đầu tiên của họ.",
    step1: 'Bốn đáp án là các dạng khác nhau của đại từ "they" nên đây là câu đại từ, cần xét vị trí chỗ trống.',
    step2: 'Chỗ trống đứng ngay trước cụm danh từ "earliest projects", cần tính từ sở hữu.',
    step3: 'Chọn tính từ sở hữu "their" (của họ).',
    explanation: "Đứng trước cụm danh từ 'earliest projects' cần tính từ sở hữu 'their'.",
  },

  // --- PART 6: TEXT COMPLETION (16 câu - Nhóm 4 câu) ---
  {
    id: 131,
    part: "Part 6",
    groupTitle: "Questions 131–134 refer to the following article.",
    groupId: "131–134",
    groupTotal: 4,
    passage: `(March 8)—Clothing rental services, which let customers borrow outfits for a monthly fee instead of buying them, are currently enjoying a boom nationwide. The number of subscribers grew nearly 40% in the past year, and rental racks can now be found in a ------- (131) range of stores, from small boutiques to national department chains.

A major reason for this trend is changing shopper ------- (132) shaped by concern about the waste created by fast fashion. According to Marina Delgado, spokesperson for the Garment Rental Council, the lower monthly fees and larger selection of newer services have helped ------- (133). Ms. Delgado believes that this part of the industry will only continue to grow. ------- (134)`,
    questionText: "131.",
    options: {
      A: "distant",
      B: "wide",
      C: "frequent",
      D: "various",
    },
    optionGlosses: {
      A: "(adj): xa xôi",
      B: "(adj): rộng rãi, đa dạng",
      C: "(adj): thường xuyên",
      D: "(adj): khác nhau",
    },
    correctAnswer: "B",
    translation: "Một phạm vi cửa hàng rộng lớn...",
    explanation: "Cụm từ cố định 'a wide range of' (một phạm vi rộng/đa dạng).",
  },

  // --- PART 7: READING COMPREHENSION (54 câu - Nhóm 2-5 câu) ---
  {
    id: 147,
    part: "Part 7",
    groupTitle: "Questions 147–148 refer to the following notice.",
    groupId: "147–148",
    groupTotal: 2,
    passage: `MEADOWLARK GARDEN CENTRES – HEAD OFFICE

STAFF TRAINING SESSION

Topic: Choosing Stock for the Spring Season
Presenter: Dana Okonkwo, Okonkwo Nursery Group
Date: 14 March, 2:00 P.M.
Location: www.link-room.co.uk (Session Code: 447 210 665)

Attendance is required for anyone who places orders with our growers. The session runs for ninety minutes and will not be recorded. Please e-mail any questions you would like Ms. Okonkwo to answer to training@meadowlark.co.uk by 10 March.`,
    evidence: "Attendance is required for anyone who places orders with our growers.",
    questionText: "147. Who will most likely attend the session?",
    options: {
      A: "Delivery drivers",
      B: "Shop-floor assistants",
      C: "Growers from local nurseries",
      D: "Employees who buy stock",
    },
    optionGlosses: {
      A: "Tài xế giao hàng",
      B: "Trợ lý bán hàng tại quầy",
      C: "Người trồng cây tại nhà vườn địa phương",
      D: "Nhân viên mua hàng hóa",
    },
    correctAnswer: "D",
    translation: "Ai là người có khả năng nhất sẽ tham gia buổi đào tạo?",
    explanation: "Việc tham gia là bắt buộc cho bất kỳ ai đặt hàng với các nhà vườn -> Nhân viên mua hàng hóa.",
  },
  {
    id: 148,
    part: "Part 7",
    groupTitle: "Questions 147–148 refer to the following notice.",
    groupId: "147–148",
    groupTotal: 2,
    questionText: "148. What are employees asked to do before 10 March?",
    options: {
      A: "Send in questions for the presenter",
      B: "Confirm their attendance with a manager",
      C: "Register on the company website",
      D: "Download the training booklet",
    },
    optionGlosses: {
      A: "Gửi câu hỏi cho diễn giả",
      B: "Xác nhận sự tham gia với quản lý",
      C: "Đăng ký trên website công ty",
      D: "Tải xuống tài liệu đào tạo",
    },
    correctAnswer: "A",
    translation: "Nhân viên được yêu cầu làm gì trước ngày 10 tháng 3?",
    evidence: "Please e-mail any questions you would like Ms. Okonkwo to answer to training@meadowlark.co.uk by 10 March.",
    explanation: "Thông báo yêu cầu gửi email các câu hỏi cho diễn giả trước 10/3.",
  },
];

// DANH SÁCH 10 TEST CHO CRACK TOEIC VOL 1 (CHUẨN THEO ẢNH CỦA BẠN)
const INITIAL_TESTS_VOL1: TestItem[] = [
  {
    id: 1,
    volId: "vol1",
    title: "Test 1",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "reimbursement", ipa: "/ˌriːɪmˈbɜːrsmənt/", pos: "n", meaning: "Khoản hoàn tiền công tác, bồi hoàn chi phí", example: "Submit receipts to claim meal reimbursement." },
      { word: "complimentary", ipa: "/ˌkɑːmplɪˈmentri/", pos: "adj", meaning: "Miễn phí, tặng kèm", example: "Guests receive complimentary shuttle transportation." },
      { word: "delegate", ipa: "/ˈdelɪɡət/", pos: "n/v", meaning: "Đại biểu, người đại diện / Ủy quyền giao việc", example: "The conference welcomed over 300 international delegates." },
      { word: "itinerary", ipa: "/aɪˈtɪnəreri/", pos: "n", meaning: "Lịch trình chi tiết chuyến đi", example: "Check your flight itinerary prior to departure." },
      { word: "substantial", ipa: "/səbˈstænʃl/", pos: "adj", meaning: "Đáng kể, to lớn", example: "The firm saw a substantial increase in quarterly profit." },
    ],
  },
  {
    id: 2,
    volId: "vol1",
    title: "Test 2",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "feasibility", ipa: "/ˌfiːzəˈbɪləti/", pos: "n", meaning: "Tính khả thi của dự án", example: "Engineers conducted a feasibility study on solar power." },
      { word: "mandatory", ipa: "/ˈmændətɔːri/", pos: "adj", meaning: "Bắt buộc, theo quy định", example: "Attendance at the safety orientation is mandatory." },
      { word: "preliminary", ipa: "/prɪˈlɪmɪneri/", pos: "adj", meaning: "Sơ bộ, ban đầu", example: "Preliminary findings show strong market demand." },
      { word: "fluctuate", ipa: "/ˈflʌktʃueɪt/", pos: "v", meaning: "Dao động, biến động thất thường", example: "Currency exchange rates fluctuate constantly." },
    ],
  },
  {
    id: 3,
    volId: "vol1",
    title: "Test 3",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "consensus", ipa: "/kənˈsensəs/", pos: "n", meaning: "Sự đồng thuận chung của tập thể", example: "The committee reached a consensus on the budget." },
      { word: "prospective", ipa: "/prəˈspektɪv/", pos: "adj", meaning: "Tiềm năng, có triển vọng tương lai", example: "We sent catalogs to prospective corporate buyers." },
      { word: "expedite", ipa: "/ˈekspədaɪt/", pos: "v", meaning: "Xúc tiến nhanh, đẩy nhanh tiến độ", example: "Please pay an express fee to expedite shipping." },
    ],
  },
  {
    id: 4,
    volId: "vol1",
    title: "Test 4",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "accommodate", ipa: "/əˈkɑːmədeɪt/", pos: "v", meaning: "Đáp ứng nhu cầu, chứa đủ người", example: "The banquet hall accommodates up to 500 guests." },
      { word: "stipulation", ipa: "/ˌstɪpjuˈleɪʃn/", pos: "n", meaning: "Điều khoản bắt buộc trong hợp đồng", example: "The contract contains a strict warranty stipulation." },
    ],
  },
  {
    id: 5,
    volId: "vol1",
    title: "Test 5",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "adjacent", ipa: "/əˈdʒeɪsnt/", pos: "adj", meaning: "Kế bên, liền kề sát cạnh", example: "The parking lot is adjacent to Terminal 2." },
      { word: "lucrative", ipa: "/ˈluːkrətɪv/", pos: "adj", meaning: "Sinh lời lớn, béo bở", example: "Securing the government contract proved lucrative." },
    ],
  },
  {
    id: 6,
    volId: "vol1",
    title: "Test 6",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "discrepancy", ipa: "/dɪˈskrepənsi/", pos: "n", meaning: "Sự sai lệch, không khớp số liệu", example: "Auditors noted a discrepancy in travel invoices." },
      { word: "facilitate", ipa: "/fəˈsɪlɪteɪt/", pos: "v", meaning: "Tạo điều kiện thuận lợi, hỗ trợ", example: "Modern tools facilitate seamless communication." },
    ],
  },
  {
    id: 7,
    volId: "vol1",
    title: "Test 7",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "contingency", ipa: "/kənˈtɪndʒənsi/", pos: "n", meaning: "Phương án dự phòng rủi ro", example: "Establish a contingency plan in case of shipment delays." },
      { word: "rigorous", ipa: "/ˈrɪɡərəs/", pos: "adj", meaning: "Nghiêm ngặt, khắt khe", example: "The candidate passed rigorous technical evaluations." },
    ],
  },
  {
    id: 8,
    volId: "vol1",
    title: "Test 8",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "tenative", ipa: "/ˈtentətɪv/", pos: "adj", meaning: "Dự kiến, tạm thời chưa chốt", example: "We set a tentative project launch date for May 15." },
      { word: "unprecedented", ipa: "/ʌnˈpresɪdentɪd/", pos: "adj", meaning: "Chưa từng có tiền lệ", example: "The product release enjoyed unprecedented demand." },
    ],
  },
  {
    id: 9,
    volId: "vol1",
    title: "Test 9",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "apparel", ipa: "/əˈpærəl/", pos: "n", meaning: "Trang phục, quần áo thương mại", example: "The boutique imports designer apparel from Milan." },
      { word: "endorse", ipa: "/ɪnˈdɔːrs/", pos: "v", meaning: "Tán thành, ủng hộ, quảng bá", example: "Celebrity athletes officially endorse the sportswear line." },
    ],
  },
  {
    id: 10,
    volId: "vol1",
    title: "Test 10",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "lucrative", ipa: "/ˈluːkrətɪv/", pos: "adj", meaning: "Sinh lợi cao, mang lại nhiều tiền", example: "A lucrative sponsorship contract was signed." },
      { word: "reputable", ipa: "/ˈrepjətəbl/", pos: "adj", meaning: "Có uy tín lớn, đáng tin cậy", example: "Always source spare parts from reputable suppliers." },
    ],
  },
];

// DANH SÁCH 10 TEST CHO CRACK TOEIC VOL 2
const INITIAL_TESTS_VOL2: TestItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  volId: "vol2",
  title: `Test ${i + 1}`,
  difficulty: "Khó",
  score: null,
  listeningScore: null,
  readingScore: null,
  status: "Chưa luyện tập",
  completedAt: null,
  historyAttempts: [],
  keyVocab: [
    { word: "solicit", ipa: "/səˈlɪsɪt/", pos: "v", meaning: "Kêu gọi, khẩn khoản xin ý kiến đóng góp", example: "We solicit feedback from all attendees." },
    { word: "subsidiary", ipa: "/səbˈsɪdieri/", pos: "n", meaning: "Công ty con trực thuộc tập đoàn", example: "The Tokyo branch is our newest subsidiary." },
  ],
}));

export default function MockTestsPage() {
  // --- STATES CHÍNH ---
  const [activeMainTab, setActiveMainTab] = useState<"study" | "progress">("study");
  const [selectedVol, setSelectedVol] = useState<"vol1" | "vol2">("vol1");
  const [testsVol1, setTestsVol1] = useState<TestItem[]>(INITIAL_TESTS_VOL1);
  const [testsVol2, setTestsVol2] = useState<TestItem[]>(INITIAL_TESTS_VOL2);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active tests theo volume hiện tại
  const currentTests = selectedVol === "vol1" ? testsVol1 : testsVol2;
  const setCurrentTests = selectedVol === "vol1" ? setTestsVol1 : setTestsVol2;

  // --- MODAL STATES ---
  // 0. Chọn chế độ (Mode Selection Modal)
  const [modeSelectionTest, setModeSelectionTest] = useState<TestItem | null>(null);
  const [selectedModeTab, setSelectedModeTab] = useState<"exam" | "practice">("practice");
  const [selectedParts, setSelectedParts] = useState<string[]>(["Part 1"]);
  const [activeExamParts, setActiveExamParts] = useState<string[]>([]);

  // 1. Thi thử (Full Exam Simulation)
  const [examModalTest, setExamModalTest] = useState<TestItem | null>(null);
  const [examDurationType, setExamDurationType] = useState<"120" | "60" | "30">("120");
  const [examStarted, setExamStarted] = useState(false);
  const [examTimeRemaining, setExamTimeRemaining] = useState(120 * 60); // seconds
  const [examAnswers, setExamAnswers] = useState<{ [qId: number]: string }>({});
  const [examFlagged, setExamFlagged] = useState<{ [qId: number]: boolean }>({});
  const [examCurrentQIndex, setExamCurrentQIndex] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResultScore, setExamResultScore] = useState<{
    total: number;
    listening: number;
    reading: number;
    correctCount: number;
    wrongCount: number;
  } | null>(null);

  // 2. Luyện tập (Practice Mode)
  const [practiceModalTest, setPracticeModalTest] = useState<TestItem | null>(null);
  const [practicePartFilter, setPracticePartFilter] = useState<string>("ALL");
  const [practiceCurrentQIndex, setPracticeCurrentQIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<{ [qId: number]: string }>({});
  const [practiceChecked, setPracticeChecked] = useState<{ [qId: number]: boolean }>({});
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  // Interactive states for Top Header Bar buttons (Song ngữ, Ghi chú, Annotator, Timer, Ma trận câu hỏi)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  // States cho Part 1 Audio & Listening Toolbar (Chính xác theo Ảnh Part 1)
  const [audioSpeed, setAudioSpeed] = useState<"1x" | "1.25x" | "1.5x" | "0.75x">("1x");
  const [isDictationMode, setIsDictationMode] = useState(false);
  const [isFlipCardMode, setIsFlipCardMode] = useState(false);
  const [isAutoPlayNext, setIsAutoPlayNext] = useState(true);
  const [practiceUserNotes, setPracticeUserNotes] = useState<{ [qId: number]: string }>({});
  const [isAnnotatorActive, setIsAnnotatorActive] = useState(false);
  const [annotatorColor, setAnnotatorColor] = useState<"yellow" | "green" | "pink" | "blue">("yellow");
  const [practiceTimerSeconds, setPracticeTimerSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(true);
  const [showVocabSection, setShowVocabSection] = useState(true);
  const [isVocabExpanded, setIsVocabExpanded] = useState(false);
  // Web Audio Sound Effects Synthesizer (SFX chọn đáp án giống Part 5, 6, 7)
    // Web Audio Sound Effects Synthesizer (Chuẩn 100% theo Part 5)
  const playSfx = (type?: "correct" | "wrong" | "click") => {
    if (!isSfxEnabled) return; // Im lặng 100% khi tắt nút chuông
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      // ĐỒNG BỘ 1 ÂM THANH DUY NHẤT (Single 520Hz Tone) CHO TẤT CẢ THAO TÁC
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Fallback
    }
  };

  const [dictationInput, setDictationInput] = useState<{ [qId: number]: string }>({});
  const [showBilingualPassage, setShowBilingualPassage] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  // 3. Xóa lịch sử (Delete modal)
  const [deleteModalTest, setDeleteModalTest] = useState<TestItem | null>(null);

  // 4. Lịch sử làm bài (History modal)
  const [historyModalTest, setHistoryModalTest] = useState<TestItem | null>(null);

  // 5. Làm lại đề (Redo modal)
  const [redoModalTest, setRedoModalTest] = useState<TestItem | null>(null);

  // 6. Đáp án & Transcript (Transcript modal)
  const [transcriptModalTest, setTranscriptModalTest] = useState<TestItem | null>(null);
  const [transcriptSearch, setTranscriptSearch] = useState("");

  // 7. Từ vựng của đề ('A' modal)
  const [vocabModalTest, setVocabModalTest] = useState<TestItem | null>(null);
  const [savedVocabBag, setSavedVocabBag] = useState<string[]>([]);

  // Audio simulation state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // --- TEST CRUD STATES ---
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState<TestItem | null>(null);
  const [testFormTitle, setTestFormTitle] = useState("");
  const [testFormVolId, setTestFormVolId] = useState<"vol1" | "vol2">("vol1");
  const [testFormDifficulty, setTestFormDifficulty] = useState<"Khó" | "Trung bình" | "Vừa sức">("Trung bình");
  const [deleteConfirmTest, setDeleteConfirmTest] = useState<TestItem | null>(null);

  // Test CRUD Handlers
  const handleOpenCreateTest = () => {
    setEditingTest(null);
    setTestFormTitle(`Test ${(selectedVol === "vol1" ? testsVol1.length : testsVol2.length) + 1}`);
    setTestFormVolId(selectedVol);
    setTestFormDifficulty("Trung bình");
    setShowCreateTestModal(true);
  };

  const handleOpenEditTest = (test: TestItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTest(test);
    setTestFormTitle(test.title);
    setTestFormVolId(test.volId as "vol1" | "vol2");
    setTestFormDifficulty(test.difficulty);
    setShowCreateTestModal(true);
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testFormTitle.trim()) {
      alert("Vui lòng nhập tên đề thi!");
      return;
    }

    if (editingTest) {
      const updateFn = (list: TestItem[]) =>
        list.map((t) =>
          t.id === editingTest.id
            ? {
                ...t,
                title: testFormTitle.trim(),
                volId: testFormVolId,
                difficulty: testFormDifficulty,
              }
            : t
        );
      if (editingTest.volId === "vol1") setTestsVol1(updateFn);
      else setTestsVol2(updateFn);
      triggerToast(`Đã cập nhật thông tin đề thi "${testFormTitle}"! 💾`);
    } else {
      const targetList = testFormVolId === "vol1" ? testsVol1 : testsVol2;
      const nextId = targetList.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      const newTest: TestItem = {
        id: nextId,
        volId: testFormVolId,
        title: testFormTitle.trim(),
        difficulty: testFormDifficulty,
        score: null,
        listeningScore: null,
        readingScore: null,
        status: "Chưa luyện tập",
        completedAt: null,
        historyAttempts: [],
        keyVocab: [
          { word: "commence", ipa: "/kəˈmens/", pos: "v", meaning: "Bắt đầu, khởi động chương trình", example: "The test will commence at 9:00 AM sharp." },
          { word: "adhere", ipa: "/ədˈhɪr/", pos: "v", meaning: "Tuân thủ chặt chẽ theo quy định", example: "All test-takers must adhere to the examination rules." },
        ],
      };
      if (testFormVolId === "vol1") {
        setTestsVol1((prev) => [...prev, newTest]);
      } else {
        setTestsVol2((prev) => [...prev, newTest]);
      }
      triggerToast(`Đã thêm đề thi "${newTest.title}" thành công! 🎉`);
    }
    setShowCreateTestModal(false);
  };

  const handleConfirmDeleteTest = () => {
    if (!deleteConfirmTest) return;
    if (deleteConfirmTest.volId === "vol1") {
      setTestsVol1((prev) => prev.filter((t) => t.id !== deleteConfirmTest.id));
    } else {
      setTestsVol2((prev) => prev.filter((t) => t.id !== deleteConfirmTest.id));
    }
    triggerToast(`Đã xóa đề thi "${deleteConfirmTest.title}"! 🗑️`);
    setDeleteConfirmTest(null);
  };

  // Helper trigger Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // --- ACTIONS XỬ LÝ ---

  // Mở modal Thi thử
  const handleOpenExam = (test: TestItem) => {
    setExamModalTest(test);
    setExamStarted(false);
    setExamSubmitted(false);
    setExamAnswers({});
    setExamFlagged({});
    setExamCurrentQIndex(0);
    setExamResultScore(null);
    setExamTimeRemaining(120 * 60);
  };

  // Bắt đầu thi thử thực tế
  const handleStartExamNow = () => {
    const mins = parseInt(examDurationType, 10);
    setExamTimeRemaining(mins * 60);
    setExamStarted(true);
    setExamSubmitted(false);
    triggerToast(`Đã bắt đầu thi thử ${examModalTest?.title}! Chúc bạn làm bài tốt.`);
  };

  // Nộp bài thi
  const handleSubmitExam = () => {
    if (!examModalTest) return;

    let correct = 0;
    let wrong = 0;
    activeExamQuestions.forEach((q) => {
      const selected = examAnswers[q.id];
      if (selected === q.correctAnswer) {
        correct += 1;
      } else {
        wrong += 1;
      }
    });

    // Ước tính điểm số TOEIC chuẩn theo tỷ lệ đúng
    const correctRatio = activeExamQuestions.length > 0 ? correct / activeExamQuestions.length : 0;
    // Scale điểm: Listening tối đa 495, Reading tối đa 495
    const estimatedListening = Math.min(495, Math.round(correctRatio * 460 + 35));
    const estimatedReading = Math.min(495, Math.round(correctRatio * 440 + 30));
    const estimatedTotal = estimatedListening + estimatedReading;

    const result = {
      total: estimatedTotal,
      listening: estimatedListening,
      reading: estimatedReading,
      correctCount: correct,
      wrongCount: wrong,
    };
    setExamResultScore(result);
    setExamSubmitted(true);

    // Cập nhật vào danh sách test hiện tại
    const nowStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString("vi-VN");
    const newAttempt = {
      id: "att-" + Date.now(),
      date: nowStr,
      duration: formatTime((parseInt(examDurationType, 10) * 60) - examTimeRemaining),
      score: estimatedTotal,
      listening: estimatedListening,
      reading: estimatedReading,
      correctCount: correct,
      totalCount: SAMPLE_EXAM_QUESTIONS.length,
    };

    setCurrentTests((prev) =>
      prev.map((t) =>
        t.id === examModalTest.id
          ? {
              ...t,
              score: estimatedTotal,
              listeningScore: estimatedListening,
              readingScore: estimatedReading,
              status: `Đã hoàn thành lúc ${nowStr}`,
              completedAt: nowStr,
              historyAttempts: [newAttempt, ...t.historyAttempts],
            }
          : t
      )
    );

    triggerToast(`Chúc mừng! Bạn đã hoàn thành ${examModalTest.title} với ${estimatedTotal}/990 điểm.`);
  };

  const handleSubmitExamRef = React.useRef(handleSubmitExam);
  useEffect(() => {
    handleSubmitExamRef.current = handleSubmitExam;
  });

  // --- TIMER FOR EXAM ---
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (examStarted && !examSubmitted && examTimeRemaining > 0) {
      timer = setInterval(() => {
        setExamTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExamRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, examSubmitted, examTimeRemaining]);

    // Timer effect for practice mode
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (practiceModalTest && !isTimerPaused) {
      interval = setInterval(() => {
        setPracticeTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [practiceModalTest, isTimerPaused]);

  // Mở modal Luyện tập
  const handleOpenPractice = (test: TestItem, initialPartFilter: string | string[] = "ALL") => {
    setPracticeModalTest(test);
    setPracticeTimerSeconds(0);
    setIsTimerPaused(false);
    setPracticeCurrentQIndex(0);
    setPracticePartFilter(initialPartFilter);
    setPracticeAnswers({});
    setPracticeChecked({});
    setDictationInput({});
    setShowBilingualPassage(false);
    setShowEvidence(false);
  };

  // Mở modal Xóa lịch sử
  const handleOpenDelete = (test: TestItem) => {
    setDeleteModalTest(test);
  };

  // Xác nhận xóa lịch sử
  const handleConfirmDelete = () => {
    if (!deleteModalTest) return;
    setCurrentTests((prev) =>
      prev.map((t) =>
        t.id === deleteModalTest.id
          ? {
              ...t,
              score: null,
              listeningScore: null,
              readingScore: null,
              status: "Chưa luyện tập",
              completedAt: null,
              historyAttempts: [],
            }
          : t
      )
    );
    triggerToast(`Đã xóa sạch lịch sử thi của ${deleteModalTest.title}!`);
    setDeleteModalTest(null);
  };

  // Mở modal Xem lịch sử
  const handleOpenHistory = (test: TestItem) => {
    setHistoryModalTest(test);
  };

  // Mở modal Làm lại
  const handleOpenRedo = (test: TestItem) => {
    setRedoModalTest(test);
  };

  // Xác nhận làm lại
  const handleConfirmRedo = () => {
    if (!redoModalTest) return;
    const target = redoModalTest;
    setRedoModalTest(null);
    handleOpenExam(target);
    handleStartExamNow();
  };

  // Mở modal Đáp án & Transcript
  const handleOpenTranscript = (test: TestItem) => {
    setTranscriptModalTest(test);
    setTranscriptSearch("");
  };

  // Mở modal Từ vựng của đề
  const handleOpenVocab = (test: TestItem) => {
    setVocabModalTest(test);
  };

  // Lưu từ vào giỏ từ
  const handleToggleSaveVocab = (word: string) => {
    if (savedVocabBag.includes(word)) {
      setSavedVocabBag((prev) => prev.filter((w) => w !== word));
      triggerToast(`Đã bỏ từ "${word}" khỏi giỏ từ vựng.`);
    } else {
      setSavedVocabBag((prev) => [...prev, word]);
      triggerToast(`✨ Đã thêm từ "${word}" vào giỏ từ vựng cá nhân!`);
    }
  };

  // Danh sách câu hỏi thi thử theo Part được chọn
  const activeExamQuestions = useMemo(() => {
    if (!activeExamParts || activeExamParts.length === 0) return SAMPLE_EXAM_QUESTIONS;
    return SAMPLE_EXAM_QUESTIONS.filter((q) => activeExamParts.includes(q.part));
  }, [activeExamParts]);

  // Lọc câu hỏi luyện tập theo Part
  const filteredPracticeQuestions = useMemo(() => {
    if (!practicePartFilter || practicePartFilter === "ALL") return SAMPLE_EXAM_QUESTIONS;
    if (Array.isArray(practicePartFilter)) {
      return SAMPLE_EXAM_QUESTIONS.filter((q) => practicePartFilter.includes(q.part));
    }
    return SAMPLE_EXAM_QUESTIONS.filter((q) => q.part === practicePartFilter);
  }, [practicePartFilter]);

  // Lọc transcript theo tìm kiếm
  const filteredTranscriptQuestions = useMemo(() => {
    if (!transcriptSearch.trim()) return SAMPLE_EXAM_QUESTIONS;
    const query = transcriptSearch.toLowerCase();
    return SAMPLE_EXAM_QUESTIONS.filter(
      (q) =>
        q.questionText.toLowerCase().includes(query) ||
        (q.transcript && q.transcript.toLowerCase().includes(query)) ||
        (q.translation && q.translation.toLowerCase().includes(query)) ||
        (q.explanation && q.explanation.toLowerCase().includes(query))
    );
  }, [transcriptSearch]);

  return (
    <div className="min-h-screen bg-[#f8fafc]/90 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Toast thông báo nổi góc dưới */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-blue-400 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* KHỐI 1: HEADER BANNER LUYỆN ĐỀ THI TOEIC THỰC TẾ (CHUẨN 100% THEO ẢNH BẠN GỬI) */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Đề thi TOEIC mô phỏng sát đề thi thật
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Luyện đề thi <span className="text-blue-600">TOEIC thực tế</span>
          </h1>
          <p className="text-sm font-medium text-slate-600 max-w-2xl leading-relaxed">
            Nghe chép chính tả, đọc song ngữ Anh–Việt, thêm từ vào giỏ từ vựng, xem dẫn chứng và giải thích chi tiết từng câu.
          </p>
        </div>

        {/* Icon Clipboard xanh lớn góc phải (chuẩn 100% như ảnh 1) */}
        <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <ClipboardCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* KHỐI 2: THANH TAB CHUYỂN CHẾ ĐỘ CHÍNH: HỌC vs TIẾN ĐỘ */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl max-w-full overflow-x-auto no-scrollbar shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveMainTab("study")}
          className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeMainTab === "study"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Học
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("progress")}
          className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeMainTab === "progress"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Tiến độ
        </button>
      </div>

      {/* TAB 1: NỘI DUNG CHẾ ĐỘ "HỌC" */}
      {activeMainTab === "study" && (
        <div className="space-y-6">
          {/* KHỐI 3: THANH CHỌN BỘ ĐỀ (CRACK TOEIC VOL 1, VOL 2) & THÊM ĐỀ */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedVol("vol1")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedVol === "vol1"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Crack TOEIC Vol 1 ({testsVol1.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedVol("vol2")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedVol === "vol2"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Crack TOEIC Vol 2 ({testsVol2.length})
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateTest}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm đề thi mới
            </button>
          </div>

          {/* KHỐI 4: LƯỚI 10 THẺ TEST (CHUẨN 100% THEO CẢ 2 HÌNH ẢNH CỦA BẠN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {currentTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Dòng 1: Tiêu đề Test & Cụm icon thao tác */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {test.title}
                    </h3>

                    {/* Các icon thao tác: Sửa / Xóa / Lịch sử / Làm lại / Lời thoại / Từ vựng */}
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditTest(test, e)}
                        title="Sửa thông tin đề thi"
                        className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmTest(test)}
                        title="Xóa đề thi này"
                        className="p-1 rounded-md hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenHistory(test)}
                        title="Xem lịch sử thi"
                        className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenRedo(test)}
                        title="Làm lại đề từ đầu"
                        className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenTranscript(test)}
                        title="Xem đáp án & Transcript chi tiết"
                        className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenVocab(test)}
                        title="Xem từ vựng trọng tâm của đề"
                        className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <Languages className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dòng 2: Huy hiệu Độ khó & Điểm số */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1 text-xs font-semibold text-rose-500">
                      <Signal className="w-3.5 h-3.5" />
                      {test.difficulty}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                      <Trophy className="w-3 h-3 text-amber-500" />
                      {test.score ? `${test.score} / 990` : "Điểm số"}
                    </span>
                  </div>

                  {/* Dòng 3: Trạng thái bài làm */}
                  <p className="text-xs text-slate-500 font-medium mb-4">
                    {test.status}
                  </p>
                </div>

                {/* Dòng 4: Hai nút hành động: "Thi thử" và "Luyện tập" */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setModeSelectionTest(test);
                      setSelectedModeTab("exam");
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-slate-600" />
                    Thi thử
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModeSelectionTest(test);
                      setSelectedModeTab("practice");
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Luyện tập
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: NỘI DUNG CHẾ ĐỘ "TIẾN ĐỘ" */}
      {activeMainTab === "progress" && (
        <div className="space-y-6">
          {/* Thẻ thống kê tổng quát */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Đề đã làm</p>
                <p className="text-2xl font-extrabold text-slate-900">
                  {currentTests.filter((t) => t.score !== null).length} / {currentTests.length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Điểm cao nhất</p>
                <p className="text-2xl font-extrabold text-amber-600">
                  {Math.max(...currentTests.map((t) => t.score || 0), 0) > 0
                    ? `${Math.max(...currentTests.map((t) => t.score || 0))}/990`
                    : "--"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Điểm trung bình</p>
                <p className="text-2xl font-extrabold text-emerald-600">
                  {currentTests.filter((t) => t.score !== null).length > 0
                    ? `${Math.round(
                        currentTests
                          .filter((t) => t.score !== null)
                          .reduce((acc, cur) => acc + (cur.score || 0), 0) /
                          currentTests.filter((t) => t.score !== null).length
                      )}/990`
                    : "--"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Từ vựng đã lưu</p>
                <p className="text-2xl font-extrabold text-indigo-600">{savedVocabBag.length} từ</p>
              </div>
            </div>
          </div>

          {/* Bảng phân tích năng lực từng Part */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              Phân tích độ chính xác theo từng Part thi TOEIC
            </h3>
            <div className="space-y-4">
              {[
                { part: "Part 1 - Mô tả tranh", accuracy: 85, color: "bg-blue-600" },
                { part: "Part 2 - Hỏi đáp (Q&A)", accuracy: 78, color: "bg-indigo-600" },
                { part: "Part 3 - Hội thoại ngắn", accuracy: 72, color: "bg-cyan-600" },
                { part: "Part 4 - Bài nói ngắn", accuracy: 68, color: "bg-emerald-600" },
                { part: "Part 5 - Hoàn thành câu", accuracy: 82, color: "bg-amber-600" },
                { part: "Part 6 - Hoàn thành đoạn văn", accuracy: 75, color: "bg-purple-600" },
                { part: "Part 7 - Đọc hiểu đoạn văn", accuracy: 70, color: "bg-rose-600" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{item.part}</span>
                    <span className="font-bold">{item.accuracy}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bảng lịch sử các lần thi gần nhất */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Nhật ký luyện thi gần đây
            </h3>

            {currentTests.flatMap((t) => t.historyAttempts).length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-slate-500 text-sm font-medium">Bạn chưa thực hiện bài thi thử nào.</p>
                <button
                  type="button"
                  onClick={() => setActiveMainTab("study")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  Chọn đề và thi thử ngay
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-4">Thời lượng</th>
                      <th className="py-3 px-4">Listening</th>
                      <th className="py-3 px-4">Reading</th>
                      <th className="py-3 px-4">Tổng điểm</th>
                      <th className="py-3 px-4">Số câu đúng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentTests
                      .flatMap((t) => t.historyAttempts)
                      .map((att, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-semibold text-slate-800">{att.date}</td>
                          <td className="py-3 px-4 text-slate-600">{att.duration}</td>
                          <td className="py-3 px-4 text-blue-600 font-bold">{att.listening}/495</td>
                          <td className="py-3 px-4 text-indigo-600 font-bold">{att.reading}/495</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-black rounded-lg border border-amber-200/80">
                              {att.score}/990
                            </span>
                          </td>
                          <td className="py-3 px-4 text-emerald-600 font-bold">
                            {att.correctCount}/{att.totalCount} câu
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* 0. MODAL CHỌN CHẾ ĐỘ (MODE SELECTION MODAL) */}
      {/* ======================================================== */}
      {modeSelectionTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Chọn chế độ</h2>
                <p className="text-sm font-bold text-slate-500 mt-0.5">{modeSelectionTest.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setModeSelectionTest(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto bg-slate-50/50 flex-1">
              {/* Mode Switcher Tabs */}
              <div className="p-1.5 bg-slate-200/70 rounded-2xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedModeTab("exam")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    selectedModeTab === "exam"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Luyện thi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedModeTab("practice")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    selectedModeTab === "practice"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Luyện tập</span>
                </button>
              </div>

              {/* CONTENT FOR EXAM MODE (LUYỆN THI) */}
              {selectedModeTab === "exam" && (
                <div className="space-y-5">
                  {/* Top 3 Exam Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Full Test */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-base">Full Test</h3>
                            <p className="text-xs text-slate-500 font-medium">Làm như thi thật</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const testToRun = modeSelectionTest;
                            setModeSelectionTest(null);
                            setActiveExamParts([]);
                            setExamDurationType("120");
                            handleOpenExam(testToRun);
                            handleStartExamNow();
                          }}
                          className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                          <span>Bắt đầu</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[11px] pt-2 border-t border-slate-100">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                          <Clock className="w-3 h-3" /> 120 phút
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                          <FileText className="w-3 h-3" /> 200 câu
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Thi Listening */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Headphones className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-base">Thi Listening</h3>
                            <p className="text-xs text-slate-500 font-medium">Thi riêng phần nghe</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const testToRun = modeSelectionTest;
                            setModeSelectionTest(null);
                            setActiveExamParts(["Part 1", "Part 2", "Part 3", "Part 4"]);
                            setExamDurationType("60");
                            handleOpenExam(testToRun);
                            handleStartExamNow();
                          }}
                          className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                          <span>Bắt đầu</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[11px] pt-2 border-t border-slate-100">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                          <Clock className="w-3 h-3" /> 45 phút
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                          <FileText className="w-3 h-3" /> 100 câu
                        </span>
                      </div>
                    </div>

                    {/* Card 3: Thi Reading */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-base">Thi Reading</h3>
                            <p className="text-xs text-slate-500 font-medium">Thi riêng phần đọc</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const testToRun = modeSelectionTest;
                            setModeSelectionTest(null);
                            setActiveExamParts(["Part 1", "Part 2", "Part 3", "Part 4"]);
                            setExamDurationType("60");
                            handleOpenExam(testToRun);
                            handleStartExamNow();
                          }}
                          className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                          <span>Bắt đầu</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[11px] pt-2 border-t border-slate-100">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                          <Clock className="w-3 h-3" /> 75 phút
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                          <FileText className="w-3 h-3" /> 100 câu
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Card: Thi theo Part */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">Thi theo Part</h3>
                          <p className="text-xs text-slate-500">Chọn Part cụ thể để thi thử</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const testToRun = modeSelectionTest;
                          setModeSelectionTest(null);
                          setActiveExamParts(selectedParts.length > 0 ? selectedParts : ["Part 1"]);
                          handleOpenExam(testToRun);
                          handleStartExamNow();
                        }}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Bắt đầu</span>
                      </button>
                    </div>

                    {/* Part List Selection */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Listening</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            { id: "Part 1", count: "6 câu" },
                            { id: "Part 2", count: "25 câu" },
                            { id: "Part 3", count: "39 câu" },
                            { id: "Part 4", count: "30 câu" },
                          ].map((p) => {
                            const isSelected = selectedParts.includes(p.id);
                            return (
                              <div
                                key={p.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedParts(selectedParts.filter((item) => item !== p.id));
                                  } else {
                                    setSelectedParts([...selectedParts, p.id]);
                                  }
                                }}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                                  isSelected
                                    ? "bg-blue-50/70 border-blue-500 text-blue-900 font-bold"
                                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    isSelected ? "border-blue-600 bg-white" : "border-slate-300"
                                  }`}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                  </div>
                                  <span className="text-xs sm:text-sm font-medium">{p.id}</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-400">{p.count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Reading</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            { id: "Part 5", count: "30 câu" },
                            { id: "Part 6", count: "16 câu" },
                            { id: "Part 7", count: "54 câu" },
                          ].map((p) => {
                            const isSelected = selectedParts.includes(p.id);
                            return (
                              <div
                                key={p.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedParts(selectedParts.filter((item) => item !== p.id));
                                  } else {
                                    setSelectedParts([...selectedParts, p.id]);
                                  }
                                }}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                                  isSelected
                                    ? "bg-blue-50/70 border-blue-500 text-blue-900 font-bold"
                                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    isSelected ? "border-blue-600 bg-white" : "border-slate-300"
                                  }`}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                  </div>
                                  <span className="text-xs sm:text-sm font-medium">{p.id}</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-400">{p.count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Time Selection Row */}
                      <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="font-bold text-slate-800">Thời gian làm bài</span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                            ⏱ 5 phút
                          </span>
                          <span className="text-slate-400 font-medium">(thời gian đề xuất)</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-slate-500 font-medium">Tự đặt</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>

                      {/* Summary Footer */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                          <FileText className="w-3.5 h-3.5" />
                          {(() => {
                            const countMap: { [p: string]: number } = {
                              "Part 1": 6, "Part 2": 25, "Part 3": 39, "Part 4": 30,
                              "Part 5": 30, "Part 6": 16, "Part 7": 54
                            };
                            const totalQ = selectedParts.reduce((acc, curr) => acc + (countMap[curr] || 0), 0);
                            return `${totalQ} câu`;
                          })()}
                        </span>
                        <span className="text-slate-500 font-medium">
                          Đã chọn {selectedParts.length} part
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENT FOR PRACTICE MODE (LUYỆN TẬP) */}
              {selectedModeTab === "practice" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs sm:text-sm font-semibold leading-relaxed">
                    <span className="font-extrabold text-blue-700">Chế độ Luyện tập:</span> Xem đáp án và giải thích ngay sau mỗi câu/nhóm câu hỏi.
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
                    {/* Box Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">Chọn Part để luyện tập</h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const testToRun = modeSelectionTest;
                          const filterToSet = selectedParts.length === 7 || selectedParts.length === 0
                            ? "ALL"
                            : (selectedParts.length === 1 ? selectedParts[0] : selectedParts);
                          setModeSelectionTest(null);
                          handleOpenPractice(testToRun, filterToSet);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Bắt đầu</span>
                      </button>
                    </div>

                    {/* Part Options List */}
                    <div className="space-y-4">
                      {/* Option: All 7 Parts */}
                      {(() => {
                        const isAllSelected = selectedParts.length === 7;
                        return (
                          <div
                            onClick={() => {
                              if (isAllSelected) setSelectedParts([]);
                              else setSelectedParts(["Part 1", "Part 2", "Part 3", "Part 4", "Part 5", "Part 6", "Part 7"]);
                            }}
                            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                              isAllSelected
                                ? "bg-blue-50/70 border-blue-500 text-blue-900 font-bold"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isAllSelected ? "border-blue-600 bg-white" : "border-slate-300"
                              }`}>
                                {isAllSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                              </div>
                              <span className="text-sm font-semibold">Chọn tất cả 7 Part</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">200 câu</span>
                          </div>
                        );
                      })()}

                      {/* LISTENING SECTION */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Listening</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            { id: "Part 1", count: "6 câu" },
                            { id: "Part 2", count: "25 câu" },
                            { id: "Part 3", count: "39 câu" },
                            { id: "Part 4", count: "30 câu" },
                          ].map((p) => {
                            const isSelected = selectedParts.includes(p.id);
                            return (
                              <div
                                key={p.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedParts(selectedParts.filter((item) => item !== p.id));
                                  } else {
                                    setSelectedParts([...selectedParts, p.id]);
                                  }
                                }}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                                  isSelected
                                    ? "bg-blue-50/70 border-blue-500 text-blue-900 font-bold"
                                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    isSelected ? "border-blue-600 bg-white" : "border-slate-300"
                                  }`}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                  </div>
                                  <span className="text-xs sm:text-sm font-medium">{p.id}</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-400">{p.count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* READING SECTION */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Reading</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            { id: "Part 5", count: "30 câu" },
                            { id: "Part 6", count: "16 câu" },
                            { id: "Part 7", count: "54 câu" },
                          ].map((p) => {
                            const isSelected = selectedParts.includes(p.id);
                            return (
                              <div
                                key={p.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedParts(selectedParts.filter((item) => item !== p.id));
                                  } else {
                                    setSelectedParts([...selectedParts, p.id]);
                                  }
                                }}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                                  isSelected
                                    ? "bg-blue-50/70 border-blue-500 text-blue-900 font-bold"
                                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    isSelected ? "border-blue-600 bg-white" : "border-slate-300"
                                  }`}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                  </div>
                                  <span className="text-xs sm:text-sm font-medium">{p.id}</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-400">{p.count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selection Summary Footer */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                          <FileText className="w-3.5 h-3.5" />
                          {(() => {
                            const countMap: { [p: string]: number } = {
                              "Part 1": 6, "Part 2": 25, "Part 3": 39, "Part 4": 30,
                              "Part 5": 30, "Part 6": 16, "Part 7": 54
                            };
                            const totalQ = selectedParts.reduce((acc, curr) => acc + (countMap[curr] || 0), 0);
                            return `${totalQ} câu`;
                          })()}
                        </span>
                        <span className="text-slate-500 font-medium">
                          Đã chọn {selectedParts.length} part
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. MODAL THI THỬ (FULL EXAM SIMULATION MODAL - FULLSCREEN MATCHING PRACTICE MODE) */}
      {/* ======================================================== */}
      {examModalTest && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150 font-sans">
          <div className="bg-white w-full h-full flex flex-col overflow-hidden">
            {/* Header Modal - Fullscreen Header Matching Practice Mode */}
            <header className="h-16 bg-blue-600 text-white px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-md select-none">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setExamModalTest(null)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Thoát</span>
                </button>

                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-700/90 border border-blue-400/40 text-white text-xs font-extrabold tracking-wide">
                  Thi thử TOEIC: {examModalTest.title}
                </span>
              </div>

              {examStarted && !examSubmitted && (
                <div className="flex items-center gap-2 sm:gap-2.5">
                  {/* SFX Bell toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isSfxEnabled;
                      setIsSfxEnabled(next);
                      setIsPlayingAudio(next);
                      if (next) playSfx("correct");
                      else playSfx("click");
                      triggerToast(next ? "🔊 Đã bật âm thanh SFX 👑" : "⏸ Đã tắt âm thanh SFX");
                    }}
                    className={`p-2 rounded-full text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      isSfxEnabled
                        ? "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300/50 animate-pulse"
                        : "bg-white/15 hover:bg-white/25 text-white/70"
                    }`}
                    title={isSfxEnabled ? "Tắt hiệu ứng âm thanh" : "Bật hiệu ứng âm thanh"}
                  >
                    {isSfxEnabled ? <Bell className="w-4 h-4 fill-slate-950" /> : <BellOff className="w-4 h-4" />}
                  </button>

                  {/* Timer button */}
                  <div className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-white/15 text-white border border-white/20 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime(examTimeRemaining)}</span>
                  </div>

                  {/* Answered Counter */}
                  <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-black shadow-2xs">
                    ✓ {Object.keys(examAnswers).length}/{activeExamQuestions.length}
                  </div>

                  {/* Question Grid Modal Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsQuestionGridOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-700/90 hover:bg-blue-800 border border-blue-400/40 text-white text-xs font-extrabold transition cursor-pointer"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Câu {examCurrentQIndex + 1}/{activeExamQuestions.length}</span>
                  </button>

                  {/* Submit button */}
                  <button
                    type="button"
                    onClick={handleSubmitExam}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Nộp bài thi</span>
                  </button>
                </div>
              )}
            </header>

            {/* Body Modal */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Màn hình chuẩn bị trước khi bấm thi */}
              {!examStarted && !examSubmitted && (
                <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
                  <div className="max-w-2xl w-full py-4 space-y-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center shadow-inner">
                      <Play className="w-8 h-8 ml-1" />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-slate-900">
                        Sẵn sàng thi thử {examModalTest.title}?
                      </h2>
                      <p className="text-sm text-slate-600">
                        {activeExamParts.length > 0 
                          ? `Bài thi tập trung cho phần: ${activeExamParts.join(", ")} (${activeExamQuestions.length} câu)`
                          : "Đề thi bao gồm 2 phần Listening & Reading với hệ thống câu hỏi chuẩn format ETS."}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
                      <label className="text-xs font-bold text-slate-700 uppercase block">
                        Chọn thời gian làm bài:
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: "120", label: "Chuẩn 120 phút", desc: "Full Test (200 câu)" },
                          { val: "60", label: "Rút gọn 60 phút", desc: "Mini Test (100 câu)" },
                          { val: "30", label: "Tập trung 30 phút", desc: "Speed Test (50 câu)" },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => setExamDurationType(item.val as any)}
                            className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                              examDurationType === item.val
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <p className="font-bold text-xs">{item.label}</p>
                            <p className={`text-[10px] mt-0.5 ${examDurationType === item.val ? "text-blue-100" : "text-slate-400"}`}>
                              {item.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartExamNow}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer active:scale-98"
                    >
                      Bắt đầu làm bài thi ngay
                    </button>
                  </div>
                </div>
              )}

              {/* Đang làm bài thi thử (Giao diện 2 bên chuẩn Hình 3) */}
              {examStarted && !examSubmitted && (() => {
                const currentQ = activeExamQuestions[examCurrentQIndex];
                if (!currentQ) return null;

                const isPart1or2 = currentQ.part === "Part 1" || currentQ.part === "Part 2";

                return (
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
                      
                      {/* LEFT PANE: Instruction & Content */}
                      <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-[#fafafa] border-r border-slate-200/80 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            Yêu cầu bài tập (Instruction)
                          </div>

                          {/* Tiêu đề nhóm câu cho Part 6 & Part 7 */}
                          {currentQ && (currentQ.part === "Part 6" || currentQ.part === "Part 7") && (
                            <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug pb-1">
                              {currentQ.groupTitle || (currentQ.part === "Part 6" ? "Questions 131–134 refer to the following article." : "Questions 147–148 refer to the following notice.")}
                            </div>
                          )}

                          <h2 className="text-sm font-bold text-slate-800 leading-relaxed">
                            {(() => {
                              if (currentQ.part === "Part 1") return "Listen to the audio and select the best statement describing the photograph.";
                              if (currentQ.part === "Part 2") return "Listen to the question and select the best response.";
                              if (currentQ.part === "Part 3") return "Listen to the conversation and answer the questions below.";
                              if (currentQ.part === "Part 4") return "Listen to the talk and answer the questions below.";
                              if (currentQ.part === "Part 5") return "Select the best answer to complete the sentence.";
                              if (currentQ.part === "Part 6" || currentQ.part === "Part 7") return "Read the passage and answer the questions.";
                              return "Select the best answer to complete the question.";
                            })()}
                          </h2>

                          {/* Passage text for Part 6 & Part 7 */}
                          {currentQ && currentQ.passage && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs font-mono whitespace-pre-line text-slate-800 leading-relaxed shadow-xs">
                              {currentQ.passage}
                            </div>
                          )}

                          {/* Photograph Image for Part 1 */}
                          {currentQ && currentQ.part === "Part 1" && currentQ.imageUrl && (
                            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-center overflow-hidden">
                              <img
                                src={currentQ.imageUrl}
                                alt="Photograph"
                                className="max-h-[380px] w-auto max-w-full rounded-xl object-contain"
                              />
                            </div>
                          )}

                          {/* Audio player for Listening parts */}
                          {currentQ && currentQ.audioUrl && (
                            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                              <div className="flex items-center justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsPlayingAudio(!isPlayingAudio);
                                    triggerToast(isPlayingAudio ? "⏸ Đã tạm dừng âm thanh bài nghe" : "🔊 Đã phát âm thanh bài nghe");
                                  }}
                                  className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-md shrink-0 cursor-pointer"
                                >
                                  {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                                </button>
                                
                                <div className="flex-1 flex items-center gap-1 h-8 px-2 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                  {[40, 65, 30, 85, 95, 40, 60, 30, 75, 90, 50, 35, 70, 80, 45, 90, 60, 40, 80, 50].map((h, i) => (
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
                                  00:24
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* RIGHT PANE: QUESTION & OPTIONS */}
                      <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white flex flex-col justify-between space-y-6">
                        <div className="space-y-5">
                          <div className="p-6 rounded-3xl border-2 border-blue-200/90 bg-white shadow-xs relative space-y-5">
                            {/* Badge Nhóm câu cho Part 6 & Part 7 */}
                            {currentQ && (currentQ.part === "Part 6" || currentQ.part === "Part 7") && (
                              <div className="flex items-center gap-2 pb-1">
                                <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
                                  Nhóm câu {currentQ.groupId || (currentQ.part === "Part 6" ? "131–134" : "147–148")}
                                </span>
                                <span className="text-xs text-slate-500 font-semibold">
                                  ({currentQ.groupTotal || (currentQ.part === "Part 6" ? "4" : "2")} câu hỏi)
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold tracking-wide shadow-2xs">
                                {currentQ.part} • {currentQ.part === "Part 1" ? "Hình ảnh" : currentQ.part === "Part 2" ? "Hỏi đáp" : currentQ.part === "Part 3" ? "Hội thoại ngắn" : currentQ.part === "Part 4" ? "Bài nói ngắn" : currentQ.part === "Part 5" ? "Điền câu" : currentQ.part === "Part 6" ? "Điền đoạn văn" : currentQ.part === "Part 7" ? "Đọc hiểu" : "Thi thử"}
                              </span>
                            </div>

                            <div className="text-base font-extrabold text-slate-900 leading-relaxed">
                              {currentQ.part === "Part 2" ? `${examCurrentQIndex + 1}. Mark your answer on your answer sheet.` : `${examCurrentQIndex + 1}. ${currentQ.questionText}`}
                            </div>

                            {/* OPTIONS LIST */}
                            <div className="space-y-3">
                              {Object.entries(currentQ.options).map(([optKey, optVal]) => {
                                if (currentQ.part === "Part 2" && optKey === "D") return null;

                                const isChosen = examAnswers[currentQ.id] === optKey;

                                return (
                                  <button
                                    key={optKey}
                                    type="button"
                                    onClick={() => {
                                      if (isSfxEnabled) playSfx("click");
                                      setExamAnswers((prev) => ({ ...prev, [currentQ.id]: optKey }));
                                    }}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                                      isChosen
                                        ? "bg-blue-50/80 border-blue-500 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-xs"
                                        : "bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50 text-slate-800"
                                    }`}
                                  >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                      isChosen ? "border-blue-600 bg-white" : "border-slate-300"
                                    }`}>
                                      {isChosen && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                    </div>
                                    <span className="text-sm font-semibold">
                                      ({optKey}) {optVal}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Navigation Footer */}
                    <footer className="h-14 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
                      <button
                        type="button"
                        disabled={examCurrentQIndex === 0}
                        onClick={() => setExamCurrentQIndex((prev) => Math.max(0, prev - 1))}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Câu trước</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs font-mono">
                          {examCurrentQIndex + 1}/{activeExamQuestions.length}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={examCurrentQIndex === activeExamQuestions.length - 1}
                        onClick={() => setExamCurrentQIndex((prev) => Math.min(activeExamQuestions.length - 1, prev + 1))}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
                      >
                        <span>Câu tiếp</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </footer>
                  </div>
                );
              })()}

              {/* Màn hình kết quả sau khi nộp bài */}
              {examSubmitted && examResultScore && (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-xl">
                      <Trophy className="w-14 h-14 text-amber-300 mx-auto drop-shadow-md animate-bounce" />
                      <h2 className="text-2xl sm:text-3xl font-black">
                        Chúc mừng bạn đã hoàn thành bài thi!
                      </h2>
                      <p className="text-sm text-blue-100">
                        Điểm thi đã được lưu tự động vào bảng tiến độ và thẻ đề thi {examModalTest.title}.
                      </p>

                      <div className="flex items-center justify-center gap-6 pt-4">
                        <div className="bg-white/15 backdrop-blur-xs px-5 py-3 rounded-2xl">
                          <p className="text-xs uppercase text-blue-200 font-bold">Listening</p>
                          <p className="text-2xl font-black">{examResultScore.listening} / 495</p>
                        </div>

                        <div className="bg-white/25 backdrop-blur-xs px-6 py-4 rounded-2xl ring-2 ring-white/30">
                          <p className="text-xs uppercase text-amber-200 font-bold">Tổng điểm TOEIC</p>
                          <p className="text-3xl sm:text-4xl font-black text-amber-300">
                            {examResultScore.total} / 990
                          </p>
                        </div>

                        <div className="bg-white/15 backdrop-blur-xs px-5 py-3 rounded-2xl">
                          <p className="text-xs uppercase text-blue-200 font-bold">Reading</p>
                          <p className="text-2xl font-black">{examResultScore.reading} / 495</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-blue-600" />
                        Chi tiết đáp án & Giải thích AI từng câu:
                      </h3>

                      <div className="space-y-4">
                        {activeExamQuestions.map((q) => {
                          const userAns = examAnswers[q.id];
                          const isCorrect = userAns === q.correctAnswer;

                          return (
                            <div
                              key={q.id}
                              className={`p-4 rounded-2xl border transition ${
                                isCorrect ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-xs text-slate-800">
                                  Câu {q.id} ({q.part})
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                    isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {isCorrect ? "Chính xác ✓" : `Sai ✗ (Bạn chọn: ${userAns || "Bỏ qua"})`}
                                </span>
                              </div>

                              <p className="text-xs text-slate-800 font-medium mb-2">{q.questionText}</p>

                              <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                                <p className="font-semibold text-blue-700">
                                  Đáp án đúng: <span className="font-bold">{q.correctAnswer}</span> - {q.options[q.correctAnswer]}
                                </p>
                                <p className="text-slate-600">
                                  <span className="font-bold text-slate-700">Giải thích:</span> {q.explanation}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setExamModalTest(null)}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition cursor-pointer"
                      >
                        Đóng và quay về danh sách đề
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ======================================================== */}
      {/* 2. MODAL LUYỆN TẬP (DUAL-PANE PRACTICE MODAL MATCHING IMAGE 2) */}
      {/* ======================================================== */}
      {practiceModalTest && (() => {
        const currentQ = filteredPracticeQuestions[practiceCurrentQIndex] || filteredPracticeQuestions[0];
        const qPart = currentQ ? currentQ.part : "Part 1";
        const chosenOpt = currentQ ? practiceAnswers[currentQ.id] : undefined;
        const isChecked = currentQ ? !!practiceChecked[currentQ.id] : false;

        return (
          <div className="fixed inset-0 z-50 bg-white flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150">
            <div className="bg-white w-full h-full flex flex-col overflow-hidden">
              
              {/* --- TOP HEADER BAR --- */}
              <header className="h-16 bg-blue-600 text-white px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPracticeModalTest(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Thoát</span>
                  </button>

                  <span className="inline-block px-4 py-1.5 rounded-full bg-blue-700/90 border border-blue-400/40 text-white text-xs font-extrabold tracking-wide">
                    {practiceModalTest.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5">
                  {/* 1. NÚT SONG NGỮ */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowBilingualPassage(!showBilingualPassage);
                      triggerToast(!showBilingualPassage ? "Bật bản dịch song ngữ tiếng Việt 🌐" : "Tắt bản dịch song ngữ");
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      showBilingualPassage
                        ? "bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300/50"
                        : "bg-white/15 hover:bg-white/25 text-white"
                    }`}
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>Song ngữ</span>
                  </button>

                  {/* NÚT DẪN CHỨNG 👑 (Dành riêng cho Part 6 & Part 7 chuẩn theo Ảnh 2) */}
                  {currentQ && (currentQ.part === "Part 6" || currentQ.part === "Part 7") && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowEvidence(!showEvidence);
                        triggerToast(!showEvidence ? "Bật hiển thị Dẫn chứng bài đọc màu vàng 💡" : "Tắt Dẫn chứng bài đọc");
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        showEvidence
                          ? "bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300/50"
                          : "bg-white/15 hover:bg-white/25 text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Dẫn chứng 👑</span>
                    </button>
                  )}

                  {/* 2. NÚT GHI CHÚ */}
                  <button
                    type="button"
                    onClick={() => setIsNotesModalOpen(true)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      currentQ && practiceUserNotes[currentQ.id]
                        ? "bg-emerald-400 text-slate-950 font-black shadow-md"
                        : "bg-white/15 hover:bg-white/25 text-white"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ghi chú {currentQ && practiceUserNotes[currentQ.id] ? "✓" : ""}</span>
                  </button>

                  {/* 3. NÚT ANNOTATOR */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAnnotatorActive(!isAnnotatorActive);
                      triggerToast(!isAnnotatorActive ? "Đã bật công cụ vẽ / đánh dấu Annotator ✏️" : "Tắt công cụ Annotator");
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isAnnotatorActive
                        ? "bg-amber-400 text-slate-950 font-black shadow-md"
                        : "bg-white/15 hover:bg-white/25 text-white"
                    }`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Annotator</span>
                  </button>

                  {/* NÚT ĐIỀN TỪ, LẬT TỪ & AUTO (Dành riêng cho Listening chuẩn theo Ảnh Part 1) */}
                  {currentQ && (currentQ.part === "Part 1" || currentQ.part === "Part 2" || currentQ.part === "Part 3" || currentQ.part === "Part 4") && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDictationMode(!isDictationMode);
                          triggerToast(!isDictationMode ? "Bật chế độ Điền Từ (Dictation) ✏️" : "Tắt chế độ Điền Từ");
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isDictationMode
                            ? "bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300/50"
                            : "bg-white/15 hover:bg-white/25 text-white"
                        }`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Điền Từ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsFlipCardMode(!isFlipCardMode);
                          triggerToast(!isFlipCardMode ? "Bật chế độ Lật Từ (Flashcard) ❇️" : "Tắt chế độ Lật Từ");
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isFlipCardMode
                            ? "bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300/50"
                            : "bg-white/15 hover:bg-white/25 text-white"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Lật Từ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAutoPlayNext(!isAutoPlayNext);
                          triggerToast(!isAutoPlayNext ? "Bật Tự động phát câu tiếp (Auto) 🔊" : "Tắt Tự động phát");
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isAutoPlayNext
                            ? "bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300/50"
                            : "bg-white/15 hover:bg-white/25 text-white"
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Auto</span>
                      </button>
                    </>
                  )}

                  {/* 4. NÚT CHUÔNG SFX */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextSfx = !isSfxEnabled;
                      setIsSfxEnabled(nextSfx);
                      if (nextSfx) playSfx("correct");
                      triggerToast(nextSfx ? "Âm thanh hiệu ứng: BẬT 🔔" : "Âm thanh hiệu ứng: TẮT 🔕");
                    }}
                    className={`p-2 rounded-full text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      isSfxEnabled
                        ? "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300/50 animate-pulse"
                        : "bg-white/15 hover:bg-white/25 text-white/70"
                    }`}
                    title={isSfxEnabled ? "Tắt hiệu ứng âm thanh (Đúng/Sai)" : "Bật hiệu ứng âm thanh (Đúng/Sai)"}
                  >
                    {isSfxEnabled ? <Bell className="w-4 h-4 fill-slate-950" /> : <BellOff className="w-4 h-4" />}
                  </button>

                  {/* 5. NÚT ĐỒNG HỒ ĐẾM THỜI GIAN & TẠM DỪNG */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerPaused(!isTimerPaused);
                      triggerToast(!isTimerPaused ? "Đã tạm dừng thời gian làm bài ⏱" : "Đã tiếp tục đếm thời gian ⏱");
                    }}
                    className={`font-mono text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                      isTimerPaused
                        ? "bg-rose-500 text-white border-rose-400 animate-pulse"
                        : "bg-white/15 hover:bg-white/25 text-white border-white/20"
                    }`}
                    title="Bấm để Tạm dừng / Tiếp tục đếm thời gian"
                  >
                    <span>{isTimerPaused ? "⏸" : "⏱"}</span>
                    <span>
                      {String(Math.floor(practiceTimerSeconds / 60)).padStart(2, "0")}:
                      {String(practiceTimerSeconds % 60).padStart(2, "0")}
                    </span>
                  </button>

                  {/* 6. NÚT TIẾN ĐỘ / SỐ CÂU ĐÚNG */}
                  <button
                    type="button"
                    onClick={() => {
                      const total = filteredPracticeQuestions.length;
                      const checked = Object.keys(practiceChecked).length;
                      const correct = Object.entries(practiceChecked).filter(
                        ([qId]) => practiceAnswers[Number(qId)] === filteredPracticeQuestions.find((q) => q.id === Number(qId))?.correctAnswer
                      ).length;
                      const percent = checked > 0 ? Math.round((correct / checked) * 100) : 0;
                      triggerToast(`Tiến độ: Đã làm ${checked}/${total} câu • Tỷ lệ đúng ${percent}% (Đúng ${correct}/${checked} câu) 🎯`);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-2xs transition cursor-pointer"
                    title="Bấm để xem thống kê chính xác"
                  >
                    ✓ {
                      Object.entries(practiceChecked).filter(
                        ([qId]) => practiceAnswers[Number(qId)] === filteredPracticeQuestions.find((q) => q.id === Number(qId))?.correctAnswer
                      ).length
                    }/{filteredPracticeQuestions.length}
                  </button>

                  {/* 7. NÚT MA TRẬN CÂU HỎI */}
                  <button
                    type="button"
                    onClick={() => setIsQuestionGridOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-900 border border-blue-400/40 text-white text-xs font-extrabold shadow-2xs font-mono transition cursor-pointer"
                    title="Bấm để mở danh sách toàn bộ câu hỏi"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Câu {practiceCurrentQIndex + 1}/{filteredPracticeQuestions.length}</span>
                  </button>
                </div>
              </header>

              
              {/* --- ANNOTATOR FLOATING TOOLBAR --- */}
              {isAnnotatorActive && (
                <div className="bg-amber-100 border-b border-amber-300 px-6 py-2 flex items-center justify-between shadow-xs select-none text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                      <Pencil className="w-4 h-4 text-amber-700" />
                      Công cụ Annotator (Đánh dấu & Tô màu bài viết):
                    </span>

                    <div className="flex items-center gap-1.5">
                      {(["yellow", "green", "pink", "blue"] as const).map((color) => {
                        const colorMap = {
                          yellow: "bg-yellow-400 border-yellow-500",
                          green: "bg-emerald-400 border-emerald-500",
                          pink: "bg-pink-400 border-pink-500",
                          blue: "bg-sky-400 border-sky-500",
                        };
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setAnnotatorColor(color);
                              triggerToast(`Đã chọn bút tô màu ${color}`);
                            }}
                            className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${colorMap[color]} ${
                              annotatorColor === color ? "scale-110 ring-2 ring-slate-800" : "opacity-70 hover:opacity-100"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => triggerToast("Đã tẩy toàn bộ nét vẽ / đánh dấu")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-50 transition cursor-pointer"
                    >
                      🧹 Xóa đánh dấu
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAnnotatorActive(false)}
                      className="p-1 rounded-full text-amber-900 hover:bg-amber-200 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* --- MODAL SỔ TAY GHI CHÚ CÁ NHÂN --- */}
              {isNotesModalOpen && currentQ && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-slate-900">Ghi chú cá nhân</h3>
                          <p className="text-xs text-slate-500">Câu {currentQ.id} • {currentQ.part}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNotesModalOpen(false)}
                        className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <textarea
                      rows={5}
                      value={practiceUserNotes[currentQ.id] || ""}
                      onChange={(e) => setPracticeUserNotes({ ...practiceUserNotes, [currentQ.id]: e.target.value })}
                      placeholder="Nhập ghi chú hoặc kiến thức cần nhớ cho câu hỏi này tại đây..."
                      className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-800 outline-none resize-none"
                    />

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...practiceUserNotes };
                          delete updated[currentQ.id];
                          setPracticeUserNotes(updated);
                          triggerToast("Đã xóa ghi chú của câu hỏi này!");
                        }}
                        className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
                      >
                        🗑 Xóa ghi chú
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsNotesModalOpen(false)}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsNotesModalOpen(false);
                            triggerToast("Đã lưu ghi chú cá nhân thành công! 💾");
                          }}
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                        >
                          💾 Lưu ghi chú
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- MODAL MA TRẬN TOÀN BỘ CÂU HỎI (QUESTION GRID MODAL) --- */}
              {isQuestionGridOpen && (() => {
                const questionsList = examModalTest ? activeExamQuestions : filteredPracticeQuestions;
                const currentQIdx = examModalTest ? examCurrentQIndex : practiceCurrentQIndex;
                const answersObj = examModalTest ? examAnswers : practiceAnswers;

                return (
                  <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Grid className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-slate-900">Danh sách toàn bộ câu hỏi</h3>
                            <p className="text-xs text-slate-500">
                              Đã làm {Object.keys(answersObj).length}/{questionsList.length} câu
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsQuestionGridOpen(false)}
                          className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Status Legend */}
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 py-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Đang xem
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Đã làm
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" /> Chưa làm
                        </span>
                      </div>

                      {/* Question Grid Buttons */}
                      <div className="flex-1 overflow-y-auto grid grid-cols-5 sm:grid-cols-8 gap-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                        {questionsList.map((q, idx) => {
                          const isCurrent = idx === currentQIdx;
                          const hasAnswered = !!answersObj[q.id];

                          let qBtnStyle = "bg-white border-slate-200 text-slate-700 hover:border-blue-400";
                          if (isCurrent) {
                            qBtnStyle = "bg-blue-600 text-white font-extrabold border-blue-600 ring-2 ring-blue-300";
                          } else if (hasAnswered) {
                            qBtnStyle = "bg-emerald-500 text-white font-bold border-emerald-500";
                          }

                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => {
                                if (examModalTest) {
                                  setExamCurrentQIndex(idx);
                                } else {
                                  setPracticeCurrentQIndex(idx);
                                }
                                setIsQuestionGridOpen(false);
                              }}
                              className={`h-11 rounded-xl border flex flex-col items-center justify-center text-xs transition cursor-pointer ${qBtnStyle}`}
                            >
                              <span className="font-extrabold">{idx + 1}</span>
                              <span className="text-[9px] opacity-80">{q.part}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setIsQuestionGridOpen(false)}
                          className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
                        >
                          Đóng danh sách
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* --- MAIN DUAL PANE PRACTICE AREA --- */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
                
                {/* LEFT PANE: INSTRUCTION & CONTENT */}
                <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-[#fafafa] border-r border-slate-200/80 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Yêu cầu bài tập (Instruction)
                    </div>

                    {/* Tiêu đề nhóm câu cho Part 6 & Part 7 chuẩn theo Ảnh 1 & 2 */}
                    {currentQ && (currentQ.part === "Part 6" || currentQ.part === "Part 7") && (
                      <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug pb-1">
                        {currentQ.groupTitle || (currentQ.part === "Part 6" ? "Questions 131–134 refer to the following article." : "Questions 147–148 refer to the following notice.")}
                      </div>
                    )}

                    <h2 className="text-sm font-bold text-slate-800 leading-relaxed">
                      {(() => {
                        if (qPart === "Part 1") return "Listen to the audio and select the best statement describing the photograph.";
                        if (qPart === "Part 2") return "Listen to the question and select the best response.";
                        if (qPart === "Part 3") return "Listen to the conversation and answer the questions below.";
                        if (qPart === "Part 4") return "Listen to the talk and answer the questions below.";
                        if (qPart === "Part 5") return "Select the best answer to complete the sentence.";
                        if (qPart === "Part 6" || qPart === "Part 7") return "Read the passage and answer the questions.";
                        return "Select the best answer to complete the question.";
                      })()}
                    </h2>

                    {/* Passage text for Part 6 & Part 7 */}
                    {currentQ && currentQ.passage && (
                      <div className="space-y-3">
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs font-mono whitespace-pre-line text-slate-800 leading-relaxed shadow-xs">
                          {currentQ.passage}
                        </div>

                        {showBilingualPassage && currentQ.bilingualPassage && (
                          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-950 whitespace-pre-line leading-relaxed shadow-xs">
                            <p className="font-bold text-indigo-700 mb-1 flex items-center gap-1.5">
                              <Languages className="w-3.5 h-3.5" /> Bản dịch song ngữ tiếng Việt:
                            </p>
                            {currentQ.bilingualPassage}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Photograph Image for Part 1 */}
                    {currentQ && currentQ.part === "Part 1" && currentQ.imageUrl && (
                      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-center overflow-hidden">
                        <img
                          src={currentQ.imageUrl}
                          alt="Photograph"
                          className="max-h-[380px] w-auto max-w-full rounded-xl object-contain"
                        />
                      </div>
                    )}

                    {/* Audio player cho các Part Listening chuẩn theo Ảnh Part 1 */}
                    {currentQ && currentQ.audioUrl && (
                      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                        {/* Hàng 1: Nút Play/Pause, Waveform & Dấu mốc thời gian */}
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-sm shrink-0 cursor-pointer"
                          >
                            {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                          </button>

                          <div className="flex-1 flex items-center gap-1 h-8 px-2 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
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
                            00:01 / 00:24
                          </span>
                        </div>

                        {/* Hàng 2: Bộ Tua lại 3s, Tua đi 5s và Tốc độ phát 1x */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => triggerToast("Tua lại 3 giây ↺")}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
                            >
                              ↺ 3s
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerToast("Tua tới 5 giây ↻")}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
                            >
                              ↻ 5s
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const speeds: ("1x" | "1.25x" | "1.5x" | "0.75x")[] = ["1x", "1.25x", "1.5x", "0.75x"];
                              const nextSpeed = speeds[(speeds.indexOf(audioSpeed) + 1) % speeds.length];
                              setAudioSpeed(nextSpeed);
                              triggerToast(`Tốc độ phát âm thanh: ${nextSpeed}`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition cursor-pointer"
                          >
                            {audioSpeed}
                          </button>
                        </div>

                        {/* Hàng 3: Hướng dẫn phím tắt bàn phím (Matching Ảnh Part 1) */}
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-medium overflow-x-auto">
                          <span className="inline-flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] text-slate-700">Ctrl</kbd>
                            Phát/Dừng
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] text-slate-700">Shift</kbd>
                            Tua lại 3s
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] text-slate-700">1-4</kbd>
                            Chọn đáp án
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT PANE: QUESTION & OPTIONS */}
                <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white flex flex-col justify-between space-y-6">
                  {currentQ && (
                    <div className="space-y-5">
                      <div className="p-6 rounded-3xl border-2 border-blue-200/90 bg-white shadow-xs relative space-y-5">
                        {/* Badge Nhóm câu cho Part 6 & Part 7 chuẩn theo Ảnh 1 & 2 */}
                        {currentQ && (currentQ.part === "Part 6" || currentQ.part === "Part 7") && (
                          <div className="flex items-center gap-2 pb-1">
                            <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
                              Nhóm câu {currentQ.groupId || (currentQ.part === "Part 6" ? "131–134" : "147–148")}
                            </span>
                            <span className="text-xs text-slate-500 font-semibold">
                              ({currentQ.groupTotal || (currentQ.part === "Part 6" ? "4" : "2")} câu hỏi)
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold tracking-wide shadow-2xs">
                            {currentQ.part} • {currentQ.part === "Part 1" ? "Hình ảnh" : currentQ.part === "Part 2" ? "Hỏi đáp" : currentQ.part === "Part 3" ? "Hội thoại ngắn" : currentQ.part === "Part 4" ? "Bài nói ngắn" : currentQ.part === "Part 5" ? "Điền câu" : currentQ.part === "Part 6" ? "Điền đoạn văn" : currentQ.part === "Part 7" ? "Đọc hiểu" : "Nhập môn"}
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
                              className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50 flex items-center justify-center transition cursor-pointer"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-base font-extrabold text-slate-900 leading-relaxed">
                          {currentQ.id}. {currentQ.questionText}
                        </div>

                        {/* Bản dịch tiếng Việt chuẩn theo Ảnh 5 */}
                        {(isChecked || showBilingualPassage) && currentQ.translation && (
                          <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200/90 text-blue-900 text-xs sm:text-sm font-semibold leading-relaxed shadow-xs space-y-1">
                            <div className="font-bold text-blue-700 flex items-center gap-1.5">
                              <Languages className="w-4 h-4 text-blue-600" />
                              <span>Bản dịch tiếng Việt:</span>
                            </div>
                            <p className="text-blue-950 font-medium">{currentQ.translation}</p>
                          </div>
                        )}

                        {/* OPTIONS LIST */}
                        <div className="space-y-3">
                          {Object.entries(currentQ.options).map(([optKey, optVal]) => {
                            const isChosen = chosenOpt === optKey;
                            const isRight = optKey === currentQ.correctAnswer;
                            const isPart1or2 = currentQ.part === "Part 1" || currentQ.part === "Part 2";

                            if ((currentQ.part === "Part 2" || qPart === "Part 2") && optKey === "D") return null;

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

                            return (
                              <div
                                key={optKey}
                                onClick={() => {
                                  if (isChecked) return;
                                  if (isSfxEnabled) {
                                    if (optKey === currentQ.correctAnswer) playSfx("correct");
                                    else playSfx("wrong");
                                  }
                                  setPracticeAnswers({ ...practiceAnswers, [currentQ.id]: optKey });
                                  setPracticeChecked({ ...practiceChecked, [currentQ.id]: true });
                                }}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${cardStyle}`}
                              >
                                <div className="flex items-center gap-3">
                                  {iconNode}
                                  <span className={`text-sm ${textColor}`}>
                                    {isPart1or2 ? `(${optKey})` : `(${optKey}) ${optVal}`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* KHUNG GIẢI THÍCH CHI TIẾT VÀ TỪ VỰNG NÊN HỌC CHUẨN THEO ẢNH 2, 3 & 4 */}
                      {isChecked && (
                        <div className="space-y-4 pt-2">
                          {/* KHUNG 1: GIẢI THÍCH CHI TIẾT */}
                          <div className="rounded-3xl border border-blue-200/90 bg-blue-50/40 p-5 space-y-4 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm sm:text-base">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <span>Giải thích chi tiết</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={showDetailedExplanation}
                                  onChange={(e) => setShowDetailedExplanation(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>

                            {showDetailedExplanation && (
                              <div className="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium pt-1 border-t border-blue-100">
                                <div>
                                  <p className="font-bold text-slate-900 mb-0.5">Bước 1: Xác định dạng câu hỏi</p>
                                  <p className="text-slate-700">
                                    {currentQ.step1 || 'Bốn đáp án là các dạng khác nhau của đại từ "they" nên đây là câu đại từ, cần xét vị trí chỗ trống.'}
                                  </p>
                                </div>

                                <div>
                                  <p className="font-bold text-slate-900 mb-0.5">Bước 2: Phân tích câu để biết chỗ trống cần gì</p>
                                  <p className="text-slate-700">
                                    {currentQ.step2 || 'Xét vị trí: chỗ trống đứng ngay trước cụm danh từ "earliest projects" (những dự án đầu tiên), nên cần tính từ sở hữu; loại "they" (A) vì là đại từ chủ ngữ, "them" (B) vì là đại từ tân ngữ và "themselves" (D) vì là đại từ phản thân, đều không đứng trước danh từ.'}
                                  </p>
                                </div>

                                <div>
                                  <p className="font-bold text-slate-900 mb-0.5">Bước 3: Chọn đáp án</p>
                                  <p className="text-slate-700">
                                    {currentQ.step3 || 'Chọn tính từ sở hữu "their" (của họ).'}
                                  </p>
                                </div>

                                {(currentQ.note || currentQ.explanation) && (
                                  <div className="pt-1 text-slate-600 italic">
                                    Lưu ý: {currentQ.note || '"their" thay cho "the two founders" (hai nhà sáng lập) ở đầu câu.'}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* KHUNG 2: TỪ VỰNG NÊN HỌC */}
                          <div className="rounded-3xl border border-amber-200/90 bg-amber-50/40 p-5 space-y-4 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-amber-950 font-extrabold text-sm sm:text-base">
                                <BookOpen className="w-4 h-4 text-amber-600" />
                                <span>Từ vựng nên học</span>
                              </div>

                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={showVocabSection}
                                  onChange={(e) => setShowVocabSection(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                              </label>
                            </div>

                            {showVocabSection && (
                              <div className="space-y-4 pt-1 border-t border-amber-100">
                                <div className="flex items-center justify-between text-xs pt-1">
                                  <span className="font-bold text-slate-700">3 từ</span>

                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => setIsVocabExpanded(!isVocabExpanded)}
                                      className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>{isVocabExpanded ? "Thu gọn" : "Chi tiết"}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => triggerToast("Đã lưu tất cả 3 từ vựng vào Giỏ từ!")}
                                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1 transition shadow-xs cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Thêm tất cả (3)</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  {[
                                    {
                                      word: "founder",
                                      pos: "n",
                                      level: "B2",
                                      usIpa: "/ˈfaʊndər/",
                                      ukIpa: "/ˈfaʊndə/",
                                      meaning: "người sáng lập",
                                      exampleEn: "Upon the two founders' retirement, the foundation released a booklet describing their earliest projects.",
                                      exampleVi: "Nhân dịp hai nhà sáng lập nghỉ hưu, quỹ đã phát hành một cuốn sách nhỏ mô tả những dự án đầu tiên của họ.",
                                      collocations: ["company founder – người sáng lập công ty", "founder member – thành viên sáng lập"],
                                      synonyms: ["creator – người tạo ra"],
                                    },
                                    {
                                      word: "foundation",
                                      pos: "n",
                                      level: "B2",
                                      usIpa: "/faʊnˈdeɪʃn/",
                                      ukIpa: "/faʊnˈdeɪʃn/",
                                      meaning: "quỹ",
                                      exampleEn: "The foundation released a booklet describing their projects.",
                                      exampleVi: "Quỹ đã phát hành một cuốn sách nhỏ mô tả các dự án.",
                                      collocations: ["charitable foundation – quỹ từ thiện"],
                                      synonyms: ["organization – tổ chức"],
                                    },
                                    {
                                      word: "booklet",
                                      pos: "n",
                                      level: "B2",
                                      usIpa: "/ˈbʊklət/",
                                      ukIpa: "/ˈbʊklət/",
                                      meaning: "cuốn sách nhỏ",
                                      exampleEn: "They published an information booklet.",
                                      exampleVi: "Họ đã xuất bản một cuốn sách thông tin nhỏ.",
                                      collocations: ["information booklet – cuốn sách nhỏ thông tin"],
                                      synonyms: ["pamphlet – cuốn sách nhỏ"],
                                    },
                                  ].map((vItem, idx) => (
                                    <div
                                      key={idx}
                                      className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-xs space-y-3 transition"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-slate-900 text-base">{vItem.word}</span>
                                            <span className="italic font-serif text-slate-500 text-xs">{vItem.pos}</span>
                                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-extrabold text-[10px]">
                                              {vItem.level}
                                            </span>
                                          </div>

                                          <div className="text-xs text-slate-600 flex items-center gap-2 font-mono">
                                            <span>US {vItem.usIpa}</span>
                                            <button type="button" onClick={() => playSfx("correct")} className="text-blue-600 hover:text-blue-700 cursor-pointer">
                                              <Volume2 className="w-3.5 h-3.5 inline" />
                                            </button>
                                            <span>UK {vItem.ukIpa}</span>
                                            <button type="button" onClick={() => playSfx("correct")} className="text-blue-600 hover:text-blue-700 cursor-pointer">
                                              <Volume2 className="w-3.5 h-3.5 inline" />
                                            </button>
                                          </div>

                                          <div className="text-xs font-bold text-slate-800">
                                            {vItem.meaning}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <button
                                            type="button"
                                            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition cursor-pointer"
                                          >
                                            <Bookmark className="w-4 h-4" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => triggerToast(`Đã thêm từ "${vItem.word}" vào Giỏ từ!`)}
                                            className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
                                          >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Thêm</span>
                                          </button>
                                        </div>
                                      </div>

                                      {isVocabExpanded && (
                                        <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
                                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                            <p className="text-slate-800 font-medium">{vItem.exampleEn}</p>
                                            <p className="text-slate-500">{vItem.exampleVi}</p>
                                          </div>

                                          {vItem.collocations && vItem.collocations.length > 0 && (
                                            <div className="space-y-1">
                                              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block">CỤM TỪ</span>
                                              {vItem.collocations.map((col, cIdx) => (
                                                <p key={cIdx} className="text-slate-700 font-medium pl-1">• {col}</p>
                                              ))}
                                            </div>
                                          )}

                                          {vItem.synonyms && vItem.synonyms.length > 0 && (
                                            <div className="space-y-1">
                                              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block">ĐỒNG NGHĨA</span>
                                              {vItem.synonyms.map((syn, sIdx) => (
                                                <p key={sIdx} className="text-slate-700 font-medium pl-1">• {syn}</p>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* --- BOTTOM NAVIGATION BAR --- */}
              <footer className="h-14 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5 text-rose-500" />
                    <span>Báo lỗi</span>
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                    <span>Giỏ từ (0)</span>
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tra từ</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={practiceCurrentQIndex === 0}
                    onClick={() => setPracticeCurrentQIndex((prev) => Math.max(0, prev - 1))}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-xs cursor-pointer"
                  >
                    <Grid className="w-4 h-4" />
                    <span>{practiceCurrentQIndex + 1}/{filteredPracticeQuestions.length}</span>
                  </button>

                  <button
                    type="button"
                    disabled={practiceCurrentQIndex === filteredPracticeQuestions.length - 1}
                    onClick={() => setPracticeCurrentQIndex((prev) => Math.min(filteredPracticeQuestions.length - 1, prev + 1))}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </footer>
            </div>
          </div>
        );
      })()}

      

      {/* ======================================================== */}
      {/* 3. MODAL XÓA LỊCH SỬ THI (DELETE MODAL) */}
      {/* ======================================================== */}
      {deleteModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Xóa lịch sử {deleteModalTest.title}?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thao tác này sẽ xóa toàn bộ điểm số, thời gian làm và các lượt thi của đề thi này. Đề sẽ được đặt lại về trạng thái &quot;Chưa luyện tập&quot;.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalTest(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MODAL XEM LỊCH SỬ LÀM BÀI (HISTORY MODAL) */}
      {/* ======================================================== */}
      {historyModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Lịch sử thi: {historyModalTest.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">Crack TOEIC {selectedVol.toUpperCase()}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalTest(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {historyModalTest.historyAttempts.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">Chưa có lượt thi nào được ghi nhận cho đề này.</p>
                </div>
              ) : (
                historyModalTest.historyAttempts.map((att, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{att.date}</span>
                      <span className="text-slate-500">Thời lượng: {att.duration}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-blue-600 font-bold">LC: {att.listening}/495</span>
                      <span className="text-indigo-600 font-bold">RC: {att.reading}/495</span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-black">
                        Tổng: {att.score}/990
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              {historyModalTest.historyAttempts.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const target = historyModalTest;
                    setHistoryModalTest(null);
                    handleOpenDelete(target);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
                >
                  Xóa lịch sử
                </button>
              )}
              <button
                type="button"
                onClick={() => setHistoryModalTest(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL LÀM LẠI ĐỀ THI (REDO MODAL) */}
      {/* ======================================================== */}
      {redoModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Làm lại {redoModalTest.title}?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tất cả các câu trả lời sẽ được làm mới để bạn bắt đầu lượt làm bài mới toanh với đồng hồ bấm giờ.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRedoModalTest(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmRedo}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Bắt đầu làm lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL ĐÁP ÁN & TRANSCRIPT (TRANSCRIPT MODAL) */}
      {/* ======================================================== */}
      {transcriptModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    Đáp án & Lời thoại (Transcript): {transcriptModalTest.title}
                  </h3>
                  <p className="text-xs text-slate-400">Tra cứu nhanh đáp án và dịch nghĩa chi tiết</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTranscriptModalTest(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ô tìm kiếm transcript */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo nội dung câu hỏi, từ khóa transcript, đáp án..."
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {filteredTranscriptQuestions.map((q) => (
                <div key={q.id} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      Câu {q.id} ({q.part})
                    </span>
                    <span className="font-black text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Đáp án đúng: {q.correctAnswer}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900">{q.questionText}</p>

                  {q.transcript && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                      <p className="font-bold text-slate-800">Transcript:</p>
                      <p className="italic text-slate-700">{q.transcript}</p>
                      <p className="text-slate-500 pt-1 border-t border-slate-100">{q.translation}</p>
                    </div>
                  )}

                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-800">Giải thích AI:</span> {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL TỪ VỰNG TRỌNG TÂM CỦA ĐỀ ('A' VOCAB MODAL) */}
      {/* ======================================================== */}
      {vocabModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    Sổ từ vựng trọng tâm: {vocabModalTest.title}
                  </h3>
                  <p className="text-xs text-indigo-100">Các từ vựng cốt lõi thường xuất hiện trong đề này</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVocabModalTest(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              {vocabModalTest.keyVocab.map((item, idx) => {
                const isSaved = savedVocabBag.includes(item.word);

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 transition flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{item.word}</span>
                        <span className="text-xs font-mono text-indigo-600 font-semibold">{item.ipa}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700">
                          {item.pos}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{item.meaning}</p>
                      <p className="text-xs italic text-slate-500 font-sans">Ví dụ: &quot;{item.example}&quot;</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSaveVocab(item.word)}
                      title="Lưu vào giỏ từ vựng"
                      className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                        isSaved
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-600" : ""}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: THÊM / SỬA ĐỀ THI THỬ (MOCK TEST CRUD) */}
      {/* ======================================================== */}
      {showCreateTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Quản lý đề thi</span>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingTest ? "Chỉnh sửa thông tin đề thi" : "Thêm đề thi thử mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateTestModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên đề thi *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Test 11"
                  value={testFormTitle}
                  onChange={(e) => setTestFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bộ đề (Volume)</label>
                  <select
                    value={testFormVolId}
                    onChange={(e) => setTestFormVolId(e.target.value as "vol1" | "vol2")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="vol1">Crack TOEIC Vol 1</option>
                    <option value="vol2">Crack TOEIC Vol 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ khó</label>
                  <select
                    value={testFormDifficulty}
                    onChange={(e) => setTestFormDifficulty(e.target.value as "Khó" | "Trung bình" | "Vừa sức")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="Vừa sức">Vừa sức</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTestModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingTest ? "Lưu thay đổi" : "Tạo đề thi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: XÁC NHẬN XÓA ĐỀ THI (DELETE TEST CONFIRM) */}
      {/* ======================================================== */}
      {deleteConfirmTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Xóa đề thi này?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn đề <strong className="text-slate-900">&quot;{deleteConfirmTest.title}&quot;</strong> khỏi {deleteConfirmTest.volId === "vol1" ? "Crack TOEIC Vol 1" : "Crack TOEIC Vol 2"}? Toàn bộ lịch sử làm bài và câu hỏi của đề này sẽ bị xóa.
              </p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmTest(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTest}
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
