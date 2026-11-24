package com.toeic.ai.toeic_api.vocabulary;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Pure business logic calculator for Memory Match (and potential future games) scoring,
 * rating tiers, star allocation, error classification (exploratory vs avoidable),
 * and wrong-word diagnostics.
 */
public final class GameScoringCalculator {

    public static final double TIER_S_RATIO = 0.75;
    public static final double TIER_A_RATIO = 1.25;
    public static final double TIER_B_RATIO = 2.0;

    public static final int BASE_POINTS_PER_PAIR = 100;
    public static final int COMBO_BONUS_PER_STEP = 10;
    public static final double SECONDS_PER_PAIR_PAR = 6.0;
    public static final int MAX_TIME_BONUS_PER_PAIR = 30;
    public static final int AVOIDABLE_MISTAKE_PENALTY = 15;
    public static final int MIN_POINTS_PER_PAIR_COMPLETED = 10;
    public static final int INCOMPLETE_POINTS_PER_MATCHED = 50;

    private GameScoringCalculator() {}

    public record MemoryMatchAttempt(
            String firstWordId,
            String secondWordId,
            boolean isCorrect,
            int attemptIndex
    ) {}

    public record WordInfo(
            String id,
            String word,
            String meaning
    ) {}

    public record WrongWordDetail(
            String vocabularyId,
            String word,
            String meaning,
            int wrongCount,
            int avoidableCount,
            boolean matched,
            List<String> confusedWith
    ) {}

    public record MemoryMatchResult(
            int score,
            String tier, // S, A, B, C, INCOMPLETE
            int stars,   // 0 - 3
            int accuracy,
            int correct,
            int wrong,
            int avoidableMistakes,
            int maxCombo,
            int durationSeconds,
            List<WrongWordDetail> wrongWords
    ) {}

    public static MemoryMatchResult calculateMemoryMatchResult(
            int totalPairsN,
            int durationSeconds,
            int maxCombo,
            List<MemoryMatchAttempt> attempts,
            Map<String, WordInfo> wordInfoMap
    ) {
        final List<MemoryMatchAttempt> safeAttempts = attempts == null ? List.of() : attempts;
        final Map<String, WordInfo> safeWordInfoMap = wordInfoMap == null ? Map.of() : wordInfoMap;

        // Sort attempts chronologically by attemptIndex
        List<MemoryMatchAttempt> sortedAttempts = safeAttempts.stream()
                .sorted(Comparator.comparingInt(MemoryMatchAttempt::attemptIndex))
                .toList();

        Set<String> seenEnglishCards = new HashSet<>();
        Set<String> seenVietnameseCards = new HashSet<>();
        Set<String> seenMismatchPairs = new HashSet<>();
        Set<String> matchedWords = new HashSet<>();

        Map<String, Integer> wrongCountMap = new HashMap<>();
        Map<String, Integer> avoidableCountMap = new HashMap<>();
        Map<String, Map<String, Integer>> confusionMap = new HashMap<>();

        int avoidableMistakes = 0;
        int totalWrong = 0;

        for (MemoryMatchAttempt attempt : sortedAttempts) {
            String first = attempt.firstWordId();
            String second = attempt.secondWordId();

            if (attempt.isCorrect()) {
                matchedWords.add(first);
                seenEnglishCards.add(first);
                seenVietnameseCards.add(second);
            } else {
                totalWrong++;
                wrongCountMap.put(first, wrongCountMap.getOrDefault(first, 0) + 1);
                wrongCountMap.put(second, wrongCountMap.getOrDefault(second, 0) + 1);

                confusionMap.computeIfAbsent(first, k -> new HashMap<>())
                        .merge(second, 1, Integer::sum);
                confusionMap.computeIfAbsent(second, k -> new HashMap<>())
                        .merge(first, 1, Integer::sum);

                String pairKey = first + "::" + second;
                boolean firstCounterpartSeen = seenVietnameseCards.contains(first);
                boolean secondCounterpartSeen = seenEnglishCards.contains(second);
                boolean repeatedMismatch = seenMismatchPairs.contains(pairKey);

                boolean isAvoidable = firstCounterpartSeen || secondCounterpartSeen || repeatedMismatch;
                if (isAvoidable) {
                    avoidableMistakes++;
                    if (firstCounterpartSeen || repeatedMismatch) {
                        avoidableCountMap.put(first, avoidableCountMap.getOrDefault(first, 0) + 1);
                    }
                    if (secondCounterpartSeen || repeatedMismatch) {
                        avoidableCountMap.put(second, avoidableCountMap.getOrDefault(second, 0) + 1);
                    }
                }

                seenEnglishCards.add(first);
                seenVietnameseCards.add(second);
                seenMismatchPairs.add(pairKey);
            }
        }

        int matchedPairs = matchedWords.size();
        int effectiveN = totalPairsN > 0 ? totalPairsN : Math.max(matchedPairs, wrongCountMap.size());
        if (effectiveN <= 0) {
            effectiveN = 1;
        }

        boolean isCompleted = matchedPairs >= effectiveN && matchedPairs > 0;

        // Tier & Stars
        String tier;
        int stars;
        if (!isCompleted) {
            tier = "INCOMPLETE";
            stars = 0;
        } else {
            double r = (double) totalWrong / effectiveN;
            if (r <= TIER_S_RATIO) {
                tier = "S";
                stars = 3;
            } else if (r <= TIER_A_RATIO) {
                tier = "A";
                stars = 2;
            } else if (r <= TIER_B_RATIO) {
                tier = "B";
                stars = 1;
            } else {
                tier = "C";
                stars = 0;
            }
        }

        // Score
        int score;
        if (isCompleted) {
            int base = BASE_POINTS_PER_PAIR * effectiveN;
            int comboBonus = COMBO_BONUS_PER_STEP * Math.min(maxCombo, effectiveN);
            double par = SECONDS_PER_PAIR_PAR * effectiveN;
            double timeRatio = par > 0 ? Math.max(0.0, Math.min(1.0, (par - durationSeconds) / par)) : 0.0;
            int timeBonus = (int) (MAX_TIME_BONUS_PER_PAIR * effectiveN * timeRatio);
            int penalty = AVOIDABLE_MISTAKE_PENALTY * avoidableMistakes;
            score = Math.max(MIN_POINTS_PER_PAIR_COMPLETED * effectiveN, base + comboBonus + timeBonus - penalty);
        } else {
            score = INCOMPLETE_POINTS_PER_MATCHED * matchedPairs;
        }

        // Accuracy
        int totalAnswered = matchedPairs + totalWrong;
        int accuracy = totalAnswered > 0
                ? (int) Math.round(((double) matchedPairs / totalAnswered) * 100.0)
                : 0;

        // Wrong words list
        List<WrongWordDetail> wrongWords = new ArrayList<>();
        for (String wordId : wrongCountMap.keySet()) {
            WordInfo info = safeWordInfoMap.get(wordId);
            String wordText = info != null && info.word() != null ? info.word() : wordId;
            String meaningText = info != null && info.meaning() != null ? info.meaning() : "";
            int wrongCount = wrongCountMap.get(wordId);
            int avoidableCount = avoidableCountMap.getOrDefault(wordId, 0);
            boolean matched = matchedWords.contains(wordId);

            Map<String, Integer> wordConfusions = confusionMap.getOrDefault(wordId, Map.of());
            List<String> topConfused = wordConfusions.entrySet().stream()
                    .sorted((e1, e2) -> {
                        int cmp = Integer.compare(e2.getValue(), e1.getValue());
                        if (cmp != 0) return cmp;
                        return e1.getKey().compareTo(e2.getKey());
                    })
                    .limit(3)
                    .map(entry -> {
                        WordInfo confusedInfo = safeWordInfoMap.get(entry.getKey());
                        return confusedInfo != null && confusedInfo.word() != null
                                ? confusedInfo.word()
                                : entry.getKey();
                    })
                    .toList();

            wrongWords.add(new WrongWordDetail(
                    wordId,
                    wordText,
                    meaningText,
                    wrongCount,
                    avoidableCount,
                    matched,
                    topConfused
            ));
        }

        // Sort wrongWords: unmatched first, then wrongCount DESC, then word ASC
        wrongWords.sort((a, b) -> {
            int matchedCmp = Boolean.compare(a.matched(), b.matched()); // false (unmatched) comes first
            if (matchedCmp != 0) return matchedCmp;
            int countCmp = Integer.compare(b.wrongCount(), a.wrongCount()); // wrongCount DESC
            if (countCmp != 0) return countCmp;
            return a.word().compareToIgnoreCase(b.word());
        });

        return new MemoryMatchResult(
                score,
                tier,
                stars,
                accuracy,
                matchedPairs,
                totalWrong,
                avoidableMistakes,
                maxCombo,
                durationSeconds,
                wrongWords
        );
    }
}
