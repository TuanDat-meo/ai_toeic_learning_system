'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  Database,
  FileJson2,
  FileSpreadsheet,
  Headphones,
  FileText,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  getContentImportBatch,
  listContentImportBatches,
  previewContentImport,
  publishContentImport,
  deleteContentImportBatch,
  extractContentImportDocument,
  parseTextToContentImportPreview,
  uploadContentImportAsset,
  type ImportBatchDetails,
  type ImportBatchSummary,
  type ImportedContentType,
  type ContentImportDocumentExtraction,
  type ContentImportMediaAsset,
} from '@/lib/api/content-import';
import { getVocabularySets } from '@/lib/api/vocabulary';
import type { VocabularyTestSet } from '@/app/admin/content/vocabulary/types';

import {
  CONTENT_TYPES,
  IMPORTABLE_CONTENT_TYPES,
  MAX_FILE_BYTES,
  STRUCTURED_EXTENSIONS,
  type PreviewStatusFilter,
} from './import/types';
import {
  acceptedExtensions,
  cleanErrorMessage,
  extensionOf,
  formatGuidance,
  statusLabel,
} from './import/utils';
import { VocabularyPreviewList } from './import/VocabularyPreviewList';
import { GrammarPreviewList } from './import/GrammarPreviewList';
import { ReadingPreviewList } from './import/ReadingPreviewList';
import { GenericPreviewTable } from './import/GenericPreviewTable';

function downloadSample(type: ImportedContentType, format: 'json' | 'csv') {
  const config = CONTENT_TYPES.find((c) => c.id === type) ?? CONTENT_TYPES[0];
  const filename = `mau-import-${type.toLowerCase()}.${format}`;
  let content = '';

  if (format === 'json') {
    content = JSON.stringify([config.sample], null, 2);
  } else {
    const keys = Object.keys(config.sample);
    const values = keys.map((k) => {
      const val = config.sample[k];
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    });
    content = `${keys.join(',')}\n${values.join(',')}`;
  }

  const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadExtraction(extraction: ContentImportDocumentExtraction) {
  const blob = new Blob([JSON.stringify(extraction, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${extraction.fileName.replace(/\.[^.]+$/, '')}-ocr-draft.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Không xác định'
    : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function ContentImportManagement() {
  const [type, setType] = useState<ImportedContentType>('VOCABULARY');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [vocabularySets, setVocabularySets] = useState<VocabularyTestSet[]>([]);
  const [vocabularySetsError, setVocabularySetsError] = useState('');
  const [vocabularyTarget, setVocabularyTarget] = useState('__file__');
  const [newVocabularySetName, setNewVocabularySetName] = useState('');
  const [batches, setBatches] = useState<ImportBatchSummary[]>([]);
  const [details, setDetails] = useState<ImportBatchDetails | null>(null);
  const [previewSearch, setPreviewSearch] = useState('');
  const [previewStatus, setPreviewStatus] = useState<PreviewStatusFilter>('ALL');
  const [extraction, setExtraction] = useState<ContentImportDocumentExtraction | null>(null);
  const [mediaAsset, setMediaAsset] = useState<ContentImportMediaAsset | null>(null);
  const [batchToDelete, setBatchToDelete] = useState<ImportBatchSummary | null>(null);
  const [deletingBatch, setDeletingBatch] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedType = useMemo(
    () => CONTENT_TYPES.find((contentType) => contentType.id === type)!,
    [type],
  );

  const filteredPreviewItems = useMemo(() => {
    if (!details) return [];
    const query = previewSearch.trim().toLocaleLowerCase('vi');
    return details.items.filter((item) => {
      if (previewStatus !== 'ALL' && item.status !== previewStatus) return false;
      if (!query) return true;
      const content = [
        item.normalizedData,
        item.rawData,
        item.errors,
        item.rowNumber,
      ].map((value) => typeof value === 'string' ? value : JSON.stringify(value))
        .join(' ')
        .toLocaleLowerCase('vi');
      return content.includes(query);
    });
  }, [details, previewSearch, previewStatus]);

  const refreshBatches = useCallback(async () => {
    try {
      setBatches(await listContentImportBatches());
      setError('');
    } catch (requestError) {
      setError(cleanErrorMessage(requestError));
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshBatches(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshBatches]);

  useEffect(() => {
    let active = true;
    getVocabularySets()
      .then((sets) => {
        if (active) setVocabularySets(sets);
      })
      .catch((requestError) => {
        if (active) {
          setVocabularySetsError(cleanErrorMessage(requestError));
        }
      });
    return () => { active = false; };
  }, []);

  async function handleDeleteBatch() {
    if (!batchToDelete) return;
    if (batchToDelete.status === 'PUBLISHED' || batchToDelete.status === 'PARTIAL') {
      setError('Không được xóa lô import đã publish dữ liệu.');
      setBatchToDelete(null);
      return;
    }
    setDeletingBatch(true);
    setError('');
    try {
      await deleteContentImportBatch(batchToDelete.id);
      if (details?.batch.id === batchToDelete.id) {
        setDetails(null);
      }
      setNotice(`Đã xóa lượt nhập "${batchToDelete.fileName}".`);
      setBatchToDelete(null);
      await refreshBatches();
    } catch (requestError) {
      setError(cleanErrorMessage(requestError));
    } finally {
      setDeletingBatch(false);
    }
  }

  async function openBatch(batchId: string) {
    setLoadingDetails(true);
    setDetails(null);
    setPreviewSearch('');
    setPreviewStatus('ALL');
    setError('');
    setNotice('');
    try {
      setDetails(await getContentImportBatch(batchId));
    } catch (requestError) {
      setError(cleanErrorMessage(requestError));
    } finally {
      setLoadingDetails(false);
    }
  }

  async function loadAllRows() {
    if (!details?.hasMore || loadingDetails) return;
    setLoadingDetails(true);
    setError('');
    try {
      let merged = details;
      while (merged.hasMore) {
        const page = await getContentImportBatch(
          merged.batch.id,
          merged.items.length,
          100,
        );
        merged = { ...page, items: [...merged.items, ...page.items] };
      }
      setDetails(merged);
    } catch (requestError) {
      setError(cleanErrorMessage(requestError));
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handlePreviewItemsUpdated(updated: ImportBatchDetails) {
    const previousVisibleCount = details?.batch.id === updated.batch.id
      ? details.items.length
      : updated.items.length;
    const targetCount = Math.min(
      updated.batch.totalRecords,
      Math.max(previousVisibleCount, updated.items.length + (updated.hasMore ? 1 : 0)),
    );
    setDetails(updated);
    setError('');
    let refreshError = '';
    try {
      let merged = updated;
      while (merged.items.length < targetCount && merged.hasMore) {
        const page = await getContentImportBatch(
          updated.batch.id,
          merged.items.length,
          Math.min(100, targetCount - merged.items.length),
        );
        merged = { ...page, items: [...merged.items, ...page.items] };
      }
      setDetails(merged);
    } catch (requestError) {
      refreshError = cleanErrorMessage(requestError);
    }
    await refreshBatches();
    if (refreshError) setError(refreshError);
  }

  async function publishBatch() {
    if (!details) return;
    setProcessing(true);
    setError('');
    setNotice('');
    try {
      await publishContentImport(details.batch.id);
      const updated = await getContentImportBatch(details.batch.id);
      setDetails(updated);
      setNotice(`Đã publish thành công ${updated.batch.publishedCount.toLocaleString('vi-VN')} mục hợp lệ vào hệ thống.`);
      if (details.batch.contentType === 'GRAMMAR') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('toeic_grammar_topics');
          window.dispatchEvent(new CustomEvent('toeic-grammar-topics-updated'));
        }
      } else if (details.batch.contentType === 'READING') {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('toeic-reading-cards-updated', { detail: { source: 'content-import' } })
          );
        }
      }
      await refreshBatches();
    } catch (requestError) {
      setError(cleanErrorMessage(requestError));
    } finally {
      setProcessing(false);
      setConfirmPublish(false);
    }
  }

  function handleTypeChange(nextType: ImportedContentType) {
    setType(nextType);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setDetails(null);
    setExtraction(null);
    setMediaAsset(null);
    setError('');
    setNotice('');
  }

  async function processFile() {
    if (!file) {
      setError('Chọn file trước khi tiếp tục.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('File không được vượt quá 256 MB.');
      return;
    }

    const extension = extensionOf(file.name);
    if (!acceptedFileExtensions.includes(extension)) {
      setError(`Định dạng .${extension} không được hỗ trợ cho ${selectedType.label}. ${formatGuidance(selectedType)}.`);
      return;
    }
    if (type === 'VOCABULARY' && vocabularyTarget === '__new__' && !newVocabularySetName.trim()) {
      setError('Nhập tên bộ từ vựng mới trước khi tiếp tục.');
      return;
    }
    const vocabularyDestination = type !== 'VOCABULARY' || vocabularyTarget === '__file__'
      ? undefined
      : vocabularyTarget === '__new__'
        ? { setName: newVocabularySetName.trim() }
        : { setId: vocabularyTarget };

    setProcessing(true);
    setError('');
    setNotice('');
    setExtraction(null);
    setMediaAsset(null);
    setDetails(null);

    try {
      if (STRUCTURED_EXTENSIONS.includes(extension)) {
        setDetails(await previewContentImport(type, file, vocabularyDestination));
        await refreshBatches();
      } else if (selectedType.mediaExtensions.includes(extension)) {
        const uploaded = await uploadContentImportAsset(type, file);
        setMediaAsset(uploaded);
        setNotice(`Đã lưu media. Dùng URL bên dưới trong trường ${uploaded.fieldName} của dữ liệu cấu trúc.`);
      } else {
        // Tài liệu (pdf/doc/docx/md/...): trích xuất text trước cho user review, rồi mới nhận dạng
        const extracted = await extractContentImportDocument(type, file);
        setExtraction(extracted);
        setShowImportDialog(false);
        setNotice(`Đã trích xuất văn bản từ "${extracted.fileName}". Kiểm tra nội dung bên dưới rồi bấm "Tự động nhận dạng sang xem trước".`);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return; // không setFile(null) lại hay setShowImportDialog(false) ở finally
      }
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowImportDialog(false);
    } catch (requestError) {
      setError(cleanErrorMessage(requestError));
    } finally {
      setProcessing(false);
    }
  }

  async function convertExtractionToPreview() {
    if (!extraction?.text) return;
    if (type === 'VOCABULARY' && vocabularyTarget === '__new__' && !newVocabularySetName.trim()) {
      setError('Nhập tên bộ từ vựng mới trước khi tiếp tục.');
      return;
    }
    const vocabularyDestination = type !== 'VOCABULARY' || vocabularyTarget === '__file__'
      ? {}
      : vocabularyTarget === '__new__'
        ? { vocabularySetName: newVocabularySetName.trim() }
        : { vocabularySetId: vocabularyTarget };
    setProcessing(true);
    setError('');
    setNotice('');
    try {
      const batch = await parseTextToContentImportPreview(type, {
        text: extraction.text,
        fileName: extraction.fileName,
        ...vocabularyDestination,
      });
      setDetails(batch);
      await refreshBatches();
      setNotice(`Đã tự động nhận dạng ${batch.batch.totalRecords.toLocaleString('vi-VN')} mục vào bản xem trước.`);
    } catch (requestError) {
      setError(cleanErrorMessage(requestError));
    } finally {
      setProcessing(false);
    }
  }

  const detail = details?.batch;
  const canPublish = detail?.status === 'PREVIEW' && detail.validCount > 0;
  const acceptedFileExtensions = acceptedExtensions(selectedType);
  const currentFileExtension = file ? extensionOf(file.name) : '';
  const isStructuredFile = STRUCTURED_EXTENSIONS.includes(currentFileExtension);
  const isMediaFile = selectedType.mediaExtensions.includes(currentFileExtension);

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Hệ thống / Dữ liệu</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">Nhập và publish nội dung</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Chọn định dạng theo lĩnh vực, trích xuất tài liệu hoặc tải media, rồi kiểm tra dữ liệu có cấu trúc trước khi publish.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800 sm:flex">
            <ShieldCheck size={16} aria-hidden="true" />
            Admin và giáo viên tạo preview · admin publish
          </div>
          <button
            type="button"
            disabled={processing}
            onClick={() => setShowImportDialog(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
          >
            <Upload size={16} aria-hidden="true" />
            Tạo lượt nhập
          </button>
        </div>
      </header>

      {/* Banner thông báo điều hướng cho Listening & Đề thi thử */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-linear-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-600/10 p-2 text-blue-700">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 sm:text-sm">Tạo trực tiếp Bài nghe và Đề thi thử</h4>
            <p className="mt-0.5 text-xs text-slate-600">
              Các bài nghe TOEIC Listening (Part 1–4, Chép chính tả) và Đề thi thử ETS hiện được tạo trực tiếp tại trang quản lý riêng biệt với trình biên soạn âm thanh &amp; đề thi chuyên dụng.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/admin/content/listening"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <Headphones size={14} className="text-blue-600" />
            Tạo bài nghe
          </Link>
          <Link
            href="/admin/content/mock-tests"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <FileText size={14} className="text-indigo-600" />
            Tạo đề thi thử
          </Link>
        </div>
      </div>

      {showImportDialog ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-import-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Bước 1 · Tải dữ liệu</p>
                <h2 id="create-import-title" className="mt-1 text-lg font-bold text-slate-900">Tạo bản xem trước</h2>
                <p className="mt-1 text-sm text-slate-500">Chọn loại nội dung và tải file tối đa 256 MB.</p>
              </div>
              <button
                type="button"
                aria-label="Đóng biểu mẫu nhập"
                disabled={processing}
                onClick={() => setShowImportDialog(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {error ? (
                <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p>{error}</p>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">Loại dữ liệu</span>
                  <select
                    value={type}
                    onChange={(event) => handleTypeChange(event.target.value as ImportedContentType)}
                    disabled={processing}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  >
                    {IMPORTABLE_CONTENT_TYPES.map((contentType) => (
                      <option key={contentType.id} value={contentType.id}>
                        {contentType.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">File</span>
                  <div className="flex h-11 items-center gap-3">
                    <label className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50">
                      <Upload size={15} aria-hidden="true" />
                      Upload
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptedFileExtensions.map((extension) => `.${extension}`).join(',')}
                        disabled={processing}
                        onChange={(event) => {
                          setFile(event.target.files?.[0] ?? null);
                          setError('');
                          setDetails(null);
                          setExtraction(null);
                          setMediaAsset(null);
                        }}
                        className="sr-only"
                      />
                    </label>
                    <span className="min-w-0 truncate text-xs text-slate-500">
                      {file ? file.name : 'Tối đa 256 MB'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông báo điều hướng cho Listening & Đề thi thử */}
              <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
                <p className="leading-relaxed">
                  <span className="font-semibold">Lưu ý:</span> Chức năng nhập cho <strong>Bài nghe (Listening)</strong> và <strong>Đề thi thử</strong> hiện được tạo trực tiếp tại module chính để kiểm duyệt âm thanh &amp; cấu trúc đề chuẩn.
                  <span className="ml-1 inline-flex gap-2 font-medium">
                    <Link href="/admin/content/listening" className="text-blue-700 underline hover:text-blue-800">
                      Đến Quản lý Listening →
                    </Link>
                    <Link href="/admin/content/mock-tests" className="text-blue-700 underline hover:text-blue-800">
                      Đến Quản lý Đề thi thử →
                    </Link>
                  </span>
                </p>
              </div>

              {type === 'VOCABULARY' ? (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <label className="block text-xs font-semibold text-slate-700" htmlFor="vocabulary-import-target">
                    Bộ từ vựng đích
                  </label>
                  <select
                    id="vocabulary-import-target"
                    value={vocabularyTarget}
                    onChange={(event) => {
                      setVocabularyTarget(event.target.value);
                      setError('');
                    }}
                    disabled={processing}
                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  >
                    <option value="__file__">Dùng setId/topic có trong file</option>
                    {vocabularySets.map((set) => (
                      <option key={set.id} value={set.id}>
                        {set.title || set.name || set.id} ({set.id})
                      </option>
                    ))}
                    <option value="__new__">Tạo bộ từ vựng mới</option>
                  </select>
                  {vocabularyTarget === '__new__' ? (
                    <label className="mt-3 block text-xs font-semibold text-slate-700" htmlFor="new-vocabulary-set-name">
                      Tên bộ từ vựng mới
                      <input
                        id="new-vocabulary-set-name"
                        value={newVocabularySetName}
                        onChange={(event) => setNewVocabularySetName(event.target.value)}
                        maxLength={255}
                        disabled={processing}
                        placeholder="Ví dụ: TOEIC chủ đề văn phòng"
                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                      />
                    </label>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadSample(type, 'json')}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <FileJson2 size={14} aria-hidden="true" />
                  Mẫu JSON
                </button>
                <button
                  type="button"
                  onClick={() => downloadSample(type, 'csv')}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <FileSpreadsheet size={14} aria-hidden="true" />
                  Mẫu CSV
                </button>
                <button
                  type="button"
                  disabled={!file || processing}
                  onClick={() => void processFile()}
                  className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing ? (
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Upload size={16} aria-hidden="true" />
                  )}
                  {processing ? 'Đang xử lý…' : isMediaFile ? 'Tải media' : isStructuredFile ? 'Xem trước' : 'Trích xuất'}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {error && !showImportDialog ? (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {notice ? (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>{notice}</p>
        </div>
      ) : null}

      {extraction ? (
        <section className="rounded-2xl border border-sky-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Văn bản trích xuất · {extraction.fileName}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Hãy rà soát và chuẩn hóa thành các trường bắt buộc trước khi import.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => downloadExtraction(extraction)}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowDownToLine size={14} aria-hidden="true" />
                Tải JSON nháp
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => void convertExtractionToPreview()}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Sparkles size={14} aria-hidden="true" />}
                Tự động nhận dạng sang xem trước
              </button>
            </div>
          </div>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-700">
            {extraction.text || 'Không trích xuất được văn bản.'}
          </pre>
        </section>
      ) : null}

      {mediaAsset ? (
        <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs">
          <h2 className="font-semibold text-slate-900">Media đã lưu trên Object Storage</h2>
          <p className="mt-1 break-all text-sm text-blue-700">
            <a href={mediaAsset.url} target="_blank" rel="noreferrer">
              {mediaAsset.url}
            </a>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Dùng URL trong trường {mediaAsset.fieldName} của dữ liệu cấu trúc.
          </p>
        </section>
      ) : null}

      <section className="grid gap-5 2xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.7fr)]">
        <div className="min-w-0 space-y-4">
          {details ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold text-slate-900">{details.batch.fileName}</h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {CONTENT_TYPES.find((entry) => entry.id === details.batch.contentType)?.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(details.batch.createdAt)} · {statusLabel(details.batch.status)}
                  </p>
                </div>
                {canPublish ? (
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => setConfirmPublish(true)}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {processing ? <LoaderCircle size={16} className="animate-spin" /> : <Database size={16} />}
                    Publish {details.batch.validCount.toLocaleString('vi-VN')} dòng
                  </button>
                ) : null}
              </header>

              <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
                {[
                  { label: 'Tổng dòng', value: details.batch.totalRecords, tone: 'text-slate-900' },
                  {
                    label: 'Hợp lệ',
                    value: details.batch.status === 'PREVIEW' ? details.batch.validCount : details.batch.publishedCount,
                    tone: 'text-emerald-700',
                  },
                  { label: 'Lỗi', value: details.batch.invalidCount, tone: 'text-red-700' },
                  { label: 'Trùng', value: details.batch.duplicateCount, tone: 'text-amber-700' },
                ].map((metric) => (
                  <div key={metric.label} className="bg-white px-4 py-3">
                    <p className="text-xs text-slate-500">{metric.label}</p>
                    <p className={`mt-1 text-xl font-bold ${metric.tone}`}>
                      {metric.value.toLocaleString('vi-VN')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Thanh lọc & tìm kiếm */}
              <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">Tìm trong bản xem trước</span>
                  <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={previewSearch}
                    onChange={(event) => setPreviewSearch(event.target.value)}
                    placeholder="Tìm từ, nghĩa, nội dung, lỗi..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Trạng thái</span>
                  <select
                    value={previewStatus}
                    onChange={(event) => setPreviewStatus(event.target.value as PreviewStatusFilter)}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="VALID">Hợp lệ</option>
                    <option value="INVALID">Lỗi</option>
                    <option value="DUPLICATE">Trùng</option>
                    <option value="PUBLISHED">Đã publish</option>
                  </select>
                </label>
                <span className="text-xs text-slate-500 sm:text-right">
                  {filteredPreviewItems.length.toLocaleString('vi-VN')} / {details.items.length.toLocaleString('vi-VN')} dòng
                </span>
                {details.hasMore && (previewSearch.trim() || previewStatus !== 'ALL') ? (
                  <button
                    type="button"
                    disabled={loadingDetails}
                    onClick={() => void loadAllRows()}
                    className="text-left text-xs font-semibold text-blue-700 underline disabled:opacity-50"
                  >
                    {loadingDetails ? 'Đang tải...' : 'Tải toàn bộ'}
                  </button>
                ) : null}
              </div>

              {/* RENDER BẢN XEM TRƯỚC PHÂN THEO LOẠI NỘI DUNG */}
              {details.batch.contentType === 'VOCABULARY' ? (
                <VocabularyPreviewList
                  items={filteredPreviewItems}
                  fileName={details.batch.fileName}
                  totalRecords={details.batch.totalRecords}
                  batchId={details.batch.id}
                  editable={['PREVIEW', 'NO_VALID_ROWS'].includes(details.batch.status)}
                  onBatchUpdated={(updated) => void handlePreviewItemsUpdated(updated)}
                />
              ) : details.batch.contentType === 'GRAMMAR' ? (
                <GrammarPreviewList
                  items={filteredPreviewItems}
                  fileName={details.batch.fileName}
                  totalRecords={details.batch.totalRecords}
                  batchId={details.batch.id}
                  editable={['PREVIEW', 'NO_VALID_ROWS'].includes(details.batch.status)}
                  onBatchUpdated={(updated) => void handlePreviewItemsUpdated(updated)}
                />
              ) : details.batch.contentType === 'READING' ? (
                <ReadingPreviewList
                  items={filteredPreviewItems}
                  fileName={details.batch.fileName}
                  totalRecords={details.batch.totalRecords}
                  batchId={details.batch.id}
                  editable={['PREVIEW', 'NO_VALID_ROWS'].includes(details.batch.status)}
                  onBatchUpdated={(updated) => void handlePreviewItemsUpdated(updated)}
                />
              ) : (
                <GenericPreviewTable items={filteredPreviewItems} />
              )}
            </section>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Upload size={32} className="mx-auto text-slate-400" />
              <h3 className="mt-3 text-sm font-bold text-slate-800">Chưa chọn lượt import nào</h3>
              <p className="mt-1 text-xs text-slate-500">
                Hãy bấm &quot;Tạo lượt nhập&quot; hoặc chọn một lượt từ lịch sử bên phải để kiểm tra dữ liệu.
              </p>
            </div>
          )}
        </div>

        {/* Lịch sử import */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Lịch sử import</h3>
              <button
                type="button"
                onClick={() => void refreshBatches()}
                disabled={loadingHistory}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                title="Làm mới"
              >
                <RefreshCw size={14} className={loadingHistory ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-[600px] overflow-y-auto">
              {batches.map((batch) => {
                const isSelected = details?.batch.id === batch.id;
                const isPublished = batch.status === 'PUBLISHED' || batch.status === 'PARTIAL';
                return (
                  <div
                    key={batch.id}
                    className={`group relative flex items-center justify-between rounded-xl transition ${
                      isSelected
                        ? 'border border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => void openBatch(batch.id)}
                      className="min-w-0 flex-1 p-3 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{batch.fileName}</p>
                        <span
                          className={`shrink-0 text-[10px] font-semibold ${
                            isPublished ? 'text-emerald-700' : 'text-blue-600'
                          }`}
                        >
                          {statusLabel(batch.status)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{CONTENT_TYPES.find((t) => t.id === batch.contentType)?.label}</span>
                        <span>•</span>
                        <span>{batch.totalRecords} dòng</span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400">{formatDate(batch.createdAt)}</p>
                    </button>

                    {/* Nút Xóa lượt nhập (Chỉ cho phép xóa khi chưa Publish) */}
                    <div className="pr-3 shrink-0">
                      {!isPublished ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBatchToDelete(batch);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 opacity-80 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                          title="Xóa lượt nhập chưa publish này"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold text-slate-400"
                          title="Lô đã publish không thể xóa"
                        >
                          Đã lưu
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {batches.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">Chưa có lượt nhập nào.</p>
              ) : null}
            </div>
          </div>
        </aside>
      </section>

      {/* Dialog xác nhận xóa lượt nhập */}
      {batchToDelete ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900">Xác nhận xóa lượt nhập</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Bạn có chắc chắn muốn xóa lượt nhập <strong>&quot;{batchToDelete.fileName}&quot;</strong> ({statusLabel(batchToDelete.status)})?
              Thao tác này sẽ xóa toàn bộ dữ liệu xem trước của lượt nhập này.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={deletingBatch}
                onClick={() => setBatchToDelete(null)}
                className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deletingBatch}
                onClick={() => void handleDeleteBatch()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingBatch ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deletingBatch ? 'Đang xóa…' : 'Xóa ngay'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Dialog xác nhận publish */}
      {confirmPublish && details ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-slate-900">Xác nhận publish nội dung</h4>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Bạn đang chuẩn bị publish <strong>{details.batch.validCount}</strong> dòng hợp lệ từ file{' '}
              <strong>{details.batch.fileName}</strong> vào hệ thống học tập. Dữ liệu sau khi publish sẽ có hiệu lực
              ngay cho người học.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmPublish(false)}
                disabled={processing}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => void publishBatch()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
              >
                {processing ? <LoaderCircle size={15} className="animate-spin" /> : <Database size={15} />}
                {processing ? 'Đang lưu…' : 'Xác nhận Publish'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
