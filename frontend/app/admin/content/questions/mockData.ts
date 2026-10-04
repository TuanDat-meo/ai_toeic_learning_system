import { QuestionItem, QuestionPart } from "./types";

export const DEFAULT_PARTS: { part: QuestionPart | "ALL"; label: string; desc: string }[] = [
  { part: "ALL", label: "Tất cả Part", desc: "Toàn bộ ngân hàng câu hỏi" },
  { part: "Part 1", label: "Part 1", desc: "Mô tả hình ảnh (Photographs)" },
  { part: "Part 2", label: "Part 2", desc: "Hỏi & Đáp (Question - Response)" },
  { part: "Part 3", label: "Part 3", desc: "Hội thoại ngắn (Conversations)" },
  { part: "Part 4", label: "Part 4", desc: "Bài nói ngắn (Short Talks)" },
  { part: "Part 5", label: "Part 5", desc: "Hoàn thành câu (Incomplete Sentences)" },
  { part: "Part 6", label: "Part 6", desc: "Điền đoạn văn (Text Completion)" },
  { part: "Part 7", label: "Part 7", desc: "Đọc hiểu văn bản (Reading)" },
];

export const DEFAULT_SKILLS = [
  "Grammar (Ngữ pháp)",
  "Vocabulary (Từ vựng)",
  "Inference (Suy luận)",
  "Detail (Thông tin chi tiết)",
  "Main Idea (Ý chính)",
  "Collocation (Cụm từ cố định)",
  "Connecting Words (Liên từ & Giới từ)",
  "Pronunciation & Listening (Nghe hiểu)",
];

export const INITIAL_QUESTIONS: QuestionItem[] = [
  // --- PART 1: PHOTOGRAPHS ---
  {
    id: "q-101",
    code: "P1-001",
    part: "Part 1",
    questionText: "Look at the photograph and choose the statement that best describes what you see:",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    audioUrl: "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
    options: [
      { id: "A", text: "She is hanging a whiteboard on the wall.", isCorrect: false },
      { id: "B", text: "She is working at a computer workstation.", isCorrect: true },
      { id: "C", text: "She is filing paper documents into a metal cabinet.", isCorrect: false },
      { id: "D", text: "She is answering an incoming telephone call.", isCorrect: false },
    ],
    correctAnswer: "B",
    skill: "Detail (Thông tin chi tiết)",
    difficulty: "Easy",
    explanation:
      "Bức ảnh thể hiện rõ người phụ nữ đang tập trung gõ phím làm việc tại bàn máy tính ('She is working at a computer workstation'). Các phương án khác mô tả sai hành động.",
    status: "PUBLISHED",
  },
  {
    id: "q-102",
    code: "P1-002",
    part: "Part 1",
    questionText: "Look at the photograph and choose the best descriptive statement:",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80",
    options: [
      { id: "A", text: "Some ladders are leaning against the brick wall.", isCorrect: false },
      { id: "B", text: "Heavy trucks are parked along the highway.", isCorrect: false },
      { id: "C", text: "The workers are wearing protective safety helmets.", isCorrect: true },
      { id: "D", text: "Tools are being stored inside the warehouse.", isCorrect: false },
    ],
    correctAnswer: "C",
    skill: "Detail (Thông tin chi tiết)",
    difficulty: "Medium",
    explanation:
      "Phương án C mô tả chính xác đặc điểm của người trong ảnh: 'The workers are wearing protective safety helmets' (Các công nhân đang đội mũ bảo hộ lao động tại công trường).",
    status: "PUBLISHED",
  },

  // --- PART 2: QUESTION - RESPONSE ---
  {
    id: "q-201",
    code: "P2-015",
    part: "Part 2",
    questionText: "Audio Prompt: Where should I file the newly approved shipment invoices?",
    audioUrl: "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
    options: [
      { id: "A", text: "In the filing cabinet next to the reception desk.", isCorrect: true },
      { id: "B", text: "Yes, the delivery arrived yesterday afternoon.", isCorrect: false },
      { id: "C", text: "About fifty dollars per invoice.", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Pronunciation & Listening (Nghe hiểu)",
    difficulty: "Easy",
    explanation:
      "Câu hỏi bắt đầu bằng từ để hỏi 'Where' (Ở đâu). Câu trả lời chỉ địa điểm nơi chốn chính xác là 'In the filing cabinet next to the reception desk' (Trong tủ hồ sơ cạnh quầy lễ tân). Phương án B bẫy Yes/No không dùng cho câu hỏi Wh-.",
    status: "PUBLISHED",
  },
  {
    id: "q-202",
    code: "P2-016",
    part: "Part 2",
    questionText: "Audio Prompt: Has Mr. Kim finalized the contract negotiation with the Japanese supplier?",
    audioUrl: "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
    options: [
      { id: "A", text: "At the Tokyo international airport.", isCorrect: false },
      { id: "B", text: "He is still reviewing the final terms.", isCorrect: true },
      { id: "C", text: "Yes, I enjoyed my vacation there.", isCorrect: false },
    ],
    correctAnswer: "B",
    skill: "Pronunciation & Listening (Nghe hiểu)",
    difficulty: "Medium",
    explanation:
      "Câu hỏi Yes/No ở thì hiện tại hoàn thành. Phương án B đưa ra câu trả lời gián tiếp thường gặp trong đề thi TOEIC: 'He is still reviewing the final terms' (Anh ấy vẫn đang xem xét các điều khoản cuối cùng).",
    status: "PUBLISHED",
  },

  // --- PART 3: CONVERSATIONS ---
  {
    id: "q-301",
    code: "P3-301",
    part: "Part 3",
    passage:
      "Man: Hello, Ms. Gomez. Did the shipment of replacement toner cartridges arrive from the supplier yet?\nWoman: No, unfortunately. The logistics rep called and said the delivery truck was delayed due to the highway snowstorm.\nMan: Oh no. We need those cartridges for printing the annual conference booklets this afternoon.\nWoman: Don't worry. I will borrow two cartridges from the accounting department on the third floor.",
    questionText: "What does the woman offer to do to solve the immediate problem?",
    audioUrl: "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
    options: [
      { id: "A", text: "Cancel the annual conference", isCorrect: false },
      { id: "B", text: "Borrow supplies from another department", isCorrect: true },
      { id: "C", text: "Drive to the supplier's warehouse", isCorrect: false },
      { id: "D", text: "Reprint the documents tomorrow", isCorrect: false },
    ],
    correctAnswer: "B",
    skill: "Detail (Thông tin chi tiết)",
    difficulty: "Medium",
    explanation:
      "Trong lượt nói cuối cùng, người phụ nữ nói: 'I will borrow two cartridges from the accounting department on the third floor' -> Phương án đúng là B (Borrow supplies from another department).",
    status: "PUBLISHED",
  },

  // --- PART 4: SHORT TALKS ---
  {
    id: "q-401",
    code: "P4-401",
    part: "Part 4",
    passage:
      "Attention all passengers on flight VN-302 to Tokyo Narita. Due to scheduled runway maintenance, boarding will be delayed by thirty minutes. Please remain seated near Gate 14 until gate agents begin boarding group A.",
    questionText: "What is the main purpose of the airport announcement?",
    audioUrl: "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
    options: [
      { id: "A", text: "To announce a flight departure delay", isCorrect: true },
      { id: "B", text: "To report a lost piece of baggage", isCorrect: false },
      { id: "C", text: "To notify passengers of a gate change", isCorrect: false },
      { id: "D", text: "To request volunteers for a later flight", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Main Idea (Ý chính)",
    difficulty: "Easy",
    explanation:
      "Thông báo mở đầu bằng: 'Due to scheduled runway maintenance, boarding will be delayed by thirty minutes' -> Mục đích chính là thông báo hoãn giờ lên máy bay.",
    status: "PUBLISHED",
  },

  // --- PART 5: INCOMPLETE SENTENCES ---
  {
    id: "q-501",
    code: "P5-101",
    part: "Part 5",
    questionText:
      "Ms. Tanaka requested that all department managers submit their quarterly reports ______ Friday afternoon.",
    options: [
      { id: "A", text: "before", isCorrect: true },
      { id: "B", text: "until", isCorrect: false },
      { id: "C", text: "along", isCorrect: false },
      { id: "D", text: "between", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Connecting Words (Liên từ & Giới từ)",
    difficulty: "Easy",
    explanation:
      "Dùng giới từ 'before' để chỉ hành động hoàn tất trước một hạn chót thời gian cụ thể ('before Friday afternoon'). 'Until' dùng cho hành động diễn ra liên tục.",
    status: "PUBLISHED",
  },
  {
    id: "q-502",
    code: "P5-102",
    part: "Part 5",
    questionText:
      "The newly appointed CEO has proposed an ______ plan to expand commercial operations into Southeast Asia.",
    options: [
      { id: "A", text: "ambitious", isCorrect: true },
      { id: "B", text: "ambitiously", isCorrect: false },
      { id: "C", text: "ambition", isCorrect: false },
      { id: "D", text: "ambitiousness", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Vocabulary (Từ vựng)",
    difficulty: "Medium",
    explanation:
      "Đứng trước danh từ 'plan' cần một tính từ bổ nghĩa ('an ambitious plan' - một kế hoạch đầy tham vọng).",
    status: "PUBLISHED",
  },
  {
    id: "q-503",
    code: "P5-103",
    part: "Part 5",
    questionText:
      "Passengers must present their boarding pass and photo identification prior to ______ the aircraft.",
    options: [
      { id: "A", text: "board", isCorrect: false },
      { id: "B", text: "boarding", isCorrect: true },
      { id: "C", text: "boarded", isCorrect: false },
      { id: "D", text: "boards", isCorrect: false },
    ],
    correctAnswer: "B",
    skill: "Grammar (Ngữ pháp)",
    difficulty: "Easy",
    explanation:
      "Sau cụm giới từ 'prior to' cần danh động từ V-ing ('boarding the aircraft' - trước khi lên máy bay).",
    status: "PUBLISHED",
  },
  {
    id: "q-504",
    code: "P5-104",
    part: "Part 5",
    questionText:
      "All laboratory chemicals must be stored in ______ containers to prevent accidental leakage during transit.",
    options: [
      { id: "A", text: "secure", isCorrect: true },
      { id: "B", text: "securely", isCorrect: false },
      { id: "C", text: "securing", isCorrect: false },
      { id: "D", text: "security", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Vocabulary (Từ vựng)",
    difficulty: "Medium",
    explanation:
      "Trước danh từ 'containers' cần tính từ 'secure' mang nghĩa 'chắc chắn, an toàn'.",
    status: "PUBLISHED",
  },
  {
    id: "q-505",
    code: "P5-105",
    part: "Part 5",
    questionText:
      "Neither the marketing director ______ the project coordinator was aware of the sudden schedule alteration.",
    options: [
      { id: "A", text: "or", isCorrect: false },
      { id: "B", text: "nor", isCorrect: true },
      { id: "C", text: "and", isCorrect: false },
      { id: "D", text: "but", isCorrect: false },
    ],
    correctAnswer: "B",
    skill: "Grammar (Ngữ pháp)",
    difficulty: "Medium",
    explanation:
      "Cặp liên từ tương quan bắt buộc trong TOEIC: 'Neither ... nor ...' (Không ... cũng không ...).",
    status: "PUBLISHED",
  },
  {
    id: "q-506",
    code: "P5-106",
    part: "Part 5",
    questionText:
      "The executive team expressed gratitude to all employees ______ dedication contributed to the merger's success.",
    options: [
      { id: "A", text: "who", isCorrect: false },
      { id: "B", text: "whom", isCorrect: false },
      { id: "C", text: "whose", isCorrect: true },
      { id: "D", text: "which", isCorrect: false },
    ],
    correctAnswer: "C",
    skill: "Grammar (Ngữ pháp)",
    difficulty: "Hard",
    explanation:
      "Khoảng trống đứng trước danh từ 'dedication' và sau danh từ chỉ người 'all employees' thể hiện quan hệ sở hữu -> dùng đại từ quan hệ 'whose'.",
    status: "PUBLISHED",
  },

  // --- PART 6: TEXT COMPLETION ---
  {
    id: "q-601",
    code: "P6-201",
    part: "Part 6",
    passage:
      "Notice to all building tenants: Please note that the third-floor cafeteria will be closed ______ the entire month of August for comprehensive refurbishment. During this period, food trucks will be stationed outside the main entrance.",
    questionText:
      "Choose the appropriate preposition to complete the sentence in the notice:",
    options: [
      { id: "A", text: "for", isCorrect: true },
      { id: "B", text: "since", isCorrect: false },
      { id: "C", text: "while", isCorrect: false },
      { id: "D", text: "among", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Connecting Words (Liên từ & Giới từ)",
    difficulty: "Medium",
    explanation:
      "Giới từ 'for' đi với khoảng thời gian ('for the entire month of August' - trong suốt cả tháng Tám). 'Since' chỉ mốc thời gian bắt đầu.",
    status: "PUBLISHED",
  },

  // --- PART 7: READING COMPREHENSION ---
  {
    id: "q-701",
    code: "P7-501",
    part: "Part 7",
    passage:
      "To: All Staff Members\nFrom: Human Resources Department\nSubject: Mandatory Data Security Training Seminar\n\nPlease be reminded that attendance at the cybersecurity workshop on Oct 15th is mandatory for all team members hired within the past six months. The session will cover safe password handling and phishing detection.",
    questionText: "What is indicated about the upcoming cybersecurity workshop?",
    options: [
      { id: "A", text: "It is mandatory for all recently hired personnel", isCorrect: true },
      { id: "B", text: "It will be held at an off-site conference hall", isCorrect: false },
      { id: "C", text: "Participants must bring their personal laptops", isCorrect: false },
      { id: "D", text: "It has been rescheduled to next month", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Inference (Suy luận)",
    difficulty: "Hard",
    explanation:
      "Đoạn văn nêu rõ: 'attendance at the cybersecurity workshop on Oct 15th is mandatory for all team members hired within the past six months' -> Đáp án đúng là A.",
    status: "PUBLISHED",
  },
  {
    id: "q-702",
    code: "P7-502",
    part: "Part 7",
    passage:
      "PRESS RELEASE — Apex Logistics Corp has completed the acquisition of Pacific Express for $45 million. The deal expands Apex's freight forwarding network across seven Asian ports.",
    questionText: "According to the press release, what did Apex Logistics Corp do?",
    options: [
      { id: "A", text: "Acquired another freight company", isCorrect: true },
      { id: "B", text: "Opened a new headquarters in Europe", isCorrect: false },
      { id: "C", text: "Lowered shipping rates by 45 percent", isCorrect: false },
      { id: "D", text: "Sold its fleet of container ships", isCorrect: false },
    ],
    correctAnswer: "A",
    skill: "Main Idea (Ý chính)",
    difficulty: "Medium",
    explanation:
      "Bản thông cáo báo chí nêu rõ: 'Apex Logistics Corp has completed the acquisition of Pacific Express' -> Apex đã thâu tóm/mua lại một công ty vận tải khác.",
    status: "PUBLISHED",
  },
];
