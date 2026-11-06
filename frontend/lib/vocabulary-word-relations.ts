import type { WordItem } from "@/app/admin/content/vocabulary/types";

type RelationKind = "WORD_FAMILY" | "INFLECTION";

interface WordRoot {
  root: string;
  relationType: RelationKind;
}

const inflectionSuffixes = ["ies", "es", "s", "ied", "ed", "ing", "est", "er"];
const derivationSuffixes = [
  "ments", "ment", "ation", "tion", "sion", "ness", "ity", "ship", "hood",
  "ance", "ence", "ally", "al", "ly", "ful", "less", "able", "ible", "ous",
  "ive", "ism", "ist", "or", "er",
];

function normalizeWord(value: string): string {
  return value.trim().toLocaleLowerCase("en").replace(/[^a-z]/g, "");
}

function getWordRoots(value: string): WordRoot[] {
  const word = normalizeWord(value);
  if (word.length < 3) return [];
  const roots: WordRoot[] = [{ root: word, relationType: "WORD_FAMILY" }];
  const append = (root: string, relationType: RelationKind) => {
    if (root.length >= 3 && !roots.some((candidate) => candidate.root === root)) {
      roots.push({ root, relationType });
    }
  };

  for (const suffix of inflectionSuffixes) {
    if (!word.endsWith(suffix) || word.length - suffix.length < 3) continue;
    const stem = word.slice(0, -suffix.length);
    if (suffix === "ies" || suffix === "ied") append(`${stem}y`, "INFLECTION");
    else {
      append(stem, "INFLECTION");
      if (["ed", "ing", "est", "er"].includes(suffix)) {
        if (stem.endsWith(stem.at(-1)?.repeat(2) || "\0")) append(stem.slice(0, -1), "INFLECTION");
        if (["ed", "ing"].includes(suffix)) append(`${stem}e`, "INFLECTION");
      }
    }
  }

  for (const suffix of derivationSuffixes) {
    if (!word.endsWith(suffix) || word.length - suffix.length < 3) continue;
    const stem = word.slice(0, -suffix.length);
    append(stem, "WORD_FAMILY");
    if (suffix === "ation" || suffix === "tion" || suffix === "sion") append(`${stem}e`, "WORD_FAMILY");
  }
  return roots;
}

export function inferRelatedVocabularyWords(
  word: string,
  candidates: WordItem[],
  excludeIds: string[] = [],
): Array<{ word: WordItem; relationType: RelationKind }> {
  const source = normalizeWord(word);
  if (source.length < 3) return [];
  const sourceRoots = getWordRoots(source);
  const excluded = new Set(excludeIds);
  const matches = new Map<string, { word: WordItem; relationType: RelationKind }>();

  for (const candidate of candidates) {
    const candidateWord = normalizeWord(candidate.word);
    if (!candidate.id || excluded.has(candidate.id) || !candidateWord || candidateWord === source) continue;
    const candidateRoots = getWordRoots(candidateWord);
    const commonRoot = sourceRoots.find((sourceRoot) =>
      candidateRoots.some((candidateRoot) => candidateRoot.root === sourceRoot.root),
    );
    if (!commonRoot) continue;
    const relationType = sourceRoots.some((root) => root.root === candidateWord && root.relationType === "INFLECTION")
      || candidateRoots.some((root) => root.root === source && root.relationType === "INFLECTION")
      ? "INFLECTION"
      : commonRoot.relationType;
    const key = candidateWord;
    const existing = matches.get(key);
    if (!existing || candidate.id.localeCompare(existing.word.id) < 0) {
      matches.set(key, { word: candidate, relationType });
    }
  }
  return [...matches.values()].sort((left, right) => left.word.word.localeCompare(right.word.word));
}
