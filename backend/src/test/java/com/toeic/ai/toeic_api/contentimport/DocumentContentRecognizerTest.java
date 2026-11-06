package com.toeic.ai.toeic_api.contentimport;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

class DocumentContentRecognizerTest {
    private final DocumentContentRecognizer recognizer = new DocumentContentRecognizer("", "gemini-2.5-flash");

    @Test
    void combinesVocabularyParsingStrategiesToRecoverMixedLayoutRows() {
        String text = """
                1.
                ability
                n.
                năng lực
                benefit (n): lợi ích
                2.
                contribute
                v.
                đóng góp
                """;

        var recognized = recognizer.recognize(ContentType.VOCABULARY, text);

        assertThat(recognized).extracting(item -> item.get("word"))
                .containsExactly("ability", "contribute", "benefit");
    }

    @Test
    void parsesGrammarQAWithInlineOptionsAndArrowAnswer() {
        String text = """
                CHUYÊN ĐỀ 1
                PHÁT ÂM - PRONUNCIATION
                Chọn từ có phần gạch chân được phát âm khác so với các từ còn lại.
                Exercise 1:
                1. A. head B. please C. heavy D. measure
                 /hed/ / pliːz / /'hevi/ /ˈmeʒə (r)/
                ⭢ Đáp án: B
                2. A. note B. gloves C. some D. other
                 / nəʊt / / ɡlʌvz / / sʌm / /ˈʌðə(r)/
                ⭢ Đáp án: A
                3. A. comb B. climb C. bomb D. baby
                 / kəʊm / / klaɪm / / ˈbɒm / / ˈbeɪbi /
                ⭢ Đáp án: D (âm /b/ luôn bị nuốt sau âm /m/)
                """;

        var recognized = recognizer.recognize(ContentType.GRAMMAR, text);

        assertThat(recognized).isNotEmpty();
        Map<String, Object> topic = recognized.get(0);
        assertThat(topic.get("title")).asString().contains("CHUYÊN ĐỀ 1");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> questions = (List<Map<String, Object>>) topic.get("gradedQuestions");
        assertThat(questions).hasSize(3);

        // Câu 1
        assertThat(questions.get(0).get("correctAnswer")).isEqualTo("B");
        @SuppressWarnings("unchecked")
        Map<String, String> opts1 = (Map<String, String>) questions.get(0).get("options");
        assertThat(opts1.get("A")).isEqualTo("head");
        assertThat(opts1.get("B")).isEqualTo("please");
        assertThat(opts1.get("C")).isEqualTo("heavy");
        assertThat(opts1.get("D")).isEqualTo("measure");

        // Câu 2
        assertThat(questions.get(1).get("correctAnswer")).isEqualTo("A");

        // Câu 3: có giải thích
        assertThat(questions.get(2).get("correctAnswer")).isEqualTo("D");
        assertThat(questions.get(2).get("solutionMethod")).asString().contains("âm /b/ luôn bị nuốt");
    }

    @Test
    void parsesGrammarQATableFormat() {
        String text = """
                CHUYÊN ĐỀ 2
                TRỌNG ÂM – STRESS
                1. Trọng âm theo phiên âm
                Đáp án và giải thích
                STT Đáp án Giải thích chi tiết đáp án
                1 D A. writer /ˈraɪtə/: trọng âm rơi vào âm tiết thứ nhất. B. carefully: ... C. industry: ... D. comply: ... => Đáp án D trọng âm rơi vào âm tiết thứ hai.
                2 C A. enter: ... B. country: ... C. canal: ... D. cover: ... => Đáp án C trọng âm rơi vào âm thứ hai.
                """;

        var recognized = recognizer.recognize(ContentType.GRAMMAR, text);

        assertThat(recognized).isNotEmpty();
        Map<String, Object> topic = recognized.get(0);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> questions = (List<Map<String, Object>>) topic.get("gradedQuestions");
        assertThat(questions).hasSize(2);
        assertThat(questions.get(0).get("correctAnswer")).isEqualTo("D");
        assertThat(questions.get(1).get("correctAnswer")).isEqualTo("C");
    }

    @Test
    void parsesGrammarFillInBlankAnswers() {
        String text = """
                CHUYÊN ĐỀ 3
                THÌ ĐỘNG TỪ - VERB TENSES
                I. Thì hiện tại đơn - The present simple tense
                Đáp án
                1. He (go) __________ to school every day.
                => Đáp án: goes, do chủ ngữ là ngôi thứ ba số ít “He”.
                2. She (come) __________ from Germany.
                => Đáp án: comes, do chủ ngữ là ngôi thứ ba số ít “She”.
                """;

        var recognized = recognizer.recognize(ContentType.GRAMMAR, text);

        assertThat(recognized).isNotEmpty();
        Map<String, Object> topic = recognized.get(0);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> questions = (List<Map<String, Object>>) topic.get("gradedQuestions");
        assertThat(questions).hasSize(2);
        assertThat(questions.get(0).get("correctAnswer")).isEqualTo("goes");
        assertThat(questions.get(0).get("solutionMethod")).asString().contains("ngôi thứ ba số ít");
        assertThat(questions.get(1).get("correctAnswer")).isEqualTo("comes");
    }

    @Test
    void parsesRealPdfExtractedTextForPronunciationAndStress() {
        String page1Text = """
                Page 1
                CHUYÊN ĐỀ 1
                PHÁT ÂM - PRONUNCIATION
                Chọn từ có phần gạch chân được phát âm khác so với các từ còn lại.
                I. Cách làm bài tập chọn từ có phần gạch chân được phát âm khác so với các từ còn lại
                Đáp án
                Exercise 1:
                1. A. head        B. please        C. heavy        D. measure
                        /hed/        / pliːz /        /'hevi/        /ˈmeʒə (r)/
                ⭢ Đáp án: B
                2. A. note        B. gloves        C. some        D. other
                        / nəʊt /        / ɡlʌvz /        / sʌm /        /ˈʌðə(r)/
                ⭢ Đáp án: A
                3. A. now        B. how        C. blow        D. amount
                        /naʊ /        /haʊ/        / bləʊ /        / əˈmaʊnt /
                ⭢ Đáp án: C
                """;

        var recognized = recognizer.recognize(ContentType.GRAMMAR, page1Text);

        assertThat(recognized).isNotEmpty();
        Map<String, Object> topic = recognized.get(0);
        assertThat(topic.get("title")).asString().contains("CHUYÊN ĐỀ 1");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> questions = (List<Map<String, Object>>) topic.get("gradedQuestions");
        assertThat(questions).hasSize(3);

        assertThat(questions.get(0).get("correctAnswer")).isEqualTo("B");
        @SuppressWarnings("unchecked")
        Map<String, String> opts0 = (Map<String, String>) questions.get(0).get("options");
        assertThat(opts0.get("A")).isEqualTo("head");
        assertThat(opts0.get("B")).isEqualTo("please");
        assertThat(opts0.get("C")).isEqualTo("heavy");
        assertThat(opts0.get("D")).isEqualTo("measure");

        assertThat(questions.get(1).get("correctAnswer")).isEqualTo("A");
        assertThat(questions.get(2).get("correctAnswer")).isEqualTo("C");
    }

    @Test
    void parsesGrammarQuestionNumberedRevision() {
        String text = """
                REVISION 2 (Chuyên đề 6 -10)
                Đáp án
                Question 1 A
                Kiến thức: Cụm động từ
                throw away: vứt bỏ, bỏ phí
                Tạm dịch: Steve đã bỏ qua cơ hội.
                Question 2 B
                Kiến thức: Câu hỏi đuôi
                Tạm dịch: Không ai thích cách hành xử của anh ấy.
                """;

        var recognized = recognizer.recognize(ContentType.GRAMMAR, text);

        assertThat(recognized).isNotEmpty();
        Map<String, Object> topic = recognized.get(0);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> questions = (List<Map<String, Object>>) topic.get("gradedQuestions");
        assertThat(questions).hasSize(2);
        assertThat(questions.get(0).get("correctAnswer")).isEqualTo("A");
        assertThat(questions.get(1).get("correctAnswer")).isEqualTo("B");
    }
}