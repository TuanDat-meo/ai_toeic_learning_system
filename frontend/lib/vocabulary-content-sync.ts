const VOCABULARY_CONTENT_EVENT = "toeic-vocab-tests-updated";
const VOCABULARY_CONTENT_CHANNEL = "toeic-vocabulary-content";

let publisher: BroadcastChannel | null = null;

export function notifyVocabularyContentChanged(): void {
  if (typeof window === "undefined") return;

  if (typeof BroadcastChannel !== "undefined") {
    publisher ??= new BroadcastChannel(VOCABULARY_CONTENT_CHANNEL);
    publisher.postMessage({ updatedAt: Date.now() });
    return;
  }

  window.dispatchEvent(new Event(VOCABULARY_CONTENT_EVENT));
}

export function subscribeToVocabularyContentChanges(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => onChange();
  window.addEventListener(VOCABULARY_CONTENT_EVENT, handleChange);

  const channel = typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel(VOCABULARY_CONTENT_CHANNEL)
    : null;
  channel?.addEventListener("message", handleChange);

  return () => {
    window.removeEventListener(VOCABULARY_CONTENT_EVENT, handleChange);
    channel?.removeEventListener("message", handleChange);
    channel?.close();
  };
}
