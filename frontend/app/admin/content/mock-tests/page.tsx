"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ClipboardCheck,
  Sparkles,
  BookOpen,
  TrendingUp,
  BarChart2,
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
  correctAnswer: string;
  explanation: string;
  transcript?: string;
  translation?: string;
}

// DỮ LIỆU CÂU HỎI MẪU CHO MÔ PHỎNG THI THỬ & LUYỆN TẬP
const SAMPLE_EXAM_QUESTIONS: PracticeQuestion[] = [
  // Part 1: Photographs
  {
    id: 1,
    part: "Part 1",
    questionText: "Look at the photograph and choose the statement that best describes what you see.",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    options: {
      A: "Some people are seated around a conference table.",
      B: "Documents are being filed in the cabinet.",
      C: "A presentation is being displayed on the monitor.",
      D: "The office windows are currently being cleaned.",
    },
    correctAnswer: "A",
    transcript: "(A) Some people are seated around a conference table. (B) Documents are being filed in the cabinet. (C) A presentation is being displayed on the monitor. (D) The office windows are currently being cleaned.",
    translation: "(A) Một số người đang ngồi quanh bàn họp. (B) Tài liệu đang được xếp vào tủ. (C) Một bài thuyết trình đang được chiếu trên màn hình. (D) Cửa sổ văn phòng đang được lau dọn.",
    explanation: "Trong bức ảnh, các nhân sự đang ngồi xung quanh bàn hội nghị trong phòng họp, phương án (A) miêu tả chính xác nhất hành động chính.",
  },
  {
    id: 2,
    part: "Part 1",
    questionText: "Look at the photograph and choose the best description.",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    options: {
      A: "A forklift is unloading cargo from a cargo ship.",
      B: "Boxes and packages are stacked high in a warehouse.",
      C: "Workers are inspecting conveyor belt machinery.",
      D: "A delivery van is parked beside the loading dock.",
    },
    correctAnswer: "B",
    transcript: "(A) A forklift is unloading cargo from a cargo ship. (B) Boxes and packages are stacked high in a warehouse. (C) Workers are inspecting conveyor belt machinery. (D) A delivery van is parked beside the loading dock.",
    translation: "(A) Xe nâng đang bốc dỡ hàng từ tàu chở hàng. (B) Các thùng và kiện hàng được xếp chồng cao trong nhà kho. (C) Công nhân đang kiểm tra băng chuyền máy móc. (D) Xe giao hàng đang đỗ cạnh bến bốc hàng.",
    explanation: "Trọng tâm bức ảnh thể hiện các thùng carton và kiện hàng xếp gọn gàng thành tầng cao bên trong kho lưu trữ hàng hóa.",
  },
  // Part 2: Question - Response
  {
    id: 3,
    part: "Part 2",
    questionText: "When is the annual budget proposal scheduled to be submitted?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    options: {
      A: "Yes, our team approved it yesterday.",
      B: "By the end of business hours this Friday.",
      C: "In the main boardroom on the fifth floor.",
    },
    correctAnswer: "B",
    transcript: "Question: When is the annual budget proposal scheduled to be submitted? (A) Yes, our team approved it yesterday. (B) By the end of business hours this Friday. (C) In the main boardroom on the fifth floor.",
    translation: "Câu hỏi: Khi nào bản đề xuất ngân sách hàng năm dự kiến được nộp? (A) Vâng, nhóm chúng tôi đã phê duyệt nó hôm qua. (B) Trước giờ tan sở thứ Sáu tuần này. (C) Tại phòng họp chính ở tầng năm.",
    explanation: "Câu hỏi bắt đầu bằng 'When' (Khi nào) hỏi về mốc thời gian, phương án (B) đưa ra thời hạn cụ thể 'By the end of business hours this Friday'. Loại (A) vì câu hỏi có từ để hỏi không trả lời bằng Yes/No.",
  },
  {
    id: 4,
    part: "Part 2",
    questionText: "Why hasn't the overseas shipment from Tokyo arrived yet?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    options: {
      A: "Severe weather conditions delayed international flights.",
      B: "No, we only received forty cartons.",
      C: "Mr. Sato is the chief logistics coordinator.",
    },
    correctAnswer: "A",
    transcript: "Question: Why hasn't the overseas shipment from Tokyo arrived yet? (A) Severe weather conditions delayed international flights. (B) No, we only received forty cartons. (C) Mr. Sato is the chief logistics coordinator.",
    translation: "Câu hỏi: Tại sao lô hàng từ Tokyo vẫn chưa đến? (A) Thời tiết khắc nghiệt đã làm hoãn các chuyến bay quốc tế. (B) Không, chúng tôi chỉ nhận được 40 thùng. (C) Ông Sato là điều phối viên hậu cần trưởng.",
    explanation: "Câu hỏi 'Why' hỏi lý do chậm trễ, phương án (A) giải thích nguyên nhân do điều kiện thời tiết xấu ảnh hưởng chuyến bay chuyển phát.",
  },
  // Part 3: Short Conversation
  {
    id: 5,
    part: "Part 3",
    questionText: "What problem does the woman mention regarding the newly launched client portal?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    transcript: "Man: Jessica, have you heard any initial feedback from the beta testing group regarding our new enterprise portal? Woman: Yes, Mark. While the user interface is intuitive, several corporate accounts reported that the billing statement export feature keeps crashing when processing multi-currency files. Man: Oh, that's urgent. I will notify the backend development team immediately.",
    translation: "Nam: Jessica, bạn đã nhận được phản hồi ban đầu nào từ nhóm thử nghiệm bản beta về cổng doanh nghiệp mới chưa? Nữ: Rồi Mark. Dù giao diện rất trực quan nhưng nhiều tài khoản doanh nghiệp báo rằng tính năng xuất báo cáo hóa đơn bị lỗi sập khi xử lý các tệp đa tiền tệ. Nam: Ồ, việc đó rất khẩn cấp. Tôi sẽ báo đội phát triển backend ngay lập tức.",
    options: {
      A: "The subscription pricing was calculated incorrectly.",
      B: "A billing export function malfunctions with certain files.",
      C: "The password recovery system is unavailable.",
      D: "Users are struggling to navigate the dashboard layout.",
    },
    correctAnswer: "B",
    explanation: "Người phụ nữ nói rõ: 'several corporate accounts reported that the billing statement export feature keeps crashing when processing multi-currency files' -> Phương án (B) phản ánh chính xác.",
  },
  // Part 5: Incomplete Sentences
  {
    id: 6,
    part: "Part 5",
    questionText: "The executive committee will _______ approve the construction timeline once environmental clearances are received.",
    options: {
      A: "formal",
      B: "formally",
      C: "formalize",
      D: "formality",
    },
    correctAnswer: "B",
    translation: "Ủy ban điều hành sẽ chính thức phê duyệt tiến độ xây dựng một khi nhận được giấy phép môi trường.",
    explanation: "Vị trí chỗ trống nằm giữa trợ động từ 'will' và động từ chính 'approve' -> cần một Trạng từ (Adverb) thể thức '-ly' để bổ nghĩa cho động từ: 'formally'.",
  },
  {
    id: 7,
    part: "Part 5",
    questionText: "All employees travelling internationally on corporate business are entitled to full _______ for meal and lodging expenses.",
    options: {
      A: "reimbursement",
      B: "reimburse",
      C: "reimbursed",
      D: "reimbursable",
    },
    correctAnswer: "A",
    translation: "Tất cả nhân viên đi công tác quốc tế cho doanh nghiệp đều được hưởng toàn bộ khoản hoàn tiền cho chi phí ăn uống và lưu trú.",
    explanation: "Sau tính từ 'full' cần một Danh từ (Noun) đóng vai trò tân ngữ của giới từ 'to'. 'Reimbursement' (sự hoàn trả chi phí) là danh từ chính xác.",
  },
  {
    id: 8,
    part: "Part 5",
    questionText: "Mr. Henderson demonstrated remarkable leadership _______ the merger transition period last autumn.",
    options: {
      A: "during",
      B: "while",
      C: "although",
      D: "because",
    },
    correctAnswer: "A",
    translation: "Ông Henderson đã thể hiện khả năng lãnh đạo xuất sắc trong suốt giai đoạn chuyển giao sáp nhập vào mùa thu năm ngoái.",
    explanation: "Phía sau là cụm danh từ 'the merger transition period' chỉ một khoảng thời gian cụ thể -> dùng Giới từ 'during'. Các từ 'while', 'although', 'because' là liên từ cần đi kèm mệnh đề (S + V).",
  },
  // Part 6: Text Completion
  {
    id: 9,
    part: "Part 6",
    passage: "To: All Department Supervisors\nFrom: Facilities Management\nSubject: Scheduled Office Renovations\n\nPlease be advised that the air conditioning filtration system on floors 3 through 6 will undergo maintenance this Saturday. Technicians will work _______ from 8:00 AM to 5:00 PM. Please ensure all personal electronics are unplugged prior to Friday evening.",
    questionText: "Choose the word that best completes the sentence in the renovation notice.",
    options: {
      A: "continuously",
      B: "continuous",
      C: "continuation",
      D: "continue",
    },
    correctAnswer: "A",
    explanation: "Bổ nghĩa cho động từ 'will work' cần trạng từ 'continuously' (làm việc liên tục từ 8:00 đến 17:00).",
  },
  // Part 7: Reading Comprehension
  {
    id: 10,
    part: "Part 7",
    passage: `MEMORANDUM\n\nTo: Regional Sales Representatives\nFrom: Clara Vance, VP of Customer Operations\nDate: October 14\nSubject: Enhanced Client Feedback Initiative\n\nStarting November 1, our organization is instituting a digital survey system to gauge customer satisfaction across our Asia-Pacific retail accounts. Every client who completes a transaction exceeding $5,000 will automatically receive a personalized evaluation link within 48 hours.\n\nRepresentatives whose quarterly accounts maintain an average satisfaction rating of 95% or higher will qualify for the Annual Excellence Incentive bonus. To assist staff with this rollout, our training division has scheduled three interactive webinars next week. Participation in at least one session is mandatory for all account executives.`,
    bilingualPassage: `BẢN GHI NHỚ\n\nGửi: Các đại diện bán hàng khu vực\nTừ: Clara Vance, Phó Chủ tịch Vận hành Khách hàng\nNgày: 14 tháng 10\nChủ đề: Sáng kiến Tăng cường Phản hồi Khách hàng\n\nBắt đầu từ ngày 1 tháng 11, tổ chức của chúng ta sẽ áp dụng hệ thống khảo sát kỹ thuật số nhằm đo lường mức độ hài lòng của khách hàng tại các tài khoản bán lẻ khu vực Châu Á - Thái Bình Dương. Mỗi khách hàng hoàn tất giao dịch vượt quá 5.000 USD sẽ tự động nhận được đường liên kết đánh giá cá nhân hóa trong vòng 48 giờ.\n\nNhững đại diện có các tài khoản trong quý duy trì mức đánh giá hài lòng trung bình từ 95% trở lên sẽ đủ điều kiện nhận tiền thưởng Khích lệ Xuất sắc Thường niên. Nhằm hỗ trợ nhân viên triển khai chương trình này, bộ phận đào tạo đã lên lịch ba buổi hội thảo trực tuyến vào tuần tới. Việc tham gia ít nhất một buổi là bắt buộc đối với tất cả các chuyên viên quản lý tài khoản.`,
    evidence: "Representatives whose quarterly accounts maintain an average satisfaction rating of 95% or higher will qualify for the Annual Excellence Incentive bonus.",
    questionText: "What incentive is offered to representatives with exceptional satisfaction ratings?",
    options: {
      A: "Additional paid annual vacation days",
      B: "A special performance cash bonus",
      C: "An immediate promotion to senior executive",
      D: "A complimentary trip to corporate headquarters",
    },
    correctAnswer: "B",
    explanation: "Dẫn chứng trong văn bản ghi rõ: '...will qualify for the Annual Excellence Incentive bonus' (sẽ đủ điều kiện nhận tiền thưởng khuyến khích hàng năm) -> Phương án (B) là đáp án đúng.",
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
  const [practiceAnswers, setPracticeAnswers] = useState<{ [qId: number]: string }>({});
  const [practiceChecked, setPracticeChecked] = useState<{ [qId: number]: boolean }>({});
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
    SAMPLE_EXAM_QUESTIONS.forEach((q) => {
      const selected = examAnswers[q.id];
      if (selected === q.correctAnswer) {
        correct += 1;
      } else {
        wrong += 1;
      }
    });

    // Ước tính điểm số TOEIC chuẩn theo tỷ lệ đúng
    const correctRatio = correct / SAMPLE_EXAM_QUESTIONS.length;
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

  // Mở modal Luyện tập
  const handleOpenPractice = (test: TestItem) => {
    setPracticeModalTest(test);
    setPracticePartFilter("ALL");
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

  // Lọc câu hỏi luyện tập theo Part
  const filteredPracticeQuestions = useMemo(() => {
    if (practicePartFilter === "ALL") return SAMPLE_EXAM_QUESTIONS;
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
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/60 rounded-full w-fit">
        <button
          type="button"
          onClick={() => setActiveMainTab("study")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            activeMainTab === "study"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Học
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("progress")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            activeMainTab === "progress"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
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
                    onClick={() => handleOpenExam(test)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-slate-600" />
                    Thi thử
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPractice(test)}
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
      {/* 1. MODAL THI THỬ (FULL EXAM SIMULATION MODAL) */}
      {/* ======================================================== */}
      {examModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    Thi thử TOEIC: {examModalTest.title} (Crack TOEIC {selectedVol.toUpperCase()})
                  </h3>
                  <p className="text-xs text-blue-100">
                    Mô phỏng sát phòng thi chuẩn ETS • Tự động tính điểm sau khi nộp
                  </p>
                </div>
              </div>

              {examStarted && !examSubmitted && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-900 font-mono font-black text-sm shadow-xs">
                    <Clock className="w-4 h-4 text-slate-900 animate-spin" />
                    <span>{formatTime(examTimeRemaining)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmitExam}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    Nộp bài thi
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setExamModalTest(null)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Nếu chưa bấm bắt đầu thi -> Màn hình chuẩn bị */}
              {!examStarted && !examSubmitted && (
                <div className="max-w-2xl mx-auto py-6 space-y-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center shadow-inner">
                    <Play className="w-8 h-8 ml-1" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900">
                      Sẵn sàng thi thử {examModalTest.title}?
                    </h2>
                    <p className="text-sm text-slate-600">
                      Đề thi bao gồm 2 phần Listening & Reading với hệ thống câu hỏi chuẩn format ETS.
                    </p>
                  </div>

                  {/* Lựa chọn thời gian thi */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase block">
                      Chọn thời gian làm bài:
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(
                        [
                          { val: "120", label: "Chuẩn 120 phút", desc: "Full Test (200 câu)" },
                          { val: "60", label: "Rút gọn 60 phút", desc: "Mini Test (100 câu)" },
                          { val: "30", label: "Tập trung 30 phút", desc: "Speed Test (50 câu)" },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setExamDurationType(item.val)}
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

                  <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-800 text-left space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" /> Lưu ý khi làm bài thi thử:
                    </p>
                    <p>• Đồng hồ sẽ bắt đầu đếm ngược ngay khi bấm &quot;Bắt đầu làm bài&quot;.</p>
                    <p>• Bạn có thể đánh dấu câu hỏi (Flag) để kiểm tra lại trước khi nộp.</p>
                    <p>• Đáp án và giải thích chi tiết sẽ được hiển thị ngay sau khi nộp bài.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartExamNow}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer active:scale-98"
                  >
                    Bắt đầu làm bài thi ngay
                  </button>
                </div>
              )}

              {/* Nếu đang trong lúc làm bài */}
              {examStarted && !examSubmitted && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Cột 1-3: Câu hỏi & Trả lời */}
                  <div className="lg:col-span-3 space-y-5">
                    {SAMPLE_EXAM_QUESTIONS[examCurrentQIndex] && (
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-5">
                        {/* Tiêu đề câu hỏi */}
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                            {SAMPLE_EXAM_QUESTIONS[examCurrentQIndex].part} • Câu {SAMPLE_EXAM_QUESTIONS[examCurrentQIndex].id} / {SAMPLE_EXAM_QUESTIONS.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const qId = SAMPLE_EXAM_QUESTIONS[examCurrentQIndex].id;
                              setExamFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                              examFlagged[SAMPLE_EXAM_QUESTIONS[examCurrentQIndex].id]
                                ? "bg-amber-100 text-amber-700 border border-amber-300"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <Flag className="w-3.5 h-3.5" />
                            {examFlagged[SAMPLE_EXAM_QUESTIONS[examCurrentQIndex].id] ? "Đã gắn cờ xem lại" : "Gắn cờ câu này"}
                          </button>
                        </div>

                        {/* Hình ảnh (nếu Part 1) */}
                        {SAMPLE_EXAM_QUESTIONS[examCurrentQIndex].imageUrl && (
                          <div className="rounded-xl overflow-hidden border border-slate-200 max-w-md mx-auto shadow-xs">
                            <img
                              src={SAMPLE_EXAM_QUESTIONS[examCurrentQIndex].imageUrl}
                              alt="TOEIC question illustration"
                              className="w-full h-56 object-cover"
                            />
                          </div>
                        )}

                        {/* Đoạn văn (nếu Part 6 hoặc Part 7) */}
                        {SAMPLE_EXAM_QUESTIONS[examCurrentQIndex].passage && (
                          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs font-mono whitespace-pre-line text-slate-700 max-h-60 overflow-y-auto leading-relaxed shadow-inner">
                            {SAMPLE_EXAM_QUESTIONS[examCurrentQIndex].passage}
                          </div>
                        )}

                        {/* Âm thanh audio player (nếu có audio) */}
                        {SAMPLE_EXAM_QUESTIONS[examCurrentQIndex].audioUrl && (
                          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                                className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition cursor-pointer"
                              >
                                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                              </button>
                              <span className="text-xs font-bold text-slate-700">Audio nghe</span>
                            </div>
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className={`h-full bg-blue-600 rounded-full ${isPlayingAudio ? "w-2/3 animate-pulse" : "w-1/4"}`} />
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">00:45</span>
                          </div>
                        )}

                        {/* Nội dung câu hỏi */}
                        <p className="text-sm font-bold text-slate-900 leading-snug">
                          {SAMPLE_EXAM_QUESTIONS[examCurrentQIndex].questionText}
                        </p>

                        {/* Danh sách 4 đáp án A/B/C/D */}
                        <div className="space-y-2.5">
                          {Object.entries(SAMPLE_EXAM_QUESTIONS[examCurrentQIndex].options).map(([optKey, optVal]) => {
                            const qId = SAMPLE_EXAM_QUESTIONS[examCurrentQIndex].id;
                            const isChosen = examAnswers[qId] === optKey;

                            return (
                              <button
                                key={optKey}
                                type="button"
                                onClick={() => setExamAnswers((prev) => ({ ...prev, [qId]: optKey }))}
                                className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                                  isChosen
                                    ? "bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20"
                                    : "bg-white border-slate-200 hover:bg-slate-100 text-slate-800"
                                }`}
                              >
                                <span
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                    isChosen ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {optKey}
                                </span>
                                <span className="text-xs font-medium leading-relaxed">{optVal}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Nút Previous / Next câu hỏi */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <button
                            type="button"
                            disabled={examCurrentQIndex === 0}
                            onClick={() => setExamCurrentQIndex((prev) => Math.max(0, prev - 1))}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Câu trước
                          </button>

                          <button
                            type="button"
                            disabled={examCurrentQIndex === SAMPLE_EXAM_QUESTIONS.length - 1}
                            onClick={() => setExamCurrentQIndex((prev) => Math.min(SAMPLE_EXAM_QUESTIONS.length - 1, prev + 1))}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition cursor-pointer"
                          >
                            Câu tiếp theo
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cột 4: Bảng điều hướng câu hỏi (Question Palette) */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Danh sách câu hỏi
                      </h4>
                      <span className="text-[11px] font-bold text-blue-600">
                        Đã làm: {Object.keys(examAnswers).length} / {SAMPLE_EXAM_QUESTIONS.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
                      {SAMPLE_EXAM_QUESTIONS.map((q, idx) => {
                        const isDone = !!examAnswers[q.id];
                        const isFlag = !!examFlagged[q.id];
                        const isCurrent = idx === examCurrentQIndex;

                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setExamCurrentQIndex(idx)}
                            className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center relative transition cursor-pointer ${
                              isCurrent
                                ? "ring-2 ring-blue-600 ring-offset-2"
                                : ""
                            } ${
                              isFlag
                                ? "bg-amber-400 text-slate-900 font-black"
                                : isDone
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {q.id}
                            {isFlag && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-3 border-t border-slate-200 space-y-1.5 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-md bg-blue-600" />
                        <span>Đã làm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-md bg-amber-400" />
                        <span>Đang gắn cờ xem lại</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-md bg-white border border-slate-300" />
                        <span>Chưa trả lời</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmitExam}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                    >
                      Nộp bài & Xem kết quả
                    </button>
                  </div>
                </div>
              )}

              {/* Màn hình kết quả sau khi nộp bài */}
              {examSubmitted && examResultScore && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Card chúc mừng điểm số */}
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

                  {/* Chi tiết đáp án và giải thích từng câu */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-blue-600" />
                      Chi tiết đáp án & Giải thích AI từng câu:
                    </h3>

                    <div className="space-y-4">
                      {SAMPLE_EXAM_QUESTIONS.map((q) => {
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MODAL LUYỆN TẬP (PRACTICE MODE MODAL) */}
      {/* ======================================================== */}
      {practiceModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    Chế độ luyện tập: {practiceModalTest.title}
                  </h3>
                  <p className="text-xs text-blue-100">
                    Nghe chép chính tả, đọc song ngữ Anh–Việt và xem dẫn chứng chi tiết
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPracticeModalTest(null)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thanh chọn Part & Chế độ học đặc biệt */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              {/* Lọc Part */}
              <div className="flex flex-wrap items-center gap-1.5">
                {["ALL", "Part 1", "Part 2", "Part 3", "Part 5", "Part 6", "Part 7"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPracticePartFilter(p)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                      practicePartFilter === p
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Tùy chọn học thông minh */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBilingualPassage(!showBilingualPassage)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    showBilingualPassage
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" />
                  Đọc song ngữ Anh–Việt
                </button>

                <button
                  type="button"
                  onClick={() => setShowEvidence(!showEvidence)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    showEvidence
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Xem dẫn chứng
                </button>
              </div>
            </div>

            {/* Danh sách câu hỏi luyện tập */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {filteredPracticeQuestions.map((q) => {
                const isChecked = !!practiceChecked[q.id];
                const selectedOpt = practiceAnswers[q.id];
                const isCorrect = selectedOpt === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-blue-200 transition"
                  >
                    {/* Header câu hỏi */}
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                        {q.part} • Câu {q.id}
                      </span>

                      {q.transcript && (
                        <span className="text-[11px] font-semibold text-slate-400">
                          Kèm Lời thoại & Bản dịch
                        </span>
                      )}
                    </div>

                    {/* Hình ảnh (Part 1) */}
                    {q.imageUrl && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 max-w-sm shadow-xs">
                        <img src={q.imageUrl} alt="Part 1" className="w-full h-48 object-cover" />
                      </div>
                    )}

                    {/* Đoạn văn (Part 6, Part 7) */}
                    {q.passage && (
                      <div className="space-y-2">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono whitespace-pre-line text-slate-800 leading-relaxed">
                          {q.passage}
                        </div>

                        {/* Song ngữ Anh - Việt */}
                        {showBilingualPassage && q.bilingualPassage && (
                          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-950 whitespace-pre-line leading-relaxed">
                            <p className="font-bold text-indigo-700 mb-1 flex items-center gap-1.5">
                              <Languages className="w-3.5 h-3.5" /> Bản dịch song ngữ tiếng Việt:
                            </p>
                            {q.bilingualPassage}
                          </div>
                        )}

                        {/* Dẫn chứng đáp án */}
                        {showEvidence && q.evidence && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-amber-800">Dẫn chứng câu trả lời trong bài:</p>
                              <p className="italic">&quot;{q.evidence}&quot;</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audio Player cho bài nghe */}
                    {q.audioUrl && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition cursor-pointer"
                          >
                            {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                          </button>
                          <span className="text-xs font-semibold text-slate-700">Nghe đoạn audio</span>
                        </div>

                        {/* Chế độ chép chính tả */}
                        <div className="flex-1 max-w-sm">
                          <input
                            type="text"
                            placeholder="Gõ chính tả những gì bạn nghe được..."
                            value={dictationInput[q.id] || ""}
                            onChange={(e) => setDictationInput({ ...dictationInput, [q.id]: e.target.value })}
                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Nội dung câu hỏi */}
                    <p className="text-sm font-bold text-slate-900">{q.questionText}</p>

                    {/* Lựa chọn trắc nghiệm */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {Object.entries(q.options).map(([optKey, optVal]) => {
                        const isChosen = selectedOpt === optKey;
                        const isRightKey = optKey === q.correctAnswer;

                        let style = "bg-white border-slate-200 hover:bg-slate-50 text-slate-800";
                        if (isChecked) {
                          if (isRightKey) style = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20";
                          else if (isChosen) style = "bg-rose-50 border-rose-400 text-rose-900";
                        } else if (isChosen) {
                          style = "bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-500/30";
                        }

                        return (
                          <button
                            key={optKey}
                            type="button"
                            onClick={() => {
                              if (!isChecked) {
                                setPracticeAnswers({ ...practiceAnswers, [q.id]: optKey });
                              }
                            }}
                            className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition cursor-pointer ${style}`}
                          >
                            <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                              {optKey}
                            </span>
                            <span className="text-xs leading-relaxed">{optVal}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Nút Kiểm tra đáp án & Giải thích ngay */}
                    {!isChecked ? (
                      <button
                        type="button"
                        disabled={!selectedOpt}
                        onClick={() => setPracticeChecked({ ...practiceChecked, [q.id]: true })}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Kiểm tra kết quả
                      </button>
                    ) : (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          {isCorrect ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Chính xác! Tuyệt vời.
                            </span>
                          ) : (
                            <span className="text-rose-600 flex items-center gap-1">
                              <X className="w-4 h-4" /> Chưa chính xác. Đáp án đúng là {q.correctAnswer}.
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">
                          <span className="font-bold text-slate-900">Giải thích AI:</span> {q.explanation}
                        </p>

                        {q.transcript && (
                          <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-600 space-y-1">
                            <p className="font-bold text-slate-800">Lời thoại (Transcript):</p>
                            <p className="italic text-slate-700">{q.transcript}</p>
                            <p className="text-slate-500 font-sans">{q.translation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
