package com.toeic.ai.toeic_api.vocabulary;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@Transactional
class VocabularyLearningServiceIntegrationTest {
    @Autowired
    private VocabularyService vocabularyService;

    @Autowired
    private JdbcTemplate jdbc;

    private final UUID studentId = UUID.randomUUID();
    private final String setId = "test-vocabulary-" + UUID.randomUUID();
    private final String wordId = "test-word-" + UUID.randomUUID();

    @BeforeEach
    void setUp() {
        jdbc.update("""
                INSERT INTO users (id, email, password_hash, full_name, role, status)
                VALUES (?, ?, 'unused', 'Vocabulary test student', 'STUDENT', 'ACTIVE')
                """, studentId, studentId + "@example.test");
        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status)
                VALUES (?, 'Vocabulary integration test', '2026', 'TEST', 1, 'PUBLISHED')
                """, setId);
        jdbc.update("""
                INSERT INTO vocabulary_items (id, set_id, word, part_of_speech, meaning, order_index)
                VALUES (?, ?, 'invoice', 'Noun', 'hóa đơn', 0)
                """, wordId, setId);
    }

    @Test
    void recordsOneIdempotentAnswerAndUpdatesOnlyThatWordsReviewSchedule() {
        UUID requestId = UUID.randomUUID();
        var correct = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                requestId, wordId, "PRACTICE", "VIETNAMESE_TO_ENGLISH", " INVOICE! ", null, 2_500, null, null));
        var duplicate = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                requestId, wordId, "PRACTICE", "VIETNAMESE_TO_ENGLISH", " INVOICE! ", null, 2_500, null, null));

        assertThat(correct.correct()).isTrue();
        assertThat(correct.status()).isEqualTo("REVIEWING");
        assertThat(correct.nextReviewAt()).isNotBlank();
        assertThat(duplicate.duplicate()).isTrue();
        assertThat(duplicate.eventId()).isEqualTo(correct.eventId());
        assertThat(jdbc.queryForObject(
                "SELECT count(*) FROM vocabulary_learning_events WHERE user_id = ? AND word_id = ?",
                Integer.class, studentId, wordId)).isEqualTo(1);
        assertThat(jdbc.queryForObject(
                "SELECT completed_new_words FROM vocabulary_daily_goals WHERE user_id = ? AND goal_date = (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date",
                Integer.class, studentId)).isEqualTo(1);

        var incorrect = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordId, "PRACTICE", "VIETNAMESE_TO_ENGLISH", "receipt", null, 1_300, null, null));

        assertThat(incorrect.correct()).isFalse();
        assertThat(jdbc.queryForObject(
                "SELECT incorrect_count FROM user_vocabulary_progress WHERE user_id = ? AND word_id = ?",
                Integer.class, studentId, wordId)).isEqualTo(1);
        assertThat(jdbc.queryForObject(
                "SELECT completed_review FROM vocabulary_daily_goals WHERE user_id = ? AND goal_date = (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date",
                Integer.class, studentId)).isEqualTo(1);
        assertThat(vocabularyService.getLearningHistory(studentId, 20, "PRACTICE"))
                .hasSize(2)
                .extracting(historyItem -> historyItem.word())
                .containsOnly("invoice");
        assertThat(vocabularyService.getWeakVocabularyWords(studentId, 10))
                .singleElement()
                .satisfies(weakWord -> {
                    assertThat(weakWord.wordId()).isEqualTo(wordId);
                    assertThat(weakWord.incorrectCount()).isEqualTo(1);
                });
        assertThat(vocabularyService.getWeakVocabularyWords(UUID.randomUUID(), 10)).isEmpty();
        assertThat(vocabularyService.getDailyLearningStats(studentId))
                .singleElement()
                .satisfies(stat -> {
                    assertThat(stat.answerCount()).isEqualTo(2);
                    assertThat(stat.correctCount()).isEqualTo(1);
                });
        assertThat(vocabularyService.getDueReviewWords(UUID.randomUUID(), null, 50)).isEmpty();
        assertThatThrownBy(() -> vocabularyService.recordAnswer(studentId,
                new VocabularyService.RecordVocabularyAnswerRequest(
                        requestId, wordId, "PRACTICE", "VIETNAMESE_TO_ENGLISH", "receipt", null, 2_500, null, null)))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void derivesAndPersistsGameScoresFromServerValidatedAnswers() {
        String secondWordId = "test-word-" + UUID.randomUUID();
        jdbc.update("""
                INSERT INTO vocabulary_items (id, set_id, word, part_of_speech, meaning, order_index)
                VALUES (?, ?, 'receipt', 'Noun', 'biên nhận', 1)
                """, secondWordId, setId);
        String thirdWordId = "test-word-" + UUID.randomUUID();
        jdbc.update("""
                INSERT INTO vocabulary_items (id, set_id, word, part_of_speech, meaning, order_index)
                VALUES (?, ?, 'refund', 'Noun', 'hoàn tiền', 2)
                """, thirdWordId, setId);
        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "battle"));
        vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordId, "GAME", "VIETNAMESE_TO_ENGLISH", "invoice", null, 900, session.id(), 0));
        vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), secondWordId, "GAME", "VIETNAMESE_TO_ENGLISH", "receipt", null, 1_100, session.id(), 1));
        vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), thirdWordId, "GAME", "VIETNAMESE_TO_ENGLISH", "invoice", null, 1_400, session.id(), 2));

        var completed = vocabularyService.completeGameSession(studentId, session.id());
        var repeatedCompletion = vocabularyService.completeGameSession(studentId, session.id());

        assertThat(completed.score()).isEqualTo(25);
        assertThat(completed.correctCount()).isEqualTo(2);
        assertThat(completed.wrongCount()).isEqualTo(1);
        assertThat(completed.totalQuestions()).isEqualTo(3);
        assertThat(completed.maxCombo()).isEqualTo(2);
        assertThat(completed.completedAt()).isNotBlank();
        assertThat(repeatedCompletion).isEqualTo(completed);
        assertThat(vocabularyService.getGameScores(studentId, setId))
                .singleElement()
                .satisfies(score -> {
                    assertThat(score.gameType()).isEqualTo("BATTLE");
                    assertThat(score.bestScore()).isEqualTo(25);
                    assertThat(score.completedPlays()).isEqualTo(1);
                });
        assertThat(vocabularyService.getWeakVocabularyWords(studentId, 10))
                .singleElement()
                .satisfies(weakWord -> assertThat(weakWord.incorrectCount()).isEqualTo(1));
        assertThatThrownBy(() -> vocabularyService.recordAnswer(studentId,
                new VocabularyService.RecordVocabularyAnswerRequest(
                        UUID.randomUUID(), thirdWordId, "GAME", "VIETNAMESE_TO_ENGLISH", "invoice", null, 500, session.id(), 3)))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> vocabularyService.completeGameSession(UUID.randomUUID(), session.id()))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void createsSentenceQuestionPlanAndRejectsAnswerForAnotherWord() {
        jdbc.update("""
                UPDATE vocabulary_items
                SET example = 'The invoice is due tomorrow.', level = 'B1'
                WHERE id = ?
                """, wordId);
        for (String distractor : new String[] {"receipt", "refund", "payment"}) {
            jdbc.update("""
                    INSERT INTO vocabulary_items (id, set_id, word, part_of_speech, meaning, level, order_index)
                    VALUES (?, ?, ?, 'Noun', 'test meaning', 'B1', 1)
                    """, "test-word-" + UUID.randomUUID(), setId, distractor);
        }

        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "SENTENCE", null, "CLASSIC", null, 10));

        assertThat(session.mode()).isEqualTo("CLASSIC");
        assertThat(session.difficulty()).isEqualTo("MEDIUM");
        assertThat(session.questions()).hasSize(1);
        var question = session.questions().getFirst();
        assertThat(question.questionIndex()).isZero();
        assertThat(question.optionWordIds()).hasSize(4).contains(question.wordId());

        String correctWord = jdbc.queryForObject(
                "SELECT word FROM vocabulary_items WHERE id = ?", String.class, question.wordId());
        var answer = vocabularyService.recordAnswer(studentId,
                new VocabularyService.RecordVocabularyAnswerRequest(
                        UUID.randomUUID(), question.wordId(), "GAME", "FILL_IN_BLANK", correctWord, null,
                        1_000, session.id(), 0));
        assertThat(answer.correct()).isTrue();

        String distractorId = question.optionWordIds().stream()
                .filter(optionId -> !optionId.equals(question.wordId()))
                .findFirst()
                .orElseThrow();
        assertThatThrownBy(() -> vocabularyService.recordAnswer(studentId,
                new VocabularyService.RecordVocabularyAnswerRequest(
                        UUID.randomUUID(), distractorId, "GAME", "FILL_IN_BLANK", "receipt", null,
                        1_000, session.id(), 0)))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void filtersSentenceQuestionPlanBySelectedDifficulty() {
        jdbc.update("""
                UPDATE vocabulary_items
                SET example = 'The invoice is due tomorrow.', level = 'B1'
                WHERE id = ?
                """, wordId);
        for (String distractor : new String[] {"receipt", "refund", "payment"}) {
            jdbc.update("""
                    INSERT INTO vocabulary_items (id, set_id, word, part_of_speech, meaning, level, order_index)
                    VALUES (?, ?, ?, 'Noun', 'test meaning', 'B1', 1)
                    """, "test-word-" + UUID.randomUUID(), setId, distractor);
        }

        String easyWordId = "test-word-" + UUID.randomUUID();
        jdbc.update("""
                INSERT INTO vocabulary_items (id, set_id, word, part_of_speech, meaning, level, example, order_index)
                VALUES (?, ?, 'scholarship', 'Noun', 'test meaning', 'A2', 'She received a scholarship.', 5)
                """, easyWordId, setId);
        for (String distractor : new String[] {"allowance", "salary", "fee"}) {
            jdbc.update("""
                    INSERT INTO vocabulary_items (id, set_id, word, part_of_speech, meaning, level, order_index)
                    VALUES (?, ?, ?, 'Noun', 'test meaning', 'A2', 6)
                    """, "test-word-" + UUID.randomUUID(), setId, distractor);
        }

        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(
                        setId, "SENTENCE", null, "CLASSIC", null, 10, "EASY"));

        assertThat(session.difficulty()).isEqualTo("EASY");
        assertThat(session.questions()).singleElement()
                .satisfies(question -> assertThat(question.wordId()).isEqualTo(easyWordId));
    }

    @Test
    void createsAllLevelSentenceQuestionsAcrossEverySelectedDeck() {
        String secondSetId = "test-vocabulary-mixed-" + UUID.randomUUID();
        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status)
                VALUES (?, 'Second vocabulary deck', '2026', 'TEST', 3, 'PUBLISHED')
                """, secondSetId);
        jdbc.update("""
                UPDATE vocabulary_items
                SET example = 'The invoice is due tomorrow.', level = 'C2'
                WHERE id = ?
                """, wordId);
        for (String distractor : new String[] {"receipt", "refund", "payment"}) {
            jdbc.update("""
                    INSERT INTO vocabulary_items (id, set_id, word, part_of_speech, meaning, level, order_index)
                    VALUES (?, ?, ?, 'Noun', 'test meaning', 'C2', 1)
                    """, "test-word-" + UUID.randomUUID(), secondSetId, distractor);
        }

        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(
                        setId, "SENTENCE", java.util.List.of(setId, secondSetId), "CLASSIC", null, 10, "ALL"));

        assertThat(session.difficulty()).isEqualTo("ALL");
        assertThat(session.questions()).hasSize(1);
        assertThat(session.questions().getFirst().wordId()).isEqualTo(wordId);
        assertThat(session.questions().getFirst().optionWordIds())
                .filteredOn(optionId -> !optionId.equals(wordId))
                .allSatisfy(optionId -> assertThat(jdbc.queryForObject(
                        "SELECT set_id FROM vocabulary_items WHERE id = ?", String.class, optionId))
                        .isEqualTo(secondSetId));
    }

    @Test
    void startsTimeAttackWithServerEnforcedDurationAndScoringMode() {
        jdbc.update("""
                UPDATE vocabulary_items
                SET example = 'The invoice is due tomorrow.', level = 'B1'
                WHERE id = ?
                """, wordId);
        for (String distractor : new String[] {"receipt", "refund", "payment"}) {
            jdbc.update("""
                    INSERT INTO vocabulary_items (id, set_id, word, part_of_speech, meaning, level, order_index)
                    VALUES (?, ?, ?, 'Noun', 'test meaning', 'B1', 1)
                    """, "test-word-" + UUID.randomUUID(), setId, distractor);
        }

        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "SENTENCE", null, "TIME_ATTACK", 60, null));

        assertThat(session.mode()).isEqualTo("TIME_ATTACK");
        assertThat(session.timeLimitSeconds()).isEqualTo(60);
        assertThat(session.questions()).hasSize(1);
        var shortSession = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "SENTENCE", null, "TIME_ATTACK", 30, null));
        assertThat(shortSession.timeLimitSeconds()).isEqualTo(30);
        assertThatThrownBy(() -> vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "SENTENCE", null, "TIME_ATTACK", 45, null)))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void enforcesTimeAttackExpiryAndCalculatesSpeedBonusFromServerTime() {
        jdbc.update("""
                UPDATE vocabulary_items
                SET example = 'The invoice is due tomorrow.', level = 'B1'
                WHERE id = ?
                """, wordId);
        for (String distractor : new String[] {"receipt", "refund", "payment"}) {
            jdbc.update("""
                    INSERT INTO vocabulary_items (id, set_id, word, part_of_speech, meaning, level, order_index)
                    VALUES (?, ?, ?, 'Noun', 'test meaning', 'B1', 1)
                    """, "test-word-" + UUID.randomUUID(), setId, distractor);
        }

        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "SENTENCE", null, "TIME_ATTACK", 60, null));
        var question = session.questions().getFirst();
        String correctWord = jdbc.queryForObject(
                "SELECT word FROM vocabulary_items WHERE id = ?", String.class, question.wordId());
        UUID requestId = UUID.randomUUID();
        vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                requestId, question.wordId(), "GAME", "FILL_IN_BLANK", correctWord, null,
                600_000, session.id(), question.questionIndex()));
        jdbc.update("""
                UPDATE vocabulary_game_sessions
                SET started_at = now() - interval '61 seconds'
                WHERE id = ?
                """, session.id());
        jdbc.update("""
                UPDATE vocabulary_learning_events
                SET attempted_at = (
                    SELECT started_at + interval '1 second'
                    FROM vocabulary_game_sessions
                    WHERE id = ?
                )
                WHERE user_id = ? AND request_id = ?
                """, session.id(), studentId, requestId);
        vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                requestId, question.wordId(), "GAME", "FILL_IN_BLANK", correctWord, null,
                600_000, session.id(), question.questionIndex()));

        var completed = vocabularyService.completeGameSession(studentId, session.id());
        assertThat(completed.score()).isEqualTo(15);

        var expiredSession = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "SENTENCE", null, "TIME_ATTACK", 60, null));
        jdbc.update("""
                UPDATE vocabulary_game_sessions
                SET started_at = now() - interval '61 seconds'
                WHERE id = ?
                """, expiredSession.id());
        var expiredQuestion = expiredSession.questions().getFirst();
        String expiredWord = jdbc.queryForObject(
                "SELECT word FROM vocabulary_items WHERE id = ?", String.class, expiredQuestion.wordId());

        assertThatThrownBy(() -> vocabularyService.recordAnswer(studentId,
                new VocabularyService.RecordVocabularyAnswerRequest(
                        UUID.randomUUID(), expiredQuestion.wordId(), "GAME", "FILL_IN_BLANK", expiredWord,
                        null, 1_000, expiredSession.id(), expiredQuestion.questionIndex())))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void acceptsMoreThanFortyAnswersIncludingInSessionWordReview() {
        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "typing"));

        for (int questionIndex = 0; questionIndex <= 41; questionIndex++) {
            var answer = vocabularyService.recordAnswer(studentId,
                    new VocabularyService.RecordVocabularyAnswerRequest(
                            UUID.randomUUID(), wordId, "GAME", "VIETNAMESE_TO_ENGLISH", "invoice",
                            null, 900, session.id(), questionIndex));
            assertThat(answer.correct()).isTrue();
        }

        var completed = vocabularyService.completeGameSession(studentId, session.id());
        assertThat(completed.totalQuestions()).isEqualTo(42);
        assertThat(completed.correctCount()).isEqualTo(42);
        assertThat(completed.wrongCount()).isZero();
        assertThat(jdbc.queryForObject(
                "SELECT srs_interval_days FROM user_vocabulary_progress WHERE user_id = ? AND word_id = ?",
                Integer.class, studentId, wordId)).isEqualTo(365);
    }

    @Test
    void recordsFlashcardRatingsAsOrderedGameAnswers() {
        var session = vocabularyService.startGameSession(studentId,
                new VocabularyService.StartVocabularyGameRequest(setId, "flashcard"));
        var answer = vocabularyService.recordAnswer(studentId, new VocabularyService.RecordVocabularyAnswerRequest(
                UUID.randomUUID(), wordId, "GAME", "FLASHCARD_RATING", null, "GOOD", 1_000, session.id(), 0));

        assertThat(answer.correct()).isTrue();
        var completed = vocabularyService.completeGameSession(studentId, session.id());
        assertThat(completed.score()).isEqualTo(10);
        assertThat(completed.correctCount()).isEqualTo(1);
        assertThat(completed.maxCombo()).isEqualTo(1);
    }
}
