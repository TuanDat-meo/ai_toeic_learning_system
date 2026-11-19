package com.toeic.ai.toeic_api.vocabulary;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class BattleshipBattleServiceIntegrationTest {

    @Autowired
    private VocabularyService vocabularyService;

    @Autowired
    private JdbcTemplate jdbc;

    private UUID studentId;
    private UUID otherStudentId;
    private String setId;
    private String[] wordIds;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        otherStudentId = UUID.randomUUID();
        setId = "test-set-" + UUID.randomUUID();

        // Tạo 2 tài khoản học viên
        jdbc.update("INSERT INTO users (id, email, password_hash, full_name, role, status) VALUES (?, ?, 'hash', 'Student', 'STUDENT', 'ACTIVE')",
                studentId, "student-" + studentId + "@test.com");
        jdbc.update("INSERT INTO users (id, email, password_hash, full_name, role, status) VALUES (?, ?, 'hash', 'Other', 'STUDENT', 'ACTIVE')",
                otherStudentId, "other-" + otherStudentId + "@test.com");

        // Tạo bộ từ vựng test đã phát hành
        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, status, release_at, word_count)
                VALUES (?, 'TOEIC Battleship Fleet Test', '2026', 'BUSINESS', 'PUBLISHED', now() - interval '1 day', 10)
                """, setId);

        // Tạo 10 từ vựng cho trận đấu
        wordIds = new String[10];
        String[] words = {"anchor", "destroyer", "torpedo", "captain", "cruiser", "compass", "admiral", "cannon", "harbor", "vessel"};
        String[] meanings = {"mỏ neo", "tàu khu trục", "ngư lôi", "thuyền trưởng", "tuần dương hạm", "la bàn", "đô đốc", "đại bác", "bến cảng", "chiến hạm"};

        for (int i = 0; i < 10; i++) {
            wordIds[i] = "w-" + UUID.randomUUID();
            jdbc.update("""
                    INSERT INTO vocabulary_items (id, set_id, word, part_of_speech, meaning, order_index)
                    VALUES (?, ?, ?, 'Noun', ?, ?)
                    """, wordIds[i], setId, words[i], meanings[i], i);
        }
    }

    @Test
    void createsBattleSessionAndEnforcesSessionOwnership() {
        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "BATTLESHIP_VOCABULARY", List.of(setId)));

        assertThat(session.gameType()).isEqualTo("BATTLE");
        assertThat(session.setId()).isEqualTo(setId);

        // Người chơi khác không được truy cập phiên này
        assertThatThrownBy(() -> vocabularyService.getGameSession(otherStudentId, session.id()))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void serverIsSourceOfTruthForDamageComboAndState() {
        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "BATTLE", List.of(setId)));

        // Câu 0: Trả lời đúng từ "anchor"
        // Client cố tình gửi damage: 15.0 giả mạo -> Server phải ghi đè tính đúng 1.0 damage
        var ans0 = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[0], "GAME", "VIETNAMESE_TO_ENGLISH", "anchor", null, 1200,
                session.id(), 0, "correct", false, null, "patrol", 15.0, "single_deck", "A1"));

        assertThat(ans0.correct()).isTrue();
        assertThat(ans0.damage()).isEqualTo(1.0); // Server tự tính
        assertThat(ans0.playerHp()).isEqualTo(5);
        assertThat(ans0.enemyHp()).isEqualTo(11); // 12 - 1 = 11
        assertThat(ans0.combo()).isEqualTo(1);
        assertThat(ans0.score()).isEqualTo(10); // Câu đúng cơ bản 10 điểm
        assertThat(ans0.counterCharge()).isEqualTo(0);
        assertThat(ans0.isCritical()).isFalse();
        assertThat(ans0.battleState()).isEqualTo("AIMING");

        // Các câu 1, 2, 3: Đúng liên tiếp để tích lũy streak lên 4
        vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[1], "GAME", "VIETNAMESE_TO_ENGLISH", "destroyer", null, 1100, session.id(), 1));
        vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[2], "GAME", "VIETNAMESE_TO_ENGLISH", "torpedo", null, 1100, session.id(), 2));
        var ans3 = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[3], "GAME", "VIETNAMESE_TO_ENGLISH", "captain", null, 1100, session.id(), 3));

        assertThat(ans3.combo()).isEqualTo(4);
        assertThat(ans3.enemyHp()).isEqualTo(8); // 12 - 4 = 8

        // Câu 4 (chuỗi đúng thứ 5 liên tiếp) -> KÍCH HOẠT CRITICAL SHOT (2 SÁT THƯƠNG)
        var ans4 = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[4], "GAME", "VIETNAMESE_TO_ENGLISH", "cruiser", null, 900, session.id(), 4));

        assertThat(ans4.isCritical()).isTrue();
        assertThat(ans4.damage()).isEqualTo(2.0); // Critical deals 2 damage!
        assertThat(ans4.enemyHp()).isEqualTo(6); // 8 - 2 = 6
        assertThat(ans4.combo()).isEqualTo(5);
        // Điểm thưởng combo trần +20: base 10 + bonus 20 = 30
        assertThat(ans4.score()).isEqualTo(10 + 15 + 20 + 25 + 30);
    }

    @Test
    void nearMissDealsZeroDamageAndPreservesComboWithoutEnemyCharge() {
        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "BATTLE", List.of(setId)));

        // Câu 0 đúng
        vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[0], "GAME", "VIETNAMESE_TO_ENGLISH", "anchor", null, 1000, session.id(), 0));

        // Câu 1: Gần đúng (từ "cruiser" >= 6 ký tự, sai 1 chữ thành "cruisrr")
        var nearAns = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[4], "GAME", "VIETNAMESE_TO_ENGLISH", "cruisrr", null, 1500, session.id(), 1));

        assertThat(nearAns.result()).isEqualTo("near");
        assertThat(nearAns.damage()).isEqualTo(0.0); // 0 sát thương
        assertThat(nearAns.enemyHp()).isEqualTo(11); // Không mất máu
        assertThat(nearAns.combo()).isEqualTo(1); // Bảo toàn combo, không tăng
        assertThat(nearAns.counterCharge()).isEqualTo(0); // Không tăng nạp đạn của địch
    }

    @Test
    void enemyChargesAndCounterattacksAfterTwoWrongAnswers() {
        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "BATTLE", List.of(setId)));

        // Lần sai thứ 1: counterCharge tăng lên 1, người chơi chưa mất HP
        var wrong1 = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[0], "GAME", "VIETNAMESE_TO_ENGLISH", "wrong_answer", null, 1500, session.id(), 0));

        assertThat(wrong1.correct()).isFalse();
        assertThat(wrong1.counterCharge()).isEqualTo(1);
        assertThat(wrong1.playerHp()).isEqualTo(5);

        // Trả lời đúng ở câu kế tiếp: KHÔNG reset counterCharge (theo Mục 2.3)
        var correct1 = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[1], "GAME", "VIETNAMESE_TO_ENGLISH", "destroyer", null, 1200, session.id(), 1));

        assertThat(correct1.correct()).isTrue();
        assertThat(correct1.counterCharge()).isEqualTo(1); // Vẫn là 1

        // Lần sai thứ 2: Địch phản công! counterCharge reset về 0, người chơi mất 1 HP
        var wrong2 = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[2], "GAME", "VIETNAMESE_TO_ENGLISH", "another_wrong", null, 1500, session.id(), 2));

        assertThat(wrong2.correct()).isFalse();
        assertThat(wrong2.counterCharge()).isEqualTo(0);
        assertThat(wrong2.playerHp()).isEqualTo(4); // 5 - 1 = 4
        assertThat(wrong2.battleState()).isEqualTo("ENEMY_COUNTER");
    }

    @Test
    void rejectsOutOfOrderAndDuplicateAnswersSafely() {
        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "BATTLE", List.of(setId)));

        UUID requestId = UUID.randomUUID();

        // Câu 0 hợp lệ
        var first = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                requestId, wordIds[0], "GAME", "VIETNAMESE_TO_ENGLISH", "anchor", null, 1000, session.id(), 0));
        assertThat(first.duplicate()).isFalse();

        // Gửi lại đúng request đó (idempotency key) -> Trả về duplicate = true mà không cộng thêm điểm
        var dup = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                requestId, wordIds[0], "GAME", "VIETNAMESE_TO_ENGLISH", "anchor", null, 1000, session.id(), 0));
        assertThat(dup.duplicate()).isTrue();
        assertThat(dup.score()).isEqualTo(first.score());

        // Cố tình nhảy cóc sang câu 2 khi chưa trả lời câu 1 -> Chặn lỗi 409 CONFLICT
        assertThatThrownBy(() -> vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[2], "GAME", "VIETNAMESE_TO_ENGLISH", "torpedo", null, 1000, session.id(), 2)))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void restoresBattleStateOnPageReloadAndCompletesSessionWithMetrics() {
        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "BATTLE", List.of(setId)));

        vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[0], "GAME", "VIETNAMESE_TO_ENGLISH", "anchor", null, 1000, session.id(), 0));

        // Khôi phục trạng thái trận đấu
        var state = vocabularyService.getBattleSessionState(studentId, session.id());
        assertThat(state.events()).hasSize(1);
        assertThat(state.playerHp()).isEqualTo(5);
        assertThat(state.fleetHp()).isEqualTo(11);
        assertThat(state.battleState()).isEqualTo("AIMING");

        // Hoàn tất trận đấu
        var completed = vocabularyService.completeGameSession(studentId, session.id());
        assertThat(completed.completedAt()).isNotBlank();
        assertThat(completed.playerHpRemaining()).isEqualTo(5);
        assertThat(completed.fleetHpRemaining()).isEqualTo(11);
        assertThat(completed.won()).isFalse(); // Chưa hạ hết 12 HP hạm đội
    }

    @Test
    void completedBattleMetricsIncludeNearAnswersAndMatchLiveScore() {
        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "BATTLE", List.of(setId)));

        String[] correctAnswers = {"anchor", "destroyer", "torpedo", "captain", "cruiser"};
        for (int i = 0; i < correctAnswers.length; i++) {
            vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                    UUID.randomUUID(), wordIds[i], "GAME", "VIETNAMESE_TO_ENGLISH", correctAnswers[i], null,
                    1000, session.id(), i));
        }

        var nearAnswer = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[4], "GAME", "VIETNAMESE_TO_ENGLISH", "cruisrr", null,
                1000, session.id(), 5));
        assertThat(nearAnswer.result()).isEqualTo("near");
        assertThat(nearAnswer.score()).isEqualTo(115);

        var completed = vocabularyService.completeGameSession(studentId, session.id());
        assertThat(completed.score()).isEqualTo(nearAnswer.score());
        assertThat(completed.totalQuestions()).isEqualTo(6);
        assertThat(completed.correctCount()).isEqualTo(5);
        assertThat(completed.wrongCount()).isZero();
    }

    @Test
    void typingGameSessionUsesIndependentTypeAndPersistsAnswers() {
        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "TYPING", List.of(setId)));

        assertThat(session.gameType()).isEqualTo("TYPING");

        var answer = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordIds[0], "GAME", "TYPE_WORD", "anchor", null,
                900, session.id(), 0));
        assertThat(answer.correct()).isTrue();

        var completed = vocabularyService.completeGameSession(studentId, session.id());
        assertThat(completed.gameType()).isEqualTo("TYPING");
        assertThat(completed.score()).isEqualTo(10);
        assertThat(completed.correctCount()).isEqualTo(1);
        assertThat(completed.totalQuestions()).isEqualTo(1);
    }
}
