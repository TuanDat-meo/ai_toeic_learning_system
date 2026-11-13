import type { GrammarQuestionItem, GrammarTopicItem } from "@/app/admin/content/grammar/types";

export interface GrammarReviewFinding {
  id: string;
  severity: "error" | "warning";
  message: string;
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function questionProblems(question: GrammarQuestionItem): string[] {
  const problems: string[] = [];
  if (!nonEmpty(question.questionText)) problems.push("thiếu nội dung câu hỏi");
  if (!["PART_5", "PART_6", "PART_7", "Part 5", "Part 6", "Part 7"].includes(question.part)) {
    problems.push("Part không hợp lệ");
  }
  const answer = question.correctAnswer.toUpperCase();
  if (!["A", "B", "C", "D"].includes(answer)) problems.push("đáp án đúng không thuộc A–D");
  for (const option of ["A", "B", "C", "D"] as const) {
    if (!nonEmpty(question.options?.[option])) problems.push(`thiếu phương án ${option}`);
  }
  if (["A", "B", "C", "D"].includes(answer) && !nonEmpty(question.options?.[answer as "A" | "B" | "C" | "D"])) {
    problems.push("đáp án đúng không có nội dung");
  }
  if (!nonEmpty(question.explanation)) problems.push("thiếu giải thích đáp án");
  return problems;
}

export function analyzeGrammarTopic(
  topic: GrammarTopicItem,
  allTopics: GrammarTopicItem[],
  targetStatus: string = topic.status,
): GrammarReviewFinding[] {
  const findings: GrammarReviewFinding[] = [];
  const requiredSeverity = targetStatus === "PUBLISHED" ? "error" : "warning";
  const add = (id: string, severity: GrammarReviewFinding["severity"], message: string) => {
    findings.push({ id, severity, message });
  };
  const titleVi = topic.titleVi || topic.title;
  const titleEn = topic.titleEn || topic.englishTitle;
  const hasChildren = allTopics.some((item) => item.parentTopicId === topic.id);

  if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(topic.status)) {
    add("status", targetStatus === "PUBLISHED" ? "error" : "warning", "Trạng thái chủ điểm không hợp lệ.");
  }
  if (!["PART_5", "PART_6", "PART_7", "Part 5", "Part 6", "Part 7"].includes(topic.part)) {
    add("part", requiredSeverity, "Phần TOEIC của chủ điểm không hợp lệ.");
  }
  if (!nonEmpty(titleVi)) add("titleVi", requiredSeverity, "Thiếu tên chủ điểm tiếng Việt.");
  if (!nonEmpty(titleEn)) add("titleEn", requiredSeverity, "Thiếu tên chủ điểm tiếng Anh.");
  if (!nonEmpty(topic.summary)) add("summary", requiredSeverity, "Thiếu tóm tắt nội dung.");
  if (!nonEmpty(topic.formula)) add("formula", requiredSeverity, "Thiếu công thức hoặc cấu trúc cốt lõi.");

  if (allTopics.some((item) => item.id !== topic.id && item.code.trim().toLocaleLowerCase() === topic.code.trim().toLocaleLowerCase())) {
    add("duplicateCode", targetStatus === "PUBLISHED" ? "error" : "warning", "Mã chủ điểm bị trùng.");
  }
  if (topic.parentTopicId && !allTopics.some((item) => item.id === topic.parentTopicId)) {
    add("missingParent", "warning", "Chủ điểm cha không còn trong danh sách dữ liệu.");
  }

  if (!hasChildren && !topic.questions?.length && !topic.linkedToeicQuestionCount) {
    add("questions", requiredSeverity, "Chủ điểm chưa có câu hỏi; chủ điểm cha có chủ điểm con được miễn yêu cầu này.");
  }
  if (!topic.examples?.some((example) => nonEmpty(example.sentence) && nonEmpty(example.translation))) {
    add("examples", "warning", "Chưa có ví dụ đầy đủ cả câu tiếng Anh và bản dịch.");
  }
  const theoryFieldCount = Object.values(topic.theory || {}).filter(nonEmpty).length
    + Object.values(topic.metadata?.groupValues?.[topic.grammarGroup || "other"] || {}).filter(nonEmpty).length;
  if (theoryFieldCount === 0) add("theory", "warning", "Chưa có trường lý thuyết chi tiết.");
  if (!topic.traps?.some(nonEmpty)) add("traps", "warning", "Chưa khai báo bẫy hoặc lỗi thường gặp.");
  if (!topic.signalWords?.some(nonEmpty)) add("signalWords", "warning", "Chưa khai báo dấu hiệu nhận biết.");

  const questionSeverity = targetStatus === "PUBLISHED" ? "error" : "warning";
  const seenQuestions = new Set<string>();
  topic.questions?.forEach((question, index) => {
    const problems = questionProblems(question);
    if (problems.length) {
      add(`question-${index}`, questionSeverity, `Câu hỏi ${index + 1}: ${problems.join(", ")}.`);
    }
    const normalized = question.questionText.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    if (normalized && seenQuestions.has(normalized)) {
      add(`duplicate-question-${index}`, "warning", `Câu hỏi ${index + 1} bị trùng nội dung trong chủ điểm.`);
    }
    if (normalized) seenQuestions.add(normalized);
  });

  const seenExamples = new Set<string>();
  topic.examples?.forEach((example, index) => {
    const hasSentence = nonEmpty(example.sentence);
    const hasTranslation = nonEmpty(example.translation);
    if (hasSentence !== hasTranslation) {
      add(`example-${index}`, "warning", `Ví dụ ${index + 1} chưa đủ câu tiếng Anh và bản dịch.`);
    }
    const normalized = example.sentence.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    if (normalized && seenExamples.has(normalized)) {
      add(`duplicate-example-${index}`, "warning", `Ví dụ ${index + 1} bị trùng câu.`);
    }
    if (normalized) seenExamples.add(normalized);
  });

  return findings;
}
