import { ExerciseCardData } from "./types";

export const INITIAL_CARDS: ExerciseCardData[] = [
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
            desc: 'Bốn đáp án cùng gốc "produc-" nhưng khác hậu tố nên đây là câu từ loại, cần xét vị trí rồi xét nghĩa.'
          },
          {
            title: "Bước 2: Phân tích câu để biết chỗ trống cần gì",
            desc: 'Xét vị trí: chỗ trống đứng đầu câu, trước cụm giới từ "of the garments" và động từ "will begin", nên cần danh từ làm chủ ngữ.'
          },
          {
            title: "Bước 3: Chọn đáp án",
            desc: 'Chọn danh từ "Production" (việc sản xuất).'
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

  // --- NGỮ PHÁP KHÁC ---
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
