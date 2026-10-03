"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  SpellCheck,
  Sparkles,
  FileText,
  RotateCcw,
  Trash2,
  Check,
  X,
  Clock,
  HelpCircle,
  Award,
  ArrowRight,
  Search,
  Plus,
  Play,
  CheckSquare,
  Square,
  AlertTriangle,
  Lightbulb,
  Edit3,
  BookOpen,
  BarChart3,
  Star,
  Compass,
  Book,
} from "lucide-react";

// --- INTERFACES ---
export interface GrammarQuestionItem {
  id: string;
  part: string; // "Part 5" | "Part 6"
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  trapNote?: string;
  translation?: string;
  difficulty?: string;
}

export interface GrammarTopicItem {
  id: string;
  code: string;
  title: string;
  englishTitle: string;
  part: "Part 5" | "Part 6" | "Part 5 & 6";
  targetScore: "350-500" | "500-750" | "750+";
  status: "PUBLISHED" | "DRAFT";
  summary: string;
  formula: string;
  signalWords: string[];
  traps: string[];
  examples: {
    sentence: string;
    translation: string;
    analysis?: string;
  }[];
  questions: GrammarQuestionItem[];
  studiedCount: number;
  correctCount: number;
  wrongCount: number;
  bookmarked?: boolean;
}

// --- INITIAL DATA BASE OF 12 COMPREHENSIVE TOEIC GRAMMAR TOPICS ---
const INITIAL_GRAMMAR_TOPICS: GrammarTopicItem[] = [
  {
    id: "g-present-perfect",
    code: "PPT-01",
    title: "Thì Hiện Tại Hoàn Thành",
    englishTitle: "Present Perfect Tense",
    part: "Part 5 & 6",
    targetScore: "500-750",
    status: "PUBLISHED",
    summary: "Diễn tả hành động bắt đầu trong quá khứ và vẫn tiếp diễn ở hiện tại, hoặc vừa mới hoàn tất để lại kết quả.",
    formula: "S + have/has + V3/ed + O",
    signalWords: ["since + mốc thời gian", "for + khoảng thời gian", "already", "yet", "recently", "just", "so far", "over the past decade"],
    traps: [
      "Bẫy nhầm lẫn 'since' (mốc) và 'for' (khoảng).",
      "Bẫy từ 'past' trong cụm 'over the past 5 years' - đây là dấu hiệu Hiện Tại Hoàn Thành chứ KHÔNG phải Quá Khứ Đơn.",
      "Chủ ngữ là danh từ số ít hoặc danh từ không đếm được dùng 'has', danh từ số nhiều dùng 'have'.",
    ],
    examples: [
      {
        sentence: "Ms. Emily has managed this regional branch for over five years.",
        translation: "Cô Emily đã quản lý chi nhánh khu vực này được hơn năm năm.",
        analysis: "Có 'for over five years' và chủ ngữ 'Ms. Emily' số ít -> dùng 'has managed'.",
      },
      {
        sentence: "Our engineering team has already completed the performance audit.",
        translation: "Đội ngũ kỹ thuật của chúng tôi đã hoàn thành xong việc kiểm toán hiệu suất.",
        analysis: "'Already' đứng giữa trợ động từ has và V3 completed.",
      },
    ],
    questions: [
      {
        id: "ppt-q1",
        part: "Part 5",
        questionText: "Ms. Emily _______ this regional branch for over five years, achieving record revenue growth each quarter.",
        options: {
          A: "manages",
          B: "has managed",
          C: "will manage",
          D: "is managing",
        },
        correctAnswer: "B",
        explanation: "Dấu hiệu nhận biết 'for over five years' (khoảng thời gian từ quá khứ đến hiện tại) kết hợp với chủ ngữ ngôi thứ ba số ít 'Ms. Emily' đòi hỏi thì Hiện Tại Hoàn Thành: has + V3/ed (has managed).",
        trapNote: "Tránh nhầm với Hiện Tại Đơn (A) khi thấy 'each quarter' ở vế sau; động từ chính của câu gắn với trạng từ thời gian 'for over five years'.",
        translation: "Cô Emily đã quản lý chi nhánh khu vực này được hơn 5 năm, đạt mức tăng trưởng doanh thu kỷ lục mỗi quý.",
        difficulty: "500-750",
      },
      {
        id: "ppt-q2",
        part: "Part 5",
        questionText: "Since the introduction of the automated inventory system, order processing errors _______ by nearly 40 percent.",
        options: {
          A: "have decreased",
          B: "decrease",
          C: "decreased",
          D: "will decrease",
        },
        correctAnswer: "A",
        explanation: "Cấu trúc với 'Since + mốc thời gian/sự kiện': mệnh đề chính bắt buộc chia thì Hiện Tại Hoàn Thành. Chủ ngữ 'errors' là danh từ số nhiều -> 'have decreased'.",
        trapNote: "Bẫy chọn 'decreased' (C) vì thấy chữ 'Since' tạo cảm giác thì quá khứ.",
        translation: "Kể từ khi đưa vào hệ thống kiểm kho tự động, các lỗi xử lý đơn hàng đã giảm gần 40 phần trăm.",
        difficulty: "500-750",
      },
      {
        id: "ppt-q3",
        part: "Part 5",
        questionText: "The external auditing committee has not _______ its annual financial assessment report yet.",
        options: {
          A: "finalize",
          B: "finalizes",
          C: "finalized",
          D: "finalizing",
        },
        correctAnswer: "C",
        explanation: "Sau trợ động từ 'has not', ta cần một quá khứ phân từ V3/ed để tạo thành thể phủ định thì Hiện Tại Hoàn Thành (has not finalized).",
        trapNote: "Từ 'yet' ở cuối câu là dấu hiệu kinh điển của thì Hiện Tại Hoàn Thành.",
        translation: "Ủy ban kiểm toán độc lập vẫn chưa hoàn tất báo cáo đánh giá tài chính hàng năm.",
        difficulty: "350-500",
      },
      {
        id: "ppt-q4",
        part: "Part 6",
        questionText: "Over the past decade, our research facility _______ over thirty patents in renewable energy technologies.",
        options: {
          A: "has registered",
          B: "registers",
          C: "is registering",
          D: "registered",
        },
        correctAnswer: "A",
        explanation: "Cụm từ 'Over the past / last + khoảng thời gian' bắt buộc chia thì Hiện Tại Hoàn Thành. Chủ ngữ 'facility' số ít -> 'has registered'.",
        trapNote: "Nhiều thí sinh thấy chữ 'past' vội chọn Quá Khứ Đơn (D) mà quên cụm 'Over the past decade'.",
        translation: "Trong suốt một thập kỷ qua, cơ sở nghiên cứu của chúng tôi đã đăng ký hơn 30 bằng sáng chế công nghệ năng lượng tái tạo.",
        difficulty: "500-750",
      },
    ],
    studiedCount: 4,
    correctCount: 3,
    wrongCount: 1,
    bookmarked: true,
  },
  {
    id: "g-simple-present",
    code: "SPT-02",
    title: "Thì Hiện Tại Đơn",
    englishTitle: "Simple Present Tense",
    part: "Part 5",
    targetScore: "350-500",
    status: "PUBLISHED",
    summary: "Diễn tả quy định công ty, lịch trình tàu xe cố định, sự thật hiển nhiên hoặc công việc diễn ra thường xuyên.",
    formula: "S + V(s/es) + O | S + am/is/are + Adj/N",
    signalWords: ["always", "usually", "regularly", "on a quarterly basis", "every month", "often", "routinely"],
    traps: [
      "Bẫy danh từ ghép: Chủ ngữ dài có nhiều danh từ, chỉ danh từ chính đứng cuối hoặc trước giới từ mới quyết định chia số ít/nhiều.",
      "Lịch trình giờ giấc của phương tiện giao thông hoặc hội nghị dùng Hiện Tại Đơn thay vì Tương Lai.",
    ],
    examples: [
      {
        sentence: "The compliance team reviews internal regulations on a quarterly basis.",
        translation: "Đội ngũ tuân thủ xem xét các quy định nội bộ theo định kỳ hàng quý.",
        analysis: "Chủ ngữ 'team' số ít, trạng ngữ 'on a quarterly basis' -> reviews.",
      },
    ],
    questions: [
      {
        id: "spt-q1",
        part: "Part 5",
        questionText: "The corporate compliance department _______ internal safety regulations on a quarterly basis.",
        options: {
          A: "review",
          B: "reviews",
          C: "reviewed",
          D: "is reviewing",
        },
        correctAnswer: "B",
        explanation: "Cụm 'on a quarterly basis' (định kỳ mỗi quý) chỉ tính quy luật lặp lại. Chủ ngữ 'department' là danh từ số ít nên thêm 's': reviews.",
        trapNote: "Bẫy danh từ ghép: 'corporate compliance department' có từ cốt lõi là 'department' số ít.",
        translation: "Bộ phận tuân thủ doanh nghiệp đánh giá lại các quy định an toàn nội bộ theo định kỳ hàng quý.",
        difficulty: "350-500",
      },
      {
        id: "spt-q2",
        part: "Part 5",
        questionText: "Direct express trains to Frankfurt usually _______ from Platform 4 at 07:15 AM every weekday.",
        options: {
          A: "depart",
          B: "departs",
          C: "departed",
          D: "departing",
        },
        correctAnswer: "A",
        explanation: "Lịch trình tàu xe cố định chia Hiện Tại Đơn. Chủ ngữ 'Direct express trains' là số nhiều -> động từ nguyên mẫu: depart.",
        trapNote: "Chú ý đuôi danh từ số nhiều '-s' của trains.",
        translation: "Các chuyến tàu tốc hành trực tiếp tới Frankfurt thường khởi hành từ Ga số 4 lúc 7:15 sáng mỗi ngày trong tuần.",
        difficulty: "350-500",
      },
    ],
    studiedCount: 2,
    correctCount: 2,
    wrongCount: 0,
    bookmarked: false,
  },
  {
    id: "g-simple-past",
    code: "PST-03",
    title: "Thì Quá Khứ Đơn",
    englishTitle: "Simple Past Tense",
    part: "Part 5 & 6",
    targetScore: "350-500",
    status: "PUBLISHED",
    summary: "Diễn tả sự kiện, giao dịch hoặc cuộc họp đã chấm dứt hoàn toàn trong quá khứ với mốc thời gian xác định rõ.",
    formula: "S + V2/ed + O | S + was/were + Adj/N",
    signalWords: ["yesterday", "last week/month/year", "ago", "in + năm quá khứ", "previously", "formerly"],
    traps: [
      "Bẫy từ 'found': 'found' vừa là V2 của 'find' (tìm kiếm), vừa là V nguyên mẫu của 'found' (thành lập -> quá khứ là founded).",
      "Không dùng Hiện Tại Hoàn Thành khi đã có mốc thời gian quá khứ rõ ràng như 'yesterday' hay 'in 2022'.",
    ],
    examples: [
      {
        sentence: "The executive board approved the commercial merger agreement yesterday afternoon.",
        translation: "Ban điều hành đã phê duyệt thỏa thuận sáp nhập thương mại vào chiều hôm qua.",
        analysis: "Có 'yesterday afternoon' -> động từ chia approved.",
      },
    ],
    questions: [
      {
        id: "pst-q1",
        part: "Part 5",
        questionText: "The executive board _______ the commercial merger agreement during yesterday afternoon's session.",
        options: {
          A: "approved",
          B: "approves",
          C: "will approve",
          D: "has approved",
        },
        correctAnswer: "A",
        explanation: "Có mốc thời gian xác định 'yesterday afternoon's session' nên chia Quá Khứ Đơn: approved.",
        trapNote: "Không chọn Hiện Tại Hoàn Thành (D) khi có 'yesterday'.",
        translation: "Ban điều hành đã phê duyệt thỏa thuận sáp nhập thương mại trong phiên họp chiều hôm qua.",
        difficulty: "350-500",
      },
      {
        id: "pst-q2",
        part: "Part 5",
        questionText: "Three years ago, Dr. Jensen _______ the pharmaceutical startup that later pioneered this vaccine.",
        options: {
          A: "founded",
          B: "funds",
          C: "found",
          D: "founding",
        },
        correctAnswer: "A",
        explanation: "'Three years ago' yêu cầu thì Quá Khứ Đơn. Động từ 'found' (thành lập công ty) có quá khứ là 'founded'.",
        trapNote: "Tránh nhầm với 'found' là dạng quá khứ của 'find' (tìm thấy).",
        translation: "Ba năm trước, Tiến sĩ Jensen đã thành lập công ty khởi nghiệp dược phẩm mà sau này tiên phong phát triển loại vắc-xin này.",
        difficulty: "500-750",
      },
    ],
    studiedCount: 2,
    correctCount: 2,
    wrongCount: 0,
    bookmarked: false,
  },
  {
    id: "g-simple-future",
    code: "SFT-04",
    title: "Thì Tương Lai & Mệnh Đề Thời Gian",
    englishTitle: "Future Tenses & Time Clauses",
    part: "Part 5",
    targetScore: "350-500",
    status: "PUBLISHED",
    summary: "Diễn tả kế hoạch dự kiến hoặc cam kết trong tương lai; quy tắc phối thì mệnh đề chỉ thời gian (when, as soon as, once).",
    formula: "S + will + V_inf | Mệnh đề chính (will + V) + as soon as + Mệnh đề thời gian (Hiện tại đơn)",
    signalWords: ["tomorrow", "next week", "soon", "shortly", "in the upcoming days", "as soon as", "once"],
    traps: [
      "Bẫy phối thì kinh điển: Trong mệnh đề trạng ngữ chỉ thời gian bắt đầu bằng 'when/as soon as/after', TUYỆT ĐỐI không dùng 'will'.",
      "Sau 'will' bắt buộc là động từ nguyên mẫu không chia to.",
    ],
    examples: [
      {
        sentence: "We will dispatch your order as soon as the wire transfer confirmation is received.",
        translation: "Chúng tôi sẽ gửi đơn hàng ngay khi nhận được xác nhận chuyển khoản.",
        analysis: "Vế chính dùng 'will dispatch', vế sau 'as soon as' dùng hiện tại đơn 'is received'.",
      },
    ],
    questions: [
      {
        id: "sft-q1",
        part: "Part 5",
        questionText: "We _______ your expedited shipment as soon as the wire transfer confirmation is verified.",
        options: {
          A: "will dispatch",
          B: "dispatched",
          C: "dispatch",
          D: "have dispatched",
        },
        correctAnswer: "A",
        explanation: "Cấu trúc mệnh đề trạng ngữ chỉ thời gian: Mệnh đề chính (Tương lai đơn: will dispatch) + as soon as + Mệnh đề thời gian (Hiện tại đơn: is verified).",
        trapNote: "'Will' chỉ đứng ở mệnh đề chính, không đứng trong mệnh đề chứa 'as soon as'.",
        translation: "Chúng tôi sẽ gửi kiện hàng hỏa tốc ngay khi xác nhận chuyển khoản được kiểm chứng.",
        difficulty: "500-750",
      },
      {
        id: "sft-q2",
        part: "Part 5",
        questionText: "The technical maintenance crew _______ the servers late tonight to minimize downtime.",
        options: {
          A: "will restart",
          B: "restarted",
          C: "have restarted",
          D: "restarting",
        },
        correctAnswer: "A",
        explanation: "'Late tonight' (đêm muộn hôm nay) chỉ hành động sắp diễn ra trong tương lai -> will restart.",
        trapNote: "Phân biệt với 'last night' (tối qua).",
        translation: "Đội bảo trì kỹ thuật sẽ khởi động lại các máy chủ vào đêm muộn hôm nay để giảm thiểu gián đoạn.",
        difficulty: "350-500",
      },
    ],
    studiedCount: 0,
    correctCount: 0,
    wrongCount: 0,
    bookmarked: false,
  },
  {
    id: "g-passive-voice",
    code: "PV-05",
    title: "Câu Bị Động Trong Hợp Đồng & Quy Chế",
    englishTitle: "Passive Voice in Business English",
    part: "Part 5 & 6",
    targetScore: "500-750",
    status: "PUBLISHED",
    summary: "Được dùng khi đối tượng chịu tác động quan trọng hơn chủ thể hành động. Rất phổ biến trong thông báo chính sách, tài liệu bảo mật và văn bản hợp đồng.",
    formula: "S + be + V3/ed (+ by O) | Modal: S + modal + be + V3/ed",
    signalWords: ["by + tân ngữ", "must be + V3/ed", "has been + V3/ed", "is scheduled to be + V3/ed"],
    traps: [
      "Bẫy trạng từ xen giữa: has been [completely] revised. Trạng từ đứng xen giữa 'be' và 'V3/ed' để bổ nghĩa.",
      "Chủ ngữ là vật (báo cáo, đơn hàng, gói cước) hầu như luôn đi với câu bị động nếu phía sau không có tân ngữ trực tiếp.",
    ],
    examples: [
      {
        sentence: "All confidential financial statements must be reviewed before publication.",
        translation: "Tất cả các báo cáo tài chính mật phải được xem xét kỹ lưỡng trước khi xuất bản.",
        analysis: "Modal passive: must be reviewed.",
      },
    ],
    questions: [
      {
        id: "pv-q1",
        part: "Part 5",
        questionText: "All confidential financial statements must be _______ by the certified public accountant before publication.",
        options: {
          A: "reviewed",
          B: "review",
          C: "reviewing",
          D: "reviews",
        },
        correctAnswer: "A",
        explanation: "Cấu trúc bị động với động từ khuyết thiếu: Modal Verb (must) + be + V3/ed (reviewed). Báo cáo tài chính chịu tác động hành động xem xét.",
        trapNote: "Có 'by the accountant' là dấu hiệu điển hình của câu bị động.",
        translation: "Tất cả các báo cáo tài chính mật phải được xem xét kỹ lưỡng bởi kế toán viên công chứng trước khi xuất bản.",
        difficulty: "350-500",
      },
      {
        id: "pv-q2",
        part: "Part 6",
        questionText: "The employee handbook has been completely _______ to reflect current remote work protocols.",
        options: {
          A: "revised",
          B: "revising",
          C: "revise",
          D: "revision",
        },
        correctAnswer: "A",
        explanation: "Cấu trúc bị động thì Hiện Tại Hoàn Thành: has been + (trạng từ completely) + V3/ed (revised). 'Sổ tay nhân viên' được sửa đổi.",
        trapNote: "Trạng từ 'completely' đứng xen giữa để gây rối mắt thí sinh.",
        translation: "Cuốn sổ tay nhân viên đã được sửa đổi toàn diện nhằm phản ánh đúng các quy trình làm việc từ xa hiện hành.",
        difficulty: "500-750",
      },
    ],
    studiedCount: 2,
    correctCount: 2,
    wrongCount: 0,
    bookmarked: true,
  },
  {
    id: "g-conditionals",
    code: "CS-06",
    title: "Câu Điều Kiện & Đảo Ngữ Với Should/Had",
    englishTitle: "Conditionals & Inversion in TOEIC",
    part: "Part 5",
    targetScore: "750+",
    status: "PUBLISHED",
    summary: "Câu điều kiện loại 1, 2, 3 và kỹ thuật Đảo ngữ câu điều kiện cực kỳ phổ biến trong các câu hỏi điểm 700+ TOEIC Part 5.",
    formula: "Loại 1: If + S + V(hiện tại), S + will + V | Đảo ngữ loại 1: Should + S + V_inf, S + will/please + V",
    signalWords: ["If", "Provided that", "As long as", "Should you require", "Had we known", "Unless (= If not)"],
    traps: [
      "Bẫy đảo ngữ Should: 'Should you have any questions...' đứng đầu câu không phải câu hỏi mà là câu điều kiện đảo ngữ mang nghĩa 'Nếu bạn có bất kỳ câu hỏi nào...'. Động từ sau 'Should + S' luôn ở dạng NGUYÊN THỂ.",
      "Unless đã mang nghĩa phủ định, mệnh đề sau Unless không dùng dạng phủ định.",
    ],
    examples: [
      {
        sentence: "Should you require any further assistance with your travel itinerary, please contact our help desk.",
        translation: "Nếu quý khách cần thêm bất kỳ sự hỗ trợ nào về lịch trình, xin vui lòng liên hệ bàn hỗ trợ của chúng tôi.",
        analysis: "Đảo ngữ loại 1: Should + you + require (V_inf).",
      },
    ],
    questions: [
      {
        id: "cs-q1",
        part: "Part 5",
        questionText: "Should you _______ any further assistance with your travel itinerary, please contact our help desk.",
        options: {
          A: "require",
          B: "requires",
          C: "required",
          D: "requiring",
        },
        correctAnswer: "A",
        explanation: "Đảo ngữ câu điều kiện loại 1: Đưa 'Should' lên đầu câu thay cho 'If', động từ theo sau luôn ở dạng NGUYÊN THỂ KHÔNG TO (Should + S + V_inf). Chọn 'require'.",
        trapNote: "Bẫy kinh điển: Thí sinh tưởng 'Should' là trợ động từ câu hỏi hoặc chia theo ngôi mà chọn sai.",
        translation: "Nếu quý khách cần thêm bất kỳ sự hỗ trợ nào về lịch trình, xin vui lòng liên hệ bàn hỗ trợ của chúng tôi.",
        difficulty: "750+",
      },
      {
        id: "cs-q2",
        part: "Part 5",
        questionText: "If the client _______ the revised proposal by Friday, we will immediately initiate the development phase.",
        options: {
          A: "approves",
          B: "approved",
          C: "will approve",
          D: "approving",
        },
        correctAnswer: "A",
        explanation: "Câu điều kiện loại 1: Mệnh đề If chia ở thì Hiện Tại Đơn (approves), mệnh đề chính chia ở Tương Lai Đơn (will initiate). Chủ ngữ 'the client' số ít -> 'approves'.",
        trapNote: "Tuyệt đối không dùng 'will' trong mệnh đề If.",
        translation: "Nếu khách hàng phê duyệt đề xuất đã chỉnh sửa trước thứ Sáu, chúng tôi sẽ ngay lập tức khởi động giai đoạn phát triển.",
        difficulty: "500-750",
      },
    ],
    studiedCount: 2,
    correctCount: 1,
    wrongCount: 1,
    bookmarked: true,
  },
  {
    id: "g-relative-clauses",
    code: "RC-07",
    title: "Mệnh Đề Quan Hệ & Rút Gọn Mệnh Đề",
    englishTitle: "Relative Clauses & Reduced Participles",
    part: "Part 5 & 6",
    targetScore: "500-750",
    status: "PUBLISHED",
    summary: "Đại từ quan hệ (who, whom, which, whose, that) và kỹ thuật Rút gọn mệnh đề quan hệ dạng V-ing (chủ động) / V-ed (bị động).",
    formula: "N(người) + who + V | N(sở hữu) + whose + N | Rút gọn: N + V-ing (chủ động) / V-ed (bị động)",
    signalWords: ["who", "whom", "which", "whose", "those who", "the candidate who", "all items purchased"],
    traps: [
      "Bẫy whose: Nếu sau chỗ trống là một DANH TỪ không có mạo từ (a/an/the) thì gần như 100% chọn 'whose'.",
      "Bẫy rút gọn mệnh đề: Câu đã có động từ chính, động từ bổ nghĩa đứng sau danh từ phải rút gọn thành V-ing hoặc V-ed.",
    ],
    examples: [
      {
        sentence: "Job applicants who possess at least three years of project management experience will be prioritized.",
        translation: "Các ứng viên sở hữu ít nhất ba năm kinh nghiệm quản lý dự án sẽ được ưu tiên.",
        analysis: "Who làm chủ ngữ thay thế cho Job applicants.",
      },
      {
        sentence: "Please direct your inquiries to the department supervisor whose office is on the fourth floor.",
        translation: "Xin vui lòng gửi thắc mắc tới giám sát bộ phận, người có văn phòng ở tầng 4.",
        analysis: "Whose office: văn phòng của giám sát đó.",
      },
    ],
    questions: [
      {
        id: "rc-q1",
        part: "Part 5",
        questionText: "Job applicants _______ possess at least three years of project management experience will be prioritized.",
        options: {
          A: "who",
          B: "whom",
          C: "which",
          D: "whose",
        },
        correctAnswer: "A",
        explanation: "Đại từ quan hệ thay thế cho danh từ chỉ người 'Job applicants' và làm CHỦ NGỮ trước động từ 'possess' phải là 'who'.",
        trapNote: "Không dùng 'whom' vì sau 'whom' phải là mệnh đề S + V (tân ngữ).",
        translation: "Các ứng viên sở hữu ít nhất ba năm kinh nghiệm quản lý dự án sẽ được ưu tiên xem xét.",
        difficulty: "350-500",
      },
      {
        id: "rc-q2",
        part: "Part 5",
        questionText: "Please direct your inquiries to the department supervisor _______ office is on the fourth floor.",
        options: {
          A: "whose",
          B: "who",
          C: "which",
          D: "whom",
        },
        correctAnswer: "A",
        explanation: "Đại từ quan hệ chỉ sở hữu: N(người) + WHOSE + N(vật sở hữu). 'whose office' = văn phòng của người giám sát đó.",
        trapNote: "Nhận biết: 'office' đứng ngay sau khoảng trống không có mạo từ a/the -> chọn 'whose'.",
        translation: "Xin vui lòng gửi thắc mắc của bạn tới người giám sát bộ phận, người có văn phòng làm việc ở tầng bốn.",
        difficulty: "500-750",
      },
    ],
    studiedCount: 0,
    correctCount: 0,
    wrongCount: 0,
    bookmarked: false,
  },
  {
    id: "g-subject-verb-agreement",
    code: "SVA-08",
    title: "Hòa Hợp Chủ Ngữ & Động Từ",
    englishTitle: "Subject-Verb Agreement",
    part: "Part 5",
    targetScore: "500-750",
    status: "PUBLISHED",
    summary: "Quy tắc xác định danh từ chính để chia động từ số ít hoặc số nhiều. Cảnh giác với cụm giới từ xen giữa và các đại từ bất định.",
    formula: "The N1 + prep + N2 -> Động từ chia theo N1! | Either... or / Neither... nor -> Động từ chia theo S gần nhất!",
    signalWords: ["The delivery of raw materials IS...", "Each/Every + N số ít -> V số ít", "Neither... nor", "A variety of + Ns -> V số nhiều"],
    traps: [
      "Bẫy danh từ gần kề: Thí sinh thấy danh từ số nhiều đứng ngay trước chỗ trống (sau giới từ of/in) liền vội chia số nhiều.",
      "Phân biệt: 'The variety of + Ns' -> V số ít; còn 'A variety of + Ns' -> V số nhiều.",
    ],
    examples: [
      {
        sentence: "The delivery of raw materials to the manufacturing plants has been delayed due to customs inspections.",
        translation: "Việc giao nguyên liệu thô đến các nhà máy sản xuất đã bị trì hoãn do kiểm tra hải quan.",
        analysis: "Chủ ngữ chính là 'The delivery' (số ít) -> has been delayed.",
      },
    ],
    questions: [
      {
        id: "sva-q1",
        part: "Part 5",
        questionText: "The delivery of raw materials to the manufacturing plants _______ delayed due to customs inspections.",
        options: {
          A: "has been",
          B: "have been",
          C: "are",
          D: "were",
        },
        correctAnswer: "A",
        explanation: "Danh từ đứng trước giới từ 'of' là 'The delivery' (số ít), các thành phần sau chỉ là bổ ngữ. Do đó động từ chia số ít: 'has been'.",
        trapNote: "Bẫy danh từ gần kề: 'plants' hay 'materials' số nhiều nằm ngay trước chỗ trống để đánh lừa thị giác.",
        translation: "Việc giao nguyên liệu thô đến các nhà máy sản xuất đã bị trì hoãn do kiểm tra hải quan.",
        difficulty: "500-750",
      },
      {
        id: "sva-q2",
        part: "Part 5",
        questionText: "Neither the regional manager nor the sales representatives _______ aware of the sudden policy change.",
        options: {
          A: "were",
          B: "was",
          C: "is",
          D: "has been",
        },
        correctAnswer: "A",
        explanation: "Quy tắc 'Neither... nor...': Động từ chia theo CHỦ NGỮ GẦN NHẤT. Chủ ngữ gần nhất là 'the sales representatives' (số nhiều) -> dùng 'were'.",
        trapNote: "Nhiều người nhìn 'manager' ở vế trước rồi chọn 'was' là sai quy tắc gần nhất.",
        translation: "Cả người quản lý khu vực lẫn các đại diện bán hàng đều không hay biết về sự thay đổi chính sách đột ngột.",
        difficulty: "500-750",
      },
    ],
    studiedCount: 0,
    correctCount: 0,
    wrongCount: 0,
    bookmarked: false,
  },
  {
    id: "g-conjunctions-prepositions",
    code: "CP-09",
    title: "Phân Biệt Liên Từ & Giới Từ",
    englishTitle: "Conjunctions vs Prepositions",
    part: "Part 5",
    targetScore: "500-750",
    status: "PUBLISHED",
    summary: "Phân biệt liên từ (nối mệnh đề có S + V: Although, Because, While) và giới từ (nối cụm danh từ/V-ing: Despite, Because of, During).",
    formula: "Liên từ + S + V | Giới từ + Noun Phrase / V-ing",
    signalWords: ["Although vs Despite", "Because vs Due to / Because of", "While vs During", "By vs Until"],
    traps: [
      "Bẫy cấu trúc: Thấy danh từ dài có tính từ bổ nghĩa phía sau tưởng là mệnh đề, chọn Although thay vì Despite.",
      "Phân biệt 'by' (hoàn thành trước thời hạn deadline) và 'until' (hành động duy trì liên tục đến mốc giờ).",
    ],
    examples: [
      {
        sentence: "Despite torrential downpours, the corporate charity marathon was conducted on schedule.",
        translation: "Mặc dù mưa như trút nước, cuộc chạy marathon từ thiện của công ty vẫn diễn ra đúng tiến độ.",
        analysis: "Sau chỗ trống là cụm danh từ 'torrential downpours' -> dùng giới từ Despite.",
      },
    ],
    questions: [
      {
        id: "cp-q1",
        part: "Part 5",
        questionText: "_______ torrential downpours, the corporate charity marathon was conducted on schedule.",
        options: {
          A: "Despite",
          B: "Although",
          C: "Even though",
          D: "In spite",
        },
        correctAnswer: "A",
        explanation: "Sau chỗ trống là cụm danh từ 'torrential downpours'. Để chỉ sự tương phản đi với cụm danh từ, dùng giới từ 'Despite'.",
        trapNote: "'Although' và 'Even though' phải đi với mệnh đề (S + V). 'In spite' thiếu chữ 'of'.",
        translation: "Mặc dù trời mưa như trút nước, cuộc chạy marathon từ thiện của công ty vẫn được diễn ra đúng tiến độ.",
        difficulty: "500-750",
      },
      {
        id: "cp-q2",
        part: "Part 5",
        questionText: "The final revisions to the construction blueprint must be submitted _______ 5:00 PM on Friday.",
        options: {
          A: "by",
          B: "until",
          C: "during",
          D: "while",
        },
        correctAnswer: "A",
        explanation: "Giới từ 'by' diễn tả hành động hoàn tất muộn nhất vào một thời hạn cụ thể (trước 5h chiều). 'Until' dùng cho hành động kéo dài liên tục.",
        trapNote: "Nộp bài là hành động hoàn tất dứt điểm tại một thời điểm nên dùng 'by'.",
        translation: "Các bản sửa đổi cuối cùng cho bản vẽ xây dựng phải được nộp trước 5 giờ chiều thứ Sáu.",
        difficulty: "500-750",
      },
    ],
    studiedCount: 0,
    correctCount: 0,
    wrongCount: 0,
    bookmarked: true,
  },
  {
    id: "g-gerund-infinitive",
    code: "GI-10",
    title: "Danh Động Từ & Động Từ Nguyên Mẫu",
    englishTitle: "Gerunds (V-ing) & Infinitives (To-V)",
    part: "Part 5",
    targetScore: "500-750",
    status: "PUBLISHED",
    summary: "Quy tắc sử dụng V-ing hoặc To-V sau các động từ và cụm thành ngữ đặc thù trong văn phong công sở tiếng Anh.",
    formula: "Verb + V-ing: postpone, consider, avoid, finish | Verb + To-V: decide, plan, agree, hesitate",
    signalWords: ["look forward to + V-ing", "be committed to + V-ing", "consider + V-ing", "hesitate to + V", "aim to + V"],
    traps: [
      "Bẫy chữ 'to': Nhiều người thấy 'to' trong 'look forward to' hoặc 'be committed to' liền chia V nguyên mẫu, nhưng 'to' ở đây là giới từ nên bắt buộc theo sau là V-ing!",
    ],
    examples: [
      {
        sentence: "The management committee is considering implementing a new flexible hybrid work schedule.",
        translation: "Ủy ban quản lý đang cân nhắc áp dụng một lịch làm việc kết hợp linh hoạt mới.",
        analysis: "Consider + V-ing -> implementing.",
      },
    ],
    questions: [
      {
        id: "gi-q1",
        part: "Part 5",
        questionText: "The management committee is considering _______ a new flexible hybrid work schedule starting next month.",
        options: {
          A: "implementing",
          B: "to implement",
          C: "implement",
          D: "implemented",
        },
        correctAnswer: "A",
        explanation: "Động từ 'consider' theo sau bắt buộc là Danh động từ V-ing (consider doing something: cân nhắc làm gì). Chọn 'implementing'.",
        trapNote: "Nhiều người nghĩ 'cân nhắc để làm' nên chọn 'to implement', nhưng theo quy tắc chuẩn là consider + V-ing.",
        translation: "Ủy ban quản lý đang cân nhắc áp dụng lịch trình làm việc kết hợp linh hoạt mới từ tháng sau.",
        difficulty: "500-750",
      },
      {
        id: "gi-q2",
        part: "Part 5",
        questionText: "The logistics provider agreed _______ full compensation for all merchandise damaged during transit.",
        options: {
          A: "to provide",
          B: "providing",
          C: "provide",
          D: "provision",
        },
        correctAnswer: "A",
        explanation: "Cấu trúc 'agree to do something' (đồng ý làm gì) đòi hỏi động từ nguyên mẫu có 'to' -> 'to provide'.",
        trapNote: "'Agree' đi với 'to V', không đi với V-ing.",
        translation: "Nhà cung cấp dịch vụ hậu cần đã đồng ý bồi thường toàn bộ cho số hàng hóa bị hư hỏng trong quá trình vận chuyển.",
        difficulty: "500-750",
      },
    ],
    studiedCount: 0,
    correctCount: 0,
    wrongCount: 0,
    bookmarked: false,
  },
  {
    id: "g-comparatives",
    code: "CMP-11",
    title: "So Sánh Tính Từ & Trạng Từ",
    englishTitle: "Comparatives & Superlatives",
    part: "Part 5",
    targetScore: "500-750",
    status: "PUBLISHED",
    summary: "Cấu trúc so sánh hơn, so sánh nhất và các trạng từ nhấn mạnh mức độ so sánh cực hay thi trong TOEIC (much, significantly, far).",
    formula: "Adj-er / More + Adj + THAN | THE + Adj-est / Most + Adj | Trạng từ nhấn mạnh: significantly/much + more...",
    signalWords: ["than", "the most", "significantly more", "much better", "as... as", "one of the most"],
    traps: [
      "Bẫy trạng từ bổ nghĩa so sánh hơn: Chỉ có các từ như 'much, far, significantly, considerably' mới được đứng trước so sánh hơn, KHÔNG dùng 'very' trước so sánh hơn.",
    ],
    examples: [
      {
        sentence: "This new inventory software is significantly more efficient than the previous version.",
        translation: "Phần mềm kiểm kho mới này hiệu quả hơn đáng kể so với phiên bản trước.",
        analysis: "Significantly bổ nghĩa cho so sánh hơn 'more efficient'.",
      },
    ],
    questions: [
      {
        id: "cmp-q1",
        part: "Part 5",
        questionText: "This new inventory software is _______ more efficient than the previous enterprise version.",
        options: {
          A: "significantly",
          B: "very",
          C: "too",
          D: "extreme",
        },
        correctAnswer: "A",
        explanation: "Để bổ nghĩa và nhấn mạnh cho cấp so sánh hơn ('more efficient than'), ta dùng các trạng từ như 'significantly', 'much', 'far', 'substantially'. Không dùng 'very' trước so sánh hơn.",
        trapNote: "Bẫy từ 'very' rất phổ biến ở thí sinh mức 500.",
        translation: "Phần mềm kiểm kê mới này hiệu quả hơn đáng kể so với phiên bản doanh nghiệp trước đó.",
        difficulty: "500-750",
      },
    ],
    studiedCount: 0,
    correctCount: 0,
    wrongCount: 0,
    bookmarked: false,
  },
  {
    id: "g-modal-subjunctive",
    code: "MV-12",
    title: "Động Từ Khuyết Thiếu & Thể Giả Định",
    englishTitle: "Modal Verbs & Subjunctive Mood",
    part: "Part 5",
    targetScore: "750+",
    status: "PUBLISHED",
    summary: "Cấu trúc câu giả định với các động từ yêu cầu, đề xuất (require, recommend, suggest, insist) thì mệnh đề 'that' luôn dùng V nguyên mẫu không 'to'.",
    formula: "S + recommend/request/require + THAT + S + (should) + V_inf",
    signalWords: ["recommend that", "require that", "it is imperative that", "it is essential that", "must", "should"],
    traps: [
      "Bẫy giả định: Cho dù chủ ngữ sau THAT là ngôi thứ ba số ít (he/she/it/the manager), động từ theo sau VẪN Ở DẠNG NGUYÊN THỂ (vì đã ẩn từ 'should').",
    ],
    examples: [
      {
        sentence: "The auditor recommended that the director submit the expenditure records by Friday.",
        translation: "Kiểm toán viên đã khuyến nghị giám đốc nộp các bản ghi chi tiêu trước thứ Sáu.",
        analysis: "Subjunctive mood: submit ở dạng nguyên thể dù chủ ngữ 'the director' số ít.",
      },
    ],
    questions: [
      {
        id: "mv-q1",
        part: "Part 5",
        questionText: "The external auditor recommended that the finance director _______ the revised balance sheet immediately.",
        options: {
          A: "submit",
          B: "submits",
          C: "submitted",
          D: "submitting",
        },
        correctAnswer: "A",
        explanation: "Cấu trúc giả định thức: Sau động từ 'recommended that + S', động từ theo sau luôn ở dạng NGUYÊN MẪU KHÔNG CHIA (submit), bất kể thì của câu hay chủ ngữ số ít 'the finance director'.",
        trapNote: "Bẫy siêu khó Part 5: Thí sinh thấy 'the finance director' số ít nên chọn 'submits' (B) hoặc thấy 'recommended' quá khứ nên chọn 'submitted' (C). Cả hai đều sai!",
        translation: "Kiểm toán viên độc lập đã khuyến nghị giám đốc tài chính nộp bảng cân đối kế toán sửa đổi ngay lập tức.",
        difficulty: "750+",
      },
    ],
    studiedCount: 0,
    correctCount: 0,
    wrongCount: 0,
    bookmarked: true,
  },
];

export default function AdminGrammarPage() {
  const [topics, setTopics] = useState<GrammarTopicItem[]>(INITIAL_GRAMMAR_TOPICS);
  const [activeMainTab, setActiveMainTab] = useState<"topics" | "progress" | "starred" | "rules">("topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPart, setFilterPart] = useState<string>("ALL");
  const [filterScore, setFilterScore] = useState<string>("ALL");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  // Modals state
  const [theoryTopic, setTheoryTopic] = useState<GrammarTopicItem | null>(null);
  const [theoryActiveTab, setTheoryActiveTab] = useState<"formula" | "signals" | "traps" | "examples">("formula");

  // Practice Quiz Modal state
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [quizQuestions, setQuizQuestions] = useState<GrammarQuestionItem[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [activeTopicForQuiz, setActiveTopicForQuiz] = useState<GrammarTopicItem | null>(null);

  // Quick Create Topic Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createTitle, setCreateTitle] = useState<string>("");
  const [createEngTitle, setCreateEngTitle] = useState<string>("");
  const [createCode, setCreateCode] = useState<string>("");
  const [createPart, setCreatePart] = useState<"Part 5" | "Part 6" | "Part 5 & 6">("Part 5");
  const [createScore, setCreateScore] = useState<"350-500" | "500-750" | "750+">("500-750");
  const [createFormula, setCreateFormula] = useState<string>("");
  const [createSummary, setCreateSummary] = useState<string>("");
  const [createSignals, setCreateSignals] = useState<string>("");
  const [createTraps, setCreateTraps] = useState<string>("");
  const [createExampleSentence, setCreateExampleSentence] = useState<string>("");
  const [createExampleTranslation, setCreateExampleTranslation] = useState<string>("");

  // Add Question Modal
  const [addQuestionTopic, setAddQuestionTopic] = useState<GrammarTopicItem | null>(null);
  const [qText, setQText] = useState("");
  const [qPart, setQPart] = useState("Part 5");
  const [qOptA, setQOptA] = useState("");
  const [qOptB, setQOptB] = useState("");
  const [qOptC, setQOptC] = useState("");
  const [qOptD, setQOptD] = useState("");
  const [qCorrect, setQCorrect] = useState<"A" | "B" | "C" | "D">("A");
  const [qExplanation, setQExplanation] = useState("");
  const [qTrap, setQTrap] = useState("");
  const [qTranslation, setQTranslation] = useState("");
  const [qDifficulty, setQDifficulty] = useState("500-750");

  // Edit Topic Modal
  const [editTopicItem, setEditTopicItem] = useState<GrammarTopicItem | null>(null);

  // Delete Confirm Modal
  const [deleteConfirmTopic, setDeleteConfirmTopic] = useState<GrammarTopicItem | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Timer effect for Quiz
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizActive && !quizFinished && isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizActive, quizFinished, isTimerRunning]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  // Filter Logic
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.englishTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPart =
        filterPart === "ALL" ||
        (filterPart === "Part 5" && (t.part === "Part 5" || t.part === "Part 5 & 6")) ||
        (filterPart === "Part 6" && (t.part === "Part 6" || t.part === "Part 5 & 6"));

      const matchScore = filterScore === "ALL" || t.targetScore === filterScore;

      const matchTab =
        activeMainTab === "topics"
          ? true
          : activeMainTab === "starred"
          ? t.bookmarked
          : activeMainTab === "progress"
          ? t.studiedCount > 0
          : true;

      return matchSearch && matchPart && matchScore && matchTab;
    });
  }, [topics, searchQuery, filterPart, filterScore, activeMainTab]);

  // Statistics
  const totalTopicsCount = topics.length;
  const studiedTopicsCount = topics.filter((t) => t.studiedCount > 0).length;
  const starredTopicsCount = topics.filter((t) => t.bookmarked).length;

  // Toggle Bookmark
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextVal = !t.bookmarked;
          showToast(nextVal ? `Đã ghim "${t.title}" vào danh sách yêu thích! ⭐` : `Đã bỏ ghim "${t.title}"`);
          return { ...t, bookmarked: nextVal };
        }
        return t;
      })
    );
  };

  // Launch Quiz for single topic
  const startTopicQuiz = (topic: GrammarTopicItem) => {
    if (topic.questions.length === 0) {
      showToast(`Chủ điểm "${topic.title}" hiện chưa có câu hỏi luyện tập!`);
      return;
    }
    setActiveTopicForQuiz(topic);
    setQuizTitle(`Luyện Tập: ${topic.title} (${topic.code})`);
    setQuizQuestions(topic.questions);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setQuizScore(0);
    setQuizFinished(false);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setQuizActive(true);
  };

  // Launch Random Master Quiz
  const startMasterQuiz = () => {
    const allQuestions: GrammarQuestionItem[] = [];
    topics.forEach((t) => {
      allQuestions.push(...t.questions);
    });

    if (allQuestions.length === 0) {
      showToast("Chưa có câu hỏi nào trong hệ thống!");
      return;
    }

    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
    setActiveTopicForQuiz(null);
    setQuizTitle("Luyện Tập Tổng Hợp Toàn Bộ Ngữ Pháp TOEIC (10 câu ngẫu nhiên)");
    setQuizQuestions(shuffled);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setQuizScore(0);
    setQuizFinished(false);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setQuizActive(true);
  };

  // Launch Quiz from Selected Topics
  const startSelectedTopicsQuiz = () => {
    const selectedQuestions: GrammarQuestionItem[] = [];
    topics
      .filter((t) => selectedTopicIds.includes(t.id))
      .forEach((t) => {
        selectedQuestions.push(...t.questions);
      });

    if (selectedQuestions.length === 0) {
      showToast("Các chủ điểm được chọn chưa có câu hỏi nào!");
      return;
    }

    const shuffled = [...selectedQuestions].sort(() => 0.5 - Math.random());
    setActiveTopicForQuiz(null);
    setQuizTitle(`Ôn Tập ${selectedTopicIds.length} Chủ Điểm Đã Chọn (${shuffled.length} câu)`);
    setQuizQuestions(shuffled);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setQuizScore(0);
    setQuizFinished(false);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setQuizActive(true);
  };

  // Submit Answer in Quiz
  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    const currentQ = quizQuestions[currentQuizIndex];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    setIsAnswerChecked(true);

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }

    if (activeTopicForQuiz) {
      setTopics((prev) =>
        prev.map((t) => {
          if (t.id === activeTopicForQuiz.id) {
            return {
              ...t,
              studiedCount: t.studiedCount + 1,
              correctCount: isCorrect ? t.correctCount + 1 : t.correctCount,
              wrongCount: isCorrect ? t.wrongCount : t.wrongCount + 1,
            };
          }
          return t;
        })
      );
    }
  };

  // Next Question in Quiz
  const handleNextQuizQuestion = () => {
    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setQuizFinished(true);
      setIsTimerRunning(false);
    }
  };

  // Checkbox multi-select
  const handleToggleSelectTopic = (id: string) => {
    setSelectedTopicIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSelectAllTopics = () => {
    if (selectedTopicIds.length === filteredTopics.length) {
      setSelectedTopicIds([]);
    } else {
      setSelectedTopicIds(filteredTopics.map((t) => t.id));
    }
  };

  // Bulk Star
  const handleBulkStar = () => {
    setTopics((prev) =>
      prev.map((t) => {
        if (selectedTopicIds.includes(t.id)) {
          return { ...t, bookmarked: true };
        }
        return t;
      })
    );
    showToast(`Đã ghim yêu thích cho ${selectedTopicIds.length} chủ điểm! ⭐`);
    setSelectedTopicIds([]);
  };

  // Bulk Reset
  const handleBulkResetProgress = () => {
    setTopics((prev) =>
      prev.map((t) => {
        if (selectedTopicIds.includes(t.id)) {
          return { ...t, studiedCount: 0, correctCount: 0, wrongCount: 0 };
        }
        return t;
      })
    );
    showToast(`Đã đặt lại tiến độ học cho ${selectedTopicIds.length} chủ điểm! 🔄`);
    setSelectedTopicIds([]);
  };

  // Add Question Submit
  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addQuestionTopic) return;
    if (!qText.trim() || !qOptA.trim() || !qOptB.trim() || !qOptC.trim() || !qOptD.trim()) {
      alert("Vui lòng điền câu hỏi và đủ 4 đáp án A, B, C, D!");
      return;
    }

    const newQ: GrammarQuestionItem = {
      id: `custom-q-${Date.now()}`,
      part: qPart,
      questionText: qText.trim(),
      options: {
        A: qOptA.trim(),
        B: qOptB.trim(),
        C: qOptC.trim(),
        D: qOptD.trim(),
      },
      correctAnswer: qCorrect,
      explanation: qExplanation.trim() || "Đáp án chính xác theo quy tắc ngữ pháp TOEIC.",
      trapNote: qTrap.trim() || undefined,
      translation: qTranslation.trim() || undefined,
      difficulty: qDifficulty,
    };

    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === addQuestionTopic.id) {
          return {
            ...t,
            questions: [newQ, ...t.questions],
          };
        }
        return t;
      })
    );

    showToast(`Đã thêm 1 câu hỏi mới vào chủ điểm "${addQuestionTopic.title}"! 🎉`);
    setAddQuestionTopic(null);
    setQText("");
    setQOptA("");
    setQOptB("");
    setQOptC("");
    setQOptD("");
    setQExplanation("");
    setQTrap("");
    setQTranslation("");
  };

  // Create Topic Submit
  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) {
      alert("Vui lòng nhập tên chủ điểm ngữ pháp!");
      return;
    }

    const newCodeFormatted =
      createCode.trim().toUpperCase() ||
      `TOEIC-${Math.floor(100 + Math.random() * 900)}`;

    const newTopic: GrammarTopicItem = {
      id: `custom-topic-${Date.now()}`,
      code: newCodeFormatted,
      title: createTitle.trim(),
      englishTitle: createEngTitle.trim() || createTitle.trim(),
      part: createPart,
      targetScore: createScore,
      status: "PUBLISHED",
      summary: createSummary.trim() || "Chủ điểm ngữ pháp trọng điểm TOEIC.",
      formula: createFormula.trim() || "S + V + O",
      signalWords: createSignals ? createSignals.split(",").map((s) => s.trim()) : ["Key Words"],
      traps: createTraps ? createTraps.split("\n").filter((tr) => tr.trim().length > 0) : ["Lưu ý ngữ cảnh và cấu trúc câu."],
      examples: [
        {
          sentence: createExampleSentence.trim() || "Employees must comply with company guidelines.",
          translation: createExampleTranslation.trim() || "Nhân viên phải tuân theo hướng dẫn của công ty.",
        },
      ],
      questions: [],
      studiedCount: 0,
      correctCount: 0,
      wrongCount: 0,
      bookmarked: false,
    };

    setTopics([newTopic, ...topics]);
    showToast(`Đã tạo thành công chủ điểm "${newTopic.title}"! 🚀`);
    setShowCreateModal(false);
    setCreateTitle("");
    setCreateEngTitle("");
    setCreateCode("");
    setCreateFormula("");
    setCreateSummary("");
    setCreateSignals("");
    setCreateTraps("");
    setCreateExampleSentence("");
    setCreateExampleTranslation("");
  };

  // Edit Topic Submit
  const handleSaveEditTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTopicItem) return;

    setTopics((prev) =>
      prev.map((t) => (t.id === editTopicItem.id ? editTopicItem : t))
    );
    showToast(`Đã cập nhật chủ điểm "${editTopicItem.title}"! 💾`);
    setEditTopicItem(null);
  };

  // Delete Topic Confirm
  const handleConfirmDelete = () => {
    if (!deleteConfirmTopic) return;
    setTopics((prev) => prev.filter((t) => t.id !== deleteConfirmTopic.id));
    showToast(`Đã xóa chủ điểm "${deleteConfirmTopic.title}"! 🗑️`);
    setDeleteConfirmTopic(null);
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

      {/* KHỐI 1: HEADER BANNER CHINH PHỤC NGỮ PHÁP TOEIC (THEO ĐÚNG HÌNH 1) */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Chuyên đề ngữ pháp TOEIC trọng điểm
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Chinh phục <span className="text-blue-600">Ngữ pháp TOEIC</span>
          </h1>
          <p className="text-sm font-medium text-slate-600 max-w-2xl leading-relaxed">
            Hệ thống hóa các chủ điểm ngữ pháp trọng điểm TOEIC Part 5 & 6: nắm chắc công thức cốt lõi, nhận diện bẫy đề thi và tối ưu tốc độ làm bài.
          </p>
        </div>

        {/* Icon Sách Xanh lớn góc phải (chuẩn 100% như hình 1) */}
        <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* KHỐI 2: THANH TAB CHUYỂN CHẾ ĐỘ CHÍNH & NÚT THAO TÁC */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/60 rounded-full w-fit">
          <button
            type="button"
            onClick={() => setActiveMainTab("topics")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              activeMainTab === "topics"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <Book className="w-4 h-4" />
            Tất cả chủ điểm ({totalTopicsCount})
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
            <BarChart3 className="w-4 h-4" />
            Đã ôn luyện ({studiedTopicsCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("starred")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              activeMainTab === "starred"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
            Yêu thích ({starredTopicsCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("rules")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              activeMainTab === "rules"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Bí kíp tránh bẫy
          </button>
        </div>

        {/* Nút Thao Tác Chức Năng */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm chủ điểm
          </button>
          <button
            onClick={startMasterQuiz}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            Luyện tập tổng hợp (10 câu)
          </button>
        </div>
      </div>


      {/* KHỐI 4: BẢNG LỌC & TÌM KIẾM THEO PHONG CÁCH TỪ VỰNG */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo chủ điểm, công thức, từ khóa (hoàn thành, bị động, whose, unless...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Lọc Part */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold uppercase shrink-0">Part:</span>
            <select
              value={filterPart}
              onChange={(e) => setFilterPart(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả Part</option>
              <option value="Part 5">Part 5 (Câu đơn)</option>
              <option value="Part 6">Part 6 (Điền đoạn)</option>
            </select>
          </div>

          {/* Lọc Target Điểm */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold uppercase shrink-0">Mục tiêu:</span>
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả mức điểm</option>
              <option value="350-500">350 - 500 (Cơ bản)</option>
              <option value="500-750">500 - 750 (Trung cấp)</option>
              <option value="750+">750+ (Nâng cao)</option>
            </select>
          </div>
        </div>

        {/* Thanh Bulk Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAllTopics}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {selectedTopicIds.length === filteredTopics.length && filteredTopics.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span className="font-semibold">
                {selectedTopicIds.length === filteredTopics.length && filteredTopics.length > 0
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả hiển thị"}
              </span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">
              Đã chọn: <strong className="text-blue-600 font-bold">{selectedTopicIds.length}</strong> chủ điểm
            </span>
          </div>

          {selectedTopicIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={startSelectedTopicsQuiz}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-xs"
              >
                <Play className="w-3 h-3 fill-white" />
                Luyện tập đã chọn
              </button>
              <button
                onClick={handleBulkStar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold cursor-pointer border border-amber-200"
              >
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                Ghim yêu thích
              </button>
              <button
                onClick={handleBulkResetProgress}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Đặt lại tiến độ
              </button>
              <button
                onClick={() => setSelectedTopicIds([])}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- NỘI DUNG CHÍNH (THEO TAB) --- */}
      {activeMainTab === "rules" ? (
        /* BÍ KÍP TRÁNH BẪY NGỮ PHÁP ETS */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Bí Kíp Tránh Bẫy
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              3 Quy Tắc Vàng Khi Làm Ngữ Pháp TOEIC Part 5 & 6
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                1
              </span>
              <h3 className="font-bold text-sm text-slate-900">Xác định Vị Ngữ & Chủ Ngữ chính</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Luôn gạch chân động từ chính trong câu. Đừng để các cụm giới từ xen giữa (như <em>of, in, at</em>) đánh lừa số ít/số nhiều.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2.5">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                2
              </span>
              <h3 className="font-bold text-sm text-slate-900">Phân biệt Liên từ và Giới từ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sau liên từ (<em>Although, Because, While</em>) là mệnh đề S + V. Sau giới từ (<em>Despite, Because of, During</em>) là Cụm danh từ / V-ing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                3
              </span>
              <h3 className="font-bold text-sm text-slate-900">Nhận diện Đảo ngữ & Giả định</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thấy <em>Should</em> đứng đầu câu không có dấu hỏi là câu điều kiện đảo ngữ (V nguyên thể). Thấy <em>recommend that</em> thì động từ giữ nguyên mẫu!
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* DANH SÁCH THẺ CHỦ ĐIỂM (GRID CARDS PHONG CÁCH TỪ VỰNG) */
        <div className="space-y-6 animate-in fade-in duration-150">
          {filteredTopics.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200/90 rounded-3xl p-8 space-y-4 shadow-xs">
              <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Không tìm thấy chủ điểm ngữ pháp phù hợp</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                Vui lòng thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại các bộ lọc Part và mức điểm.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterPart("ALL");
                  setFilterScore("ALL");
                  setActiveMainTab("topics");
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTopics.map((topic) => {
                const isSelected = selectedTopicIds.includes(topic.id);
                const accuracy =
                  topic.studiedCount > 0 ? Math.round((topic.correctCount / topic.studiedCount) * 100) : 0;

                return (
                  <div
                    key={topic.id}
                    className={`group rounded-2xl border bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-slate-200/90 hover:border-blue-400"
                    }`}
                  >
                    {/* Header Thẻ */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleSelectTopic(topic.id)}
                            className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-600 font-mono">
                            {topic.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              topic.targetScore === "750+"
                                ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                                : topic.targetScore === "500-750"
                                ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            }`}
                          >
                            Target {topic.targetScore}
                          </span>
                        </div>

                        <button
                          onClick={(e) => toggleBookmark(topic.id, e)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            topic.bookmarked
                              ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                              : "text-slate-400 hover:text-amber-500 hover:bg-slate-100"
                          }`}
                          title={topic.bookmarked ? "Bỏ ghim" : "Ghim yêu thích"}
                        >
                          <Star className={`w-4 h-4 ${topic.bookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1">
                          {topic.title}
                        </h3>
                        <p className="text-xs font-medium text-slate-500">{topic.englishTitle}</p>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {topic.summary}
                      </p>

                      {/* KHỐI CÔNG THỨC TRỌNG TÂM */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span className="flex items-center gap-1 text-blue-600">
                            <Lightbulb className="w-3.5 h-3.5" />
                            Công thức:
                          </span>
                          <span>{topic.part}</span>
                        </div>
                        <code className="block text-xs font-mono font-semibold text-blue-800 bg-white px-2 py-1 rounded border border-slate-200/80 break-all">
                          {topic.formula}
                        </code>
                      </div>

                      {/* TIẾN ĐỘ HỌC */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                          <span>Tiến độ luyện tập:</span>
                          <span className="font-bold text-slate-700">
                            {topic.studiedCount > 0 ? (
                              <>
                                Đúng {topic.correctCount}/{topic.studiedCount} câu ({accuracy}%)
                              </>
                            ) : (
                              "Chưa ôn"
                            )}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                            style={{
                              width: `${
                                topic.questions.length > 0
                                  ? Math.min(100, Math.round((topic.studiedCount / topic.questions.length) * 100))
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Thẻ: Các nút thao tác như Xem từ / Học / Chơi */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 flex-1">
                        {/* Nút Lý Thuyết */}
                        <button
                          type="button"
                          onClick={() => {
                            setTheoryTopic(topic);
                            setTheoryActiveTab("formula");
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Xem lý thuyết, công thức & bẫy thi"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                          Lý thuyết
                        </button>

                        {/* Nút Luyện Tập */}
                        <button
                          type="button"
                          onClick={() => startTopicQuiz(topic)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                          title="Luyện tập trắc nghiệm Part 5 & 6"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          Luyện tập ({topic.questions.length})
                        </button>
                      </div>

                      {/* Các nút icon nhỏ: Thêm câu hỏi | Sửa | Xóa */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setAddQuestionTopic(topic);
                            setQPart(topic.part.includes("6") ? "Part 6" : "Part 5");
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Thêm câu hỏi mới"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditTopicItem(topic)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Chỉnh sửa chủ điểm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmTopic(topic)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Xóa chủ điểm"
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
        </div>
      )}

      {/* ================= MODAL 1: LÝ THUYẾT CHI TIẾT (THEORY MODAL) ================= */}
      {theoryTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[88vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setTheoryTopic(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">
                  {theoryTopic.code}
                </span>
                <span className="text-xs font-bold text-slate-500">• {theoryTopic.part}</span>
                <span className="text-xs font-bold text-emerald-600">• Target {theoryTopic.targetScore}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {theoryTopic.title} ({theoryTopic.englishTitle})
              </h3>
            </div>

            {/* Tabs bên trong modal */}
            <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setTheoryActiveTab("formula")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  theoryActiveTab === "formula"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Công thức & Định nghĩa
              </button>
              <button
                type="button"
                onClick={() => setTheoryActiveTab("signals")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  theoryActiveTab === "signals"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Dấu hiệu nhận biết
              </button>
              <button
                type="button"
                onClick={() => setTheoryActiveTab("traps")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  theoryActiveTab === "traps"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Bẫy TOEIC thường gặp
              </button>
              <button
                type="button"
                onClick={() => setTheoryActiveTab("examples")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  theoryActiveTab === "examples"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Ví dụ thực tế
              </button>
            </div>

            {/* Nội dung Tab */}
            <div className="space-y-4 text-xs text-slate-700">
              {theoryActiveTab === "formula" && (
                <div className="space-y-3.5">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-500 uppercase text-[11px]">Tóm tắt nguyên lý</p>
                    <p className="text-slate-800 leading-relaxed text-sm font-medium">{theoryTopic.summary}</p>
                  </div>

                  <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 space-y-1.5">
                    <p className="font-bold text-blue-800 uppercase text-[11px] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Công thức chuẩn
                    </p>
                    <div className="bg-white p-3 rounded-xl border border-blue-200 font-mono text-blue-800 font-bold text-sm">
                      {theoryTopic.formula}
                    </div>
                  </div>
                </div>
              )}

              {theoryActiveTab === "signals" && (
                <div className="space-y-3">
                  <p className="font-bold text-slate-700 text-xs">Dấu hiệu nhận biết nhanh trong bài thi:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {theoryTopic.signalWords.map((word, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 font-mono text-xs text-blue-700 font-semibold"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{word}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {theoryActiveTab === "traps" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Lưu ý các phương án bẫy ETS thường cài cắm vào Part 5 & 6:</span>
                  </div>
                  <div className="space-y-2.5">
                    {theoryTopic.traps.map((trap, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                      >
                        <span className="font-bold text-rose-600 flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5" />
                          Bẫy #{idx + 1}:
                        </span>
                        <p className="text-slate-700 leading-relaxed pl-5 font-medium">{trap}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {theoryActiveTab === "examples" && (
                <div className="space-y-3">
                  <p className="font-bold text-slate-700 text-xs">Câu mẫu trích xuất từ đề thi TOEIC:</p>
                  <div className="space-y-2.5">
                    {theoryTopic.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                      >
                        <p className="font-bold text-slate-900 text-sm">&quot;{ex.sentence}&quot;</p>
                        <p className="text-xs text-slate-600 italic">➔ Dịch: {ex.translation}</p>
                        {ex.analysis && (
                          <div className="pt-1.5 border-t border-slate-200 text-xs text-emerald-700 font-medium">
                            <strong>Phân tích:</strong> {ex.analysis}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTheoryTopic(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = theoryTopic;
                  setTheoryTopic(null);
                  startTopicQuiz(target);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Luyện tập chủ điểm này ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: LUYỆN TẬP TRẮC NGHIỆM (PRACTICE QUIZ MODAL) ================= */}
      {quizActive && quizQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {/* Header Quiz */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <SpellCheck className="w-4 h-4" />
                  {quizTitle}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Câu hỏi {currentQuizIndex + 1} / {quizQuestions.length}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-mono font-bold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{formatTimer(timerSeconds)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuizActive(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thanh tiến độ */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                style={{
                  width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`,
                }}
              />
            </div>

            {/* Thân câu hỏi */}
            {!quizFinished ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {quizQuestions[currentQuizIndex]?.part}
                    </span>
                    {quizQuestions[currentQuizIndex]?.difficulty && (
                      <span className="text-[11px] font-bold text-slate-500">
                        Target: {quizQuestions[currentQuizIndex].difficulty}
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                    {quizQuestions[currentQuizIndex].questionText}
                  </p>
                </div>

                {/* 4 Phương án A, B, C, D */}
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {(["A", "B", "C", "D"] as const).map((optKey) => {
                    const optText = quizQuestions[currentQuizIndex].options[optKey];
                    const isChosen = selectedAnswer === optKey;
                    const isCorrectAnswer =
                      isAnswerChecked && optKey === quizQuestions[currentQuizIndex].correctAnswer;
                    const isWrongChosen =
                      isAnswerChecked &&
                      isChosen &&
                      optKey !== quizQuestions[currentQuizIndex].correctAnswer;

                    return (
                      <button
                        key={optKey}
                        type="button"
                        disabled={isAnswerChecked}
                        onClick={() => setSelectedAnswer(optKey)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                          isCorrectAnswer
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                            : isWrongChosen
                            ? "bg-rose-50 border-rose-500 text-rose-900"
                            : isChosen
                            ? "bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20"
                            : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrectAnswer
                                ? "bg-emerald-600 text-white"
                                : isWrongChosen
                                ? "bg-rose-600 text-white"
                                : isChosen
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {optKey}
                          </span>
                          <span className="leading-snug">{optText}</span>
                        </div>

                        {isCorrectAnswer && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {isWrongChosen && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Giải thích chi tiết khi đã bấm kiểm tra */}
                {isAnswerChecked && (
                  <div className="space-y-3 pt-2">
                    <div
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                        selectedAnswer === quizQuestions[currentQuizIndex].correctAnswer
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : "bg-rose-50 border-rose-200 text-rose-900"
                      }`}
                    >
                      <div className="font-bold flex items-center gap-2">
                        {selectedAnswer === quizQuestions[currentQuizIndex].correctAnswer ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>Chính xác! Đáp án đúng là {quizQuestions[currentQuizIndex].correctAnswer}</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-rose-600" />
                            <span>
                              Chưa chính xác! Đáp án đúng là{" "}
                              <strong>{quizQuestions[currentQuizIndex].correctAnswer}</strong>
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        <strong>Giải thích:</strong> {quizQuestions[currentQuizIndex].explanation}
                      </p>
                    </div>

                    {quizQuestions[currentQuizIndex].trapNote && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-amber-800 mb-0.5">Lưu ý bẫy đề thi TOEIC:</strong>
                          <p className="text-slate-700 leading-relaxed">
                            {quizQuestions[currentQuizIndex].trapNote}
                          </p>
                        </div>
                      </div>
                    )}

                    {quizQuestions[currentQuizIndex].translation && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 italic">
                        <strong>Dịch nghĩa:</strong> &quot;{quizQuestions[currentQuizIndex].translation}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* MÀN HÌNH TỔNG KẾT KẾT QUẢ QUIZ */
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                  <Award className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-slate-900">Hoàn Thành Bài Luyện Tập!</h2>
                  <p className="text-xs text-slate-500">
                    Thời gian hoàn thành: <strong className="text-blue-600">{formatTimer(timerSeconds)}</strong>
                  </p>
                </div>

                <div className="inline-flex items-center gap-6 px-8 py-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Số câu đúng</p>
                    <p className="text-2xl font-extrabold text-emerald-600">
                      {quizScore} / {quizQuestions.length}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Tỷ lệ chính xác</p>
                    <p className="text-2xl font-extrabold text-blue-600">
                      {Math.round((quizScore / quizQuestions.length) * 100)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQuizIndex(0);
                      setSelectedAnswer(null);
                      setIsAnswerChecked(false);
                      setQuizScore(0);
                      setQuizFinished(false);
                      setTimerSeconds(0);
                      setIsTimerRunning(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Làm lại bài
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuizActive(false)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {/* Chân trang Quiz */}
            {!quizFinished && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  {selectedAnswer ? `Đã chọn đáp án ${selectedAnswer}` : "Vui lòng chọn 1 phương án"}
                </span>

                <div className="flex items-center gap-2.5">
                  {!isAnswerChecked ? (
                    <button
                      type="button"
                      disabled={!selectedAnswer}
                      onClick={handleCheckAnswer}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Kiểm tra đáp án
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextQuizQuestion}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>
                        {currentQuizIndex + 1 < quizQuestions.length ? "Câu tiếp theo" : "Xem kết quả"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 3: TẠO CHỦ ĐIỂM MỚI (CREATE MODAL) ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Thêm Chủ Điểm Ngữ Pháp Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tên chủ điểm (Tiếng Việt) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: Rút gọn mệnh đề quan hệ"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tên Tiếng Anh</label>
                  <input
                    type="text"
                    placeholder="ví dụ: Reduced Relative Clauses"
                    value={createEngTitle}
                    onChange={(e) => setCreateEngTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mã chủ điểm</label>
                  <input
                    type="text"
                    placeholder="RRC-13"
                    value={createCode}
                    onChange={(e) => setCreateCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 uppercase font-mono focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phần thi (Part)</label>
                  <select
                    value={createPart}
                    onChange={(e) => setCreatePart(e.target.value as GrammarTopicItem["part"])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="Part 5">Part 5</option>
                    <option value="Part 6">Part 6</option>
                    <option value="Part 5 & 6">Part 5 & 6</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Điểm</label>
                  <select
                    value={createScore}
                    onChange={(e) => setCreateScore(e.target.value as GrammarTopicItem["targetScore"])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="350-500">350 - 500 (Cơ bản)</option>
                    <option value="500-750">500 - 750 (Trung cấp)</option>
                    <option value="750+">750+ (Nâng cao)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Công thức cốt lõi *</label>
                <input
                  type="text"
                  required
                  placeholder="N + V-ing (chủ động) / N + V-ed (bị động)"
                  value={createFormula}
                  onChange={(e) => setCreateFormula(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-blue-700 font-semibold focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tóm tắt lý thuyết</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả nguyên lý và cách áp dụng..."
                  value={createSummary}
                  onChange={(e) => setCreateSummary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Dấu hiệu nhận biết (cách nhau bởi dấu phẩy)</label>
                <input
                  type="text"
                  placeholder="who is, which are, having + V3"
                  value={createSignals}
                  onChange={(e) => setCreateSignals(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Bẫy đề thi TOEIC cần lưu ý (mỗi bẫy 1 dòng)</label>
                <textarea
                  rows={2}
                  placeholder="Nhập bẫy thường gặp..."
                  value={createTraps}
                  onChange={(e) => setCreateTraps(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Câu ví dụ minh họa</label>
                  <input
                    type="text"
                    placeholder="The report submitted by Mr. Davis was approved."
                    value={createExampleSentence}
                    onChange={(e) => setCreateExampleSentence(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Dịch nghĩa ví dụ</label>
                  <input
                    type="text"
                    placeholder="Bản báo cáo được nộp bởi ông Davis đã được duyệt."
                    value={createExampleTranslation}
                    onChange={(e) => setCreateExampleTranslation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Tạo chủ điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: THÊM CÂU HỎI VÀO CHỦ ĐIỂM (ADD QUESTION MODAL) ================= */}
      {addQuestionTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Thêm Câu Hỏi Cho: <span className="text-blue-600">{addQuestionTopic.title}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddQuestionTopic(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phần thi (Part)</label>
                  <select
                    value={qPart}
                    onChange={(e) => setQPart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="Part 5">Part 5</option>
                    <option value="Part 6">Part 6</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Độ khó mục tiêu</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="350-500">350-500 (Dễ)</option>
                    <option value="500-750">500-750 (Trung bình)</option>
                    <option value="750+">750+ (Khó)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nội dung câu hỏi (dùng _______ cho chỗ trống) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="ví dụ: The director announced that the conference _______ tomorrow morning."
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Đáp án A *</label>
                  <input
                    type="text"
                    required
                    value={qOptA}
                    onChange={(e) => setQOptA(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Đáp án B *</label>
                  <input
                    type="text"
                    required
                    value={qOptB}
                    onChange={(e) => setQOptB(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Đáp án C *</label>
                  <input
                    type="text"
                    required
                    value={qOptC}
                    onChange={(e) => setQOptC(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Đáp án D *</label>
                  <input
                    type="text"
                    required
                    value={qOptD}
                    onChange={(e) => setQOptD(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Đáp án chính xác *</label>
                <div className="flex gap-3">
                  {(["A", "B", "C", "D"] as const).map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                        qCorrect === opt
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="qCorrect"
                        value={opt}
                        checked={qCorrect === opt}
                        onChange={() => setQCorrect(opt)}
                        className="hidden"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Giải thích chi tiết</label>
                <textarea
                  rows={2}
                  placeholder="Giải thích vì sao chọn đáp án này..."
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Lưu ý bẫy ETS</label>
                <input
                  type="text"
                  placeholder="Tránh nhầm lẫn với..."
                  value={qTrap}
                  onChange={(e) => setQTrap(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Dịch nghĩa câu</label>
                <input
                  type="text"
                  placeholder="Giám đốc thông báo rằng..."
                  value={qTranslation}
                  onChange={(e) => setQTranslation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddQuestionTopic(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Lưu câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: CHỈNH SỬA CHỦ ĐIỂM (EDIT TOPIC MODAL) ================= */}
      {editTopicItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Chỉnh Sửa Chủ Điểm</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditTopicItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTopic} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tên chủ điểm *</label>
                <input
                  type="text"
                  required
                  value={editTopicItem.title}
                  onChange={(e) => setEditTopicItem({ ...editTopicItem, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tên tiếng Anh</label>
                <input
                  type="text"
                  value={editTopicItem.englishTitle}
                  onChange={(e) => setEditTopicItem({ ...editTopicItem, englishTitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Điểm</label>
                  <select
                    value={editTopicItem.targetScore}
                    onChange={(e) => setEditTopicItem({ ...editTopicItem, targetScore: e.target.value as GrammarTopicItem["targetScore"] })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="350-500">350-500</option>
                    <option value="500-750">500-750</option>
                    <option value="750+">750+</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phần thi (Part)</label>
                  <select
                    value={editTopicItem.part}
                    onChange={(e) => setEditTopicItem({ ...editTopicItem, part: e.target.value as GrammarTopicItem["part"] })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="Part 5">Part 5</option>
                    <option value="Part 6">Part 6</option>
                    <option value="Part 5 & 6">Part 5 & 6</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Công thức trọng tâm</label>
                <input
                  type="text"
                  value={editTopicItem.formula}
                  onChange={(e) => setEditTopicItem({ ...editTopicItem, formula: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-blue-700 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tóm tắt nội dung</label>
                <textarea
                  rows={3}
                  value={editTopicItem.summary}
                  onChange={(e) => setEditTopicItem({ ...editTopicItem, summary: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditTopicItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: XÁC NHẬN XÓA (DELETE CONFIRM MODAL) ================= */}
      {deleteConfirmTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Xác nhận xóa chủ điểm?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn có chắc chắn muốn xóa chủ điểm{" "}
                <strong className="text-slate-900 font-bold">&quot;{deleteConfirmTopic.title}&quot;</strong> ({deleteConfirmTopic.code}) không? Thao tác này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTopic(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
