const partOfSpeechAliases: Record<string, string[]> = {
  Noun: ["noun", "n", "danh tu"],
  Verb: ["verb", "v", "dong tu", "phrasal verb", "modal verb", "auxiliary verb"],
  Adjective: ["adjective", "adj", "a", "tinh tu"],
  Adverb: ["adverb", "adv", "trang tu", "pho tu"],
  Pronoun: ["pronoun", "pron", "pron.", "dai tu"],
  Preposition: ["preposition", "prep", "gioi tu"],
  Conjunction: ["conjunction", "conj", "lien tu"],
  Interjection: ["interjection", "interj", "than tu"],
  Determiner: ["determiner", "det", "tu han dinh"],
  Phrase: ["phrase", "phr", "cum tu", "cum dong tu", "cum danh tu", "cum gioi tu"],
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/[\(\)\[\]{}\.]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function canonicalizeSinglePartOfSpeech(value: string): string {
  const normalized = normalizeText(value);
  if (!normalized) return "";

  const matches = Object.entries(partOfSpeechAliases)
    .filter(([, aliases]) => aliases.some((alias) => {
      const normalizedAlias = normalizeText(alias);
      return normalized === normalizedAlias || ` ${normalized} `.includes(` ${normalizedAlias} `);
    }))
    .map(([canonical]) => canonical);

  return matches.length === 1 ? matches[0] : value.trim();
}

export function normalizeVocabularyPartOfSpeech(value?: string | null): string {
  if (!value?.trim()) return "";
  const parts = value.split(/\s*(?:\/|\||;|,|\bor\b)\s*/i).filter(Boolean);
  const normalizedParts = parts.map(canonicalizeSinglePartOfSpeech);
  if (normalizedParts.length > 1 && normalizedParts.every(Boolean)) {
    return [...new Set(normalizedParts)].join(" / ");
  }
  return canonicalizeSinglePartOfSpeech(value);
}

export interface VocabularySenseLike {
  partOfSpeech: string;
  subCategory?: string;
  meaning: string;
  example?: string;
  synonyms?: string;
  antonyms?: string;
}

function normalizeMeaningForComparison(value: string): string {
  return value
    .toLocaleLowerCase("en")
    .replace(/\s+/g, " ")
    .trim();
}

export function deduplicateVocabularySenses<T extends VocabularySenseLike>(senses: T[]): T[] {
  const mergeRelationTerms = (first?: string, second?: string) => {
    const terms = [...(first || "").split(/[,;|]/), ...(second || "").split(/[,;|]/)]
      .map((term) => term.trim())
      .filter(Boolean);
    return [...new Map(terms.map((term) => [term.toLocaleLowerCase("en"), term])).values()].join(", ");
  };
  const unique: T[] = [];
  for (const sense of senses) {
    const partOfSpeech = normalizeVocabularyPartOfSpeech(sense.partOfSpeech);
    const meaningKey = normalizeMeaningForComparison(sense.meaning);
    const partOfSpeechSet = new Set(partOfSpeech.split(/\s*\/\s*/).map((value) => value.toLocaleLowerCase("en")));
    const existing = unique.find((candidate) => {
      if (normalizeMeaningForComparison(candidate.meaning) !== meaningKey) return false;
      const candidateParts = candidate.partOfSpeech.split(/\s*\/\s*/).map((value) => value.toLocaleLowerCase("en"));
      return candidateParts.some((candidatePart) => partOfSpeechSet.has(candidatePart));
    });
    if (!existing) {
      unique.push({ ...sense, partOfSpeech });
      continue;
    }
    const mergedPartOfSpeech = new Set([
      ...existing.partOfSpeech.split(/\s*\/\s*/),
      ...partOfSpeech.split(/\s*\/\s*/),
    ]);
    existing.partOfSpeech = [...mergedPartOfSpeech].join(" / ");
    if (!existing.subCategory && sense.subCategory) existing.subCategory = sense.subCategory;
    if (!existing.example && sense.example) existing.example = sense.example;
    existing.synonyms = mergeRelationTerms(existing.synonyms, sense.synonyms);
    existing.antonyms = mergeRelationTerms(existing.antonyms, sense.antonyms);
  }
  return unique;
}

export function uniqueVocabularyPartOfSpeech(senses: VocabularySenseLike[]): string[] {
  return [...new Set(senses.map((sense) =>
    normalizeVocabularyPartOfSpeech(sense.partOfSpeech),
  ).filter(Boolean))];
}

export function groupVocabularySenses<T extends VocabularySenseLike>(
  senses: T[],
): Array<{ partOfSpeech: string; senses: T[] }> {
  const groups = new Map<string, T[]>();
  for (const sense of deduplicateVocabularySenses(senses)) {
    const partOfSpeech = normalizeVocabularyPartOfSpeech(sense.partOfSpeech);
    const group = groups.get(partOfSpeech) || [];
    group.push(sense);
    groups.set(partOfSpeech, group);
  }
  return [...groups].map(([partOfSpeech, groupedSenses]) => ({ partOfSpeech, senses: groupedSenses }));
}
