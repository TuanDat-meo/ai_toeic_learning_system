'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Filter,
  HelpCircle,
  Info,
  Languages,
  Layers,
  ListOrdered,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import {
  deleteVocabularyPreviewItem,
  updateVocabularyPreviewItem,
  type ImportBatchDetails,
  type ImportPreviewItem,
} from '@/lib/api/content-import';
import type {
  GradedQuestionOption,
  ReadingNormalizedData,
  ReadingQuestionItem,
  ReadingSubPassageItem,
} from './types';
import { cleanErrorMessage, itemStatus } from './utils';

interface ReadingPreviewListProps {
  items: ImportPreviewItem[];
  fileName: string;
  totalRecords: number;
  batchId: string;
  editable: boolean;
  onBatchUpdated?: (batch: ImportBatchDetails) => void;
}

const PART_CONFIG: Record<
  string,
  {
    name: string;
    sub: string;
    questionsRange: string;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
    directionsEn: string;
    directionsVi: string;
    description: string;
  }
> = {
  PART_5: {
    name: 'Part 5: Incomplete Sentences',
    sub: 'Điền câu đơn',
    questionsRange: 'Câu 101 – 130 (30 câu)',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700 border-emerald-200',
    borderColor: 'border-emerald-300',
    directionsEn:
      'Directions: A word or phrase is missing in each of the sentences below. Four answer choices are given below each sentence. Select the best answer to complete the sentence. Then mark the letter (A), (B), (C), or (D) on your answer sheet.',
    directionsVi:
      'Hướng dẫn: Mỗi câu dưới đây bị khuyết một từ hoặc cụm từ. Bốn phương án trả lời được cung cấp bên dưới mỗi câu. Chọn đáp án thích hợp nhất để hoàn thành câu và đánh dấu vào phiếu trả lời.',
    description: 'Tập trung ngữ pháp từ loại, thì động từ và từ vựng ngữ cảnh. Không có đoạn văn đọc.',
  },
  PART_6: {
    name: 'Part 6: Text Completion',
    sub: 'Điền từ vào đoạn văn',
    questionsRange: 'Câu 131 – 146 (16 câu / 4 đoạn)',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700 border-purple-200',
    borderColor: 'border-purple-300',
    directionsEn:
      'Directions: Read the texts that follow. A word, phrase, or sentence is missing in parts of each text. Four answer choices for each question are given below the text. Select the best answer to complete the text. Then mark the letter (A), (B), (C), or (D) on your answer sheet.',
    directionsVi:
      'Hướng dẫn: Đọc các đoạn văn sau. Một số vị trí trong đoạn văn bị khuyết từ, cụm từ hoặc câu. Chọn phương án trả lời thích hợp nhất để điền vào chỗ trống.',
    description: 'Gồm 4 bài đọc ngắn (thông báo, email, thư từ). Chỗ trống đánh số [131], [132]... kèm 1 câu điền ngữ cảnh.',
  },
  PART_7: {
    name: 'Part 7: Reading Comprehension',
    sub: 'Đọc hiểu văn bản',
    questionsRange: 'Câu 147 – 200 (54 câu)',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700 border-blue-200',
    borderColor: 'border-blue-300',
    directionsEn:
      'Directions: In this part you will read a selection of texts, such as magazine and newspaper articles, letters, and advertisements. Each text is followed by several questions. Select the best answer for each question and mark the letter (A), (B), (C), or (D) on your answer sheet.',
    directionsVi:
      'Hướng dẫn: Trong phần này bạn sẽ đọc tuyển tập các văn bản (bài báo, thư từ, quảng cáo, email). Mỗi bài đọc có một số câu hỏi đi kèm. Chọn phương án trả lời chính xác nhất.',
    description: 'Đoạn đơn (147-175), Đoạn kép (176-185), Đoạn ba (186-200). Đọc hiểu ý chính, chi tiết và liên kết thông tin.',
  },
};

function normalizeReadingPart(rawPart?: string, content?: string): 'PART_5' | 'PART_6' | 'PART_7' {
  if (rawPart) {
    const p = rawPart.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (p.includes('5') || p === 'PART5') return 'PART_5';
    if (p.includes('6') || p === 'PART6') return 'PART_6';
    if (p.includes('7') || p === 'PART7') return 'PART_7';
  }
  // Smart auto-detection based on content:
  if (!content || content.trim().length === 0) return 'PART_5';
  const c = content.toLowerCase();
  if (
    c.includes('[131]') ||
    c.includes('[132]') ||
    c.includes('[1]') ||
    c.includes('[2]') ||
    c.includes('___') ||
    c.includes('______')
  ) {
    return 'PART_6';
  }
  return 'PART_7';
}

export function ReadingPreviewList({
  items,
  fileName,
  totalRecords,
  batchId,
  editable,
  onBatchUpdated,
}: ReadingPreviewListProps) {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [filterPart, setFilterPart] = useState<'ALL' | 'PART_5' | 'PART_6' | 'PART_7'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VALID' | 'INVALID' | 'DUPLICATE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'passage' | 'questions' | 'directions' | 'theory' | 'raw'>('passage');
  const [showBilingualPassage, setShowBilingualPassage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState<{
    title: string;
    part: 'PART_5' | 'PART_6' | 'PART_7';
    content: string;
    passageTextVi: string;
    topic: string;
    difficulty: string;
    subCategory: string;
    tag: string;
  }>({
    title: '',
    part: 'PART_5',
    content: '',
    passageTextVi: '',
    topic: '',
    difficulty: 'MEDIUM',
    subCategory: '',
    tag: '',
  });

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const data = (item.normalizedData || {}) as ReadingNormalizedData;
      const raw = (item.rawData || {}) as Record<string, unknown>;
      const part = normalizeReadingPart(
        data.part || (raw.part as string),
        data.content || data.passageText || (raw.content as string)
      );

      if (filterPart !== 'ALL' && part !== filterPart) return false;
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (data.title || (raw.title as string) || '').toLowerCase();
        const content = (data.content || data.passageText || '').toLowerCase();
        const topic = (data.topic || '').toLowerCase();
        return title.includes(q) || content.includes(q) || topic.includes(q);
      }
      return true;
    });
  }, [items, filterPart, filterStatus, searchQuery]);

  // Selected item
  const selectedItem = filteredItems[selectedItemIndex] || filteredItems[0] || null;
  const selectedData = (selectedItem?.normalizedData || {}) as ReadingNormalizedData;
  const selectedRaw = (selectedItem?.rawData || {}) as Record<string, unknown>;

  const currentPart = useMemo(() => {
    if (!selectedItem) return 'PART_5';
    return normalizeReadingPart(
      selectedData.part || (selectedRaw.part as string),
      selectedData.content || selectedData.passageText || (selectedRaw.content as string)
    );
  }, [selectedItem, selectedData, selectedRaw]);

  const partConfig = PART_CONFIG[currentPart] || PART_CONFIG.PART_5;

  // Questions inside selected item
  const questionsList: ReadingQuestionItem[] = useMemo(() => {
    if (!selectedItem) return [];
    if (Array.isArray(selectedData.questions) && selectedData.questions.length > 0) {
      return selectedData.questions;
    }
    if (Array.isArray(selectedData.sampleQuestions) && selectedData.sampleQuestions.length > 0) {
      return selectedData.sampleQuestions;
    }
    if (Array.isArray(selectedRaw.questions)) {
      return selectedRaw.questions as ReadingQuestionItem[];
    }
    if (Array.isArray(selectedRaw.sampleQuestions)) {
      return selectedRaw.sampleQuestions as ReadingQuestionItem[];
    }
    return [];
  }, [selectedItem, selectedData, selectedRaw]);

  // Sub passages
  const passagesList: ReadingSubPassageItem[] = useMemo(() => {
    if (!selectedItem) return [];
    if (Array.isArray(selectedData.passages) && selectedData.passages.length > 0) {
      return selectedData.passages;
    }
    if (Array.isArray(selectedRaw.passages)) {
      return selectedRaw.passages as ReadingSubPassageItem[];
    }
    return [];
  }, [selectedItem, selectedData, selectedRaw]);

  // Handle open edit modal
  const handleOpenEdit = () => {
    if (!selectedItem) return;
    setEditForm({
      title: selectedData.title || (selectedRaw.title as string) || '',
      part: currentPart,
      content: selectedData.content || selectedData.passageText || (selectedRaw.content as string) || '',
      passageTextVi: selectedData.passageTextVi || (selectedRaw.passageTextVi as string) || '',
      topic: selectedData.topic || (selectedRaw.topic as string) || '',
      difficulty: selectedData.difficulty || (selectedRaw.difficulty as string) || 'MEDIUM',
      subCategory: selectedData.subCategory || (selectedRaw.subCategory as string) || '',
      tag: selectedData.tag || (selectedRaw.tag as string) || '',
    });
    setIsEditModalOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    setIsSavingEdit(true);
    try {
      const updatedPayload: Record<string, unknown> = {
        ...selectedRaw,
        title: editForm.title.trim(),
        part: editForm.part,
        content: editForm.content.trim(),
        passageTextVi: editForm.passageTextVi.trim(),
        topic: editForm.topic.trim(),
        difficulty: editForm.difficulty,
        subCategory: editForm.subCategory.trim(),
        tag: editForm.tag.trim(),
      };
      const updatedBatch = await updateVocabularyPreviewItem(batchId, selectedItem.id, updatedPayload);
      onBatchUpdated?.(updatedBatch);
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể lưu bài đọc.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    const itemTitle = selectedData.title || (selectedRaw.title as string) || `Bài đọc dòng #${selectedItem.rowNumber}`;
    if (!confirm(`Bạn có chắc chắn muốn xóa bài đọc "${itemTitle}" khỏi lô nhập?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const updatedBatch = await deleteVocabularyPreviewItem(batchId, selectedItem.id);
      onBatchUpdated?.(updatedBatch);
      if (selectedItemIndex > 0) {
        setSelectedItemIndex((prev) => prev - 1);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa bài đọc.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper format options
  const renderOptions = (q: ReadingQuestionItem) => {
    let opts: { key: string; text: string }[] = [];
    if (q.options) {
      if (Array.isArray(q.options)) {
        opts = (q.options as unknown[]).map((opt, i) => {
          if (typeof opt === 'string') {
            const letter = String.fromCharCode(65 + i);
            return { key: letter, text: opt };
          }
          if (typeof opt === 'object' && opt !== null) {
            const o = opt as Record<string, string>;
            return { key: o.id || o.key || String.fromCharCode(65 + i), text: o.text || o.value || '' };
          }
          return { key: String(i), text: String(opt) };
        });
      } else if (typeof q.options === 'object') {
        const optObj = q.options as Record<string, string>;
        opts = ['A', 'B', 'C', 'D'].map((key) => ({
          key,
          text: optObj[key] || '',
        }));
      }
    }

    const correct = (q.correctAnswer || '').toUpperCase();
    const correctIdx = q.correctIndex;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {opts.map((opt, idx) => {
          const isCorrect = opt.key.toUpperCase() === correct || (correctIdx !== undefined && idx === correctIdx);
          return (
            <div
              key={opt.key}
              className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs transition ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold ring-1 ring-emerald-200'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {opt.key}
              </span>
              <span className="flex-1 break-words">{opt.text}</span>
              {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 font-sans text-slate-900">
      {/* TOOLBAR BỘ LỌC VÀ TÌM KIẾM */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Part Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterPart('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterPart === 'ALL' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả Parts
            </button>
            <button
              type="button"
              onClick={() => setFilterPart('PART_5')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterPart === 'PART_5' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Part 5 (Câu đơn)
            </button>
            <button
              type="button"
              onClick={() => setFilterPart('PART_6')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterPart === 'PART_6' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Part 6 (Điền đoạn)
            </button>
            <button
              type="button"
              onClick={() => setFilterPart('PART_7')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterPart === 'PART_7' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Part 7 (Đọc hiểu)
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'VALID' | 'INVALID' | 'DUPLICATE')}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Mọi trạng thái</option>
            <option value="VALID">✅ Hợp lệ (VALID)</option>
            <option value="INVALID">⚠️ Có lỗi (INVALID)</option>
            <option value="DUPLICATE">🔄 Trùng lặp (DUPLICATE)</option>
          </select>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, đoạn văn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* DANH SÁCH & BẢNG XEM CHI TIẾT (2 CỘT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* CỘT TRÁI: DANH SÁCH CÁC BÀI ĐỌC */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
              Không tìm thấy bài đọc nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const data = (item.normalizedData || {}) as ReadingNormalizedData;
              const raw = (item.rawData || {}) as Record<string, unknown>;
              const part = normalizeReadingPart(
                data.part || (raw.part as string),
                data.content || data.passageText || (raw.content as string)
              );
              const cfg = PART_CONFIG[part] || PART_CONFIG.PART_5;
              const isSelected = selectedItem?.id === item.id;
              const itemTitle = data.title || (raw.title as string) || `Bài đọc dòng #${item.rowNumber}`;
              const hasErrors = Array.isArray(item.errors) && item.errors.length > 0;
              const qCount =
                (data.questions && data.questions.length) ||
                (data.sampleQuestions && data.sampleQuestions.length) ||
                (Array.isArray(raw.questions) && raw.questions.length) ||
                data.totalQuestions ||
                0;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${cfg.badgeBg} ${cfg.badgeText}`}
                    >
                      {part.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      #{item.rowNumber}
                    </span>
                  </div>

                  <h4 className="mt-2 text-xs font-bold text-slate-900 line-clamp-1">
                    {itemTitle}
                  </h4>

                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                    {data.content || data.passageText || (raw.content as string) || cfg.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                      {qCount > 0 ? `${qCount} câu hỏi` : cfg.questionsRange}
                    </span>

                    {hasErrors ? (
                      <span className="flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-200 text-[10px]">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {item.errors.length} lỗi
                      </span>
                    ) : item.status === 'DUPLICATE' ? (
                      <span className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                        Trùng lặp
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Hợp lệ
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CỘT PHẢI: CHI TIẾT BÀI ĐỌC ĐÃ CHỌN */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          {selectedItem ? (
            <>
              {/* HEADER BÀI ĐỌC */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${partConfig.badgeBg} ${partConfig.badgeText}`}
                    >
                      {partConfig.name}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Dòng #{selectedItem.rowNumber}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-950">
                    {selectedData.title || (selectedRaw.title as string) || `Bài đọc dòng #${selectedItem.rowNumber}`}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {partConfig.sub} • {partConfig.questionsRange}
                  </p>
                </div>

                {editable && (
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleOpenEdit}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Sửa bài đọc</span>
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleDeleteItem}
                      className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                      title="Xóa bài đọc khỏi lô nhập"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* LỖI VALIDATION NẾU CÓ */}
              {Array.isArray(selectedItem.errors) && selectedItem.errors.length > 0 && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>Lỗi cần chỉnh sửa trước khi xuất bản:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-red-600 pl-1 space-y-0.5">
                    {selectedItem.errors.map((err: string, i: number) => (
                      <li key={i}>{cleanErrorMessage(err)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* TABS ĐIỀU HƯỚNG CHI TIẾT */}
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('passage')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    activeTab === 'passage'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Đoạn văn &amp; Nội dung</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    activeTab === 'questions'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Câu hỏi ({questionsList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('directions')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    activeTab === 'directions'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Hướng dẫn thi TOEIC</span>
                </button>
              </div>

              {/* NỘI DUNG THEO TAB */}
              {activeTab === 'passage' && (
                <div className="space-y-3">
                  {currentPart === 'PART_5' ? (
                    <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Đặc thù TOEIC Part 5: Incomplete Sentences</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Phần Part 5 bao gồm 30 câu đơn khuyết chỗ trống (Questions 101–130) để kiểm tra ngữ pháp và từ vựng.
                        Phần này <strong>không có bài đọc đoạn văn dài</strong>. Các câu hỏi sẽ được hiển thị độc lập tại tab <strong>Câu hỏi</strong>.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Tiêu đề đoạn văn & nút song ngữ */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span>Văn bản bài đọc ETS</span>
                        </span>
                        {Boolean(selectedData.passageTextVi || selectedRaw.passageTextVi) && (
                          <button
                            type="button"
                            onClick={() => setShowBilingualPassage(!showBilingualPassage)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                              showBilingualPassage
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Languages className="w-3.5 h-3.5" />
                            <span>{showBilingualPassage ? 'Ẩn bản dịch' : 'Xem bản dịch'}</span>
                          </button>
                        )}
                      </div>

                      {/* Hiển thị văn bản (hỗ trợ sub-passages cho Part 7 đoạn kép/ba) */}
                      {passagesList.length > 0 ? (
                        <div className="space-y-3">
                          {passagesList.map((p, pIdx) => (
                            <div key={p.id || pIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                              {p.title && (
                                <h5 className="text-xs font-bold text-blue-900 border-b border-slate-200/60 pb-1">
                                  {p.label ? `[${p.label}] ` : ''}{p.title}
                                </h5>
                              )}
                              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-serif">
                                {p.text}
                              </p>
                              {showBilingualPassage && p.textVi && (
                                <p className="text-xs text-slate-500 italic border-t border-slate-200/50 pt-2 whitespace-pre-line">
                                  {p.textVi}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-serif">
                            {String(selectedData.content || selectedData.passageText || selectedRaw.content || 'Chưa có nội dung đoạn văn.')}
                          </p>
                          {Boolean(showBilingualPassage && (selectedData.passageTextVi || selectedRaw.passageTextVi)) && (
                            <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 italic whitespace-pre-line">
                              <span className="font-bold text-amber-700 not-italic block mb-1">Bản dịch tiếng Việt:</span>
                              {String(selectedData.passageTextVi || selectedRaw.passageTextVi || '')}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'questions' && (
                <div className="space-y-3">
                  {questionsList.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                      Chưa có câu hỏi đi kèm bài đọc này. Bạn có thể bấm &quot;Sửa bài đọc&quot; để bổ sung câu hỏi.
                    </div>
                  ) : (
                    questionsList.map((q, qIdx) => (
                      <div
                        key={q.id || qIdx}
                        className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            Câu {q.questionNum || qIdx + 1}
                          </span>
                          {q.correctAnswer && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Đáp án: {q.correctAnswer}
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-slate-900 leading-snug">
                          {String(q.question || q.questionText || '')}
                        </p>

                        {renderOptions(q)}

                        {q.explanation && (
                          <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-0.5">
                            <span className="font-bold text-amber-800 flex items-center gap-1 text-[11px]">
                              <Sparkles className="w-3.5 h-3.5" /> Giải thích chi tiết:
                            </span>
                            <p className="text-[11px] leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'directions' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                      <Info className="w-4 h-4 text-blue-700" />
                      <span>Hướng dẫn chuẩn ETS TOEIC ({partConfig.name})</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-blue-100 text-xs text-slate-800 space-y-1 font-serif">
                      <span className="font-bold text-slate-900 block font-sans">English:</span>
                      <p className="italic leading-relaxed">{partConfig.directionsEn}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-blue-100 text-xs text-slate-800 space-y-1">
                      <span className="font-bold text-slate-900 block">Tiếng Việt:</span>
                      <p className="leading-relaxed">{partConfig.directionsVi}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-indigo-600" />
                      <span>Đặc điểm &amp; Chiến lược thời gian đề xuất</span>
                    </h5>
                    <p className="text-slate-600 leading-relaxed">{partConfig.description}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Chọn một bài đọc ở danh sách bên trái để xem nội dung chi tiết.
            </div>
          )}
        </div>
      </div>

      {/* MODAL SỬA BÀI ĐỌC (EDIT MODAL) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Chỉnh sửa bài đọc Reading</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tiêu đề bài đọc</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phần thi (Part)</label>
                  <select
                    value={editForm.part}
                    onChange={(e) =>
                      setEditForm({ ...editForm, part: e.target.value as 'PART_5' | 'PART_6' | 'PART_7' })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="PART_5">Part 5 (Câu đơn)</option>
                    <option value="PART_6">Part 6 (Điền đoạn văn)</option>
                    <option value="PART_7">Part 7 (Đọc hiểu văn bản)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Độ khó</label>
                  <select
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="EASY">Dễ (450+)</option>
                    <option value="MEDIUM">Vừa sức (600+)</option>
                    <option value="HARD">Nâng cao (750+)</option>
                  </select>
                </div>
              </div>

              {editForm.part !== 'PART_5' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nội dung đoạn văn (Passage)</label>
                    <textarea
                      rows={5}
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      placeholder="Dán đoạn văn tiếng Anh vào đây..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Bản dịch tiếng Việt (Tùy chọn)</label>
                    <textarea
                      rows={3}
                      value={editForm.passageTextVi}
                      onChange={(e) => setEditForm({ ...editForm, passageTextVi: e.target.value })}
                      placeholder="Bản dịch nghĩa đoạn văn..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Chủ đề (Topic)</label>
                  <input
                    type="text"
                    value={editForm.topic}
                    onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                    placeholder="Ví dụ: Workplace, Business, Travel"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Thẻ ghi chú (Tag)</label>
                  <input
                    type="text"
                    value={editForm.tag}
                    onChange={(e) => setEditForm({ ...editForm, tag: e.target.value })}
                    placeholder="Ví dụ: Bẫy từ loại, Đọc hiểu email"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSavingEdit}
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isSavingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
