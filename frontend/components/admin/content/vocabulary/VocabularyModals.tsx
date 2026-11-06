"use client";

import React, { useState } from "react";
import { X, Plus, Pencil, Trash2, Volume2, BookOpen, LoaderCircle, ExternalLink } from "lucide-react";
import { WordItem, TestItem, type VocabularyRelatedForm, type VocabularySense } from "@/app/admin/content/vocabulary/types";
import { uploadContentImportAsset } from "@/lib/api/content-import";
import {
  lookupEnglishDictionary,
  type EnglishDictionarySuggestion,
} from "@/lib/api/english-dictionary";
import {
  deduplicateVocabularySenses,
  groupVocabularySenses,
  normalizeVocabularyPartOfSpeech,
  uniqueVocabularyPartOfSpeech,
} from "@/lib/vocabulary-part-of-speech";
import { inferRelatedVocabularyWords } from "@/lib/vocabulary-word-relations";
import { playVocabularyPronunciation, stopVocabularyAudio } from "@/lib/vocabulary-pronunciation";

function getVocabularyWordSenses(word: WordItem) {
  const senses = word.senses?.length
    ? word.senses
    : [{
        partOfSpeech: word.partOfSpeech || word.pos || "",
        meaning: word.meaning || word.meanings?.[0]?.meaning || "",
        example: word.example || word.meanings?.[0]?.example || "",
      }];
  return deduplicateVocabularySenses(senses.map((sense) => ({
    ...sense,
    partOfSpeech: normalizeVocabularyPartOfSpeech(sense.partOfSpeech),
  })));
}

function getSenseIdentity(sense: Pick<VocabularySenseDraft, "partOfSpeech" | "meaning">): string {
  return `${normalizeVocabularyPartOfSpeech(sense.partOfSpeech).toLocaleLowerCase()}|${sense.meaning.trim().replace(/\s+/g, " ").toLocaleLowerCase()}`;
}

function getUniqueSenseDrafts(senses: VocabularySenseDraft[]): VocabularySenseDraft[] {
  return deduplicateVocabularySenses(senses.map((sense) => ({
    ...sense,
    partOfSpeech: normalizeVocabularyPartOfSpeech(sense.partOfSpeech),
  })));
}

const dictionarySources = [
  { name: "Cambridge English–Vietnamese", url: (word: string) => `https://dictionary.cambridge.org/dictionary/english-vietnamese/${encodeURIComponent(word)}` },
];

const vocabularyPartOfSpeechOptions = [
  { value: "Noun", label: "Noun — Danh từ (N)" },
  { value: "Verb", label: "Verb — Động từ (V)" },
  { value: "Adjective", label: "Adjective — Tính từ (Adj)" },
  { value: "Adverb", label: "Adverb — Trạng từ (Adv)" },
  { value: "Pronoun", label: "Pronoun — Đại từ (Pron)" },
  { value: "Preposition", label: "Preposition — Giới từ (Prep)" },
  { value: "Conjunction", label: "Conjunction — Liên từ (Conj)" },
  { value: "Interjection", label: "Interjection — Thán từ (Interj)" },
  { value: "Determiner", label: "Determiner — Từ hạn định (Det)" },
  { value: "Phrase", label: "Phrase — Cụm từ" },
];

const vocabularySubcategories: Record<string, string[]> = {
  Noun: ["Common Noun", "Proper Noun", "Countable Noun", "Uncountable Noun", "Concrete Noun", "Abstract Noun", "Collective Noun", "Compound Noun"],
  Verb: ["Action Verb", "Stative Verb", "Linking Verb", "Auxiliary Verb", "Modal Verb", "Transitive Verb", "Intransitive Verb", "Phrasal Verb"],
  Adjective: ["Descriptive Adjective", "Quantitative Adjective", "Demonstrative Adjective", "Possessive Adjective", "Interrogative Adjective", "Distributive Adjective", "Compound Adjective", "Comparative Adjective", "Superlative Adjective"],
  Adverb: ["Adverb of Manner", "Adverb of Time", "Adverb of Place", "Adverb of Frequency", "Adverb of Degree", "Adverb of Affirmation", "Adverb of Negation", "Conjunctive Adverb", "Interrogative Adverb", "Relative Adverb"],
  Pronoun: ["Personal Pronoun", "Possessive Pronoun", "Reflexive Pronoun", "Demonstrative Pronoun", "Relative Pronoun", "Interrogative Pronoun", "Indefinite Pronoun", "Reciprocal Pronoun"],
  Preposition: ["Preposition of Time", "Preposition of Place", "Preposition of Direction", "Preposition of Means", "Preposition of Cause", "Preposition of Purpose", "Preposition of Agent"],
  Conjunction: ["Coordinating Conjunction", "Subordinating Conjunction", "Correlative Conjunction"],
  Interjection: ["Emotional Interjection", "Greeting Interjection", "Pain Interjection", "Surprise Interjection", "Encouragement Interjection"],
  Determiner: ["Article", "Demonstrative", "Possessive Determiner", "Quantifier", "Numeral", "Ordinal", "Distributive", "Interrogative Determiner", "Existential Determiner"],
};

interface VocabularySenseDraft {
  partOfSpeech: string;
  subCategory: string;
  meaning: string;
  example: string;
  synonyms: string;
  antonyms: string;
}

function getVocabularyQualityFlags(word: WordItem) {
  const senses = getVocabularyWordSenses(word);
  const hasSavedAudio = Boolean((word.audioUrl || word.audio)?.trim());
  return {
    missingIpa: !word.ipa?.trim(),
    missingAudio: !hasSavedAudio,
    missingMeaning: senses.some((sense) => !sense.meaning?.trim()),
    missingExample: senses.some((sense) => !sense.example?.trim()),
  };
}

function getVocabularyQualityIssues(word: WordItem): string[] {
  const flags = getVocabularyQualityFlags(word);
  return [
    flags.missingIpa ? "thiếu phiên âm IPA" : "",
    flags.missingAudio ? "chưa có file audio riêng; loa vẫn có thể đọc bằng TTS" : "",
    flags.missingMeaning ? "thiếu nghĩa tiếng Việt ở một từ loại" : "",
    flags.missingExample ? "thiếu câu ví dụ ở một từ loại" : "",
  ].filter(Boolean);
}

function normalizeWordForMatch(word: string): string {
  return word.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function getWordAudioValidationError(value: string): string | null {
  const audio = value.trim();
  if (!audio) return null;
  if (audio.startsWith("/") && !audio.startsWith("//")) return null;
  try {
    const url = new URL(audio);
    return url.protocol === "http:" || url.protocol === "https:"
      ? null
      : "URL audio chỉ hỗ trợ HTTP hoặc HTTPS.";
  } catch {
    return "URL audio không hợp lệ. Hãy nhập URL đầy đủ hoặc đường dẫn nội bộ bắt đầu bằng /.";
  }
}

interface VocabularyModalsProps {
  // Word list modal
  wordListModalTest: TestItem | null;
  vocabularySets: TestItem[];
  onCloseWordList: () => void;
  playAudio: (audioUrl: string, word: string) => void;
  onOpenAddWord: () => void;
  onOpenEditWord: (w: WordItem) => void;
  onOpenWordDetails: (w: WordItem) => void;
  onDeleteWordClick: (w: WordItem) => void;
  previewTest: TestItem | null;
  onClosePreview: () => void;
  wordDetails: WordItem | null;
  onCloseWordDetails: () => void;

  // Create / Edit Test modal
  showCreateTestModal: boolean;
  editingTest: TestItem | null;
  onCloseTestForm: () => void;
  onSaveTestForm: (title: string, year: string, category: string, status?: string, releaseAt?: string) => void;
  existingCategories?: string[];

  // Delete Test modal
  deleteTestConfirm: TestItem | null;
  onCloseDeleteTest: () => void;
  onConfirmDeleteTest: (action: "DELETE" | "UNPUBLISH") => void;

  // Add / Edit Word modal
  showAddWordModal: boolean;
  editingWord: WordItem | null;
  onCloseWordForm: () => void;
  onSaveWordForm: (w: {
    word: string;
    ipa: string;
    partOfSpeech: string;
    meaning: string;
    example: string;
    level: string;
    audioUrl: string;
    audioRegion: string;
    subCategory: string;
    wordFamily: string;
    senses: VocabularySense[];
    relatedForms: VocabularyRelatedForm[];
    existingWordId?: string;
    duplicateAction?: "add-current-sense" | "update-missing-audio" | "add-separately" | "merge-other-senses";
    duplicateSenses?: VocabularySense[];
  }) => void;

  // Delete Word modal
  deleteWordConfirm: WordItem | null;
  onCloseDeleteWord: () => void;
  onConfirmDeleteWord: () => void;
}

export const VocabularyModals: React.FC<VocabularyModalsProps> = ({
  wordListModalTest,
  vocabularySets,
  onCloseWordList,
  playAudio,
  onOpenAddWord,
  onOpenEditWord,
  onOpenWordDetails,
  onDeleteWordClick,
  previewTest,
  onClosePreview,
  wordDetails,
  onCloseWordDetails,
  showCreateTestModal,
  editingTest,
  onCloseTestForm,
  onSaveTestForm,
  existingCategories = [],
  deleteTestConfirm,
  onCloseDeleteTest,
  onConfirmDeleteTest,
  showAddWordModal,
  editingWord,
  onCloseWordForm,
  onSaveWordForm,
  deleteWordConfirm,
  onCloseDeleteWord,
  onConfirmDeleteWord,
}) => {
  // Error states
  const [testFormError, setTestFormError] = useState<string | null>(null);
  const [wordFormError, setWordFormError] = useState<string | null>(null);
  const [wordQualityFilter, setWordQualityFilter] = useState<"all" | "needs-attention">("all");
  const [duplicateAction, setDuplicateAction] = useState<
    "add-current-sense" | "update-missing-audio" | "add-separately" | "merge-other-senses" | ""
  >("");

  // Test form state
  const [testTitle, setTestTitle] = useState("");
  const [testYear, setTestYear] = useState("2024");
  const [testCategory, setTestCategory] = useState<string>("2024");
  const [testStatus, setTestStatus] = useState<string>("PUBLISHED");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // Word form state
  const [wordText, setWordText] = useState("");
  const [wordIpa, setWordIpa] = useState("");
  const [wordPos, setWordPos] = useState("Verb");
  const [wordSubCategory, setWordSubCategory] = useState("");
  const [wordMeaning, setWordMeaning] = useState("");
  const [wordExample, setWordExample] = useState("");
  const [wordSynonyms, setWordSynonyms] = useState("");
  const [wordAntonyms, setWordAntonyms] = useState("");
  const [additionalWordSenses, setAdditionalWordSenses] = useState<VocabularySenseDraft[]>([]);
  const [wordFamily, setWordFamily] = useState("");
  const [wordLevel, setWordLevel] = useState("B2");
  const [wordAudioUrl, setWordAudioUrl] = useState("");
  const [wordAudioRegion, setWordAudioRegion] = useState("UNKNOWN");
  const [pronunciationError, setPronunciationError] = useState<string | null>(null);
  const [playingPronunciationRegion, setPlayingPronunciationRegion] = useState<"UK" | "US" | null>(null);
  const activePronunciation = React.useRef<SpeechSynthesisUtterance | null>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [dictionarySuggestion, setDictionarySuggestion] = useState<EnglishDictionarySuggestion | null>(null);
  const [selectedDictionaryMeaningId, setSelectedDictionaryMeaningId] = useState("");
  const [dictionaryMeaningFilter, setDictionaryMeaningFilter] = useState("all");
  const [dictionaryLoading, setDictionaryLoading] = useState(false);
  const [dictionaryError, setDictionaryError] = useState<string | null>(null);
  const [testReleaseAt, setTestReleaseAt] = useState("");

  React.useEffect(() => {
    if (editingTest) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTestTitle(editingTest.title || editingTest.nameVi || "");
      setTestYear(String(editingTest.year || "2024"));
      setTestStatus(editingTest.status || "PUBLISHED");
      setTestReleaseAt(editingTest.releaseAt?.slice(0, 16) || "");
      const cat = String(editingTest.category || "2024");
      const standardList = ["2024", "2026", "600_essential", "2023", "HACKERS", "BUSINESS", "COLLOCATIONS"];
      if (standardList.includes(cat) || existingCategories.includes(cat)) {
        setTestCategory(cat);
        setIsCustomCategory(false);
        setCustomCategoryInput("");
      } else {
        setTestCategory("__CUSTOM__");
        setIsCustomCategory(true);
        setCustomCategoryInput(cat);
      }
    } else {
      setTestTitle("");
      setTestYear("2024");
      setTestCategory("2024");
      setTestStatus("PUBLISHED");
      setTestReleaseAt("");
      setIsCustomCategory(false);
      setCustomCategoryInput("");
    }
  }, [editingTest, showCreateTestModal, existingCategories]);

  React.useEffect(() => {
    if (editingWord) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWordText(editingWord.word || "");
      setDictionaryLoading(false);
      setWordIpa(editingWord.ipa || "");
      const senses: VocabularySense[] = editingWord.senses?.length
        ? editingWord.senses
        : [{
            partOfSpeech: editingWord.partOfSpeech || editingWord.pos || "Verb",
            meaning: editingWord.meaning || editingWord.meanings?.[0]?.meaning || "",
            example: editingWord.example || editingWord.meanings?.[0]?.example || "",
          }];
      const uniqueSenses = getUniqueSenseDrafts(senses.map((sense) => ({
        partOfSpeech: sense.partOfSpeech,
        subCategory: sense.subCategory || "",
        meaning: sense.meaning,
        example: sense.example || "",
        synonyms: sense.synonyms || "",
        antonyms: sense.antonyms || "",
      })));
      const primarySense = uniqueSenses[0];
      setWordPos(normalizeVocabularyPartOfSpeech(primarySense.partOfSpeech || "Verb"));
      setWordSubCategory(primarySense.subCategory || "");
      setWordMeaning(primarySense.meaning || "");
      setWordExample(primarySense.example || "");
      setWordSynonyms(primarySense.synonyms || "");
      setWordAntonyms(primarySense.antonyms || "");
      setAdditionalWordSenses(uniqueSenses.slice(1));
      setWordFamily(editingWord.wordFamily || "");
      setWordLevel(editingWord.level || (editingWord.cefrLevel as string) || "B2");
      setWordAudioUrl(editingWord.audioUrl || editingWord.audio || "");
      setWordAudioRegion(editingWord.audioRegion || "UNKNOWN");
      setDictionarySuggestion(null);
      setSelectedDictionaryMeaningId("");
      setDictionaryMeaningFilter("all");
      setDictionaryError(null);
      setDuplicateAction("");
      setPronunciationError(null);
      setPlayingPronunciationRegion(null);
      window.speechSynthesis?.cancel();
    } else {
      setWordText("");
      setDictionaryLoading(false);
      setWordIpa("");
      setWordPos("Verb");
      setWordSubCategory("");
      setWordMeaning("");
      setWordExample("");
      setWordSynonyms("");
      setWordAntonyms("");
      setAdditionalWordSenses([]);
      setWordFamily("");
      setWordLevel("B2");
      setWordAudioUrl("");
      setWordAudioRegion("UNKNOWN");
      setDictionarySuggestion(null);
      setSelectedDictionaryMeaningId("");
      setDictionaryMeaningFilter("all");
      setDictionaryError(null);
      setDuplicateAction("");
    }
  }, [editingWord, showAddWordModal]);

  async function uploadWordAudio(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["mp3", "wav"].includes(extension || "")) {
      setWordFormError("Audio từ vựng chỉ hỗ trợ file .mp3 hoặc .wav.");
      return;
    }
    if (file.size > 256 * 1024 * 1024) {
      setWordFormError("File audio không được vượt quá 256 MB.");
      return;
    }
    setAudioUploading(true);
    setWordFormError(null);
    try {
      const asset = await uploadContentImportAsset("VOCABULARY", file);
      setWordAudioUrl(asset.url);
    } catch (error) {
      setWordFormError(error instanceof Error ? error.message : "Không thể tải audio lên.");
    } finally {
      setAudioUploading(false);
    }
  }

  React.useEffect(() => {
    const queriedWord = wordText.trim();
    if (!showAddWordModal || queriedWord.length < 2 || !/^[a-zA-Z][a-zA-Z' -]*$/.test(queriedWord)) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setDictionaryLoading(true);
      setDictionaryError(null);
      setDictionarySuggestion(null);
      try {
        const suggestion = await lookupEnglishDictionary(queriedWord, controller.signal);
        if (controller.signal.aborted) return;
        setDictionarySuggestion(suggestion);
        setSelectedDictionaryMeaningId(suggestion.meanings[0]?.id ?? "");
        setDictionaryMeaningFilter("all");
      } catch (error) {
        if (controller.signal.aborted) return;
        setDictionaryError(error instanceof Error ? error.message : "Không thể tra từ lúc này.");
      } finally {
        if (!controller.signal.aborted) setDictionaryLoading(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [wordText, showAddWordModal]);

  const selectedDictionaryMeaning = dictionarySuggestion?.meanings.find(
    (meaning) => meaning.id === selectedDictionaryMeaningId,
  );

  function applyDictionarySuggestion(
    suggestion: EnglishDictionarySuggestion,
    meaning: NonNullable<typeof selectedDictionaryMeaning>,
  ) {
    if (suggestion.phonetic) setWordIpa(suggestion.phonetic);
    if (suggestion.audioUrl) {
      setWordAudioUrl(suggestion.audioUrl);
      setWordAudioRegion("UNKNOWN");
    }
    setWordPos(normalizeVocabularyPartOfSpeech(meaning.partOfSpeech));
    setWordSubCategory("");
    setWordMeaning(meaning.definition);
    if (meaning.example) setWordExample(meaning.example);
  }

  const dictionaryPartOfSpeechOptions = dictionarySuggestion
    ? [...new Set(dictionarySuggestion.meanings.map((meaning) => meaning.partOfSpeech.trim()).filter(Boolean))]
    : [];
  const visibleDictionaryMeanings = dictionarySuggestion?.meanings.filter((meaning) =>
    dictionaryMeaningFilter === "all" || meaning.partOfSpeech.trim() === dictionaryMeaningFilter,
  ) ?? [];
  const existingWordMatch = !editingWord && wordText.trim()
    ? wordListModalTest?.words?.find((word) => normalizeWordForMatch(word.word) === normalizeWordForMatch(wordText))
    : undefined;
  const otherSetWordMatches = !editingWord && wordText.trim()
    ? vocabularySets
        .filter((set) => set.id !== wordListModalTest?.id)
        .flatMap((set) => (set.words || [])
          .filter((word) => normalizeWordForMatch(word.word) === normalizeWordForMatch(wordText))
          .map((word) => ({ setTitle: set.title || set.nameVi || "Bộ từ vựng", word })))
    : [];
  const primarySenseIdentity = getSenseIdentity({
    partOfSpeech: wordPos,
    meaning: wordMeaning,
  });
  const visibleAdditionalWordSenses = getUniqueSenseDrafts(additionalWordSenses)
    .filter((sense) => getSenseIdentity(sense) !== primarySenseIdentity);
  const availableRelatedWordItems = vocabularySets.flatMap((set) =>
    (set.words || []).map((word) => ({
      ...word,
      relatedSetTitle: set.title || set.nameVi || "Bộ từ vựng",
    })),
  ).filter((word, index, all) =>
    word.id !== editingWord?.id
    && normalizeWordForMatch(word.word) !== normalizeWordForMatch(wordText)
    && all.findIndex((candidate) => candidate.id === word.id) === index,
  );
  const detectedRelatedWords = inferRelatedVocabularyWords(
    wordText,
    availableRelatedWordItems,
    editingWord ? [editingWord.id] : [],
  );
  const relatedFormsToSave: VocabularyRelatedForm[] = detectedRelatedWords.map(({ word, relationType }) => ({
    id: word.id,
    word: word.word,
    partOfSpeech: word.partOfSpeech || word.pos,
    relationType,
  }));
  const detailRelatedWords = (() => {
    const candidates = vocabularySets.flatMap((set) => set.words || []);
    const inferred = inferRelatedVocabularyWords(wordDetails?.word || "", candidates, wordDetails ? [wordDetails.id] : []);
    const byId = new Map((wordDetails?.relatedForms || []).map((form) => {
      const relatedWord = candidates.find((candidate) => candidate.id === form.id);
      return relatedWord ? [form.id, { word: relatedWord, relationType: form.relationType as "WORD_FAMILY" | "INFLECTION" }] as const : null;
    }).filter((entry): entry is readonly [string, { word: WordItem; relationType: "WORD_FAMILY" | "INFLECTION" }] => entry !== null));
    inferred.forEach((entry) => byId.set(entry.word.id, entry));
    return [...byId.values()].sort((left, right) => left.word.word.localeCompare(right.word.word));
  })();

  async function playRegionalPronunciation(region: "UK" | "US") {
    const word = wordText.trim();
    if (!word) {
      setPronunciationError("Nhập từ tiếng Anh trước khi nghe phát âm.");
      return;
    }
    if (!("speechSynthesis" in window)) {
      setPronunciationError("Trình duyệt này không hỗ trợ phát âm.");
      return;
    }

    setPronunciationError(null);
    setPlayingPronunciationRegion(null);
    activePronunciation.current = null;
    stopVocabularyAudio();
    const voices = window.speechSynthesis.getVoices();
    const language = region === "UK" ? "en-GB" : "en-US";
    const voice = voices.find((candidate) =>
      candidate.lang.toLowerCase() === language.toLowerCase(),
    ) || voices.find((candidate) =>
      candidate.lang.toLowerCase().startsWith(`${language.toLowerCase()}-`),
    );

    const utterance = new SpeechSynthesisUtterance(word);
    let playbackStarted = false;
    utterance.lang = language;
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.onstart = () => {
      playbackStarted = true;
      setPlayingPronunciationRegion(region);
    };
    utterance.onend = () => {
      if (activePronunciation.current !== utterance) return;
      activePronunciation.current = null;
      setPlayingPronunciationRegion(null);
    };
    utterance.onerror = (event) => {
      if (activePronunciation.current !== utterance) return;
      activePronunciation.current = null;
      setPlayingPronunciationRegion(null);
      if (playbackStarted || event.error === "interrupted" || event.error === "canceled") return;
      setPronunciationError(`Không thể bắt đầu phát giọng ${region}. Vui lòng thử lại.`);
    };
    activePronunciation.current = utterance;
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }

  const vocabularyWords = wordListModalTest?.words ?? [];
  const vocabularyQualitySummary = vocabularyWords.reduce((summary, word) => {
    const flags = getVocabularyQualityFlags(word);
    if (flags.missingIpa) summary.missingIpa += 1;
    if (flags.missingAudio) summary.missingAudio += 1;
    if (flags.missingMeaning) summary.missingMeaning += 1;
    if (flags.missingExample) summary.missingExample += 1;
    if (Object.values(flags).some(Boolean)) summary.needsAttention += 1;
    return summary;
  }, { missingIpa: 0, missingAudio: 0, missingMeaning: 0, missingExample: 0, needsAttention: 0 });
  const visibleVocabularyWords = vocabularyWords.filter((word) =>
    wordQualityFilter === "all" || Object.values(getVocabularyQualityFlags(word)).some(Boolean),
  );

  return (
    <>
      {/* MODAL 1: XEM TỪ (WORD LIST MODAL) */}
      {wordListModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-150">
            {/* HEADER CỐ ĐỊNH */}
            <div className="p-6 pb-4 border-b border-slate-100 shrink-0 flex items-center justify-between gap-4 bg-white z-10">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Quản lý nội dung bộ từ
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {wordListModalTest.title} ({wordListModalTest.words ? wordListModalTest.words.length : (wordListModalTest.wordCount ?? 0)} từ)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenAddWord}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm từ
                </button>
                <button
                  type="button"
                  onClick={onCloseWordList}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <section aria-label="Kiểm tra chất lượng dữ liệu" className="shrink-0 border-b border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Kiểm tra chất lượng nội dung</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    “Cần rà soát” nghĩa là từ đang thiếu IPA, file audio riêng, nghĩa tiếng Việt hoặc câu ví dụ. Thiếu file audio không đồng nghĩa không phát được: loa sẽ đọc bằng TTS hoặc chuyển sang TTS nếu file bị lỗi.
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                      {vocabularyWords.length} từ
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${
                      vocabularyQualitySummary.needsAttention
                        ? "bg-amber-50 text-amber-800 ring-amber-200"
                        : "bg-emerald-50 text-emerald-800 ring-emerald-200"
                    }`}>
                      {vocabularyQualitySummary.needsAttention
                        ? `${vocabularyQualitySummary.needsAttention} từ cần rà soát`
                        : "Dữ liệu đầy đủ"}
                    </span>
                    {vocabularyQualitySummary.missingMeaning > 0 ? (
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-medium text-rose-700 ring-1 ring-rose-200">
                        Thiếu nghĩa: {vocabularyQualitySummary.missingMeaning}
                      </span>
                    ) : null}
                    {vocabularyQualitySummary.missingExample > 0 ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-800 ring-1 ring-amber-200">
                        Thiếu ví dụ: {vocabularyQualitySummary.missingExample}
                      </span>
                    ) : null}
                    {vocabularyQualitySummary.missingIpa > 0 ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
                        Thiếu IPA: {vocabularyQualitySummary.missingIpa}
                      </span>
                    ) : null}
                    {vocabularyQualitySummary.missingAudio > 0 ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
                        Thiếu file audio riêng (TTS vẫn phát): {vocabularyQualitySummary.missingAudio}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 rounded-lg border border-slate-200 bg-white p-0.5">
                  <button
                    type="button"
                    aria-pressed={wordQualityFilter === "all"}
                    onClick={() => setWordQualityFilter("all")}
                    className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold ${
                      wordQualityFilter === "all" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    aria-pressed={wordQualityFilter === "needs-attention"}
                    onClick={() => setWordQualityFilter("needs-attention")}
                    className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold ${
                      wordQualityFilter === "needs-attention" ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Cần rà soát
                  </button>
                </div>
              </div>
            </section>

            {/* Danh sách quản trị và hành động sửa/xóa */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pr-4">
              {vocabularyWords.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600">Bộ từ này hiện chưa có từ vựng nào.</p>
                  <p className="text-xs text-slate-400 mt-1">Nhấn &quot;Thêm từ&quot; ở trên để bắt đầu thêm từ vào bộ này.</p>
                </div>
              ) : visibleVocabularyWords.length === 0 ? (
                <div className="py-12 text-center text-sm text-emerald-700">
                  Tất cả từ trong bộ đã vượt qua các kiểm tra chất lượng hiện có.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {visibleVocabularyWords.map((w: WordItem, index: number) => {
                    const senses = getVocabularyWordSenses(w);
                    const qualityFlags = getVocabularyQualityFlags(w);
                    return (
                    <div key={w.id} className="py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">
                            {index + 1}. {w.word}
                          </span>
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {w.ipa || "Chưa có IPA"}
                          </span>
                          {Object.values(qualityFlags).some(Boolean) ? (
                            <>
                              <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                Cần rà soát
                              </span>
                              {getVocabularyQualityIssues(w).map((issue) => (
                                <span key={issue} className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">
                                  {issue}
                                </span>
                              ))}
                            </>
                          ) : (
                            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                              Đầy đủ
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => playAudio(w.audioUrl || w.audio || "", w.word)}
                            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => playVocabularyPronunciation(w.word, "UK")} className="rounded px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100" aria-label={`Phát âm ${w.word} giọng UK`}>UK</button>
                          <button type="button" onClick={() => playVocabularyPronunciation(w.word, "US")} className="rounded px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100" aria-label={`Phát âm ${w.word} giọng US`}>US</button>
                        </div>
                        {groupVocabularySenses(senses).map((group) => (
                          <div key={group.partOfSpeech} className="mt-2 rounded-lg bg-slate-50 p-2">
                            <p className="mb-1 text-[10px] font-bold text-blue-700">{group.partOfSpeech}</p>
                            {group.senses.map((sense, senseIndex) => (
                              <div key={sense.id ?? `${group.partOfSpeech}-${senseIndex}`} className={senseIndex ? "mt-1.5 border-t border-slate-200 pt-1.5" : ""}>
                                {sense.subCategory ? <p className="text-[10px] font-semibold text-slate-500">{sense.subCategory}</p> : null}
                                <p className="text-xs font-semibold text-slate-800">{sense.meaning}</p>
                                {sense.example ? (
                                  <p className="text-xs text-slate-500 italic leading-relaxed">&quot;{sense.example}&quot;</p>
                                ) : null}
                                {senseIndex === 0 && group.partOfSpeech === groupVocabularySenses(senses)[0]?.partOfSpeech && w.exampleMeaning ? (
                                  <p className="text-xs text-blue-700 font-semibold leading-relaxed">👉 {w.exampleMeaning}</p>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                          {w.level}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenWordDetails(w)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Xem chi tiết từ"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEditWord(w)}
                          className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Chỉnh sửa từ"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteWordClick(w)}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Xóa từ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FOOTER CỐ ĐỊNH Ở ĐÁY */}
            <div className="p-4 px-6 border-t border-slate-100 shrink-0 flex justify-end gap-2.5 bg-slate-50/70 z-10">
              <button
                type="button"
                onClick={onCloseWordList}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {wordDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-xs sm:p-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="vocabulary-word-details-title"
            className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-7">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Chi tiết từ vựng</p>
                <h2 id="vocabulary-word-details-title" className="mt-1 break-all text-2xl font-bold text-slate-900">
                  {wordDetails.word}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-slate-500">{wordDetails.ipa || "Chưa có IPA"}</span>
                  <button
                    type="button"
                    onClick={() => playAudio(wordDetails.audioUrl || wordDetails.audio || "", wordDetails.word)}
                    className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                    aria-label={`Phát audio từ ${wordDetails.word}`}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    Audio
                  </button>
                  {(["UK", "US"] as const).map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => playVocabularyPronunciation(wordDetails.word, region)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      aria-label={`Phát âm ${wordDetails.word} giọng ${region}`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseWordDetails}
                aria-label="Đóng chi tiết từ vựng"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 custom-scrollbar sm:p-7">
              <div className="flex flex-wrap gap-2">
                {uniqueVocabularyPartOfSpeech(getVocabularyWordSenses(wordDetails)).map((partOfSpeech) => (
                  <span key={partOfSpeech} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    {partOfSpeech}
                  </span>
                ))}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {wordDetails.level || wordDetails.cefrLevel || "Chưa có cấp độ"}
                </span>
              </div>

              {groupVocabularySenses(getVocabularyWordSenses(wordDetails)).map((group) => (
                <section key={group.partOfSpeech} className="overflow-hidden rounded-2xl border border-slate-200">
                  <h3 className="bg-slate-50 px-4 py-3 text-sm font-bold text-blue-800">{group.partOfSpeech}</h3>
                  <div className="divide-y divide-slate-100">
                    {group.senses.map((sense, index) => (
                      <article key={sense.id ?? `${group.partOfSpeech}-${index}`} className="space-y-2.5 p-4">
                        {sense.subCategory ? <p className="text-[11px] font-semibold text-slate-500">{sense.subCategory}</p> : null}
                        <p className="text-sm font-semibold text-slate-900">{sense.meaning || "Chưa có nghĩa"}</p>
                        {sense.example ? (
                          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm italic leading-relaxed text-amber-900">
                            “{sense.example}”
                          </p>
                        ) : <p className="text-xs text-slate-400">Chưa có ví dụ.</p>}
                        {sense.synonyms ? (
                          <p className="text-xs leading-relaxed">
                            <span className="font-bold text-emerald-700">Đồng nghĩa:</span>{" "}
                            <span className="text-slate-700">{sense.synonyms}</span>
                          </p>
                        ) : null}
                        {sense.antonyms ? (
                          <p className="text-xs leading-relaxed">
                            <span className="font-bold text-rose-700">Trái nghĩa:</span>{" "}
                            <span className="text-slate-700">{sense.antonyms}</span>
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </section>
              ))}

              {(detailRelatedWords.length > 0 || wordDetails.wordFamily) ? (
                <section className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                  <h3 className="text-xs font-bold text-violet-800">Họ từ và dạng liên quan</h3>
                  {detailRelatedWords.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {detailRelatedWords.map(({ word: relatedWord, relationType }) => {
                        return (
                          <button
                            key={`${relatedWord.id}-${relationType}`}
                            type="button"
                            onClick={() => onOpenWordDetails(relatedWord)}
                            className="rounded-lg bg-white px-3 py-2 text-left ring-1 ring-violet-100 transition hover:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className="block text-xs font-bold text-violet-900">{relatedWord.word}</span>
                            <span className="mt-0.5 block text-[10px] text-violet-700">
                              {relationType === "INFLECTION" ? "Biến thể hình thái" : "Cùng họ từ"}
                              {relatedWord.partOfSpeech ? ` · ${relatedWord.partOfSpeech}` : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                  {wordDetails.wordFamily ? (
                    <p className="mt-2 text-[10px] text-violet-700">
                      Họ từ dạng văn bản cũ: {wordDetails.wordFamily}
                    </p>
                  ) : null}
                </section>
              ) : null}
            </div>
            <footer className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-7">
              <button
                type="button"
                onClick={onCloseWordDetails}
                className="rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  onCloseWordDetails();
                  onOpenEditWord(wordDetails);
                }}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
              >
                Chỉnh sửa
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* ADMIN PREVIEW */}
      {previewTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="vocabulary-admin-preview-title"
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Bản xem trước quản trị</span>
                <h2 id="vocabulary-admin-preview-title" className="mt-1 text-lg font-bold text-slate-900">
                  {previewTest.title || previewTest.nameVi || "Bộ từ vựng"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Kiểm tra cấu trúc, trạng thái và nội dung trước khi phát hành.
                </p>
              </div>
              <button
                type="button"
                onClick={onClosePreview}
                aria-label="Đóng bản xem trước"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              ><X className="h-4 w-4" /></button>
            </header>
            <div className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-4 sm:p-5">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">Trạng thái</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {previewTest.status === "DRAFT" ? "Bản nháp" : previewTest.status === "ARCHIVED" ? "Đã ngưng xuất bản" : "Đã xuất bản"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">Phân loại</p>
                <p className="mt-1 break-words text-sm font-bold text-slate-800">{previewTest.category || "Chưa phân loại"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">Năm / mã bộ</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{previewTest.year || "—"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">Lịch phát hành</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {previewTest.releaseAt ? new Date(previewTest.releaseAt).toLocaleString("vi-VN") : "Ngay khi xuất bản"}
                </p>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Nội dung bộ từ</h3>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                  {previewTest.words?.length || 0} từ tải trong danh sách
                  {previewTest.wordCount && previewTest.wordCount > (previewTest.words?.length || 0)
                    ? ` / ${previewTest.wordCount} tổng`
                    : ""}
                </span>
              </div>
              {previewTest.words?.length ? (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-2.5"># / Từ</th>
                          <th className="px-3 py-2.5">Từ loại / Cấp độ</th>
                          <th className="px-3 py-2.5">Nghĩa</th>
                          <th className="px-3 py-2.5">Ví dụ</th>
                          <th className="px-3 py-2.5">Audio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewTest.words.map((word, index) => (
                          <tr key={word.id} className="align-top">
                            <td className="px-3 py-3">
                              <p className="font-bold text-slate-900">{index + 1}. {word.word}</p>
                              <p className="mt-0.5 font-mono text-slate-400">{word.ipa || "Chưa có IPA"}</p>
                            </td>
                            <td className="px-3 py-3 text-slate-600">
                              {uniqueVocabularyPartOfSpeech(getVocabularyWordSenses(word)).join(", ") || "—"}<br />
                              <span className="font-semibold">{word.level || word.cefrLevel || "—"}</span>
                            </td>
                            <td className="max-w-[220px] whitespace-normal px-3 py-3 text-slate-700">
                              {getVocabularyWordSenses(word).map((sense, senseIndex) => (
                                <p key={sense.id ?? `${sense.partOfSpeech}-${senseIndex}`}>{sense.meaning}</p>
                              ))}
                            </td>
                            <td className="max-w-[260px] whitespace-normal px-3 py-3 text-slate-600">
                              {getVocabularyWordSenses(word).map((sense, senseIndex) => (
                                <p key={sense.id ?? `${sense.partOfSpeech}-${senseIndex}`}>
                                  {sense.example || "—"}
                                </p>
                              ))}
                            </td>
                            <td className="px-3 py-3">
                              {word.audioUrl || word.audio
                                ? <audio controls preload="none" className="h-8 w-40" src={word.audioUrl || word.audio} />
                                : <span className="text-slate-400">Chưa có</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                  Bộ này chưa có từ nào để xem trước.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* MODAL 2: THÊM / SỬA BỘ TỪ VỰNG */}
      {(showCreateTestModal || editingTest) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={onCloseTestForm}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Quản lý nội dung</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {editingTest ? "Sửa bộ từ vựng" : "Thêm bộ từ vựng mới"}
              </h3>
            </div>
            {testFormError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                ⚠️ {testFormError}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!testTitle.trim()) {
                  setTestFormError("Vui lòng nhập tên bộ từ vựng (không được để trống).");
                  return;
                }
                if (isCustomCategory && !customCategoryInput.trim()) {
                  setTestFormError("Vui lòng nhập tên phân loại tùy chỉnh mới.");
                  return;
                }
                setTestFormError(null);
                const finalCategory = isCustomCategory ? (customCategoryInput.trim() || "Khác") : testCategory;
                onSaveTestForm(testTitle.trim(), testYear, finalCategory, testStatus, testReleaseAt);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên bộ từ vựng *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Test 5 (ETS 2026) hoặc Hackers TOEIC"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nhãn / Năm</label>
                  <input
                    type="text"
                    placeholder="2026"
                    value={testYear}
                    onChange={(e) => setTestYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thao tác phân loại</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      if (!isCustomCategory) {
                        setCustomCategoryInput("");
                      }
                    }}
                    className="w-full py-2 px-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer text-[11px]"
                  >
                    {isCustomCategory ? "← Chọn danh sách có sẵn" : "✏️ Tự gõ phân loại mới"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isCustomCategory ? "Nhập tên phân loại mới *" : "Chọn phân loại *"}
                </label>
                {!isCustomCategory ? (
                  <select
                    value={testCategory}
                    onChange={(e) => {
                      if (e.target.value === "__CUSTOM__") {
                        setIsCustomCategory(true);
                        setCustomCategoryInput("");
                      } else {
                        setTestCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  >
                    <optgroup label="Danh mục phổ biến">
                      <option value="2024">ETS 2024</option>
                      <option value="2026">ETS 2026</option>
                      <option value="600_essential">600 Essential Words</option>
                      <option value="2023">ETS 2023</option>
                      <option value="HACKERS">Hackers TOEIC</option>
                      <option value="BUSINESS">Kinh tế &amp; Công sở (Business)</option>
                      <option value="COLLOCATIONS">Cụm từ Collocations</option>
                    </optgroup>
                    {existingCategories.filter(
                      (c) => !["2024", "2026", "600_essential", "2023", "HACKERS", "BUSINESS", "COLLOCATIONS"].includes(c)
                    ).length > 0 && (
                      <optgroup label="Danh mục khác hiện có trong hệ thống">
                        {existingCategories
                          .filter(
                            (c) =>
                              !["2024", "2026", "600_essential", "2023", "HACKERS", "BUSINESS", "COLLOCATIONS"].includes(c)
                          )
                          .map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    <option value="__CUSTOM__">+ Tự nhập phân loại mới khác...</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: YBM 2024, Từ vựng Part 7, Kinh tế..."
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-blue-400 bg-blue-50/20 text-xs font-medium focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <p className="text-[11px] text-slate-400">
                      💡 Phân loại này sẽ tự động xuất hiện thành một tab lọc ngoài màn hình chính.
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái phát hành</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestStatus("PUBLISHED")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      testStatus === "PUBLISHED"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-100"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>✓ Đã xuất bản</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestStatus("DRAFT")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      testStatus === "DRAFT"
                        ? "bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-100"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>⏱️ Bản nháp</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {testStatus !== "PUBLISHED"
                    ? "Bộ từ chỉ hiển thị trong trang quản trị cho đến khi được xuất bản."
                    : testReleaseAt
                      ? `Học viên có thể truy cập sau ${new Date(testReleaseAt).toLocaleString("vi-VN")}.`
                      : "Học viên sẽ nhìn thấy và học được bộ từ này sau khi lưu."}
                </p>
              </div>
              <div>
                <label htmlFor="vocabulary-release-at" className="block text-xs font-bold text-slate-700 mb-1">
                  Thời gian phát hành
                </label>
                <input
                  id="vocabulary-release-at"
                  type="datetime-local"
                  value={testReleaseAt}
                  onChange={(event) => setTestReleaseAt(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Để trống để phát hành ngay khi trạng thái là Đã xuất bản. Chọn thời điểm tương lai để lên lịch.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onCloseTestForm}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  {editingTest ? "Lưu thay đổi" : "Tạo bộ từ vựng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: XÁC NHẬN XÓA BỘ TỪ VỰNG */}
      {deleteTestConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Xóa bộ từ vựng?</h3>
              <p className="text-xs text-slate-500">
                Chọn ngưng xuất bản để giữ lại bộ và các từ; chỉ xóa vĩnh viễn khi muốn xóa cả bộ lẫn toàn bộ từ bên trong.
              </p>
            </div>
            <div className="grid gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => onConfirmDeleteTest("UNPUBLISH")}
                className="w-full rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-xs font-bold text-amber-800 transition-all hover:bg-amber-100 cursor-pointer"
              >
                Ngưng xuất bản (giữ lại dữ liệu)
              </button>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onCloseDeleteTest}
                  className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200 cursor-pointer"
                >Hủy</button>
                <button
                  type="button"
                  onClick={() => onConfirmDeleteTest("DELETE")}
                  className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-rose-700 cursor-pointer"
                >Xóa vĩnh viễn</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: THÊM / SỬA TỪ VỰNG */}
      {showAddWordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-2 backdrop-blur-xs animate-in fade-in duration-150 sm:p-4">
          <div className="relative flex max-h-[95dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={onCloseWordForm}
              aria-label="Đóng form từ vựng"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 cursor-pointer sm:right-6 sm:top-5"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="shrink-0 border-b border-slate-100 px-5 py-4 pr-16 sm:px-7 sm:py-5">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Từ vựng</span>
              <h3 id="vocabulary-word-form-title" className="mt-0.5 text-xl font-bold text-slate-900">
                {editingWord ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}
              </h3>
            </div>
            {wordFormError && (
              <div role="alert" className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 sm:mx-7">
                ⚠️ {wordFormError}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!wordText.trim()) {
                  setWordFormError("Vui lòng nhập từ tiếng Anh.");
                  return;
                }
                if (!wordMeaning.trim() && duplicateAction !== "update-missing-audio") {
                  setWordFormError("Vui lòng nhập định nghĩa tiếng Việt.");
                  return;
                }
                if (additionalWordSenses.some((sense) => !sense.meaning.trim())) {
                  setWordFormError("Vui lòng nhập nghĩa cho từng từ loại bổ sung.");
                  return;
                }
                const audioValidationError = getWordAudioValidationError(wordAudioUrl);
                if (audioValidationError) {
                  setWordFormError(audioValidationError);
                  return;
                }
                if (existingWordMatch && !["add-current-sense", "update-missing-audio"].includes(duplicateAction)) {
                  setWordFormError("Hãy chọn cách xử lý từ đã có trong bộ hiện tại.");
                  return;
                }
                if (!existingWordMatch && otherSetWordMatches.length > 0
                  && !["add-separately", "merge-other-senses"].includes(duplicateAction)) {
                  setWordFormError("Hãy chọn có thêm từ này vào bộ hiện tại hay không.");
                  return;
                }
                setWordFormError(null);
                const senses = deduplicateVocabularySenses([
                  {
                    partOfSpeech: wordPos,
                    subCategory: wordSubCategory,
                    meaning: wordMeaning.trim(),
                    example: wordExample.trim(),
                    synonyms: wordSynonyms.trim(),
                    antonyms: wordAntonyms.trim(),
                  },
                  ...getUniqueSenseDrafts(additionalWordSenses).map((sense) => ({
                    ...sense,
                    meaning: sense.meaning.trim(),
                    example: sense.example.trim(),
                    synonyms: sense.synonyms.trim(),
                    antonyms: sense.antonyms.trim(),
                  })),
                ]);
                onSaveWordForm({
                  word: wordText.trim(),
                  ipa: wordIpa.trim(),
                  partOfSpeech: wordPos,
                  meaning: wordMeaning.trim(),
                  example: wordExample.trim(),
                  level: wordLevel,
                  audioUrl: wordAudioUrl.trim(),
                  audioRegion: wordAudioRegion,
                  subCategory: wordSubCategory,
                  wordFamily: wordFamily.trim(),
                  senses,
                  relatedForms: relatedFormsToSave,
                  existingWordId: existingWordMatch?.id,
                  duplicateAction: duplicateAction || undefined,
                  duplicateSenses: otherSetWordMatches.flatMap(({ word }) => getVocabularyWordSenses(word)),
                });
              }}
              aria-labelledby="vocabulary-word-form-title"
              className="grid min-h-0 flex-1 grid-cols-1 content-start gap-4 overflow-y-auto p-5 text-xs custom-scrollbar md:grid-cols-2 md:gap-x-5 md:gap-y-4 md:p-7"
            >
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Từ tiếng Anh *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required={duplicateAction !== "update-missing-audio"}
                    placeholder="Ví dụ: allocate"
                    value={wordText}
                    onChange={(event) => {
                      setWordText(event.target.value);
                      if (dictionarySuggestion) {
                        setWordIpa("");
                        setWordPos("Verb");
                        setWordSubCategory("");
                        setWordMeaning("");
                        setWordExample("");
                        setWordSynonyms("");
                        setWordAntonyms("");
                        setAdditionalWordSenses([]);
                        setWordFamily("");
                        setWordAudioUrl("");
                        setWordAudioRegion("UNKNOWN");
                      }
                      setDictionaryLoading(false);
                      setDictionarySuggestion(null);
                      setSelectedDictionaryMeaningId("");
                      setDictionaryMeaningFilter("all");
                      setDictionaryError(null);
                      setDuplicateAction("");
                      setWordFormError(null);
                    }}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium transition-all focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Gợi ý từ điển là dữ liệu tham khảo riêng; chỉ nội dung bạn áp dụng hoặc thêm thành nghĩa riêng mới được lưu.
                </p>
                {existingWordMatch ? (
                  <div role="status" className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-900">
                    <p className="font-bold">Từ này đã có trong bộ hiện tại. Chọn cách xử lý:</p>
                    <ul className="mt-1 list-inside list-disc space-y-0.5">
                      {getVocabularyWordSenses(existingWordMatch).map((sense, index) => (
                        <li key={`${sense.partOfSpeech}-${index}`}>
                          <span className="font-semibold">{sense.partOfSpeech || "Chưa có từ loại"}:</span>{" "}
                          {sense.meaning || "Chưa có nghĩa"}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        aria-pressed={duplicateAction === "add-current-sense"}
                        onClick={() => setDuplicateAction("add-current-sense")}
                        className={`rounded-lg border px-2.5 py-1.5 font-semibold ${
                          duplicateAction === "add-current-sense"
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-amber-300 bg-white text-amber-900"
                        }`}
                      >
                        Bổ sung nghĩa/từ loại đang nhập
                      </button>
                      <button
                        type="button"
                        aria-pressed={duplicateAction === "update-missing-audio"}
                        onClick={() => setDuplicateAction("update-missing-audio")}
                        className={`rounded-lg border px-2.5 py-1.5 font-semibold ${
                          duplicateAction === "update-missing-audio"
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-amber-300 bg-white text-amber-900"
                        }`}
                      >
                        Chỉ cập nhật IPA/audio còn thiếu
                      </button>
                    </div>
                  </div>
                ) : null}
                {!existingWordMatch && otherSetWordMatches.length > 0 ? (
                  <div role="status" className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-900">
                    <p className="font-bold">Từ này đã có ở bộ khác. Bạn có muốn thêm vào bộ hiện tại không?</p>
                    <div className="mt-2 max-h-32 space-y-2 overflow-y-auto pr-1">
                      {otherSetWordMatches.map(({ setTitle, word }, index) => (
                        <div key={`${word.id}-${index}`} className="rounded-md bg-white/80 px-2.5 py-2">
                          <p className="font-semibold">{setTitle}</p>
                          <p className="mt-0.5 text-amber-800">
                            {getVocabularyWordSenses(word)
                              .map((sense) => `${sense.partOfSpeech || "Chưa có từ loại"}: ${sense.meaning || "Chưa có nghĩa"}`)
                              .join(" · ")}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        aria-pressed={duplicateAction === "add-separately"}
                        onClick={() => setDuplicateAction("add-separately")}
                        className={`rounded-lg border px-2.5 py-1.5 font-semibold ${
                          duplicateAction === "add-separately"
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-amber-300 bg-white text-amber-900"
                        }`}
                      >
                        Thêm riêng, không ghép nghĩa
                      </button>
                      <button
                        type="button"
                        aria-pressed={duplicateAction === "merge-other-senses"}
                        onClick={() => setDuplicateAction("merge-other-senses")}
                        className={`rounded-lg border px-2.5 py-1.5 font-semibold ${
                          duplicateAction === "merge-other-senses"
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-amber-300 bg-white text-amber-900"
                        }`}
                      >
                        Thêm và ghép nghĩa/từ loại từ bộ khác
                      </button>
                    </div>
                  </div>
                ) : null}
                {dictionaryLoading ? (
                  <p role="status" className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-blue-700">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />Đang tìm gợi ý…
                  </p>
                ) : null}
                {dictionaryError ? (
                  <p role="alert" className="mt-2 rounded-lg bg-rose-50 px-2.5 py-2 text-[11px] text-rose-700">{dictionaryError}</p>
                ) : null}
              </div>
              {dictionarySuggestion ? (
                <section aria-label="Gợi ý từ điển Anh-Việt" className="flex h-[300px] min-h-0 flex-col gap-2 overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50 p-3 md:col-span-2 sm:h-[330px]">
                  <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <div className="flex min-w-0 items-baseline gap-2">
                      <h4 className="shrink-0 text-xs font-bold text-blue-800">
                        {dictionarySuggestion.meaningLanguage === "vi-machine"
                          ? "Gợi ý cụm từ Anh–Việt"
                          : dictionarySuggestion.meaningLanguage === "vi" ? "Gợi ý Anh–Việt" : "Tra cứu cụm từ"}
                      </h4>
                      <span className="truncate text-[10px] text-slate-500">
                        {selectedDictionaryMeaning?.source || (dictionarySuggestion.meaningLanguage === "vi" ? "MinhQND · Wiktionary" : "Wiktionary")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {dictionarySuggestion.phonetic ? (
                        <span className="rounded-md bg-white px-2 py-1 font-mono text-[11px] font-semibold text-slate-700">
                          {dictionarySuggestion.phonetic}
                        </span>
                      ) : null}
                      {dictionarySuggestion.audioUrl ? (
                        <audio controls preload="none" aria-label="Nghe phát âm từ điển Anh-Việt" className="h-7 w-28" src={dictionarySuggestion.audioUrl} />
                      ) : null}
                    </div>
                  </div>
                  {dictionarySuggestion.meaningLanguage === "vi-machine" ? (
                    <p className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] leading-relaxed text-amber-900">
                      Đã bổ sung nghĩa tiếng Việt bằng dịch máy từ định nghĩa cụm từ trên Wiktionary. Vui lòng rà soát nghĩa trước khi lưu.
                    </p>
                  ) : dictionarySuggestion.meaningLanguage === "en" ? (
                    <p className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] leading-relaxed text-amber-900">
                      Tìm thấy định nghĩa tiếng Anh cho cụm từ nhưng chưa dịch được sang tiếng Việt. Hãy nhập nghĩa tiếng Việt riêng trước khi lưu.
                    </p>
                  ) : null}
                  {dictionaryPartOfSpeechOptions.length > 1 ? (
                    <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto pb-0.5" aria-label="Lọc gợi ý theo từ loại">
                      <button
                        type="button"
                        aria-pressed={dictionaryMeaningFilter === "all"}
                        onClick={() => setDictionaryMeaningFilter("all")}
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${
                          dictionaryMeaningFilter === "all"
                            ? "border-blue-500 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                        }`}
                      >
                        Tất cả ({dictionarySuggestion.meanings.length})
                      </button>
                      {dictionaryPartOfSpeechOptions.map((partOfSpeech) => {
                        const count = dictionarySuggestion.meanings.filter(
                          (meaning) => meaning.partOfSpeech.trim() === partOfSpeech,
                        ).length;
                        const active = dictionaryMeaningFilter === partOfSpeech;
                        return (
                          <button
                            key={partOfSpeech}
                            type="button"
                            aria-pressed={active}
                            onClick={() => {
                              setDictionaryMeaningFilter(partOfSpeech);
                              const firstMeaning = dictionarySuggestion.meanings.find(
                                (meaning) => meaning.partOfSpeech.trim() === partOfSpeech,
                              );
                              if (firstMeaning) setSelectedDictionaryMeaningId(firstMeaning.id);
                            }}
                            className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${
                              active
                                ? "border-blue-500 bg-blue-600 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                            }`}
                          >
                            {partOfSpeech} ({count})
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                  <div className="grid min-h-0 flex-1 content-start gap-1.5 overflow-y-auto pr-1 custom-scrollbar sm:grid-cols-2">
                    {visibleDictionaryMeanings.map((meaning, index) => {
                      const selected = meaning.id === selectedDictionaryMeaningId;
                      return (
                        <button
                          key={meaning.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setSelectedDictionaryMeaningId(meaning.id)}
                          className={`rounded-lg border px-2.5 py-2 text-left transition ${
                            selected
                              ? "border-blue-500 bg-white ring-1 ring-blue-100"
                              : "border-slate-200 bg-white/70 hover:border-blue-300"
                          }`}
                        >
                          <span className="text-[9px] font-bold uppercase text-slate-500">
                            {index + 1}. {meaning.partOfSpeech || "Nghĩa"}
                          </span>
                          {meaning.meaningLanguage === "vi-machine" ? (
                            <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-amber-800">
                              Dịch máy
                            </span>
                          ) : meaning.meaningLanguage === "en" ? (
                            <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-600">
                              English
                            </span>
                          ) : null}
                          <span className="mt-0.5 block text-xs font-semibold leading-4 text-slate-900">{meaning.definition}</span>
                          {meaning.example ? (
                            <span className="mt-1 line-clamp-1 block text-[10px] italic leading-4 text-slate-600">{meaning.example}</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-2 border-t border-blue-100 pt-2">
                    {dictionarySuggestion.sourceUrl ? (
                      <a
                        href={dictionarySuggestion.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 underline"
                      >
                        Nguồn<ExternalLink className="h-3 w-3" />
                      </a>
                    ) : <span />}
                    <div className="flex items-center gap-1.5">
                      {selectedDictionaryMeaning && selectedDictionaryMeaning.meaningLanguage !== "en" ? <button
                      type="button"
                      disabled={!selectedDictionaryMeaning}
                      onClick={() => {
                        if (!selectedDictionaryMeaning || selectedDictionaryMeaning.meaningLanguage === "en") return;
                        const newSense: VocabularySenseDraft = {
                          partOfSpeech: normalizeVocabularyPartOfSpeech(selectedDictionaryMeaning.partOfSpeech),
                          subCategory: "",
                          meaning: selectedDictionaryMeaning.definition,
                          example: selectedDictionaryMeaning.example,
                          synonyms: "",
                          antonyms: "",
                        };
                        setAdditionalWordSenses((current) => {
                          const duplicate = getSenseIdentity(newSense) === primarySenseIdentity
                            || current.some((sense) => getSenseIdentity(sense) === getSenseIdentity(newSense));
                          return duplicate ? current : [...current, newSense];
                        });
                      }}
                      className="rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                      Thêm thành nghĩa riêng
                      </button> : null}
                      {selectedDictionaryMeaning && selectedDictionaryMeaning.meaningLanguage !== "en" ? <button
                        type="button"
                        disabled={!selectedDictionaryMeaning}
                        onClick={() => {
                          if (selectedDictionaryMeaning) applyDictionarySuggestion(dictionarySuggestion, selectedDictionaryMeaning);
                        }}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Áp dụng nghĩa &amp; từ loại
                      </button> : null}
                    </div>
                  </div>
                </section>
              ) : null}
              {wordText.trim() ? (
                <div className="flex flex-wrap items-center gap-2 md:col-span-2">
                  <span className="text-[10px] font-semibold text-slate-500">Đối chiếu thêm:</span>
                  {dictionarySources.map((source) => (
                    <a
                      key={source.name}
                      href={source.url(wordText.trim())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      {source.name}<ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  ))}
                </div>
              ) : null}
              <div className="contents">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phiên âm IPA</label>
                  <input
                    type="text"
                    placeholder="/ˈæləkeɪt/"
                    value={wordIpa}
                    onChange={(e) => setWordIpa(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-slate-800">
                    {(["UK", "US"] as const).map((region) => (
                      <span key={region} className="inline-flex items-center gap-1.5">
                        <span>{region}</span>
                        <button
                          type="button"
                          disabled={!wordText.trim()}
                          onClick={() => void playRegionalPronunciation(region)}
                          aria-label={`Nghe từ ${wordText.trim() || "đang nhập"} bằng giọng ${region}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Volume2 className={`h-4 w-4 ${playingPronunciationRegion === region ? "animate-pulse text-blue-700" : ""}`} />
                        </button>
                        {(wordIpa || dictionarySuggestion?.phonetic) ? (
                          <span className="font-normal text-slate-700">{wordIpa || dictionarySuggestion?.phonetic}</span>
                        ) : null}
                      </span>
                    ))}
                  </div>
                  {pronunciationError ? (
                    <p role="alert" className="mt-1 rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] text-amber-800">
                      {pronunciationError}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Từ loại</label>
                  <p className="mb-1 text-[10px] text-slate-500">Chọn độc lập với từ loại trong gợi ý.</p>
                  <select
                    value={wordPos}
                    onChange={(e) => {
                      setWordPos(e.target.value);
                      setWordSubCategory("");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  >
                    {vocabularyPartOfSpeechOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <label className="mb-1 mt-2 block text-[10px] font-semibold text-slate-600">Nhóm nhỏ (tùy chọn)</label>
                  <select
                    value={wordSubCategory}
                    onChange={(event) => setWordSubCategory(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Không chọn nhóm nhỏ</option>
                    {(vocabularySubcategories[wordPos] || []).map((subCategory) => (
                      <option key={subCategory} value={subCategory}>{subCategory}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nghĩa tiếng Việt *</label>
                <input
                  type="text"
                  required
                  placeholder="Phân bổ, chỉ định ngân sách hoặc nguồn lực"
                  value={wordMeaning}
                  onChange={(e) => setWordMeaning(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ví dụ ngữ cảnh TOEIC</label>
                <textarea
                  rows={2}
                  placeholder="The committee allocated funds for the new research laboratory."
                  value={wordExample}
                  onChange={(e) => setWordExample(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Từ đồng nghĩa (tùy chọn)</label>
                <input
                  value={wordSynonyms}
                  onChange={(event) => setWordSynonyms(event.target.value)}
                  placeholder="Ví dụ: area, district"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Từ trái nghĩa (tùy chọn)</label>
                <input
                  value={wordAntonyms}
                  onChange={(event) => setWordAntonyms(event.target.value)}
                  placeholder="Ví dụ: —"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <section className="space-y-3 rounded-xl border border-slate-200 p-3 md:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Các nghĩa của từ</h4>
                    <p className="text-[10px] text-slate-500">Mỗi nghĩa lưu riêng từ loại, ví dụ, từ đồng nghĩa và trái nghĩa. Gợi ý từ điển chỉ được lưu khi bạn thêm hoặc áp dụng.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdditionalWordSenses((current) => [
                      ...current,
                      { partOfSpeech: "Noun", subCategory: "", meaning: "", example: "", synonyms: "", antonyms: "" },
                    ])}
                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <Plus className="h-3.5 w-3.5" />Thêm nghĩa / từ loại
                  </button>
                </div>
                {visibleAdditionalWordSenses.map((sense, index) => {
                  const senseIdentity = getSenseIdentity(sense);
                  return (
                  <div key={senseIdentity} className="grid gap-2 rounded-lg bg-slate-50 p-3 md:grid-cols-2">
                    <div className="flex items-center justify-between gap-2 md:col-span-2">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Nghĩa bổ sung {index + 1}</span>
                      <button
                        type="button"
                        aria-label={`Xóa nghĩa bổ sung ${index + 1}`}
                        onClick={() => setAdditionalWordSenses((current) => current.filter((item) => getSenseIdentity(item) !== senseIdentity))}
                        className="rounded-md p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <select
                      aria-label={`Từ loại nghĩa bổ sung ${index + 1}`}
                      value={sense.partOfSpeech}
                      onChange={(event) => setAdditionalWordSenses((current) => getUniqueSenseDrafts(current.map((item) =>
                        getSenseIdentity(item) === senseIdentity
                          ? { ...item, partOfSpeech: event.target.value, subCategory: "" }
                          : item,
                      )))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                    >
                      {vocabularyPartOfSpeechOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <select
                      aria-label={`Nhóm nhỏ nghĩa bổ sung ${index + 1}`}
                      value={sense.subCategory}
                      onChange={(event) => setAdditionalWordSenses((current) => current.map((item) =>
                        getSenseIdentity(item) === senseIdentity ? { ...item, subCategory: event.target.value } : item,
                      ))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                    >
                      <option value="">Không chọn nhóm nhỏ</option>
                      {(vocabularySubcategories[sense.partOfSpeech] || []).map((subCategory) => (
                        <option key={subCategory} value={subCategory}>{subCategory}</option>
                      ))}
                    </select>
                    <input
                      required
                      aria-label={`Nghĩa tiếng Việt bổ sung ${index + 1}`}
                      value={sense.meaning}
                      onChange={(event) => setAdditionalWordSenses((current) => current.map((item) =>
                        getSenseIdentity(item) === senseIdentity ? { ...item, meaning: event.target.value } : item,
                      ))}
                      placeholder="Nghĩa tiếng Việt"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs md:col-span-2"
                    />
                    <input
                      aria-label={`Ví dụ bổ sung ${index + 1}`}
                      value={sense.example}
                      onChange={(event) => setAdditionalWordSenses((current) => current.map((item) =>
                        getSenseIdentity(item) === senseIdentity ? { ...item, example: event.target.value } : item,
                      ))}
                      placeholder="Ví dụ ngữ cảnh (không bắt buộc)"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs md:col-span-2"
                    />
                    <input
                      aria-label={`Từ đồng nghĩa nghĩa bổ sung ${index + 1}`}
                      value={sense.synonyms}
                      onChange={(event) => setAdditionalWordSenses((current) => current.map((item) =>
                        getSenseIdentity(item) === senseIdentity ? { ...item, synonyms: event.target.value } : item,
                      ))}
                      placeholder="Từ đồng nghĩa (phân tách bằng dấu phẩy)"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                    />
                    <input
                      aria-label={`Từ trái nghĩa nghĩa bổ sung ${index + 1}`}
                      value={sense.antonyms}
                      onChange={(event) => setAdditionalWordSenses((current) => current.map((item) =>
                        getSenseIdentity(item) === senseIdentity ? { ...item, antonyms: event.target.value } : item,
                      ))}
                      placeholder="Từ trái nghĩa (phân tách bằng dấu phẩy)"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  );
                })}
              </section>
              <div className="md:col-span-2">
                <section className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/40 p-3">
                  <div>
                    <h4 className="text-xs font-bold text-violet-900">Tự động nhận diện họ từ / biến thể</h4>
                    <p className="mt-1 text-[10px] leading-relaxed text-violet-700">
                      Các mục từ có chung gốc từ và đã tồn tại trong ngân hàng sẽ được liên kết tự động. Mỗi mục vẫn giữ nghĩa và ví dụ riêng.
                    </p>
                  </div>
                  {detectedRelatedWords.length ? (
                    <div className="flex flex-wrap gap-2">
                      {detectedRelatedWords.map(({ word: relatedWord, relationType }) => (
                        <span key={relatedWord.id} className="inline-flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs ring-1 ring-violet-100">
                          <span className="font-semibold text-violet-900">{relatedWord.word}</span>
                          <span className="text-[10px] text-violet-700">
                            {relationType === "INFLECTION" ? "Biến thể" : "Cùng họ từ"}
                            {relatedWord.partOfSpeech ? ` · ${relatedWord.partOfSpeech}` : ""}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : <p className="text-[10px] text-slate-500">Chưa tìm thấy từ cùng gốc trong ngân hàng. Khi các dạng liên quan được thêm vào, hệ thống sẽ tự phát hiện và liên kết.</p>}
                </section>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cấp độ CEFR / TOEIC</label>
                <select
                  value={wordLevel}
                  onChange={(e) => setWordLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                >
                  <option value="A2">A2 (300-400 TOEIC)</option>
                  <option value="A1">A1 (Cơ bản)</option>
                  <option value="B1">B1 (450-600 TOEIC)</option>
                  <option value="B2">B2 (650-800 TOEIC)</option>
                  <option value="C1">C1 (850-990 TOEIC)</option>
                  <option value="C2">C2 (Thành thạo)</option>
                </select>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <label className="block text-xs font-bold text-slate-700">Audio phát âm</label>
                <p className="mb-2 mt-1 text-[11px] text-slate-500">
                  Tải audio dùng chung cho học viên (.mp3/.wav) hoặc nhập URL; nghe thử UK/US ở cạnh ô từ.
                </p>
                <input
                  type="file"
                  accept=".mp3,.wav,audio/mpeg,audio/wav"
                  disabled={audioUploading}
                  onChange={(event) => {
                    const selected = event.target.files?.[0];
                    event.target.value = "";
                    if (selected) void uploadWordAudio(selected);
                  }}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {audioUploading ? (
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <LoaderCircle size={13} className="animate-spin" />Đang tải audio lên…
                  </p>
                ) : null}
                <input
                  type="text"
                  inputMode="url"
                  value={wordAudioUrl}
                  onChange={(event) => setWordAudioUrl(event.target.value)}
                  placeholder="https://... hoặc /api/media/..."
                  aria-label="URL audio phát âm"
                  className="mt-2.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                {wordAudioUrl && getWordAudioValidationError(wordAudioUrl) ? (
                  <p className="mt-1 text-[10px] text-rose-700">{getWordAudioValidationError(wordAudioUrl)}</p>
                ) : null}
                {wordAudioUrl ? (
                  <audio className="mt-2 h-8 w-full" controls preload="none" src={wordAudioUrl}>
                    Trình duyệt không hỗ trợ phát audio.
                  </audio>
                ) : null}
              </div>

              <div className="sticky bottom-0 z-10 -mx-5 -mb-5 flex justify-end gap-2.5 border-t border-slate-100 bg-white/95 px-5 py-3 backdrop-blur md:col-span-2 md:-mx-7 md:-mb-7 md:px-7">
                <button
                  type="button"
                  onClick={onCloseWordForm}
                  disabled={audioUploading}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={audioUploading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  {editingWord ? "Cập nhật từ" : "Thêm vào danh sách"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: XÁC NHẬN XÓA TỪ VỰNG */}
      {deleteWordConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Xóa từ vựng?</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa từ &quot;{deleteWordConfirm.word}&quot; khỏi bộ từ vựng này?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onCloseDeleteWord}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={onConfirmDeleteWord}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
