interface EnglishTextValidationResult {
  invalidWords: string[];
}

const wordCache = new Map<string, boolean>();
const dictionaryWaiters: Array<() => void> = [];
let activeDictionaryLookups = 0;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function checkDictionaryWord(word: string): Promise<boolean> {
  const normalized = word.toLocaleLowerCase();
  const cached = wordCache.get(normalized);
  if (cached !== undefined) return cached;

  if (activeDictionaryLookups >= 4) {
    await new Promise<void>((resolve) => dictionaryWaiters.push(resolve));
  } else {
    activeDictionaryLookups += 1;
  }

  try {
    const cachedAfterWait = wordCache.get(normalized);
    if (cachedAfterWait !== undefined) return cachedAfterWait;

    let response: Response;
    try {
      response = await fetch(`/api/dictionary?${new URLSearchParams({ word })}`, {
        cache: "no-store",
      });
    } catch {
      throw new Error("Không kết nối được từ điển để xác minh nội dung tiếng Anh.");
    }

    if (response.status === 404) {
      wordCache.set(normalized, false);
      return false;
    }
    if (!response.ok) {
      throw new Error("Từ điển hiện không khả dụng; chưa thể xác minh nội dung tiếng Anh.");
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error("Từ điển trả về dữ liệu không hợp lệ; chưa thể xác minh nội dung tiếng Anh.");
    }
    const exists = isRecord(payload)
      && payload.exists === true
      && Array.isArray(payload.meanings)
      && payload.meanings.length > 0;
    wordCache.set(normalized, exists);
    return exists;
  } finally {
    const next = dictionaryWaiters.shift();
    if (next) next();
    else activeDictionaryLookups -= 1;
  }
}

function englishWords(text: string): string[] {
  return [...new Set((text.match(/\p{L}+(?:['’-]\p{L}+)*/gu) || [])
    .filter((word) => /^[A-Za-z]+(?:['’-][A-Za-z]+)*$/.test(word))
    .filter((word) => !/^[A-D]$/i.test(word))
    .map((word) => word.toLocaleLowerCase()))];
}

export async function validateEnglishText(
  text: string,
  requireEnglish = false,
): Promise<EnglishTextValidationResult> {
  const words = englishWords(text);
  const nonEnglishWords = requireEnglish
    ? [...new Set((text.match(/\p{L}+(?:['’-]\p{L}+)*/gu) || [])
      .filter((word) => !/^[A-Za-z]+(?:['’-][A-Za-z]+)*$/.test(word)))]
    : [];
  const invalidWords: string[] = [...nonEnglishWords];
  if (requireEnglish && words.length === 0 && nonEnglishWords.length === 0 && text.trim()) {
    invalidWords.push("(không tìm thấy nội dung tiếng Anh)");
  }
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < words.length) {
      const index = nextIndex++;
      const word = words[index];
      if (!await checkDictionaryWord(word)) invalidWords.push(word);
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, words.length) }, worker));
  return { invalidWords };
}

export async function validateEnglishFields(
  fields: Record<string, string>,
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};
  await Promise.all(Object.entries(fields).map(async ([field, value]) => {
    if (!value.trim()) return;
    const result = await validateEnglishText(value, true);
    if (result.invalidWords.length) {
      errors[field] = `Không phải từ tiếng Anh hoặc chưa có trong từ điển: ${result.invalidWords.join(", ")}.`;
    }
  }));
  return errors;
}
