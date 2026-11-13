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
