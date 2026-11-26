package com.toeic.ai.toeic_api.vocabulary;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class GameScoringCalculatorTest {

    private Map<String, GameScoringCalculator.WordInfo> createSampleWordInfoMap() {
        Map<String, GameScoringCalculator.WordInfo> map = new HashMap<>();
        map.put("w1", new GameScoringCalculator.WordInfo("w1", "apple", "quả táo"));
        map.put("w2", new GameScoringCalculator.WordInfo("w2", "banana", "quả chuối"));
        map.put("w3", new GameScoringCalculator.WordInfo("w3", "cat", "con mèo"));
        map.put("w4", new GameScoringCalculator.WordInfo("w4", "dog", "con chó"));
        map.put("w5", new GameScoringCalculator.WordInfo("w5", "elephant", "con voi"));
        return map;
    }

    @Test
    @DisplayName("a) 0 cặp đúng, 19 sai -> INCOMPLETE, score = 0, wrongWords được ghi nhận đầy đủ")
    void testZeroCorrectNineteenWrong() {
        List<GameScoringCalculator.MemoryMatchAttempt> attempts = new ArrayList<>();
        // 19 mismatches across w1, w2, w3, w4
        for (int i = 0; i < 19; i++) {
            String first = "w" + ((i % 4) + 1);
            String second = "w" + (((i + 1) % 4) + 1);
            attempts.add(new GameScoringCalculator.MemoryMatchAttempt(first, second, false, i));
        }

        GameScoringCalculator.MemoryMatchResult result = GameScoringCalculator.calculateMemoryMatchResult(
                4, // 4 pairs expected
                56, // 56 seconds
                0,  // maxCombo
                attempts,
                createSampleWordInfoMap()
        );

        assertEquals("INCOMPLETE", result.tier(), "Chưa ghép đủ cặp phải là INCOMPLETE");
        assertEquals(0, result.stars(), "INCOMPLETE phải có 0 sao");
        assertEquals(0, result.score(), "0 cặp đúng thì score = 50 * 0 = 0");
        assertEquals(0, result.accuracy(), "Accuracy 0%");
        assertEquals(0, result.correct(), "Correct count phải là 0");
        assertEquals(19, result.wrong(), "Wrong count phải là 19");
        assertFalse(result.wrongWords().isEmpty(), "Danh sách wrongWords phải có dữ liệu");

        // Kiểm tra tất cả từ sai đều có matched == false
        for (GameScoringCalculator.WrongWordDetail wd : result.wrongWords()) {
            assertFalse(wd.matched(), "Từ chưa được ghép thì matched phải là false");
            assertTrue(wd.wrongCount() > 0, "wrongCount phải lớn hơn 0");
            assertNotNull(wd.word(), "Tên từ vựng không được null");
            assertNotNull(wd.meaning(), "Nghĩa từ vựng không được null");
        }
    }

    @Test
    @DisplayName("b) Hoàn thành hoàn hảo, 0 sai -> S Tier, 3 sao, full điểm thưởng")
    void testPerfectCompletion() {
        List<GameScoringCalculator.MemoryMatchAttempt> attempts = List.of(
                new GameScoringCalculator.MemoryMatchAttempt("w1", "w1", true, 0),
                new GameScoringCalculator.MemoryMatchAttempt("w2", "w2", true, 1),
                new GameScoringCalculator.MemoryMatchAttempt("w3", "w3", true, 2),
                new GameScoringCalculator.MemoryMatchAttempt("w4", "w4", true, 3)
        );

        int N = 4;
        int durationSeconds = 12; // par = 6 * 4 = 24s. duration 12s -> timeRatio = 0.5
        int maxCombo = 4;

        GameScoringCalculator.MemoryMatchResult result = GameScoringCalculator.calculateMemoryMatchResult(
                N,
                durationSeconds,
                maxCombo,
                attempts,
                createSampleWordInfoMap()
        );

        assertEquals("S", result.tier(), "0 sai phải là S Tier");
        assertEquals(3, result.stars(), "S Tier phải có 3 sao");
        assertEquals(100, result.accuracy(), "Accuracy 100%");
        assertEquals(4, result.correct(), "Correct count là 4");
        assertEquals(0, result.wrong(), "Wrong count là 0");
        assertEquals(0, result.avoidableMistakes(), "Không có lỗi tránh được");
        assertTrue(result.wrongWords().isEmpty(), "Không có từ sai thì wrongWords phải rỗng");

        // Base = 100 * 4 = 400
        // comboBonus = 10 * min(4, 4) = 40
        // par = 24. timeRatio = (24 - 12)/24 = 0.5. timeBonus = (int)(30 * 4 * 0.5) = 60
        // penalty = 0
        // Total score = 400 + 40 + 60 = 500
        assertEquals(500, result.score(), "Điểm hoàn hảo phải tính đúng");
    }

    @Test
    @DisplayName("c) Chỉ có lỗi thăm dò (exploratory mismatches) -> Không bị phạt điểm penalty")
    void testOnlyExploratoryMistakes() {
        // N = 2: w1, w2
        // Attempt 0: lật English(w1) và Vietnamese(w2) -> Cả 2 chưa từng lộ thẻ đối ứng -> Thăm dò
        // Attempt 1: lật English(w1) và Vietnamese(w1) -> Đúng!
        // Attempt 2: lật English(w2) và Vietnamese(w2) -> Đúng!
        List<GameScoringCalculator.MemoryMatchAttempt> attempts = List.of(
                new GameScoringCalculator.MemoryMatchAttempt("w1", "w2", false, 0),
                new GameScoringCalculator.MemoryMatchAttempt("w1", "w1", true, 1),
                new GameScoringCalculator.MemoryMatchAttempt("w2", "w2", true, 2)
        );

        int N = 2;
        int durationSeconds = 12; // par = 12s -> timeBonus = 0
        int maxCombo = 2;

        GameScoringCalculator.MemoryMatchResult result = GameScoringCalculator.calculateMemoryMatchResult(
                N,
                durationSeconds,
                maxCombo,
                attempts,
                createSampleWordInfoMap()
        );

        assertEquals("S", result.tier(), "r = 1/2 = 0.5 <= 0.75 -> S Tier");
        assertEquals(3, result.stars(), "S Tier -> 3 sao");
        assertEquals(0, result.avoidableMistakes(), "Lỗi thăm dò không tính là avoidable");
        // Base = 100 * 2 = 200
        // comboBonus = 10 * min(2, 2) = 20
        // timeBonus = 0 (duration == par)
        // penalty = 15 * 0 = 0 (KHÔNG BỊ PHẠT)
        // Score = 200 + 20 - 0 = 220
        assertEquals(220, result.score(), "Không bị trừ điểm penalty do chỉ có lỗi thăm dò");

        // wrongWords có w1 và w2 nhưng avoidableCount = 0 và matched = true
        assertEquals(2, result.wrongWords().size());
        for (GameScoringCalculator.WrongWordDetail wd : result.wrongWords()) {
            assertTrue(wd.matched());
            assertEquals(1, wd.wrongCount());
            assertEquals(0, wd.avoidableCount());
        }
    }

    @Test
    @DisplayName("d) Có lỗi tránh được (avoidable) -> Bị phạt đúng 15 điểm mỗi lỗi")
    void testAvoidableMistakesPenalty() {
        // N = 2: w1, w2
        // Attempt 0: w1 (en) vs w2 (vi) -> Thăm dò (seenEn: w1, seenVi: w2)
        // Attempt 1: w2 (en) vs w1 (vi) -> Avoidable! Vì thẻ w2 (vi) đã từng lộ ở attempt 0 và w1 (en) đã từng lộ!
        // Attempt 2: w1 (en) vs w1 (vi) -> Đúng
        // Attempt 3: w2 (en) vs w2 (vi) -> Đúng
        List<GameScoringCalculator.MemoryMatchAttempt> attempts = List.of(
                new GameScoringCalculator.MemoryMatchAttempt("w1", "w2", false, 0),
                new GameScoringCalculator.MemoryMatchAttempt("w2", "w1", false, 1),
                new GameScoringCalculator.MemoryMatchAttempt("w1", "w1", true, 2),
                new GameScoringCalculator.MemoryMatchAttempt("w2", "w2", true, 3)
        );

        int N = 2;
        int durationSeconds = 12; // par = 12s -> timeBonus = 0
        int maxCombo = 2;

        GameScoringCalculator.MemoryMatchResult result = GameScoringCalculator.calculateMemoryMatchResult(
                N,
                durationSeconds,
                maxCombo,
                attempts,
                createSampleWordInfoMap()
        );

        assertEquals("A", result.tier(), "r = 2/2 = 1.0 <= 1.25 -> A Tier");
        assertEquals(2, result.stars(), "A Tier -> 2 sao");
        assertEquals(1, result.avoidableMistakes(), "Phải nhận diện đúng 1 lỗi tránh được");
        // Base = 200
        // comboBonus = 20
        // timeBonus = 0
        // penalty = 15 * 1 = 15
        // Score = 200 + 20 + 0 - 15 = 205
        assertEquals(205, result.score(), "Bị phạt đúng 15 điểm cho lỗi tránh được");
    }

    @Test
    @DisplayName("e) Hoàn thành quá chậm (duration > par) -> timeBonus = 0, không âm")
    void testSlowCompletionTimeBonusNonNegative() {
        List<GameScoringCalculator.MemoryMatchAttempt> attempts = List.of(
                new GameScoringCalculator.MemoryMatchAttempt("w1", "w1", true, 0),
                new GameScoringCalculator.MemoryMatchAttempt("w2", "w2", true, 1)
        );

        int N = 2;
        int durationSeconds = 300; // par = 12s. duration 300s rất chậm
        int maxCombo = 2;

        GameScoringCalculator.MemoryMatchResult result = GameScoringCalculator.calculateMemoryMatchResult(
                N,
                durationSeconds,
                maxCombo,
                attempts,
                createSampleWordInfoMap()
        );

        // Base = 200, comboBonus = 20, timeBonus = 0 (clamp at 0), penalty = 0
        // Score = 220
        assertEquals(220, result.score(), "timeBonus khi quá hạn phải bằng 0 chứ không bị âm");
    }

    @Test
    @DisplayName("f) Ranh giới các ngưỡng r = 0.75 (S/A), r = 1.25 (A/B), r = 2.0 (B/C)")
    void testTierThresholdBoundaries() {
        int N = 4;
        Map<String, GameScoringCalculator.WordInfo> wordMap = createSampleWordInfoMap();

        // Helper tạo attempts: 4 correct attempts + K wrong attempts
        java.util.function.IntFunction<GameScoringCalculator.MemoryMatchResult> runWithWrongCount = (wrongCount) -> {
            List<GameScoringCalculator.MemoryMatchAttempt> attempts = new ArrayList<>();
            for (int i = 0; i < wrongCount; i++) {
                // Toàn bộ là mismatches
                attempts.add(new GameScoringCalculator.MemoryMatchAttempt("w1", "w2", false, i));
            }
            // Sau đó ghép đúng cả 4 cặp
            attempts.add(new GameScoringCalculator.MemoryMatchAttempt("w1", "w1", true, wrongCount));
            attempts.add(new GameScoringCalculator.MemoryMatchAttempt("w2", "w2", true, wrongCount + 1));
            attempts.add(new GameScoringCalculator.MemoryMatchAttempt("w3", "w3", true, wrongCount + 2));
            attempts.add(new GameScoringCalculator.MemoryMatchAttempt("w4", "w4", true, wrongCount + 3));

            return GameScoringCalculator.calculateMemoryMatchResult(N, 24, 4, attempts, wordMap);
        };

        // 1. r = 3/4 = 0.75 <= 0.75 -> S Tier, 3 sao
        GameScoringCalculator.MemoryMatchResult resS = runWithWrongCount.apply(3);
        assertEquals("S", resS.tier());
        assertEquals(3, resS.stars());

        // 2. r = 4/4 = 1.0 > 0.75 và <= 1.25 -> A Tier, 2 sao
        GameScoringCalculator.MemoryMatchResult resA1 = runWithWrongCount.apply(4);
        assertEquals("A", resA1.tier());
        assertEquals(2, resA1.stars());

        // 3. r = 5/4 = 1.25 <= 1.25 -> A Tier, 2 sao
        GameScoringCalculator.MemoryMatchResult resA2 = runWithWrongCount.apply(5);
        assertEquals("A", resA2.tier());
        assertEquals(2, resA2.stars());

        // 4. r = 6/4 = 1.5 > 1.25 và <= 2.0 -> B Tier, 1 sao
        GameScoringCalculator.MemoryMatchResult resB1 = runWithWrongCount.apply(6);
        assertEquals("B", resB1.tier());
        assertEquals(1, resB1.stars());

        // 5. r = 8/4 = 2.0 <= 2.0 -> B Tier, 1 sao
        GameScoringCalculator.MemoryMatchResult resB2 = runWithWrongCount.apply(8);
        assertEquals("B", resB2.tier());
        assertEquals(1, resB2.stars());

        // 6. r = 9/4 = 2.25 > 2.0 -> C Tier, 0 sao
        GameScoringCalculator.MemoryMatchResult resC = runWithWrongCount.apply(9);
        assertEquals("C", resC.tier());
        assertEquals(0, resC.stars());
    }
}
