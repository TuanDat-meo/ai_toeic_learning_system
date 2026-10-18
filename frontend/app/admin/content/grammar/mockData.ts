import { GrammarTopicItem } from "./types";

export const INITIAL_GRAMMAR_TOPICS: GrammarTopicItem[] = [
  // --- CHỦ ĐIỂM 1 (MỚI - ETS 2024): ĐẠI TỪ & TÍNH TỪ SỞ HỮU ---
  {
    id: "g-pronouns-2024",
    code: "PRO-2024",
    titleVi: "Đại Từ & Tính Từ Sở Hữu (ETS 2024)",
    titleEn: "Pronouns & Possessive Forms in ETS 2024",
    part: "PART_5",
    targetScore: "350_500",
    status: "PUBLISHED",
    summary: "Nhóm câu hỏi xuất hiện liên tục trong các đề ETS 2024 (chiếm 3-5 câu/đề), kiểm tra chức năng chủ ngữ (S), tân ngữ (O), tính từ sở hữu (Possessive Adj + Noun), đại từ sở hữu và đại từ phản thân.",
    formula: "S + V + O | Tính từ sở hữu (my/your/his/her/its/our/their) + Noun | by + myself/himself/themselves",
    signalWords: ["career experiences", "own", "by oneself", "on one's own", "colleagues", "efforts", "supervisors"],
    traps: [
      "Bẫy chọn đại từ tân ngữ (him/them) thay vì tính từ sở hữu (his/their) khi phía sau chỗ trống có một cụm danh từ (ví dụ: 'spoke about _______ career experiences' -> his).",
      "Bẫy đại từ phản thân: 'by himself = on his own' (tự mình). Đại từ phản thân cũng có thể đứng ngay sau chủ ngữ hoặc cuối câu để nhấn mạnh.",
      "Bẫy nhầm lẫn 'its' (của nó - tính từ sở hữu) với 'it's' (viết tắt của it is / it has).",
      "Đại từ sở hữu (mine, hers, theirs, ours) đứng một mình thay thế cho [Tính từ sở hữu + Danh từ] và KHÔNG đi kèm danh từ phía sau."
    ],
    examples: [
      {
        sentence: "Former Sendai Company CEO Ken Nakata spoke about his career experiences.",
        translation: "Cựu Giám đốc điều hành Công ty Sendai Ken Nakata đã nói về những kinh nghiệm nghề nghiệp của mình.",
        analysis: "Chỗ trống đứng trước cụm danh từ 'career experiences' -> bắt buộc dùng tính từ sở hữu 'his'."
      },
      {
        sentence: "The marketing director prepared the entire annual presentation by herself.",
        translation: "Giám đốc tiếp thị đã tự mình chuẩn bị toàn bộ bài thuyết trình hàng năm.",
        analysis: "'by herself' = tự bản thân cô ấy làm, không cần trợ giúp."
      }
    ],
    questions: [
      {
        id: "pro24-q1",
        part: "PART_5",
        questionText: "Former Sendai Company CEO Ken Nakata spoke about _______ career experiences at the international business conference.",
        options: {
          A: "he",
          B: "his",
          C: "him",
          D: "himself"
        },
        correctAnswer: "B",
        explanation: "Phía sau chỗ trống là cụm danh từ 'career experiences' (các kinh nghiệm nghề nghiệp), đóng vai trò tân ngữ của giới từ 'about'. Do đó, chỗ trống cần một tính từ sở hữu (his) để bổ nghĩa cho danh từ phía sau.",
        trapNote: "Tránh chọn (C) 'him' vì sau giới từ nếu đã có danh từ đi kèm thì bắt buộc phải là tính từ sở hữu chứ không phải đại từ tân ngữ.",
        translation: "Cựu Giám đốc điều hành Công ty Sendai Ken Nakata đã nói về những trải nghiệm nghề nghiệp của mình tại hội nghị kinh doanh quốc tế.",
        difficulty: "EASY"
      },
      {
        id: "pro24-q2",
        part: "PART_5",
        questionText: "Board members reviewed the quarterly expenditure report and compared _______ with the projected annual figures.",
        options: {
          A: "it",
          B: "its",
          C: "itself",
          D: "they"
        },
        correctAnswer: "A",
        explanation: "Động từ 'compared' cần một đại từ tân ngữ thay thế cho danh từ số ít 'the quarterly expenditure report' ở vế trước -> chọn 'it'.",
        trapNote: "Không chọn 'its' vì không có danh từ nào theo sau chỗ trống.",
        translation: "Các thành viên hội đồng quản trị đã xem xét báo cáo chi tiêu hàng quý và so sánh nó với các số liệu dự kiến hàng năm.",
        difficulty: "EASY"
      },
      {
        id: "pro24-q3",
        part: "PART_5",
        questionText: "The lead architect designed the commercial complex almost entirely by _______, earning widespread acclaim.",
        options: {
          A: "he",
          B: "him",
          C: "himself",
          D: "his"
        },
        correctAnswer: "C",
        explanation: "Cụm 'by + reflexive pronoun' (by himself / by herself) mang nghĩa 'tự mình làm'. Chủ ngữ 'The lead architect' (kiến trúc sư trưởng) kết hợp với 'by' -> chọn 'himself'.",
        trapNote: "Ghi nhớ cấu trúc 'by oneself = on one's own'.",
        translation: "Kiến trúc sư trưởng đã thiết kế khu phức hợp thương mại gần như hoàn toàn bởi chính bản thân ông, nhận được sự hoan nghênh rộng rãi.",
        difficulty: "MEDIUM"
      },
      {
        id: "pro24-q4",
        part: "PART_6",
        questionText: "Employees wishing to update _______ direct deposit information must submit form HR-12 before the 25th of this month.",
        options: {
          A: "they",
          B: "them",
          C: "their",
          D: "themselves"
        },
        correctAnswer: "C",
        explanation: "Phía sau chỗ trống là cụm danh từ 'direct deposit information' (thông tin chuyển khoản trực tiếp). Vị trí này cần tính từ sở hữu 'their' bổ nghĩa cho danh từ.",
        trapNote: "Không chọn 'themselves' vì không có giới từ 'by' và phía sau có danh từ.",
        translation: "Những nhân viên muốn cập nhật thông tin chuyển khoản trực tiếp của họ phải nộp mẫu đơn HR-12 trước ngày 25 tháng này.",
        difficulty: "EASY"
      }
    ],
    studiedCount: 4,
    correctCount: 4,
    wrongCount: 0,
    bookmarked: true
  },

  // --- CHỦ ĐIỂM 2 (MỚI - ETS 2024): NHẬN DIỆN VỊ TRÍ TỪ LOẠI ---
  {
    id: "g-word-forms-2024",
    code: "POS-2024",
    titleVi: "Quy Tắc Vị Trí Từ Loại (Danh - Tính - Động - Trạng)",
    titleEn: "Parts of Speech & Word Formation in ETS 2024",
    part: "PART_5",
    targetScore: "350_500",
    status: "PUBLISHED",
    summary: "Dạng bài tập chiếm tỷ trọng lớn nhất Part 5 ETS 2024 (khoảng 8-10 câu/đề). Đòi hỏi nhận diện vị trí chỗ trống trong câu thông qua các thành phần bao quanh mà không cần dịch nghĩa toàn câu.",
    formula: "a/an/the + (Adv) + Adj + Noun | Be/Link Verb + Adj | Verb + Object + Adv | Adv + Verb",
    signalWords: ["completely", "significantly", "promptly", "successful", "efficiently", "proposal", "approval"],
    traps: [
      "Bẫy danh từ có đuôi '-al': proposal (bản đề xuất), approval (sự phê duyệt), representative (người đại diện), arrival (sự đến), renewal (sự gia hạn) là DANH TỪ chứ KHÔNG phải Tính từ.",
      "Bẫy tính từ có đuôi '-ly': friendly (thân thiện), costly (tốn kém), timely (kịp thời), orderly (ngăn nắp) là TÍNH TỪ chứ KHÔNG phải Trạng từ.",
      "Bẫy trạng từ đứng giữa trợ động từ và động từ chính: S + have/has + [ADV] + V3/ed (ví dụ: has successfully completed).",
      "Bẫy đứng trước danh từ: Khi chỗ trống đứng trước một Danh từ, thông thường cần một Tính từ bổ nghĩa, trừ trường hợp danh từ ghép (compound noun)."
    ],
    examples: [
      {
        sentence: "The committee conducted a thorough review of the financial proposal.",
        translation: "Ủy ban đã tiến hành một cuộc đánh giá kỹ lưỡng về bản đề xuất tài chính.",
        analysis: "'a + thorough (Adj) + review (Noun)' và 'proposal' là Danh từ kết thúc bằng đuôi -al."
      },
      {
        sentence: "Flight passengers must respond promptly to the boarding announcement.",
        translation: "Hành khách đi máy bay phải phản hồi nhanh chóng trước thông báo lên máy bay.",
        analysis: "Động từ 'respond' được bổ nghĩa bởi trạng từ 'promptly' (đuôi -ly)."
      }
    ],
    questions: [
      {
        id: "pos24-q1",
        part: "PART_5",
        questionText: "The city council reached a _______ decision regarding the budget allocation for local road repairs.",
        options: {
          A: "unanimous",
          B: "unanimously",
          C: "unanimity",
          D: "unanimousness"
        },
        correctAnswer: "A",
        explanation: "Vị trí giữa mạo từ 'a' và danh từ 'decision' cần một Tính từ (Adj) để bổ nghĩa cho danh từ đó -> chọn 'unanimous' (nhất trí, đồng thuận).",
        trapNote: "Cấu trúc: Mạo từ (a/an/the) + Tính từ + Danh từ.",
        translation: "Hội đồng thành phố đã đạt được một quyết định nhất trí liên quan đến việc phân bổ ngân sách sửa chữa đường bộ địa phương.",
        difficulty: "EASY"
      },
      {
        id: "pos24-q2",
        part: "PART_5",
        questionText: "Technicians worked _______ throughout the evening to restore electrical power to the hospital.",
        options: {
          A: "tireless",
          B: "tirelessly",
          C: "tirelessness",
          D: "tired"
        },
        correctAnswer: "B",
        explanation: "Sau nội động từ 'worked', cần một trạng từ chỉ cách thức (Adverb) để bổ nghĩa cho động từ hành động -> chọn 'tirelessly' (một cách không mệt mỏi).",
        trapNote: "Đuôi '-ly' chỉ trạng từ cách thức bổ nghĩa cho động từ 'worked'.",
        translation: "Các kỹ thuật viên đã làm việc không mệt mỏi suốt buổi tối để khôi phục nguồn điện cho bệnh viện.",
        difficulty: "EASY"
      },
      {
        id: "pos24-q3",
        part: "PART_5",
        questionText: "The executive committee will review the revised funding _______ during tomorrow's scheduled session.",
        options: {
          A: "propose",
          B: "proposal",
          C: "proposing",
          D: "proposed"
        },
        correctAnswer: "B",
        explanation: "Sau cụm 'the revised funding' cần một Danh từ chính đóng vai trò tân ngữ cho ngoại động từ 'review' -> chọn 'proposal' (bản đề xuất).",
        trapNote: "Cẩn thận bẫy đuôi '-al' trong 'proposal' là Danh từ, không phải Tính từ.",
        translation: "Ủy ban điều hành sẽ xem xét bản đề xuất tài trợ đã sửa đổi trong phiên họp dự kiến vào ngày mai.",
        difficulty: "MEDIUM"
      },
      {
        id: "pos24-q4",
        part: "PART_5",
        questionText: "Customer service agents are instructed to handle all inquiries _______ and politely.",
        options: {
          A: "professional",
          B: "professionally",
          C: "profession",
          D: "professionalism"
        },
        correctAnswer: "B",
        explanation: "Liên từ 'and' nối hai từ cùng từ loại. Phía sau 'and' là trạng từ 'politely' (lịch sự), do đó chỗ trống đứng trước cũng bắt buộc phải là một trạng từ -> chọn 'professionally'.",
        trapNote: "Quy tắc song hành (Parallel structure) với liên từ 'and': Adv and Adv.",
        translation: "Các nhân viên chăm sóc khách hàng được hướng dẫn xử lý mọi thắc mắc một cách chuyên nghiệp và lịch sự.",
        difficulty: "EASY"
      }
    ],
    studiedCount: 4,
    correctCount: 4,
    wrongCount: 0,
    bookmarked: true
  },

  // --- CHỦ ĐIỂM 3 (MỚI - ETS 2024): PHÂN TỪ V-ING & V-ED ---
  {
    id: "g-participles-2024",
    code: "PAR-2024",
    titleVi: "Phân Từ V-ing & V-ed Trong ETS 2024",
    titleEn: "Participles (Present & Past) in ETS 2024",
    part: "PART_5",
    targetScore: "500_750",
    status: "PUBLISHED",
    summary: "Điểm ngữ pháp phân loại học viên đạt điểm cao (650+) trong ETS 2024. Phân từ được dùng làm tính từ đứng trước danh từ, hoặc rút gọn mệnh đề trạng ngữ / quan hệ.",
    formula: "V-ing + N (bản chất/chủ động) vs V-ed + N (bị động/kết quả) | V-ing/V-ed..., S + V + O",
    signalWords: ["connecting flight", "demanding client", "damaged goods", "revised budget", "attached document", "existing policy"],
    traps: [
      "Bẫy phân biệt V-ing và V-ed: Nếu danh từ là đối tượng tự thực hiện hành động -> dùng V-ing (e.g. rising costs, existing regulations). Nếu danh từ chịu tác động -> dùng V-ed (e.g. reduced rates, customized solutions).",
      "Bẫy rút gọn mệnh đề trạng ngữ: Xét chủ ngữ của vế chính. Nếu chủ ngữ tự làm hành động -> dùng V-ing đầu câu; nếu chủ ngữ bị tác động -> dùng V-ed đầu câu.",
      "Cụm tính từ phân từ cố định hay gặp trong ETS: 'detailed instructions', 'preferred method', 'leading provider', 'rewarding experience'."
    ],
    examples: [
      {
        sentence: "Passengers taking a connecting flight should proceed directly to Gate 12.",
        translation: "Hành khách đi chuyến bay nối chuyến nên đi thẳng tới Cổng số 12.",
        analysis: "'connecting flight' (chuyến bay chuyển tiếp) là cụm phân từ V-ing đóng vai trò tính từ cố định."
      },
      {
        sentence: "Please return the completed survey form in the enclosed self-addressed envelope.",
        translation: "Vui lòng gửi lại phiếu khảo sát đã điền đầy đủ trong phong bì có sẵn địa chỉ đính kèm.",
        analysis: "'completed survey' (bị động - đã được điền) và 'enclosed envelope' (được đính kèm)."
      }
    ],
    questions: [
      {
        id: "par24-q1",
        part: "PART_5",
        questionText: "Passengers who will be taking a _______ flight must report to Terminal 2 upon arrival in Chicago.",
        options: {
          A: "connectivity",
          B: "connects",
          C: "connect",
          D: "connecting"
        },
        correctAnswer: "D",
        explanation: "Chỗ trống đứng trước danh từ 'flight' cần một phân từ hiện tại (V-ing) đóng vai trò tính từ chỉ tính chất -> chọn 'connecting' (chuyến bay nối tiếp/kết nối). Cụm 'connecting flight' là cụm cố định cực kỳ phổ biến trong đề ETS.",
        trapNote: "Không chọn danh từ 'connectivity' vì không tạo thành danh từ ghép hợp nghĩa.",
        translation: "Hành khách đi chuyến bay nối chuyến phải có mặt tại Nhà ga số 2 khi đến Chicago.",
        difficulty: "MEDIUM"
      },
      {
        id: "par24-q2",
        part: "PART_5",
        questionText: "The _______ warranty covers replacement parts and labor costs for up to twenty-four months.",
        options: {
          A: "extend",
          B: "extended",
          C: "extending",
          D: "extension"
        },
        correctAnswer: "B",
        explanation: "Trước danh từ 'warranty' (gói bảo hành) cần một quá khứ phân từ V-ed mang nghĩa bị động (gói bảo hành đã được gia hạn) -> chọn 'extended'. Cụm 'extended warranty' là bảo hành mở rộng.",
        trapNote: "Cụm danh từ 'extended warranty' là thuật ngữ thương mại kinh điển trong đề thi TOEIC.",
        translation: "Gói bảo hành mở rộng bao gồm các linh kiện thay thế và chi phí nhân công trong thời hạn lên đến 24 tháng.",
        difficulty: "MEDIUM"
      },
      {
        id: "par24-q3",
        part: "PART_5",
        questionText: "_______ by strong consumer demand in Asia, quarterly electronics exports reached an all-time high.",
        options: {
          A: "Drive",
          B: "Drives",
          C: "Driven",
          D: "Driving"
        },
        correctAnswer: "C",
        explanation: "Rút gọn mệnh đề trạng ngữ chỉ nguyên nhân thể bị động: (Because they were driven by...) -> rút gọn thành 'Driven by...'. Có giới từ 'by' chỉ tác nhân thể bị động.",
        trapNote: "Sự xuất hiện của 'by' là tín hiệu quan trọng cho thấy câu mang nghĩa bị động -> chọn V-ed/V3 (Driven).",
        translation: "Được thúc đẩy bởi nhu cầu tiêu dùng mạnh mẽ tại châu Á, kim ngạch xuất khẩu đồ điện tử hàng quý đã đạt mức cao nhất mọi thời đại.",
        difficulty: "HARD"
      },
      {
        id: "par24-q4",
        part: "PART_6",
        questionText: "Enclosed is the _______ itinerary outlining our visit to the Tokyo manufacturing plant.",
        options: {
          A: "revise",
          B: "revised",
          C: "revising",
          D: "revision"
        },
        correctAnswer: "B",
        explanation: "Trước danh từ 'itinerary' (lịch trình) cần phân từ V-ed chỉ đối tượng đã được chỉnh sửa xong -> chọn 'revised' (lịch trình đã sửa đổi).",
        trapNote: "Bẫy danh từ 'revision' không dùng làm tính từ bổ nghĩa cho 'itinerary'.",
        translation: "Đính kèm là lịch trình đã sửa đổi phác thảo chuyến thăm của chúng tôi tới nhà máy sản xuất Tokyo.",
        difficulty: "MEDIUM"
      }
    ],
    studiedCount: 4,
    correctCount: 3,
    wrongCount: 1,
    bookmarked: false
  },

  // --- CHỦ ĐIỂM 4 (MỚI - ETS 2024): LIÊN TỪ TƯƠNG QUAN & CẶP TỪ NỐI ---
  {
    id: "g-correlative-conjunctions-2024",
    code: "COR-2024",
    titleVi: "Liên Từ Tương Quan & Cặp Từ Nối (ETS 2024)",
    titleEn: "Correlative Conjunctions in ETS 2024",
    part: "PART_5",
    targetScore: "500_750",
    status: "PUBLISHED",
    summary: "Các cặp liên từ đi liền nhau để kết nối hai thành phần ngữ pháp tương đương. Khi nhận ra một vế của cặp từ, ta có thể chọn ngay đáp án vế còn lại trong vòng 3 giây.",
    formula: "Both A and B | Either A or B | Neither A nor B | Not only A but also B | Whether A or B",
    signalWords: ["both...and", "either...or", "neither...nor", "not only...but also", "whether...or", "as well as"],
    traps: [
      "Bẫy ghép sai cặp: Dùng 'neither...or' (sai) thay vì 'neither...nor', hoặc 'either...and' (sai) thay vì 'either...or'.",
      "Bẫy chia động từ: Với 'Either A or B' và 'Neither A nor B', động từ chia theo danh từ B đứng gần nó nhất (chứ KHÔNG chia theo A).",
      "Với 'Both A and B', động từ LUÔN LUÔN chia ở dạng số nhiều."
    ],
    examples: [
      {
        sentence: "The promotion is available to both existing subscribers and new applicants.",
        translation: "Chương trình ưu đãi áp dụng cho cả người đăng ký hiện tại và người nộp đơn mới.",
        analysis: "Cặp từ 'both ... and ...' nối 2 cụm danh từ tương đương."
      },
      {
        sentence: "You may submit your expense claim either online or by postal mail.",
        translation: "Bạn có thể nộp yêu cầu thanh toán chi phí bằng hình thức trực tuyến hoặc qua đường bưu điện.",
        analysis: "'either ... or ...' diễn tả sự lựa chọn 1 trong 2."
      }
    ],
    questions: [
      {
        id: "cor24-q1",
        part: "PART_5",
        questionText: "The new regional warehouse facility is _______ spacious and conveniently located near major highways.",
        options: {
          A: "either",
          B: "both",
          C: "neither",
          D: "whether"
        },
        correctAnswer: "B",
        explanation: "Quan sát vế sau có liên từ 'and' kết nối hai tính từ 'spacious' và 'conveniently located'. Cặp liên từ đi với 'and' là 'both ... and' (cả ... và ...) -> chọn 'both'.",
        trapNote: "Cặp từ: 'both A and B'; 'either' đi với 'or'; 'neither' đi với 'nor'.",
        translation: "Cơ sở nhà kho khu vực mới vừa rộng rãi vừa có vị trí thuận tiện gần các tuyến đường cao tốc chính.",
        difficulty: "EASY"
      },
      {
        id: "cor24-q2",
        part: "PART_5",
        questionText: "Applicants may choose to take the qualification assessment either in person _______ via our secure online platform.",
        options: {
          A: "and",
          B: "nor",
          C: "or",
          D: "but"
        },
        correctAnswer: "C",
        explanation: "Phía trước có từ 'either'. Cặp liên từ tương quan bắt buộc là 'either ... or ...' (hoặc ... hoặc ...) -> chọn 'or'.",
        trapNote: "Chỉ mất 2 giây: Thấy 'either' tìm ngay 'or'.",
        translation: "Các ứng viên có thể chọn làm bài đánh giá năng lực trực tiếp hoặc thông qua nền tảng trực tuyến bảo mật của chúng tôi.",
        difficulty: "EASY"
      },
      {
        id: "cor24-q3",
        part: "PART_5",
        questionText: "Neither the marketing director _______ the sales representatives were available to attend the impromptu client meeting.",
        options: {
          A: "or",
          B: "nor",
          C: "and",
          D: "also"
        },
        correctAnswer: "B",
        explanation: "Đầu câu xuất hiện 'Neither'. Cặp liên từ tương quan tương ứng là 'neither ... nor ...' (cả ... và ... đều không) -> chọn 'nor'.",
        trapNote: "Tuyệt đối không nhầm 'neither ... or'. Nhớ mẹo: Chữ 'n' đi với chữ 'n' (Neither đi với Nor).",
        translation: "Cả giám đốc tiếp thị lẫn các đại diện bán hàng đều không có mặt để tham dự cuộc họp khách hàng đột xuất.",
        difficulty: "MEDIUM"
      },
      {
        id: "cor24-q4",
        part: "PART_5",
        questionText: "The automated payment system is not only reliable _______ remarkably cost-effective for small enterprises.",
        options: {
          A: "as well as",
          B: "and also",
          C: "but also",
          D: "or else"
        },
        correctAnswer: "C",
        explanation: "Cấu trúc tương quan 'not only A but also B' (không những A mà còn B) -> chọn 'but also'.",
        trapNote: "Đôi khi 'also' có thể được lược bỏ nhưng 'but' là bắt buộc.",
        translation: "Hệ thống thanh toán tự động không những đáng tin cậy mà còn đem lại hiệu quả chi phí rõ rệt cho các doanh nghiệp nhỏ.",
        difficulty: "MEDIUM"
      }
    ],
    studiedCount: 4,
    correctCount: 4,
    wrongCount: 0,
    bookmarked: false
  },

  // --- CÁC CHỦ ĐIỂM NGỮ PHÁP TIẾP THEO (ĐÃ ĐƯỢC CẬP NHẬT CHUẨN ĐỀ THI ETS 2024) ---
  {
    id: "g-present-perfect",
    code: "PPT-01",
    titleVi: "Thì Hiện Tại Hoàn Thành (ETS 2024)",
    titleEn: "Present Perfect Tense",
    part: "PART_5",
    targetScore: "500_750",
    status: "PUBLISHED",
    summary: "Diễn tả hành động bắt đầu trong quá khứ và vẫn tiếp diễn ở hiện tại, hoặc vừa mới hoàn tất để lại kết quả trong các thông báo doanh nghiệp ETS 2024.",
    formula: "S + have/has + V3/ed + O",
    signalWords: ["since + mốc thời gian", "for + khoảng thời gian", "already", "yet", "recently", "just", "so far", "over the past decade"],
    traps: [
      "Bẫy nhầm lẫn 'since' (mốc) và 'for' (khoảng).",
      "Bẫy từ 'past' trong cụm 'over the past 5 years' - đây là dấu hiệu Hiện Tại Hoàn Thành chứ KHÔNG phải Quá Khứ Đơn.",
      "Chủ ngữ là danh từ số ít hoặc danh từ không đếm được dùng 'has', danh từ số nhiều dùng 'have'."
    ],
    examples: [
      {
        sentence: "Ms. Emily has managed this regional branch for over five years.",
        translation: "Cô Emily đã quản lý chi nhánh khu vực này được hơn năm năm.",
        analysis: "Có 'for over five years' và chủ ngữ 'Ms. Emily' số ít -> dùng 'has managed'."
      },
      {
        sentence: "Our engineering team has already completed the performance audit.",
        translation: "Đội ngũ kỹ thuật của chúng tôi đã hoàn thành xong việc kiểm toán hiệu suất.",
        analysis: "'Already' đứng giữa trợ động từ has và V3 completed."
      }
    ],
    questions: [
      {
        id: "ppt-q1",
        part: "PART_5",
        questionText: "Ms. Emily _______ this regional branch for over five years, achieving record revenue growth each quarter.",
        options: {
          A: "manages",
          B: "has managed",
          C: "will manage",
          D: "is managing"
        },
        correctAnswer: "B",
        explanation: "Dấu hiệu nhận biết 'for over five years' (khoảng thời gian từ quá khứ đến hiện tại) kết hợp với chủ ngữ ngôi thứ ba số ít 'Ms. Emily' đòi hỏi thì Hiện Tại Hoàn Thành: has + V3/ed (has managed).",
        trapNote: "Tránh nhầm với Hiện Tại Đơn (A) khi thấy 'each quarter' ở vế sau; động từ chính của câu gắn với trạng từ thời gian 'for over five years'.",
        translation: "Cô Emily đã quản lý chi nhánh khu vực này được hơn 5 năm, đạt mức tăng trưởng doanh thu kỷ lục mỗi quý.",
        difficulty: "MEDIUM"
      },
      {
        id: "ppt-q2",
        part: "PART_5",
        questionText: "Since the introduction of the automated inventory system, order processing errors _______ by nearly 40 percent.",
        options: {
          A: "have decreased",
          B: "decrease",
          C: "decreased",
          D: "will decrease"
        },
        correctAnswer: "A",
        explanation: "Cấu trúc với 'Since + mốc thời gian/sự kiện': mệnh đề chính bắt buộc chia thì Hiện Tại Hoàn Thành. Chủ ngữ 'errors' là danh từ số nhiều -> 'have decreased'.",
        trapNote: "Bẫy chọn 'decreased' (C) vì thấy chữ 'Since' tạo cảm giác thì quá khứ.",
        translation: "Kể từ khi đưa vào hệ thống kiểm kho tự động, các lỗi xử lý đơn hàng đã giảm gần 40 phần trăm.",
        difficulty: "MEDIUM"
      },
      {
        id: "ppt-q3",
        part: "PART_5",
        questionText: "The external auditing committee has not _______ its annual financial assessment report yet.",
        options: {
          A: "finalize",
          B: "finalizes",
          C: "finalized",
          D: "finalizing"
        },
        correctAnswer: "C",
        explanation: "Sau trợ động từ 'has not', ta cần một quá khứ phân từ V3/ed để tạo thành thể phủ định thì Hiện Tại Hoàn Thành (has not finalized).",
        trapNote: "Từ 'yet' ở cuối câu là dấu hiệu kinh điển của thì Hiện Tại Hoàn Thành.",
        translation: "Ủy ban kiểm toán độc lập vẫn chưa hoàn tất báo cáo đánh giá tài chính hàng năm.",
        difficulty: "EASY"
      },
      {
        id: "ppt-q4",
        part: "PART_6",
        questionText: "Over the past decade, our research facility _______ over thirty patents in renewable energy technologies.",
        options: {
          A: "has registered",
          B: "registers",
          C: "is registering",
          D: "registered"
        },
        correctAnswer: "A",
        explanation: "Cụm từ 'Over the past / last + khoảng thời gian' bắt buộc chia thì Hiện Tại Hoàn Thành. Chủ ngữ 'facility' số ít -> 'has registered'.",
        trapNote: "Nhiều thí sinh thấy chữ 'past' vội chọn Quá Khứ Đơn (D) mà quên cụm 'Over the past decade'.",
        translation: "Trong suốt một thập kỷ qua, cơ sở nghiên cứu của chúng tôi đã đăng ký hơn 30 bằng sáng chế công nghệ năng lượng tái tạo.",
        difficulty: "MEDIUM"
      }
    ],
    studiedCount: 4,
    correctCount: 3,
    wrongCount: 1,
    bookmarked: true
  },

  {
    id: "g-simple-present",
    code: "SPT-02",
    titleVi: "Thì Hiện Tại Đơn (ETS 2024)",
    titleEn: "Simple Present Tense",
    part: "PART_5",
    targetScore: "350_500",
    status: "PUBLISHED",
    summary: "Diễn tả quy định công ty, lịch trình tàu xe cố định, sự thật hiển nhiên hoặc công việc diễn ra thường xuyên trong môi trường làm việc.",
    formula: "S + V(s/es) + O | S + am/is/are + Adj/N",
    signalWords: ["always", "usually", "regularly", "on a quarterly basis", "every month", "often", "routinely", "normally"],
    traps: [
      "Bẫy danh từ ghép: Chủ ngữ dài có nhiều danh từ, chỉ danh từ chính đứng cuối hoặc trước giới từ mới quyết định chia số ít/nhiều.",
      "Lịch trình giờ giấc của phương tiện giao thông hoặc hội nghị dùng Hiện Tại Đơn thay vì Tương Lai."
    ],
    examples: [
      {
        sentence: "The compliance team reviews internal regulations on a quarterly basis.",
        translation: "Đội ngũ tuân thủ xem xét các quy định nội bộ theo định kỳ hàng quý.",
        analysis: "Chủ ngữ 'team' số ít, trạng ngữ 'on a quarterly basis' -> reviews."
      }
    ],
    questions: [
      {
        id: "spt-q1",
        part: "PART_5",
        questionText: "The corporate compliance department _______ internal safety regulations on a quarterly basis.",
        options: {
          A: "review",
          B: "reviews",
          C: "reviewed",
          D: "is reviewing"
        },
        correctAnswer: "B",
        explanation: "Cụm 'on a quarterly basis' (định kỳ mỗi quý) chỉ tính quy luật lặp lại. Chủ ngữ 'department' là danh từ số ít nên thêm 's': reviews.",
        trapNote: "Bẫy danh từ ghép: 'corporate compliance department' có từ cốt lõi là 'department' số ít.",
        translation: "Bộ phận tuân thủ doanh nghiệp đánh giá lại các quy định an toàn nội bộ theo định kỳ hàng quý.",
        difficulty: "EASY"
      },
      {
        id: "spt-q2",
        part: "PART_5",
        questionText: "Direct express trains to Frankfurt usually _______ from Platform 4 at 07:15 AM every weekday.",
        options: {
          A: "depart",
          B: "departs",
          C: "departed",
          D: "departing"
        },
        correctAnswer: "A",
        explanation: "Lịch trình tàu xe cố định chia Hiện Tại Đơn. Chủ ngữ 'Direct express trains' là số nhiều -> động từ nguyên mẫu: depart.",
        trapNote: "Chú ý đuôi danh từ số nhiều '-s' của trains.",
        translation: "Các chuyến tàu tốc hành trực tiếp tới Frankfurt thường khởi hành từ Ga số 4 lúc 7:15 sáng mỗi ngày trong tuần.",
        difficulty: "EASY"
      },
      {
        id: "spt-q3",
        part: "PART_5",
        questionText: "Dr. Alvarez regularly _______ international seminars on renewable energy solutions.",
        options: {
          A: "conduct",
          B: "conducts",
          C: "conducted",
          D: "conducting"
        },
        correctAnswer: "B",
        explanation: "Trạng từ tần suất 'regularly' (thường xuyên) đi với thì Hiện Tại Đơn. Chủ ngữ 'Dr. Alvarez' số ít -> động từ thêm 's': conducts.",
        trapNote: "Chủ ngữ số ít đi kèm tên riêng đòi hỏi động từ thêm s/es.",
        translation: "Tiến sĩ Alvarez thường xuyên tổ chức các hội thảo quốc tế về giải pháp năng lượng tái tạo.",
        difficulty: "EASY"
      }
    ],
    studiedCount: 3,
    correctCount: 3,
    wrongCount: 0,
    bookmarked: false
  },

  {
    id: "g-simple-past",
    code: "PST-03",
    titleVi: "Thì Quá Khứ Đơn (ETS 2024)",
    titleEn: "Simple Past Tense",
    part: "PART_5",
    targetScore: "350_500",
    status: "PUBLISHED",
    summary: "Diễn tả sự kiện, giao dịch hoặc cuộc họp đã chấm dứt hoàn toàn trong quá khứ với mốc thời gian xác định rõ.",
    formula: "S + V2/ed + O | S + was/were + Adj/N",
    signalWords: ["yesterday", "last week/month/year", "ago", "in + năm quá khứ", "previously", "formerly", "initially"],
    traps: [
      "Bẫy từ 'found': 'found' vừa là V2 của 'find' (tìm kiếm), vừa là V nguyên mẫu của 'found' (thành lập -> quá khứ là founded).",
      "Không dùng Hiện Tại Hoàn Thành khi đã có mốc thời gian quá khứ rõ ràng như 'yesterday' hay 'in 2022'."
    ],
    examples: [
      {
        sentence: "The executive board approved the commercial merger agreement yesterday afternoon.",
        translation: "Ban điều hành đã phê duyệt thỏa thuận sáp nhập thương mại vào chiều hôm qua.",
        analysis: "Có 'yesterday afternoon' -> động từ chia approved."
      }
    ],
    questions: [
      {
        id: "pst-q1",
        part: "PART_5",
        questionText: "The executive board _______ the commercial merger agreement during yesterday afternoon's session.",
        options: {
          A: "approved",
          B: "approves",
          C: "will approve",
          D: "has approved"
        },
        correctAnswer: "A",
        explanation: "Có mốc thời gian xác định 'yesterday afternoon's session' nên chia Quá Khứ Đơn: approved.",
        trapNote: "Không chọn Hiện Tại Hoàn Thành (D) khi có 'yesterday'.",
        translation: "Ban điều hành đã phê duyệt thỏa thuận sáp nhập thương mại trong phiên họp chiều hôm qua.",
        difficulty: "EASY"
      },
      {
        id: "pst-q2",
        part: "PART_5",
        questionText: "Three years ago, Dr. Jensen _______ the pharmaceutical startup that later pioneered this vaccine.",
        options: {
          A: "founded",
          B: "funds",
          C: "found",
          D: "founding"
        },
        correctAnswer: "A",
        explanation: "'Three years ago' yêu cầu thì Quá Khứ Đơn. Động từ 'found' (thành lập công ty) có quá khứ là 'founded'.",
        trapNote: "Tránh nhầm với 'found' là dạng quá khứ của 'find' (tìm thấy).",
        translation: "Ba năm trước, Tiến sĩ Jensen đã thành lập công ty khởi nghiệp dược phẩm mà sau này tiên phong phát triển loại vắc-xin này.",
        difficulty: "MEDIUM"
      },
      {
        id: "pst-q3",
        part: "PART_6",
        questionText: "Last month, the logistics director _______ a comprehensive review of all freight transportation costs.",
        options: {
          A: "conducts",
          B: "conducted",
          C: "has conducted",
          D: "conducting"
        },
        correctAnswer: "B",
        explanation: "'Last month' là mốc thời gian đã chấm dứt trong quá khứ -> chia Quá Khứ Đơn: conducted.",
        trapNote: "Không dùng thì hoàn thành khi có thời gian 'Last month'.",
        translation: "Tháng trước, giám đốc logistics đã tiến hành đánh giá toàn diện mọi chi phí vận chuyển hàng hóa.",
        difficulty: "EASY"
      }
    ],
    studiedCount: 3,
    correctCount: 3,
    wrongCount: 0,
    bookmarked: false
  },

  {
    id: "g-simple-future",
    code: "SFT-04",
    titleVi: "Thì Tương Lai & Mệnh Đề Thời Gian (ETS 2024)",
    titleEn: "Future Tenses & Time Clauses",
    part: "PART_5",
    targetScore: "350_500",
    status: "PUBLISHED",
    summary: "Diễn tả kế hoạch dự kiến hoặc cam kết trong tương lai; quy tắc phối thì mệnh đề chỉ thời gian (when, as soon as, once, after).",
    formula: "S + will + V_inf | Mệnh đề chính (will + V) + as soon as + Mệnh đề thời gian (Hiện tại đơn)",
    signalWords: ["tomorrow", "next week", "soon", "shortly", "in the upcoming days", "as soon as", "once", "before", "after"],
    traps: [
      "Bẫy phối thì kinh điển: Trong mệnh đề trạng ngữ chỉ thời gian bắt đầu bằng 'when/as soon as/after/once', TUYỆT ĐỐI không dùng 'will'.",
      "Sau 'will' bắt buộc là động từ nguyên mẫu không chia to."
    ],
    examples: [
      {
        sentence: "We will dispatch your order as soon as the wire transfer confirmation is received.",
        translation: "Chúng tôi sẽ gửi đơn hàng ngay khi nhận được xác nhận chuyển khoản.",
        analysis: "Vế chính dùng 'will dispatch', vế sau 'as soon as' dùng hiện tại đơn 'is received'."
      }
    ],
    questions: [
      {
        id: "sft-q1",
        part: "PART_5",
        questionText: "The logistics warehouse _______ dispatch the replacement parts as soon as official payment is verified.",
        options: {
          A: "will",
          B: "was",
          C: "has",
          D: "did"
        },
        correctAnswer: "A",
        explanation: "Mệnh đề chính đứng trước mệnh đề thời gian 'as soon as + hiện tại đơn' cần thì Tương Lai Đơn: will + dispatch.",
        trapNote: "Cấu trúc: S + will + V_inf + as soon as + S + V(hiện tại đơn).",
        translation: "Kho logistics sẽ gửi các linh kiện thay thế ngay khi thanh toán chính thức được xác minh.",
        difficulty: "EASY"
      },
      {
        id: "sft-q2",
        part: "PART_5",
        questionText: "Once the new security software _______ installed, employees may resume standard operations.",
        options: {
          A: "is",
          B: "will be",
          C: "was",
          D: "been"
        },
        correctAnswer: "A",
        explanation: "Sau liên từ thời gian 'Once' (một khi), ta KHÔNG dùng 'will be' mà phải chia Hiện Tại Đơn bị động: 'is installed'.",
        trapNote: "Bẫy chọn 'will be' (B) vì thấy vế sau có 'may resume' chỉ tương lai.",
        translation: "Một khi phần mềm bảo mật mới được cài đặt, nhân viên có thể tiếp tục công việc bình thường.",
        difficulty: "MEDIUM"
      }
    ],
    studiedCount: 2,
    correctCount: 2,
    wrongCount: 0,
    bookmarked: false
  },

  {
    id: "g-passive-voice",
    code: "PAS-05",
    titleVi: "Câu Bị Động Trong Hợp Đồng & Quy Chế (ETS 2024)",
    titleEn: "Passive Voice in Business TOEIC",
    part: "PART_5",
    targetScore: "500_750",
    status: "PUBLISHED",
    summary: "Đặc trưng văn phong hành chính thương mại TOEIC: Chủ ngữ là đồ vật, hợp đồng, đơn hàng hay quy trình chịu sự tác động.",
    formula: "S + be + V3/ed (+ by O) | S + modal verb + be + V3/ed",
    signalWords: ["by + tác nhân", "be required to", "be scheduled to", "be expected to", "be notified of", "be held in"],
    traps: [
      "Bẫy thiếu 'to be': Đừng nhầm lẫn giữa V-ed làm tính từ rút gọn và động từ vị ngữ chính (phải có Be + V3/ed).",
      "Nội động từ (arrive, happen, occur, remain, fall, rise) TUYỆT ĐỐI KHÔNG chia ở thể bị động."
    ],
    examples: [
      {
        sentence: "All signed nondisclosure agreements must be submitted to legal counsel by 5 PM.",
        translation: "Mọi thỏa thuận bảo mật đã ký phải được nộp cho cố vấn pháp lý trước 5 giờ chiều.",
        analysis: "Chủ ngữ là thỏa thuận (vật) -> bị động 'must be submitted'."
      }
    ],
    questions: [
      {
        id: "pas-q1",
        part: "PART_5",
        questionText: "All confidential financial records must _______ in the locked filing cabinets overnight.",
        options: {
          A: "store",
          B: "be stored",
          C: "storing",
          D: "stored"
        },
        correctAnswer: "B",
        explanation: "Sau động từ khuyết thiếu 'must', chủ ngữ 'confidential financial records' (hồ sơ tài chính) là vật nên phải chia bị động: must + be + V3/ed (be stored).",
        trapNote: "Không chọn (A) 'store' vì tài liệu không thể tự lưu trữ mà phải 'được lưu trữ'.",
        translation: "Tất cả hồ sơ tài chính mật phải được lưu trữ trong tủ hồ sơ có khóa qua đêm.",
        difficulty: "EASY"
      },
      {
        id: "pas-q2",
        part: "PART_5",
        questionText: "Unexpected delays occurred when the cargo container ship _______ during the storm.",
        options: {
          A: "damaged",
          B: "was damaged",
          C: "is damaging",
          D: "damage"
        },
        correctAnswer: "B",
        explanation: "Con tàu 'cargo container ship' bị hư hại bởi bão trong quá khứ -> chia thì Quá Khứ Đơn thể Bị Động: was damaged.",
        trapNote: "Lưu ý 'occurred' là nội động từ ở vế trước không chia bị động.",
        translation: "Sự chậm trễ ngoài dự kiến đã xảy ra khi tàu container chở hàng bị hư hại trong cơn bão.",
        difficulty: "MEDIUM"
      }
    ],
    studiedCount: 2,
    correctCount: 2,
    wrongCount: 0,
    bookmarked: false
  },

  {
    id: "g-conditionals",
    code: "CND-06",
    titleVi: "Câu Điều Kiện & Đảo Ngữ Với Should/Had (ETS 2024)",
    titleEn: "Conditionals & Inversions",
    part: "PART_5",
    targetScore: "750_PLUS",
    status: "PUBLISHED",
    summary: "Cấu trúc điều kiện Loại 1, Loại 2 và đặc biệt là Đảo ngữ với Should/Had/Were – dấu hiệu nhận diện câu hỏi điểm 800+ trong đề ETS.",
    formula: "Type 1: If + S + V(hiện tại), S + will + V | Đảo ngữ loại 1: Should + S + V_inf, S + will/please + V",
    signalWords: ["if", "unless (= if not)", "provided that", "in case of", "should you have any questions"],
    traps: [
      "Bẫy đảo ngữ loại 1: 'Should you require any assistance, please contact us' -> Đứng đầu câu có 'Should' nhưng cuối câu là dấu chấm chứ KHÔNG phải dấu hỏi chấm.",
      "Sau 'Should' trong đảo ngữ, động từ LUÔN ở dạng nguyên mẫu không 'to' (V_inf)."
    ],
    examples: [
      {
        sentence: "Should you experience technical difficulties, please notify IT support immediately.",
        translation: "Nếu bạn gặp sự cố kỹ thuật, vui lòng thông báo cho bộ phận IT ngay lập tức.",
        analysis: "Đảo ngữ loại 1 bỏ If, đưa Should lên đầu câu: Should + you + experience (V_inf)."
      }
    ],
    questions: [
      {
        id: "cnd-q1",
        part: "PART_5",
        questionText: "_______ you require additional promotional materials, please inform our marketing desk.",
        options: {
          A: "Should",
          B: "Would",
          C: "Could",
          D: "Might"
        },
        correctAnswer: "A",
        explanation: "Đảo ngữ câu điều kiện loại 1: Bỏ 'If', đưa 'Should' lên đầu câu đứng trước chủ ngữ 'you' và động từ nguyên mẫu 'require'. Cuối câu có mệnh đề mệnh lệnh 'please inform...'.",
        trapNote: "Cụm 'Should you require / Should you need' là mẫu câu đảo ngữ thương mại thông dụng nhất trong TOEIC.",
        translation: "Nếu bạn cần thêm tài liệu quảng cáo, vui lòng thông báo cho bàn tiếp thị của chúng tôi.",
        difficulty: "HARD"
      },
      {
        id: "cnd-q2",
        part: "PART_5",
        questionText: "Unless the contractor _______ the safety certification, work on the tunnel cannot proceed.",
        options: {
          A: "renews",
          B: "will renew",
          C: "renewed",
          D: "renewing"
        },
        correctAnswer: "A",
        explanation: "Sau 'Unless' (nếu không) là mệnh đề điều kiện loại 1 chia thì Hiện Tại Đơn. Chủ ngữ 'the contractor' số ít -> 'renews'.",
        trapNote: "Tuyệt đối không dùng 'will' trong mệnh đề chứa 'Unless'.",
        translation: "Nếu nhà thầu không gia hạn chứng nhận an toàn, công việc tại đường hầm không thể tiến hành.",
        difficulty: "MEDIUM"
      }
    ],
    studiedCount: 2,
    correctCount: 2,
    wrongCount: 0,
    bookmarked: false
  },

  {
    id: "g-relative-clauses",
    code: "REL-07",
    titleVi: "Mệnh Đề Quan Hệ & Rút Gọn Mệnh Đề (ETS 2024)",
    titleEn: "Relative Clauses & Reductions",
    part: "PART_6",
    targetScore: "500_750",
    status: "PUBLISHED",
    summary: "Đại từ quan hệ (who, whom, which, that, whose) và kỹ thuật rút gọn thành V-ing / V-ed cực kỳ phổ biến trong đề thi.",
    formula: "Who + V (chỉ người) | Which + V/S-V (chỉ vật) | Whose + Noun (sở hữu) | Rút gọn: Noun + V-ing (chủ động) / V3-ed (bị động)",
    signalWords: ["who", "whom", "whose + danh từ", "which", "that", "those who + V_plural"],
    traps: [
      "Bẫy 'whose': Phía sau 'whose' bắt buộc là một DANH TỪ không có mạo từ (a/an/the).",
      "'That' không bao giờ đứng sau dấu phẩy hoặc sau giới từ.",
      "Cấu trúc kinh điển: 'Those who + V(số nhiều)' = những người mà..."
    ],
    examples: [
      {
        sentence: "Those employees who wish to register for the workshop should email HR.",
        translation: "Những nhân viên muốn đăng ký hội thảo nên gửi email cho phòng nhân sự.",
        analysis: "'Those who' chỉ những người làm hành động."
      }
    ],
    questions: [
      {
        id: "rel-q1",
        part: "PART_5",
        questionText: "Candidates _______ resumes demonstrate extensive enterprise software experience will be shortlisted.",
        options: {
          A: "who",
          B: "whose",
          C: "which",
          D: "whom"
        },
        correctAnswer: "B",
        explanation: "Phía trước là 'Candidates' (ứng viên), phía sau là danh từ 'resumes' (hồ sơ lý lịch). Mối quan hệ sở hữu: Hồ sơ của các ứng viên -> chọn 'whose'.",
        trapNote: "Bẫy chọn 'who' vì thấy 'Candidates' là người, nhưng bỏ quên danh từ 'resumes' ngay phía sau.",
        translation: "Những ứng viên có hồ sơ thể hiện kinh nghiệm phần mềm doanh nghiệp sâu rộng sẽ được đưa vào danh sách rút gọn.",
        difficulty: "MEDIUM"
      },
      {
        id: "rel-q2",
        part: "PART_5",
        questionText: "Those _______ wish to participate in the mentoring program must submit an essay by Friday.",
        options: {
          A: "who",
          B: "which",
          C: "whom",
          D: "whose"
        },
        correctAnswer: "A",
        explanation: "Cụm đại từ quan hệ cố định 'Those who + V_plural' (những người mà...).",
        trapNote: "'Those who' là cụm cố định thử thách học viên ở Part 5.",
        translation: "Những ai muốn tham gia chương trình cố vấn phải nộp một bài luận trước thứ Sáu.",
        difficulty: "EASY"
      }
    ],
    studiedCount: 2,
    correctCount: 2,
    wrongCount: 0,
    bookmarked: false
  },

  {
    id: "g-subject-verb-agreement",
    code: "SVA-08",
    titleVi: "Hòa Hợp Chủ Ngữ & Động Từ (ETS 2024)",
    titleEn: "Subject-Verb Agreement",
    part: "PART_5",
    targetScore: "350_500",
    status: "PUBLISHED",
    summary: "Xác định đúng chủ ngữ thật trong câu khi bị ngăn cách bởi cụm giới từ, mệnh đề quan hệ hoặc các liên từ đi kèm (along with, as well as).",
    formula: "S1 + (along with / as well as / together with + S2) + V(chia theo S1) | Each/Every + N_singular + V_singular",
    signalWords: ["each of", "every", "along with", "together with", "a number of (+ V số nhiều)", "the number of (+ V số ít)"],
    traps: [
      "Bẫy cụm giới từ xen giữa: 'The delivery of office supplies is late' -> Chủ ngữ chính là 'delivery' (số ít) chứ không phải 'supplies'.",
      "'A number of + N số nhiều' đi với động từ số nhiều; 'The number of + N số nhiều' đi với động từ số ít.",
      "'Each' và 'Every' luôn đi với động từ số ít."
    ],
    examples: [
      {
        sentence: "The quality of these manufactured components meets international safety benchmarks.",
        translation: "Chất lượng của các linh kiện sản xuất này đáp ứng tiêu chuẩn an toàn quốc tế.",
        analysis: "Chủ ngữ thật là 'quality' (số ít) -> meets."
      }
    ],
    questions: [
      {
        id: "sva-q1",
        part: "PART_5",
        questionText: "The assembly of electronic microchips _______ extreme precision and sterile cleanroom conditions.",
        options: {
          A: "requires",
          B: "require",
          C: "requiring",
          D: "are requiring"
        },
        correctAnswer: "A",
        explanation: "Chủ ngữ chính đứng trước giới từ 'of' là danh từ không đếm được 'The assembly' (quá trình lắp ráp) -> động từ chia ngôi thứ ba số ít: requires.",
        trapNote: "Nhiều thí sinh nhìn thấy 'microchips' số nhiều vội chọn (B) require.",
        translation: "Quá trình lắp ráp vi mạch điện tử đòi hỏi độ chính xác cao và điều kiện phòng sạch vô trùng.",
        difficulty: "EASY"
      },
      {
        id: "sva-q2",
        part: "PART_5",
        questionText: "The number of domestic tourists visiting coastal resorts _______ increased significantly this summer.",
        options: {
          A: "has",
          B: "have",
          C: "are",
          D: "were"
        },
        correctAnswer: "A",
        explanation: "Cấu trúc 'The number of + N số nhiều' làm chủ ngữ bắt buộc chia động từ ở dạng số ít: has increased.",
        trapNote: "Phân biệt: 'The number of' -> số ít (has); 'A number of' -> số nhiều (have).",
        translation: "Số lượng khách du lịch nội địa đến các khu nghỉ dưỡng ven biển đã tăng lên đáng kể vào mùa hè này.",
        difficulty: "MEDIUM"
      }
    ],
    studiedCount: 2,
    correctCount: 2,
    wrongCount: 0,
    bookmarked: false
  },

  {
    id: "g-conjunctions-prepositions",
    code: "CNJ-09",
    titleVi: "Phân Biệt Liên Từ & Giới Từ (ETS 2024)",
    titleEn: "Conjunctions vs Prepositions",
    part: "PART_6",
    targetScore: "500_750",
    status: "PUBLISHED",
    summary: "Dạng bài kinh điển phân biệt giữa từ nối mệnh đề (Conjunction + S + V) và từ đi kèm cụm danh từ (Preposition + Noun/V-ing).",
    formula: "Liên từ + S + V (although, because, while) vs Giới từ + Noun / V-ing (despite, because of, during)",
    signalWords: ["although vs despite", "because vs because of", "while vs during", "due to", "in spite of", "provided that"],
    traps: [
      "'Despite / In spite of' + Cụm danh từ / V-ing (KHÔNG có 'of' sau despite).",
      "'During + khoảng thời gian/sự kiện' (during the meeting); 'For + khoảng thời gian có số đếm' (for three weeks).",
      "'Because of / Due to' + Danh từ; 'Because / Since' + Mệnh đề."
    ],
    examples: [
      {
        sentence: "Despite severe weather conditions, the cargo vessel arrived at the port safely.",
        translation: "Mặc dù điều kiện thời tiết khắc nghiệt, tàu chở hàng đã cập cảng an toàn.",
        analysis: "Sau 'Despite' là cụm danh từ 'severe weather conditions'."
      }
    ],
    questions: [
      {
        id: "cnj-q1",
        part: "PART_5",
        questionText: "_______ persistent rainfall throughout the morning, attendance at the outdoor product exhibition remained robust.",
        options: {
          A: "Despite",
          B: "Although",
          C: "Even though",
          D: "Whereas"
        },
        correctAnswer: "A",
        explanation: "Phía sau chỗ trống là một cụm danh từ 'persistent rainfall throughout the morning', không có động từ vị ngữ chia thì. Cần một giới từ chỉ sự nhượng bộ -> chọn 'Despite'.",
        trapNote: "Các phương án B, C, D đều là liên từ bắt buộc phải có mệnh đề (S + V) theo sau.",
        translation: "Mặc dù trời mưa dai dẳng suốt buổi sáng, lượng người tham dự triển lãm sản phẩm ngoài trời vẫn duy trì ở mức cao.",
        difficulty: "MEDIUM"
      },
      {
        id: "cnj-q2",
        part: "PART_5",
        questionText: "Flight UA-402 was rerouted _______ heavy fog severely reduced runway visibility at Seattle Airport.",
        options: {
          A: "because",
          B: "because of",
          C: "due to",
          D: "owing to"
        },
        correctAnswer: "A",
        explanation: "Phía sau chỗ trống là mệnh đề hoàn chỉnh có chủ ngữ 'heavy fog' và động từ chia thì 'severely reduced'. Cần liên từ chỉ nguyên nhân -> chọn 'because'.",
        trapNote: "B, C, D đều là giới từ đi kèm cụm danh từ.",
        translation: "Chuyến bay UA-402 đã bị đổi hướng vì sương mù dày đặc làm giảm nghiêm trọng tầm nhìn đường băng tại Sân bay Seattle.",
        difficulty: "MEDIUM"
      }
    ],
    studiedCount: 2,
    correctCount: 2,
    wrongCount: 0,
    bookmarked: true
  },

  {
    id: "g-gerund-infinitive",
    code: "GER-10",
    titleVi: "Danh Động Từ & Động Từ Nguyên Mẫu (ETS 2024)",
    titleEn: "Gerunds & Infinitives",
    part: "PART_5",
    targetScore: "500_750",
    status: "PUBLISHED",
    summary: "Quy tắc dùng V-ing sau giới từ và các động từ đặc biệt (consider, avoid, enjoy), và dùng To-V chỉ mục đích hoặc đi sau các động từ (plan, decide, hesitate).",
    formula: "Giới từ + V-ing | To-V chỉ mục đích | look forward to + V-ing",
    signalWords: ["look forward to + V-ing", "in order to + V_inf", "hesitate to", "capable of + V-ing", "be committed to + V-ing"],
    traps: [
      "Bẫy chữ 'to': Trong cụm 'look forward to', 'be committed to', 'be dedicated to', 'object to', 'prior to', chữ 'to' là GIỚI TỪ nên sau đó phải là V-ing chứ KHÔNG phải V nguyên mẫu.",
      "Cấu trúc 'in order to / so as to' + V nguyên mẫu để chỉ mục đích."
    ],
    examples: [
      {
        sentence: "Our engineering staff is committed to improving industrial energy efficiency.",
        translation: "Đội ngũ kỹ sư của chúng tôi cam kết cải thiện hiệu quả năng lượng công nghiệp.",
        analysis: "'be committed to' + V-ing (improving)."
      }
    ],
    questions: [
      {
        id: "ger-q1",
        part: "PART_5",
        questionText: "We look forward to _______ your delegation at our international corporate headquarters next week.",
        options: {
          A: "welcome",
          B: "welcoming",
          C: "welcomed",
          D: "welcomes"
        },
        correctAnswer: "B",
        explanation: "Cụm 'look forward to' có 'to' là giới từ, do đó động từ theo sau bắt buộc ở dạng V-ing: welcoming.",
        trapNote: "Bẫy kinh điển: Thấy 'to' vội vàng chọn động từ nguyên thể (A) welcome.",
        translation: "Chúng tôi rất mong đợi được đón tiếp phái đoàn của bạn tại trụ sở công ty quốc tế của chúng tôi vào tuần tới.",
        difficulty: "MEDIUM"
      },
      {
        id: "ger-q2",
        part: "PART_5",
        questionText: "The executive team implemented stricter internal guidelines in order to _______ supply chain waste.",
        options: {
          A: "reduce",
          B: "reducing",
          C: "reduction",
          D: "reduced"
        },
        correctAnswer: "A",
        explanation: "Cụm 'in order to' (để mà) đi kèm động từ nguyên mẫu không 'to' (V_inf) để chỉ mục đích hành động -> chọn 'reduce'.",
        trapNote: "'in order to + V_inf' vs 'with a view to + V-ing'.",
        translation: "Ban điều hành đã thực hiện các hướng dẫn nội bộ chặt chẽ hơn nhằm giảm lãng phí trong chuỗi cung ứng.",
        difficulty: "EASY"
      }
    ],
    studiedCount: 2,
    correctCount: 2,
    wrongCount: 0,
    bookmarked: false
  },

  {
    id: "g-comparatives",
    code: "CMP-11",
    titleVi: "So Sánh Tính Từ & Trạng Từ (ETS 2024)",
    titleEn: "Comparatives & Superlatives",
    part: "PART_5",
    targetScore: "500_750",
    status: "PUBLISHED",
    summary: "So sánh hơn (-er / more than), so sánh nhất (the -est / the most) và cấu trúc so sánh bằng (as...as) trong các báo cáo kinh doanh.",
    formula: "Adj-er / more + Adj + than | the + Adj-est / the most + Adj | as + Adj/Adv + as",
    signalWords: ["than", "the most", "among all", "by far the best", "as...as", "much/far/significantly + so sánh hơn"],
    traps: [
      "Trạng từ nhấn mạnh so sánh hơn: Dùng 'much / far / significantly / considerably / substantially' để bổ nghĩa cho so sánh hơn (TUYỆT ĐỐI không dùng 'very' trước so sánh hơn).",
      "So sánh nhất bắt buộc có mạo từ 'the' hoặc tính từ sở hữu đi kèm."
    ],
    examples: [
      {
        sentence: "This new logistics software operates significantly faster than the previous edition.",
        translation: "Phần mềm logistics mới này vận hành nhanh hơn đáng kể so với phiên bản trước.",
        analysis: "'significantly' nhấn mạnh cho so sánh hơn 'faster than'."
      }
    ],
    questions: [
      {
        id: "cmp-q1",
        part: "PART_5",
        questionText: "The hybrid manufacturing line produces turbine blades significantly _______ than the older facility.",
        options: {
          A: "fast",
          B: "faster",
          C: "fastest",
          D: "more fast"
        },
        correctAnswer: "B",
        explanation: "Phía sau có từ 'than' -> cấu trúc so sánh hơn. 'Fast' là tính từ/trạng từ ngắn -> thêm đuôi '-er' thành 'faster'. 'Significantly' làm trạng từ nhấn mạnh.",
        trapNote: "Không dùng 'more fast' vì fast là từ ngắn.",
        translation: "Dây chuyền sản xuất hỗn hợp tạo ra các cánh tuabin nhanh hơn đáng kể so với cơ sở cũ.",
        difficulty: "MEDIUM"
      },
      {
        id: "cmp-q2",
        part: "PART_5",
        questionText: "Among all commercial candidates interviewed, Ms. Chen was _______ qualified for the senior position.",
        options: {
          A: "most",
          B: "the most",
          C: "more",
          D: "much"
        },
        correctAnswer: "B",
        explanation: "Cụm 'Among all + N số nhiều' (trong số tất cả...) là dấu hiệu kinh điển của so sánh nhất -> cần 'the most' + tính từ dài (the most qualified).",
        trapNote: "Bắt buộc phải có mạo từ 'the' trong so sánh nhất.",
        translation: "Trong số tất cả các ứng viên thương mại được phỏng vấn, cô Chen là người có đủ năng lực nhất cho vị trí cấp cao.",
        difficulty: "MEDIUM"
      }
    ],
    studiedCount: 2,
    correctCount: 2,
    wrongCount: 0,
    bookmarked: false
  },

  {
    id: "g-modal-subjunctive",
    code: "SUB-12",
    titleVi: "Động Từ Khuyết Thiếu & Thể Giả Định (ETS 2024)",
    titleEn: "Modals & Subjunctive Mood",
    part: "PART_5",
    targetScore: "750_PLUS",
    status: "PUBLISHED",
    summary: "Thể giả định với các động từ yêu cầu/đề xuất (recommend, request, suggest, require, demand, insist) + that + S + (should) + V_inf.",
    formula: "S + recommend/request/suggest/require + that + S + (should) + V_inf (nguyên thể không chia)",
    signalWords: ["recommend that", "request that", "suggest that", "require that", "it is essential that", "it is imperative that"],
    traps: [
      "Bẫy giả định: Dù chủ ngữ sau 'that' là ngôi thứ 3 số ít (he/she/it/the director), động từ theo sau LUÔN ở dạng nguyên mẫu không chia 's/es' vì có 'should' ngầm hiểu.",
      "Ở thể bị động: S + request that + S + BE + V3/ed (dùng 'be', không dùng is/are/was/were)."
    ],
    examples: [
      {
        sentence: "The auditor recommended that the financial officer verify all transaction logs.",
        translation: "Kiểm toán viên khuyến nghị rằng viên chức tài chính phải xác minh tất cả nhật ký giao dịch.",
        analysis: "Sau 'recommended that', dù 'officer' số ít nhưng động từ 'verify' vẫn giữ nguyên mẫu."
      }
    ],
    questions: [
      {
        id: "sub-q1",
        part: "PART_5",
        questionText: "The plant safety inspector requested that every employee _______ protective goggles inside the assembly zone.",
        options: {
          A: "wear",
          B: "wears",
          C: "wore",
          D: "is wearing"
        },
        correctAnswer: "A",
        explanation: "Cấu trúc giả định: S + request that + S + (should) + V_inf. Dù 'every employee' là chủ ngữ số ít, động từ theo sau vẫn giữ nguyên thể không chia: wear.",
        trapNote: "Bẫy cực kỳ nguy hiểm: Rất nhiều thí sinh chọn 'wears' (B) vì thấy 'every employee' số ít.",
        translation: "Thanh tra an toàn nhà máy đã yêu cầu mọi nhân viên phải đeo kính bảo hộ bên trong khu vực lắp ráp.",
        difficulty: "HARD"
      },
      {
        id: "sub-q2",
        part: "PART_5",
        questionText: "It is imperative that the quarterly financial statement _______ submitted prior to the regulatory deadline.",
        options: {
          A: "be",
          B: "is",
          C: "was",
          D: "been"
        },
        correctAnswer: "A",
        explanation: "Cấu trúc giả định với tính từ bắt buộc: It is imperative that + S + (should) + BE + V3/ed -> dùng nguyên mẫu 'be'.",
        trapNote: "Bẫy chọn 'is' (B) theo thói quen chia động từ to be số ít.",
        translation: "Điều cấp thiết là báo cáo tài chính hàng quý phải được nộp trước thời hạn quy định.",
        difficulty: "HARD"
      }
    ],
    studiedCount: 2,
    correctCount: 2,
    wrongCount: 0,
    bookmarked: false
  },

  // --- CHỦ ĐIỂM PART 7 (MỚI - ETS 2024): ĐẢO NGỮ & NHẤN MẠNH TRONG VĂN BẢN THƯƠNG MẠI ---
  {
    id: "g-inversion-part7-2024",
    code: "INV-P7-24",
    titleVi: "Cấu Trúc Đảo Ngữ & Nhấn Mạnh Trong Văn Bản Thương Mại (ETS 2024 Part 7)",
    titleEn: "Inversions & Emphatic Structures in ETS 2024 Reading",
    part: "PART_7",
    targetScore: "750_PLUS",
    status: "PUBLISHED",
    summary: "Nhóm cấu trúc ngữ pháp nâng cao xuất hiện trong các bài đọc Thông báo (Notices), Hợp đồng (Agreements) và Email chính thức đề ETS 2024 Part 7. Nhận diện đảo ngữ giúp thí sinh hiểu đúng các điều kiện tiên quyết và quy định hủy giao dịch.",
    formula: "Only after/when + S + V, [Trợ động từ + S + V] | Under no circumstances + should/can + S + V | It is/was + [Thành phần nhấn mạnh] + that + [Mệnh đề]",
    signalWords: ["Under no circumstances", "Only after", "Seldom", "Not only... but also", "In no event shall", "It was not until"],
    traps: [
      "Bẫy hiểu sai điều kiện bắt buộc: Đảo ngữ với 'Only when' mang ý nghĩa chỉ khi thỏa mãn điều kiện A thì quyền lợi B mới có hiệu lực.",
      "Bẫy cấu trúc nhấn mạnh 'It was not until... that': Dễ nhầm lẫn mốc thời gian hành động diễn ra."
    ],
    examples: [
      {
        sentence: "Under no circumstances should confidential client records be disclosed to third-party vendors without prior written authorization.",
        translation: "Trong bất kỳ trường hợp nào, hồ sơ bảo mật của khách hàng cũng không được tiết lộ cho các nhà cung cấp bên thứ ba mà không có sự ủy quyền trước bằng văn bản.",
        analysis: "'Under no circumstances' đứng đầu câu bắt buộc đảo trợ động từ 'should' lên trước chủ ngữ 'confidential client records'."
      },
      {
        sentence: "Only after completing the mandatory compliance training will newly hired consultants be assigned to active client accounts.",
        translation: "Chỉ sau khi hoàn thành khóa đào tạo tuân thủ bắt buộc, các tư vấn viên mới được tuyển dụng mới được phân công vào các tài khoản khách hàng thực tế.",
        analysis: "Đảo ngữ với 'Only after + V-ing', mệnh đề chính đảo trợ động từ 'will' lên trước chủ ngữ."
      }
    ],
    questions: [
      {
        id: "inv7-q1",
        part: "PART_7",
        questionText: "Under no circumstances _______ employees permitted to operate heavy warehouse machinery without wearing certified safety helmets.",
        options: {
          A: "is",
          B: "are",
          C: "will",
          D: "have"
        },
        correctAnswer: "B",
        explanation: "Cấu trúc đảo ngữ phủ định: Under no circumstances + to be / modal verb + S + V3/ed. Chủ ngữ 'employees' số nhiều nên dùng 'are'.",
        trapNote: "Tránh nhầm lẫn thứ tự từ trong câu thông thường S + V.",
        translation: "Trong bất kỳ trường hợp nào, nhân viên cũng không được phép vận hành máy móc kho hàng nặng mà không đội mũ bảo hiểm an toàn đã được chứng nhận.",
        difficulty: "HARD"
      },
      {
        id: "inv7-q2",
        part: "PART_7",
        questionText: "Only when full payment is processed _______ the shipping department dispatch the custom-built office furniture.",
        options: {
          A: "will",
          B: "did",
          C: "is",
          D: "has"
        },
        correctAnswer: "A",
        explanation: "Mệnh đề 'Only when + S + V' ở hiện tại, mệnh đề chính đảo ngữ thì tương lai: will + S + V_bare (dispatch).",
        trapNote: "Đảo ngữ với 'Only when' cần xác định đúng thì của hành động xảy ra sau.",
        translation: "Chỉ khi thanh toán đầy đủ được xử lý thì bộ phận vận chuyển mới xuất kho đồ nội thất văn phòng được đóng theo yêu cầu.",
        difficulty: "HARD"
      }
    ],
    studiedCount: 0,
    correctCount: 0,
    wrongCount: 0,
    bookmarked: false
  },

  // --- CHỦ ĐIỂM PART 7 (MỚI - ETS 2024): MỆNH ĐỀ DANH NGỮ & CÂU TƯỜNG THUẬT ---
  {
    id: "g-noun-clauses-part7-2024",
    code: "NCL-P7-24",
    titleVi: "Mệnh Đề Danh Ngữ & Câu Tường Thuật Trong Báo Cáo & Thư Từ (ETS 2024 Part 7)",
    titleEn: "Noun Clauses & Reported Speech in Business Texts",
    part: "PART_7",
    targetScore: "500_750",
    status: "PUBLISHED",
    summary: "Cấu trúc mệnh đề danh ngữ với That/Whether/What đóng vai trò chủ ngữ hoặc tân ngữ xuất hiện với tần suất dày đặc trong các bài báo kinh tế (Articles), khảo sát nội bộ (Surveys) và email của đề ETS 2024 Part 7.",
    formula: "That / Whether + S + V + [Động từ chính của câu] | S + announced / confirmed / reported + that + S + V",
    signalWords: ["whether or not", "stated that", "indicated that", "the fact that", "regarding whether", "confirmed that"],
    traps: [
      "Bẫy nhầm lẫn giữa 'That' (sự thật khẳng định) và 'Whether/If' (sự không chắc chắn / phân vân giữa 2 khả năng).",
      "Bẫy mệnh đề danh ngữ làm chủ ngữ: Cả cụm 'That + S + V' là một chủ ngữ số ít, động từ chính phía sau phải chia ở số ít."
    ],
    examples: [
      {
        sentence: "Whether the proposed branch relocation will be approved depends heavily on the quarterly budget surplus.",
        translation: "Việc di dời chi nhánh được đề xuất có được phê duyệt hay không phụ thuộc rất lớn vào khoản thặng dư ngân sách hàng quý.",
        analysis: "'Whether the proposed branch relocation will be approved' là mệnh đề danh ngữ đóng vai trò chủ ngữ số ít, động từ chính là 'depends'."
      }
    ],
    questions: [
      {
        id: "ncl7-q1",
        part: "PART_7",
        questionText: "Senior management has not yet determined _______ the regional sales summit will take place in Da Nang or Ho Chi Minh City.",
        options: {
          A: "that",
          B: "whether",
          C: "what",
          D: "which"
        },
        correctAnswer: "B",
        explanation: "Cấu trúc 'whether A or B' diễn tả sự lựa chọn hoặc phân vân giữa 2 phương án (Da Nang or Ho Chi Minh City).",
        trapNote: "Tránh chọn 'that' vì câu mang nghĩa chưa xác định (has not yet determined).",
        translation: "Ban lãnh đạo cấp cao vẫn chưa xác định liệu hội nghị thượng đỉnh bán hàng khu vực sẽ diễn ra ở Đà Nẵng hay Thành phố Hồ Chí Minh.",
        difficulty: "MEDIUM"
      }
    ],
    studiedCount: 0,
    correctCount: 0,
    wrongCount: 0,
    bookmarked: false
  },

  // --- CHỦ ĐIỂM PART 7 (MỚI - ETS 2024): THỂ SAI KHIẾN & GIẢ ĐỊNH TRONG HỢP ĐỒNG ---
  {
    id: "g-subjunctive-part7-2024",
    code: "SUB-P7-24",
    titleVi: "Cấu Trúc Giả Định & Thể Sai Khiến Trong Hợp Đồng & Quy Chế (ETS 2024 Part 7)",
    titleEn: "Subjunctive Mood & Causative Forms in Contracts",
    part: "PART_7",
    targetScore: "500_750",
    status: "PUBLISHED",
    summary: "Đặc trưng của các văn bản chính sách bảo hành, biên bản làm việc và hợp đồng lao động ETS 2024 Part 7 là sử dụng thể giả định sau các động từ yêu cầu, đề xuất (require, mandate, stipulate that S + V-bare).",
    formula: "S + stipulate / mandate / require / request + that + S + (should) + V-nguyên mẫu | have / get + something + done (V3/ed)",
    signalWords: ["mandatory", "required that", "stipulates that", "it is imperative that", "have the system inspected"],
    traps: [
      "Bẫy chia thì theo chủ ngữ số ít: Sau 'require that S', động từ luôn ở dạng nguyên mẫu không chia (ví dụ: 'require that every employee submit' thay vì 'submits')."
    ],
    examples: [
      {
        sentence: "The building maintenance contract stipulates that all air conditioning units be inspected bi-annually by licensed engineers.",
        translation: "Hợp đồng bảo trì tòa nhà quy định rằng tất cả các máy điều hòa nhiệt độ phải được kiểm tra định kỳ hai năm một lần bởi các kỹ sư có chứng chỉ.",
        analysis: "Sau 'stipulates that', động từ giả định là 'be inspected' (dạng nguyên mẫu của to be)."
      }
    ],
    questions: [
      {
        id: "sub7-q1",
        part: "PART_7",
        questionText: "The company travel policy mandates that all international flight bookings _______ made at least two weeks prior to departure.",
        options: {
          A: "are",
          B: "be",
          C: "were",
          D: "been"
        },
        correctAnswer: "B",
        explanation: "Cấu trúc giả định thức: S + mandate that + S + (should) + be + V3/ed. Bắt buộc dùng dạng nguyên thể 'be'.",
        trapNote: "Tránh chọn 'are' theo thói quen chia thì hiện tại đơn số nhiều.",
        translation: "Chính sách công tác của công ty quy định rằng tất cả các đặt vé chuyến bay quốc tế phải được thực hiện trước ngày khởi hành ít nhất hai tuần.",
        difficulty: "MEDIUM"
      }
    ],
    studiedCount: 0,
    correctCount: 0,
    wrongCount: 0,
    bookmarked: false
  },

  // --- CHỦ ĐIỂM PART 7 (MỚI - ETS 2024): TỪ NỐI CHUYỂN ĐOẠN ĐOẠN KÉP / ĐOẠN BA ---
  {
    id: "g-transitional-part7-2024",
    code: "TRN-P7-24",
    titleVi: "Từ Nối Chuyển Đoạn & Xâu Chuỗi Logic Đoạn Kép / Đoạn Ba (ETS 2024 Part 7)",
    titleEn: "Transitional Adverbs in Double & Triple Passages",
    part: "PART_7",
    targetScore: "500_750",
    status: "PUBLISHED",
    summary: "Kỹ năng phân tích từ nối chuyển ý (However, Consequently, Furthermore, In the meantime) là chìa khóa để xâu chuỗi thông tin giữa email và hóa đơn hoặc phiếu đặt hàng trong bài đọc Part 7 ETS 2024.",
    formula: "Mệnh đề 1. However / In contrast / As a result, Mệnh đề 2 | Meanwhile / Subsequently + [Hành động tiếp theo]",
    signalWords: ["Consequently", "In addition", "In the meantime", "On the contrary", "Accordingly", "Therefore", "Nevertheless"],
    traps: [
      "Bẫy hiểu ngược ý: Từ nối chuyển ý phản đối (However / Although) thường chứa thông tin đảo ngược hoàn toàn quyết định trong bức thư đầu tiên."
    ],
    examples: [
      {
        sentence: "The initial order form requested 20 office chairs; however, the attached invoice reflects a revised quantity of 15 units.",
        translation: "Phiếu đặt hàng ban đầu yêu cầu 20 ghế văn phòng; tuy nhiên, hóa đơn đính kèm phản ánh số lượng đã điều chỉnh là 15 chiếc.",
        analysis: "'However' là từ nối bản lề kết nối thông tin giữa phiếu đặt hàng (Văn bản 1) và hóa đơn đính kèm (Văn bản 2)."
      }
    ],
    questions: [
      {
        id: "trn7-q1",
        part: "PART_7",
        questionText: "The manufacturer promised a five-day delivery schedule; _______, severe port congestion has delayed arrival by another week.",
        options: {
          A: "therefore",
          B: "nevertheless",
          C: "likewise",
          D: "furthermore"
        },
        correctAnswer: "B",
        explanation: "Vế trước đưa ra cam kết giao hàng 5 ngày, vế sau nói về sự cố cảng làm trễ 1 tuần -> mối quan hệ tương phản, đối lập, chọn 'nevertheless' (tuy nhiên).",
        trapNote: "Tránh chọn 'therefore' (do đó) vì hai vế mang ý nghĩa trái ngược nhau.",
        translation: "Nhà sản xuất đã hứa hẹn lịch giao hàng trong năm ngày; tuy nhiên, tình trạng tắc nghẽn cảng nghiêm trọng đã làm chậm trễ chuyến hàng thêm một tuần nữa.",
        difficulty: "MEDIUM"
      }
    ],
    studiedCount: 0,
    correctCount: 0,
    wrongCount: 0,
    bookmarked: false
  }
];


