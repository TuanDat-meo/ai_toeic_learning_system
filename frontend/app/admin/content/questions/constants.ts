import type { QuestionPart } from "./types";

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
