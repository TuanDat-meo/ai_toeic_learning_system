"use client";

import { expandGrammarQuestions } from "@/lib/toeicQuestionExpander";
import { recordQuestionAnswer, getItemProgress } from "@/lib/practiceProgress";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  FileText,
  Play,
  Trash2,
  Check,
  Award,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ListChecks,
  Archive,
  LoaderCircle,
} from "lucide-react";
import { GrammarTopicItem, GrammarQuestionItem, GrammarCategory, GrammarWordFamilyLink, GrammarExampleAnnotation } from "@/app/admin/content/grammar/types";

import { QuestionErrorReportButton } from "@/components/support/QuestionErrorReportButton";
import {
  GrammarFormulaViewer,
  GrammarSignalsViewer,
  GrammarTrapsViewer,
  GrammarExamplesViewer,
  GrammarQuestionsViewer,
  FormattedText,
} from "./GrammarFormulaViewer";
import { INITIAL_GRAMMAR_TOPICS } from "@/app/admin/content/grammar/mockData";
import { playUnifiedAnswerSound } from "@/lib/sound";
import {
  generateGrammarContentSuggestion,
  getGrammarCategories,
  getGrammarTopic,
  saveGrammarCategory,
  updateGrammarCategory,
  deleteGrammarCategory,
  getGrammarTopicLifecycleImpact,
  type DeleteGrammarTopicRequest,
  type GrammarTopicLifecycleImpact,
} from "@/lib/api/grammar";
import { getAdminVocabularySets } from "@/lib/api/vocabulary";
import type { WordItem } from "@/app/admin/content/vocabulary/types";
import { GrammarExampleAnnotations } from "./GrammarExampleAnnotations";
import { translateVietnameseToEnglish } from "@/lib/api/example-translation";

const GRAMMAR_TAB_LABELS = {
  info: "Thông tin chung",
  theory: "Lý thuyết",
  formula: "Công thức & bẫy",
  examples: "Ví dụ minh họa",
  questions: "Câu hỏi",
} as const;

// ==========================================
// 1. MODAL XEM CHI TIẾT CHỦ ĐIỂM NGỮ PHÁP
// ==========================================
interface GrammarTopicDetailModalProps {
  topic: GrammarTopicItem | null;
  topics?: GrammarTopicItem[];
  onClose: () => void;
  onStartQuiz?: (topic: GrammarTopicItem) => void;
  audience?: "student" | "admin";
}

export const GrammarTopicDetailModal: React.FC<GrammarTopicDetailModalProps> = ({
  topic: topicProp,
  topics = [],
  onClose,
  onStartQuiz,
  audience = "student",
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "theory" | "formula" | "examples" | "questions">("info");
  const [detailTopic, setDetailTopic] = useState<GrammarTopicItem | null>(topicProp);

  useEffect(() => {
    if (!topicProp) {
      setDetailTopic(null);
      return;
    }
    setActiveTab("info");

    const mock = audience === "student" ? INITIAL_GRAMMAR_TOPICS.find(
      (m) =>
        m.id === topicProp.id ||
        m.code === topicProp.code ||
        (m.titleVi && topicProp.titleVi && m.titleVi.toLowerCase().includes(topicProp.titleVi.toLowerCase())) ||
        (m.title && topicProp.title && m.title.toLowerCase().includes(topicProp.title.toLowerCase()))
    ) : undefined;

    const merged: GrammarTopicItem = {
      ...topicProp,
      examples:
        topicProp.examples && topicProp.examples.length > 0 && topicProp.examples.some((e) => e.sentence)
          ? topicProp.examples
          : mock?.examples || [],
      questions:
        topicProp.questions && topicProp.questions.length > 0
          ? topicProp.questions
          : mock?.questions || [],
      signalWords:
        topicProp.signalWords && topicProp.signalWords.length > 0
          ? topicProp.signalWords
          : mock?.signalWords || [],
      traps:
        topicProp.traps && topicProp.traps.length > 0
          ? topicProp.traps
          : mock?.traps || [],
      formula: topicProp.formula || mock?.formula || "",
    };

    setDetailTopic(merged);

    if (topicProp.id) {
      getGrammarTopic(topicProp.id)
        .then((fetched) => {
          if (fetched) {
            setDetailTopic((prev) => ({
              ...prev,
              ...fetched,
              examples:
                fetched.examples && fetched.examples.length > 0 && fetched.examples.some((e) => e.sentence)
                  ? fetched.examples
                  : merged.examples,
              questions:
                fetched.questions && fetched.questions.length > 0
                  ? fetched.questions
                  : merged.questions,
            }));
          }
        })
        .catch(() => {});
    }
  }, [topicProp, audience]);

  const topic = detailTopic || topicProp;
  if (!topic) return null;
  const childTopics = topics.filter((item) => item.parentTopicId === topic.id);
  const isParentTopic = childTopics.length > 0;
  const examplesCount = isParentTopic
    ? childTopics.reduce((sum, child) => sum + (child.examples?.length || 0), 0)
    : topic.examples?.length || 0;
  const questionsCount = isParentTopic
    ? childTopics.reduce((sum, child) => sum + (child.questions?.length || 0), 0)
    : topic.questions?.length || 0;
  const theoryEntries = Object.entries(topic.theory || {}).filter(([, value]) => typeof value === "string" && value.trim());
  const groupEntries = Object.entries(topic.metadata?.groupValues?.[topic.grammarGroup || "other"] || {})
    .filter(([, value]) => typeof value === "string" && value.trim()) as Array<[string, string]>;
  const trapMetadata = Object.values(topic.metadata?.traps || {}).flatMap((values) => values || []);
  const displayTraps = [...(topic.traps || []), ...trapMetadata];
  const grammarDetailsExist = theoryEntries.length > 0 || groupEntries.length > 0 || (topic.wordFamilyWords?.length || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                {topic.code}
              </span>
              <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-blue-100 text-blue-800">
                {topic.part}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900">{topic.titleVi || topic.title}</h2>
            <p className="text-xs text-slate-500 font-medium italic">{topic.titleEn || topic.englishTitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div role="tablist" aria-label="Nội dung chủ điểm ngữ pháp" className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2">
          {([
            ["info", GRAMMAR_TAB_LABELS.info, FileText],
            ["theory", GRAMMAR_TAB_LABELS.theory, BookOpen],
            ["formula", GRAMMAR_TAB_LABELS.formula, Lightbulb],
            ["examples", GRAMMAR_TAB_LABELS.examples, FileText],
            ["questions", GRAMMAR_TAB_LABELS.questions, ListChecks],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`grammar-detail-tab-${id}`}
              aria-selected={activeTab === id}
              aria-controls={`grammar-detail-panel-${id}`}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                activeTab === id ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
              {id === "examples" ? <span>({examplesCount})</span> : null}
              {id === "questions" ? <span>({questionsCount})</span> : null}
            </button>
          ))}
        </div>

        {activeTab === "info" ? (
          <div id="grammar-detail-panel-info" role="tabpanel" aria-labelledby="grammar-detail-tab-info" className="space-y-3">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs font-medium leading-relaxed text-blue-950">
              <strong className="font-bold text-blue-900">Tóm tắt ngắn: </strong>
              {topic.summary || "Chưa có nội dung tóm tắt."}
            </div>
            {isParentTopic ? (
              <section className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-indigo-950">Nội dung tổng hợp từ chủ điểm con</h3>
                    <p className="mt-1 text-xs text-indigo-800">
                      {childTopics.length} chủ điểm con · {childTopics.reduce((sum, child) => sum + (child.examples?.length || 0), 0)} ví dụ · {childTopics.reduce((sum, child) => sum + (child.questions?.length || 0), 0)} câu hỏi
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {childTopics.map((child) => (
                    <article key={child.id} className="rounded-xl border border-indigo-100 bg-white p-3">
                      <h4 className="text-xs font-bold text-slate-900">{child.titleVi || child.title}</h4>
                      <p className="mt-0.5 text-[11px] italic text-slate-500">{child.titleEn || child.englishTitle}</p>
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
                        {child.summary || "Chưa có tóm tắt cho chủ điểm con này."}
                      </p>
                      <p className="mt-2 text-[10px] font-semibold text-indigo-700">
                        {(child.examples?.length || 0)} ví dụ · {(child.questions?.length || 0)} câu hỏi
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
            {audience === "admin" && topic.sourceUrl ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-xs text-sky-950">
                <strong className="font-bold">Nguồn tham khảo: </strong>
                <a href={topic.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="break-all font-semibold text-sky-800 underline underline-offset-2 hover:text-sky-950">
                  British Council LearnEnglish
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === "theory" ? (
          <div id="grammar-detail-panel-theory" role="tabpanel" aria-labelledby="grammar-detail-tab-theory">
          {isParentTopic ? (
            <div className="space-y-3">
              {childTopics.map((child) => {
                const childTheory = Object.entries(child.theory || {})
                  .filter(([, value]) => typeof value === "string" && value.trim());
                const childGroupValues = Object.entries(
                  child.metadata?.groupValues?.[child.grammarGroup || "other"] || {},
                ).filter(([, value]) => typeof value === "string" && value.trim()) as Array<[string, string]>;
                return (
                  <section key={child.id} className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                    <h3 className="mb-3 text-sm font-bold text-violet-950">{child.titleVi || child.title}</h3>
                    {childTheory.length || childGroupValues.length ? (
                      <div className="space-y-2">
                        {[
                          ...childTheory.map(([key, value]) => ({ id: `theory-${key}`, key, value })),
                          ...childGroupValues.map(([key, value]) => ({ id: `group-${key}`, key, value })),
                        ].map(({ id, key, value }) => (
                          <div key={id} className="rounded-xl bg-white p-3">
                            <h4 className="mb-1 text-[11px] font-bold text-slate-700">
                              {key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}
                            </h4>
                            <FormattedText text={value} className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Chưa có lý thuyết chi tiết.</p>
                    )}
                  </section>
                );
              })}
            </div>
          ) : grammarDetailsExist ? (
            <div className="space-y-3">
              {[
                ...theoryEntries.map(([key, value]) => ({ id: `theory-${key}`, key, value })),
                ...groupEntries.map(([key, value]) => ({ id: `group-${key}`, key, value })),
              ].map(({ id, key, value }) => (
                <div key={id} className="rounded-xl border border-violet-100 bg-violet-50/50 p-3">
                  <h3 className="mb-1 text-[11px] font-bold text-slate-700">
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}
                  </h3>
                  <FormattedText text={value} className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700" />
                </div>
              ))}
              {topic.wordFamilyWords?.length ? (
                <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-3">
                  <h3 className="mb-2 text-[11px] font-bold text-slate-700">Word Family</h3>
                  <ul className="space-y-1">
                    {topic.wordFamilyWords.map((word) => (
                      <li key={word.vocabularyItemId} className="text-xs text-slate-700">
                        <b>{word.partOfSpeech}</b> · {word.word}{word.meaning ? ` — ${word.meaning}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-500">
              Chưa có lý thuyết chi tiết cho chủ điểm này.
            </div>
          )}
          </div>
        ) : null}

        {activeTab === "formula" ? (
          <div id="grammar-detail-panel-formula" role="tabpanel" aria-labelledby="grammar-detail-tab-formula" className="space-y-4">
            {isParentTopic ? childTopics.map((child) => {
              const childTrapMetadata = Object.values(child.metadata?.traps || {}).flatMap((values) => values || []);
              return (
                <section key={child.id} className="space-y-3 rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-sm font-bold text-slate-900">{child.titleVi || child.title}</h3>
                  <GrammarFormulaViewer
                    formulaText={child.formula}
                    topicTitle={child.titleVi || child.title}
                    topicCode={child.code}
                  />
                  <GrammarSignalsViewer signalWords={child.signalWords} />
                  <GrammarTrapsViewer traps={[...(child.traps || []), ...childTrapMetadata]} />
                </section>
              );
            }) : (
              <>
                <GrammarFormulaViewer
                  formulaText={topic.formula}
                  topicTitle={topic.titleVi || topic.title}
                  topicCode={topic.code}
                />
                <GrammarSignalsViewer signalWords={topic.signalWords} />
                <GrammarTrapsViewer traps={displayTraps} />
              </>
            )}
          </div>
        ) : null}

        {activeTab === "examples" ? (
          <div id="grammar-detail-panel-examples" role="tabpanel" aria-labelledby="grammar-detail-tab-examples">
            {isParentTopic ? (
              <div className="space-y-4">
                {childTopics.map((child) => (
                  <section key={child.id} className="space-y-3 rounded-2xl border border-slate-200 p-4">
                    <h3 className="text-sm font-bold text-slate-900">{child.titleVi || child.title}</h3>
                    <GrammarExamplesViewer
                      examples={child.examples || []}
                      emptyMessage={`Chủ điểm “${child.titleVi || child.title}” chưa có ví dụ minh họa.`}
                    />
                  </section>
                ))}
              </div>
            ) : (
              <GrammarExamplesViewer
                examples={topic.examples || []}
                emptyMessage={audience === "admin" ? "Chưa có ví dụ minh họa cho chủ điểm này." : undefined}
              />
            )}
          </div>
        ) : null}

        {activeTab === "questions" ? (
          <div id="grammar-detail-panel-questions" role="tabpanel" aria-labelledby="grammar-detail-tab-questions">
            {isParentTopic ? (
              <div className="space-y-4">
                {childTopics.map((child) => (
                  <section key={child.id} className="space-y-3 rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{child.titleVi || child.title}</h3>
                      <span className="text-xs font-semibold text-slate-500">{child.questions?.length || 0} câu</span>
                    </div>
                    <GrammarQuestionsViewer questions={child.questions || []} />
                  </section>
                ))}
              </div>
            ) : (
              <GrammarQuestionsViewer questions={topic.questions || []} />
            )}
          </div>
        ) : null}

        <div className="flex justify-between items-center pt-4 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-bold">
              Số câu hỏi: <strong className="text-slate-900">{topic.questions.length} câu</strong>
            </span>
            {audience === "student" ? (
              <QuestionErrorReportButton
                source="QUESTION_BANK"
                questionRef={`grammar-theory-${topic.id}`}
                relatedContent={`Lý thuyết ngữ pháp: ${topic.titleVi || topic.title}`}
                questionSnapshot={{
                  topicCode: topic.code,
                  topicTitle: topic.titleVi || topic.title,
                  part: topic.part,
                  formula: topic.formula,
                  summary: topic.summary,
                }}
                compact
              />
            ) : null}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Đóng
            </button>
            {audience === "student" && onStartQuiz ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartQuiz(topic);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Luyện tập ngay</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MODAL THÊM / CHỈNH SỬA CHỦ ĐIỂM NGỮ PHÁP
// ==========================================
interface GrammarTopicEditModalProps {
  isOpen: boolean;
  editTopic?: GrammarTopicItem | null;
  topic?: GrammarTopicItem | null;
  initialParentTopicId?: string;
  availableTopics?: GrammarTopicItem[];
  onClose: () => void;
  onSave: (
    topicData: Partial<GrammarTopicItem>,
    newParent?: { titleVi: string; titleEn: string },
  ) => Promise<void> | void;
}

export const GrammarTopicEditModal: React.FC<GrammarTopicEditModalProps> = ({
  isOpen,
  editTopic,
  topic: topicProp,
  initialParentTopicId,
  availableTopics = [],
  onClose,
  onSave,
}) => {
  const currentTopic = editTopic || topicProp || null;
  const descendantTopicIds = new Set<string>();
  if (currentTopic) {
    const pendingIds = [currentTopic.id];
    while (pendingIds.length) {
      const parentId = pendingIds.pop();
      for (const child of availableTopics.filter((item) => item.parentTopicId === parentId)) {
        if (!descendantTopicIds.has(child.id)) {
          descendantTopicIds.add(child.id);
          pendingIds.push(child.id);
        }
      }
    }
  }
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [hasGeneratedSuggestion, setHasGeneratedSuggestion] = useState(false);
  const [suggestionReviewed, setSuggestionReviewed] = useState(false);
  const [examples, setExamples] = useState<GrammarTopicItem["examples"]>(() =>
    currentTopic?.examples?.length
      ? currentTopic.examples.map((example) => ({ ...example }))
      : [{ sentence: "", translation: "", analysis: "", focusWord: "", difficulty: "" }],
  );
  const [categories, setCategories] = useState<GrammarCategory[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(currentTopic?.grammarGroup || "other");
  const [theory, setTheory] = useState<Record<string, string>>({ ...(currentTopic?.theory || {}) });
  const [metadata, setMetadata] = useState<NonNullable<GrammarTopicItem["metadata"]>>(currentTopic?.metadata || {});
  const [toeicParts, setToeicParts] = useState<string[]>(currentTopic?.toeicParts?.length
    ? currentTopic.toeicParts
    : currentTopic?.part ? [currentTopic.part] : ["Part 5"]);
  const [wordFamilyWords, setWordFamilyWords] = useState<GrammarWordFamilyLink[]>(
    currentTopic?.wordFamilyWords?.map((word) => ({ ...word })) || [],
  );
  const [vocabularyWords, setVocabularyWords] = useState<WordItem[]>([]);
  const [vocabularyError, setVocabularyError] = useState<string | null>(null);
  const [wordSearch, setWordSearch] = useState("");
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GrammarCategory | null>(null);
  const [categoryCode, setCategoryCode] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryFieldsText, setCategoryFieldsText] = useState("");
  const [formDirty, setFormDirty] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<"info" | "theory" | "formula" | "examples" | "questions">("info");
  const [titleViLength, setTitleViLength] = useState((currentTopic?.titleVi || currentTopic?.title || "").length);
  const [titleEnLength, setTitleEnLength] = useState((currentTopic?.titleEn || currentTopic?.englishTitle || "").length);
  const [summaryLength, setSummaryLength] = useState((currentTopic?.summary || "").length);
  const translationRequests = useRef({ topic: 0, parent: 0 });
  const translationTimers = useRef<{ topic: ReturnType<typeof setTimeout> | null; parent: ReturnType<typeof setTimeout> | null }>({
    topic: null,
    parent: null,
  });
  const translatedTitles = useRef({
    topic: currentTopic?.titleEn || currentTopic?.englishTitle || "",
    parent: "",
  });
  const [translationStatus, setTranslationStatus] = useState({ topic: "", parent: "" });
  const formulaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formTabs = [
    { id: "info" as const, label: GRAMMAR_TAB_LABELS.info, icon: FileText, description: "Thông tin và nhóm ngữ pháp" },
    { id: "theory" as const, label: GRAMMAR_TAB_LABELS.theory, icon: BookOpen, description: "Giải thích và cách sử dụng" },
    { id: "formula" as const, label: GRAMMAR_TAB_LABELS.formula, icon: Lightbulb, description: "Cấu trúc và lưu ý TOEIC" },
    { id: "examples" as const, label: GRAMMAR_TAB_LABELS.examples, icon: FileText, description: "Ví dụ câu và nguồn tham khảo" },
    { id: "questions" as const, label: GRAMMAR_TAB_LABELS.questions, icon: ListChecks, description: "Xem câu hỏi đã liên kết với chủ điểm" },
  ];
  const tabErrorCounts = {
    info: Object.keys(fieldErrors).filter((field) => [
      "title", "englishTitle", "grammarGroup", "parentTopicId", "part", "toeicParts",
      "targetScore", "difficulty", "status", "sourceUrl", "sourceNotes",
      "suggestionReviewed", "wordFamilyWords", "newParentTitleVi", "newParentTitleEn", "summary",
    ].includes(field) || field.startsWith("groupValues.")).length,
    theory: Object.keys(fieldErrors).filter((field) => field === "theory" || field.startsWith("theory.")).length,
    formula: Object.keys(fieldErrors).filter((field) => [
      "formula", "signalWords", "traps", "metadata",
    ].includes(field)).length,
    examples: Object.keys(fieldErrors).filter((field) => field.startsWith("examples.")).length,
    questions: 0,
  };
  const clearFieldError = (field: string) => {
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };
  const clearExampleErrors = () => {
    setFieldErrors((previous) => Object.fromEntries(Object.entries(previous)
      .filter(([field]) => !field.startsWith("examples."))));
  };
  const fieldError = (field: string) => fieldErrors[field]
    ? <p id={`${field}-error`} role="alert" className="mt-1 text-[11px] font-semibold text-rose-700">{fieldErrors[field]}</p>
    : null;
  const inputErrorClass = (field: string) => fieldErrors[field]
    ? "border-rose-400 bg-rose-50/40 focus:border-rose-500"
    : "border-slate-200";

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    getGrammarCategories()
      .then((loaded) => {
        if (active) {
          setCategories(loaded);
          setCategoryError(null);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setCategoryError(error instanceof Error ? error.message : "Không thể tải danh mục ngữ pháp.");
        }
      })
      .finally(() => {
        if (active) setCategoriesLoading(false);
      });
    return () => { active = false; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || selectedGroup !== "parts_of_speech") return;
    let active = true;
    getAdminVocabularySets()
      .then((sets) => {
        if (active) {
          const wordsById = new Map(sets.flatMap((set) => set.words || []).map((word) => [word.id, word]));
          setVocabularyWords([...wordsById.values()]);
          setVocabularyError(null);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setVocabularyError(error instanceof Error ? error.message : "Không thể tải ngân hàng từ vựng.");
        }
      });
    return () => { active = false; };
  }, [isOpen, selectedGroup]);

  useEffect(() => {
    if (!isOpen || !formDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isOpen, formDirty]);

  useEffect(() => () => {
    if (translationTimers.current.topic) clearTimeout(translationTimers.current.topic);
    if (translationTimers.current.parent) clearTimeout(translationTimers.current.parent);
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    if (formDirty && !window.confirm("Bạn có thay đổi chưa lưu. Rời khỏi biểu mẫu và bỏ các thay đổi này?")) return;
    onClose();
  };
  const selectedCategory = categories.find((category) => category.code === selectedGroup);
  const groupValues = metadata.groupValues || {};
  const selectedGroupValues = groupValues[selectedGroup] || {};
  const updateGroupValue = (key: string, value: string) => {
    setMetadata((previous) => ({
      ...previous,
      groupValues: {
        ...(previous.groupValues || {}),
        [selectedGroup]: {
          ...(previous.groupValues?.[selectedGroup] || {}),
          [key]: value,
        },
      },
    }));
    if (value.length <= 5000) clearFieldError(`groupValues.${key}`);
    setFormDirty(true);
  };
  const updateTheoryValue = (key: string, value: string) => {
    setTheory((previous) => ({ ...previous, [key]: value }));
    if (value.length <= 5000) clearFieldError(`theory.${key}`);
    setFormDirty(true);
  };
  const updateTrapMetadata = (key: string, value: string) => {
    setMetadata((previous) => ({
      ...previous,
      traps: {
        ...(previous.traps || {}),
        [key]: value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
      },
    }));
    clearFieldError("metadata");
    setFormDirty(true);
  };
  const parseCategoryFields = () => categoryFieldsText.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [key, label, options = ""] = line.split("|");
      const parsedOptions = options.split(",").map((option) => option.trim()).filter(Boolean);
      return {
        key: key.trim(),
        label: (label || "").trim(),
        ...(parsedOptions.length ? { options: parsedOptions } : {}),
      };
    });
  const editCategory = (category: GrammarCategory) => {
    setEditingCategory(category);
    setCategoryCode(category.code);
    setCategoryName(category.name);
    setCategoryFieldsText(category.fieldDefinitions.map((field) =>
      `${field.key}|${field.label}|${field.options?.join(",") || ""}`).join("\n"));
    setCategoryEditorOpen(true);
  };
  const saveCategory = async () => {
    const fields = parseCategoryFields();
    if (!categoryName.trim() || fields.some((field) => !field.key || !field.label)) {
      setCategoryError("Nhập tên nhóm và khai báo trường theo định dạng key|Nhãn.");
      return;
    }
    try {
      const saved = editingCategory
        ? await updateGrammarCategory(editingCategory.code, { name: categoryName.trim(), fieldDefinitions: fields })
        : await saveGrammarCategory({ code: categoryCode.trim(), name: categoryName.trim(), fieldDefinitions: fields });
      setCategories((previous) => {
        const next = editingCategory
          ? previous.map((item) => item.code === saved.code ? saved : item)
          : [...previous, saved];
        return next.sort((left, right) => left.name.localeCompare(right.name));
      });
      setSelectedGroup(saved.code);
      setCategoryEditorOpen(false);
      setEditingCategory(null);
      setCategoryError(null);
    } catch (error) {
      setCategoryError(error instanceof Error ? error.message : "Không thể lưu nhóm ngữ pháp.");
    }
  };

  const insertFormulaSuggestion = (suggestion: string) => {
    const textarea = formulaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const prefix = selectionStart > 0 && value[selectionStart - 1] !== "\n" ? "\n" : "";
    const suffix = selectionEnd < value.length && value[selectionEnd] !== "\n" ? "\n" : "";
    textarea.setRangeText(`${prefix}${suggestion}${suffix}`, selectionStart, selectionEnd, "end");
    textarea.focus();
  };

  const scheduleEnglishTitleTranslation = (kind: "topic" | "parent", sourceValue: string) => {
    const sourceFieldName = kind === "topic" ? "title" : "newParentTitleVi";
    const targetFieldName = kind === "topic" ? "englishTitle" : "newParentTitleEn";
    const sourceField = formRef.current?.elements.namedItem(sourceFieldName);
    if (translationTimers.current[kind]) clearTimeout(translationTimers.current[kind]!);
    const requestId = ++translationRequests.current[kind];
    if (!sourceValue.trim() || !(sourceField instanceof HTMLInputElement)) {
      setTranslationStatus((previous) => ({ ...previous, [kind]: "" }));
      return;
    }

    setTranslationStatus((previous) => ({ ...previous, [kind]: "Đang chờ dịch..." }));
    translationTimers.current[kind] = setTimeout(async () => {
      const targetField = formRef.current?.elements.namedItem(targetFieldName);
      if (!(targetField instanceof HTMLInputElement)) return;
      if (targetField.value.trim() && targetField.value !== translatedTitles.current[kind]) {
        setTranslationStatus((previous) => ({ ...previous, [kind]: "Đã chỉnh sửa thủ công." }));
        return;
      }

      setTranslationStatus((previous) => ({ ...previous, [kind]: "Đang dịch..." }));
      try {
        const translatedTitle = await translateVietnameseToEnglish(sourceValue.trim());
        if (requestId !== translationRequests.current[kind]
          || sourceField.value.trim() !== sourceValue.trim()
          || (targetField.value.trim() && targetField.value !== translatedTitles.current[kind])) return;

        targetField.value = translatedTitle.slice(0, 120);
        translatedTitles.current[kind] = targetField.value;
        if (kind === "topic") setTitleEnLength(targetField.value.length);
        clearFieldError(targetFieldName);
        setFormDirty(true);
        setTranslationStatus((previous) => ({
          ...previous,
          [kind]: "Đã dịch tự động; bạn có thể chỉnh sửa bản dịch.",
        }));
      } catch (error) {
        if (requestId !== translationRequests.current[kind]) return;
        setTranslationStatus((previous) => ({
          ...previous,
          [kind]: error instanceof Error ? `Không thể tự dịch: ${error.message}` : "Không thể tự dịch. Vui lòng nhập tiếng Anh thủ công.",
        }));
      }
    }, 500);
  };

  const searchBritishCouncilGrammar = () => {
    const topic = formRef.current?.elements.namedItem("englishTitle") as HTMLInputElement | null;
    const query = topic?.value.trim() || "English grammar";
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:learnenglish.britishcouncil.org/grammar ${query}`)}`;
    window.open(searchUrl, "_blank", "noopener,noreferrer");
  };

  const createGrammarSuggestion = async () => {
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);
    const titleVi = String(formData.get("title") || "").trim();
    const titleEn = String(formData.get("englishTitle") || "").trim();
    const sourceUrl = String(formData.get("sourceUrl") || "").trim();
    const sourceNotes = String(formData.get("sourceNotes") || "").trim();

    if (!titleEn) {
      setSuggestionError("Nhập tên chủ điểm tiếng Anh trước khi tạo gợi ý.");
      return;
    }
    const hasExistingContent = [
      String(formData.get("formula") || "").trim(),
      String(formData.get("summary") || "").trim(),
      String(formData.get("signalWords") || "").trim(),
      String(formData.get("traps") || "").trim(),
      ...Object.values(theory),
      ...Object.values(selectedGroupValues),
      ...examples.flatMap((example) => [
        example.sentence,
        example.translation,
        example.analysis || "",
        ...(example.annotations || []).map((annotation) => annotation.selectedText),
      ]),
    ].some(Boolean);
    if (hasExistingContent && !window.confirm("Dùng gợi ý mới sẽ thay nội dung lý thuyết, trường đặc thù của nhóm đang chọn, công thức, tóm tắt, dấu hiệu, bẫy và ví dụ hiện có. Bạn có muốn tiếp tục không?")) {
      return;
    }

    setSuggestionError(null);
    setIsGeneratingSuggestion(true);
    try {
      const suggestion = await generateGrammarContentSuggestion({
        titleVi,
        titleEn,
        part: toeicParts.join(", ") || "Part 5",
        targetScore: String(formData.get("targetScore") || "350_500"),
        sourceUrl,
        sourceNotes,
        grammarGroup: selectedGroup,
        difficulty: String(formData.get("difficulty") || "MEDIUM"),
        fieldDefinitions: selectedCategory?.fieldDefinitions || [],
        metadata,
      });
      const setFieldValue = (name: string, value: string) => {
        const field = form.elements.namedItem(name);
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
          field.value = value;
        }
      };
      setFieldValue("formula", suggestion.formula);
      setFieldValue("summary", suggestion.summary);
      setSummaryLength(suggestion.summary.length);
      setFieldValue("signalWords", suggestion.signalWords.join("\n"));
      setFieldValue("traps", suggestion.traps.join("\n"));
      setExamples(suggestion.examples.length
        ? suggestion.examples.map((example) => ({ ...example }))
        : [{ sentence: "", translation: "", analysis: "" }]);
      setTheory(suggestion.theory || {});
      const allowedKeys = new Set((selectedCategory?.fieldDefinitions || []).map((field) => field.key));
      const generatedGroupValues = Object.fromEntries(
        Object.entries(suggestion.groupValues || {})
          .filter(([key, value]) => allowedKeys.has(key) && typeof value === "string")
      );
      setMetadata((previous) => ({
        ...previous,
        groupValues: { ...(previous.groupValues || {}), [selectedGroup]: generatedGroupValues },
      }));
      setFormDirty(true);
      setHasGeneratedSuggestion(true);
      setSuggestionReviewed(false);
    } catch (error) {
      setSuggestionError(error instanceof Error ? error.message : "Không thể tạo gợi ý ngữ pháp.");
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl sm:p-7">
        <div className="mb-4 flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">
              {currentTopic ? `Chỉnh sửa: ${currentTopic.titleVi || currentTopic.title}` : "Thêm chủ điểm ngữ pháp mới"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">Nhập nội dung theo từng bước. Có thể chuyển tab mà không mất dữ liệu đã điền.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng biểu mẫu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          ref={formRef}
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const titleViVal = (formData.get("title") as string || "").trim();
            const titleEnVal = (formData.get("englishTitle") as string || "").trim();
            const formulaVal = (formData.get("formula") as string || "").trim();
            const summaryVal = (formData.get("summary") as string || "").trim();
            const partVal = formData.get("part") as string;
            const partsVal = toeicParts;
            const targetScoreVal = formData.get("targetScore") as string;
            const statusVal = formData.get("status") as string;
            const difficultyVal = formData.get("difficulty") as string;
            const grammarGroupVal = String(formData.get("grammarGroup") || "");
            const parentTopicIdVal = String(formData.get("parentTopicId") || "") || undefined;
            const newParentTitleVi = String(formData.get("newParentTitleVi") || "").trim();
            const newParentTitleEn = String(formData.get("newParentTitleEn") || "").trim();
            const shouldCreateNewParent = Boolean(newParentTitleVi || newParentTitleEn);
            const signalWordsVal = (formData.get("signalWords") as string || "")
              .split(/\r?\n/)
              .map((word) => word.trim())
              .filter((word, index, words) => Boolean(word) && words.indexOf(word) === index);
            const trapsVal = (formData.get("traps") as string || "")
              .split(/\r?\n/)
              .map((trap) => trap.trim())
              .filter((trap, index, traps) => Boolean(trap) && traps.indexOf(trap) === index);
            const exampleRows = examples.map((example) => ({
                sentence: example.sentence.trim(),
                translation: example.translation.trim(),
                analysis: example.analysis?.trim() || "",
                focusWord: example.focusWord?.trim() || "",
                difficulty: example.difficulty || "",
                annotations: example.annotations || [],
              }));
            const examplesVal = exampleRows.filter((example) => example.sentence && example.translation);

            const sourceUrlVal = String(formData.get("sourceUrl") || "").trim();
            const metadataToSave = {
              ...metadata,
              traps: {
                ...(metadata.traps || {}),
                commonMistakes: String(formData.get("commonMistakes") || "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
                confusingStructures: String(formData.get("confusingStructures") || "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
                answerTips: String(formData.get("answerTips") || "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
                partStrategies: String(formData.get("partStrategies") || "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
              },
            };
            const nextFieldErrors: Record<string, string> = {};
            const setError = (field: string, message: string) => { nextFieldErrors[field] = message; };
            const validParts = ["Part 5", "Part 6", "Part 7"];

            if (!titleViVal) setError("title", "Vui lòng nhập tên chủ điểm bằng tiếng Việt.");
            else if (titleViVal.length > 120) setError("title", "Tên chủ điểm không được vượt quá 120 ký tự.");
            if (!titleEnVal) setError("englishTitle", "Vui lòng nhập tên chủ điểm bằng tiếng Anh.");
            else if (titleEnVal.length > 120) setError("englishTitle", "Tên tiếng Anh không được vượt quá 120 ký tự.");
            if (sourceUrlVal) {
              if (sourceUrlVal.length > 500) {
                setError("sourceUrl", "Liên kết nguồn không được vượt quá 500 ký tự.");
              } else try {
                const sourceUrl = new URL(sourceUrlVal);
                if (sourceUrl.protocol !== "https:" || sourceUrl.hostname !== "learnenglish.britishcouncil.org"
                  || sourceUrl.username || sourceUrl.password || (sourceUrl.port && sourceUrl.port !== "443")) {
                  setError("sourceUrl", "Chỉ chấp nhận liên kết HTTPS thuộc learnenglish.britishcouncil.org.");
                }
              } catch {
                setError("sourceUrl", "Vui lòng nhập URL hợp lệ.");
              }
            }
            if (String(formData.get("sourceNotes") || "").length > 3000) {
              setError("sourceNotes", "Ghi chú nguồn không được vượt quá 3.000 ký tự.");
            }
            if (!formulaVal) setError("formula", "Vui lòng nhập công thức hoặc cấu trúc cốt lõi.");
            else if (formulaVal.length > 5000) setError("formula", "Công thức không được vượt quá 5.000 ký tự.");
            if (!summaryVal) setError("summary", "Vui lòng nhập tóm tắt ngắn gọn.");
            else if (summaryVal.length > 1000) setError("summary", "Tóm tắt không được vượt quá 1.000 ký tự.");
            if (!validParts.includes(partVal)) setError("toeicParts", "Part TOEIC chính không hợp lệ.");
            if (!partsVal.length) setError("toeicParts", "Chọn ít nhất một Part TOEIC.");
            else if (partsVal.some((part) => !validParts.includes(part)) || new Set(partsVal).size !== partsVal.length) {
              setError("toeicParts", "Part TOEIC bị trùng hoặc không hợp lệ.");
            }
            if (!["350_500", "500_750", "750_PLUS", "ALL"].includes(targetScoreVal)) {
              setError("targetScore", "Vui lòng chọn mục tiêu điểm TOEIC hợp lệ.");
            }
            if (!["EASY", "MEDIUM", "HARD"].includes(difficultyVal)) setError("difficulty", "Vui lòng chọn độ khó hợp lệ.");
            if (!["DRAFT", "PUBLISHED"].includes(statusVal)) setError("status", "Vui lòng chọn trạng thái hợp lệ.");
            if (categoriesLoading) setError("grammarGroup", "Đang tải danh mục; vui lòng đợi rồi thử lưu lại.");
            else if (!categories.some((category) => category.code === grammarGroupVal)) {
              setError("grammarGroup", "Vui lòng chọn nhóm ngữ pháp hợp lệ.");
            }
            if (grammarGroupVal !== "parts_of_speech" && wordFamilyWords.length) {
              setError("grammarGroup", "Word Family chỉ được sử dụng với nhóm Từ loại.");
            }
            if (parentTopicIdVal && !availableTopics.some((topic) => topic.id === parentTopicIdVal)) {
              setError("parentTopicId", "Chủ điểm cha đã chọn không tồn tại hoặc không còn khả dụng.");
            }
            if (shouldCreateNewParent) {
              if (parentTopicIdVal) {
                setError("parentTopicId", "Hãy bỏ chọn chủ điểm cha có sẵn nếu muốn tạo chủ điểm cha mới.");
                setError("newParentTitleVi", "Chỉ chọn một cách: chọn cha có sẵn hoặc nhập tên cha mới.");
              }
              if (!newParentTitleVi) setError("newParentTitleVi", "Vui lòng nhập tên chủ điểm cha bằng tiếng Việt.");
              else if (newParentTitleVi.length > 120) setError("newParentTitleVi", "Tên chủ điểm cha không được vượt quá 120 ký tự.");
              if (!newParentTitleEn) setError("newParentTitleEn", "Vui lòng nhập tên chủ điểm cha bằng tiếng Anh.");
              else if (newParentTitleEn.length > 120) setError("newParentTitleEn", "Tên chủ điểm cha không được vượt quá 120 ký tự.");
            }
            if (statusVal === "PUBLISHED" && hasGeneratedSuggestion && !suggestionReviewed) {
              setError("suggestionReviewed", "Cần xác nhận đã kiểm tra nội dung AI trước khi phát hành.");
            }

            if (Object.keys(theory).length > 30) setError("theory", "Số trường lý thuyết vượt giới hạn cho phép.");
            Object.entries(theory).forEach(([key, value]) => {
              if (value.length > 5000) setError(`theory.${key}`, "Mỗi trường lý thuyết tối đa 5.000 ký tự.");
            });
            const groupValues = metadata.groupValues?.[grammarGroupVal] || {};
            Object.entries(groupValues).forEach(([key, value]) => {
              if (value.length > 5000) setError(`groupValues.${key}`, "Trường này tối đa 5.000 ký tự.");
            });
            if (Object.keys(metadataToSave).length > 30 || JSON.stringify(metadataToSave).length > 50000) {
              setError("metadata", "Tổng dữ liệu ghi chú và trường đặc thù vượt giới hạn cho phép.");
            }
            if (wordFamilyWords.length > 100) setError("wordFamilyWords", "Một Word Family tối đa 100 từ.");
            const linkedWordIds = wordFamilyWords.map((word) => word.vocabularyItemId);
            if (new Set(linkedWordIds).size !== linkedWordIds.length) {
              setError("wordFamilyWords", "Word Family có từ bị liên kết trùng lặp.");
            }
            if (examples.length > 50) setError("examples", "Mỗi chủ điểm tối đa 50 ví dụ.");
            const signalWordsInput = String(formData.get("signalWords") || "");
            const trapsInput = String(formData.get("traps") || "");
            if (signalWordsInput.length > 1000) setError("signalWords", "Dấu hiệu nhận biết tối đa 1.000 ký tự.");
            if (trapsInput.length > 1000) setError("traps", "Bẫy đề tối đa 1.000 ký tự.");
            exampleRows.forEach((example, index) => {
              const hasAnyContent = Boolean(example.sentence || example.translation || example.analysis || example.focusWord || example.difficulty || example.annotations.length);
              if (hasAnyContent && !example.sentence) setError(`examples.${index}.sentence`, "Vui lòng nhập câu tiếng Anh cho ví dụ này.");
              if (hasAnyContent && !example.translation) setError(`examples.${index}.translation`, "Vui lòng nhập bản dịch tiếng Việt cho ví dụ này.");
              if (example.sentence.length > 1000) setError(`examples.${index}.sentence`, "Câu ví dụ tối đa 1.000 ký tự.");
              if (example.translation.length > 1000) setError(`examples.${index}.translation`, "Bản dịch tối đa 1.000 ký tự.");
              if (example.analysis.length > 2000) setError(`examples.${index}.analysis`, "Phân tích tối đa 2.000 ký tự.");
              if (example.focusWord.length > 200) setError(`examples.${index}.focusWord`, "Từ/cụm từ trọng tâm tối đa 200 ký tự.");
              if (example.annotations.length > 100) setError(`examples.${index}.annotations`, "Mỗi câu tối đa 100 chú giải.");
              example.annotations.forEach((annotation, annotationIndex) => {
                if (!Number.isInteger(annotation.start) || !Number.isInteger(annotation.end)
                  || annotation.start < 0 || annotation.end <= annotation.start
                  || annotation.end > example.sentence.length
                  || example.sentence.slice(annotation.start, annotation.end) !== annotation.selectedText
                  || !annotation.label.trim() || annotation.label.length > 80
                  || !["grammar", "highlight", "note"].includes(annotation.kind)
                  || !["blue", "emerald", "amber", "violet", "rose"].includes(annotation.color || "")
                  || (annotation.explanation || "").length > 500) {
                  setError(`examples.${index}.annotations.${annotationIndex}`, "Đoạn chú giải không còn khớp với câu. Hãy sửa hoặc xóa chú giải này.");
                }
              });
            });

            setFieldErrors(nextFieldErrors);
            if (Object.keys(nextFieldErrors).length) {
              setSaveError(`Có ${Object.keys(nextFieldErrors).length} lỗi cần kiểm tra. Các trường sai được đánh dấu bên dưới.`);
              const firstInvalidField = Object.keys(nextFieldErrors)[0];
              const invalidTab = firstInvalidField.startsWith("theory.")
                ? "theory"
                : firstInvalidField === "formula"
                  ? "formula"
                  : firstInvalidField.startsWith("examples.")
                    ? "examples"
                    : "info";
              setActiveFormTab(invalidTab);
              return;
            }
            if (statusVal === "PUBLISHED" && currentTopic?.status !== "PUBLISHED"
              && !window.confirm("Phát hành chủ điểm này để học viên có thể xem?")) return;

            setSaveError(null);
            setIsSaving(true);
            try {
              await onSave({
                titleVi: titleViVal,
                titleEn: titleEnVal,
                title: titleViVal,
                englishTitle: titleEnVal,
                sourceUrl: sourceUrlVal,
                sourceNotes: String(formData.get("sourceNotes") || "").trim(),
                grammarGroup: grammarGroupVal,
                parentTopicId: parentTopicIdVal,
                toeicParts: partsVal,
                difficulty: difficultyVal,
                theory,
                metadata: metadataToSave,
                wordFamilyWords,
                part: partVal as unknown as never,
                targetScore: targetScoreVal as unknown as never,
                status: statusVal as unknown as never,
                formula: formulaVal,
                summary: summaryVal,
                signalWords: signalWordsVal,
                traps: trapsVal,
                examples: examplesVal,
              }, shouldCreateNewParent ? { titleVi: newParentTitleVi, titleEn: newParentTitleEn } : undefined);
              setFormDirty(false);
              onClose();
            } catch (error) {
              setSaveError(error instanceof Error ? error.message : "Không thể lưu chuyên đề.");
            } finally {
              setIsSaving(false);
            }
          }}
          onChange={(event) => {
            setFormDirty(true);
            if (saveError) setSaveError(null);
            const fieldName = event.target instanceof HTMLElement ? event.target.getAttribute("name") : null;
            if (fieldName) {
              const value = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement
                ? event.target.value
                : "";
              if (fieldName === "title" && value.trim() && value.trim().length <= 120) clearFieldError("title");
              if (fieldName === "englishTitle" && value.trim() && value.trim().length <= 120) clearFieldError("englishTitle");
              if (fieldName === "formula" && value.trim() && value.length <= 5000) clearFieldError("formula");
              if (fieldName === "summary" && value.trim() && value.length <= 1000) clearFieldError("summary");
              if (fieldName === "sourceUrl") {
                if (!value) clearFieldError("sourceUrl");
                else if (URL.canParse(value)) {
                  const parsed = new URL(value);
                  if (value.length <= 500 && parsed.protocol === "https:" && parsed.hostname === "learnenglish.britishcouncil.org"
                    && !parsed.username && !parsed.password && (!parsed.port || parsed.port === "443")) clearFieldError("sourceUrl");
                }
              }
              if (fieldName === "sourceNotes" && value.length <= 3000) clearFieldError("sourceNotes");
              if (fieldName === "newParentTitleVi" && value.trim() && value.trim().length <= 120) clearFieldError(fieldName);
              if (fieldName === "newParentTitleEn" && value.trim() && value.trim().length <= 120) clearFieldError(fieldName);
              if (fieldName === "newParentTitleVi" || fieldName === "newParentTitleEn") {
                const parentSelect = formRef.current?.elements.namedItem("parentTopicId");
                if (parentSelect instanceof HTMLSelectElement) parentSelect.value = "";
                clearFieldError("parentTopicId");
              }
              if (fieldName === "parentTopicId" && value) {
                for (const name of ["newParentTitleVi", "newParentTitleEn"]) {
                  const parentInput = formRef.current?.elements.namedItem(name);
                  if (parentInput instanceof HTMLInputElement) parentInput.value = "";
                  clearFieldError(name);
                }
              }
              if (["targetScore", "difficulty", "status", "parentTopicId"].includes(fieldName)) clearFieldError(fieldName);
              if (fieldName === "grammarGroup" && categories.some((category) => category.code === value)) clearFieldError("grammarGroup");
              if (fieldName === "signalWords" && value.length <= 1000) clearFieldError("signalWords");
              if (fieldName === "traps" && value.length <= 1000) clearFieldError("traps");
              if (fieldName === "suggestionReviewed" && event.target instanceof HTMLInputElement && event.target.checked) {
                clearFieldError("suggestionReviewed");
              }
            }
            if (suggestionError) setSuggestionError(null);
            if (hasGeneratedSuggestion && fieldName !== "suggestionReviewed") {
              setSuggestionReviewed(false);
            }
          }}
          className="flex min-h-0 flex-1 flex-col text-xs font-medium"
        >
          <div role="tablist" aria-label="Các bước tạo chủ điểm ngữ pháp" className="-mx-1 mb-4 flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 px-1">
            {formTabs.map(({ id, label, icon: Icon, description }, index) => {
              const isActive = activeFormTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`grammar-topic-tab-${id}`}
                  aria-selected={isActive}
                  aria-controls={`grammar-topic-panel-${id}`}
                  title={description}
                  onClick={() => setActiveFormTab(id)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-left transition-colors sm:px-5 ${
                    isActive
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                    {isActive ? <Icon className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="whitespace-nowrap font-bold">{label}</span>
                  {tabErrorCounts[id] > 0 ? (
                    <span
                      aria-label={`${tabErrorCounts[id]} lỗi`}
                      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-100 px-1 text-[10px] font-extrabold text-rose-700"
                    >
                      {tabErrorCounts[id]}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-0.5 pb-4 custom-scrollbar">
          {saveError || Object.keys(fieldErrors).length ? (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
              <p>{Object.keys(fieldErrors).length
                ? `Có ${Object.keys(fieldErrors).length} lỗi cần kiểm tra. Các trường sai được đánh dấu bên dưới.`
                : saveError}</p>
              {Object.keys(fieldErrors).length ? (
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-[11px]">
                  {Object.entries(fieldErrors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
          <div hidden={activeFormTab !== "info"} id="grammar-topic-panel-info" role="tabpanel" aria-labelledby="grammar-topic-tab-info" className="space-y-4">
          <details open className="rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-bold text-slate-900">1. Thông tin chung</summary>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Mã chuyên đề (tự động)</label>
                  <input type="text" value={currentTopic?.code || "Sẽ được tạo khi lưu"} disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-500" />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Nhóm ngữ pháp <span className="text-rose-600">*</span></label>
                  <select name="grammarGroup" value={selectedGroup} required
                    onChange={(event) => {
                      setSelectedGroup(event.target.value);
                      setFieldErrors((previous) => Object.fromEntries(Object.entries(previous)
                        .filter(([field]) => !field.startsWith("groupValues."))));
                      setFormDirty(true);
                    }}
                    aria-invalid={Boolean(fieldErrors.grammarGroup)}
                    aria-describedby={fieldErrors.grammarGroup ? "grammarGroup-error" : undefined}
                    className={`w-full rounded-xl border bg-white p-2.5 ${inputErrorClass("grammarGroup")}`}>
                    {categories.map((category) => <option key={category.code} value={category.code}>{category.name}</option>)}
                  </select>
                  {categoriesLoading ? <p className="mt-1 text-[10px] text-slate-500">Đang tải danh mục...</p> : null}
                  {fieldError("grammarGroup")}
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Tên chủ điểm (Tiếng Việt) <span className="text-rose-600">*</span></label>
                  <input type="text" name="title" defaultValue={currentTopic?.titleVi || currentTopic?.title || ""}
                    required maxLength={120} onChange={(event) => {
                      setTitleViLength(event.target.value.length);
                      scheduleEnglishTitleTranslation("topic", event.target.value);
                    }}
                    aria-invalid={Boolean(fieldErrors.title)} aria-describedby={fieldErrors.title ? "title-error" : undefined}
                    className={`w-full rounded-xl border p-2.5 focus:border-blue-500 focus:outline-hidden ${inputErrorClass("title")}`} />
                  {fieldError("title")}
                  <p className="mt-1 text-right text-[10px] text-slate-500">{titleViLength}/120</p>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Tên tiếng Anh <span className="text-rose-600">*</span></label>
                  <input type="text" name="englishTitle" defaultValue={currentTopic?.titleEn || currentTopic?.englishTitle || ""}
                    required maxLength={120} onChange={(event) => {
                      setTitleEnLength(event.target.value.length);
                      if (event.target.value !== translatedTitles.current.topic) {
                        setTranslationStatus((previous) => ({ ...previous, topic: "Đã chỉnh sửa thủ công." }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.englishTitle)} aria-describedby={fieldErrors.englishTitle ? "englishTitle-error" : undefined}
                    className={`w-full rounded-xl border p-2.5 focus:border-blue-500 focus:outline-hidden ${inputErrorClass("englishTitle")}`} />
                  {fieldError("englishTitle")}
                  {translationStatus.topic ? (
                    <p aria-live="polite" className={`mt-1 text-[10px] ${translationStatus.topic.startsWith("Không thể") ? "text-rose-600" : "text-slate-500"}`}>
                      {translationStatus.topic}
                    </p>
                  ) : null}
                  <p className="mt-1 text-right text-[10px] text-slate-500">{titleEnLength}/120</p>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Chủ điểm cha</label>
                  <select name="parentTopicId" defaultValue={initialParentTopicId || currentTopic?.parentTopicId || ""}
                    aria-invalid={Boolean(fieldErrors.parentTopicId)} aria-describedby={fieldErrors.parentTopicId ? "parentTopicId-error" : undefined}
                    className={`w-full rounded-xl border bg-white p-2.5 ${inputErrorClass("parentTopicId")}`}>
                    <option value="">Không chọn chủ điểm cha có sẵn</option>
                    {availableTopics.concat(currentTopic ? [currentTopic] : [])
                      .filter((topic, index, list) => topic.id !== currentTopic?.id
                        && !descendantTopicIds.has(topic.id)
                        && list.findIndex((candidate) => candidate.id === topic.id) === index)
                      .map((topic) => <option key={topic.id} value={topic.id}>{topic.titleVi || topic.title}</option>)}
                  </select>
                  {fieldError("parentTopicId")}
                  {!currentTopic ? (
                    <div className="mt-3 grid gap-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 sm:grid-cols-2">
                      <p className="text-[11px] leading-relaxed text-slate-600 sm:col-span-2">
                        Chọn chủ điểm có sẵn ở trên, hoặc nhập trực tiếp tên để tạo chủ điểm cha mới. Chủ điểm cha mới sẽ ở trạng thái bản nháp.
                      </p>
                      <div>
                        <label htmlFor="newParentTitleVi" className="mb-1 block font-semibold text-slate-700">
                          Tên chủ điểm cha mới (Tiếng Việt)
                        </label>
                        <input
                          id="newParentTitleVi"
                          name="newParentTitleVi"
                          maxLength={120}
                          onChange={(event) => scheduleEnglishTitleTranslation("parent", event.target.value)}
                          aria-invalid={Boolean(fieldErrors.newParentTitleVi)}
                          aria-describedby={fieldErrors.newParentTitleVi ? "newParentTitleVi-error" : undefined}
                          className={`w-full rounded-xl border bg-white p-2.5 ${inputErrorClass("newParentTitleVi")}`}
                          placeholder="Nhập trực tiếp, ví dụ: Danh từ"
                        />
                        {fieldError("newParentTitleVi")}
                      </div>
                      <div>
                        <label htmlFor="newParentTitleEn" className="mb-1 block font-semibold text-slate-700">
                          Tên chủ điểm cha mới (Tiếng Anh)
                        </label>
                        <input
                          id="newParentTitleEn"
                          name="newParentTitleEn"
                          maxLength={120}
                          onChange={(event) => {
                            if (event.target.value !== translatedTitles.current.parent) {
                              setTranslationStatus((previous) => ({ ...previous, parent: "Đã chỉnh sửa thủ công." }));
                            }
                          }}
                          aria-invalid={Boolean(fieldErrors.newParentTitleEn)}
                          aria-describedby={fieldErrors.newParentTitleEn ? "newParentTitleEn-error" : undefined}
                          className={`w-full rounded-xl border bg-white p-2.5 ${inputErrorClass("newParentTitleEn")}`}
                          placeholder="Nhập trực tiếp, ví dụ: Nouns"
                        />
                        {fieldError("newParentTitleEn")}
                        {translationStatus.parent ? (
                          <p aria-live="polite" className={`mt-1 text-[10px] ${translationStatus.parent.startsWith("Không thể") ? "text-rose-600" : "text-slate-500"}`}>
                            {translationStatus.parent}
                          </p>
                        ) : null}
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-600 sm:col-span-2">
                        Khi nhập tên cha, chủ điểm đang tạo sẽ tự động trở thành chủ điểm con của cha mới.
                      </p>
                    </div>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Mục tiêu điểm TOEIC <span className="text-rose-600">*</span></label>
                  <select name="targetScore" defaultValue={currentTopic?.targetScore || "350_500"} required
                    aria-invalid={Boolean(fieldErrors.targetScore)} aria-describedby={fieldErrors.targetScore ? "targetScore-error" : undefined}
                    className={`w-full rounded-xl border bg-white p-2.5 ${inputErrorClass("targetScore")}`}>
                    <option value="350_500">350–500</option><option value="500_750">500–750</option>
                    <option value="750_PLUS">750+</option><option value="ALL">Mọi trình độ</option>
                  </select>
                  {fieldError("targetScore")}
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Độ khó</label>
                  <select name="difficulty" defaultValue={currentTopic?.difficulty || "MEDIUM"}
                    aria-invalid={Boolean(fieldErrors.difficulty)} aria-describedby={fieldErrors.difficulty ? "difficulty-error" : undefined}
                    className={`w-full rounded-xl border bg-white p-2.5 ${inputErrorClass("difficulty")}`}>
                    <option value="EASY">Cơ bản</option><option value="MEDIUM">Trung bình</option><option value="HARD">Nâng cao</option>
                  </select>
                  {fieldError("difficulty")}
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Trạng thái nội dung <span className="text-rose-600">*</span></label>
                  <select name="status" defaultValue={currentTopic?.status || "DRAFT"} required
                    aria-invalid={Boolean(fieldErrors.status)} aria-describedby={fieldErrors.status ? "status-error" : undefined}
                    className={`w-full rounded-xl border bg-white p-2.5 ${inputErrorClass("status")}`}>
                    <option value="DRAFT">Bản nháp</option><option value="PUBLISHED">Phát hành</option>
                  </select>
                  {fieldError("status")}
                </div>
              </div>
              <input type="hidden" name="part" value={toeicParts[0] || "Part 5"} />
              <fieldset>
                <legend className="mb-2 font-bold text-slate-700">Part TOEIC áp dụng <span className="text-rose-600">*</span></legend>
                <div className="flex flex-wrap gap-4">
                  {["Part 5", "Part 6", "Part 7"].map((part) => (
                    <label key={part} className="flex items-center gap-2">
                      <input type="checkbox" checked={toeicParts.includes(part)}
                        onChange={(event) => {
                          setToeicParts((previous) => event.target.checked
                            ? [...previous, part]
                            : previous.filter((item) => item !== part));
                          if (event.target.checked || toeicParts.length > 1) clearFieldError("toeicParts");
                          setFormDirty(true);
                        }}
                        className="accent-blue-700" />
                      {part}
                    </label>
                  ))}
                </div>
                {fieldError("toeicParts")}
              </fieldset>
              <details className="rounded-xl border border-slate-200 p-3">
                <summary className="cursor-pointer font-bold text-slate-700">Quản lý danh mục nhóm ngữ pháp</summary>
                <div className="mt-3 space-y-2">
                  {categoryError ? <p role="alert" className="text-rose-700">{categoryError}</p> : null}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <span key={category.code} className="flex items-center gap-2 rounded-lg bg-slate-100 px-2 py-1">
                        {category.name}
                        <button type="button" onClick={() => editCategory(category)} className="font-bold text-blue-700">Sửa</button>
                        {!category.system ? <button type="button" onClick={async () => {
                          if (!window.confirm(`Xóa nhóm "${category.name}"?`)) return;
                          try {
                            await deleteGrammarCategory(category.code);
                            setCategories((previous) => previous.filter((item) => item.code !== category.code));
                            if (selectedGroup === category.code) setSelectedGroup("other");
                          } catch (error) {
                            setCategoryError(error instanceof Error ? error.message : "Không thể xóa nhóm ngữ pháp.");
                          }
                        }} className="font-bold text-rose-700">Xóa</button> : null}
                      </span>
                    ))}
                    <button type="button" onClick={() => {
                      setEditingCategory(null); setCategoryCode(""); setCategoryName(""); setCategoryFieldsText("");
                      setCategoryEditorOpen(true);
                    }} className="rounded-lg border border-blue-200 px-2 py-1 font-bold text-blue-700">+ Thêm nhóm</button>
                  </div>
                  {categoryEditorOpen ? (
                    <div className="grid gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input value={categoryCode} onChange={(event) => setCategoryCode(event.target.value)}
                          disabled={Boolean(editingCategory)} placeholder="Mã, ví dụ: business_grammar"
                          className="rounded-lg border border-slate-200 p-2 disabled:bg-slate-100" />
                        <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)}
                          maxLength={120} placeholder="Tên nhóm" className="rounded-lg border border-slate-200 p-2" />
                      </div>
                      <textarea value={categoryFieldsText} onChange={(event) => setCategoryFieldsText(event.target.value)}
                        rows={4} placeholder={"Mỗi dòng: key|Nhãn trường|Lựa chọn 1,Lựa chọn 2\nstructureType|Loại cấu trúc|Passive Voice,Causative Form"}
                        className="rounded-lg border border-slate-200 p-2 font-mono" />
                      <p className="text-[10px] text-slate-500">Các giá trị nhập vào được lưu theo mã trường; chỉ hiển thị trường của nhóm đang chọn.</p>
                      <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" onClick={saveCategory} className="rounded-lg bg-blue-700 px-3 py-2 font-bold text-white">Lưu nhóm</button>
                        <button type="button" onClick={() => setCategoryEditorOpen(false)} className="rounded-lg bg-slate-200 px-3 py-2">Hủy</button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </details>
            </div>
          </details>

          <details open className="rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-bold text-slate-900">2. Nội dung đặc thù — {selectedCategory?.name || "nhóm ngữ pháp"}</summary>
            <div className="mt-4 space-y-3">
              {categoryError ? <p role="alert" className="text-rose-700">{categoryError}</p> : null}
              {selectedCategory?.fieldDefinitions.map((field) => (
                <div key={field.key} className="block">
                  <span className="mb-1 block font-bold text-slate-700">{field.label} <span className="font-normal text-slate-400">(không bắt buộc)</span></span>
                  {field.options?.length ? (
                    <select value={selectedGroupValues[field.key] || ""}
                      onChange={(event) => updateGroupValue(field.key, event.target.value)}
                      className={`w-full rounded-xl border bg-white p-2.5 ${inputErrorClass(`groupValues.${field.key}`)}`}>
                      <option value="">Chọn {field.label.toLowerCase()} (không bắt buộc)</option>
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                      {selectedGroupValues[field.key]
                        && !field.options.includes(selectedGroupValues[field.key])
                        ? <option value={selectedGroupValues[field.key]}>{selectedGroupValues[field.key]} (đã lưu)</option>
                        : null}
                    </select>
                  ) : (
                    <textarea rows={3} maxLength={5000} value={selectedGroupValues[field.key] || ""}
                      onChange={(event) => updateGroupValue(field.key, event.target.value)}
                      className={`w-full resize-y rounded-xl border p-2.5 ${inputErrorClass(`groupValues.${field.key}`)}`}
                      placeholder={`Nhập nội dung: ${field.label.toLowerCase()}`} />
                  )}
                  {fieldError(`groupValues.${field.key}`)}
                  <span className="mt-1 block text-right text-[10px] text-slate-500">{(selectedGroupValues[field.key] || "").length}/5.000</span>
                </div>
              ))}
              {selectedGroup === "parts_of_speech" ? (
                <div className="space-y-2 rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                  <h3 className="font-bold text-slate-900">Word Family — liên kết từ vựng có sẵn</h3>
                  <p className="text-[11px] text-slate-600">Chọn từ từ ngân hàng hiện tại; không tạo bản sao dữ liệu từ vựng.</p>
                  <a href="/admin/content/vocabulary" target="_blank" rel="noreferrer"
                    className="inline-block text-[11px] font-semibold text-violet-700 underline">
                    Mở quản lý từ vựng để bổ sung từ mới
                  </a>
                  {vocabularyError ? <p role="alert" className="text-rose-700">{vocabularyError}</p> : null}
                  <input value={wordSearch} onChange={(event) => setWordSearch(event.target.value)}
                    placeholder="Tìm từ theo từ vựng hoặc nghĩa"
                    className="w-full rounded-lg border border-slate-200 bg-white p-2" />
                  <select value="" disabled={wordFamilyWords.length >= 100} onChange={(event) => {
                    const word = vocabularyWords.find((item) => item.id === event.target.value);
                    if (!word || wordFamilyWords.some((item) => item.vocabularyItemId === word.id)) return;
                    setWordFamilyWords((previous) => [...previous, {
                      vocabularyItemId: word.id,
                      word: word.word,
                      partOfSpeech: word.partOfSpeech || word.pos || "Other",
                      meaning: word.meaning || "",
                    }]);
                    clearFieldError("wordFamilyWords");
                    setFormDirty(true);
                  }} className="w-full rounded-lg border border-slate-200 bg-white p-2">
                    <option value="">Chọn từ để liên kết...</option>
                    {vocabularyWords.filter((word) =>
                      !wordFamilyWords.some((linked) => linked.vocabularyItemId === word.id)
                      && `${word.word} ${word.meaning}`.toLowerCase().includes(wordSearch.toLowerCase()))
                      .slice(0, 100)
                      .map((word) => <option key={word.id} value={word.id}>{word.word} · {word.partOfSpeech || word.pos} · {word.meaning}</option>)}
                  </select>
                  {wordFamilyWords.map((word) => (
                    <div key={word.vocabularyItemId} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                      <span><b>{word.partOfSpeech}</b> · {word.word} — {word.meaning}</span>
                      <button type="button" onClick={() => {
                        setWordFamilyWords((previous) => previous.filter((item) => item.vocabularyItemId !== word.vocabularyItemId));
                        clearFieldError("wordFamilyWords");
                        setFormDirty(true);
                      }} className="font-bold text-rose-700">Xóa</button>
                    </div>
                  ))}
                  {fieldError("wordFamilyWords")}
                </div>
              ) : null}
            </div>
          </details>

          <section className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
            <div>
              <h3 className="font-bold text-slate-900">Gợi ý nội dung ngữ pháp</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                Nhập tên chủ điểm rồi tạo bản nháp ngay. Không cần rời khỏi trang hoặc nhập liên kết.
                Nếu có tài liệu tham khảo, bạn có thể bổ sung nguồn và ghi chú tùy chọn bên dưới.
              </p>
            </div>
            <details className="rounded-xl border border-sky-200 bg-white p-3">
              <summary className="cursor-pointer text-xs font-bold text-sky-800">
                Thêm nguồn British Council (không bắt buộc)
              </summary>
              <div className="mt-3 space-y-3">
                <button
                  type="button"
                  onClick={searchBritishCouncilGrammar}
                  className="rounded-xl border border-sky-300 bg-white px-3 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100"
                >
                  Tìm bài theo chủ điểm
                </button>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Liên kết bài tham khảo</label>
                  <input
                    type="url"
                    name="sourceUrl"
                    defaultValue={currentTopic?.sourceUrl || ""}
                    pattern="https://learnenglish\.britishcouncil\.org/.*"
                    maxLength={500}
                    placeholder="https://learnenglish.britishcouncil.org/..."
                    aria-invalid={Boolean(fieldErrors.sourceUrl)}
                    className={`w-full rounded-xl border bg-white p-2.5 ${inputErrorClass("sourceUrl")}`}
                  />
                  {fieldError("sourceUrl")}
                  <p className="mt-1 text-[10px] text-slate-500">Nếu nhập URL, chỉ chấp nhận HTTPS thuộc learnenglish.britishcouncil.org.</p>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Ghi chú của bạn (không bắt buộc)</label>
                  <textarea
                    name="sourceNotes"
                    rows={3}
                    defaultValue={currentTopic?.sourceNotes || ""}
                    maxLength={3000}
                    placeholder="Tóm tắt quy tắc bằng lời của bạn để AI có thêm ngữ cảnh; không dán nguyên văn bài."
                    aria-invalid={Boolean(fieldErrors.sourceNotes)}
                    className={`w-full resize-y rounded-xl border bg-white p-2.5 ${inputErrorClass("sourceNotes")}`}
                  />
                  {fieldError("sourceNotes")}
                </div>
                <p className="text-[10px] leading-relaxed text-slate-500">
                  Hệ thống không tự đọc trang nguồn. Nếu không có ghi chú, AI tạo bản nháp theo kiến thức chung và không khẳng định đã dựa trên bài British Council.
                </p>
              </div>
            </details>
            {suggestionError ? (
              <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-800">
                {suggestionError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={createGrammarSuggestion}
              disabled={isGeneratingSuggestion || isSaving}
              className="rounded-xl bg-sky-700 px-3 py-2 text-xs font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGeneratingSuggestion ? "Đang tạo bản nháp..." : "Tạo gợi ý nội dung"}
            </button>
            <p className="text-[10px] text-slate-500">
              AI chỉ điền nội dung vào biểu mẫu; không tự lưu hoặc phát hành. Hãy kiểm tra độ chính xác trước khi sử dụng.
            </p>
            {hasGeneratedSuggestion ? (
              <label className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-950">
                <input
                  type="checkbox"
                  name="suggestionReviewed"
                  checked={suggestionReviewed}
                  onChange={(event) => setSuggestionReviewed(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-amber-700"
                />
                <span>Tôi đã kiểm tra độ chính xác, chỉnh sửa nội dung cần thiết và xác nhận nội dung có thể phát hành.</span>
              </label>
            ) : null}
            {fieldError("suggestionReviewed")}
          </section>
          <details open className="rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-bold text-slate-900">Tóm tắt chủ điểm</summary>
            <div className="mt-4">
              <label className="mb-1 block font-bold text-slate-700">Tóm tắt ngắn gọn kỹ năng <span className="text-rose-600">*</span></label>
              <textarea name="summary" rows={3} defaultValue={currentTopic?.summary || ""}
                required maxLength={1000} onChange={(event) => setSummaryLength(event.target.value.length)}
                aria-invalid={Boolean(fieldErrors.summary)} aria-describedby={fieldErrors.summary ? "summary-error" : undefined}
                className={`w-full resize-none rounded-xl border p-2.5 ${inputErrorClass("summary")}`} />
              {fieldError("summary")}
              <p className="mt-1 text-right text-[11px] text-slate-500">{summaryLength}/1.000 · Bắt buộc</p>
            </div>
          </details>
          </div>

          <details open hidden={activeFormTab !== "theory"} id="grammar-topic-panel-theory" role="tabpanel" aria-labelledby="grammar-topic-tab-theory" className="rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-bold text-slate-900">3. Lý thuyết và ghi chú chung</summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["definition", "Khái niệm / định nghĩa"],
                ["usage", "Cách sử dụng"],
                ["sentencePosition", "Vị trí trong câu"],
                ["recognition", "Dấu hiệu nhận biết"],
                ["specialCases", "Các trường hợp đặc biệt"],
                ["importantNotes", "Lưu ý quan trọng"],
              ].map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-1 block font-bold text-slate-700">{label}</span>
                  <textarea rows={3} maxLength={5000} value={theory[key] || ""}
                    onChange={(event) => updateTheoryValue(key, event.target.value)}
                    aria-invalid={Boolean(fieldErrors[`theory.${key}`])}
                    className={`w-full resize-y rounded-xl border p-2.5 ${inputErrorClass(`theory.${key}`)}`} />
                  {fieldError(`theory.${key}`)}
                </label>
              ))}
              {fieldError("theory")}
            </div>
          </details>

          <details open hidden={activeFormTab !== "formula"} id="grammar-topic-panel-formula" role="tabpanel" aria-labelledby="grammar-topic-tab-formula" className="rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-bold text-slate-900">4. Công thức và bẫy đề TOEIC</summary>
            <div className="mt-4 space-y-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Công thức đóng khung chính <span className="text-rose-600">*</span></label>
            <p className="mb-2 text-[11px] leading-relaxed text-slate-500">
              Dùng Markdown để trình bày. Chọn gợi ý để chèn vào vị trí con trỏ, rồi thay phần trong ngoặc vuông bằng nội dung của chuyên đề.
            </p>
            <div className="mb-2 flex flex-wrap gap-2">
              {[
                ["Cấu trúc", "### Cấu trúc\n- **Công thức:** [mẫu cấu trúc]\n"],
                ["Cách dùng", "\n### Cách dùng\n- [Điều kiện / tình huống sử dụng]\n"],
                ["Dấu hiệu", "\n### Dấu hiệu nhận biết\n- **[Từ khóa]:** [cách nhận biết]\n"],
                ["Ví dụ", "\n### Ví dụ\n- [Câu ví dụ]\n  - **Giải thích:** [phân tích cấu trúc]\n"],
                ["Lưu ý", "\n### Lưu ý\n- [Lỗi thường gặp / điểm cần phân biệt]\n"],
              ].map(([label, suggestion]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => insertFormulaSuggestion(suggestion)}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  + {label}
                </button>
              ))}
            </div>
            <textarea
              ref={formulaRef}
              name="formula"
              rows={6}
              defaultValue={currentTopic?.formula || ""}
              required
              maxLength={5000}
              placeholder={"### Cấu trúc\n- **Công thức:** [mẫu cấu trúc]\n\n### Cách dùng\n- [Khi nào sử dụng]\n\n### Ví dụ\n- [Câu ví dụ]"}
              aria-invalid={Boolean(fieldErrors.formula)} aria-describedby={fieldErrors.formula ? "formula-error" : undefined}
              className={`w-full rounded-xl border p-3 font-mono text-xs font-semibold leading-relaxed text-slate-800 focus:outline-hidden focus:border-blue-500 ${inputErrorClass("formula")}`}
            />
            {fieldError("formula")}
            <p className="mt-1 text-[11px] text-slate-500">Bắt buộc · Tối đa 5.000 ký tự.</p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Dấu hiệu nhận biết <span className="font-normal text-slate-400">(không bắt buộc)</span></label>
            <textarea
              name="signalWords"
              rows={3}
              defaultValue={currentTopic?.signalWords?.join("\n") || ""}
              placeholder={"Nhập mỗi dấu hiệu trên một dòng\nVí dụ: although\nhowever\nin spite of"}
              maxLength={1000}
              aria-invalid={Boolean(fieldErrors.signalWords)}
              className={`w-full resize-y rounded-xl border p-2.5 ${inputErrorClass("signalWords")}`}
            />
            {fieldError("signalWords")}
            <p className="mt-1 text-[11px] text-slate-500">Không bắt buộc · Mỗi dấu hiệu hoặc từ khóa một dòng · Tối đa 1.000 ký tự.</p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Bẫy đề / lỗi thường gặp <span className="font-normal text-slate-400">(không bắt buộc)</span></label>
            <textarea
              name="traps"
              rows={3}
              defaultValue={currentTopic?.traps?.join("\n") || ""}
              placeholder={"Nhập mỗi bẫy đề trên một dòng\nVí dụ: Nhầm although với despite"}
              maxLength={1000}
              aria-invalid={Boolean(fieldErrors.traps)}
              className={`w-full resize-y rounded-xl border p-2.5 ${inputErrorClass("traps")}`}
            />
            {fieldError("traps")}
            <p className="mt-1 text-[11px] text-slate-500">Không bắt buộc · Mỗi bẫy một dòng · Tối đa 1.000 ký tự.</p>
          </div>
              {[
                ["commonMistakes", "Lỗi người học thường mắc"],
                ["confusingStructures", "Cấu trúc dễ nhầm lẫn"],
                ["answerTips", "Mẹo nhận diện đáp án"],
                ["partStrategies", "Chiến thuật Part 5, 6, 7"],
              ].map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-1 block font-bold text-slate-700">{label}</span>
                  <textarea rows={2} maxLength={3000}
                    value={(metadata.traps?.[key as keyof NonNullable<GrammarTopicItem["metadata"]>["traps"]] || []).join("\n")}
                    onChange={(event) => updateTrapMetadata(key, event.target.value)}
                    placeholder="Nhập mỗi nội dung trên một dòng"
                    className="w-full resize-y rounded-xl border border-slate-200 p-2.5" />
                </label>
              ))}
              {fieldError("metadata")}
            </div>
          </details>

          <div hidden={activeFormTab !== "examples"} id="grammar-topic-panel-examples" role="tabpanel" aria-labelledby="grammar-topic-tab-examples" className="space-y-4">
          <details open className="rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-bold text-slate-900">5. Ví dụ minh họa</summary>
            <section className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800">Ví dụ minh họa <span className="font-normal text-slate-400">(không bắt buộc)</span></h3>
                <p className="mt-1 text-[11px] text-slate-500">Không bắt buộc · Nếu nhập ví dụ, cần có câu tiếng Anh và bản dịch; phân tích là tùy chọn.</p>
                {fieldError("examples")}
              </div>
              <button
                type="button"
                disabled={examples.length >= 50}
                onClick={() => { setExamples((prev) => [...prev, { sentence: "", translation: "", analysis: "", focusWord: "", difficulty: "" }]); clearFieldError("examples"); clearExampleErrors(); setFormDirty(true); }}
                className="shrink-0 rounded-xl border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Thêm ví dụ
              </button>
            </div>
            {examples.map((example, index) => (
              <div key={index} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Ví dụ {index + 1}</span>
                  {examples.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => { setExamples((prev) => prev.filter((_, itemIndex) => itemIndex !== index)); clearExampleErrors(); setFormDirty(true); }}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Xóa ví dụ
                    </button>
                  ) : null}
                  <div className="flex gap-2">
                    <button type="button" disabled={index === 0} onClick={() => { setExamples((previous) => {
                      const ordered = [...previous]; [ordered[index - 1], ordered[index]] = [ordered[index], ordered[index - 1]]; return ordered;
                    }); clearExampleErrors(); setFormDirty(true); }} className="text-[11px] font-semibold text-slate-600 disabled:opacity-40">↑ Lên</button>
                    <button type="button" disabled={index === examples.length - 1} onClick={() => { setExamples((previous) => {
                      const ordered = [...previous]; [ordered[index + 1], ordered[index]] = [ordered[index], ordered[index + 1]]; return ordered;
                    }); clearExampleErrors(); setFormDirty(true); }} className="text-[11px] font-semibold text-slate-600 disabled:opacity-40">↓ Xuống</button>
                  </div>
                </div>
                  <GrammarExampleAnnotations
                    sentence={example.sentence}
                    annotations={example.annotations || []}
                    sentenceError={fieldErrors[`examples.${index}.sentence`]}
                    annotationError={Object.entries(fieldErrors)
                      .filter(([field]) => field === `examples.${index}.annotations` || field.startsWith(`examples.${index}.annotations.`))
                      .map(([, message]) => message).join(" ")}
                    onSentenceChange={(sentence) => {
                      setExamples((previous) => previous.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, sentence } : item));
                      if (sentence.trim() && sentence.length <= 1000) clearFieldError(`examples.${index}.sentence`);
                    }}
                    onAnnotationsChange={(annotations: GrammarExampleAnnotation[]) => {
                      setExamples((previous) => previous.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, annotations } : item));
                      setFieldErrors((previous) => Object.fromEntries(Object.entries(previous)
                        .filter(([field]) => field !== `examples.${index}.annotations`
                          && !field.startsWith(`examples.${index}.annotations.`))));
                      setFormDirty(true);
                    }}
                  />
                <textarea
                  rows={2}
                  value={example.translation}
                  maxLength={1000}
                  onChange={(event) => {
                    setExamples((prev) => prev.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, translation: event.target.value } : item));
                    if (event.target.value.trim() && event.target.value.length <= 1000) clearFieldError(`examples.${index}.translation`);
                  }}
                  placeholder="Bản dịch tiếng Việt"
                  aria-invalid={Boolean(fieldErrors[`examples.${index}.translation`])}
                  className={`w-full rounded-xl border bg-white p-2.5 ${inputErrorClass(`examples.${index}.translation`)}`}
                />
                {fieldError(`examples.${index}.translation`)}
                <textarea
                  rows={2}
                  value={example.analysis || ""}
                  maxLength={2000}
                  onChange={(event) => {
                    setExamples((prev) => prev.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, analysis: event.target.value } : item));
                    if (event.target.value.length <= 2000) clearFieldError(`examples.${index}.analysis`);
                  }}
                  placeholder="Phân tích cấu trúc / giải thích ví dụ"
                  aria-invalid={Boolean(fieldErrors[`examples.${index}.analysis`])}
                  className={`w-full rounded-xl border bg-white p-2.5 ${inputErrorClass(`examples.${index}.analysis`)}`}
                />
                {fieldError(`examples.${index}.analysis`)}
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={example.focusWord || ""} maxLength={200}
                    onChange={(event) => {
                      setExamples((previous) => previous.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, focusWord: event.target.value } : item));
                      if (event.target.value.length <= 200) clearFieldError(`examples.${index}.focusWord`);
                    }}
                    placeholder="Từ / cụm từ trọng tâm"
                    aria-invalid={Boolean(fieldErrors[`examples.${index}.focusWord`])}
                    className={`w-full rounded-xl border bg-white p-2.5 ${inputErrorClass(`examples.${index}.focusWord`)}`} />
                  {fieldError(`examples.${index}.focusWord`)}
                  <select value={example.difficulty || ""} onChange={(event) => setExamples((previous) => previous.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, difficulty: event.target.value } : item))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5">
                    <option value="">Độ khó (không bắt buộc)</option><option value="EASY">Cơ bản</option>
                    <option value="MEDIUM">Trung bình</option><option value="HARD">Nâng cao</option>
                  </select>
                </div>
              </div>
            ))}
            </section>
          </details>

          </div>

          <div hidden={activeFormTab !== "questions"} id="grammar-topic-panel-questions" role="tabpanel" aria-labelledby="grammar-topic-tab-questions" className="space-y-4">
            {currentTopic ? (
              <>
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs leading-relaxed text-blue-900">
                  Câu hỏi được quản lý riêng với ví dụ minh họa. Bạn có thể xem các câu hỏi hiện có tại đây; để thêm hoặc chỉnh sửa, hãy lưu chủ điểm rồi dùng thao tác quản lý câu hỏi trong danh sách chủ điểm.
                </div>
                <GrammarQuestionsViewer questions={currentTopic.questions || []} />
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-xs text-slate-600">
                Lưu chủ điểm trước, sau đó thêm câu hỏi bằng thao tác quản lý câu hỏi của chủ điểm.
              </div>
            )}
          </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setActiveFormTab(formTabs[Math.max(0, formTabs.findIndex((tab) => tab.id === activeFormTab) - 1)].id)}
              disabled={activeFormTab === "info"}
              className="rounded-xl px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Quay lại
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              {activeFormTab !== "questions" ? (
                <button
                  type="button"
                  onClick={() => setActiveFormTab(formTabs[Math.min(formTabs.length - 1, formTabs.findIndex((tab) => tab.id === activeFormTab) + 1)].id)}
                  className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-blue-700"
                >
                  Tiếp theo
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </div>
          </div>
  );
};

// ==========================================
// 3. MODAL XÁC NHẬN XÓA CHỦ ĐIỂM NGỮ PHÁP
// ==========================================
interface GrammarDeleteModalProps {
  deleteConfirmTopic?: GrammarTopicItem | null;
  topic?: GrammarTopicItem | null;
  topics?: GrammarTopicItem[];
  onClose: () => void;
  onConfirm: (request: DeleteGrammarTopicRequest) => Promise<void>;
}

export const GrammarDeleteModal: React.FC<GrammarDeleteModalProps> = ({
  deleteConfirmTopic,
  topic: topicProp,
  topics = [],
  onClose,
  onConfirm,
}) => {
  const currentTopic = deleteConfirmTopic || topicProp || null;
  const [impactLoad, setImpactLoad] = useState<{
    topicId: string;
    impact?: GrammarTopicLifecycleImpact;
    error?: string;
  } | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [childAction, setChildAction] = useState<"ROOTS" | "MOVE">("ROOTS");
  const [targetParentId, setTargetParentId] = useState("");
  const topicId = currentTopic?.id;

  useEffect(() => {
    if (!topicId) return;
    let active = true;
    getGrammarTopicLifecycleImpact(topicId)
      .then((result) => {
        if (active) setImpactLoad({ topicId, impact: result });
      })
      .catch((error: unknown) => {
        if (active) setImpactLoad({
          topicId,
          error: error instanceof Error ? error.message : "Không thể kiểm tra dữ liệu liên kết.",
        });
      });
    return () => { active = false; };
  }, [topicId]);

  if (!currentTopic) return null;
  const impact = impactLoad?.topicId === currentTopic.id ? impactLoad.impact || null : null;
  const impactError = impactLoad?.topicId === currentTopic.id ? impactLoad.error || null : null;
  const isLoading = !impact && !impactError;
  const topicById = new Map(topics.map((item) => [item.id, item]));
  const isDescendantOfCurrent = (candidate: GrammarTopicItem) => {
    const visited = new Set<string>();
    let parentId = candidate.parentTopicId;
    while (parentId && !visited.has(parentId)) {
      if (parentId === currentTopic.id) return true;
      visited.add(parentId);
      parentId = topicById.get(parentId)?.parentTopicId;
    }
    return false;
  };
  const validTargets = topics.filter((item) =>
    item.id !== currentTopic.id && item.status !== "ARCHIVED" && !isDescendantOfCurrent(item));
  const hasLinkedData = !!impact && (
    impact.userProgressCount > 0
    || impact.wordFamilyLinkCount > 0
    || impact.toeicQuestionLinkCount > 0
    || impact.learningPathLinkCount > 0
  );
  const childCount = impact?.childCount || 0;
  const canSubmit = !!impact && !isLoading && !impactError && !hasLinkedData
    && (childCount === 0 || childAction === "ROOTS" || (childAction === "MOVE" && !!targetParentId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <Trash2 className="w-6 h-6" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold text-slate-900">Xóa chủ điểm ngữ pháp?</h3>
          <p className="text-xs text-slate-500 mt-1">
            Bạn có chắc chắn muốn xóa &quot;{currentTopic.titleVi || currentTopic.title}&quot;?
          </p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Đang kiểm tra dữ liệu liên kết…</div>
        ) : null}
        {impactError ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800">{impactError}</p> : null}
        {impact ? (
          <>
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <h4 className="text-xs font-bold text-slate-800">Dữ liệu hiện có sẽ được rà soát</h4>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600 sm:grid-cols-3">
                <span>{impact.childCount} chủ điểm con</span>
                <span>{impact.questionCount} câu hỏi</span>
                <span>{impact.exampleCount} ví dụ</span>
                <span>{impact.theoryFieldCount} mục lý thuyết</span>
                <span>{impact.wordFamilyLinkCount} liên kết Word Family</span>
                <span>{impact.toeicQuestionLinkCount} câu hỏi TOEIC liên kết</span>
                <span>{impact.userProgressCount} bản ghi tiến độ học</span>
                <span>{impact.learningPathLinkCount} liên kết lộ trình/bài học</span>
              </div>
            </section>
            {childCount > 0 ? (
              <>
                <section className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <h4 className="text-xs font-bold text-amber-950">Chủ điểm con ({childCount})</h4>
                  <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs text-amber-900">
                    {impact.children.map((child) => (
                      <li key={child.id}><span className="font-mono">{child.code}</span> · {child.title} <span className="text-amber-700">({child.status})</span></li>
                    ))}
                  </ul>
                </section>
                <fieldset className="space-y-2">
                  <legend className="text-xs font-bold text-slate-800">Chọn cách xử lý các chủ điểm con</legend>
                  <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 p-3 text-xs">
                    <input type="radio" name="grammar-delete-child-action" checked={childAction === "ROOTS"} onChange={() => setChildAction("ROOTS")} />
                    <span><strong>Chuyển thành chủ điểm độc lập</strong><span className="mt-0.5 block text-slate-500">Chuyển các con trực tiếp thành gốc; mọi nội dung và các cấp con sâu hơn được giữ nguyên.</span></span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 p-3 text-xs">
                    <input type="radio" name="grammar-delete-child-action" checked={childAction === "MOVE"} onChange={() => setChildAction("MOVE")} />
                    <span><strong>Chuyển sang chủ điểm cha khác</strong><span className="mt-0.5 block text-slate-500">Không thể chọn chính chủ điểm hoặc hậu duệ của nó.</span></span>
                  </label>
                  {childAction === "MOVE" ? (
                    <select
                      value={targetParentId}
                      onChange={(event) => setTargetParentId(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                      aria-label="Chọn chủ điểm cha đích"
                    >
                      <option value="">Chọn chủ điểm cha đích</option>
                      {validTargets.map((target) => (
                        <option key={target.id} value={target.id}>{target.titleVi || target.title} · {target.code}</option>
                      ))}
                    </select>
                  ) : null}
                </fieldset>
              </>
            ) : null}
            {hasLinkedData ? (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-relaxed text-rose-800">
                Không thể xóa vì còn dữ liệu liên kết hoặc tiến độ học. Hãy hủy và dùng chức năng lưu trữ để giữ nguyên dữ liệu.
              </p>
            ) : (
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
                {childCount > 0
                  ? "Các chủ điểm con sẽ được chuyển trong cùng giao dịch với thao tác xóa; nếu xóa thất bại, toàn bộ thay đổi được hoàn tác."
                  : "Nội dung gắn trực tiếp (lý thuyết, ví dụ và câu hỏi) sẽ bị xóa cùng chủ điểm. Dữ liệu liên kết bên ngoài được bảo vệ."}
              </p>
            )}
          </>
        ) : null}
        {operationError ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800">{operationError}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              setOperationError(null);
              try {
                await onConfirm({
                  childAction: childCount > 0 ? childAction : "NONE",
                  targetParentId: childAction === "MOVE" ? targetParentId : null,
                });
                onClose();
              } catch (error) {
                setOperationError(error instanceof Error ? error.message : "Không thể xóa chủ điểm.");
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Đang xóa…" : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface GrammarArchiveModalProps {
  topic: GrammarTopicItem | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const GrammarArchiveModal: React.FC<GrammarArchiveModalProps> = ({ topic, onClose, onConfirm }) => {
  const [impactLoad, setImpactLoad] = useState<{
    topicId: string;
    impact?: GrammarTopicLifecycleImpact;
    error?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const topicId = topic?.id;

  useEffect(() => {
    if (!topicId) return;
    let active = true;
    getGrammarTopicLifecycleImpact(topicId)
      .then((result) => { if (active) setImpactLoad({ topicId, impact: result }); })
      .catch((err: unknown) => {
        if (active) setImpactLoad({
          topicId,
          error: err instanceof Error ? err.message : "Không thể kiểm tra dữ liệu liên kết.",
        });
      });
    return () => { active = false; };
  }, [topicId]);

  if (!topic) return null;
  const impact = impactLoad?.topicId === topic.id ? impactLoad.impact || null : null;
  const error = impactLoad?.topicId === topic.id ? impactLoad.error || null : null;
  const isLoading = !impact && !error;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Archive className="h-5 w-5" /></span>
          <div>
            <h3 className="text-base font-bold text-slate-900">Lưu trữ chủ điểm?</h3>
            <p className="text-xs text-slate-500">{topic.titleVi || topic.title}</p>
          </div>
        </div>
        {isLoading ? <p className="text-xs text-slate-500">Đang kiểm tra dữ liệu liên kết…</p> : null}
        {error ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800">{error}</p> : null}
        {impact ? (
          <>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 sm:grid-cols-3">
              <span>{impact.childCount} chủ điểm con</span>
              <span>{impact.questionCount} câu hỏi</span>
              <span>{impact.exampleCount} ví dụ</span>
              <span>{impact.theoryFieldCount} mục lý thuyết</span>
              <span>{impact.wordFamilyLinkCount} liên kết Word Family</span>
              <span>{impact.toeicQuestionLinkCount} liên kết câu hỏi TOEIC</span>
              <span>{impact.userProgressCount} bản ghi tiến độ</span>
              <span>{impact.learningPathLinkCount} liên kết lộ trình/bài học</span>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-950">
              Chủ điểm sẽ được ẩn khỏi danh sách đang hoạt động nhưng vẫn tồn tại trong database. {impact.childCount
                ? `Các ${impact.childCount} chủ điểm con trực tiếp sẽ được chuyển thành chủ điểm gốc. Con đang phát hành tiếp tục hiển thị với học viên; con đã lưu trữ vẫn được lưu trữ.`
                : "Không có chủ điểm con cần chuyển."} Có thể khôi phục chủ điểm này trong mục Lưu trữ.
            </div>
            {impact.children.length ? (
              <ul className="max-h-24 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-3 text-xs text-slate-600">
                {impact.children.map((child) => <li key={child.id}>{child.code} · {child.title} ({child.status})</li>)}
              </ul>
            ) : null}
          </>
        ) : null}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">Hủy</button>
          <button
            type="button"
            disabled={!impact || isLoading || !!error || isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                await onConfirm();
                onClose();
              } catch (err) {
                setImpactLoad({
                  topicId: topic.id,
                  ...(impact ? { impact } : {}),
                  error: err instanceof Error ? err.message : "Không thể lưu trữ chủ điểm.",
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Đang lưu trữ…" : "Lưu trữ"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. MODAL THÊM CÂU HỎI TRẮC NGHIỆM VÀO CHỦ ĐIỂM
// ==========================================
interface GrammarAddQuestionModalProps {
  topic: GrammarTopicItem | null;
  topics: GrammarTopicItem[];
  question?: GrammarQuestionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveQuestion: (topicId: string, q: GrammarQuestionItem, originalQuestionId?: string) => Promise<void>;
}

export const GrammarAddQuestionModal: React.FC<GrammarAddQuestionModalProps> = ({
  topic,
  topics,
  question = null,
  isOpen,
  onClose,
  onSaveQuestion,
}) => {
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const normalizePart = (value?: string) => value?.toUpperCase().replace(/[\s_]+/g, "_");
  const questionPart = normalizePart(question?.part) || normalizePart(topic?.part) || "PART_5";
  const questionDifficulty = question?.difficulty?.toUpperCase().replace("_", "-");
  const difficultyValue = questionDifficulty === "EASY" || questionDifficulty === "350-500"
    ? "EASY"
    : questionDifficulty === "HARD" || questionDifficulty === "750+"
      ? "HARD"
      : "MEDIUM";
  if (!isOpen || (!topic && topics.length === 0)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">{question ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi trắc nghiệm"}</h3>
            <p className="text-xs text-slate-500">
              {topic ? `Chuyên đề: ${topic.titleVi || topic.title}` : "Chọn chuyên đề để liên kết câu hỏi."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const qText = (formData.get("questionText") as string || "").trim();
            const optA = (formData.get("optA") as string || "").trim();
            const optB = (formData.get("optB") as string || "").trim();
            const optC = (formData.get("optC") as string || "").trim();
            const optD = (formData.get("optD") as string || "").trim();
            const expl = (formData.get("explanation") as string || "").trim();
            const selectedTopicId = topic?.id || String(formData.get("topicId") || "");
            const selectedTopic = topics.find((item) => item.id === selectedTopicId);
            if (!selectedTopic) {
              setSaveError("Chọn chuyên đề liên kết cho câu hỏi.");
              return;
            }
            const missingOption = [optA, optB, optC, optD].some((option) => !option);
            if (!qText || !optA || !optB || !optC || !optD || !expl) {
              setSaveError("Nhập nội dung câu hỏi, đủ 4 phương án và phần giải thích.");
              return;
            }
            if (qText.length > 1000 || [optA, optB, optC, optD].some((option) => option.length > 250) || expl.length > 2000) {
              setSaveError("Nội dung câu hỏi tối đa 1.000 ký tự, mỗi phương án 250 ký tự và giải thích 2.000 ký tự.");
              return;
            }
            if (missingOption) {
              setSaveError("Cả bốn phương án A, B, C, D đều bắt buộc.");
              return;
            }

            const questionPayload: GrammarQuestionItem = {
              id: question?.id || "",
              part: String(formData.get("part") || "PART_5"),
              questionText: qText,
              options: { A: optA, B: optB, C: optC, D: optD },
              correctAnswer: String(formData.get("correctAnswer") || "A") as "A" | "B" | "C" | "D",
              explanation: expl,
              translation: String(formData.get("translation") || "").trim(),
              trapNote: String(formData.get("trapNote") || "").trim(),
              difficulty: String(formData.get("difficulty") || "MEDIUM"),
            };
            setSaveError(null);
            setIsSaving(true);
            try {
              await onSaveQuestion(selectedTopic.id, questionPayload, question?.id ? String(question.id) : undefined);
              onClose();
            } catch (error) {
              setSaveError(error instanceof Error ? error.message : "Không thể lưu câu hỏi.");
            } finally {
              setIsSaving(false);
            }
          }}
          onChange={() => {
            if (saveError) setSaveError(null);
          }}
          className="space-y-3.5 text-xs font-medium"
        >
          {saveError ? (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
              {saveError}
            </p>
          ) : null}
          {!topic ? (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Chuyên đề liên kết <span className="text-rose-600">*</span></label>
              <select name="topicId" required defaultValue="" className="w-full p-2.5 rounded-xl border border-slate-200 bg-white">
                <option value="" disabled>Chọn chuyên đề</option>
                {topics.map((item) => (
                  <option key={item.id} value={item.id}>{item.titleVi || item.title} ({item.code})</option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Nội dung câu hỏi <span className="text-rose-600">*</span></label>
            <input
              type="text"
              name="questionText"
              required
              maxLength={1000}
              defaultValue={question?.questionText || ""}
              placeholder="Ví dụ: Mr. Kim _____ the quarterly sales report yesterday."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Đáp án A <span className="text-rose-600">*</span></label>
              <input
                type="text"
                name="optA"
                required
                maxLength={250}
                defaultValue={question?.options.A || ""}
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Đáp án B <span className="text-rose-600">*</span></label>
              <input
                type="text"
                name="optB"
                required
                maxLength={250}
                defaultValue={question?.options.B || ""}
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Đáp án C <span className="text-rose-600">*</span></label>
              <input
                type="text"
                name="optC"
                required
                maxLength={250}
                defaultValue={question?.options.C || ""}
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Đáp án D <span className="text-rose-600">*</span></label>
              <input
                type="text"
                name="optD"
                required
                maxLength={250}
                defaultValue={question?.options.D || ""}
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Đáp án đúng</label>
            <select
              name="correctAnswer"
              required
              defaultValue={question?.correctAnswer || "A"}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-blue-700"
            >
              <option value="A">Đáp án A</option>
              <option value="B">Đáp án B</option>
              <option value="C">Đáp án C</option>
              <option value="D">Đáp án D</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Part <span className="text-rose-600">*</span></label>
              <select name="part" required defaultValue={questionPart.includes("6") ? "PART_6" : questionPart.includes("7") ? "PART_7" : "PART_5"} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white">
                <option value="PART_5">Part 5</option>
                <option value="PART_6">Part 6</option>
                <option value="PART_7">Part 7</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Độ khó</label>
              <select name="difficulty" defaultValue={difficultyValue} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white">
                <option value="EASY">Cơ bản</option>
                <option value="MEDIUM">Trung cấp</option>
                <option value="HARD">Nâng cao</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Bản dịch <span className="font-normal text-slate-400">(không bắt buộc)</span></label>
              <input name="translation" maxLength={1000} defaultValue={question?.translation || ""} className="w-full p-2.5 rounded-xl border border-slate-200" />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Giải thích chi tiết <span className="text-rose-600">*</span></label>
            <textarea
              name="explanation"
              rows={3}
              required
              maxLength={2000}
              defaultValue={question?.explanation || ""}
              placeholder="Giải thích lý do chọn đáp án đúng..."
              className="w-full p-2.5 rounded-xl border border-slate-200 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Bẫy / lỗi thường gặp <span className="font-normal text-slate-400">(không bắt buộc)</span></label>
            <textarea name="trapNote" rows={2} maxLength={1000} defaultValue={question?.trapNote || ""} className="w-full p-2.5 rounded-xl border border-slate-200 resize-y" />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Đang lưu..." : question ? "Lưu câu hỏi" : "Thêm câu hỏi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. RENDERER TỪ VỰNG & DẤU HIỆU NHẬN BIẾT
// ==========================================
function GrammarSignalWordsRenderer({ signalWords }: { signalWords: string[] }) {
  if (!signalWords || signalWords.length === 0) return null;

  const parsedLines: string[] = [];
  signalWords.forEach((raw) => {
    if (!raw) return;
    const normalized = raw
      .replace(/\s+-\s+(?=[A-ZÀ-Ỹa-zà-ỹ\*])/g, "\n- ")
      .replace(/\s+\*\s+/g, "\n  * ");

    normalized.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed) parsedLines.push(trimmed);
    });
  });

  if (parsedLines.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200/90 text-xs text-blue-950 space-y-2.5 shadow-2xs">
      <div className="flex items-center gap-2 border-b border-blue-200/60 pb-2">
        <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
        <strong className="text-blue-900 font-bold text-xs">
          Từ vựng &amp; Dấu hiệu nhận biết nhanh trong bài thi:
        </strong>
      </div>

      <div className="space-y-2 pt-0.5">
        {parsedLines.map((line, idx) => {
          const isMainBullet = line.startsWith("- ");
          const isSubBullet = line.startsWith("* ") || line.startsWith("-> ");
          const cleanText = line
            .replace(/^-\s*/, "")
            .replace(/^\*\s*/, "")
            .replace(/^->\s*/, "");

          if (isMainBullet) {
            return (
              <div
                key={idx}
                className="flex items-start gap-2 pt-1 font-bold text-slate-900 text-xs leading-relaxed"
              >
                <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                  •
                </span>
                <div className="flex-1">
                  <FormattedText text={cleanText} />
                </div>
              </div>
            );
          }

          if (isSubBullet) {
            return (
              <div
                key={idx}
                className="ml-5 pl-2.5 py-1 text-[11px] text-slate-700 border-l-2 border-blue-300 bg-white/75 rounded-r-lg font-medium leading-relaxed shadow-2xs"
              >
                <FormattedText text={cleanText.replace(/->/g, "➔")} />
              </div>
            );
          }

          return (
            <div key={idx} className="pl-6 text-xs text-slate-700 leading-relaxed">
              <FormattedText text={cleanText} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 6. MODAL LUYỆN TẬP QUIZ NGỮ PHÁP FULLSCREEN
// ==========================================
interface GrammarQuizModalProps {
  initialIndex?: number;
  isRedoWrongOnly?: boolean;
  isOpen: boolean;
  title: string;
  questions: GrammarQuestionItem[];
  onClose: () => void;
  activeTopic: GrammarTopicItem | null;
  onRecordResult?: (topicId: string, isCorrect: boolean) => void;
}

export const GrammarQuizModal: React.FC<GrammarQuizModalProps> = ({
  isOpen,
  title,
  questions: rawQuestions,
  onClose,
  activeTopic,
  onRecordResult,
  initialIndex = 0,
  isRedoWrongOnly = false,
}) => {
  const LOCAL_STORAGE_KEY = "toeic_grammar_curriculum_config";

  const [grammarConfig, setGrammarConfig] = useState({
    minAccuracyPass: 80,
    srsGrammarInterval: 3,
    shuffleQuestions: true,
    showExplanationImmediately: true,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setGrammarConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, [isOpen]);

  // Đảm bảo bài luôn có đủ 30 câu hỏi thực tế chuẩn TOEIC Part 5
  const fullQuestions = useMemo(() => {
    const topicTitle = activeTopic?.titleVi || activeTopic?.title || "Ngữ pháp";
    let list = expandGrammarQuestions(rawQuestions, topicTitle, 30);
    // Nếu cấu hình bật xáo trộn câu hỏi và không phải chế độ redo câu sai
    if (grammarConfig.shuffleQuestions && !isRedoWrongOnly && list.length > 1) {
      list = [...list].sort((a, b) => {
        const hashA = (Number(a.id || 0) * 19 + a.questionText.length * 7) % 97;
        const hashB = (Number(b.id || 0) * 19 + b.questionText.length * 7) % 97;
        return hashA - hashB;
      });
    }
    return list;
  }, [rawQuestions, activeTopic, grammarConfig.shuffleQuestions, isRedoWrongOnly]);

  // Nếu là chế độ redo câu sai, lọc các câu bị sai
  const questions = useMemo(() => {
    if (!isRedoWrongOnly || !activeTopic) return fullQuestions;
    const prog = getItemProgress(`grammar-${activeTopic.id}`, fullQuestions.length);
    const wrongList = prog.wrongQuestionIds || [];
    const wrongIds = wrongList.map((id) => String(id));
    if (wrongIds.length === 0) {
      const fallbackCount = Math.max(1, prog.wrongAnswers || 2);
      return fullQuestions.slice(0, fallbackCount);
    }
    const filtered = fullQuestions.filter((q, idx) => {
      const qIdStr = String(q.id || "");
      const idxStr = String(idx + 1);
      const idx0Str = String(idx);
      return wrongIds.some(
        (wid) => wid === qIdStr || wid === idxStr || wid === idx0Str || qIdStr.endsWith(`-${wid}`) || qIdStr.endsWith(`_${wid}`)
      );
    });
    return filtered.length > 0 ? filtered : fullQuestions.slice(0, Math.max(1, prog.wrongAnswers || 2));
  }, [fullQuestions, isRedoWrongOnly, activeTopic]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const targetStart = isRedoWrongOnly ? 0 : Math.min(initialIndex, Math.max(0, questions.length - 1));
      setCurrentIndex(targetStart);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setScore(0);
      setQuizFinished(false);
    }
  }, [isOpen, initialIndex, isRedoWrongOnly, questions.length]);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  const handleSelectAnswer = (optKey: "A" | "B" | "C" | "D") => {
    if (isAnswerChecked) return;
    playUnifiedAnswerSound();
    setSelectedAnswer(optKey);
    setIsAnswerChecked(true);

    const isCorrect = optKey === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (activeTopic) {
      recordQuestionAnswer(`grammar-${activeTopic.id}`, currentQ.id, isCorrect, questions.length);
      if (onRecordResult) {
        onRecordResult(activeTopic.id, isCorrect);
      }
    }
  };

  const handlePrevQuizQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setScore(0);
    setQuizFinished(false);
  };

  const finalAccuracy = Math.round((score / Math.max(1, questions.length)) * 100);
  const isPassed = finalAccuracy >= grammarConfig.minAccuracyPass;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header Quiz */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-base text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">
              {!quizFinished ? `Câu ${currentIndex + 1} / ${questions.length}` : "Kết quả luyện tập"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {grammarConfig.shuffleQuestions && !quizFinished && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                Xáo trộn đề
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thân bài Quiz */}
        {!quizFinished ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold mb-2">
                {currentQ.part}
              </span>
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                {currentQ.questionText}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {(["A", "B", "C", "D"] as const).map((optKey) => {
                const optText = currentQ.options[optKey];
                const isChosen = selectedAnswer === optKey;
                const isCorrectAnswer = isAnswerChecked && optKey === currentQ.correctAnswer;
                const isWrongChosen = isAnswerChecked && isChosen && optKey !== currentQ.correctAnswer;

                return (
                  <button
                    key={optKey}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => handleSelectAnswer(optKey)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                      isCorrectAnswer
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                        : isWrongChosen
                        ? "bg-rose-50 border-rose-500 text-rose-900"
                        : isChosen
                        ? "bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20"
                        : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCorrectAnswer
                            ? "bg-emerald-600 text-white"
                            : isWrongChosen
                            ? "bg-rose-600 text-white"
                            : isChosen
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {optKey}
                      </span>
                      <span className="leading-snug">{optText}</span>
                    </div>

                    {isCorrectAnswer && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {isWrongChosen && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* HIỂN THỊ DỊCH NGHĨA & BẪY ĐỀ NẾU CẤU HÌNH BẬT showExplanationImmediately */}
            {isAnswerChecked && (
              grammarConfig.showExplanationImmediately ? (
                <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                  <div
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      selectedAnswer === currentQ.correctAnswer
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-rose-50 border-rose-200 text-rose-900"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-2">
                      {selectedAnswer === currentQ.correctAnswer ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Chính xác! Đáp án đúng là {currentQ.correctAnswer}</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-rose-600" />
                          <span>
                            Chưa chính xác! Đáp án đúng là <strong>{currentQ.correctAnswer}</strong>
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      <strong>Giải thích chi tiết:</strong> {currentQ.explanation}
                    </p>
                  </div>

                  {currentQ.trapNote && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-amber-800 mb-0.5">Mẹo làm bài &amp; Bẫy đề thi TOEIC:</strong>
                        <p className="text-slate-700 leading-relaxed">{currentQ.trapNote}</p>
                      </div>
                    </div>
                  )}

                  {currentQ.translation && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 shadow-2xs">
                      <strong className="text-slate-900 block font-bold">Dịch nghĩa câu hỏi:</strong>
                      <p className="italic leading-relaxed text-slate-800">&quot;{currentQ.translation}&quot;</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium text-center">
                  Đã ghi nhận câu trả lời. Theo cấu hình thi thử, giải thích chi tiết sẽ hiển thị khi bạn hoàn thành toàn bài.
                </div>
              )
            )}
          </div>
        ) : (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900">Hoàn Thành Bài Luyện Tập!</h2>
              <p className="text-xs text-slate-500">
                Mục tiêu chuẩn đầu ra theo cấu hình: <strong>≥ {grammarConfig.minAccuracyPass}% đúng</strong>
              </p>
            </div>

            <div className="inline-flex items-center gap-6 px-8 py-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Số câu đúng</p>
                <p className="text-2xl font-extrabold text-emerald-600">
                  {score} / {questions.length}
                </p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Tỷ lệ chính xác</p>
                <p className={`text-2xl font-extrabold ${isPassed ? "text-emerald-600" : "text-amber-600"}`}>
                  {finalAccuracy}%
                </p>
              </div>
            </div>

            {/* THÔNG BÁO ĐẠT CHUẨN & SRS ÔN TẬP */}
            {isPassed ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1 text-center max-w-md mx-auto">
                <div className="flex items-center justify-center gap-1.5 font-bold text-sm text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ĐẠT CHUẨN ĐẦU RA ({finalAccuracy}% ≥ {grammarConfig.minAccuracyPass}%)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Chúc mừng bạn! Bạn đã hoàn thành xuất sắc yêu cầu và sẵn sàng mở khóa chuyên đề tiếp theo.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 text-center max-w-md mx-auto">
                <div className="flex items-center justify-center gap-1.5 font-bold text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Chưa đạt mốc chuẩn ({finalAccuracy}% &lt; {grammarConfig.minAccuracyPass}%)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Hệ thống SRS (lặp lại ngắt quãng) đã lên lịch ôn tập lại các câu sai của bài này sau <strong>{grammarConfig.srsGrammarInterval} ngày</strong>.
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleRestart}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Làm lại bài
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {!quizFinished && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                {isAnswerChecked
                  ? `Đã hoàn thành câu ${currentIndex + 1}/${questions.length}`
                  : "Chọn 1 đáp án để kiểm tra ngay"}
              </span>
              <QuestionErrorReportButton
                source="QUESTION_BANK"
                questionRef={String(currentQ.id || `grammar-${activeTopic?.id || 'quiz'}-${currentIndex + 1}`)}
                relatedContent={`Ngữ pháp: ${activeTopic?.title || title || 'Quiz'} - Câu ${currentIndex + 1}`}
                questionSnapshot={{
                  questionText: currentQ.questionText,
                  options: currentQ.options,
                  correctAnswer: currentQ.correctAnswer,
                  explanation: currentQ.explanation,
                  topicTitle: activeTopic?.title || title,
                }}
                compact
              />
            </div>

            <div className="flex items-center gap-2.5">
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrevQuizQuestion}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Câu trước</span>
                </button>
              )}

              {isAnswerChecked && (
                currentIndex + 1 < questions.length ? (
                  <button
                    type="button"
                    onClick={handleNextQuizQuestion}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Câu tiếp theo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuizQuestion}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Hoàn thành bài tập</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
