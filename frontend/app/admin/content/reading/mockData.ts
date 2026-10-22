import { ExerciseCardData } from "./types";
import {
  ETS_2024_PART5_TEST_CARDS,
  ETS_2024_PART5_LEVEL_CARDS,
  ETS_2024_PART5_TOPIC_CARDS,
} from "./ets2024Part5Data";
import { ETS2024_PART6_CARDS } from "./ets2024Part6Data";
import { ETS2024_PART7_CARDS } from "./ets2024Part7Data";


import { ETS_2023_READING_CARDS } from "./ets2023ReadingData";
import { ETS_2022_READING_CARDS } from "./ets2022ReadingData";

export const INITIAL_CARDS: ExerciseCardData[] = [
  ...ETS_2023_READING_CARDS,
  ...ETS_2022_READING_CARDS,
  // --- ETS 2024 PART 5 FULL TESTS (10 TESTS · 300 QUESTIONS) ---
  ...ETS_2024_PART5_TEST_CARDS,

  // --- ETS 2024 PART 5 LEVELS (LV.1 TO LV.4) ---
  ...ETS_2024_PART5_LEVEL_CARDS,

  // --- ETS 2024 PART 5 TOPICS ---
  ...ETS_2024_PART5_TOPIC_CARDS,

  // --- ETS 2024 PART 6 COMPLETE OFFICIAL DATA (10 TESTS · 160 QUESTIONS) ---
  ...ETS2024_PART6_CARDS,

  // --- ETS 2024 PART 7 COMPLETE OFFICIAL DATA (10 TESTS · 540 QUESTIONS) ---
  ...ETS2024_PART7_CARDS,

  // --- GRAMMAR & PART 7 UNITS ---
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

  // --- NGỮ PHÁP: ĐỘNG TỪ ---,

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

  // --- NGỮ PHÁP KHÁC ---,

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

  // --- PART 6 & PART 7 TOPICS ---,

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

  // --- PART 6 & PART 7 LEVELS ---,

  {
    id: "mock-p7-level-1",
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
  }
];
