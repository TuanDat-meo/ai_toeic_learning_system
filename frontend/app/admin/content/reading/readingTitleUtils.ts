export function normalizeReadingCardTitle(
  title: string,
  category: string,
  totalQuestions?: number
): string {
  if (!title) return title;
  const is200OrFull = /200\s*câu|bản chi tiết đầy đủ|full\s*reading/i.test(title);
  if (!is200OrFull && /-\s*Part\s*[567]/i.test(title)) return title;

  let baseTitle = title
    .replace(/\s*\((?:bản chi tiết đầy đủ\s*)?200\s*câu\)/gi, "")
    .replace(/\s*-\s*full\s*reading\s*(?:\([^\)]*\))?/gi, "")
    .replace(/\s*full\s*reading\s*(?:\([^\)]*\))?/gi, "")
    .replace(/\s*\(\s*200\s*câu\s*\)/gi, "")
    .replace(/\s*-\s*Part\s*[567]\s*(?:\([^\)]*\))?/gi, "")
    .replace(/[\s\-_]+$/, "")
    .trim();

  if (!baseTitle) baseTitle = "ETS TOEIC Reading";

  const normalizedCategory = category.toLowerCase();
  if (normalizedCategory === "part5" || normalizedCategory === "grammar") {
    const count =
      totalQuestions && totalQuestions !== 30 ? `${totalQuestions} câu` : "Câu 101 - 130";
    return `${baseTitle} - Part 5 (${count})`;
  }
  if (normalizedCategory === "part6") {
    const count =
      totalQuestions && totalQuestions !== 16 && totalQuestions !== 4
        ? `${totalQuestions} câu`
        : "Câu 131 - 146";
    return `${baseTitle} - Part 6 (${count})`;
  }
  if (normalizedCategory === "part7") {
    const count =
      totalQuestions && totalQuestions !== 54 && totalQuestions !== 2
        ? `${totalQuestions} câu`
        : "Câu 147 - 200";
    return `${baseTitle} - Part 7 (${count})`;
  }
  return baseTitle;
}

/**
 * Trích xuất "chữ ký đặc trưng" thông minh của một bài đọc Reading.
 * Giúp nhận diện chính xác bài đọc trùng lặp dù admin nhập dưới bất kỳ định dạng nào:
 * - "ETS 2023 Test 1 - Part 5"
 * - "Test 1 Part 5 2023"
 * - "ETS TOEIC 2023 - TEST 01 - Part 5 (Câu 101 - 130)"
 * - ID "p5-ets2023-test-1"
 */
export function extractReadingCardSignature(
  title: string,
  category: string,
  cardId?: string
): string {
  const normCat = (category || "").trim().toLowerCase();
  const rawTitle = (title || "").trim();
  const rawId = (cardId || "").trim().toLowerCase();

  // 1. Phân tích từ ID chuẩn hệ thống (ví dụ: p5-ets2023-test-1, p6-ets2024-test-10)
  if (rawId) {
    const idMatch = rawId.match(/^p([567])-ets(20\d{2})-test-(\d+)$/i);
    if (idMatch) {
      return `ets_${idMatch[2]}_test_${parseInt(idMatch[3], 10)}_part${idMatch[1]}`;
    }
  }

  // 2. Phân tích trích xuất Năm, Số Test và Part từ Title + Category
  const lowerTitle = rawTitle.toLowerCase();

  // Nhận diện Năm (2020 -> 2030)
  const yearMatch = lowerTitle.match(/\b(202[0-9])\b/);
  const year = yearMatch ? yearMatch[1] : null;

  // Nhận diện Số Test (Test 01, Test 1, Test-1, Đề 01, Đề 1, T1...)
  const testMatch = lowerTitle.match(/(?:test|de|đề|t)\s*[-_#]?\s*0?(\d{1,2})\b/i) ||
                    lowerTitle.match(/\b0?(\d{1,2})\s*(?:test|de|đề)\b/i);
  const testNum = testMatch ? parseInt(testMatch[1], 10) : null;

  // Nhận diện Part (Part 5, Part 6, Part 7)
  let part = normCat;
  const partInTitle = lowerTitle.match(/part\s*0?([567])\b/i) || lowerTitle.match(/\bp([567])\b/i);
  if (partInTitle) {
    part = `part${partInTitle[1]}`;
  } else if (!part.startsWith("part") && part !== "grammar") {
    part = "part5";
  }

  // Nếu tìm được cả Năm và Số Test => Đây là bài thi theo Bộ đề ETS chuẩn
  if (year && testNum !== null && !isNaN(testNum)) {
    return `ets_${year}_test_${testNum}_${part}`;
  }

  // 3. Fallback cho các chuyên đề ngữ pháp / từ loại hoặc bài đọc không theo mẫu ETS
  // Bỏ dấu tiếng Việt, bỏ toàn bộ ký tự đặc biệt, chuẩn hóa chuỗi
  const strippedTitle = rawTitle
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s*\((?:bản chi tiết đầy đủ\s*)?200\s*câu\)/gi, "")
    .replace(/\s*-\s*part\s*\d+\s*\([^\)]*\)/gi, "")
    .replace(/\s*\([^\)]*\)/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

  return `${strippedTitle}_${part}`;
}

/**
 * Tìm kiếm bài đọc trùng lặp trong danh sách bài đọc hiện có.
 * So khớp thông minh qua chữ ký bộ đề hoặc mã ID hoặc tiêu đề chuẩn hóa.
 */
export function findDuplicateReadingCard<T extends { id: string; title: string; category: string }>(
  incomingTitle: string,
  incomingCategory: string,
  existingCards: T[],
  excludeCardId?: string
): T | null {
  if (!incomingTitle.trim() || !existingCards || existingCards.length === 0) {
    return null;
  }

  const incomingSig = extractReadingCardSignature(incomingTitle, incomingCategory);

  for (const card of existingCards) {
    // Bỏ qua bài đọc đang được chỉnh sửa (chính nó)
    if (excludeCardId && card.id === excludeCardId) {
      continue;
    }

    const cardSig = extractReadingCardSignature(card.title, card.category, card.id);
    if (cardSig && cardSig === incomingSig) {
      return card;
    }
  }

  return null;
}
