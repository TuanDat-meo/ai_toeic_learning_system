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
  ChevronRight,
  Plus,
  Pencil,
} from "lucide-react";

interface ExerciseCardData {
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
  theory?: {
    summary: string;
    rules: string[];
    example: string;
  };
  sampleQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

const INITIAL_CARDS: ExerciseCardData[] = [
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
        question: "Ms. Tanaka requested a detailed ______ of the quarterly expenses.",
        options: ["summary", "summarize", "summarized", "summarily"],
        correctIndex: 0,
        explanation: "Sau mạo từ 'a' và tính từ 'detailed' cần một Danh từ ('summary').",
      },
      {
        question: "The newly hired ______ will begin orientation on Monday morning.",
        options: ["inspect", "inspector", "inspects", "inspecting"],
        correctIndex: 1,
        explanation: "Cần danh từ chỉ người làm chủ ngữ cho động từ 'will begin'. 'Inspector' (thanh tra viên) là đáp án đúng.",
      },
    ],
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
        question: "The technician found that the network server was completely ______.",
        options: ["reliability", "rely", "reliable", "reliably"],
        correctIndex: 2,
        explanation: "Sau to be 'was' và trạng từ 'completely' cần một Tính từ ('reliable').",
      },
    ],
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
        question: "The financial auditor reviewed the fiscal accounts ______.",
        options: ["careful", "carefully", "care", "caring"],
        correctIndex: 1,
        explanation: "Bổ nghĩa cho động từ 'reviewed' cần một trạng từ chỉ cách thức ('carefully').",
      },
    ],
  },

  // --- NGỮ PHÁP: ĐỘNG TỪ ---
  {
    id: "g-dong-tu-thi",
    title: "Thì",
    category: "grammar",
    subCategory: "verbs",
    totalQuestions: 113,
    studiedQuestions: 6,
    correctAnswers: 3,
    wrongAnswers: 3,
    theory: {
      summary: "Nhận biết các thì hay ra trong TOEIC: Hiện tại đơn, Quá khứ đơn, Hiện tại hoàn thành, Tương lai đơn.",
      rules: [
        "Dấu hiệu hiện tại hoàn thành: since, for, recently, already, yet.",
        "Dấu hiệu quá khứ: yesterday, last year, ago, in + năm quá khứ.",
      ],
      example: "Mr. Henderson has worked at the corporate branch since 2021.",
    },
    sampleQuestions: [
      {
        question: "Last week, our executive team ______ a contract with the overseas supplier.",
        options: ["signs", "signed", "has signed", "signing"],
        correctIndex: 1,
        explanation: "Có trạng từ chỉ thời gian quá khứ 'Last week' nên dùng thì Quá khứ đơn ('signed').",
      },
      {
        question: "The facility manager ______ the annual safety audit every November.",
        options: ["conducts", "conducted", "has conducted", "will conduct"],
        correctIndex: 0,
        explanation: "Thói quen lặp lại 'every November' chia hiện tại đơn ngôi thứ ba số ít ('conducts').",
      },
    ],
  },
  {
    id: "g-dong-tu-hoa-hop",
    title: "Hòa hợp chủ ngữ – động từ",
    category: "grammar",
    subCategory: "verbs",
    totalQuestions: 129,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Chủ ngữ số ít đi với động từ số ít; chủ ngữ số nhiều đi với động từ số nhiều. Cẩn thận các cụm giới từ chen ngang.",
      rules: [
        "The list of candidates IS long (chủ ngữ là 'The list', không phải 'candidates').",
        "Each, every, either, neither đi với động từ số ít.",
      ],
      example: "A delegation of international investors is visiting the assembly plant today.",
    },
    sampleQuestions: [
      {
        question: "Each of the participants ______ given a comprehensive orientation packet.",
        options: ["was", "were", "are", "have been"],
        correctIndex: 0,
        explanation: "'Each of + danh từ số nhiều' luôn đi với động từ số ít trong quá khứ ('was').",
      },
    ],
  },
  {
    id: "g-dong-tu-chu-dong-bi-dong",
    title: "Chủ động – bị động",
    category: "grammar",
    subCategory: "verbs",
    totalQuestions: 113,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Bị động: Be + V3/ed. Dùng khi chủ ngữ chịu tác động của hành động, phía sau thường không có tân ngữ trực tiếp.",
      rules: [
        "Nếu sau khoảng trống không có tân ngữ danh từ -> ưu tiên chọn dạng bị động.",
        "Chủ ngữ là đồ vật/báo cáo/hợp đồng thường ở dạng bị động.",
      ],
      example: "The revised budget report was approved by the executive committee.",
    },
    sampleQuestions: [
      {
        question: "All conference attendees will be ______ upon arrival at the lobby.",
        options: ["registered", "register", "registering", "registers"],
        correctIndex: 0,
        explanation: "Dạng bị động tương lai: will be + V3/ed ('registered').",
      },
    ],
  },
  {
    id: "g-dong-tu-danh-dong-tu",
    title: "Danh động từ & Động từ nguyên mẫu",
    category: "grammar",
    subCategory: "verbs",
    totalQuestions: 76,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Gerunds (V-ing) sau giới từ hoặc động từ đặc biệt (avoid, enjoy, postpone). To-infinitive mục đích hoặc sau decide, plan, hope.",
      rules: [
        "Giới từ (in, on, at, of, for, about) + V-ing.",
        "To-V chỉ mục đích: 'In order to attend the workshop...'",
      ],
      example: "The marketing director suggested launching a customer loyalty program.",
    },
    sampleQuestions: [
      {
        question: "The director suggested ______ the product release until next quarter.",
        options: ["postponing", "to postpone", "postpone", "postponed"],
        correctIndex: 0,
        explanation: "Động từ 'suggest' đi kèm với danh động từ V-ing ('postponing').",
      },
    ],
  },
  {
    id: "g-dong-tu-cau-lenh",
    title: "Câu mệnh lệnh & Cầu khiến",
    category: "grammar",
    subCategory: "verbs",
    totalQuestions: 14,
    studiedQuestions: 10,
    correctAnswers: 9,
    wrongAnswers: 1,
    theory: {
      summary: "Câu mệnh lệnh bắt đầu trực tiếp bằng Động từ nguyên thể (V-bare) hoặc 'Please + V-bare'.",
      rules: [
        "Please + V-inf (không chia s/es/ed/ing).",
        "Dạng phủ định: Please do not + V-inf.",
      ],
      example: "Please turn off all mobile devices during the keynote presentation.",
    },
    sampleQuestions: [
      {
        question: "Please ______ all receipts to the accounting department for reimbursement.",
        options: ["submit", "submits", "submitted", "submitting"],
        correctIndex: 0,
        explanation: "Sau 'Please' trong câu mệnh lệnh lịch sự luôn dùng động từ nguyên thể ('submit').",
      },
    ],
  },
  {
    id: "g-dong-tu-khuyet-thieu",
    title: "Động từ khuyết thiếu (Modal verbs)",
    category: "grammar",
    subCategory: "verbs",
    totalQuestions: 137,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Sau modal verbs (can, could, should, must, may, might, will, would) luôn đi cùng Động từ nguyên mẫu không 'to'.",
      rules: [
        "Modal verb + V-inf.",
        "Modal verb + be + V3/ed (thể bị động).",
      ],
      example: "All employees must wear safety goggles in the production area.",
    },
    sampleQuestions: [
      {
        question: "Visitors must ______ their visitor badges visibly at all times.",
        options: ["wear", "wears", "wore", "wearing"],
        correctIndex: 0,
        explanation: "Sau modal verb 'must' luôn dùng động từ nguyên mẫu không to ('wear').",
      },
    ],
  },

  // --- NGỮ PHÁP: NGỮ PHÁP KHÁC ---
  {
    id: "g-khac-dai-tu",
    title: "Đại từ",
    category: "grammar",
    subCategory: "other_grammar",
    totalQuestions: 145,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Phân biệt Đại từ chủ ngữ (I, you, he, she), tân ngữ (me, him, her), tính từ sở hữu (my, his, our + Noun) và đại từ phản thân (myself, himself).",
      rules: [
        "Tính từ sở hữu + Noun (their satisfaction, his office).",
        "Đại từ phản thân đứng cuối câu hoặc sau chủ ngữ để nhấn mạnh (did it by himself).",
      ],
      example: "The supervisor completed the audit report by herself.",
    },
    sampleQuestions: [
      {
        question: "The department heads discussed ______ budget proposals during the meeting.",
        options: ["their", "they", "them", "themselves"],
        correctIndex: 0,
        explanation: "Trước cụm danh từ 'budget proposals' cần một tính từ sở hữu ('their').",
      },
    ],
  },
  {
    id: "g-khac-so-sanh",
    title: "So sánh",
    category: "grammar",
    subCategory: "other_grammar",
    totalQuestions: 164,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "So sánh bằng (as... as), so sánh hơn (Adj-er / more + Adj + than), so sánh nhất (the + Adj-est / the most + Adj).",
      rules: [
        "Càng... càng...: The more... the more...",
        "Nhấn mạnh so sánh hơn: much, far, significantly + more...",
      ],
      example: "The new processing model is much faster than the older version.",
    },
    sampleQuestions: [
      {
        question: "The newly released smartphone model is significantly ______ than its predecessor.",
        options: ["light", "lighter", "lightest", "lightly"],
        correctIndex: 1,
        explanation: "Có từ 'than' và từ nhấn mạnh 'significantly' nên dùng so sánh hơn ('lighter').",
      },
    ],
  },
  {
    id: "g-khac-gioi-tu",
    title: "Giới từ",
    category: "grammar",
    subCategory: "other_grammar",
    totalQuestions: 151,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Giới từ chỉ thời gian (at, on, in, before, after, during, within) và nơi chốn (between, among, throughout).",
      rules: [
        "During + khoảng thời gian (during the presentation), For + khoảng thời gian có số (for 3 hours).",
        "Within + thời hạn (within 24 hours, within the company).",
      ],
      example: "Orders will be dispatched within two business days.",
    },
    sampleQuestions: [
      {
        question: "The construction project must be completed ______ the end of this month.",
        options: ["before", "until", "during", "while"],
        correctIndex: 0,
        explanation: "'Before the end of this month' mang nghĩa trước cuối tháng này.",
      },
    ],
  },
  {
    id: "g-khac-menh-de-quan-he",
    title: "Mệnh đề quan hệ",
    category: "grammar",
    subCategory: "other_grammar",
    totalQuestions: 156,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Who (chỉ người làm S), Whom (chỉ người làm O), Which (chỉ vật), That (thay cho who/which), Whose (sở hữu cách).",
      rules: [
        "Rút gọn MĐQH chủ động thành V-ing: The man (who is) standing there -> standing.",
        "Rút gọn MĐQH bị động thành V3/ed: The book (which was) published yesterday -> published.",
      ],
      example: "Employees who exceed their sales targets will receive an annual bonus.",
    },
    sampleQuestions: [
      {
        question: "Any client ______ wishes to reschedule their appointment should call in advance.",
        options: ["who", "which", "whom", "whose"],
        correctIndex: 0,
        explanation: "Chủ ngữ chỉ người 'Any client' và đóng vai trò chủ ngữ cho động từ 'wishes' -> dùng 'who'.",
      },
    ],
  },
  {
    id: "g-khac-cau-dieu-kien",
    title: "Câu điều kiện",
    category: "grammar",
    subCategory: "other_grammar",
    totalQuestions: 37,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Loại 1 (Có thật tương lai): If + S + V(hiện tại), S + will + V. Loại 2: If + S + V2/ed (were), S + would + V.",
      rules: [
        "Đảo ngữ câu điều kiện loại 1: Should + S + V-inf, S + will + V.",
        "Provided that / As long as = If.",
      ],
      example: "If the shipment arrives on time, we will distribute the merchandise tomorrow.",
    },
    sampleQuestions: [
      {
        question: "Should you ______ any further inquiries, please contact our support desk.",
        options: ["have", "has", "had", "having"],
        correctIndex: 0,
        explanation: "Đảo ngữ câu điều kiện loại 1 'Should + S + V-inf' -> dùng 'have'.",
      },
    ],
  },
  {
    id: "g-khac-lien-tu",
    title: "Liên từ & Mệnh đề ngữ pháp",
    category: "grammar",
    subCategory: "other_grammar",
    totalQuestions: 54,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Phân biệt liên từ (nối mệnh đề: Although, Because, While) và giới từ (đi với danh từ: Despite, Because of, During).",
      rules: [
        "Although / Even though / Though + S + V.",
        "Despite / In spite of + Noun phrase / V-ing.",
      ],
      example: "Although the weather was harsh, the logistics flight landed safely.",
    },
    sampleQuestions: [
      {
        question: "______ the severe rainstorm, the delivery driver arrived at the warehouse on time.",
        options: ["Despite", "Although", "Even though", "Because"],
        correctIndex: 0,
        explanation: "Phía sau là cụm danh từ 'the severe rainstorm' nên phải dùng giới từ chỉ sự nhượng bộ 'Despite'.",
      },
    ],
  },

  // --- PART 5: 4 CẤP ĐỘ ---
  {
    id: "p5-level-1",
    title: "Level 1 — Dưới 200",
    category: "part5",
    subCategory: "levels",
    totalQuestions: 272,
    studiedQuestions: 10,
    correctAnswers: 10,
    wrongAnswers: 0,
    theory: {
      summary: "Phần 5 mức cơ bản: Từ vựng đơn giản, từ loại rõ ràng (Danh/Tính/Động/Trạng) và thì quá khứ/hiện tại cơ bản.",
      rules: ["Xác định thành phần câu S - V - O", "Nhìn nhanh từ đứng trước và sau chỗ trống"],
      example: "She is a skilled accountant.",
    },
    sampleQuestions: [
      {
        question: "Mr. Lee will contact ______ client tomorrow morning.",
        options: ["the", "an", "this of", "these"],
        correctIndex: 0,
        explanation: "Mạo từ 'the' đứng trước danh từ đếm được số ít 'client'.",
      },
    ],
  },
  {
    id: "p5-level-2",
    title: "Level 2 — 200–300",
    category: "part5",
    subCategory: "levels",
    totalQuestions: 227,
    studiedQuestions: 117,
    correctAnswers: 99,
    wrongAnswers: 18,
    theory: {
      summary: "Phần 5 mức trung bình: Hòa hợp S-V, bị động, giới từ chỉ thời gian và đại từ phản thân.",
      rules: ["Nhận diện chủ ngữ số ít/số nhiều", "Nhận biết câu bị động khi không có tân ngữ"],
      example: "The new branch was established last winter.",
    },
    sampleQuestions: [
      {
        question: "The latest annual report was ______ distributed to all shareholders.",
        options: ["wide", "widely", "widen", "width"],
        correctIndex: 1,
        explanation: "Trạng từ 'widely' đứng giữa trợ động từ 'was' và phân từ hai 'distributed'.",
      },
    ],
  },
  {
    id: "p5-level-3",
    title: "Level 3 — 300–400",
    category: "part5",
    subCategory: "levels",
    totalQuestions: 324,
    studiedQuestions: 67,
    correctAnswers: 57,
    wrongAnswers: 10,
    theory: {
      summary: "Phần 5 mức nâng cao: Mệnh đề quan hệ rút gọn, liên từ nâng cao, từ vựng chuyên ngành kinh tế & thương mại.",
      rules: ["Phân biệt liên từ và giới từ chỉ sự tương phản", "Rút gọn mệnh đề phân từ V-ing/V3"],
      example: "Having finished the report, she presented the findings to the committee.",
    },
    sampleQuestions: [
      {
        question: "______ the supply chain disruption, our company met the quarterly production quota.",
        options: ["Notwithstanding", "Even", "Whereas", "Unless"],
        correctIndex: 0,
        explanation: "'Notwithstanding' đóng vai trò giới từ mang nghĩa 'Bất chấp/Mặc dù', đi kèm cụm danh từ.",
      },
    ],
  },
  {
    id: "p5-level-4",
    title: "Level 4 — 400–495",
    category: "part5",
    subCategory: "levels",
    totalQuestions: 77,
    studiedQuestions: 48,
    correctAnswers: 21,
    wrongAnswers: 27,
    theory: {
      summary: "Phần 5 mức tinh thông (Target 900+): Thành ngữ thương mại, collocations khó, cấu trúc giả định (Subjunctive) và đảo ngữ hiếm gặp.",
      rules: ["Cấu trúc giả định: recommend/request that S + (should) + V-bare", "Đảo ngữ phủ định: Rarely, Seldom, Never"],
      example: "The auditor recommended that the corporation implement stricter fiscal oversight.",
    },
    sampleQuestions: [
      {
        question: "Hardly ______ the delegates entered the conference hall when the keynote speaker began.",
        options: ["had", "did", "have", "were"],
        correctIndex: 0,
        explanation: "Cấu trúc đảo ngữ: 'Hardly had + S + V3/ed + when + S + V2/ed'.",
      },
    ],
  },

  // --- PART 5: LUYỆN THEO CHỦ ĐIỂM ---
  {
    id: "p5-topic-tu-vung",
    title: "Từ vựng",
    category: "part5",
    subCategory: "by_topic",
    tag: "Danh · động · tính · trạng · giới từ",
    totalQuestions: 406,
    studiedQuestions: 154,
    correctAnswers: 109,
    wrongAnswers: 45,
    sampleQuestions: [
      {
        question: "The store manager offered an immediate ______ for the defective blender.",
        options: ["refund", "refunded", "refunding", "refundable"],
        correctIndex: 0,
        explanation: "Cần danh từ 'refund' (sự hoàn tiền) sau tính từ 'immediate'.",
      },
    ],
  },
  {
    id: "p5-topic-tu-loai",
    title: "Từ loại",
    category: "part5",
    subCategory: "by_topic",
    tag: "Cùng gốc, khác hậu tố",
    totalQuestions: 219,
    studiedQuestions: 15,
    correctAnswers: 13,
    wrongAnswers: 2,
    sampleQuestions: [
      {
        question: "Our priority is to maintain customer ______ across all retail outlets.",
        options: ["satisfaction", "satisfy", "satisfactory", "satisfactorily"],
        correctIndex: 0,
        explanation: "Cụm danh từ ghép 'customer satisfaction' (sự hài lòng của khách hàng).",
      },
    ],
  },
  {
    id: "p5-topic-dong-tu",
    title: "Động từ",
    category: "part5",
    subCategory: "by_topic",
    tag: "Thì · dạng động từ · bị động",
    totalQuestions: 82,
    studiedQuestions: 31,
    correctAnswers: 26,
    wrongAnswers: 5,
    sampleQuestions: [
      {
        question: "The construction team ______ the foundation by the time the shipment arrived.",
        options: ["had completed", "completed", "has completed", "will complete"],
        correctIndex: 0,
        explanation: "Hành động hoàn thành trước một mốc quá khứ ('by the time arrived') chia Quá khứ hoàn thành ('had completed').",
      },
    ],
  },
  {
    id: "p5-topic-ngu-phap-khac",
    title: "Ngữ pháp khác",
    category: "part5",
    subCategory: "by_topic",
    tag: "Liên từ · đại từ · mệnh đề · so sánh",
    totalQuestions: 193,
    studiedQuestions: 42,
    correctAnswers: 39,
    wrongAnswers: 3,
    sampleQuestions: [
      {
        question: "Neither the manager ______ the supervisor was aware of the scheduling discrepancy.",
        options: ["nor", "or", "and", "but"],
        correctIndex: 0,
        explanation: "Cặp liên từ tương quan chuẩn: 'Neither... nor...'.",
      },
    ],
  },

  // --- PART 6: ĐIỀN ĐOẠN VĂN ---
  {
    id: "p6-level-1",
    title: "Level 1 — Dưới 200",
    category: "part6",
    subCategory: "levels",
    totalQuestions: 120,
    studiedQuestions: 18,
    correctAnswers: 16,
    wrongAnswers: 2,
    sampleQuestions: [
      {
        question: "[Trích Email thông báo] We appreciate your business and look forward to ______ you again.",
        options: ["serving", "served", "serve", "server"],
        correctIndex: 0,
        explanation: "Cấu trúc 'look forward to + V-ing' -> 'serving'.",
      },
    ],
  },
  {
    id: "p6-level-2",
    title: "Level 2 — 200–300",
    category: "part6",
    subCategory: "levels",
    totalQuestions: 140,
    studiedQuestions: 45,
    correctAnswers: 38,
    wrongAnswers: 7,
    sampleQuestions: [
      {
        question: "[Trích Biên bản] As previously mentioned, the deadline ______ by five days.",
        options: ["has been extended", "extends", "was extending", "extending"],
        correctIndex: 0,
        explanation: "Sự việc có kết quả đến hiện tại, ở dạng bị động: 'has been extended'.",
      },
    ],
  },
  {
    id: "p6-topic-email",
    title: "Email & Thư thương mại",
    category: "part6",
    subCategory: "text_types",
    tag: "Xác nhận đơn, lịch hẹn, phàn nàn",
    totalQuestions: 180,
    studiedQuestions: 40,
    correctAnswers: 34,
    wrongAnswers: 6,
    sampleQuestions: [
      {
        question: "Please find ______ the finalized invoice for your order.",
        options: ["attached", "attaching", "attachment", "attaches"],
        correctIndex: 0,
        explanation: "Cụm thường gặp trong thư thương mại: 'find attached' (tìm thấy tài liệu đính kèm).",
      },
    ],
  },
  {
    id: "p6-topic-notices",
    title: "Thông báo & Bản tin nội bộ",
    category: "part6",
    subCategory: "text_types",
    tag: "Bảo trì văn phòng, tuyển dụng",
    totalQuestions: 110,
    studiedQuestions: 22,
    correctAnswers: 19,
    wrongAnswers: 3,
    sampleQuestions: [
      {
        question: "The main parking area will be closed tomorrow for ______ maintenance.",
        options: ["routine", "routinely", "routines", "routing"],
        correctIndex: 0,
        explanation: "Trước danh từ 'maintenance' cần tính từ 'routine' (định kỳ).",
      },
    ],
  },

  // --- PART 7: ĐỌC HIỂU ĐOẠN VĂN ---
  {
    id: "p7-level-1",
    title: "Level 1 — Dưới 200",
    category: "part7",
    subCategory: "levels",
    totalQuestions: 150,
    studiedQuestions: 12,
    correctAnswers: 11,
    wrongAnswers: 1,
    sampleQuestions: [
      {
        question: "According to the advertisement, what discount is offered for early registration?",
        options: ["15 percent", "25 percent", "Free voucher", "10 dollars"],
        correctIndex: 0,
        explanation: "Thông tin trực tiếp trong bài đọc: 'Register before July 1 to receive 15% off'.",
      },
    ],
  },
  {
    id: "p7-topic-single",
    title: "Đoạn đơn (Single Passages)",
    category: "part7",
    subCategory: "text_types",
    tag: "Email, Thư mời, Quảng cáo, Hóa đơn",
    totalQuestions: 310,
    studiedQuestions: 85,
    correctAnswers: 72,
    wrongAnswers: 13,
    sampleQuestions: [
      {
        question: "What is the primary purpose of the letter?",
        options: [
          "To invite Ms. Ross to a business summit",
          "To request immediate payment",
          "To notify about an office relocation",
          "To announce a staff promotion",
        ],
        correctIndex: 0,
        explanation: "Dòng mở đầu: 'We are pleased to invite you as a distinguished guest to our annual summit'.",
      },
    ],
  },
  {
    id: "p7-topic-double",
    title: "Đoạn kép & Đoạn ba (Multi-Passages)",
    category: "part7",
    subCategory: "text_types",
    tag: "Email kết hợp Đơn hàng & Lịch trình",
    totalQuestions: 240,
    studiedQuestions: 32,
    correctAnswers: 24,
    wrongAnswers: 8,
    sampleQuestions: [
      {
        question: "In the second email, what change does Mr. Vance request?",
        options: [
          "Changing the hotel booking date",
          "Cancelling the flight ticket",
          "Upgrading to first-class seats",
          "Applying for travel insurance",
        ],
        correctIndex: 0,
        explanation: "Đối chiếu thông tin email 1 và email 2 cho thấy ông Vance muốn đổi ngày nhận phòng khách sạn.",
      },
    ],
  },
];

export default function ReadingLearningPage() {
  const [cards, setCards] = useState<ExerciseCardData[]>(INITIAL_CARDS);
  const [activeMainTab, setActiveMainTab] = useState<"grammar" | "part5" | "part6" | "part7">("grammar");
  const [activeSubFilter, setActiveSubFilter] = useState<"all" | "word_types" | "verbs" | "other_grammar">("all");

  // Interactive Quiz Modal State
  const [activePracticeCard, setActivePracticeCard] = useState<ExerciseCardData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [sessionWrongCount, setSessionWrongCount] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);

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

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
      const newCard: ExerciseCardData = {
        id: `reading-${Date.now()}`,
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
            question: "The director approved the proposal after a ______ review of the budget.",
            options: ["thorough", "thoroughly", "thoroughness", "more thorough"],
            correctIndex: 0,
            explanation: "Trước danh từ 'review' cần một tính từ ('thorough').",
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

  // Timer effect for Quiz Modal
  useEffect(() => {
    if (!activePracticeCard) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activePracticeCard]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  // Toggle Bookmark
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

  // Reset Progress of a card
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

  // Start Practice
  const handleStartPractice = (card: ExerciseCardData) => {
    setActivePracticeCard(card);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsChecked(false);
    setSessionCorrectCount(0);
    setSessionWrongCount(0);
    setTimerSeconds(0);
  };

  // Submit Answer in Quiz
  const handleCheckAnswer = () => {
    if (selectedOption === null || !activePracticeCard) return;
    setIsChecked(true);
    const q = activePracticeCard.sampleQuestions[currentQuestionIndex];
    const isRight = selectedOption === q.correctIndex;

    if (isRight) {
      setSessionCorrectCount((prev) => prev + 1);
    } else {
      setSessionWrongCount((prev) => prev + 1);
    }

    // Update global card stats
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === activePracticeCard.id) {
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

  // Next Question
  const handleNextQuestion = () => {
    if (!activePracticeCard) return;
    if (currentQuestionIndex < activePracticeCard.sampleQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
    } else {
      // Completed session
      showToast(`Hoàn thành phiên luyện tập! Đúng: ${sessionCorrectCount} câu 🎉`);
      setActivePracticeCard(null);
    }
  };

  // Filter cards based on current active tab and subFilter
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
        {/* Header viền trên thẻ */}
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

          {/* Dòng trạng thái tiến độ */}
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

        {/* Thanh công cụ dưới đáy thẻ */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Nhóm nút thao tác nhỏ */}
          <div className="flex items-center gap-1">
            {/* Lưu bookmark */}
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

            {/* Xem lý thuyết ngữ pháp */}
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

            {/* Luyện lại câu sai với Badge đỏ */}
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

            {/* Đặt lại tiến độ */}
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

          {/* Nút Học ngay */}
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

  return (
    <div className="min-h-screen bg-[#f8fafc]/90 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      {/* KHỐI 1: HEADER BANNER CHINH PHỤC TOEIC READING */}
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

        {/* Icon Sách Xanh lớn góc phải */}
        <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* KHỐI 2: THANH TAB CHUYỂN CHẾ ĐỘ CHÍNH */}
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

      {/* KHỐI 3: NỘI DUNG THEO TAB ĐANG CHỌN */}

      {/* --- TAB 1: NGỮ PHÁP --- */}
      {activeMainTab === "grammar" && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Sub-filter bar & Add button */}
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

          {/* NHÓM 1: TỪ LOẠI */}
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

          {/* NHÓM 2: ĐỘNG TỪ */}
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

          {/* NHÓM 3: NGỮ PHÁP KHÁC */}
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
          {/* 4 Cấp độ Part 5 */}
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

          {/* Luyện theo chủ điểm Part 5 */}
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
          {/* Cấp độ Part 6 */}
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

          {/* Dạng văn bản Part 6 */}
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
          {/* Cấp độ Part 7 */}
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

          {/* Dạng bài đọc Part 7 */}
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

      {/* --- MODAL 1: LUYỆN TẬP TƯƠNG TÁC (QUIZ PRACTICE MODAL) --- */}
      {activePracticeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {activePracticeCard.title}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Câu hỏi {currentQuestionIndex + 1} / {activePracticeCard.sampleQuestions.length}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {formatTimer(timerSeconds)}
                </div>
                <button
                  type="button"
                  onClick={() => setActivePracticeCard(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nội dung câu hỏi */}
            {(() => {
              const q = activePracticeCard.sampleQuestions[currentQuestionIndex];
              if (!q) return null;

              return (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <p className="text-base font-semibold text-slate-900 leading-relaxed font-sans">
                      {q.question}
                    </p>
                  </div>

                  {/* 4 Lựa chọn A, B, C, D */}
                  <div className="space-y-2.5">
                    {q.options.map((opt, idx) => {
                      const letter = ["A", "B", "C", "D"][idx];
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === q.correctIndex;

                      let btnStyle = "border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50 text-slate-800";
                      if (isChecked) {
                        if (isCorrect) {
                          btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20";
                        } else if (isSelected) {
                          btnStyle = "border-rose-400 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-400/20";
                        } else {
                          btnStyle = "border-slate-100 bg-slate-50 text-slate-400 opacity-60";
                        }
                      } else if (isSelected) {
                        btnStyle = "border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20";
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isChecked}
                          onClick={() => setSelectedOption(idx)}
                          className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${btnStyle}`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                              isChecked && isCorrect
                                ? "bg-emerald-600 text-white"
                                : isChecked && isSelected
                                ? "bg-rose-500 text-white"
                                : isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="text-sm font-medium flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Giải thích chi tiết khi đã bấm kiểm tra */}
                  {isChecked && (
                    <div
                      className={`p-4 rounded-2xl border text-sm leading-relaxed animate-in fade-in duration-200 ${
                        selectedOption === q.correctIndex
                          ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                          : "bg-rose-50/80 border-rose-200 text-rose-950"
                      }`}
                    >
                      <div className="font-bold flex items-center gap-2 mb-1.5">
                        {selectedOption === q.correctIndex ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700">Chính xác! Xuất sắc lắm!</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-rose-600" />
                            <span className="text-rose-700">Chưa chính xác. Đáp án đúng là {["A", "B", "C", "D"][q.correctIndex]}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 mt-1">
                        <strong>💡 Giải thích chi tiết: </strong>
                        {q.explanation}
                      </p>
                    </div>
                  )}

                  {/* Footer buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-500">
                      Đúng: <strong className="text-emerald-600">{sessionCorrectCount}</strong> | Sai:{" "}
                      <strong className="text-rose-500">{sessionWrongCount}</strong>
                    </span>

                    {!isChecked ? (
                      <button
                        type="button"
                        disabled={selectedOption === null}
                        onClick={handleCheckAnswer}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Kiểm tra đáp án
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold transition-all shadow-xs cursor-pointer"
                      >
                        {currentQuestionIndex < activePracticeCard.sampleQuestions.length - 1
                          ? "Câu tiếp theo"
                          : "Hoàn thành bài tập"}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- MODAL 2: TÀI LIỆU LÝ THUYẾT & MẸO THI --- */}
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

      {/* --- MODAL 3: ÔN LẠI CÂU SAI (WRONG ANSWERS NOTEBOOK) --- */}
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
              <p className="font-semibold">
                🎯 Lợi ích của việc làm lại câu sai:
              </p>
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

      {/* --- MODAL 4: XÁC NHẬN ĐẶT LẠI TIẾN ĐỘ --- */}
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

      {/* --- MODAL: THÊM / SỬA CHỦ ĐIỂM ĐỌC --- */}
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

      {/* --- MODAL: XÁC NHẬN XÓA CHỦ ĐIỂM ĐỌC --- */}
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

      {/* --- TOAST THÔNG BÁO --- */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
