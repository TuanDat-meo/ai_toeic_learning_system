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
} from "lucide-react";
import { GrammarTopicItem, GrammarQuestionItem, GrammarCategory, GrammarWordFamilyLink } from "@/app/admin/content/grammar/types";

import { QuestionErrorReportButton } from "@/components/support/QuestionErrorReportButton";
import {
  GrammarFormulaViewer,
  GrammarSignalsViewer,
  GrammarTrapsViewer,
  GrammarExamplesViewer,
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
} from "@/lib/api/grammar";
import { getAdminVocabularySets } from "@/lib/api/vocabulary";
import type { WordItem } from "@/app/admin/content/vocabulary/types";

// ==========================================
// 1. MODAL XEM CHI TIẾT CHỦ ĐIỂM NGỮ PHÁP
// ==========================================
interface GrammarTopicDetailModalProps {
  topic: GrammarTopicItem | null;
  onClose: () => void;
  onStartQuiz?: (topic: GrammarTopicItem) => void;
  audience?: "student" | "admin";
}

export const GrammarTopicDetailModal: React.FC<GrammarTopicDetailModalProps> = ({
  topic: topicProp,
  onClose,
  onStartQuiz,
  audience = "student",
}) => {
  const [activeTab, setActiveTab] = useState<"formula" | "signals" | "traps" | "examples">("formula");
  const [detailTopic, setDetailTopic] = useState<GrammarTopicItem | null>(topicProp);

  useEffect(() => {
    if (!topicProp) {
      setDetailTopic(null);
      return;
    }

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

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 font-medium leading-relaxed">
          <strong className="font-bold text-blue-900">Tóm tắt ngắn: </strong>
          {topic.summary}
        </div>
        {grammarDetailsExist ? (
          <details className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
            <summary className="cursor-pointer text-xs font-bold text-violet-950">Lý thuyết chi tiết · {topic.difficulty || "TOEIC"}</summary>
            <div className="mt-3 space-y-3">
              {[...theoryEntries, ...groupEntries].map(([key, value]) => (
                <div key={key} className="rounded-xl bg-white/80 p-3">
                  <h3 className="mb-1 text-[11px] font-bold text-slate-700">
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}
                  </h3>
                  <FormattedText text={value} className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700" />
                </div>
              ))}
              {topic.wordFamilyWords?.length ? (
                <div className="rounded-xl bg-white/80 p-3">
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
          </details>
        ) : null}
        {audience === "admin" && topic.sourceUrl ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-xs text-sky-950">
            <strong className="font-bold">Nguồn tham khảo: </strong>
            <a
              href={topic.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-semibold text-sky-800 underline underline-offset-2 hover:text-sky-950"
            >
              British Council LearnEnglish
            </a>
          </div>
        ) : null}

        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("formula")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "formula" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Công thức chính</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("signals")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "signals" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Dấu hiệu nhận biết</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("traps")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "traps" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Bẫy TOEIC</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("examples")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "examples" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ví dụ minh họa</span>
          </button>
        </div>

        <div className="min-h-[160px] text-xs space-y-3">
          {activeTab === "formula" && (
            <div className="animate-in fade-in">
              <GrammarFormulaViewer
                formulaText={topic.formula}
                topicTitle={topic.titleVi || topic.title}
                topicCode={topic.code}
              />
            </div>
          )}

          {activeTab === "signals" && (
            <div className="animate-in fade-in">
              <GrammarSignalsViewer signalWords={topic.signalWords} />
            </div>
          )}

          {activeTab === "traps" && (
            <div className="animate-in fade-in">
              <GrammarTrapsViewer traps={displayTraps} />
            </div>
          )}

          {activeTab === "examples" && (
            <div className="animate-in fade-in">
              <GrammarExamplesViewer
                examples={topic.examples}
                topicCode={topic.code}
                sampleQuestions={topic.questions}
                emptyMessage={
                  audience === "admin"
                    ? "Chưa có ví dụ hoặc câu hỏi được liên kết với chuyên đề này. Hãy bổ sung dữ liệu trước khi phát hành."
                    : undefined
                }
              />
            </div>
          )}
        </div>

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
  availableTopics?: GrammarTopicItem[];
  onClose: () => void;
  onSave: (topicData: Partial<GrammarTopicItem>) => Promise<void> | void;
}

export const GrammarTopicEditModal: React.FC<GrammarTopicEditModalProps> = ({
  isOpen,
  editTopic,
  topic: topicProp,
  availableTopics = [],
  onClose,
  onSave,
}) => {
  const currentTopic = editTopic || topicProp || null;
  const [saveError, setSaveError] = useState<string | null>(null);
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
  const [titleViLength, setTitleViLength] = useState((currentTopic?.titleVi || currentTopic?.title || "").length);
  const [titleEnLength, setTitleEnLength] = useState((currentTopic?.titleEn || currentTopic?.englishTitle || "").length);
  const [summaryLength, setSummaryLength] = useState((currentTopic?.summary || "").length);
  const formulaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    setFormDirty(true);
  };
  const updateTheoryValue = (key: string, value: string) => {
    setTheory((previous) => ({ ...previous, [key]: value }));
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
      ...examples.flatMap((example) => [example.sentence, example.translation, example.analysis || ""]),
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
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {currentTopic ? `Chỉnh sửa: ${currentTopic.titleVi || currentTopic.title}` : "Thêm chủ điểm ngữ pháp mới"}
            </h2>
            <p className="text-xs text-slate-500">Quản lý metadata, nội dung lý thuyết, dấu hiệu, bẫy và ví dụ của chuyên đề.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          ref={formRef}
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
              }));
            const hasIncompleteExample = exampleRows.some((example) =>
              (example.sentence || example.translation || example.analysis || example.focusWord || example.difficulty) &&
              (!example.sentence || !example.translation)
            );
            const examplesVal = exampleRows.filter((example) => example.sentence && example.translation);

            let validationError: string | null = null;
            if (!titleViVal) validationError = "Nhập tên chủ điểm bằng tiếng Việt.";
            else if (titleViVal.length > 120) validationError = "Tên chủ điểm tiếng Việt không được vượt quá 120 ký tự.";
            else if (!titleEnVal) validationError = "Nhập tên chủ điểm bằng tiếng Anh.";
            else if (titleEnVal.length > 120) validationError = "Tên chủ điểm tiếng Anh không được vượt quá 120 ký tự.";
            else if (!formulaVal) validationError = "Nhập công thức hoặc cấu trúc cốt lõi.";
            else if (formulaVal.length > 5000) validationError = "Công thức không được vượt quá 5.000 ký tự.";
            else if (!summaryVal) validationError = "Nhập tóm tắt ngắn gọn kỹ năng.";
            else if (summaryVal.length > 1000) validationError = "Tóm tắt không được vượt quá 1.000 ký tự.";
            else if (!["Part 5", "Part 6", "Part 7"].includes(partVal)) validationError = "Chọn phần thi hợp lệ.";
            else if (!["350_500", "500_750", "750_PLUS", "ALL"].includes(targetScoreVal)) validationError = "Chọn mục tiêu điểm TOEIC hợp lệ.";
            else if (!partsVal.length || partsVal.some((part) => !["Part 5", "Part 6", "Part 7"].includes(part))) validationError = "Chọn ít nhất một Part TOEIC hợp lệ.";
            else if (!["EASY", "MEDIUM", "HARD"].includes(difficultyVal)) validationError = "Chọn độ khó hợp lệ.";
            else if (!["DRAFT", "PUBLISHED"].includes(statusVal)) validationError = "Chọn trạng thái nội dung hợp lệ.";
            else if (!categories.some((category) => category.code === grammarGroupVal)) validationError = "Chọn nhóm ngữ pháp hợp lệ.";
            else if (statusVal === "PUBLISHED" && hasGeneratedSuggestion && !suggestionReviewed) validationError = "Hãy kiểm tra nội dung AI gợi ý và xác nhận trước khi phát hành.";
            else if (statusVal === "PUBLISHED" && currentTopic?.status !== "PUBLISHED" && !window.confirm("Phát hành chủ điểm này để học viên có thể xem?")) validationError = "Đã hủy phát hành.";
            else if (hasIncompleteExample) validationError = "Mỗi ví dụ đã bắt đầu nhập cần có cả câu tiếng Anh và bản dịch; phân tích là tùy chọn.";

            if (validationError) {
              setSaveError(validationError);
              return;
            }

            setSaveError(null);
            setIsSaving(true);
            try {
              await onSave({
                titleVi: titleViVal,
                titleEn: titleEnVal,
                title: titleViVal,
                englishTitle: titleEnVal,
                sourceUrl: String(formData.get("sourceUrl") || "").trim(),
                sourceNotes: String(formData.get("sourceNotes") || "").trim(),
                grammarGroup: grammarGroupVal,
                parentTopicId: parentTopicIdVal,
                toeicParts: partsVal,
                difficulty: difficultyVal,
                theory,
                metadata: {
                  ...metadata,
                  traps: {
                    ...(metadata.traps || {}),
                    commonMistakes: String(formData.get("commonMistakes") || "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
                    confusingStructures: String(formData.get("confusingStructures") || "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
                    answerTips: String(formData.get("answerTips") || "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
                    partStrategies: String(formData.get("partStrategies") || "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
                  },
                },
                wordFamilyWords,
                part: partVal as unknown as never,
                targetScore: targetScoreVal as unknown as never,
                status: statusVal as unknown as never,
                formula: formulaVal,
                summary: summaryVal,
                signalWords: signalWordsVal,
                traps: trapsVal,
                examples: examplesVal,
              });
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
            if (suggestionError) setSuggestionError(null);
            if (hasGeneratedSuggestion && event.target instanceof HTMLElement && event.target.getAttribute("name") !== "suggestionReviewed") {
              setSuggestionReviewed(false);
            }
          }}
          className="space-y-4 text-xs font-medium"
        >
          {saveError ? (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
              {saveError}
            </p>
          ) : null}
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
                    onChange={(event) => { setSelectedGroup(event.target.value); setFormDirty(true); }}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5">
                    {categories.map((category) => <option key={category.code} value={category.code}>{category.name}</option>)}
                  </select>
                  {categoriesLoading ? <p className="mt-1 text-[10px] text-slate-500">Đang tải danh mục...</p> : null}
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Tên chủ điểm (Tiếng Việt) <span className="text-rose-600">*</span></label>
                  <input type="text" name="title" defaultValue={currentTopic?.titleVi || currentTopic?.title || ""}
                    required maxLength={120} onChange={(event) => setTitleViLength(event.target.value.length)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-blue-500 focus:outline-hidden" />
                  <p className="mt-1 text-right text-[10px] text-slate-500">{titleViLength}/120</p>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Tên tiếng Anh <span className="text-rose-600">*</span></label>
                  <input type="text" name="englishTitle" defaultValue={currentTopic?.titleEn || currentTopic?.englishTitle || ""}
                    required maxLength={120} onChange={(event) => setTitleEnLength(event.target.value.length)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-blue-500 focus:outline-hidden" />
                  <p className="mt-1 text-right text-[10px] text-slate-500">{titleEnLength}/120</p>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Chủ điểm cha</label>
                  <select name="parentTopicId" defaultValue={currentTopic?.parentTopicId || ""}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5">
                    <option value="">Không có</option>
                    {availableTopics.concat(currentTopic ? [currentTopic] : [])
                      .filter((topic, index, list) => topic.id !== currentTopic?.id
                        && list.findIndex((candidate) => candidate.id === topic.id) === index)
                      .map((topic) => <option key={topic.id} value={topic.id}>{topic.titleVi || topic.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Mục tiêu điểm TOEIC <span className="text-rose-600">*</span></label>
                  <select name="targetScore" defaultValue={currentTopic?.targetScore || "350_500"} required
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5">
                    <option value="350_500">350–500</option><option value="500_750">500–750</option>
                    <option value="750_PLUS">750+</option><option value="ALL">Mọi trình độ</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Độ khó</label>
                  <select name="difficulty" defaultValue={currentTopic?.difficulty || "MEDIUM"}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5">
                    <option value="EASY">Cơ bản</option><option value="MEDIUM">Trung bình</option><option value="HARD">Nâng cao</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Trạng thái nội dung <span className="text-rose-600">*</span></label>
                  <select name="status" defaultValue={currentTopic?.status || "DRAFT"} required
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5">
                    <option value="DRAFT">Bản nháp</option><option value="PUBLISHED">Phát hành</option>
                  </select>
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
                          setFormDirty(true);
                        }}
                        className="accent-blue-700" />
                      {part}
                    </label>
                  ))}
                </div>
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
                      <div className="flex gap-2">
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
                <label key={field.key} className="block">
                  <span className="mb-1 block font-bold text-slate-700">{field.label} <span className="font-normal text-slate-400">(không bắt buộc)</span></span>
                  {field.options?.length ? (
                    <select value={selectedGroupValues[field.key] || ""}
                      onChange={(event) => updateGroupValue(field.key, event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5">
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
                      className="w-full resize-y rounded-xl border border-slate-200 p-2.5"
                      placeholder={`Nhập nội dung: ${field.label.toLowerCase()}`} />
                  )}
                  <span className="mt-1 block text-right text-[10px] text-slate-500">{(selectedGroupValues[field.key] || "").length}/5.000</span>
                </label>
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
                  <select value="" onChange={(event) => {
                    const word = vocabularyWords.find((item) => item.id === event.target.value);
                    if (!word || wordFamilyWords.some((item) => item.vocabularyItemId === word.id)) return;
                    setWordFamilyWords((previous) => [...previous, {
                      vocabularyItemId: word.id,
                      word: word.word,
                      partOfSpeech: word.partOfSpeech || word.pos || "Other",
                      meaning: word.meaning || "",
                    }]);
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
                        setFormDirty(true);
                      }} className="font-bold text-rose-700">Xóa</button>
                    </div>
                  ))}
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
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5"
                  />
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
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white p-2.5"
                  />
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
          </section>

          <details open className="rounded-2xl border border-slate-200 p-4">
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
                    className="w-full resize-y rounded-xl border border-slate-200 p-2.5" />
                </label>
              ))}
            </div>
          </details>

          <details open className="rounded-2xl border border-slate-200 p-4">
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
              className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs font-semibold text-slate-800 leading-relaxed focus:outline-hidden focus:border-blue-500"
            />
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
              className="w-full p-2.5 rounded-xl border border-slate-200 resize-y"
            />
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
              className="w-full p-2.5 rounded-xl border border-slate-200 resize-y"
            />
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
            </div>
          </details>

          <details open className="rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-bold text-slate-900">5. Ví dụ minh họa</summary>
            <section className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800">Ví dụ minh họa <span className="font-normal text-slate-400">(không bắt buộc)</span></h3>
                <p className="mt-1 text-[11px] text-slate-500">Không bắt buộc · Nếu nhập ví dụ, cần có câu tiếng Anh và bản dịch; phân tích là tùy chọn.</p>
              </div>
              <button
                type="button"
                onClick={() => { setExamples((prev) => [...prev, { sentence: "", translation: "", analysis: "", focusWord: "", difficulty: "" }]); setFormDirty(true); }}
                className="shrink-0 rounded-xl border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50"
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
                      onClick={() => { setExamples((prev) => prev.filter((_, itemIndex) => itemIndex !== index)); setFormDirty(true); }}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Xóa ví dụ
                    </button>
                  ) : null}
                  <div className="flex gap-2">
                    <button type="button" disabled={index === 0} onClick={() => { setExamples((previous) => {
                      const ordered = [...previous]; [ordered[index - 1], ordered[index]] = [ordered[index], ordered[index - 1]]; return ordered;
                    }); setFormDirty(true); }} className="text-[11px] font-semibold text-slate-600 disabled:opacity-40">↑ Lên</button>
                    <button type="button" disabled={index === examples.length - 1} onClick={() => { setExamples((previous) => {
                      const ordered = [...previous]; [ordered[index + 1], ordered[index]] = [ordered[index], ordered[index + 1]]; return ordered;
                    }); setFormDirty(true); }} className="text-[11px] font-semibold text-slate-600 disabled:opacity-40">↓ Xuống</button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={example.sentence}
                  maxLength={1000}
                  onChange={(event) => setExamples((prev) => prev.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, sentence: event.target.value } : item))}
                  placeholder="Câu tiếng Anh"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5"
                />
                <textarea
                  rows={2}
                  value={example.translation}
                  maxLength={1000}
                  onChange={(event) => setExamples((prev) => prev.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, translation: event.target.value } : item))}
                  placeholder="Bản dịch tiếng Việt"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5"
                />
                <textarea
                  rows={2}
                  value={example.analysis || ""}
                  maxLength={2000}
                  onChange={(event) => setExamples((prev) => prev.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, analysis: event.target.value } : item))}
                  placeholder="Phân tích cấu trúc / giải thích ví dụ"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={example.focusWord || ""} maxLength={200}
                    onChange={(event) => setExamples((previous) => previous.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, focusWord: event.target.value } : item))}
                    placeholder="Từ / cụm từ trọng tâm"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5" />
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

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5 text-[11px] leading-relaxed text-indigo-900">
            Câu hỏi trắc nghiệm được quản lý riêng trong <strong>Ngân hàng câu hỏi</strong>. Sau khi lưu chuyên đề,
            dùng thao tác <strong>Thêm câu hỏi</strong> để nhập câu hỏi, đáp án và giải thích.
          </div>

          <details open className="rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-bold text-slate-900">6. Tóm tắt và nguồn tham khảo</summary>
            <div className="mt-4">
              <label className="mb-1 block font-bold text-slate-700">Tóm tắt ngắn gọn kỹ năng <span className="text-rose-600">*</span></label>
              <textarea name="summary" rows={3} defaultValue={currentTopic?.summary || ""}
                required maxLength={1000} onChange={(event) => setSummaryLength(event.target.value.length)}
                className="w-full resize-none rounded-xl border border-slate-200 p-2.5" />
              <p className="mt-1 text-right text-[11px] text-slate-500">{summaryLength}/1.000 · Bắt buộc</p>
            </div>
          </details>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
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
  onClose: () => void;
  onConfirm: () => void;
}

export const GrammarDeleteModal: React.FC<GrammarDeleteModalProps> = ({
  deleteConfirmTopic,
  topic: topicProp,
  onClose,
  onConfirm,
}) => {
  const currentTopic = deleteConfirmTopic || topicProp || null;
  if (!currentTopic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Xóa chủ điểm ngữ pháp?</h3>
          <p className="text-xs text-slate-500 mt-1">
            Bạn có chắc chắn muốn xóa &quot;{currentTopic.titleVi || currentTopic.title}&quot;? Dữ liệu câu hỏi luyện tập liên quan sẽ bị loại bỏ.
          </p>
        </div>
        <div className="flex justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-xs cursor-pointer"
          >
            Xác nhận xóa
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
  // Đảm bảo bài luôn có đủ 30 câu hỏi thực tế chuẩn TOEIC Part 5
  const fullQuestions = useMemo(() => {
    const topicTitle = activeTopic?.titleVi || activeTopic?.title || "Ngữ pháp";
    return expandGrammarQuestions(rawQuestions, topicTitle, 30);
  }, [rawQuestions, activeTopic]);

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
      // Tiếp tục làm từ câu tiếp theo (nếu làm 5 câu thì mở câu 6)
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
      // Ghi nhận kết quả: Nếu câu này vốn sai mà nay làm đúng thì số câu sai TỰ ĐỘNG GIẢM DẦN!
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

          <div className="flex items-center gap-3">
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

            {/* HIỂN THỊ DỊCH NGHĨA, MẸO BẪY, VÀ TỪ CẦN HỌC SAU KHI CHỌN ĐÁP ÁN */}
            {isAnswerChecked && (
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

                {activeTopic?.signalWords && activeTopic.signalWords.length > 0 && (
                  <GrammarSignalWordsRenderer signalWords={activeTopic.signalWords} />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900">Hoàn Thành Bài Luyện Tập!</h2>
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
                <p className="text-2xl font-extrabold text-blue-600">
                  {Math.round((score / questions.length) * 100)}%
                </p>
              </div>
            </div>

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
