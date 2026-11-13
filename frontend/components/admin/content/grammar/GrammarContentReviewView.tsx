"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Pencil,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { GrammarTopicItem } from "@/app/admin/content/grammar/types";

interface GrammarContentReviewViewProps {
  topics: GrammarTopicItem[];
  onEditTopic: (topic: GrammarTopicItem) => void;
  onChangeStatus: (topic: GrammarTopicItem, status: "DRAFT" | "PUBLISHED") => void;
}

function getMissingRequiredContent(topic: GrammarTopicItem): string[] {
  const missing: string[] = [];
  if (!(topic.titleVi || topic.title)?.trim()) missing.push("Tên chuyên đề tiếng Việt");
  if (!(topic.titleEn || topic.englishTitle)?.trim()) missing.push("Tên chuyên đề tiếng Anh");
  if (!topic.summary?.trim()) missing.push("Tóm tắt");
  if (!topic.formula?.trim()) missing.push("Công thức / lý thuyết");
  if (!topic.questions?.length) missing.push("Ít nhất một câu hỏi");
  return missing;
}

export const GrammarContentReviewView: React.FC<GrammarContentReviewViewProps> = ({
  topics,
  onEditTopic,
  onChangeStatus,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "INCOMPLETE" | "READY" | "DRAFT" | "PUBLISHED">("ALL");
  const reviewItems = useMemo(
    () => topics.map((topic) => ({ topic, missing: getMissingRequiredContent(topic) })),
    [topics],
  );
  const filteredItems = useMemo(() => reviewItems.filter(({ topic, missing }) => {
    const query = search.trim().toLocaleLowerCase();
    const matchesSearch = !query || [
      topic.code,
      topic.titleVi,
      topic.titleEn,
      topic.summary,
      topic.formula,
    ].some((value) => value?.toLocaleLowerCase().includes(query));
    const matchesFilter =
      filter === "ALL" ||
      (filter === "INCOMPLETE" && missing.length > 0) ||
      (filter === "READY" && missing.length === 0) ||
      (filter === "DRAFT" && topic.status !== "PUBLISHED") ||
      (filter === "PUBLISHED" && topic.status === "PUBLISHED");
    return matchesSearch && matchesFilter;
  }), [reviewItems, search, filter]);
  const incompleteCount = reviewItems.filter(({ missing }) => missing.length > 0).length;
  const readyCount = reviewItems.length - incompleteCount;
  const publishedCount = topics.filter((topic) => topic.status === "PUBLISHED").length;
  const draftCount = topics.length - publishedCount;

  return (
    <section className="space-y-5" aria-labelledby="grammar-review-title">
      <div>
        <h2 id="grammar-review-title" className="text-lg font-bold text-slate-900">
          Kiểm tra chất lượng và trạng thái phát hành
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Hoàn thiện các trường bắt buộc, kiểm tra câu hỏi và quản lý trạng thái trước khi đưa chuyên đề lên cho học viên.
          Ví dụ, dấu hiệu và bẫy đề là nội dung bổ sung, không chặn phát hành.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tổng chuyên đề", value: topics.length, color: "text-slate-900" },
          { label: "Đủ điều kiện phát hành", value: readyCount, color: "text-emerald-700" },
          { label: "Cần hoàn thiện", value: incompleteCount, color: "text-rose-700" },
          { label: "Đã phát hành / Bản nháp", value: `${publishedCount} / ${draftCount}`, color: "text-blue-700" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">{item.label}</p>
            <p className={`mt-2 text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Checklist nội dung</h3>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm chuyên đề..."
                aria-label="Tìm chuyên đề cần rà soát"
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs sm:w-56"
              />
            </div>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as typeof filter)}
              aria-label="Lọc trạng thái rà soát"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Tất cả</option>
              <option value="INCOMPLETE">Cần hoàn thiện</option>
              <option value="READY">Đủ điều kiện phát hành</option>
              <option value="DRAFT">Bản nháp</option>
              <option value="PUBLISHED">Đã phát hành</option>
            </select>
          </div>
        </div>
        {filteredItems.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            {reviewItems.length === 0 ? "Chưa có chuyên đề để rà soát." : "Không có chuyên đề phù hợp với bộ lọc."}
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map(({ topic, missing }) => {
              const isPublished = topic.status === "PUBLISHED";
              const isReady = missing.length === 0;
              return (
                <article
                  key={topic.id}
                  className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-500">{topic.code}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {isPublished ? "Đã phát hành" : "Bản nháp"}
                      </span>
                      <span className="text-xs text-slate-500">{topic.part}</span>
                    </div>
                    <h4 className="mt-1 font-semibold text-slate-900">
                      {topic.titleVi || topic.title || "Chưa đặt tên"}
                    </h4>
                    {missing.length > 0 ? (
                      <div className="mt-2 flex items-start gap-2 text-xs text-rose-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>Thiếu nội dung bắt buộc: {missing.join(", ")}</span>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Đủ điều kiện phát hành</span>
                      </div>
                    )}
                    {!topic.examples?.some((example) => example.sentence?.trim()) ? (
                      <p className="mt-1 text-[11px] text-slate-500">Gợi ý bổ sung ví dụ minh họa để nội dung dễ học hơn.</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEditTopic(topic)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Chỉnh sửa nội dung
                    </button>
                    <button
                      type="button"
                      disabled={!isPublished && !isReady}
                      onClick={() => onChangeStatus(topic, isPublished ? "DRAFT" : "PUBLISHED")}
                      title={!isPublished && !isReady ? "Hoàn thiện các mục bắt buộc trước khi phát hành" : undefined}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        isPublished
                          ? "border border-amber-200 text-amber-800 hover:bg-amber-50"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      <ClipboardCheck className="h-3.5 w-3.5" />
                      {isPublished ? "Chuyển về nháp" : "Phát hành"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
