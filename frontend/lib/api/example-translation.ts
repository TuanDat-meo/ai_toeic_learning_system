async function translateText(text: string, sourceLanguage: "en" | "vi", targetLanguage: "en" | "vi"): Promise<string> {
  const response = await fetch("/api/translate-example", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ text, sourceLanguage, targetLanguage }),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof payload === "object" && payload !== null
      && "error" in payload && typeof payload.error === "string"
      ? payload.error
      : "Không thể dịch nội dung. Vui lòng thử lại.";
    throw new Error(message);
  }
  if (typeof payload !== "object" || payload === null
    || !("translation" in payload) || typeof payload.translation !== "string"
    || !payload.translation.trim()) {
    throw new Error("Dịch vụ không trả về bản dịch hợp lệ.");
  }
  return payload.translation.trim();
}

export function translateExampleToVietnamese(text: string): Promise<string> {
  return translateText(text, "en", "vi");
}

export function translateVietnameseToEnglish(text: string): Promise<string> {
  return translateText(text, "vi", "en");
}
