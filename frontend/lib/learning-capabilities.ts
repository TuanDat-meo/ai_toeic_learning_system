export type LearningCapability = {
  key: string;
  label: string;
  description: string;
  availability: "IN_DEVELOPMENT";
};

// Shared by the learner dashboard/navigation and the admin learning-package editor.
export const LEARNING_CAPABILITIES: LearningCapability[] = [
  { key: "VOCABULARY", label: "Từ vựng", description: "Học từ theo chủ đề và ôn tập định kỳ.", availability: "IN_DEVELOPMENT" },
  { key: "GRAMMAR", label: "Ngữ pháp", description: "Củng cố cấu trúc thường gặp trong TOEIC.", availability: "IN_DEVELOPMENT" },
  { key: "LISTENING", label: "Listening", description: "Luyện nghe theo từng dạng bài.", availability: "IN_DEVELOPMENT" },
  { key: "READING", label: "Reading", description: "Rèn kỹ năng đọc hiểu và quản lý thời gian.", availability: "IN_DEVELOPMENT" },
  { key: "MOCK_TEST", label: "Thi thử", description: "Làm bài kiểm tra và xem kết quả tổng hợp.", availability: "IN_DEVELOPMENT" },
];

export const learningCapabilityLabel = (key: string) =>
  LEARNING_CAPABILITIES.find((capability) => capability.key === key)?.label ?? key;
