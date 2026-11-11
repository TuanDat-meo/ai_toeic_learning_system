'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Eye,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  Lightbulb,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import {
  updateVocabularyPreviewItem,
  type ImportBatchDetails,
  type ImportPreviewItem,
} from '@/lib/api/content-import';
import type {
  GradedQuestionItem,
  GrammarNormalizedData,
} from './types';
import { cleanErrorMessage, itemStatus } from './utils';

interface GrammarPreviewListProps {
  items: ImportPreviewItem[];
  fileName: string;
  totalRecords: number;
  batchId: string;
  editable: boolean;
  onBatchUpdated?: (batch: ImportBatchDetails) => void;
}

export function GrammarPreviewList({
  items,
  fileName,
  totalRecords,
  batchId,
  editable,
  onBatchUpdated,
}: GrammarPreviewListProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'examples' | 'theory' | 'tips' | 'table' | 'raw'>('questions');
  const [questionLevelFilter, setQuestionLevelFilter] = useState<string>('ALL');
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Record<string | number, boolean>>({});

  // Dialog xem chi tiết câu hỏi
  const [viewingQuestion, setViewingQuestion] = useState<GradedQuestionItem | null>(null);

  // Dialog thêm / sửa câu hỏi
  const [editingQuestion, setEditingQuestion] = useState<{
    isNew: boolean;
    index?: number;
    data: GradedQuestionItem;
  } | null>(null);

  // Dialog xác nhận xóa câu hỏi
  const [deletingQuestionIndex, setDeletingQuestionIndex] = useState<number | null>(null);

  // Dialog chỉnh sửa thông tin chuyên đề
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [topicForm, setTopicForm] = useState<{
    titleVi: string;
    titleEn: string;
    topicCode: string;
    codeName: string;
    category: string;
    description: string;
    coreTheory: string;
    signalClues: string;
    tipsAndTricks: string;
    commonTraps: string;
    summaryTable: string;
    imageUrl: string;
    audioUrl: string;
  }>({
    titleVi: '',
    titleEn: '',
    topicCode: '',
    codeName: '',
    category: '',
    description: '',
    coreTheory: '',
    signalClues: '',
    tipsAndTricks: '',
    commonTraps: '',
    summaryTable: '',
    imageUrl: '',
    audioUrl: '',
  });

  // Dialog xem ảnh phóng to
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const topicGroups = useMemo(() => {
    const dataFor = (item: ImportPreviewItem) => ({
      ...(item.rawData ?? {}),
      ...(item.normalizedData ?? {}),
    });
    const text = (data: Record<string, unknown>, ...keys: string[]) => {
      for (const key of keys) {
        const value = data[key];
        if (typeof value === 'string' && value.trim()) return value.trim();
      }
      return '';
    };
    const titleFor = (item: ImportPreviewItem) => {
      const data = dataFor(item);
      return text(data, 'titleVi', 'title', 'titleEn', 'englishTitle') || `Dòng ${item.rowNumber}`;
    };
    const parentReferenceFor = (item: ImportPreviewItem) => {
      const data = dataFor(item);
      return text(data, 'parentTitleVi', 'parent_title_vi', 'parentTopicId', 'parent_topic_id');
    };
    const roots = items.filter((item) => !parentReferenceFor(item));
    const groups = roots.map((parent) => {
      const parentData = dataFor(parent);
      const aliases = [
        parent.id,
        titleFor(parent),
        text(parentData, 'titleEn', 'englishTitle'),
        text(parentData, 'code', 'topicCode'),
      ].filter(Boolean).map((value) => value.toLocaleLowerCase('vi'));
      return {
        parent,
        children: items.filter((item) => {
          if (item.id === parent.id) return false;
          const reference = parentReferenceFor(item).toLocaleLowerCase('vi');
          return reference.length > 0 && aliases.includes(reference);
        }),
      };
    }).filter((group) => group.children.length > 0);
    return groups;
  }, [items]);
  const firstChild = topicGroups[0]?.children[0];
  const currentItem = (selectedItemId
    ? items.find((item) => item.id === selectedItemId)
    : undefined) ?? firstChild ?? items[0];

  // Trích xuất dữ liệu chuyên đề từ normalizedData hoặc rawData
  const grammarData = useMemo<GrammarNormalizedData>(() => {
    if (!currentItem) return {};
    const norm = (currentItem.normalizedData ?? {}) as Record<string, unknown>;
    const raw = (currentItem.rawData ?? {}) as Record<string, unknown>;
    return {
      topicCode: (norm.code ?? norm.topicCode ?? raw.topicCode ?? raw.code ?? 'CD_01') as string,
      codeName: (norm.codeName ?? raw.codeName ?? '') as string,
      titleVi: (norm.title ?? norm.titleVi ?? raw.titleVi ?? raw.title ?? 'Chuyên đề ngữ pháp') as string,
      titleEn: (norm.englishTitle ?? norm.titleEn ?? raw.titleEn ?? raw.englishTitle ?? '') as string,
      category: (norm.category ?? raw.category ?? 'Ngữ pháp TOEIC') as string,
      description: (norm.explanation ?? norm.description ?? raw.description ?? raw.explanation ?? '') as string,
      coreTheory: (norm.rule ?? norm.coreTheory ?? raw.coreTheory ?? raw.rule ?? '') as string,
      signalClues: (norm.signalClues ?? raw.signalClues ?? '') as string,
      signalWords: (Array.isArray(norm.signalWords) ? norm.signalWords : Array.isArray(raw.signalWords) ? raw.signalWords : []) as string[],
      tipsAndTricks: (norm.tipsAndTricks ?? raw.tipsAndTricks ?? '') as string,
      commonTraps: (norm.commonTraps ?? raw.commonTraps ?? '') as string,
      traps: (Array.isArray(norm.traps) ? norm.traps : Array.isArray(raw.traps) ? raw.traps : []) as string[],
      examples: (Array.isArray(norm.examples) ? norm.examples : Array.isArray(raw.examples) ? raw.examples : []) as GrammarNormalizedData['examples'],
      summaryTable: (norm.summaryTable ?? raw.summaryTable ?? '') as string,
      reference: (norm.reference ?? raw.reference ?? '') as string,
      imageUrl: (norm.imageUrl ?? raw.imageUrl ?? '') as string,
      audioUrl: (norm.audioUrl ?? raw.audioUrl ?? '') as string,
      questions: (Array.isArray(norm.questions)
        ? norm.questions
        : Array.isArray(raw.gradedQuestions)
          ? raw.gradedQuestions
          : Array.isArray(raw.questions)
            ? raw.questions
            : []) as GradedQuestionItem[],
      part: (norm.part ?? raw.part ?? 'Part 5') as string,
      targetScore: (norm.level ?? raw.level ?? raw.targetScore ?? 'Mọi cấp độ') as string,
    };
  }, [currentItem]);

  const questionsList = useMemo(() => {
    return grammarData.questions ?? [];
  }, [grammarData]);

  // Các level câu hỏi có trong bài
  const availableLevels = useMemo(() => {
    const levels = new Set<string>();
    questionsList.forEach((q) => {
      const lvl = q.levelShort ?? q.level;
      if (lvl) levels.add(lvl);
    });
    return Array.from(levels);
  }, [questionsList]);

  // Bộ lọc câu hỏi theo level
  const filteredQuestions = useMemo(() => {
    if (questionLevelFilter === 'ALL') return questionsList;
    return questionsList.filter((q) => {
      const lvl = q.levelShort ?? q.level;
      return lvl === questionLevelFilter || (q.level && q.level.includes(questionLevelFilter));
    });
  }, [questionsList, questionLevelFilter]);

  const toggleExpandQuestion = (id: string | number) => {
    setExpandedQuestionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAllQuestions = () => {
    const next: Record<string | number, boolean> = {};
    filteredQuestions.forEach((q, idx) => {
      next[q.id ?? idx] = true;
    });
    setExpandedQuestionIds(next);
  };

  const collapseAllQuestions = () => {
    setExpandedQuestionIds({});
  };

  // Mở modal sửa thông tin chuyên đề
  const handleOpenEditTopic = () => {
    setTopicForm({
      titleVi: grammarData.titleVi ?? '',
      titleEn: grammarData.titleEn ?? '',
      topicCode: grammarData.topicCode ?? '',
      codeName: grammarData.codeName ?? '',
      category: grammarData.category ?? '',
      description: grammarData.description ?? '',
      coreTheory: grammarData.coreTheory ?? '',
      signalClues: grammarData.signalClues ?? '',
      tipsAndTricks: grammarData.tipsAndTricks ?? '',
      commonTraps: grammarData.commonTraps ?? '',
      summaryTable: grammarData.summaryTable ?? '',
      imageUrl: grammarData.imageUrl ?? '',
      audioUrl: grammarData.audioUrl ?? '',
    });
    setErrorMsg('');
    setIsEditingTopic(true);
  };

  // Lưu thông tin chuyên đề
  const handleSaveTopicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;
    setSaving(true);
    setErrorMsg('');

    const basePayload = (currentItem.rawData ?? currentItem.normalizedData ?? {}) as Record<string, unknown>;
    const updatedPayload: Record<string, unknown> = {
      ...basePayload,
      title: topicForm.titleVi,
      titleVi: topicForm.titleVi,
      titleEn: topicForm.titleEn,
      englishTitle: topicForm.titleEn,
      code: topicForm.topicCode,
      topicCode: topicForm.topicCode,
      codeName: topicForm.codeName,
      category: topicForm.category,
      explanation: topicForm.description,
      description: topicForm.description,
      rule: topicForm.coreTheory,
      coreTheory: topicForm.coreTheory,
      signalClues: topicForm.signalClues,
      tipsAndTricks: topicForm.tipsAndTricks,
      commonTraps: topicForm.commonTraps,
      summaryTable: topicForm.summaryTable,
      imageUrl: topicForm.imageUrl,
      audioUrl: topicForm.audioUrl,
      questions: questionsList,
      gradedQuestions: questionsList,
    };

    try {
      const updated = await updateVocabularyPreviewItem(batchId, currentItem.id, updatedPayload);
      if (onBatchUpdated) onBatchUpdated(updated);
      setIsEditingTopic(false);
    } catch (err) {
      setErrorMsg(cleanErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Mở modal thêm câu hỏi mới
  const handleOpenAddQuestion = () => {
    setEditingQuestion({
      isNew: true,
      data: {
        id: questionsList.length + 1,
        level: 'Level 1: Nhận biết',
        levelShort: 'Level 1',
        question: '',
        options: { A: '', B: '', C: '', D: '' },
        correctAnswer: 'A',
        translation: { questionVi: '', optionsVi: { A: '', B: '', C: '', D: '' }, fullSentenceVi: '' },
        signalInQuestion: '',
        solutionMethod: '',
        trapNote: '',
        formulaApplied: '',
        imageUrl: '',
        audioUrl: '',
      },
    });
    setErrorMsg('');
  };

  // Mở modal sửa câu hỏi
  const handleOpenEditQuestion = (q: GradedQuestionItem, index: number) => {
    setEditingQuestion({
      isNew: false,
      index,
      data: JSON.parse(JSON.stringify(q)),
    });
    setErrorMsg('');
  };

  // Lưu câu hỏi (Thêm mới hoặc Cập nhật)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !currentItem) return;
    setSaving(true);
    setErrorMsg('');

    const nextQuestions = [...questionsList];
    if (editingQuestion.isNew) {
      nextQuestions.push(editingQuestion.data);
    } else if (editingQuestion.index !== undefined) {
      nextQuestions[editingQuestion.index] = editingQuestion.data;
    }

    const basePayload = (currentItem.rawData ?? currentItem.normalizedData ?? {}) as Record<string, unknown>;
    const updatedPayload: Record<string, unknown> = {
      ...basePayload,
      questions: nextQuestions,
      gradedQuestions: nextQuestions,
    };

    try {
      const updated = await updateVocabularyPreviewItem(batchId, currentItem.id, updatedPayload);
      if (onBatchUpdated) onBatchUpdated(updated);
      setEditingQuestion(null);
    } catch (err) {
      setErrorMsg(cleanErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Xác nhận xóa câu hỏi
  const handleConfirmDeleteQuestion = async () => {
    if (deletingQuestionIndex === null || !currentItem) return;
    setSaving(true);
    setErrorMsg('');

    const nextQuestions = questionsList.filter((_, idx) => idx !== deletingQuestionIndex);
    const basePayload = (currentItem.rawData ?? currentItem.normalizedData ?? {}) as Record<string, unknown>;
    const updatedPayload: Record<string, unknown> = {
      ...basePayload,
      questions: nextQuestions,
      gradedQuestions: nextQuestions,
    };

    try {
      const updated = await updateVocabularyPreviewItem(batchId, currentItem.id, updatedPayload);
      if (onBatchUpdated) onBatchUpdated(updated);
      setDeletingQuestionIndex(null);
    } catch (err) {
      setErrorMsg(cleanErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!currentItem) {
    return (
      <div className="p-8 text-center text-slate-500">
        Không có dữ liệu bản xem trước ngữ pháp.
      </div>
    );
  }

  const status = itemStatus(currentItem.status);
  const itemData = (item: ImportPreviewItem) => ({
    ...(item.rawData ?? {}),
    ...(item.normalizedData ?? {}),
  });
  const itemTitle = (item: ImportPreviewItem) => {
    const data = itemData(item);
    const title = data.titleVi ?? data.title ?? data.titleEn ?? data.englishTitle;
    return typeof title === 'string' && title.trim() ? title : `Dòng ${item.rowNumber}`;
  };
  const questionCount = (item: ImportPreviewItem) => {
    const data = itemData(item);
    const questions = data.questions ?? data.gradedQuestions;
    return Array.isArray(questions) ? questions.length : 0;
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Banner lỗi nếu có */}
      {errorMsg ? (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <p>{errorMsg}</p>
        </div>
      ) : null}

      {topicGroups.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50/50">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 bg-white px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cấu trúc chủ điểm cha – con</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Chọn một chủ điểm con để xem lý thuyết và câu hỏi trước khi publish.
              </p>
            </div>
            <div className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800">
              {topicGroups.reduce((count, group) => count + group.children.length, 0)} chủ điểm con
              <span className="mx-1.5 text-indigo-300">·</span>
              {topicGroups.reduce((count, group) => count + group.children.reduce(
                (childCount, child) => childCount + questionCount(child), 0,
              ), 0).toLocaleString('vi-VN')} câu hỏi
            </div>
          </div>
          <div className="space-y-3 p-3 sm:p-4">
            {topicGroups.map((group) => {
              const parentStatus = itemStatus(group.parent.status);
              return (
                <div key={group.parent.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <button
                    type="button"
                    onClick={() => setSelectedItemId(group.parent.id)}
                    aria-current={currentItem.id === group.parent.id ? 'true' : undefined}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition ${
                      currentItem.id === group.parent.id ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600">Chủ điểm cha</span>
                      <span className="mt-0.5 block truncate text-sm font-bold text-slate-900">{itemTitle(group.parent)}</span>
                    </span>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${parentStatus.classes}`}>
                      {parentStatus.label}
                    </span>
                  </button>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.children.map((child) => {
                      const childStatus = itemStatus(child.status);
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => setSelectedItemId(child.id)}
                          aria-current={currentItem.id === child.id ? 'true' : undefined}
                          className={`rounded-lg border p-3 text-left transition ${
                            currentItem.id === child.id
                              ? 'border-blue-400 bg-blue-50 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold leading-5 text-slate-800">{itemTitle(child)}</span>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${childStatus.classes}`}>
                              {childStatus.label}
                            </span>
                          </span>
                          <span className="mt-1 block text-[11px] text-slate-500">
                            {questionCount(child).toLocaleString('vi-VN')} câu hỏi
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Header Chuyên đề Ngữ pháp */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-sky-50/40 p-5 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-600 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-white">
                {grammarData.topicCode}
              </span>
              {grammarData.codeName ? (
                <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-600">
                  {grammarData.codeName}
                </span>
              ) : null}
              <span className="rounded-md bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
                {grammarData.category}
              </span>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.classes}`}>
                {status.label}
              </span>
            </div>

            <div className="pt-1">
              <h2 className="text-xl font-extrabold text-slate-900 md:text-2xl">
                {grammarData.titleVi}
                {grammarData.titleEn ? (
                  <span className="ml-2 font-normal text-slate-500">({grammarData.titleEn})</span>
                ) : null}
              </h2>
            </div>

            {grammarData.description ? (
              <p className="max-w-4xl text-xs leading-relaxed text-slate-600 md:text-sm">
                {grammarData.description}
              </p>
            ) : null}

            {/* Audio chuyên đề (VD: ngữ âm, phát âm) */}
            {grammarData.audioUrl ? (
              <div className="mt-2 space-y-1">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                  <Volume2 size={13} className="text-emerald-600 shrink-0" />
                  Audio phát âm / ngữ âm chuyên đề
                </span>
                <audio
                  controls
                  src={grammarData.audioUrl}
                  className="h-8 w-full max-w-xs rounded-lg"
                  preload="metadata"
                />
                <p className="truncate text-[10px] text-slate-400">{grammarData.audioUrl}</p>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-row items-center gap-2 md:flex-col md:items-end">
            {/* Thumbnail ảnh chuyên đề */}
            {grammarData.imageUrl ? (
              <button
                type="button"
                onClick={() => setPreviewImage({ url: grammarData.imageUrl as string, title: grammarData.titleVi ?? 'Ảnh chuyên đề' })}
                className="group relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-200 bg-slate-100 hover:border-blue-400"
                title="Bấm để xem ảnh phóng to"
              >
                <img
                  src={grammarData.imageUrl}
                  alt="Ảnh chuyên đề"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 opacity-0 transition group-hover:opacity-100">
                  <Eye size={16} className="text-white drop-shadow-md" />
                </div>
              </button>
            ) : null}
            <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-right shadow-xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Số câu hỏi</span>
              <span className="text-lg font-black text-blue-600">{questionsList.length} câu</span>
            </div>

            {editable ? (
              <button
                type="button"
                onClick={handleOpenEditTopic}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              >
                <Pencil size={13} />
                Sửa chuyên đề
              </button>
            ) : null}
          </div>
        </div>

        {/* Lỗi cảnh báo dòng dữ liệu nếu có */}
        {currentItem.errors.length > 0 ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle size={15} />
              <span>Phát hiện {currentItem.errors.length} cảnh báo / lỗi định dạng:</span>
            </div>
            <ul className="mt-1.5 list-inside list-disc space-y-0.5">
              {currentItem.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Tabs điều hướng nội dung */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('examples')}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'examples'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} />
          Ví dụ minh họa ({grammarData.examples?.length ?? 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'questions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap size={16} />
          Câu hỏi ({questionsList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('theory')}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'theory'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen size={16} />
          Lý thuyết cốt lõi (Core Theory)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tips')}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'tips'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lightbulb size={16} />
          Dấu hiệu & Mẹo bẫy
        </button>

        {grammarData.summaryTable ? (
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'table'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet size={16} />
            Bảng tóm tắt ghi nhớ
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setActiveTab('raw')}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'raw'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 size={16} />
          JSON chuẩn hóa
        </button>
      </div>

      {/* TAB 1: BÀI TẬP PHÂN CẤP */}
      {activeTab === 'questions' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Lọc theo Level:</span>
              <button
                type="button"
                onClick={() => setQuestionLevelFilter('ALL')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  questionLevelFilter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tất cả ({questionsList.length})
              </button>
              {availableLevels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setQuestionLevelFilter(lvl)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    questionLevelFilter === lvl
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {editable ? (
                <button
                  type="button"
                  onClick={handleOpenAddQuestion}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                >
                  <Plus size={14} />
                  Thêm câu hỏi
                </button>
              ) : null}
              <button
                type="button"
                onClick={expandAllQuestions}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Mở rộng tất cả
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={collapseAllQuestions}
                className="text-xs font-medium text-slate-500 hover:underline"
              >
                Thu gọn
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const qId = q.id ?? idx + 1;
              const isExpanded = expandedQuestionIds[qId] ?? true;
              const options = q.options ?? {};
              const translation = q.translation ?? {};

              return (
                <div
                  key={qId}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-slate-300"
                >
                  {/* Header câu hỏi */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-black text-white">
                        Câu #{q.id ?? idx + 1}
                      </span>
                      {q.level ? (
                        <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                          {q.level}
                        </span>
                      ) : null}
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        Đáp án đúng: {q.correctAnswer}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Nút Xem chi tiết (Dialog riêng) */}
                      <button
                        type="button"
                        onClick={() => setViewingQuestion(q)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                        title="Xem chi tiết toàn bộ câu hỏi (Dialog)"
                      >
                        <Eye size={15} />
                      </button>

                      {editable ? (
                        <>
                          {/* Nút Sửa câu hỏi */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditQuestion(q, idx)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Chỉnh sửa câu hỏi này"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* Nút Xóa câu hỏi */}
                          <button
                            type="button"
                            onClick={() => setDeletingQuestionIndex(idx)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Xóa câu hỏi này"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      ) : null}

                      {/* Thu gọn / Mở rộng inline */}
                      <button
                        type="button"
                        onClick={() => toggleExpandQuestion(qId)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Nội dung câu hỏi + media (ảnh/audio) */}
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 leading-snug">{q.question}</p>
                    </div>
                    {/* Thumbnail ảnh câu hỏi */}
                    {q.imageUrl ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage({ url: q.imageUrl as string, title: `Câu hỏi #${q.id ?? idx + 1}` })}
                        className="group relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 hover:border-blue-400"
                        title="Bấm để xem ảnh phóng to"
                      >
                        <img
                          src={q.imageUrl}
                          alt="Ảnh câu hỏi"
                          className="h-full w-full object-cover transition group-hover:scale-105"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 opacity-0 transition group-hover:opacity-100">
                          <Eye size={14} className="text-white drop-shadow-md" />
                        </div>
                      </button>
                    ) : null}
                  </div>

                  {/* Audio câu hỏi */}
                  {q.audioUrl ? (
                    <div className="mt-2 space-y-0.5">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                        <Volume2 size={12} className="text-emerald-600 shrink-0" />
                        Audio câu hỏi
                      </span>
                      <audio
                        controls
                        src={q.audioUrl}
                        className="h-7 w-full rounded-lg"
                        preload="metadata"
                      />
                    </div>
                  ) : null}

                  {/* 4 phương án lựa chọn */}
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {['A', 'B', 'C', 'D'].map((key) => {
                      const optText = options[key];
                      const isCorrect = q.correctAnswer?.toUpperCase() === key;
                      const optVi = translation.optionsVi?.[key];

                      return (
                        <div
                          key={key}
                          className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs transition ${
                            isCorrect
                              ? 'border-emerald-300 bg-emerald-50/60 font-semibold text-emerald-950'
                              : 'border-slate-200 bg-slate-50/40 text-slate-700'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {key}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span>{optText || '—'}</span>
                            {optVi ? (
                              <p className="mt-0.5 text-[11px] font-normal text-slate-500">{optVi}</p>
                            ) : null}
                          </div>
                          {isCorrect ? (
                            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {/* Chi tiết giải thích, bẫy & phương pháp (Inline) */}
                  {isExpanded ? (
                    <div className="mt-4 space-y-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs">
                      {translation.questionVi || translation.fullSentenceVi ? (
                        <div>
                          <span className="font-bold text-slate-800">Dịch nghĩa:</span>
                          <p className="mt-0.5 text-slate-600">{translation.questionVi}</p>
                          {translation.fullSentenceVi ? (
                            <p className="mt-1 font-medium text-emerald-800">{translation.fullSentenceVi}</p>
                          ) : null}
                        </div>
                      ) : null}

                      {q.signalInQuestion ? (
                        <div className="flex items-start gap-1.5">
                          <Sparkles size={14} className="mt-0.5 shrink-0 text-blue-600" />
                          <div>
                            <span className="font-bold text-blue-900">Dấu hiệu nhận biết:</span>
                            <span className="ml-1 text-slate-700">{q.signalInQuestion}</span>
                          </div>
                        </div>
                      ) : null}

                      {q.solutionMethod ? (
                        <div className="flex items-start gap-1.5">
                          <Lightbulb size={14} className="mt-0.5 shrink-0 text-amber-600" />
                          <div>
                            <span className="font-bold text-amber-900">Phương pháp giải:</span>
                            <span className="ml-1 text-slate-700">{q.solutionMethod}</span>
                          </div>
                        </div>
                      ) : null}

                      {q.formulaApplied ? (
                        <div className="flex items-start gap-1.5">
                          <Layers size={14} className="mt-0.5 shrink-0 text-indigo-600" />
                          <div>
                            <span className="font-bold text-indigo-900">Công thức áp dụng:</span>
                            <span className="ml-1 font-mono font-medium text-indigo-800">{q.formulaApplied}</span>
                          </div>
                        </div>
                      ) : null}

                      {q.trapNote ? (
                        <div className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 p-2 text-amber-900">
                          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
                          <div>
                            <span className="font-bold">Bẫy đề thi cần nhớ:</span>
                            <span className="ml-1 font-medium">{q.trapNote}</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {activeTab === 'examples' ? (
        <div className="space-y-3">
          {grammarData.examples?.length ? grammarData.examples.map((example, index) => (
            <article key={`${index}-${example.sentence}`} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-xs font-bold text-slate-700">Ví dụ {index + 1}</h3>
              <p className="text-sm font-semibold text-slate-900">{example.sentence || 'Chưa có nội dung câu.'}</p>
              {example.translation ? <p className="text-xs italic text-slate-600">{example.translation}</p> : null}
              {example.analysis ? <p className="rounded-lg bg-blue-50 p-2.5 text-xs leading-relaxed text-blue-950">{example.analysis}</p> : null}
            </article>
          )) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-500">
              Chưa có ví dụ minh họa cho chủ điểm này.
            </div>
          )}
        </div>
      ) : null}

      {/* TAB 2: LÝ THUYẾT CỐT LÕI */}
      {activeTab === 'theory' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Lý thuyết cốt lõi chuyên đề</h3>
            </div>
            {editable ? (
              <button
                type="button"
                onClick={handleOpenEditTopic}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Chỉnh sửa lý thuyết
              </button>
            ) : null}
          </div>
          <div className="prose max-w-none text-xs leading-relaxed text-slate-800 sm:text-sm">
            <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-700">
              {grammarData.coreTheory || 'Không có nội dung lý thuyết.'}
            </pre>
          </div>
        </div>
      ) : null}

      {/* TAB 3: DẤU HIỆU & MẸO BẪY */}
      {activeTab === 'tips' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-blue-200/60 pb-2">
              <Sparkles size={16} className="text-blue-600" />
              <h4 className="font-bold text-blue-900">Dấu hiệu nhận biết (Signal Clues)</h4>
            </div>
            <div className="mt-3 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
              {grammarData.signalClues || 'Chưa cung cấp dấu hiệu nhận biết.'}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-emerald-200/60 pb-2">
              <Lightbulb size={16} className="text-emerald-700" />
              <h4 className="font-bold text-emerald-950">Mẹo & Chiến thuật (Tips & Tricks)</h4>
            </div>
            <div className="mt-3 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
              {grammarData.tipsAndTricks || 'Chưa cung cấp mẹo chiến thuật.'}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <h4 className="font-bold text-amber-950">Bẫy thường gặp (Common Traps)</h4>
            </div>
            <div className="mt-3 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
              {grammarData.commonTraps || 'Chưa cung cấp cảnh báo bẫy.'}
            </div>
          </div>
        </div>
      ) : null}

      {/* TAB 4: BẢNG TÓM TẮT GHI NHỚ */}
      {activeTab === 'table' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Bảng tóm tắt ghi nhớ chuyên đề</h3>
            </div>
            {editable ? (
              <button
                type="button"
                onClick={handleOpenEditTopic}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Chỉnh sửa bảng tóm tắt
              </button>
            ) : null}
          </div>
          <div className="overflow-x-auto">
            <MarkdownTableRenderer markdown={grammarData.summaryTable ?? ''} />
          </div>
        </div>
      ) : null}

      {/* TAB 5: RAW JSON */}
      {activeTab === 'raw' ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 shadow-xs">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>JSON Payload chuẩn hóa</span>
            <span>{JSON.stringify(currentItem.normalizedData).length} bytes</span>
          </div>
          <pre className="max-h-[500px] overflow-auto text-xs text-emerald-400 font-mono">
            {JSON.stringify(currentItem.normalizedData ?? currentItem.rawData, null, 2)}
          </pre>
        </div>
      ) : null}

      {/* 1. DIALOG XEM CHI TIẾT TOÀN BỘ CÂU HỎI (VIEW DIALOG) */}
      {viewingQuestion ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-black text-white">
                  Câu #{viewingQuestion.id}
                </span>
                <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                  {viewingQuestion.level}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingQuestion(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Nội dung câu hỏi</h4>
                <p className="mt-1 text-base font-bold text-slate-900 leading-snug">{viewingQuestion.question}</p>
              </div>

              {/* Ảnh câu hỏi (nếu có) */}
              {viewingQuestion.imageUrl ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Hình ảnh minh họa</h4>
                  <img
                    src={viewingQuestion.imageUrl}
                    alt="Ảnh câu hỏi"
                    className="max-h-60 w-full rounded-xl object-contain border border-slate-200 bg-slate-50"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <p className="mt-1 truncate text-[10px] text-slate-400">{viewingQuestion.imageUrl}</p>
                </div>
              ) : null}

              {/* Audio câu hỏi (nếu có) */}
              {viewingQuestion.audioUrl ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Audio câu hỏi / phát âm</h4>
                  <audio
                    controls
                    src={viewingQuestion.audioUrl}
                    className="h-9 w-full rounded-xl"
                    preload="metadata"
                  />
                  <p className="mt-1 truncate text-[10px] text-slate-400">{viewingQuestion.audioUrl}</p>
                </div>
              ) : null}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Các phương án lựa chọn</h4>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {['A', 'B', 'C', 'D'].map((key) => {
                    const isCorrect = viewingQuestion.correctAnswer?.toUpperCase() === key;
                    const optText = viewingQuestion.options?.[key];
                    const optVi = viewingQuestion.translation?.optionsVi?.[key];
                    return (
                      <div
                        key={key}
                        className={`rounded-xl border p-3 text-xs ${
                          isCorrect
                            ? 'border-emerald-300 bg-emerald-50/70 font-semibold text-emerald-950'
                            : 'border-slate-200 bg-slate-50/50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {key}
                          </span>
                          {isCorrect ? (
                            <span className="text-[11px] font-bold text-emerald-700">Đáp án chính xác</span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm font-bold">{optText || '—'}</p>
                        {optVi ? <p className="mt-1 text-xs text-slate-500 font-normal">{optVi}</p> : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              {viewingQuestion.translation?.questionVi || viewingQuestion.translation?.fullSentenceVi ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-1.5">
                  <h4 className="font-bold text-slate-800">Bản dịch tiếng Việt</h4>
                  {viewingQuestion.translation?.questionVi ? (
                    <p className="text-slate-700">{viewingQuestion.translation.questionVi}</p>
                  ) : null}
                  {viewingQuestion.translation?.fullSentenceVi ? (
                    <p className="font-medium text-emerald-800">{viewingQuestion.translation.fullSentenceVi}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-2 text-xs">
                {viewingQuestion.signalInQuestion ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                    <span className="font-bold text-blue-900">Dấu hiệu nhận diện: </span>
                    <span className="text-slate-700">{viewingQuestion.signalInQuestion}</span>
                  </div>
                ) : null}

                {viewingQuestion.solutionMethod ? (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                    <span className="font-bold text-amber-900">Phương pháp giải: </span>
                    <span className="text-slate-700">{viewingQuestion.solutionMethod}</span>
                  </div>
                ) : null}

                {viewingQuestion.formulaApplied ? (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                    <span className="font-bold text-indigo-900">Công thức áp dụng: </span>
                    <span className="font-mono font-medium text-indigo-800">{viewingQuestion.formulaApplied}</span>
                  </div>
                ) : null}

                {viewingQuestion.trapNote ? (
                  <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-red-900">
                    <span className="font-bold">Bẫy thí sinh cần nhớ: </span>
                    <span className="font-medium">{viewingQuestion.trapNote}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-3.5">
              <button
                type="button"
                onClick={() => setViewingQuestion(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. DIALOG THÊM / SỬA CÂU HỎI (ADD / EDIT QUESTION DIALOG) */}
      {editingQuestion ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
          <form
            onSubmit={handleSaveQuestion}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingQuestion.isNew ? 'Thêm câu hỏi ngữ pháp mới' : `Chỉnh sửa câu hỏi #${editingQuestion.data.id}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-6 text-xs">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="font-bold text-slate-700">Cấp độ (Level) *</span>
                  <input
                    required
                    value={editingQuestion.data.level ?? ''}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        data: { ...editingQuestion.data, level: e.target.value, levelShort: e.target.value.split(':')[0] },
                      })
                    }
                    placeholder="Level 1: Nhận biết"
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="font-bold text-slate-700">Đáp án chính xác *</span>
                  <select
                    value={editingQuestion.data.correctAnswer ?? 'A'}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        data: { ...editingQuestion.data, correctAnswer: e.target.value },
                      })
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                  >
                    <option value="A">Đáp án A</option>
                    <option value="B">Đáp án B</option>
                    <option value="C">Đáp án C</option>
                    <option value="D">Đáp án D</option>
                  </select>
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="font-bold text-slate-700">Đề bài câu hỏi *</span>
                  <textarea
                    required
                    rows={3}
                    value={editingQuestion.data.question ?? ''}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        data: { ...editingQuestion.data, question: e.target.value },
                      })
                    }
                    placeholder="Nhập nội dung câu hỏi..."
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                <span className="font-bold text-slate-800">4 Phương án trắc nghiệm</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {['A', 'B', 'C', 'D'].map((key) => (
                    <div key={key} className="space-y-1">
                      <span className="font-bold text-slate-700">Phương án {key} *</span>
                      <input
                        required
                        value={editingQuestion.data.options?.[key] ?? ''}
                        onChange={(e) => {
                          const nextOpts = { ...(editingQuestion.data.options ?? {}), [key]: e.target.value };
                          setEditingQuestion({
                            ...editingQuestion,
                            data: { ...editingQuestion.data, options: nextOpts },
                          });
                        }}
                        className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 outline-none focus:border-blue-500"
                      />
                      <input
                        value={editingQuestion.data.translation?.optionsVi?.[key] ?? ''}
                        onChange={(e) => {
                          const trans = editingQuestion.data.translation ?? {};
                          const nextOptVi = { ...(trans.optionsVi ?? {}), [key]: e.target.value };
                          setEditingQuestion({
                            ...editingQuestion,
                            data: { ...editingQuestion.data, translation: { ...trans, optionsVi: nextOptVi } },
                          });
                        }}
                        placeholder={`Nghĩa phương án ${key} (tùy chọn)`}
                        className="h-7 w-full rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-600 outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="font-bold text-slate-700">Dịch câu hỏi</span>
                  <input
                    value={editingQuestion.data.translation?.questionVi ?? ''}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        data: {
                          ...editingQuestion.data,
                          translation: { ...(editingQuestion.data.translation ?? {}), questionVi: e.target.value },
                        },
                      })
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="font-bold text-slate-700">Dịch hoàn chỉnh</span>
                  <input
                    value={editingQuestion.data.translation?.fullSentenceVi ?? ''}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        data: {
                          ...editingQuestion.data,
                          translation: { ...(editingQuestion.data.translation ?? {}), fullSentenceVi: e.target.value },
                        },
                      })
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="font-bold text-slate-700">Dấu hiệu nhận biết</span>
                  <input
                    value={editingQuestion.data.signalInQuestion ?? ''}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        data: { ...editingQuestion.data, signalInQuestion: e.target.value },
                      })
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="font-bold text-slate-700">Công thức áp dụng</span>
                  <input
                    value={editingQuestion.data.formulaApplied ?? ''}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        data: { ...editingQuestion.data, formulaApplied: e.target.value },
                      })
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="font-bold text-slate-700">Phương pháp giải chi tiết</span>
                <textarea
                  rows={2}
                  value={editingQuestion.data.solutionMethod ?? ''}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      data: { ...editingQuestion.data, solutionMethod: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="font-bold text-amber-800">Ghi chú bẫy đề thi</span>
                <input
                  value={editingQuestion.data.trapNote ?? ''}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      data: { ...editingQuestion.data, trapNote: e.target.value },
                    })
                  }
                  placeholder="Ghi chú bẫy cần cảnh báo cho học viên..."
                  className="mt-1 h-9 w-full rounded-lg border border-amber-200 bg-amber-50/40 px-3 outline-none focus:border-amber-500"
                />
              </label>

              {/* Media: Ảnh và Audio cho câu hỏi */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-blue-600" />
                  Media câu hỏi (Ảnh & Audio)
                </span>
                <label className="block">
                  <span className="font-semibold text-slate-600">URL Hình ảnh minh họa</span>
                  <input
                    type="url"
                    value={editingQuestion.data.imageUrl ?? ''}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        data: { ...editingQuestion.data, imageUrl: e.target.value },
                      })
                    }
                    placeholder="https://example.com/image.png hoặc /images/..."
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500"
                  />
                  {editingQuestion.data.imageUrl ? (
                    <img
                      src={editingQuestion.data.imageUrl}
                      alt="Xem trước"
                      className="mt-2 h-24 w-full rounded-lg object-contain border border-slate-200 bg-white"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  ) : null}
                </label>
                <label className="block">
                  <span className="font-semibold text-slate-600">URL Audio câu hỏi / phát âm</span>
                  <input
                    type="url"
                    value={editingQuestion.data.audioUrl ?? ''}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        data: { ...editingQuestion.data, audioUrl: e.target.value },
                      })
                    }
                    placeholder="https://example.com/audio.mp3 hoặc /audio/..."
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500"
                  />
                  {editingQuestion.data.audioUrl ? (
                    <audio
                      controls
                      src={editingQuestion.data.audioUrl}
                      className="mt-2 h-8 w-full rounded-lg"
                      preload="metadata"
                    />
                  ) : null}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-3.5">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? 'Đang lưu…' : 'Lưu câu hỏi'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* 3. DIALOG XÁC NHẬN XÓA CÂU HỎI */}
      {deletingQuestionIndex !== null ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900">Xác nhận xóa câu hỏi</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Bạn có chắc chắn muốn xóa câu hỏi #{deletingQuestionIndex + 1} khỏi chuyên đề ngữ pháp này?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingQuestionIndex(null)}
                className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleConfirmDeleteQuestion}
                className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Đang xóa…' : 'Xóa ngay'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 4. DIALOG SỬA THÔNG TIN CHUYÊN ĐỀ (EDIT TOPIC INFO DIALOG) */}
      {isEditingTopic ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
          <form
            onSubmit={handleSaveTopicInfo}
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900">Chỉnh sửa thông tin chuyên đề ngữ pháp</h3>
              <button
                type="button"
                onClick={() => setIsEditingTopic(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-6 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="font-bold text-slate-700">Tên chuyên đề (Tiếng Việt) *</span>
                  <input
                    required
                    value={topicForm.titleVi}
                    onChange={(e) => setTopicForm({ ...topicForm, titleVi: e.target.value })}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="font-bold text-slate-700">Tên chuyên đề (Tiếng Anh)</span>
                  <input
                    value={topicForm.titleEn}
                    onChange={(e) => setTopicForm({ ...topicForm, titleEn: e.target.value })}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="font-bold text-slate-700">Mã chuyên đề *</span>
                  <input
                    required
                    value={topicForm.topicCode}
                    onChange={(e) => setTopicForm({ ...topicForm, topicCode: e.target.value })}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="font-bold text-slate-700">Tên định danh (CodeName)</span>
                  <input
                    value={topicForm.codeName}
                    onChange={(e) => setTopicForm({ ...topicForm, codeName: e.target.value })}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="font-bold text-slate-700">Phân loại (Category)</span>
                  <input
                    value={topicForm.category}
                    onChange={(e) => setTopicForm({ ...topicForm, category: e.target.value })}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="font-bold text-slate-700">Mô tả tổng quan</span>
                <textarea
                  rows={2}
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="font-bold text-slate-700">Lý thuyết cốt lõi (Core Theory - Markdown)</span>
                <textarea
                  rows={6}
                  value={topicForm.coreTheory}
                  onChange={(e) => setTopicForm({ ...topicForm, coreTheory: e.target.value })}
                  className="mt-1 w-full font-mono text-[11px] rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="font-bold text-blue-900">Dấu hiệu nhận biết (Signal Clues)</span>
                  <textarea
                    rows={3}
                    value={topicForm.signalClues}
                    onChange={(e) => setTopicForm({ ...topicForm, signalClues: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="font-bold text-emerald-900">Mẹo & Chiến thuật (Tips & Tricks)</span>
                  <textarea
                    rows={3}
                    value={topicForm.tipsAndTricks}
                    onChange={(e) => setTopicForm({ ...topicForm, tipsAndTricks: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="font-bold text-amber-900">Bẫy thường gặp (Common Traps)</span>
                <textarea
                  rows={2}
                  value={topicForm.commonTraps}
                  onChange={(e) => setTopicForm({ ...topicForm, commonTraps: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="font-bold text-slate-700">Bảng tóm tắt (Markdown Table)</span>
                <textarea
                  rows={4}
                  value={topicForm.summaryTable}
                  onChange={(e) => setTopicForm({ ...topicForm, summaryTable: e.target.value })}
                  className="mt-1 w-full font-mono text-[11px] rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </label>

              {/* Media: Ảnh và Audio cho chuyên đề */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-3.5 space-y-3">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-blue-600" />
                  Media chuyên đề (Ảnh bìa & Audio phát âm)
                </span>
                <label className="block">
                  <span className="font-semibold text-slate-600">URL Hình ảnh bìa / minh họa chuyên đề</span>
                  <input
                    type="url"
                    value={topicForm.imageUrl}
                    onChange={(e) => setTopicForm({ ...topicForm, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.png hoặc /images/..."
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500"
                  />
                  {topicForm.imageUrl ? (
                    <img
                      src={topicForm.imageUrl}
                      alt="Xem trước ảnh chuyên đề"
                      className="mt-2 h-28 w-full rounded-lg object-contain border border-slate-200 bg-white"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  ) : null}
                </label>
                <label className="block">
                  <span className="font-semibold text-slate-600">URL Audio phát âm / ngữ âm chuyên đề</span>
                  <input
                    type="url"
                    value={topicForm.audioUrl}
                    onChange={(e) => setTopicForm({ ...topicForm, audioUrl: e.target.value })}
                    placeholder="https://example.com/audio.mp3 hoặc /audio/..."
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500"
                  />
                  {topicForm.audioUrl ? (
                    <audio
                      controls
                      src={topicForm.audioUrl}
                      className="mt-2 h-8 w-full rounded-lg"
                      preload="metadata"
                    />
                  ) : null}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-3.5">
              <button
                type="button"
                onClick={() => setIsEditingTopic(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? 'Đang lưu…' : 'Lưu chuyên đề'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* DIALOG XEM ẢNH PHÓNG TO */}
      {previewImage ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl w-full rounded-2xl bg-white p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800 truncate">{previewImage.title}</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center justify-center p-4">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[75vh] max-w-full rounded-xl object-contain"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>
            <p className="px-4 pb-3 truncate text-center text-[10px] text-slate-400">{previewImage.url}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MarkdownTableRenderer({ markdown }: { markdown: string }) {
  const parsedTable = useMemo(() => {
    if (!markdown || !markdown.includes('|')) return null;
    const lines = markdown.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return null;

    const headers = lines[0]
      .split('|')
      .map((col) => col.trim())
      .filter((col, idx, arr) => idx > 0 && idx < arr.length - 1);

    const bodyLines = lines.slice(2);
    const rows = bodyLines.map((line) =>
      line
        .split('|')
        .map((col) => col.trim())
        .filter((col, idx, arr) => idx > 0 && idx < arr.length - 1),
    );

    return { headers, rows };
  }, [markdown]);

  if (!parsedTable) {
    return (
      <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-mono text-xs text-slate-700">
        {markdown}
      </pre>
    );
  }

  return (
    <table className="w-full min-w-[600px] border-collapse text-left text-xs">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          {parsedTable.headers.map((h, i) => (
            <th key={i} className="px-4 py-3 font-bold uppercase tracking-wider text-slate-700">
              {h.replace(/\*\*/g, '')}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
        {parsedTable.rows.map((row, rIdx) => (
          <tr key={rIdx} className="hover:bg-slate-50/70">
            {row.map((cell, cIdx) => (
              <td key={cIdx} className="px-4 py-3 leading-relaxed">
                {cell.includes('**') ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: cell
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>'),
                    }}
                  />
                ) : (
                  cell
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
