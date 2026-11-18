'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BookMarked, ExternalLink, Loader2, Volume2, X } from 'lucide-react';

export const DOUBLE_CLICK_LOOKUP_STORAGE_KEY = 'toeic_pref_double_click_lookup';
export const DOUBLE_CLICK_LOOKUP_EVENT = 'toeic-double-click-lookup-changed';

interface LookupMeaning {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

interface LookupResult {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  viTranslation?: string;
  meanings: LookupMeaning[];
  notFound?: boolean;
}

const lookupCache = new Map<string, LookupResult>();

function isLookupEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(DOUBLE_CLICK_LOOKUP_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

function extractEnglishWord(raw: string): string | null {
  const cleaned = raw.trim().replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '');
  if (!cleaned || cleaned.length < 2 || cleaned.length > 35) return null;
  if (!/^[a-zA-Z]+(?:['-][a-zA-Z]+)*$/.test(cleaned)) return null;
  return cleaned.toLowerCase();
}

function isIgnoredTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest('[data-toeic-dictionary-popup="true"]')) return true;
  if (target.closest('input, textarea, select, button, a, [contenteditable="true"]')) return true;
  return false;
}

async function fetchWordDefinition(word: string): Promise<LookupResult> {
  const cached = lookupCache.get(word);
  if (cached) return cached;

  const [dictRes, viRes] = await Promise.allSettled([
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`),
    fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`),
  ]);

  let phonetic: string | undefined;
  let audioUrl: string | undefined;
  const meanings: LookupMeaning[] = [];

  if (dictRes.status === 'fulfilled' && dictRes.value.ok) {
    try {
      const json = (await dictRes.value.json()) as Array<{
        phonetic?: string;
        phonetics?: Array<{ text?: string; audio?: string }>;
        meanings?: Array<{
          partOfSpeech?: string;
          definitions?: Array<{ definition?: string; example?: string }>;
        }>;
      }>;
      const entry = Array.isArray(json) ? json[0] : undefined;
      if (entry) {
        phonetic =
          entry.phonetic ||
          entry.phonetics?.find((p) => p.text && p.text.trim())?.text;
        const foundAudio = entry.phonetics?.find((p) => p.audio && p.audio.trim())?.audio;
        if (foundAudio) {
          audioUrl = foundAudio.startsWith('//') ? `https:${foundAudio}` : foundAudio;
        }
        for (const m of entry.meanings || []) {
          const def = m.definitions?.[0];
          if (def?.definition) {
            meanings.push({
              partOfSpeech: m.partOfSpeech || '',
              definition: def.definition,
              example: def.example,
            });
          }
          if (meanings.length >= 2) break;
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  let viTranslation: string | undefined;
  if (viRes.status === 'fulfilled' && viRes.value.ok) {
    try {
      const json = (await viRes.value.json()) as {
        responseData?: { translatedText?: string };
      };
      const translated = json.responseData?.translatedText?.trim();
      if (translated && translated.toLowerCase() !== word.toLowerCase()) {
        viTranslation = translated;
      }
    } catch {
      // Ignore parse errors
    }
  }

  const result: LookupResult = {
    word,
    phonetic,
    audioUrl,
    viTranslation,
    meanings,
    notFound: !viTranslation && meanings.length === 0,
  };

  lookupCache.set(word, result);
  return result;
}

export function DoubleClickDictionary() {
  const [enabled, setEnabled] = useState<boolean>(isLookupEnabled);
  const [isMockExamActive, setIsMockExamActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const syncPreference = () => {
      const next = isLookupEnabled();
      setEnabled(next);
      if (!next) setOpen(false);
    };
    const handleMockExamState = (event: Event) => {
      const examEvent = event as CustomEvent<{ isTaking: boolean }>;
      const taking = examEvent.detail?.isTaking === true;
      setIsMockExamActive(taking);
      if (taking) setOpen(false);
    };
    window.addEventListener(DOUBLE_CLICK_LOOKUP_EVENT, syncPreference);
    window.addEventListener('storage', syncPreference);
    window.addEventListener('toeic:mock-exam-state', handleMockExamState);
    return () => {
      window.removeEventListener(DOUBLE_CLICK_LOOKUP_EVENT, syncPreference);
      window.removeEventListener('storage', syncPreference);
      window.removeEventListener('toeic:mock-exam-state', handleMockExamState);
    };
  }, []);

  const playPronunciation = useCallback((word: string, audioUrl?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utter = new SpeechSynthesisUtterance(word);
          utter.lang = 'en-US';
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utter);
        }
      });
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  }, []);

  useEffect(() => {
    if (!enabled || isMockExamActive) return;

    const handleDoubleClick = async (event: MouseEvent) => {
      if (isIgnoredTarget(event.target)) return;
      const selection = window.getSelection();
      const rawText = selection?.toString() || '';
      const word = extractEnglishWord(rawText);
      if (!word) return;

      const popupWidth = 320;
      const popupEstimatedHeight = 250;
      const padding = 14;

      let left = event.clientX - popupWidth / 2;
      let top = event.clientY + 18;

      if (left < padding) left = padding;
      if (left + popupWidth > window.innerWidth - padding) {
        left = Math.max(padding, window.innerWidth - popupWidth - padding);
      }
      if (top + popupEstimatedHeight > window.innerHeight - padding) {
        top = Math.max(padding, event.clientY - popupEstimatedHeight - 14);
      }

      const currentReqId = ++requestIdRef.current;
      setPosition({ top, left });
      setOpen(true);
      setLoading(true);
      setResult({ word, meanings: [] });

      try {
        const data = await fetchWordDefinition(word);
        if (requestIdRef.current === currentReqId) {
          setResult(data);
        }
      } finally {
        if (requestIdRef.current === currentReqId) {
          setLoading(false);
        }
      }
    };

    document.addEventListener('dblclick', handleDoubleClick);
    return () => document.removeEventListener('dblclick', handleDoubleClick);
  }, [enabled, isMockExamActive]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (popupRef.current && event.target instanceof Node && !popupRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!open || !result) return null;

  return (
    <div
      ref={popupRef}
      data-toeic-dictionary-popup="true"
      style={{ top: position.top, left: position.left }}
      className="fixed z-[60] w-[320px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15"
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 shrink-0 text-teal-600" />
            <span className="truncate text-base font-bold text-slate-900">{result.word}</span>
            <button
              type="button"
              onClick={() => playPronunciation(result.word, result.audioUrl)}
              className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-200/70 hover:text-[#1b41ae] cursor-pointer"
              title="Nghe phát âm"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
          {result.phonetic && (
            <p className="mt-0.5 text-xs font-medium text-slate-500">{result.phonetic}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700 cursor-pointer"
          aria-label="Đóng cửa sổ tra từ"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[260px] space-y-3 overflow-y-auto px-4 py-3 text-xs">
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-[#1b41ae]" />
            <span>Đang tra nghĩa từ &ldquo;{result.word}&rdquo;...</span>
          </div>
        ) : result.notFound ? (
          <p className="py-2 text-slate-500">
            Không tìm thấy định nghĩa cho từ <strong>{result.word}</strong>. Bạn có thể mở từ điển Cambridge bên dưới.
          </p>
        ) : (
          <>
            {result.viTranslation && (
              <div className="rounded-xl border border-teal-200/80 bg-teal-50/60 px-3 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                  Nghĩa tiếng Việt
                </span>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{result.viTranslation}</p>
              </div>
            )}

            {result.meanings.length > 0 && (
              <div className="space-y-2.5">
                {result.meanings.map((meaning, index) => (
                  <div key={`${meaning.partOfSpeech}-${index}`} className="space-y-1">
                    {meaning.partOfSpeech && (
                      <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold italic text-slate-600">
                        {meaning.partOfSpeech}
                      </span>
                    )}
                    <p className="leading-relaxed text-slate-700">{meaning.definition}</p>
                    {meaning.example && (
                      <p className="border-l-2 border-slate-200 pl-2 text-[11px] italic text-slate-500">
                        &ldquo;{meaning.example}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-[11px]">
        <span className="text-slate-400">Bấm đúp từ tiếng Anh bất kỳ</span>
        <a
          href={`https://dictionary.cambridge.org/dictionary/english-vietnamese/${encodeURIComponent(result.word)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-[#1b41ae] hover:underline"
        >
          <span>Cambridge</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
