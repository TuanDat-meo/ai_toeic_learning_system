import type { QuestionItem } from "@/app/admin/content/questions/types";
import { apiRequest, writeAuthRequest } from "./client";

export type QuestionBankWrite = Omit<QuestionItem, "id" | "createdAt" | "steps" | "vocabList"> & {
  code?: string;
};

const endpoint = "/api/admin/question-bank/questions";

export function getQuestionBankQuestions() {
  return apiRequest<QuestionItem[]>(endpoint);
}

export function createQuestionBankQuestion(question: QuestionBankWrite) {
  return writeAuthRequest<QuestionItem>("POST", endpoint, question);
}

export function updateQuestionBankQuestion(id: string, question: QuestionBankWrite) {
  return writeAuthRequest<QuestionItem>("PUT", `${endpoint}/${encodeURIComponent(id)}`, question);
}

export function deleteQuestionBankQuestion(id: string) {
  return writeAuthRequest<void>("DELETE", `${endpoint}/${encodeURIComponent(id)}`);
}

export function deleteQuestionBankQuestions(ids: string[]) {
  return writeAuthRequest<{ deletedCount: number }>("DELETE", endpoint, ids.map(Number));
}
