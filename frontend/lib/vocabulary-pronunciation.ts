let activeAudio: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopVocabularyAudio(): void {
  activeAudio?.pause();
  activeAudio = null;
  activeUtterance = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function speakFallback(word: string, onError?: (message: string) => void): void {
  if (!("speechSynthesis" in window)) {
    onError?.("Không thể phát audio và trình duyệt không hỗ trợ giọng đọc tự động.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(word.trim());
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.onerror = () => {
    if (activeUtterance === utterance) {
      activeUtterance = null;
      onError?.("Không thể phát audio hoặc giọng đọc tự động cho từ này.");
    }
  };
  activeUtterance = utterance;
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
}

export function playVocabularyAudio(
  audioUrl: string | undefined,
  word: string,
  onError?: (message: string) => void,
): void {
  if (typeof window === "undefined" || !word.trim()) return;
  stopVocabularyAudio();
  const source = audioUrl?.trim();
  if (!source || (!source.startsWith("/") && !/^https?:\/\//i.test(source))) {
    speakFallback(word, onError);
    return;
  }

  const audio = new Audio(source);
  audio.preload = "auto";
  audio.playbackRate = 0.9;
  audio.onerror = () => {
    if (activeAudio !== audio) return;
    activeAudio = null;
    speakFallback(word, onError);
  };
  audio.onended = () => {
    if (activeAudio === audio) activeAudio = null;
  };
  activeAudio = audio;
  void audio.play().catch(() => {
    if (activeAudio !== audio) return;
    activeAudio = null;
    speakFallback(word, onError);
  });
}

export function playVocabularyPronunciation(word: string, region: "UK" | "US"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !word.trim()) return;
  stopVocabularyAudio();
  const utterance = new SpeechSynthesisUtterance(word.trim());
  utterance.lang = region === "UK" ? "en-GB" : "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  const voice = window.speechSynthesis.getVoices().find((candidate) =>
    candidate.lang.toLowerCase() === utterance.lang.toLowerCase(),
  );
  if (voice) utterance.voice = voice;
  activeUtterance = utterance;
  utterance.onend = () => {
    if (activeUtterance === utterance) activeUtterance = null;
  };
  utterance.onerror = () => {
    if (activeUtterance === utterance) activeUtterance = null;
  };
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
}
