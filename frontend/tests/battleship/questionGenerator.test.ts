import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildBattleQuestion,
  createWordMask,
  generateDistractors,
  getAcceptedAnswersForWord,
  maskWordInSentence,
} from "../../components/vocabulary/battleship/questionGenerator.ts";
import type { WordItem } from "../../app/admin/content/vocabulary/types";

const mockWords: WordItem[] = [
  {
    id: "w1",
    word: "negotiate",
    partOfSpeech: "Verb",
    meaning: "đàm phán, thương lượng",
    example: "The manager will negotiate the terms tomorrow.",
    exampleMeaning: "Người quản lý sẽ thương lượng các điều khoản vào ngày mai.",
    audioUrl: "https://example.com/audio/negotiate.mp3",
    senses: [
      {
        partOfSpeech: "Verb",
        meaning: "đàm phán",
        definitionEn: "To discuss something with someone in order to reach an agreement.",
        synonyms: "bargain, mediate",
      },
    ],
  },
  {
    id: "w2",
    word: "invoice",
    partOfSpeech: "Noun",
    meaning: "hóa đơn",
    example: "Please pay the invoice within 30 days.",
    audioUrl: "", // Missing audio!
  },
  {
    id: "w3",
    word: "proposal",
    partOfSpeech: "Noun",
    meaning: "bản đề xuất",
    example: "The committee rejected the previous proposal.",
  },
  {
    id: "w4",
    word: "strategy",
    partOfSpeech: "Noun",
    meaning: "chiến lược",
  },
];

describe("Battleship Question Generator", () => {
  it("creates word mask for medium difficulty correctly", () => {
    assert.equal(createWordMask("negotiate"), "n _ _ _ _ _ _ _ _");
    assert.equal(createWordMask("ship"), "s _ _ _");
    assert.equal(createWordMask("at"), "at");
  });

  it("masks target word inside example sentence case-insensitively", () => {
    const masked = maskWordInSentence("The manager will negotiate the terms.", "negotiate");
    assert.equal(masked, "The manager will 【 _____ 】 the terms.");

    // Stem matching
    const stemMasked = maskWordInSentence("The team is negotiating now.", "negotiate");
    assert.equal(stemMasked, "The team is 【 _____ 】 now.");

    // If word is absent, returns null
    const absent = maskWordInSentence("A completely unrelated sentence.", "negotiate");
    assert.equal(absent, null);
  });

  it("collects accepted answers including synonyms and base", () => {
    const answers = getAcceptedAnswersForWord(mockWords[0]);
    assert.ok(answers.includes("negotiate"));
    assert.ok(answers.includes("bargain"));
    assert.ok(answers.includes("mediate"));
  });

  it("generates 3 distinct distractors from word pool", () => {
    const distractors = generateDistractors(mockWords[0], mockWords, 3);
    assert.equal(distractors.length, 3);
    assert.ok(!distractors.includes("negotiate"));
    assert.equal(new Set(distractors).size, 3);
  });

  it("falls back gracefully when audio is missing for audio question", () => {
    // mockWords[1] ('invoice') has no audio
    const q = buildBattleQuestion(mockWords[1], 0, "audio", "medium", mockWords);
    // Should fallback to meaning or definition, not remain audio
    assert.notEqual(q.type, "audio");
    assert.equal(q.prompt, "hóa đơn");
  });

  it("falls back gracefully when example doesn't contain target word for blank question", () => {
    const badExampleWord: WordItem = {
      id: "w-bad",
      word: "cruiser",
      meaning: "tuần dương hạm",
      example: "This example does not contain the target.",
    };
    const q = buildBattleQuestion(badExampleWord, 0, "blank", "hard", mockWords);
    // Should fallback from blank to meaning
    assert.equal(q.type, "meaning");
    assert.equal(q.prompt, "tuần dương hạm");
  });

  it("creates multiple choice options for easy difficulty", () => {
    const q = buildBattleQuestion(mockWords[0], 0, "meaning", "easy", mockWords);
    assert.ok(q.options !== undefined);
    assert.equal(q.options?.length, 4);
    assert.ok(q.options?.includes("negotiate"));
  });
});
