'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  Clock3,
  Database,
  FileJson2,
  FileSpreadsheet,
  FileUp,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import {
  getContentImportBatch,
  listContentImportBatches,
  previewContentImport,
  publishContentImport,
  type ImportBatchDetails,
  type ImportBatchSummary,
  type ImportedContentType,
} from '@/lib/api/content-import';

const CONTENT_TYPES: {
  id: ImportedContentType;
  label: string;
  required: string;
  sample: Record<string, unknown>;
}[] = [
  {
    id: 'VOCABULARY',
    label: 'Từ vựng',
    required: 'word, meaning',
    sample: { word: 'schedule', meaning: 'a plan of activities', pos: 'noun', ipa: '/ˈskedʒuːl/', exampleEn: 'Check the schedule.', exampleVi: 'Kiểm tra lịch trình.', synonyms: ['timetable'], level: 'EASY' },
  },
  {
    id: 'GRAMMAR',
    label: 'Ngữ pháp',
    required: 'title, rule, explanation',
    sample: { title: 'Present Simple', rule: 'S + V(s/es)', explanation: 'Diễn tả thói quen hoặc sự thật.', part: 'PART_5', examples: ['She works every day.'] },
  },
  {
    id: 'LISTENING',
    label: 'Listening',
    required: 'title, part, transcript, audioUrl',
    sample: { title: 'Office announcement', part: 'PART_4', transcript: 'Attention, passengers...', audioUrl: 'https://example.com/audio.mp3', durationSeconds: 45, difficulty: 'MEDIUM' },
  },
  {
    id: 'READING',
    label: 'Reading',
    required: 'title, content',
    sample: { title: 'Office notice', part: 'PART_7', content: 'The office will be closed...', topic: 'Workplace', difficulty: 'EASY', source: 'Practice set' },
  },
  {
    id: 'QUESTION',
    label: 'Câu hỏi',
    required: 'part, questionText, options, correctAnswer, explanation, skill, difficulty',
    sample: { part: 'PART_5', questionText: 'The manager ____ the report.', options: [{ id: 'A', text: 'review' }, { id: 'B', text: 'reviews' }, { id: 'C', text: 'reviewing' }, { id: 'D', text: 'reviewed' }], correctAnswer: 'B', explanation: 'The singular subject takes reviews.', skill: 'Grammar', difficulty: 'EASY' },
  },
  {
    id: 'MOCK_TEST',
    label: 'Đề thi thử',
    required: 'title, description, durationMinutes, questionCodes',
    sample: { title: 'TOEIC Practice Test 01', description: 'Practice test for Parts 1–7.', durationMinutes: 120, questionCodes: ['P1-001', 'P5-001'] },
  },
];

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function statusLabel(status: ImportBatchSummary['status']) {
  switch (status) {
    case 'PREVIEW': return 'Chờ publish';
    case 'PUBLISHED': return 'Đã publish';
    case 'PARTIAL': return 'Đã publish một phần';
    case 'NO_VALID_ROWS': return 'Không có dòng hợp lệ';
  }
}

function itemStatus(status: string) {
  if (status === 'VALID') return { label: 'Hợp lệ', classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
  if (status === 'PUBLISHED') return { label: 'Đã publish', classes: 'border-blue-200 bg-blue-50 text-blue-700' };
  if (status === 'DUPLICATE') return { label: 'Trùng lặp', classes: 'border-amber-200 bg-amber-50 text-amber-700' };
  return { label: 'Lỗi dữ liệu', classes: 'border-red-200 bg-red-50 text-red-700' };
}

function displayName(item: ImportBatchDetails['items'][number]) {
  const data = item.normalizedData ?? {};
  const headline = data.word ?? data.title ?? data.questionText;
  return typeof headline === 'string' && headline.trim() ? headline : `Dòng ${item.rowNumber}`;
}

function downloadSample(type: ImportedContentType, format: 'json' | 'csv') {
  const definition = CONTENT_TYPES.find((contentType) => contentType.id === type);
  if (!definition) return;
  const sample = definition.sample;
  let content: string;
  let mimeType: string;
  let extension: string;
  if (format === 'json') {
    content = JSON.stringify({ items: [sample] }, null, 2);
    mimeType = 'application/json;charset=utf-8';
    extension = 'json';
  } else {
    const headers = Object.keys(sample);
    const cells = headers.map((header) => {
      const value = sample[header];
      const cell = typeof value === 'object' ? JSON.stringify(value) : String(value);
      return `"${cell.replace(/"/g, '""')}"`;
    });
    content = `${headers.join(',')}\r\n${cells.join(',')}\r\n`;
    mimeType = 'text/csv;charset=utf-8';
    extension = 'csv';
  }
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `mau-import-${type.toLowerCase()}.${extension}`;
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
  const [file, setFile] = useState<File | null>(null);
  const [batches, setBatches] = useState<ImportBatchSummary[]>([]);
  const [details, setDetails] = useState<ImportBatchDetails | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const selectedType = useMemo(
    () => CONTENT_TYPES.find((contentType) => contentType.id === type)!,
    [type],
  );

  const refreshBatches = useCallback(async () => {
    try {
      setBatches(await listContentImportBatches());
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể tải lịch sử import.');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshBatches(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshBatches]);

  async function createPreview() {
    if (!file) {
      setError('Chọn file CSV, XLSX hoặc JSON trước khi tiếp tục.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('File không được vượt quá 10 MB.');
      return;
    }
    setProcessing(true);
    setError('');
    setNotice('');
    try {
      const result = await previewContentImport(type, file);
      setDetails(result);
      setFile(null);
      await refreshBatches();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể tạo bản xem trước.');
    } finally {
      setProcessing(false);
    }
  }

  async function openBatch(batchId: string) {
    setLoadingDetails(true);
    setDetails(null);
    setError('');
    setNotice('');
    try {
      setDetails(await getContentImportBatch(batchId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể tải chi tiết lô import.');
    } finally {
      setLoadingDetails(false);
    }
  }

  async function loadMoreRows() {
    if (!details?.hasMore || loadingDetails) return;
    setLoadingDetails(true);
    setError('');
    try {
      const next = await getContentImportBatch(details.batch.id, details.offset + details.items.length);
      setDetails((current) => current && current.batch.id === next.batch.id
        ? { ...next, items: [...current.items, ...next.items] }
        : next);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể tải thêm dòng xem trước.');
    } finally {
      setLoadingDetails(false);
    }
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
      setNotice(`Đã publish ${updated.batch.publishedCount.toLocaleString('vi-VN')} dòng hợp lệ. Các dòng lỗi hoặc trùng được giữ lại và bỏ qua.`);
      await refreshBatches();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể publish dữ liệu.');
    } finally {
      setProcessing(false);
      setConfirmPublish(false);
    }
  }

  function handleTypeChange(nextType: ImportedContentType) {
    setType(nextType);
    setDetails(null);
    setError('');
    setNotice('');
  }

  const detail = details?.batch;
  const canPublish = detail?.status === 'PREVIEW' && detail.validCount > 0;

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Hệ thống / Dữ liệu</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">Nhập và publish nội dung</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Tải file, xem trước dữ liệu đã chuẩn hóa, kiểm tra lỗi/trùng lặp rồi publish các dòng hợp lệ.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800 lg:self-auto">
          <ShieldCheck size={16} aria-hidden="true" />
          Chỉ quản trị viên được import và publish
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileUp size={19} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">Tạo bản xem trước</h2>
              <p className="mt-1 text-sm text-slate-500">CSV, XLSX hoặc JSON · tối đa 10 MB và 5.000 dòng.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Loại dữ liệu</span>
              <select value={type} onChange={(event) => handleTypeChange(event.target.value as ImportedContentType)}
                disabled={processing}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50">
                {CONTENT_TYPES.map((contentType) => <option key={contentType.id} value={contentType.id}>{contentType.label}</option>)}
              </select>
            </label>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">File dữ liệu</span>
              <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-sm text-slate-600 transition hover:border-blue-400 hover:bg-blue-50/50">
                <Upload size={16} className="shrink-0 text-blue-600" aria-hidden="true" />
                <span className="min-w-0 truncate">{file ? file.name : 'Chọn file CSV, XLSX hoặc JSON'}</span>
                <input type="file" accept=".csv,.xlsx,.json,application/json,text/csv" disabled={processing}
                  onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null);
                    setError('');
                    setDetails(null);
                  }}
                  className="sr-only" />
              </label>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold text-slate-800">Trường bắt buộc: <code className="font-medium text-blue-700">{selectedType.required}</code></p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Mảng trong CSV/XLSX dùng JSON hoặc phân tách bằng dấu |; mảng lựa chọn của câu hỏi phải dùng JSON.
              XLSX đọc sheet đầu tiên và dùng hàng đầu làm tên cột.
            </p>
            {type === 'MOCK_TEST' ? <p className="mt-1 text-xs font-medium text-amber-700">Các mã trong questionCodes phải thuộc câu hỏi đã publish trước đó.</p> : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => downloadSample(type, 'json')}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <FileJson2 size={15} aria-hidden="true" />Tải mẫu JSON
            </button>
            <button type="button" onClick={() => downloadSample(type, 'csv')}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <FileSpreadsheet size={15} aria-hidden="true" />Tải mẫu CSV
            </button>
            <button type="button" disabled={!file || processing} onClick={() => void createPreview()}
              className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {processing ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}
              {processing ? 'Đang xử lý…' : 'Xem trước & kiểm tra'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={19} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">Luồng xử lý an toàn</h2>
              <p className="mt-1 text-sm text-slate-500">Không ghi nội dung chính thức trước bước publish.</p>
            </div>
          </div>
          <ol className="mt-5 space-y-3">
            {[
              ['01', 'Nhập file', 'CSV, XLSX hoặc JSON theo mẫu của loại dữ liệu đã chọn.'],
              ['02', 'Validate & chuẩn hóa', 'Kiểm tra trường bắt buộc, format, URL, lựa chọn và chuẩn hóa khoảng trắng/Part.'],
              ['03', 'Phát hiện trùng', 'So sánh bản ghi trong file và nội dung đã publish; không tự ghi đè.'],
              ['04', 'Publish hợp lệ', 'Chỉ dòng hợp lệ, không trùng mới được ghi vào kho nội dung.'],
            ].map(([number, title, description]) => (
              <li key={number} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">{number}</span>
                <div><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p></div>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            Publish một phần được phép: dòng lỗi/trùng bị bỏ qua, không chặn các dòng hợp lệ.
          </div>
        </div>
      </section>

      {error ? <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" /><p>{error}</p></div> : null}
      {notice ? <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0" aria-hidden="true" /><p>{notice}</p></div> : null}

      <section className="grid gap-5 2xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.7fr)]">
        <div className="min-w-0 space-y-4">
          {details ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold text-slate-900">{details.batch.fileName}</h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{CONTENT_TYPES.find((entry) => entry.id === details.batch.contentType)?.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(details.batch.createdAt)} · {statusLabel(details.batch.status)}</p>
                </div>
                {canPublish ? (
                  <button type="button" disabled={processing} onClick={() => setConfirmPublish(true)}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                    {processing ? <LoaderCircle size={16} className="animate-spin" /> : <Database size={16} />}
                    Publish {details.batch.validCount.toLocaleString('vi-VN')} dòng
                  </button>
                ) : null}
              </header>
              <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
                {[
                  { label: 'Tổng dòng', value: details.batch.totalRecords, tone: 'text-slate-900' },
                  { label: 'Hợp lệ', value: details.batch.status === 'PREVIEW' ? details.batch.validCount : details.batch.publishedCount, tone: 'text-emerald-700' },
                  { label: 'Lỗi', value: details.batch.invalidCount, tone: 'text-red-700' },
                  { label: 'Trùng', value: details.batch.duplicateCount, tone: 'text-amber-700' },
                ].map((metric) => (
                  <div key={metric.label} className="bg-white px-4 py-3">
                    <p className="text-xs text-slate-500">{metric.label}</p>
                    <p className={`mt-1 text-xl font-bold ${metric.tone}`}>{metric.value.toLocaleString('vi-VN')}</p>
                  </div>
                ))}
              </div>

              {details.items.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      <tr><th className="px-4 py-3">Dòng</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Dữ liệu chuẩn hóa</th><th className="px-4 py-3">Lỗi / cảnh báo</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {details.items.map((item) => {
                        const status = itemStatus(item.status);
                        return (
                          <tr key={item.id} className="align-top">
                            <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-slate-500">{item.rowNumber}</td>
                            <td className="px-4 py-3"><span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.classes}`}>{status.label}</span></td>
                            <td className="max-w-[340px] px-4 py-3">
                              <p className="truncate text-sm font-medium text-slate-800">{displayName(item)}</p>
                              <details className="mt-1">
                                <summary className="cursor-pointer text-xs font-medium text-blue-700">Xem dữ liệu</summary>
                                <pre className="mt-2 max-h-52 overflow-auto rounded-lg bg-slate-50 p-2 text-[11px] leading-5 text-slate-700">{JSON.stringify(item.normalizedData, null, 2)}</pre>
                              </details>
                            </td>
                            <td className="max-w-[300px] px-4 py-3">
                              {item.errors.length ? <ul className="space-y-1 text-xs leading-5 text-red-700">{item.errors.map((itemError) => <li key={itemError}>• {itemError}</li>)}</ul>
                                : item.status === 'DUPLICATE' ? <p className="text-xs leading-5 text-amber-700">{item.duplicateOfContentId ? 'Đã tồn tại trong kho nội dung.' : 'Trùng với một dòng khác trong cùng file.'}</p>
                                  : <span className="text-xs text-slate-400">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : <p className="px-5 py-8 text-center text-sm text-slate-500">{loadingDetails ? 'Đang tải chi tiết…' : 'Không có dòng xem trước.'}</p>}
              {details.hasMore ? (
                <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">Đang hiển thị {details.items.length} trên {details.batch.totalRecords} dòng.</p>
                  <button type="button" disabled={loadingDetails} onClick={() => void loadMoreRows()} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                    {loadingDetails ? <LoaderCircle size={14} className="animate-spin" /> : null}
                    Tải thêm 100 dòng
                  </button>
                </div>
              ) : null}
            </section>
          ) : (
            <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
              {loadingDetails ? <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" /> : <FileSpreadsheet className="h-8 w-8 text-slate-300" aria-hidden="true" />}
              <h2 className="mt-3 text-sm font-semibold text-slate-800">{loadingDetails ? 'Đang tải bản xem trước' : 'Chưa có bản xem trước được chọn'}</h2>
              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Tải file lên để kiểm tra dữ liệu hoặc chọn một lô trong lịch sử import.</p>
            </section>
          )}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Lịch sử import</h2>
              <p className="mt-1 text-xs text-slate-500">30 lô gần nhất</p>
            </div>
            <button type="button" aria-label="Tải lại lịch sử import" onClick={() => { setLoadingHistory(true); void refreshBatches(); }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
              <RefreshCw size={16} aria-hidden="true" />
            </button>
          </div>
          {loadingHistory ? (
            <p role="status" className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin" />Đang tải lịch sử…</p>
          ) : batches.length ? (
            <ul className="max-h-[640px] divide-y divide-slate-100 overflow-y-auto custom-scrollbar">
              {batches.map((batch) => (
                <li key={batch.id}>
                  <button type="button" onClick={() => void openBatch(batch.id)}
                    className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${details?.batch.id === batch.id ? 'bg-blue-50/70' : ''}`}>
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-800">{batch.fileName}</span>
                        <span className="mt-1 block text-xs text-slate-500">{CONTENT_TYPES.find((entry) => entry.id === batch.contentType)?.label} · {batch.totalRecords} dòng</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${batch.status === 'PREVIEW' ? 'bg-blue-50 text-blue-700' : batch.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : batch.status === 'PARTIAL' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{statusLabel(batch.status)}</span>
                    </span>
                    <span className="mt-2 flex items-center gap-1 text-[11px] text-slate-400"><Clock3 size={12} aria-hidden="true" />{formatDate(batch.createdAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-12 text-center">
              <FileJson2 size={26} className="mx-auto text-slate-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-slate-700">Chưa có lô import</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Các lần tải file sẽ xuất hiện tại đây.</p>
            </div>
          )}
        </aside>
      </section>

      {confirmPublish && details ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="publish-confirm-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="publish-confirm-title" className="text-lg font-bold text-slate-900">Xác nhận publish dữ liệu</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sẽ publish {details.batch.validCount.toLocaleString('vi-VN')} dòng hợp lệ từ <strong>{details.batch.fileName}</strong>.
                  {details.batch.invalidCount + details.batch.duplicateCount > 0
                    ? ` ${details.batch.invalidCount + details.batch.duplicateCount} dòng lỗi hoặc trùng sẽ bị bỏ qua.`
                    : ''}
                </p>
              </div>
              <button type="button" aria-label="Đóng xác nhận" onClick={() => setConfirmPublish(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmPublish(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
              <button type="button" disabled={processing} onClick={() => void publishBatch()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                {processing ? <LoaderCircle size={15} className="animate-spin" /> : <ArrowDownToLine size={15} />}
                Xác nhận publish
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
