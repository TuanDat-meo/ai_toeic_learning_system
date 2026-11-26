import type { QuestionItem } from "@/app/admin/content/questions/types";
import { apiRequest, uploadAuthRequest, writeAuthRequest } from "./client";

export type QuestionBankWrite = Omit<QuestionItem, "id" | "createdAt" | "steps" | "vocabList"> & {
  code?: string;
};

const endpoint = "/api/admin/question-bank/questions";

export type QuestionBankMediaUpload = {
  url: string;
  fileName: string;
  sizeBytes: number;
  contentType: string;
};

export async function uploadQuestionBankMedia(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return uploadAuthRequest<QuestionBankMediaUpload>(`${endpoint}/media`, formData);
}

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
