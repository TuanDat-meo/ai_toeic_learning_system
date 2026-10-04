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
  AlertTriangle,
} from "lucide-react";

export interface VocabItem {
  word: string;
  pos: string;
  level: string;
  ipa: string;
  meaning: string;
  example?: { en: string; vi: string };
  collocations?: { en: string; vi: string }[];
  synonyms?: { en: string; vi: string }[];
  antonyms?: { en: string; vi: string }[];
  wordFamily?: { word: string; pos: string; meaning: string }[];
}

export interface SampleQuestion {
  questionNum?: string;
  question: string;
  bilingual?: string;
  options: string[];
  optionMeanings?: string[];
  correctIndex: number;
  explanation: string;
  steps?: { title: string; desc: string }[];
  vocabList?: VocabItem[];
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
      summary: "Part 5 mức cơ bản: Từ vựng đơn giản, từ loại rõ ràng (Danh/Tính/Động/Trạng) và thì quá khứ/hiện tại cơ bản.",
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
          {
            word: "frequently",
            pos: "adv",
            level: "B1",
            ipa: "/'friːkwəntli/",
            meaning: "thường xuyên",
            example: {
              en: "Her supervisor frequently asks her to make materials for presentations.",
              vi: "Cấp trên của cô ấy thường xuyên nhờ cô làm tài liệu cho các bài thuyết trình."
            },
            collocations: [
              { en: "be updated frequently", vi: "được cập nhật thường xuyên" },
              { en: "frequently asked questions", vi: "các câu hỏi thường gặp" }
            ],
            synonyms: [{ en: "often", vi: "thường" }],
            antonyms: [{ en: "rarely", vi: "hiếm khi" }],
            wordFamily: [{ word: "frequent", pos: "adj", meaning: "thường xuyên" }]
          },
          {
            word: "supervisor",
            pos: "n",
            level: "B1",
            ipa: "US /'suːpərvaɪzər/ UK /'suːpəvaɪzə/",
            meaning: "cấp trên trực tiếp, người giám sát",
            example: {
              en: "Her supervisor frequently asks her to make materials for presentations.",
              vi: "Cấp trên của cô ấy thường xuyên nhờ cô làm tài liệu cho các bài thuyết trình."
            },
            collocations: [
              { en: "report to a supervisor", vi: "báo cáo cho cấp trên" },
              { en: "a shift supervisor", vi: "giám sát ca" }
            ],
            synonyms: [{ en: "manager", vi: "quản lý" }],
            antonyms: [{ en: "subordinate", vi: "cấp dưới" }],
            wordFamily: [{ word: "supervise", pos: "v", meaning: "giám sát" }]
          },
          {
            word: "personally",
            pos: "adv",
            level: "B1",
            ipa: "/ˈpɜːrsənəli/",
            meaning: "đích thân, về phần cá nhân",
            example: {
              en: "Mr. Olivero praised the film in his review, even though he personally disliked its aesthetic style.",
              vi: "Ông Olivero đã khen ngợi bộ phim, mặc dù đích thân ông không thích phong cách thẩm mỹ của nó."
            },
            collocations: [
              { en: "take something personally", vi: "coi điều gì là xúc phạm cá nhân" },
              { en: "personally responsible", vi: "chịu trách nhiệm cá nhân" }
            ],
            synonyms: [{ en: "in person", vi: "trực tiếp" }],
            antonyms: [{ en: "impersonally", vi: "thụ động" }],
            wordFamily: [{ word: "person", pos: "n", meaning: "con người" }]
          }
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
            desc: "Xét vị trí: chỗ trống đứng đầu câu, trước cụm giới từ \"of the garments\" và động từ \"will begin\", nên cần danh từ làm chủ ngữ."
          },
          {
            title: "Bước 3: Chọn đáp án",
            desc: "Chọn danh từ \"Production\" (việc sản xuất)."
          }
        ],
        vocabList: [
          {
            word: "production",
            pos: "n",
            level: "B2",
            ipa: "/prəˈdʌkʃn/",
            meaning: "sự sản xuất, việc chế tạo",
            example: {
              en: "Production of the garments will begin two weeks after the contract is signed.",
              vi: "Việc sản xuất hàng may mặc sẽ bắt đầu hai tuần sau khi hợp đồng được ký kết."
            },
            collocations: [
              { en: "mass production", vi: "sản xuất hàng loạt" },
              { en: "production line", vi: "dây chuyền sản xuất" }
            ],
            synonyms: [{ en: "manufacturing", vi: "sự chế tạo" }],
            antonyms: [{ en: "destruction", vi: "sự phá hủy" }],
            wordFamily: [{ word: "produce", pos: "v", meaning: "sản xuất" }]
          },
          {
            word: "garment",
            pos: "n",
            level: "B2",
            ipa: "/ˈɡɑːrmənt/",
            meaning: "hàng may mặc, trang phục",
            example: {
              en: "The store sells high-quality leather garments.",
              vi: "Cửa hàng bán các sản phẩm trang phục bằng da chất lượng cao."
            },
            collocations: [
              { en: "garment industry", vi: "ngành may mặc" }
            ],
            synonyms: [{ en: "apparel", vi: "trang phục" }],
            wordFamily: [{ word: "garments", pos: "n-plural", meaning: "quần áo" }]
          }
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

  // --- NGỮ PHÁP: ĐỘNG TỪ ---
  {
    id: "g-dong-tu-thi",
    title: "Thì & Dạng động từ",
    category: "grammar",
    subCategory: "verbs",
    tag: "Động từ · Các thì",
    totalQuestions: 180,
    studiedQuestions: 25,
    correctAnswers: 22,
    wrongAnswers: 3,
    theory: {
      summary: "Phân biệt Thì Quá khứ, Hiện tại hoàn thành và Tương lai đơn trong TOEIC.",
      rules: ["Dấu hiệu: since/for (HTHT), yesterday/last year (Quá khứ), next month (Tương lai)"],
      example: "The firm has expanded its office operations since last January."
    },
    sampleQuestions: [
      {
        questionNum: "108",
        question: "The construction project _______ ahead of schedule since last month.",
        bilingual: "Dự án xây dựng đã tiến triển trước kế hoạch kể từ tháng trước.",
        options: ["has progressed", "progressed", "will progress", "progressing"],
        optionMeanings: ["(HTHT): đã tiến triển", "(QK): đã tiến triển", "(TL): sẽ tiến triển", "(V-ing): việc tiến triển"],
        correctIndex: 0,
        explanation: "Dấu hiệu 'since last month' dùng Thì Hiện tại hoàn thành ('has progressed').",
        steps: [
          { title: "Bước 1: Tìm dấu hiệu thời gian", desc: "Từ 'since' đứng trước mốc thời gian." },
          { title: "Bước 2: Chọn thì", desc: "Hiện tại hoàn thành: Has + V3/ed." }
        ],
        vocabList: [{ word: "progress", pos: "v", level: "B2", ipa: "/prəˈɡres/", meaning: "tiến triển" }]
      }
    ]
  },
  {
    id: "g-dong-tu-hoa-hop",
    title: "Hòa hợp Chủ ngữ & Động từ",
    category: "grammar",
    subCategory: "verbs",
    tag: "Động từ · S-V Agreement",
    totalQuestions: 140,
    studiedQuestions: 10,
    correctAnswers: 9,
    wrongAnswers: 1,
    theory: {
      summary: "Chủ ngữ số ít đi với động từ số ít; Chủ ngữ số nhiều đi với động từ số nhiều.",
      rules: ["Cụm danh từ N1 of N2 -> Động từ chia theo N1."],
      example: "Each of the new employees is required to complete the orientation."
    },
    sampleQuestions: [
      {
        questionNum: "109",
        question: "Each of the branch offices _______ a monthly safety report to headquarters.",
        bilingual: "Mỗi chi nhánh văn phòng nộp báo cáo an toàn hàng tháng về trụ sở chính.",
        options: ["submits", "submit", "submitting", "submission"],
        optionMeanings: ["(v-s): nộp", "(v): nộp", "(v-ing): việc nộp", "(n): sự nộp"],
        correctIndex: 0,
        explanation: "Chủ ngữ 'Each of...' là danh từ số ít nên động từ chia 'submits'.",
        steps: [
          { title: "Bước 1: Xác định chủ ngữ chính", desc: "Each (mỗi cái) -> Số ít." },
          { title: "Bước 2: Chia động từ", desc: "Động từ số ít thêm -s ('submits')." }
        ],
        vocabList: [{ word: "headquarters", pos: "n", level: "B2", ipa: "/ˈhedkwɔːrtərz/", meaning: "trụ sở chính" }]
      }
    ]
  },
  {
    id: "g-dong-tu-ving-to-v",
    title: "Danh động từ & Động từ nguyên mẫu",
    category: "grammar",
    subCategory: "verbs",
    tag: "Động từ · Gerund & Infinitive",
    totalQuestions: 132,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Các động từ đi với To V (plan, decide, agree, request) và V-ing (consider, suggest, enjoy, delay).",
      rules: ["Plan / Decide / Agree + To V; Consider / Suggest / Delay + V-ing"],
      example: "We plan to open three new retail outlets next year."
    },
    sampleQuestions: [
      {
        questionNum: "110",
        question: "The board members agreed _______ the proposal at the upcoming summit.",
        bilingual: "Các thành viên hội đồng quản trị đã đồng ý thảo luận đề xuất tại hội nghị thượng đỉnh sắp tới.",
        options: ["to discuss", "discussing", "discussed", "discussion"],
        optionMeanings: ["(to-v): thảo luận", "(v-ing): việc thảo luận", "(v-ed): đã thảo luận", "(n): cuộc thảo luận"],
        correctIndex: 0,
        explanation: "Động từ 'agree' đi với 'to + V' -> 'to discuss'.",
        steps: [
          { title: "Bước 1: Nhận diện động từ chính", desc: "Agreed + To V." },
          { title: "Bước 2: Chọn đáp án", desc: "To discuss." }
        ],
        vocabList: [{ word: "summit", pos: "n", level: "C1", ipa: "/ˈsʌmɪt/", meaning: "hội nghị thượng đỉnh" }]
      }
    ]
  },
  {
    id: "g-dong-tu-bi-dong",
    title: "Thể bị động (Passive Voice)",
    category: "grammar",
    subCategory: "verbs",
    tag: "Động từ · Passive",
    totalQuestions: 130,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Dạng bị động Be + V3/ed khi chủ ngữ chịu tác động của hành động.",
      rules: ["S (vật/tác vụ) + Be + V3/ed (+ by O)"],
      example: "The shipment was delayed due to severe weather conditions."
    },
    sampleQuestions: [
      {
        questionNum: "111",
        question: "All confidential documents must be _______ in locked cabinets.",
        bilingual: "Tất cả các tài liệu bảo mật phải được lưu trữ trong tủ khóa.",
        options: ["stored", "store", "storing", "storage"],
        optionMeanings: ["(v3): được lưu trữ", "(v): lưu trữ", "(v-ing): việc lưu trữ", "(n): kho lưu trữ"],
        correctIndex: 0,
        explanation: "Cấu trúc bị động Must be + V3/ed -> 'stored'.",
        steps: [
          { title: "Bước 1: Nhận diện bị động", desc: "Must be + V3." },
          { title: "Bước 2: Chọn đáp án", desc: "Stored." }
        ],
        vocabList: [{ word: "confidential", pos: "adj", level: "C1", ipa: "/ˌkɑːnfɪˈdenʃl/", meaning: "bảo mật, tin cậy" }]
      }
    ]
  },

  // --- NGỮ PHÁP: NGỮ PHÁP KHÁCH ---
  {
    id: "g-other-menh-de-qh",
    title: "Mệnh đề quan hệ",
    category: "grammar",
    subCategory: "other_grammar",
    tag: "Ngữ pháp · Mệnh đề",
    totalQuestions: 195,
    studiedQuestions: 30,
    correctAnswers: 28,
    wrongAnswers: 2,
    theory: {
      summary: "Đại từ quan hệ Who (người), Which (vật), That (người/vật), Whose (sở hữu), Where (nơi chốn).",
      rules: ["Who + V; Which + S/V; Whose + Noun"],
      example: "The engineer who designed the blueprint won an award."
    },
    sampleQuestions: [
      {
        questionNum: "112",
        question: "The architect _______ designed the new tower won an international prize.",
        bilingual: "Kiến trúc sư người mà thiết kế tòa tháp mới đã giành giải thưởng quốc tế.",
        options: ["who", "which", "whose", "where"],
        optionMeanings: ["(người): người mà", "(vật): cái mà", "(sở hữu): của ai", "(nơi chốn): nơi mà"],
        correctIndex: 0,
        explanation: "Chỉ người 'The architect' làm chủ ngữ cho động từ 'designed' -> dùng 'who'.",
        steps: [
          { title: "Bước 1: Xác định danh từ đứng trước", desc: "Architect (kiến trúc sư) -> Người." },
          { title: "Bước 2: Chọn đại từ quan hệ", desc: "Who + Động từ." }
        ],
        vocabList: [{ word: "architect", pos: "n", level: "B2", ipa: "/ˈɑːrkɪtekt/", meaning: "kiến trúc sư" }]
      }
    ]
  },
  {
    id: "g-other-lien-tu-gioi-tu",
    title: "Liên từ & Giới từ",
    category: "grammar",
    subCategory: "other_grammar",
    tag: "Ngữ pháp · Từ nối",
    totalQuestions: 210,
    studiedQuestions: 50,
    correctAnswers: 45,
    wrongAnswers: 5,
    theory: {
      summary: "Phân biệt Liên từ + Mệnh đề (Although, Because) và Giới từ + Cụm danh từ (Despite, Because of).",
      rules: ["Although / Because + Clause (S + V)", "Despite / Because of + Noun / V-ing"],
      example: "Despite the rainy weather, the outdoor ceremony continued as planned."
    },
    sampleQuestions: [
      {
        questionNum: "114",
        question: "_______ the heavy traffic, Mr. Kim arrived on time for the interview.",
        bilingual: "Mặc dù giao thông đông đúc, Ông Kim vẫn đến đúng giờ cho buổi phỏng vấn.",
        options: ["Despite", "Although", "Even though", "Because"],
        optionMeanings: ["(prep): mặc dù", "(conj): mặc dù", "(conj): mặc dù", "(conj): bởi vì"],
        correctIndex: 0,
        explanation: "Sau chỗ trống là cụm danh từ 'the heavy traffic' nên dùng giới từ 'Despite'.",
        steps: [
          { title: "Bước 1: Phân tích vế sau chỗ trống", desc: "'The heavy traffic' là Cụm danh từ (không có V chính)." },
          { title: "Bước 2: Chọn giới từ chỉ sự nhượng bộ", desc: "Despite + Noun Phrase." }
        ],
        vocabList: [{ word: "traffic", pos: "n", level: "A2", ipa: "/ˈtræfɪk/", meaning: "giao thông" }]
      }
    ]
  },
  {
    id: "g-other-dieu-kien-dao-ngu",
    title: "Câu điều kiện & Đảo ngữ",
    category: "grammar",
    subCategory: "other_grammar",
    tag: "Ngữ pháp · Nâng cao",
    totalQuestions: 152,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "Câu điều kiện loại 1, 2, 3 và dạng đảo ngữ (Should S V, Were S to V, Had S V3).",
      rules: ["Should you need assistance = If you need assistance", "Had we known = If we had known"],
      example: "Should you require further information, please contact customer support."
    },
    sampleQuestions: [
      {
        questionNum: "116",
        question: "_______ you require additional copies of the report, please inform the secretary.",
        bilingual: "Nếu quý vị cần thêm bản sao của báo cáo, xin vui lòng thông báo cho thư ký.",
        options: ["Should", "Were", "Had", "Unless"],
        optionMeanings: ["(đảo ngữ If 1): Nếu", "(đảo ngữ If 2): Nếu", "(đảo ngữ If 3): Nếu", "(conj): Trừ khi"],
        correctIndex: 0,
        explanation: "Đảo ngữ câu điều kiện loại 1: Should + S + V-bare.",
        steps: [
          { title: "Bước 1: Nhận diện động từ require", desc: "Require là V-bare." },
          { title: "Bước 2: Chọn Should", desc: "Should + S + V-bare." }
        ],
        vocabList: [{ word: "secretary", pos: "n", level: "B1", ipa: "/ˈsekrəteri/", meaning: "thư ký" }]
      }
    ]
  },
  {
    id: "g-other-so-sanh",
    title: "So sánh Hơn & So sánh Nhất",
    category: "grammar",
    subCategory: "other_grammar",
    tag: "Ngữ pháp · So sánh",
    totalQuestions: 150,
    studiedQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    theory: {
      summary: "So sánh hơn (adj-er than / more adj than) và So sánh nhất (the adj-est / the most adj).",
      rules: ["Comparative: -er / more... than", "Superlative: the -est / the most..."],
      example: "This software is more efficient than the previous version."
    },
    sampleQuestions: [
      {
        questionNum: "117",
        question: "This model is significantly _______ than the previous edition.",
        bilingual: "Mô hình này hiệu quả hơn đáng kể so với phiên bản trước.",
        options: ["more efficient", "most efficient", "efficiently", "efficiency"],
        optionMeanings: ["(so sánh hơn): hiệu quả hơn", "(so sánh nhất): hiệu quả nhất", "(adv): một cách hiệu quả", "(n): sự hiệu quả"],
        correctIndex: 0,
        explanation: "Có từ 'than' đi sau -> So sánh hơn 'more efficient'.",
        steps: [
          { title: "Bước 1: Tìm từ nhận biết", desc: "Từ 'than' phía sau." },
          { title: "Bước 2: Chọn dạng so sánh hơn", desc: "More efficient than." }
        ],
        vocabList: [{ word: "efficient", pos: "adj", level: "B2", ipa: "/ɪˈfɪʃnt/", meaning: "hiệu quả" }]
      }
    ]
  },

  // --- PART 5: LUYỆN THEO CHỦ ĐIỂM ---
  {
    id: "p5-topic-tu-loai",
    title: "Chủ điểm Từ loại & Vị trí từ",
    category: "part5",
    subCategory: "by_topic",
    tag: "Part 5 · Từ loại",
    totalQuestions: 210,
    studiedQuestions: 40,
    correctAnswers: 38,
    wrongAnswers: 2,
    sampleQuestions: [
      {
        questionNum: "101",
        question: "The director praised the team for their _______ contribution to the project.",
        bilingual: "Giám đốc đã khen ngợi nhóm vì sự đóng góp vượt trội của họ cho dự án.",
        options: ["outstanding", "outstand", "outstandings", "outstandingly"],
        optionMeanings: ["(adj): xuất sắc", "(v): nổi bật", "(n-plural): sự xuất sắc", "(adv): một cách xuất sắc"],
        correctIndex: 0,
        explanation: "Trước danh từ 'contribution' cần tính từ 'outstanding'.",
        steps: [
          { title: "Bước 1: Xác định cấu trúc", desc: "Tính từ sở hữu 'their' + [Tính từ] + Danh từ 'contribution'." },
          { title: "Bước 2: Chọn đáp án", desc: "Outstanding (adj)." }
        ],
        vocabList: [{ word: "contribution", pos: "n", level: "B2", ipa: "/ˌkɑːntrɪˈbjuːʃn/", meaning: "sự đóng góp" }]
      }
    ]
  },
  {
    id: "p5-topic-thi-dong-tu",
    title: "Chủ điểm Thì & Bị động",
    category: "part5",
    subCategory: "by_topic",
    tag: "Part 5 · Động từ",
    totalQuestions: 180,
    studiedQuestions: 15,
    correctAnswers: 14,
    wrongAnswers: 1,
    sampleQuestions: [
      {
        questionNum: "102",
        question: "The new policy _______ by the board at yesterday's meeting.",
        bilingual: "Chính sách mới đã được phê duyệt bởi hội đồng quản trị tại cuộc họp ngày hôm qua.",
        options: ["was approved", "approved", "approves", "will approve"],
        optionMeanings: ["(bị động QK): đã được phê duyệt", "(v-ed): đã phê duyệt", "(v-s): phê duyệt", "(TL): sẽ phê duyệt"],
        correctIndex: 0,
        explanation: "Dạng bị động quá khứ Was approved.",
        steps: [
          { title: "Bước 1: Dấu hiệu yesterday", desc: "Quá khứ đơn bị động: Was/Were + V3." },
          { title: "Bước 2: Chọn đáp án", desc: "Was approved." }
        ],
        vocabList: [{ word: "policy", pos: "n", level: "B1", ipa: "/ˈpɑːləsi/", meaning: "chính sách" }]
      }
    ]
  },

  // --- PART 6: LUYỆN THEO DẠNG VĂN BẢN ---
  {
    id: "p6-topic-email",
    title: "Thư điện tử (Email / Letter)",
    category: "part6",
    subCategory: "text_types",
    tag: "Part 6 · Email",
    totalQuestions: 140,
    studiedQuestions: 22,
    correctAnswers: 20,
    wrongAnswers: 2,
    passageText: "Subject: Important Update Regarding Flight Schedule\nDear Passenger,\nWe wish to inform you of a revised departure time for your upcoming trip.",
    sampleQuestions: [
      {
        questionNum: "132",
        question: "Please check your flight status online _______ heading to the airport.",
        bilingual: "Vui lòng kiểm tra trạng thái chuyến bay trực tuyến trước khi di chuyển đến sân bay.",
        options: ["before", "after", "while", "during"],
        optionMeanings: ["(prep): trước khi", "(prep): sau khi", "(conj): trong khi", "(prep): trong"],
        correctIndex: 0,
        explanation: "Before heading to the airport (trước khi đến sân bay).",
        steps: [
          { title: "Bước 1: Nhận diện vị trí", desc: "Before + V-ing." },
          { title: "Bước 2: Chọn đáp án", desc: "Before." }
        ],
        vocabList: [{ word: "departure", pos: "n", level: "B1", ipa: "/dɪˈpɑːrtʃər/", meaning: "sự khởi hành" }]
      }
    ]
  },
  {
    id: "p6-topic-memo",
    title: "Thông báo & Ghi nhớ (Notice / Memo)",
    category: "part6",
    subCategory: "text_types",
    tag: "Part 6 · Memo",
    totalQuestions: 120,
    studiedQuestions: 10,
    correctAnswers: 9,
    wrongAnswers: 1,
    passageText: "INTERNAL MEMO\nAll staff members are reminded to power off workstations at the end of each working day.",
    sampleQuestions: [
      {
        questionNum: "136",
        question: "This practice helps reduce overall energy _______ in the office building.",
        bilingual: "Thói quen này giúp giảm mức tiêu thụ năng lượng tổng thể trong tòa nhà văn phòng.",
        options: ["consumption", "consume", "consumer", "consumable"],
        optionMeanings: ["(n): sự tiêu thụ", "(v): tiêu thụ", "(n): người tiêu dùng", "(adj): có thể tiêu thụ"],
        correctIndex: 0,
        explanation: "Cụm danh từ 'energy consumption' (sự tiêu thụ năng lượng).",
        steps: [
          { title: "Bước 1: Ghép cụm danh từ", desc: "Energy + Noun (consumption)." },
          { title: "Bước 2: Chọn đáp án", desc: "Consumption." }
        ],
        vocabList: [{ word: "consumption", pos: "n", level: "B2", ipa: "/kənˈsʌmpʃn/", meaning: "sự tiêu thụ" }]
      }
    ]
  },

  // --- PART 7: LUYỆN THEO CẤU TRÚC BÀI ĐỌC ---
  {
    id: "p7-topic-single-email",
    title: "Đoạn đơn - Thư từ & Email",
    category: "part7",
    subCategory: "by_topic",
    tag: "Part 7 · Single Passage",
    totalQuestions: 160,
    studiedQuestions: 30,
    correctAnswers: 28,
    wrongAnswers: 2,
    passageText: "EMAIL CORRESPONDENCE\nDear Client,\nThank you for reaching out to Apex Customer Care.",
    sampleQuestions: [
      {
        questionNum: "150",
        question: "What is the main topic of the email?",
        bilingual: "Chủ đề chính của email là gì?",
        options: [
          "Customer service assistance",
          "Job opportunity details",
          "Product return guidelines",
          "Store opening hours"
        ],
        optionMeanings: [
          "Hỗ trợ dịch vụ khách hàng",
          "Chi tiết cơ hội việc làm",
          "Hướng dẫn trả lại sản phẩm",
          "Giờ mở cửa cửa hàng"
        ],
        correctIndex: 0,
        explanation: "Apex Customer Care -> Dịch vụ khách hàng.",
        steps: [
          { title: "Bước 1: Nối từ khóa", desc: "Customer Care = Customer service assistance." },
          { title: "Bước 2: Chọn đáp án", desc: "Chọn (A)." }
        ],
        vocabList: [{ word: "assistance", pos: "n", level: "B2", ipa: "/əˈsɪstəns/", meaning: "sự hỗ trợ" }]
      }
    ]
  },
  // --- PART 5 LEVELS ---
  {
    id: "p5-level-2",
    title: "Lv.2 200–500",
    category: "part5",
    subCategory: "levels",
    tag: "Part 5 · Sơ cấp",
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
    id: "p5-level-3",
    title: "Lv.3 500–750",
    category: "part5",
    subCategory: "levels",
    tag: "Part 5 · Trung cấp",
    totalQuestions: 185,
    studiedQuestions: 45,
    correctAnswers: 40,
    wrongAnswers: 5,
    sampleQuestions: [
      {
        questionNum: "115",
        question: "Employees are expected to adhere strictly to safety protocols, _______ circumstances.",
        bilingual: "Nhân viên được yêu cầu tuân thủ nghiêm ngặt các quy tắc an toàn, bất kể hoàn cảnh nào.",
        options: ["regardless of", "according to", "in spite", "due to"],
        optionMeanings: ["(prep): bất kể", "(prep): theo như", "(n): mặc dù (thiếu of)", "(prep): bởi vì"],
        correctIndex: 0,
        explanation: "Giới từ 'regardless of' đi với danh từ 'circumstances' mang nghĩa 'bất kể hoàn cảnh'.",
        steps: [
          { title: "Bước 1: Xét nghĩa giới từ", desc: "Cụm 'regardless of' + Noun có nghĩa là bất chấp/bất kể." },
          { title: "Bước 2: Chọn đáp án", desc: "Chọn (A) regardless of." }
        ],
        vocabList: [
          { word: "adhere", pos: "v", level: "C1", ipa: "/ədˈhɪr/", meaning: "tuân thủ" },
          { word: "circumstance", pos: "n", level: "B2", ipa: "/ˈsɜːrkəmstæns/", meaning: "hoàn cảnh" }
        ]
      }
    ]
  },
  {
    id: "p5-level-4",
    title: "Lv.4 750–990",
    category: "part5",
    subCategory: "levels",
    tag: "Part 5 · Cao cấp",
    totalQuestions: 140,
    studiedQuestions: 10,
    correctAnswers: 8,
    wrongAnswers: 2,
    sampleQuestions: [
      {
        questionNum: "128",
        question: "Had the committee _______ the market trend sooner, the investment strategy would have succeeded.",
        bilingual: "Nếu ủy ban nhận ra xu hướng thị trường sớm hơn, chiến lược đầu tư đã thành công.",
        options: ["anticipated", "anticipate", "anticipating", "anticipation"],
        optionMeanings: ["(v3): nhận ra / dự đoán", "(v): dự đoán", "(v-ing): việc dự đoán", "(n): sự dự đoán"],
        correctIndex: 0,
        explanation: "Đảo ngữ câu điều kiện loại 3: Had + S + V3/ed.",
        steps: [
          { title: "Bước 1: Nhận diện đảo ngữ loại 3", desc: "Had + S + V3/ed." },
          { title: "Bước 2: Chọn đáp án", desc: "Chọn (A) anticipated." }
        ],
        vocabList: [
          { word: "anticipate", pos: "v", level: "C1", ipa: "/ænˈtɪsɪpeɪt/", meaning: "dự đoán, nhận ra trước" }
        ]
      }
    ]
  },

  // --- PART 6 LEVELS ---
  {
    id: "p6-level-1",
    title: "Lv.1 Dưới 200",
    category: "part6",
    subCategory: "levels",
    tag: "Part 6 · Nhập môn",
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
    id: "p6-level-2",
    title: "Lv.2 200–500",
    category: "part6",
    subCategory: "levels",
    tag: "Part 6 · Sơ cấp",
    totalQuestions: 155,
    studiedQuestions: 42,
    correctAnswers: 38,
    wrongAnswers: 4,
    passageText: "MEMORANDUM\nTo: All Staff\nFrom: Operations Manager\n\nPlease ensure all client files are archived properly by 5:00 PM today.",
    sampleQuestions: [
      {
        questionNum: "135",
        question: "All employees must submit their reports ______ Friday at noon.",
        bilingual: "Tất cả nhân viên phải nộp báo cáo trước trưa thứ Sáu.",
        options: ["before", "after", "during", "until"],
        optionMeanings: ["(prep): trước", "(prep): sau", "(prep): trong khi", "(prep): cho đến khi"],
        correctIndex: 0,
        explanation: "Báo cáo nộp 'before' (trước) deadline.",
        steps: [
          { title: "Bước 1: Nhận biết nghĩa mốc thời gian", desc: "Nộp trước thời hạn." },
          { title: "Bước 2: Chọn đáp án", desc: "Chọn (A) before." }
        ],
        vocabList: [
          { word: "submit", pos: "v", level: "B1", ipa: "/səbˈmɪt/", meaning: "nộp" }
        ]
      }
    ]
  },
  {
    id: "p6-level-3",
    title: "Lv.3 500–750",
    category: "part6",
    subCategory: "levels",
    tag: "Part 6 · Trung cấp",
    totalQuestions: 175,
    studiedQuestions: 20,
    correctAnswers: 17,
    wrongAnswers: 3,
    passageText: "PRESS RELEASE\nTechCorp Innovations announced today the upcoming launch of its flagship cloud computing framework.",
    sampleQuestions: [
      {
        questionNum: "139",
        question: "The software update will significantly _______ system performance.",
        bilingual: "Bản cập nhật phần mềm sẽ cải thiện đáng kể hiệu suất hệ thống.",
        options: ["enhance", "enhancement", "enhanced", "enhancing"],
        optionMeanings: ["(v): cải thiện", "(n): sự cải thiện", "(v-ed): đã cải thiện", "(v-ing): việc cải thiện"],
        correctIndex: 0,
        explanation: "Sau động từ khuyết thiếu 'will' + Trạng từ 'significantly' cần Động từ nguyên thể ('enhance').",
        steps: [
          { title: "Bước 1: Xác định cấu trúc", desc: "Will + [Trạng từ] + V-bare." },
          { title: "Bước 2: Chọn đáp án", desc: "Enhance (v-bare)." }
        ],
        vocabList: [
          { word: "enhance", pos: "v", level: "B2", ipa: "/ɪnˈhæns/", meaning: "cải thiện, nâng cao" }
        ]
      }
    ]
  },
  {
    id: "p6-level-4",
    title: "Lv.4 750–990",
    category: "part6",
    subCategory: "levels",
    tag: "Part 6 · Cao cấp",
    totalQuestions: 130,
    studiedQuestions: 5,
    correctAnswers: 4,
    wrongAnswers: 1,
    passageText: "FINANCIAL REPORT EXCERPT\nDespite macroeconomic headwinds, quarterly revenues surpassed market expectations due to accelerated growth in overseas markets.",
    sampleQuestions: [
      {
        questionNum: "143",
        question: "________, overseas sales grew by 25% year-over-year.",
        bilingual: "Cụ thể hơn, doanh số bán hàng ở nước ngoài đã tăng 25% so với cùng kỳ năm ngoái.",
        options: ["Specifically", "Consequently", "However", "Otherwise"],
        optionMeanings: ["(adv): Cụ thể hơn", "(adv): Do đó", "(adv): Tuy nhiên", "(adv): Nếu không thì"],
        correctIndex: 0,
        explanation: "Trạng từ liên kết 'Specifically' giới thiệu chi tiết minh họa cho câu trước.",
        steps: [
          { title: "Bước 1: Phân tích mối quan hệ 2 câu", desc: "Câu trước nói về doanh thu vượt mong đợi, câu sau nêu số liệu chi tiết 25%." },
          { title: "Bước 2: Chọn từ nối", desc: "Chọn Specifically." }
        ],
        vocabList: [
          { word: "specifically", pos: "adv", level: "B2", ipa: "/spəˈsɪfɪkli/", meaning: "cụ thể hơn" }
        ]
      }
    ]
  },

  // --- PART 7 LEVELS ---
  {
    id: "p7-level-1",
    title: "Lv.1 Dưới 200",
    category: "part7",
    subCategory: "levels",
    tag: "Part 7 · Nhập môn",
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
  },
  {
    id: "p7-level-2",
    title: "Lv.2 200–500",
    category: "part7",
    subCategory: "levels",
    tag: "Part 7 · Sơ cấp",
    totalQuestions: 185,
    studiedQuestions: 35,
    correctAnswers: 30,
    wrongAnswers: 5,
    passageText: "EMAIL CORRESPONDENCE\nDear Ms. Henderson,\nWe are pleased to confirm your reservation for Room 402 on November 12. Attached is the catering menu for your review.",
    sampleQuestions: [
      {
        questionNum: "152",
        question: "What is the purpose of the email?",
        bilingual: "Mục đích của email là gì?",
        options: [
          "To confirm a room reservation",
          "To cancel a business meeting",
          "To request an invoice payment",
          "To submit a job application"
        ],
        optionMeanings: [
          "Đồng ý xác nhận đặt phòng",
          "Hủy bỏ cuộc họp kinh doanh",
          "Yêu cầu thanh toán hóa đơn",
          "Nộp đơn xin việc"
        ],
        correctIndex: 0,
        explanation: "Email nêu rõ 'confirm your reservation for Room 402'.",
        steps: [
          { title: "Bước 1: Skim câu đầu email", desc: "Confirm your reservation." },
          { title: "Bước 2: Chọn đáp án", desc: "Chọn (A)." }
        ],
        vocabList: [
          { word: "reservation", pos: "n", level: "B1", ipa: "/ˌrezərˈveɪʃn/", meaning: "sự đặt chỗ trước" }
        ]
      }
    ]
  },
  {
    id: "p7-level-3",
    title: "Lv.3 500–750",
    category: "part7",
    subCategory: "levels",
    tag: "Part 7 · Trung cấp",
    totalQuestions: 210,
    studiedQuestions: 15,
    correctAnswers: 13,
    wrongAnswers: 2,
    passageText: "DOUBLE PASSAGE SET\nPassage 1: Schedule of Events for Annual Tech Expo.\nPassage 2: Email request for speaker slot change.",
    sampleQuestions: [
      {
        questionNum: "165",
        question: "What time is Mr. Vance scheduled to speak according to the updated schedule?",
        bilingual: "Theo lịch trình cập nhật, Ông Vance dự kiến phát biểu lúc mấy giờ?",
        options: ["2:00 PM", "10:00 AM", "4:30 PM", "9:00 AM"],
        optionMeanings: ["2:00 chiều", "10:00 sáng", "4:30 chiều", "9:00 sáng"],
        correctIndex: 0,
        explanation: "Đối chiếu đoạn 1 và đoạn 2 để suy ra thời gian phát biểu 2:00 PM.",
        steps: [
          { title: "Bước 1: Tìm thông tin Mr. Vance", desc: "Mr. Vance yêu cầu đổi ca chiều." },
          { title: "Bước 2: Chọn đáp án", desc: "2:00 PM." }
        ],
        vocabList: [
          { word: "schedule", pos: "n", level: "B1", ipa: "/ˈske dʒuːl/", meaning: "lịch trình" }
        ]
      }
    ]
  },
  {
    id: "p7-level-4",
    title: "Lv.4 750–990",
    category: "part7",
    subCategory: "levels",
    tag: "Part 7 · Cao cấp",
    totalQuestions: 160,
    studiedQuestions: 8,
    correctAnswers: 6,
    wrongAnswers: 2,
    passageText: "TRIPLE PASSAGE SET\nPassage 1: Press Release regarding corporate merger.\nPassage 2: Internal Memo to department heads.\nPassage 3: Customer feedback survey responses.",
    sampleQuestions: [
      {
        questionNum: "180",
        question: "What implied challenge did the company overcome in Q3?",
        bilingual: "Thách thức ngầm nào mà công ty đã vượt qua trong Quý 3?",
        options: [
          "Supply chain delays",
          "Higher tax rates",
          "Employee turnover",
          "Decreased budget"
        ],
        optionMeanings: [
          "Sự chậm trễ chuỗi cung ứng",
          "Thuế suất cao hơn",
          "Tỷ lệ biến động nhân sự",
          "Ngân sách bị giảm"
        ],
        correctIndex: 0,
        explanation: "Kết hợp dữ liệu từ 3 đoạn văn suy ra sự cố chuỗi cung ứng đã được xử lý thành công.",
        steps: [
          { title: "Bước 1: Phân tích cả 3 đoạn văn", desc: "Đoạn 1 nêu thiếu nguyên liệu, đoạn 3 báo cáo đơn hàng đã hoàn tất." },
          { title: "Bước 2: Chọn đáp án", desc: "Supply chain delays." }
        ],
        vocabList: [
          { word: "overcome", pos: "v", level: "B2", ipa: "/ˌoʊvərˈkʌm/", meaning: "vượt qua" }
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
  const [showExplanation, setShowExplanation] = useState(true);
  const [showVocab, setShowVocab] = useState(true);
  const [isVocabCollapsed, setIsVocabCollapsed] = useState(false);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({});

  // Modals inside Practice Workspace
  const [showAnnotatorModal, setShowAnnotatorModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState<string>("Sai đáp án");
  const [reportText, setReportText] = useState("");
  const [showWordBasketModal, setShowWordBasketModal] = useState(false);
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [dictQuery, setDictQuery] = useState("");
  const [dictResult, setDictResult] = useState<{ word: string; meaning: string; ipa: string } | null>(null);
  const [showQuestionGridModal, setShowQuestionGridModal] = useState(false);

  // Text Selection Lookup Tooltip State
  const [selectedTextTooltip, setSelectedTextTooltip] = useState<{
    text: string;
    x: number;
    y: number;
    meaning: string;
    ipa: string;
    pos: string;
    rootWord: string;
    altMeanings: { pos: string; meaning: string; synonyms: string }[];
    isFlipped?: boolean;
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (selectedTextTooltip && !target.closest(".selection-tooltip-popup")) {
        setSelectedTextTooltip(null);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [selectedTextTooltip]);

  const handleMouseUpSelection = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("textarea")) {
      return;
    }

    const selection = window.getSelection();
    if (!selection) return;

    const text = selection.toString().trim();
    if (!text || text.length === 0 || text.length > 120) {
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width === 0 && rect.height === 0) return;

      const cleanWord = text.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, "");

      interface DictEntry {
        meaning: string;
        ipa: string;
        pos: string;
        rootWord: string;
        altMeanings: { pos: string; meaning: string; synonyms: string }[];
      }

      const dictMap: Record<string, DictEntry> = {
        garments: {
          meaning: "hàng may mặc, trang phục",
          ipa: "/'ɡɑːrmənts/",
          pos: "n-plural",
          rootWord: "garment",
          altMeanings: [
            { pos: "v", meaning: "quần áo, y phục", synonyms: "clothing, apparel" },
            { pos: "v", meaning: "trang phục thiết kế", synonyms: "garment, attire" },
            { pos: "v", meaning: "bộ trang phục chính thức", synonyms: "outfit, costume" }
          ]
        },
        enjoys: {
          meaning: "thích thú, thưởng thức",
          ipa: "/ɪnˈdʒɔɪz/",
          pos: "verb",
          rootWord: "enjoy",
          altMeanings: [
            { pos: "v", meaning: "hưởng thụ", synonyms: "enjoy" },
            { pos: "v", meaning: "thích thú", synonyms: "enjoy" },
            { pos: "v", meaning: "thưởng thức", synonyms: "enjoy, taste, relish" },
            { pos: "v", meaning: "vui thích", synonyms: "enjoy, rejoice, enrapture" }
          ]
        },
        praised: {
          meaning: "khen ngợi, tán dương, đánh giá cao",
          ipa: "/preɪzd/",
          pos: "verb",
          rootWord: "praise",
          altMeanings: [
            { pos: "v", meaning: "tán thưởng", synonyms: "commend, applaud" },
            { pos: "v", meaning: "ca ngợi", synonyms: "glorify, extol" },
            { pos: "n", meaning: "lời khen ngợi", synonyms: "compliment, tribute" }
          ]
        },
        film: {
          meaning: "bộ phim, tác phẩm điện ảnh",
          ipa: "/fɪlm/",
          pos: "noun",
          rootWord: "film",
          altMeanings: [
            { pos: "n", meaning: "phim ảnh", synonyms: "movie, cinema" },
            { pos: "v", meaning: "quay phim", synonyms: "shoot, record" }
          ]
        },
        disliked: {
          meaning: "không thích, không ưa",
          ipa: "/dɪsˈlaɪkt/",
          pos: "verb",
          rootWord: "dislike",
          altMeanings: [
            { pos: "v", meaning: "ghét, không vừa ý", synonyms: "hate, detest" },
            { pos: "n", meaning: "sự không thích", synonyms: "disinclination, aversion" }
          ]
        },
        aesthetic: {
          meaning: "thẩm mỹ, có tính nghệ thuật",
          ipa: "/esˈθetɪk/",
          pos: "adjective",
          rootWord: "aesthetic",
          altMeanings: [
            { pos: "adj", meaning: "thuộc về mỹ học", synonyms: "artistic, tasteful" },
            { pos: "n", meaning: "phong cách thẩm mỹ", synonyms: "style, beauty" }
          ]
        },
        personally: {
          meaning: "đích thân, về mặt cá nhân",
          ipa: "/ˈpɜːrsənəli/",
          pos: "adverb",
          rootWord: "personal",
          altMeanings: [
            { pos: "adv", meaning: "trực tiếp bản thân", synonyms: "in person, directly" },
            { pos: "adv", meaning: "theo quan điểm cá nhân", synonyms: "for oneself, individually" }
          ]
        },
        production: {
          meaning: "sự sản xuất, việc chế tạo",
          ipa: "/prəˈdʌkʃn/",
          pos: "noun",
          rootWord: "produce",
          altMeanings: [
            { pos: "n", meaning: "sản lượng", synonyms: "output, yield" },
            { pos: "n", meaning: "tác phẩm sản xuất", synonyms: "creation, work" }
          ]
        }
      };

      const entry: DictEntry = dictMap[cleanWord] || {
        meaning: `Giải nghĩa tiếng Việt cho "${text}" trong ngữ cảnh TOEIC.`,
        ipa: `/${cleanWord || "word"}/`,
        pos: text.includes(" ") ? "cụm từ" : "verb",
        rootWord: cleanWord || text,
        altMeanings: [
          { pos: "v", meaning: `hưởng thụ, sử dụng "${cleanWord}"`, synonyms: `${cleanWord}` },
          { pos: "v", meaning: `thích thú với "${cleanWord}"`, synonyms: `${cleanWord}, enjoy` },
          { pos: "v", meaning: `thưởng thức "${cleanWord}"`, synonyms: `${cleanWord}, relish` }
        ]
      };

      const tooltipWidth = 380;
      const tooltipHeight = 460;
      const calcX = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 20, rect.left + rect.width / 2 - tooltipWidth / 2));
      const calcY = rect.top - tooltipHeight - 10 > 10
        ? rect.top - tooltipHeight - 10
        : Math.min(window.innerHeight - tooltipHeight - 20, rect.bottom + 10);

      setSelectedTextTooltip({
        text: text,
        x: calcX,
        y: calcY,
        meaning: entry.meaning,
        ipa: entry.ipa,
        pos: entry.pos,
        rootWord: entry.rootWord,
        altMeanings: entry.altMeanings,
        isFlipped: false
      });
    } catch {
      // Ignore selection error
    }
  };

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
      showToast(`Hoàn thành bài luyện tập! Đúng: ${sessionCorrectCount} | Sai: ${sessionWrongCount} câu 🎉`);
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
      <div
        onMouseUp={handleMouseUpSelection}
        className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-screen overflow-hidden font-sans text-slate-900 animate-in fade-in duration-150"
      >
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
              {isQuestionGridOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Grid className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-slate-900">Danh sách toàn bộ câu hỏi</h3>
                          <p className="text-xs text-slate-500">
                            Đã làm {Object.keys(practiceChecked).length}/{filteredPracticeQuestions.length} câu
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

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 py-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Đúng
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Sai
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Đang xem
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" /> Chưa làm
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto grid grid-cols-5 sm:grid-cols-8 gap-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                      {filteredPracticeQuestions.map((q, idx) => {
                        const isCurrent = idx === practiceCurrentQIndex;
                        const isCheckedQ = !!practiceChecked[q.id];
                        const userAns = practiceAnswers[q.id];
                        const isRight = userAns === q.correctAnswer;

                        let qBtnStyle = "bg-white border-slate-200 text-slate-700 hover:border-blue-400";
                        if (isCurrent) {
                          qBtnStyle = "bg-blue-600 text-white font-extrabold border-blue-600 ring-2 ring-blue-300";
                        } else if (isCheckedQ) {
                          if (isRight) qBtnStyle = "bg-emerald-500 text-white font-bold border-emerald-500";
                          else qBtnStyle = "bg-rose-500 text-white font-bold border-rose-500";
                        }

                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => {
                              setPracticeCurrentQIndex(idx);
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
              )}

              {/* --- MAIN DUAL PANE PRACTICE AREA --- */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
          {/* LEFT PANE: INSTRUCTION & PASSAGE CONTENT */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-[#fafafa] border-r border-slate-200/80 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Yêu cầu bài tập (Instruction)
              </div>
              <h2 className="text-sm font-bold text-slate-800 leading-relaxed">
                {(() => {
                  const cat = activePracticeCard.category || activeMainTab;
                  if (cat === "part5") return "Select the best answer to complete the sentence.";
                  if (cat === "part6") return "Read the text and choose the best word or phrase for each blank.";
                  if (cat === "part7") return "Read the passage(s) and choose the best answer for each question.";
                  return "Select the best answer to complete the sentence.";
                })()}
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
                          {meaning && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mt-1 pl-0.5">
                              <span className="text-blue-500 font-bold text-xs">|</span>
                              <span>{meaning}</span>
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
                      <div className="mt-2 p-4 sm:p-5 rounded-2xl bg-[#fffdf5] border border-amber-200/90 space-y-4 animate-in fade-in duration-150">
                        {/* Top Controls Row */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-500">{q.vocabList.length} từ</span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setIsVocabCollapsed(!isVocabCollapsed)}
                              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                              <span>{isVocabCollapsed ? "⬪ Mở rộng" : "⬪ Thu gọn"}</span>
                            </button>

                            {q.vocabList.every((v) => savedWords.includes(v.word)) ? (
                              <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-xl bg-blue-400 text-white font-bold text-xs shadow-2xs">
                                ✓ Đã thêm hết
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddAllWords(q.vocabList)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer"
                              >
                                + Thêm tất cả ({q.vocabList.length})
                              </button>
                            )}
                          </div>
                        </div>

                        {/* List of Detailed Vocab Cards */}
                        {!isVocabCollapsed && (
                          <div className="space-y-4">
                            {q.vocabList.map((vItem, vIdx) => {
                              const isAdded = savedWords.includes(vItem.word);
                              const example = vItem.example || {
                                en: `Her supervisor ${vItem.word} asks her to make materials for presentations.`,
                                vi: `Cấp trên của cô ấy ${vItem.meaning.toLowerCase()} nhờ cô làm tài liệu cho các bài thuyết trình.`
                              };
                              const collocations = vItem.collocations || [
                                { en: `be updated ${vItem.word}`, vi: "được cập nhật thường xuyên" },
                                { en: `${vItem.word} asked questions`, vi: "các câu hỏi thường gặp" }
                              ];
                              const synonyms = vItem.synonyms || [{ en: "often", vi: "thường" }];
                              const antonyms = vItem.antonyms || [{ en: "rarely", vi: "hiếm khi" }];
                              const wordFamily = vItem.wordFamily || [{ word: "frequent", pos: "adj", meaning: "thường xuyên" }];

                              return (
                                <div
                                  key={vIdx}
                                  className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200/90 space-y-3.5 shadow-2xs hover:border-emerald-400 transition-all"
                                >
                                  {/* Header Row */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                                          {vItem.word}
                                        </span>
                                        <span className="text-xs italic text-slate-500 font-serif">
                                          {vItem.pos}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md bg-blue-100/90 text-blue-700 font-extrabold text-[11px]">
                                          {vItem.level}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                        <span>{vItem.ipa}</span>
                                        <button
                                          type="button"
                                          onClick={() => speakWord(vItem.word)}
                                          className="text-blue-600 hover:text-blue-800 cursor-pointer p-0.5"
                                          title="Phát âm từ vựng"
                                        >
                                          <Volume2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => showToast(`Đã gắn cờ từ "${vItem.word}" để xem lại!`)}
                                        className="p-1 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                                        title="Gắn cờ xem lại"
                                      >
                                        <Flag className="w-4 h-4" />
                                      </button>

                                      {isAdded ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                                          ✓ Đã thêm
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleAddWordToBasket(vItem)}
                                          className="inline-flex items-center gap-1 text-blue-600 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-xl border border-blue-200 cursor-pointer transition-colors"
                                        >
                                          + Thêm
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Primary Vietnamese Meaning */}
                                  <p className="text-sm font-bold text-slate-800">
                                    {vItem.meaning}
                                  </p>

                                  {/* Example Sentence Quote Box */}
                                  <div className="border-l-3 border-blue-400 bg-blue-50/40 p-3.5 rounded-r-2xl space-y-1 text-xs text-slate-700 leading-relaxed font-sans">
                                    <p className="font-medium">
                                      {example.en.split(new RegExp(`(${vItem.word})`, "gi")).map((part, i) => (
                                        part.toLowerCase() === vItem.word.toLowerCase() ? (
                                          <strong key={i} className="text-blue-600 font-bold">
                                            {part}
                                          </strong>
                                        ) : (
                                          part
                                        )
                                      ))}
                                    </p>
                                    <p className="text-slate-500 font-normal">{example.vi}</p>
                                  </div>

                                  {/* CỤM TỪ (Collocations) */}
                                  <div className="space-y-1.5 pt-0.5">
                                    <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider block">
                                      CỤM TỪ
                                    </span>
                                    <div className="space-y-1">
                                      {collocations.map((col, cIdx) => (
                                        <p key={cIdx} className="text-xs text-slate-700 font-medium">
                                          <strong className="text-slate-900 font-bold">{col.en}</strong> — {col.vi}
                                        </p>
                                      ))}
                                    </div>
                                  </div>

                                  {/* ĐỒNG NGHĨA & TRÁI NGHĨA */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                                    <div className="space-y-1">
                                      <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider block">
                                        ĐỒNG NGHĨA
                                      </span>
                                      {synonyms.map((s, sIdx) => (
                                        <p key={sIdx} className="text-xs text-slate-800 font-medium">
                                          <strong className="text-slate-900 font-bold">{s.en}</strong> — {s.vi}
                                        </p>
                                      ))}
                                    </div>

                                    <div className="space-y-1">
                                      <span className="text-[11px] font-extrabold text-rose-500 uppercase tracking-wider block">
                                        TRÁI NGHĨA
                                      </span>
                                      {antonyms.map((a, aIdx) => (
                                        <p key={aIdx} className="text-xs text-slate-800 font-medium">
                                          <strong className="text-slate-900 font-bold">{a.en}</strong> — {a.vi}
                                        </p>
                                      ))}
                                    </div>
                                  </div>

                                  {/* HỌ TỪ */}
                                  <div className="space-y-1 pt-1 border-t border-slate-100">
                                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                                      HỌ TỪ
                                    </span>
                                    {wordFamily.map((wf, wfIdx) => (
                                      <p key={wfIdx} className="text-xs text-slate-800 font-medium">
                                        <strong className="text-slate-900 font-bold">{wf.word}</strong>{" "}
                                        <span className="italic text-slate-500 font-serif mr-1">{wf.pos}</span>
                                        — {wf.meaning}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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

        {/* --- MODAL WORKSPACE: BÁO LỖI CÂU HỎI (EXACT DESIGN MATCH) --- */}
        {showReportModal && (() => {
          const categories = [
            "Sai đáp án",
            "Dịch nghĩa sai",
            "Từ vựng sai",
            "Giải thích chưa rõ",
            "Audio/Image lỗi",
            "Lỗi khác"
          ];
          const textTrimmed = reportText.trim();
          const wordsCount = textTrimmed ? textTrimmed.split(/\s+/).filter(Boolean).length : 0;
          const charCount = textTrimmed.length;
          const isValid = wordsCount >= 3 || charCount >= 3;
          const charsNeeded = Math.max(0, 3 - charCount);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-100 relative font-sans">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                      <span>Báo lỗi câu hỏi</span>
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-slate-500">
                      Giúp chúng tôi cải thiện chất lượng đề thi
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Section 1: Loại lỗi * */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 block">
                    Loại lỗi <span className="text-rose-500">*</span>
                  </label>

                  <div className="space-y-2">
                    {categories.map((cat) => {
                      const isSelected = reportCategory === cat;
                      return (
                        <div
                          key={cat}
                          onClick={() => setReportCategory(cat)}
                          className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer py-1 hover:text-slate-900 transition-colors"
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected ? "border-blue-600 bg-white" : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                          </div>
                          <span>{cat}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Mô tả chi tiết * */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 block">
                    Mô tả chi tiết <span className="text-rose-500">*</span>
                  </label>

                  <textarea
                    rows={3}
                    maxLength={500}
                    placeholder="Mô tả ngắn gọn lỗi bạn gặp (tối thiểu 3 ký tự). VD: đáp án B mới đúng."
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none shadow-2xs"
                  />

                  {/* Validation Message & Word Counter */}
                  <div className="flex items-center justify-between text-xs font-semibold">
                    {!isValid ? (
                      <span className="text-rose-500 font-bold">
                        Cần thêm {charsNeeded} ký tự nữa (tối thiểu 3)
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold">
                        ✓ Đã đủ điều kiện gửi
                      </span>
                    )}

                    <span className="font-mono text-slate-400">
                      {reportText.length}/500
                    </span>
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportModal(false);
                      setReportText("");
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
                  >
                    Hủy
                  </button>

                  <button
                    type="button"
                    disabled={!isValid}
                    onClick={() => {
                      if (!isValid) return;
                      showToast(`Cảm ơn bạn! Đã gửi báo lỗi [${reportCategory}] thành công 🎉`);
                      setReportText("");
                      setShowReportModal(false);
                    }}
                    className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-xs cursor-pointer ${
                      isValid
                        ? "bg-amber-400 hover:bg-amber-500 text-amber-950 active:scale-95"
                        : "bg-amber-200 text-amber-700/60 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    Gửi báo lỗi
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

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
        {/* --- FLOATING TEXT SELECTION DICTIONARY TOOLTIP (IMAGE 2 & 3 STYLE) --- */}
        {selectedTextTooltip && (
          <div
            style={{
              left: `${selectedTextTooltip.x}px`,
              top: `${selectedTextTooltip.y}px`
            }}
            className="fixed z-[100] selection-tooltip-popup bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 max-w-sm w-96 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 select-none p-5 space-y-4 font-sans"
          >
            {/* Header: [word] + "Tra nhanh" pill badge + Close 'X' button */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {selectedTextTooltip.text}
                </h3>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Tra nhanh
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTextTooltip(null)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Search Card Banner */}
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Tra bằng AI để có cụm từ, ví dụ, đồng/trái nghĩa, mẹo TOEIC</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 shrink-0">0/50</span>
            </div>

            {/* Section 1: "Nghĩa trong câu này · {pos}" */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
                <span>Nghĩa trong câu này · {selectedTextTooltip.pos}</span>
              </div>

              {/* Interactive Flashcard Card */}
              <div
                onClick={() => {
                  setSelectedTextTooltip((prev) => prev ? { ...prev, isFlipped: !prev.isFlipped } : null);
                  playSfx("click");
                }}
                className="group relative rounded-2xl border border-blue-200 bg-blue-50/40 p-4 space-y-4 shadow-2xs hover:border-blue-400 transition-all cursor-pointer"
              >
                {/* Card Top Row: Pill Tag "Từ" + "Bấm thẻ để lật" */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-bold text-[11px] shadow-2xs">
                    Từ
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 group-hover:text-blue-600 transition-colors">
                    {selectedTextTooltip.isFlipped ? "Bấm để lật lại 🔄" : "Bấm thẻ để lật 👆"}
                  </span>
                </div>

                {/* Card Center Content */}
                <div className="text-center py-2 space-y-1">
                  {!selectedTextTooltip.isFlipped ? (
                    <>
                      <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {selectedTextTooltip.text}
                      </h4>
                      <p className="text-xs font-serif italic text-slate-500">
                        {selectedTextTooltip.pos}
                      </p>
                    </>
                  ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-150 py-1">
                      <p className="text-lg font-bold text-amber-900">
                        💡 {selectedTextTooltip.meaning}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        {selectedTextTooltip.ipa}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Bottom Actions Row */}
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(selectedTextTooltip.text);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nghe</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddWordToBasket({
                        word: selectedTextTooltip.text,
                        meaning: selectedTextTooltip.meaning,
                      });
                      setSelectedTextTooltip(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm thẻ vào giỏ</span>
                  </button>
                </div>
              </div>

              {/* Base Lemma / Root Word below card */}
              <div className="text-xs font-semibold text-slate-500 pl-1">
                {selectedTextTooltip.rootWord}
              </div>
            </div>

            {/* Section 2: "Nghĩa khác tham khảo" */}
            <div className="space-y-2.5 pt-1">
              <h4 className="text-xs font-bold text-slate-600">Nghĩa khác tham khảo</h4>

              <div className="space-y-2">
                {selectedTextTooltip.altMeanings.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 transition-all"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        <span className="italic text-slate-500 font-serif mr-1">{alt.pos}</span>
                        {alt.meaning}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400">
                        {alt.synonyms}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleAddWordToBasket({
                          word: selectedTextTooltip.text,
                          meaning: `${alt.pos} ${alt.meaning}`,
                        });
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Bottom Action Links */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  showToast("Vui lòng nhập nghĩa riêng bạn muốn lưu!");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Thêm nghĩa riêng</span>
              </button>

              <div
                onClick={() => {
                  showToast(`Đã thêm "${selectedTextTooltip.text}" vào Luyện theo độ khó 📚`);
                  setSelectedTextTooltip(null);
                }}
                className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                <span>Thêm vào Luyện theo độ khó</span>
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
            Ôn ngữ pháp theo điểm chủ và luyện tập Part 5–7 theo 4 cấp độ.
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* MAIN TAB BAR */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl max-w-full overflow-x-auto no-scrollbar shadow-2xs">
        <button
          type="button"
          onClick={() => {
            setActiveMainTab("grammar");
            setActiveSubFilter("all");
          }}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeMainTab === "grammar"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Ngữ pháp
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("part5")}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeMainTab === "part5"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Part 5
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("part6")}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeMainTab === "part6"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Part 6
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("part7")}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeMainTab === "part7"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Part 7
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
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Part 5 theo 4 Cấp độ</h2>
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
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Part 6 theo Cấp độ</h2>
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
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Part 7 theo Cấp độ</h2>
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
                    <option value="part5">Part 5</option>
                    <option value="part6">Part 6</option>
                    <option value="part7">Part 7</option>
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
