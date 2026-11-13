import type { GrammarTopicItem } from "@/app/admin/content/grammar/types";

export interface GrammarTopicDisplayStats {
  questionCount: number;
  exampleCount: number;
  trapCount: number;
  hasQuestions: boolean;
  hasExamples: boolean;
}

export function getGrammarTopicDisplayStats(
  topic: GrammarTopicItem,
  topics: GrammarTopicItem[],
): GrammarTopicDisplayStats {
  const children = topics.filter((item) => item.parentTopicId === topic.id);
  const countedTopics = children.length ? children : [topic];

  return countedTopics.reduce<GrammarTopicDisplayStats>((stats, item) => {
    const metadataTrapCount = Object.values(item.metadata?.traps || {})
      .reduce((count, values) => count + (Array.isArray(values) ? values.length : 0), 0);
    const questionCount = item.questions?.length || 0;
    const exampleCount = item.examples?.length || 0;

    return {
      questionCount: stats.questionCount + questionCount,
      exampleCount: stats.exampleCount + exampleCount,
      trapCount: stats.trapCount + (item.traps?.length || 0) + metadataTrapCount,
      hasQuestions: stats.hasQuestions || questionCount > 0,
      hasExamples: stats.hasExamples || exampleCount > 0,
    };
  }, {
    questionCount: 0,
    exampleCount: 0,
    trapCount: 0,
    hasQuestions: false,
    hasExamples: false,
  });
}
