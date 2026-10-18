import { WordItem, VocabularyTestSet } from "./types";
import { ETS_2024_TESTS, ETS_2024_ALL_WORDS } from "./ets2024VocabData";

export const SAMPLE_WORDS: WordItem[] = [
  ...ETS_2024_ALL_WORDS.slice(0, 8),
  {
    id: "w-1",
    word: "negotiate",
    ipa: "/nəˈɡoʊʃieɪt/",
    partOfSpeech: "Verb",
    meaning: "Đàm phán, thương lượng hợp đồng hoặc thỏa thuận thương mại",
    example: "The executive team successfully negotiated a lucrative distribution agreement.",
    exampleMeaning: "Ban điều hành đã thương lượng thành công một thỏa thuận phân phối có lợi nhuận cao.",
    level: "B2",
    starred: true,
  },
  {
    id: "w-2",
    word: "invoice",
    ipa: "/ˈɪnvɔɪs/",
    partOfSpeech: "Noun",
    meaning: "Hóa đơn thanh toán hàng hóa hoặc dịch vụ",
    example: "All invoices must be submitted to the finance department by the end of each month.",
    exampleMeaning: "Tất cả hóa đơn phải được nộp cho bộ phận tài chính vào cuối mỗi tháng.",
    level: "B1",
  },
  {
    id: "w-3",
    word: "implement",
    ipa: "/ˈɪmplɪment/",
    partOfSpeech: "Verb",
    meaning: "Triển khai, thực thi chính sách hoặc quy trình mới",
    example: "We plan to implement the revised safety protocol starting next Monday.",
    exampleMeaning: "Chúng tôi dự định thực thi quy trình an toàn đã sửa đổi bắt đầu từ thứ Hai tuần tới.",
    level: "B2",
  },
  {
    id: "w-4",
    word: "itinerary",
    ipa: "/aɪˈtɪnəreri/",
    partOfSpeech: "Noun",
    meaning: "Lịch trình chi tiết chuyến đi công tác hoặc hội nghị",
    example: "The corporate travel coordinator emailed the complete flight itinerary to the delegate.",
    exampleMeaning: "Điều phối viên du lịch công ty đã gửi email lịch trình chuyến bay đầy đủ cho đại biểu.",
    level: "B1",
  },
  {
    id: "w-5",
    word: "warranty",
    ipa: "/ˈwɔːrənti/",
    partOfSpeech: "Noun",
    meaning: "Phiếu bảo hành hoặc cam kết chất lượng sản phẩm",
    example: "The commercial air conditioner is covered by an extensive three-year warranty.",
    exampleMeaning: "Máy điều hòa thương mại được bảo hành toàn diện trong vòng ba năm.",
    level: "B1",
    starred: true,
  },
  {
    id: "w-6",
    word: "collaborate",
    ipa: "/kəˈlæbəreɪt/",
    partOfSpeech: "Verb",
    meaning: "Hợp tác, cùng làm việc trong dự án",
    example: "Engineers from both branches collaborated on developing the AI engine.",
    exampleMeaning: "Các kỹ sư từ cả hai chi nhánh đã hợp tác phát triển động cơ AI.",
    level: "B2",
  },
  {
    id: "w-7",
    word: "revenue",
    ipa: "/ˈrevənuː/",
    partOfSpeech: "Noun",
    meaning: "Tổng doanh thu, nguồn thu nhập doanh nghiệp",
    example: "Online marketing efforts resulted in a 25% increase in total quarterly revenue.",
    exampleMeaning: "Các nỗ lực tiếp thị trực tuyến đã mang lại mức tăng 25% tổng doanh thu hàng quý.",
    level: "B2",
  },
  {
    id: "w-8",
    word: "recruit",
    ipa: "/rɪˈkruːt/",
    partOfSpeech: "Verb",
    meaning: "Tuyển dụng nhân sự mới cho cơ quan tổ chức",
    example: "The human resources manager hopes to recruit talented front-end developers.",
    exampleMeaning: "Trưởng phòng nhân sự hy vọng tuyển dụng được các lập trình viên front-end tài năng.",
    level: "B1",
  },
];

export const INITIAL_TESTS: VocabularyTestSet[] = [
  // 10 Tests chính thức từ bộ đề ETS 2024
  ...ETS_2024_TESTS,

  // ETS 2026
  { id: "test-2026-1",  code: "ETS_2026_TEST1",  nameVi: "Test 1 (ETS 2026)",  nameEn: "ETS 2026 Test 1",  year: 2026, category: "ETS_EXAM",  status: "DRAFT",     wordCount: SAMPLE_WORDS.length },
  { id: "test-2026-2",  code: "ETS_2026_TEST2",  nameVi: "Test 2 (ETS 2026)",  nameEn: "ETS 2026 Test 2",  year: 2026, category: "ETS_EXAM",  status: "DRAFT",     wordCount: SAMPLE_WORDS.length },
  { id: "test-2026-3",  code: "ETS_2026_TEST3",  nameVi: "Test 3 (ETS 2026)",  nameEn: "ETS 2026 Test 3",  year: 2026, category: "ETS_EXAM",  status: "DRAFT",     wordCount: SAMPLE_WORDS.length },
  { id: "test-2026-4",  code: "ETS_2026_TEST4",  nameVi: "Test 4 (ETS 2026)",  nameEn: "ETS 2026 Test 4",  year: 2026, category: "ETS_EXAM",  status: "DRAFT",     wordCount: SAMPLE_WORDS.length },
  { id: "test-2026-5",  code: "ETS_2026_TEST5",  nameVi: "Test 5 (ETS 2026)",  nameEn: "ETS 2026 Test 5",  year: 2026, category: "ETS_EXAM",  status: "DRAFT",     wordCount: SAMPLE_WORDS.length },
  { id: "test-2026-6",  code: "ETS_2026_TEST6",  nameVi: "Test 6 (ETS 2026)",  nameEn: "ETS 2026 Test 6",  year: 2026, category: "ETS_EXAM",  status: "DRAFT",     wordCount: SAMPLE_WORDS.length },
  { id: "test-2026-7",  code: "ETS_2026_TEST7",  nameVi: "Test 7 (ETS 2026)",  nameEn: "ETS 2026 Test 7",  year: 2026, category: "ETS_EXAM",  status: "DRAFT",     wordCount: SAMPLE_WORDS.length },
  { id: "test-2026-8",  code: "ETS_2026_TEST8",  nameVi: "Test 8 (ETS 2026)",  nameEn: "ETS 2026 Test 8",  year: 2026, category: "ETS_EXAM",  status: "DRAFT",     wordCount: SAMPLE_WORDS.length },
  { id: "test-2026-9",  code: "ETS_2026_TEST9",  nameVi: "Test 9 (ETS 2026)",  nameEn: "ETS 2026 Test 9",  year: 2026, category: "ETS_EXAM",  status: "DRAFT",     wordCount: SAMPLE_WORDS.length },
  { id: "test-2026-10", code: "ETS_2026_TEST10", nameVi: "Test 10 (ETS 2026)", nameEn: "ETS 2026 Test 10", year: 2026, category: "ETS_EXAM",  status: "DRAFT",     wordCount: SAMPLE_WORDS.length },

  // 600 Essential Words
  { id: "essential-1", code: "600_CONTRACTS",   nameVi: "Contracts (Hợp đồng)",      nameEn: "Contracts",      category: "ESSENTIAL", status: "PUBLISHED", wordCount: SAMPLE_WORDS.length },
  { id: "essential-2", code: "600_MARKETING",   nameVi: "Marketing (Tiếp thị)",      nameEn: "Marketing",      category: "ESSENTIAL", status: "PUBLISHED", wordCount: SAMPLE_WORDS.length },
  { id: "essential-3", code: "600_WARRANTIES",  nameVi: "Warranties (Bảo hành)",     nameEn: "Warranties",     category: "ESSENTIAL", status: "PUBLISHED", wordCount: SAMPLE_WORDS.length },
  { id: "essential-4", code: "600_OFFICE",      nameVi: "Office Equipment",          nameEn: "Office Equipment", category: "ESSENTIAL", status: "PUBLISHED", wordCount: SAMPLE_WORDS.length },
  { id: "essential-5", code: "600_HR",          nameVi: "Human Resources (Nhân sự)", nameEn: "Human Resources",  category: "ESSENTIAL", status: "PUBLISHED", wordCount: SAMPLE_WORDS.length },
  { id: "essential-6", code: "600_FINANCE",     nameVi: "Financial Reports (Tài chính)",nameEn: "Financial Reports",category: "ESSENTIAL", status: "PUBLISHED", wordCount: SAMPLE_WORDS.length },

  // ETS 2023
  { id: "test-2023-1", code: "ETS_2023_TEST1", nameVi: "Test 1 (ETS 2023)", nameEn: "ETS 2023 Test 1", year: 2023, category: "ETS_EXAM", status: "PUBLISHED", wordCount: SAMPLE_WORDS.length },
  { id: "test-2023-2", code: "ETS_2023_TEST2", nameVi: "Test 2 (ETS 2023)", nameEn: "ETS 2023 Test 2", year: 2023, category: "ETS_EXAM", status: "PUBLISHED", wordCount: SAMPLE_WORDS.length },
  { id: "test-2023-3", code: "ETS_2023_TEST3", nameVi: "Test 3 (ETS 2023)", nameEn: "ETS 2023 Test 3", year: 2023, category: "ETS_EXAM", status: "PUBLISHED", wordCount: SAMPLE_WORDS.length },
  { id: "test-2023-4", code: "ETS_2023_TEST4", nameVi: "Test 4 (ETS 2023)", nameEn: "ETS 2023 Test 4", year: 2023, category: "ETS_EXAM", status: "PUBLISHED", wordCount: SAMPLE_WORDS.length },
];
