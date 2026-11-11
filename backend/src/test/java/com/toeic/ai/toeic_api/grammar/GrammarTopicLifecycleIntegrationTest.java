package com.toeic.ai.toeic_api.grammar;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
class GrammarTopicLifecycleIntegrationTest {

    @Autowired
    private GrammarService grammarService;

    @Autowired
    private JdbcTemplate jdbc;

    @AfterEach
    void cleanUpFixtures() {
        jdbc.update("""
                DELETE FROM grammar_topic_questions
                WHERE topic_id LIKE 'lifecycle-%'
                """);
        jdbc.update("UPDATE grammar_topics SET parent_topic_id = NULL WHERE id LIKE 'lifecycle-%'");
        jdbc.update("DELETE FROM grammar_topic_vocabulary_words WHERE topic_id LIKE 'lifecycle-%'");
        jdbc.update("DELETE FROM grammar_topics WHERE id LIKE 'lifecycle-%'");
        jdbc.update("""
                DELETE FROM toeic_question_bank bank
                WHERE bank.question_text = 'A linked question'
                  AND NOT EXISTS (SELECT 1 FROM grammar_topic_questions link WHERE link.question_id = bank.id)
                """);
    }

    @Test
    void deletesTopicWithoutChildrenAfterConfirmation() {
        String topicId = createTopic("Delete empty");

        grammarService.deleteTopic(topicId, new GrammarService.DeleteTopicRequest("NONE", null));

        assertThat(topicExists(topicId)).isFalse();
    }

    @Test
    void refusesToDeleteParentUntilChildHandlingIsSelected() {
        String parentId = createTopic("Parent");
        String childId = createTopic("Child", parentId);

        assertThatThrownBy(() -> grammarService.deleteTopic(
                parentId, new GrammarService.DeleteTopicRequest("NONE", null)))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));

        assertThat(topicExists(parentId)).isTrue();
        assertThat(parentOf(childId)).isEqualTo(parentId);
    }

    @Test
    void promotesDirectChildrenAndPreservesNestedContentWhenDeletingParent() {
        String parentId = createTopic("Parent");
        String childId = createTopic("Child", parentId);
        String grandchildId = createTopic("Grandchild", childId);

        grammarService.deleteTopic(parentId, new GrammarService.DeleteTopicRequest("ROOTS", null));

        assertThat(topicExists(parentId)).isFalse();
        assertThat(parentOf(childId)).isNull();
        assertThat(parentOf(grandchildId)).isEqualTo(childId);
        assertThat(jdbc.queryForObject("SELECT questions::text FROM grammar_topics WHERE id = ?",
                String.class, childId)).contains("preserved question");
        assertThat(jdbc.queryForObject("SELECT examples::text FROM grammar_topics WHERE id = ?",
                String.class, childId)).contains("preserved example");
        assertThat(jdbc.queryForObject("SELECT theory::text FROM grammar_topics WHERE id = ?",
                String.class, childId)).contains("preserved theory");
    }

    @Test
    void movesChildrenToAnotherParentAndRejectsMoveIntoSelfOrDescendant() {
        String parentId = createTopic("Parent");
        String targetId = createTopic("Target");
        String childId = createTopic("Child", parentId);
        String grandchildId = createTopic("Grandchild", childId);

        assertThatThrownBy(() -> grammarService.deleteTopic(
                parentId, new GrammarService.DeleteTopicRequest("MOVE", grandchildId)))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
        assertThatThrownBy(() -> grammarService.deleteTopic(
                parentId, new GrammarService.DeleteTopicRequest("MOVE", parentId)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(parentOf(childId)).isEqualTo(parentId);

        grammarService.deleteTopic(parentId, new GrammarService.DeleteTopicRequest("MOVE", targetId));

        assertThat(topicExists(parentId)).isFalse();
        assertThat(parentOf(childId)).isEqualTo(targetId);
        assertThat(parentOf(grandchildId)).isEqualTo(childId);
        assertThat(jdbc.queryForObject("SELECT questions::text FROM grammar_topics WHERE id = ?",
                String.class, childId)).contains("preserved question");
    }

    @Test
    void archiveKeepsPublishedChildrenAccessibleAndRestoreReturnsOriginalStatus() {
        String parentId = createTopic("Published parent");
        String childId = createTopic("Published child", parentId);
        String grandchildId = createTopic("Nested child", childId);

        grammarService.archiveTopic(parentId);

        assertThat(statusOf(parentId)).isEqualTo("ARCHIVED");
        assertThat(parentOf(childId)).isNull();
        assertThat(statusOf(childId)).isEqualTo("PUBLISHED");
        assertThat(parentOf(grandchildId)).isEqualTo(childId);
        List<GrammarService.GrammarTopic> activeTopics = grammarService.listTopics(null);
        assertThat(containsTopic(activeTopics, parentId)).isFalse();
        assertThat(containsTopic(activeTopics, childId)).isTrue();
        assertThat(containsTopicWithStatus(grammarService.listAdminTopics(null), parentId, "ARCHIVED")).isTrue();
        assertThat(jdbc.queryForObject("SELECT archived_at IS NOT NULL FROM grammar_topics WHERE id = ?",
                Boolean.class, parentId)).isTrue();
        assertThat(jdbc.queryForObject("SELECT questions::text FROM grammar_topics WHERE id = ?",
                String.class, childId)).contains("preserved question");

        GrammarService.GrammarTopic restored = grammarService.restoreTopic(parentId);

        assertThat(restored.status()).isEqualTo("PUBLISHED");
        assertThat(restored.archivedAt()).isNull();
    }

    @Test
    void archivingChildPromotesItsChildrenWithoutDeletingContent() {
        String parentId = createTopic("Parent");
        String childId = createTopic("Child", parentId);
        String grandchildId = createTopic("Grandchild", childId);

        grammarService.archiveTopic(childId);

        assertThat(statusOf(childId)).isEqualTo("ARCHIVED");
        assertThat(parentOf(childId)).isEqualTo(parentId);
        assertThat(parentOf(grandchildId)).isNull();
        assertThat(topicExists(grandchildId)).isTrue();

        GrammarService.GrammarTopic restored = grammarService.restoreTopic(childId);
        assertThat(restored.status()).isEqualTo("PUBLISHED");
        assertThat(parentOf(grandchildId)).isNull();
    }

    @Test
    void refusesDeletionWhenToeicQuestionLinksExistAndPreservesTheQuestion() {
        String topicId = createTopic("Linked question");
        Long questionId = jdbc.queryForObject("""
                INSERT INTO toeic_question_bank (part, question_text, correct_answer)
                VALUES ('PART_5', 'A linked question', 'A')
                RETURNING id
                """, Long.class);
        jdbc.update("""
                INSERT INTO grammar_topic_questions (topic_id, question_id, order_index)
                VALUES (?, ?, 0)
                """, topicId, questionId);

        assertThatThrownBy(() -> grammarService.deleteTopic(
                topicId, new GrammarService.DeleteTopicRequest("NONE", null)))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));

        assertThat(topicExists(topicId)).isTrue();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM grammar_topic_questions WHERE topic_id = ?",
                Integer.class, topicId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM toeic_question_bank WHERE id = ?",
                Integer.class, questionId)).isEqualTo(1);
    }

    @Test
    void grammarForeignKeysRestrictDeletesInsteadOfCascading() {
        assertThat(foreignKeyDeleteAction("fk_grammar_topics_parent")).isEqualTo("r");
        assertThat(foreignKeyDeleteAction("fk_user_grammar_progress_topic")).isEqualTo("r");
        assertThat(foreignKeyDeleteAction("fk_grammar_topic_questions_topic")).isEqualTo("r");
        assertThat(foreignKeyDeleteAction("fk_grammar_topic_vocabulary_words_topic")).isEqualTo("r");
    }

    private String createTopic(String label) {
        return createTopic(label, null);
    }

    private String createTopic(String label, String parentId) {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        String id = "lifecycle-" + suffix;
        jdbc.update("""
                INSERT INTO grammar_topics
                    (id, code, title, status, questions, examples, theory, parent_topic_id)
                VALUES (?, ?, ?, 'PUBLISHED',
                        '[{"questionText":"preserved question"}]'::jsonb,
                        '[{"sentence":"preserved example"}]'::jsonb,
                        '{"rule":"preserved theory"}'::jsonb,
                        ?)
                """, id, "LIFE-" + suffix, label + " " + suffix, parentId);
        return id;
    }

    private boolean topicExists(String id) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM grammar_topics WHERE id = ?)",
                Boolean.class, id));
    }

    private String parentOf(String id) {
        return jdbc.queryForObject("SELECT parent_topic_id FROM grammar_topics WHERE id = ?", String.class, id);
    }

    private String statusOf(String id) {
        return jdbc.queryForObject("SELECT status FROM grammar_topics WHERE id = ?", String.class, id);
    }

    private boolean containsTopic(List<GrammarService.GrammarTopic> topics, String topicId) {
        for (GrammarService.GrammarTopic topic : topics) {
            if (topic != null && topicId.equals(topic.id())) {
                return true;
            }
        }
        return false;
    }

    private boolean containsTopicWithStatus(
            List<GrammarService.GrammarTopic> topics, String topicId, String expectedStatus) {
        for (GrammarService.GrammarTopic topic : topics) {
            if (topic != null && topicId.equals(topic.id()) && expectedStatus.equals(topic.status())) {
                return true;
            }
        }
        return false;
    }

    private String foreignKeyDeleteAction(String constraintName) {
        return jdbc.queryForObject(
                "SELECT confdeltype::text FROM pg_constraint WHERE conname = ?",
                String.class, constraintName);
    }
}
