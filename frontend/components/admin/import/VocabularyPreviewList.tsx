'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  Volume2,
  X,
} from 'lucide-react';
import {
  addVocabularyPreviewItem,
  deleteVocabularyPreviewItem,
  resolveVocabularyPreviewDuplicate,
  updateVocabularyPreviewItem,
  uploadContentImportAsset,
  type ImportBatchDetails,
} from '@/lib/api/content-import';
import {
  firstText,
  normalizePartOfSpeech,
  partOfSpeechLabel,
  textList,
} from './utils';

export function VocabularyPreviewList({
  items,
  fileName,
  totalRecords,
  batchId,
  editable,
  onBatchUpdated,
}: {
  items: ImportBatchDetails['items'];
  fileName: string;
  totalRecords: number;
  batchId: string;
  editable: boolean;
  onBatchUpdated: (batch: ImportBatchDetails) => void;
}) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [form, setForm] = useState({
    word: '',
    meaning: '',
    ipa: '',
    partOfSpeech: 'Verb',
    level: '',
    exampleEn: '',
    exampleVi: '',
    topic: '',
    subCategory: '',
    wordFamily: '',
    audioUrl: '',
    synonyms: '',
    antonyms: '',
  });
  const [editingSenses, setEditingSenses] = useState<
    { partOfSpeech: string; subCategory?: string; meaning: string; example?: string }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [editError, setEditError] = useState('');
  const [dictionarySuggestion, setDictionarySuggestion] = useState<{ word: string; meanings: string[]; ipa: string } | null>(null);
  const [dictionaryLoadingWord, setDictionaryLoadingWord] = useState('');
  const [dictionaryError, setDictionaryError] = useState<{ word: string; message: string } | null>(null);
  const [pendingDuplicate, setPendingDuplicate] = useState<ImportBatchDetails['items'][number] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ImportBatchDetails['items'][number] | null>(null);

  useEffect(() => {
    const word = form.word.trim();
    if (editingItemId !== 'new' || word.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setDictionaryLoadingWord(word);
      setDictionarySuggestion((current) => current?.word === word ? current : null);
      setDictionaryError(null);
      try {
        const dictionaryResponse = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
          { signal: controller.signal },
        );
        if (!dictionaryResponse.ok) {
          if (dictionaryResponse.status === 404) {
            setDictionaryError({ word, message: 'Không tìm thấy từ này trong từ điển.' });
            return;
          }
          throw new Error('Dịch vụ từ điển hiện không khả dụng.');
        }

        const entries: {
          phonetic?: string;
          phonetics?: { text?: string }[];
          meanings?: { definitions?: { definition?: string }[] }[];
        }[] = await dictionaryResponse.json();
        const entry = entries[0];
        const ipa = entry?.phonetic
          || entry?.phonetics?.find((phonetic) => phonetic.text)?.text
          || '';
        const englishMeanings = entry?.meanings
          ?.flatMap((meaning) => meaning.definitions ?? [])
          .map((definition) => definition.definition?.trim())
          .filter((definition): definition is string => Boolean(definition))
          .slice(0, 3) ?? [];
        const translatedMeanings = await Promise.all(englishMeanings.map(async (englishMeaning) => {
          const translationResponse = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishMeaning)}&langpair=en%7Cvi`,
            { signal: controller.signal },
          );
          if (!translationResponse.ok) return '';
          const translation: { responseData?: { translatedText?: string } } = await translationResponse.json();
          return translation.responseData?.translatedText?.trim() ?? '';
        }));
        const vietnameseMeanings = translatedMeanings.filter(Boolean);

        if (!ipa && vietnameseMeanings.length === 0) {
          setDictionaryError({ word, message: 'Từ điển không có gợi ý nghĩa hoặc phiên âm cho từ này.' });
          return;
        }
        setDictionarySuggestion({ word, meanings: vietnameseMeanings, ipa });
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setDictionaryError({
          word,
          message: requestError instanceof Error ? requestError.message : 'Không thể lấy gợi ý từ điển.',
        });
      } finally {
        if (!controller.signal.aborted) setDictionaryLoadingWord('');
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [editingItemId, form.word]);

  function startAdding() {
    setEditingItemId('new');
    setEditingSenses([]);
    setForm({
      word: '', meaning: '', ipa: '', partOfSpeech: 'Verb', level: 'B2',
      exampleEn: '', exampleVi: '', topic: '', subCategory: '', wordFamily: '', audioUrl: '', synonyms: '', antonyms: '',
    });
    setEditError('');
    setDictionarySuggestion(null);
    setDictionaryError(null);
  }

  function startEditing(item: ImportBatchDetails['items'][number]) {
    const data = item.normalizedData ?? {};
    const raw = item.rawData ?? {};
    const rawSenses = Array.isArray(data.senses) ? data.senses : Array.isArray(raw.senses) ? raw.senses : [];
    setEditingSenses(rawSenses.flatMap((value) => {
      if (!value || typeof value !== 'object') return [];
      const sense = value as Record<string, unknown>;
      const partOfSpeech = firstText(sense.partOfSpeech, sense.part_of_speech, sense.pos);
      const meaning = firstText(sense.meaning, sense.meaningVi, sense.meaning_vi);
      if (!partOfSpeech || !meaning) return [];
      return [{
        partOfSpeech,
        subCategory: firstText(sense.subCategory, sense.sub_category),
        meaning,
        example: firstText(sense.example, sense.exampleEn, sense.example_en),
      }];
    }));
    const rawExamples = Array.isArray(raw.examples) ? raw.examples[0]
      : Array.isArray(data.examples) ? data.examples[0]
      : undefined;
    const exampleData = rawExamples && typeof rawExamples === 'object'
      ? rawExamples as Record<string, unknown>
      : {};
    setEditingItemId(item.id);
    setForm({
      word: firstText(data.word, raw.word) ?? '',
      meaning: firstText(data.meaning, raw.meaning, raw.meaningVi, data.meaningVi) ?? '',
      ipa: firstText(data.ipa, raw.ipa) ?? '',
      partOfSpeech: normalizePartOfSpeech(
        firstText(data.pos, data.partOfSpeech, raw.pos, raw.partOfSpeech),
      ),
      level: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(firstText(data.level, raw.level) ?? '')
        ? firstText(data.level, raw.level)!
        : 'B2',
      exampleEn: firstText(data.exampleEn, data.example, raw.exampleEn, raw.example,
        exampleData.sentenceEn, exampleData.sentence) ?? '',
      exampleVi: firstText(data.exampleVi, raw.exampleVi, exampleData.sentenceVi,
        exampleData.translation) ?? '',
      topic: firstText(data.topic, data.category, raw.topic, raw.category, raw.themeEn,
        raw.tag) ?? '',
      subCategory: firstText(data.subCategory, data.sub_category, raw.subCategory, raw.sub_category,
        rawSenses[0] && typeof rawSenses[0] === 'object'
          ? (rawSenses[0] as Record<string, unknown>).subCategory
            ?? (rawSenses[0] as Record<string, unknown>).sub_category
          : undefined) ?? '',
      wordFamily: firstText(data.wordFamily, data.word_family, raw.wordFamily, raw.word_family) ?? '',
      audioUrl: firstText(data.audioUrl, raw.audioUrl) ?? '',
      synonyms: textList(data.synonyms ?? raw.synonyms).join(', '),
      antonyms: textList(data.antonyms ?? raw.antonyms).join(', '),
    });
    setEditError('');
    setDictionarySuggestion(null);
    setDictionaryError(null);
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingItemId) return;
    setSaving(true);
    setEditError('');
    const payload: Record<string, unknown> = {
      word: form.word,
      meaning: form.meaning,
      ipa: form.ipa,
      partOfSpeech: form.partOfSpeech,
      level: form.level,
      exampleEn: form.exampleEn,
      exampleVi: form.exampleVi,
      topic: form.topic,
      subCategory: form.subCategory,
      wordFamily: form.wordFamily,
      audioUrl: form.audioUrl,
      synonyms: form.synonyms.split(/[,|]/).map((value) => value.trim()).filter(Boolean),
      antonyms: form.antonyms.split(/[,|]/).map((value) => value.trim()).filter(Boolean),
    };
    if (editingSenses.length > 0) {
      payload.senses = editingSenses.map((sense, index) => index === 0
        ? {
            ...sense,
            partOfSpeech: form.partOfSpeech,
            subCategory: form.subCategory,
            meaning: form.meaning,
            example: form.exampleEn,
          }
        : sense);
    }
    if (editingItemId === 'new') {
      const inheritedTarget = items
        .map((item) => item.normalizedData ?? item.rawData ?? {})
        .find((data) => ['setId', 'set_id', 'topic', 'category', 'setName'].some((field) => {
          const value = data[field];
          return typeof value === 'string' && value.trim().length > 0;
        }));
      if (inheritedTarget) {
        if (inheritedTarget.setId) payload.setId = inheritedTarget.setId;
        if (inheritedTarget.set_id) payload.setId = inheritedTarget.set_id;
        if (inheritedTarget.setName) payload.setName = inheritedTarget.setName;
        if (!payload.topic && inheritedTarget.topic) payload.topic = inheritedTarget.topic;
        if (!payload.topic && inheritedTarget.category) payload.topic = inheritedTarget.category;
      }
    }
    try {
      const updated = editingItemId === 'new'
        ? await addVocabularyPreviewItem(batchId, payload)
        : await updateVocabularyPreviewItem(batchId, editingItemId, payload);
      onBatchUpdated(updated);
      setEditingItemId(null);
    } catch (requestError) {
      setEditError(requestError instanceof Error ? requestError.message : 'Không thể lưu dòng từ vựng.');
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(itemId: string) {
    setSaving(true);
    setEditError('');
    try {
      const updated = await deleteVocabularyPreviewItem(batchId, itemId);
      onBatchUpdated(updated);
      setPendingDelete(null);
      if (editingItemId === itemId) setEditingItemId(null);
    } catch (requestError) {
      setEditError(requestError instanceof Error ? requestError.message : 'Không thể xóa dòng.');
    } finally {
      setSaving(false);
    }
  }

  async function resolveDuplicate(itemId: string, resolution: 'ADD_MEANING' | 'CREATE_NEW') {
    setSaving(true);
    setEditError('');
    try {
      const updated = await resolveVocabularyPreviewDuplicate(batchId, itemId, resolution);
      onBatchUpdated(updated);
      setPendingDuplicate(null);
    } catch (requestError) {
      setEditError(requestError instanceof Error ? requestError.message : 'Không thể cập nhật xử lý trùng.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAudioUpload(file: File) {
    setUploadingAudio(true);
    setEditError('');
    try {
      const uploaded = await uploadContentImportAsset('VOCABULARY', file);
      setForm((current) => ({ ...current, audioUrl: uploaded.url }));
    } catch (requestError) {
      setEditError(requestError instanceof Error ? requestError.message : 'Không thể tải audio lên S3.');
    } finally {
      setUploadingAudio(false);
    }
  }

  const isDialogOpen = editingItemId !== null;
  const isAddingNew = editingItemId === 'new';

  return (
    <div className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Chi tiết từ vựng · {fileName}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Hiển thị {items.length} / {totalRecords} từ. Bạn có thể sửa trực tiếp hoặc bổ sung từ thiếu.
          </p>
        </div>
        {editable ? (
          <button
            type="button"
            onClick={startAdding}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
          >
            <Plus size={14} aria-hidden="true" />
            Thêm từ mới
          </button>
        ) : null}
      </div>

      {editError && !isDialogOpen ? (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>{editError}</p>
        </div>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => {
          const data = item.normalizedData ?? item.rawData ?? {};
          const senses = Array.isArray(data.senses)
            ? data.senses.filter((sense): sense is Record<string, unknown> => Boolean(sense) && typeof sense === 'object')
            : [];
          const isDuplicate = item.status === 'DUPLICATE';
          const isValid = item.status === 'VALID';
          const isPublished = item.status === 'PUBLISHED';

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-4 transition ${
                isPublished
                  ? 'border-blue-200 bg-blue-50/20'
                  : isValid
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isDuplicate
                      ? 'border-amber-200 bg-amber-50/30'
                      : 'border-red-200 bg-red-50/30'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">#{item.rowNumber}</span>
                    <span className="text-base font-bold text-slate-900">{firstText(data.word) || 'Chưa có từ'}</span>
                    {senses.length > 1 ? (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {senses.length} từ loại/nghĩa
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {partOfSpeechLabel(firstText(data.pos, data.partOfSpeech))}
                      </span>
                    )}
                    {firstText(data.ipa) ? (
                      <span className="font-mono text-xs text-slate-500">[{firstText(data.ipa)}]</span>
                    ) : null}
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        isPublished
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : isValid
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : isDuplicate
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : 'border-red-200 bg-red-50 text-red-700'
                      }`}
                    >
                      {isPublished ? 'Đã publish' : isValid ? 'Hợp lệ' : isDuplicate ? 'Trùng lặp' : 'Lỗi'}
                    </span>
                  </div>

                  {senses.length ? (
                    <div className="space-y-1.5">
                      {senses.map((sense, index) => (
                        <div key={`${firstText(sense.partOfSpeech, sense.part_of_speech)}-${index}`} className="text-sm">
                          <span className="mr-1.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                            {partOfSpeechLabel(firstText(sense.partOfSpeech, sense.part_of_speech, sense.pos))}
                          </span>
                          <span className="font-medium text-slate-800">
                            {firstText(sense.meaning, sense.meaningVi, sense.meaning_vi) || 'Chưa có nghĩa'}
                          </span>
                          {firstText(sense.subCategory, sense.sub_category) ? (
                            <span className="ml-1 text-xs text-slate-500">
                              ({firstText(sense.subCategory, sense.sub_category)})
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-slate-800">{firstText(data.meaning) || 'Chưa có nghĩa'}</p>
                  )}

                  {firstText(data.exampleEn) ? (
                    <div className="mt-1 text-xs text-slate-600">
                      <p className="italic">&quot;{firstText(data.exampleEn)}&quot;</p>
                      {firstText(data.exampleVi) ? <p className="text-slate-500">{firstText(data.exampleVi)}</p> : null}
                    </div>
                  ) : null}

                  {item.errors.length ? (
                    <ul className="mt-2 space-y-0.5 text-xs text-red-600">
                      {item.errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {editable ? (
                  <div className="flex items-center gap-1.5">
                    {isDuplicate ? (
                      <button
                        type="button"
                        onClick={() => setPendingDuplicate(item)}
                        className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50"
                      >
                        Xử lý trùng
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => startEditing(item)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-slate-800"
                      title="Chỉnh sửa"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(item)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Xóa dòng"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Dialog: Thêm / Sửa từ vựng ── */}
      {isDialogOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h4 className="text-base font-bold text-slate-900">
                {isAddingNew ? 'Thêm từ vựng mới' : 'Chỉnh sửa từ vựng'}
              </h4>
              <button
                type="button"
                onClick={() => setEditingItemId(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body – scrollable */}
            <form onSubmit={saveItem} className="flex flex-col overflow-hidden">
              <div className="overflow-y-auto px-5 py-4 space-y-4">

                {editError ? (
                  <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <p>{editError}</p>
                  </div>
                ) : null}

                {/* Dictionary suggestion (only when adding new) */}
                {isAddingNew && dictionaryLoadingWord ? (
                  <p className="text-xs text-slate-500 animate-pulse">Đang tra từ điển cho &quot;{dictionaryLoadingWord}&quot;…</p>
                ) : null}
                {isAddingNew && dictionarySuggestion && dictionarySuggestion.word === form.word.trim() ? (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 space-y-1">
                    <p className="font-semibold">Gợi ý từ điển cho &quot;{dictionarySuggestion.word}&quot;</p>
                    {dictionarySuggestion.ipa ? <p>Phiên âm: <span className="font-mono">{dictionarySuggestion.ipa}</span></p> : null}
                    {dictionarySuggestion.meanings.length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5">
                        {dictionarySuggestion.meanings.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    ) : null}
                    <button
                      type="button"
                      className="mt-1 font-semibold underline"
                      onClick={() => setForm((f) => ({
                        ...f,
                        ipa: dictionarySuggestion.ipa || f.ipa,
                        meaning: dictionarySuggestion.meanings[0] || f.meaning,
                      }))}
                    >
                      Dùng gợi ý này
                    </button>
                  </div>
                ) : null}
                {isAddingNew && dictionaryError && dictionaryError.word === form.word.trim() ? (
                  <p className="text-xs text-amber-700">⚠ {dictionaryError.message}</p>
                ) : null}

                {/* Row 1: word, meaning, partOfSpeech */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    Từ tiếng Anh *
                    <input
                      required
                      value={form.word}
                      onChange={(e) => setForm({ ...form, word: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Nghĩa tiếng Việt *
                    <input
                      required
                      value={form.meaning}
                      onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Từ loại
                    <select
                      value={form.partOfSpeech}
                      onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none focus:border-blue-500"
                    >
                      <option value="Noun">Danh từ</option>
                      <option value="Verb">Động từ</option>
                      <option value="Adjective">Tính từ</option>
                      <option value="Adverb">Trạng từ</option>
                      <option value="Pronoun">Đại từ</option>
                      <option value="Preposition">Giới từ</option>
                      <option value="Conjunction">Liên từ</option>
                      <option value="Interjection">Thán từ</option>
                      <option value="Determiner">Từ hạn định</option>
                    </select>
                  </label>
                </div>

                {/* Row 2: ipa, level, topic */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    Phiên âm IPA
                    <input
                      value={form.ipa}
                      onChange={(e) => setForm({ ...form, ipa: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Cấp độ
                    <select
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none focus:border-blue-500"
                    >
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lv) => (
                        <option key={lv} value={lv}>{lv}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Chủ đề / Topic
                    <input
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Họ từ
                    <input
                      value={form.wordFamily}
                      onChange={(e) => setForm({ ...form, wordFamily: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Nhóm từ loại
                    <input
                      value={form.subCategory}
                      onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </label>
                </div>

                {/* Row 3: exampleEn, exampleVi */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Ví dụ tiếng Anh
                    <input
                      value={form.exampleEn}
                      onChange={(e) => setForm({ ...form, exampleEn: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Ví dụ tiếng Việt
                    <input
                      value={form.exampleVi}
                      onChange={(e) => setForm({ ...form, exampleVi: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </label>
                </div>

                {/* Row 4: synonyms, antonyms */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Từ đồng nghĩa (cách nhau bằng dấu phẩy)
                    <input
                      value={form.synonyms}
                      onChange={(e) => setForm({ ...form, synonyms: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Từ trái nghĩa (cách nhau bằng dấu phẩy)
                    <input
                      value={form.antonyms}
                      onChange={(e) => setForm({ ...form, antonyms: e.target.value })}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </label>
                </div>

                {/* Row 5: audioUrl */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    URL audio
                    <div className="mt-1 flex gap-2">
                      <input
                        value={form.audioUrl}
                        onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                        className="h-9 flex-1 rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
                        placeholder="https://..."
                      />
                      <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100">
                        <Upload size={13} aria-hidden="true" />
                        {uploadingAudio ? 'Đang tải…' : 'Tải lên'}
                        <input
                          type="file"
                          accept="audio/*"
                          className="sr-only"
                          disabled={uploadingAudio}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleAudioUpload(file);
                          }}
                        />
                      </label>
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => setEditingItemId(null)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={13} />
                  {saving ? 'Đang lưu…' : isAddingNew ? 'Thêm từ' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* ── Dialog: Xử lý trùng ── */}
      {pendingDuplicate ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900">Xử lý từ trùng lặp</h4>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Từ <strong>{firstText(pendingDuplicate.normalizedData?.word, pendingDuplicate.rawData?.word)}</strong> đã
              tồn tại trong bộ hoặc kho nội dung. Chọn phương án xử lý:
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void resolveDuplicate(pendingDuplicate.id, 'ADD_MEANING')}
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-left text-xs font-semibold text-blue-900 hover:bg-blue-100 disabled:opacity-50"
              >
                Gộp thêm nghĩa mới vào từ đã có
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void resolveDuplicate(pendingDuplicate.id, 'CREATE_NEW')}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50"
              >
                Tạo thành mục từ độc lập mới
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setPendingDuplicate(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Dialog: Xác nhận xóa ── */}
      {pendingDelete ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900">Xác nhận xóa</h4>
            <p className="mt-2 text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa dòng từ vựng này khỏi bản xem trước?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void removeItem(pendingDelete.id)}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
