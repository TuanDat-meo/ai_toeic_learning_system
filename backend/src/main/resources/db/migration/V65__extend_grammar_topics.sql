ALTER TABLE grammar_topics
    ADD COLUMN grammar_group VARCHAR(64) NOT NULL DEFAULT 'other',
    ADD COLUMN parent_topic_id VARCHAR(64) REFERENCES grammar_topics(id) ON DELETE SET NULL,
    ADD COLUMN toeic_parts JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN difficulty VARCHAR(16) NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN theory JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN source_notes TEXT NOT NULL DEFAULT '';

CREATE TABLE grammar_categories (
    code VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    field_definitions JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT ck_grammar_category_code CHECK (code ~ '^[a-z][a-z0-9_]{1,63}$')
);

CREATE TABLE grammar_topic_vocabulary_words (
    topic_id VARCHAR(64) NOT NULL REFERENCES grammar_topics(id) ON DELETE CASCADE,
    vocabulary_item_id VARCHAR(64) NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
    part_of_speech VARCHAR(64) NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    PRIMARY KEY (topic_id, vocabulary_item_id)
);

CREATE INDEX idx_grammar_topic_vocabulary_words_order
    ON grammar_topic_vocabulary_words (topic_id, order_index);

INSERT INTO grammar_categories (code, name, field_definitions, is_system) VALUES
('parts_of_speech', 'Từ loại', '[{"key":"wordType","label":"Loại từ","options":["Noun","Verb","Adjective","Adverb","Pronoun","Article","Determiner","Numeral","Preposition","Conjunction"]},{"key":"grammaticalFunction","label":"Chức năng ngữ pháp"},{"key":"sentencePosition","label":"Vị trí trong câu"},{"key":"recognizableSuffixes","label":"Hậu tố nhận biết"},{"key":"relatedPrefixes","label":"Tiền tố liên quan"},{"key":"wordForms","label":"Các dạng biến thể"},{"key":"confusedWords","label":"Những từ dễ nhầm lẫn"}]'::jsonb, true),
('verb_tenses', 'Thì động từ', '[{"key":"tenseType","label":"Thì / dạng động từ","options":["Present Simple","Present Continuous","Present Perfect","Present Perfect Continuous","Past Simple","Past Continuous","Past Perfect","Past Perfect Continuous","Future Simple","Future Continuous","Future Perfect","Future Perfect Continuous"]},{"key":"affirmativeFormula","label":"Công thức khẳng định"},{"key":"negativeFormula","label":"Công thức phủ định"},{"key":"questionFormula","label":"Công thức nghi vấn"},{"key":"usage","label":"Cách dùng"},{"key":"timeMarkers","label":"Dấu hiệu thời gian"},{"key":"contrastWith","label":"Cách phân biệt với các thì khác"},{"key":"exceptions","label":"Trường hợp ngoại lệ"}]'::jsonb, true),
('verb_structures', 'Cấu trúc động từ', '[{"key":"structureType","label":"Loại cấu trúc động từ","options":["Infinitive","Gerund","Bare Infinitive","Modal Verbs","Phrasal Verbs","Subject-Verb Agreement","Transitive and Intransitive Verbs","Linking Verbs"]},{"key":"verbPattern","label":"Mẫu cấu trúc"},{"key":"followedBy","label":"Dạng từ theo sau"},{"key":"meaningChange","label":"Thay đổi ý nghĩa"},{"key":"commonVerbs","label":"Động từ thường gặp"},{"key":"exceptions","label":"Trường hợp đặc biệt"}]'::jsonb, true),
('passive_voice', 'Câu bị động', '[{"key":"passiveFormula","label":"Công thức bị động"},{"key":"activeToPassive","label":"Chuyển chủ động sang bị động"},{"key":"tenseForms","label":"Các dạng bị động theo thì"},{"key":"modalForms","label":"Bị động với động từ khuyết thiếu"},{"key":"specialStructures","label":"Cấu trúc bị động đặc biệt"},{"key":"cannotBePassive","label":"Trường hợp không dùng bị động"},{"key":"structureType","label":"Dạng bị động","options":["Passive Voice by tense","Passive Voice with Modal Verbs","Special Passive Structures","Causative Form"]}]'::jsonb, true),
('conditionals', 'Câu điều kiện', '[{"key":"conditionalType","label":"Loại câu điều kiện","options":["Zero Conditional","First Conditional","Second Conditional","Third Conditional","Mixed Conditional","Unless","Provided that","As long as"]},{"key":"ifClause","label":"Mệnh đề If"},{"key":"mainClause","label":"Mệnh đề chính"},{"key":"conditionalFormula","label":"Công thức từng loại"},{"key":"usage","label":"Cách sử dụng"},{"key":"variants","label":"Biến thể và trường hợp đặc biệt"},{"key":"distinguishTypes","label":"Cách phân biệt các loại"}]'::jsonb, true),
('clauses', 'Mệnh đề', '[{"key":"clauseType","label":"Loại mệnh đề","options":["Relative Clauses","Noun Clauses","Adverbial Clauses","Reduced Relative Clauses","Reduced Adverbial Clauses","Participial Clauses"]},{"key":"clauseFunction","label":"Vai trò trong câu"},{"key":"connectors","label":"Từ nối / đại từ quan hệ"},{"key":"clausePosition","label":"Vị trí mệnh đề"},{"key":"fullStructure","label":"Cấu trúc đầy đủ"},{"key":"reduction","label":"Cách rút gọn mệnh đề"},{"key":"reductionConditions","label":"Điều kiện rút gọn"}]'::jsonb, true),
('sentence_structures', 'Cấu trúc câu', '[{"key":"sentenceType","label":"Loại câu","options":["Simple Sentences","Compound Sentences","Complex Sentences","Compound-Complex Sentences","Word Order","Sentence Patterns","Inversion"]},{"key":"wordOrder","label":"Trật tự từ"},{"key":"sentencePatterns","label":"Mẫu câu"},{"key":"inversion","label":"Cấu trúc đảo ngữ"},{"key":"punctuation","label":"Dấu câu và liên kết"}]'::jsonb, true),
('comparison', 'So sánh', '[{"key":"comparisonType","label":"Dạng so sánh","options":["Comparative","Superlative","Equality Comparison","Double Comparison","Irregular Comparison"]},{"key":"objectCompared","label":"Đối tượng so sánh"},{"key":"comparisonFormula","label":"Công thức so sánh"},{"key":"irregularForms","label":"Tính từ / trạng từ bất quy tắc"},{"key":"specialStructures","label":"Cấu trúc so sánh đặc biệt"},{"key":"commonErrors","label":"Lỗi thường gặp"}]'::jsonb, true),
('prepositions_conjunctions', 'Giới từ và liên từ', '[{"key":"wordType","label":"Loại giới từ / liên từ","options":["Prepositions of Time","Prepositions of Place","Prepositions of Movement","Prepositional Phrases","Coordinating Conjunctions","Subordinating Conjunctions","Correlative Conjunctions"]},{"key":"semanticRelationship","label":"Quan hệ ý nghĩa"},{"key":"structure","label":"Cấu trúc đi kèm"},{"key":"position","label":"Vị trí trong câu"},{"key":"commonPairs","label":"Các cặp thường gặp"},{"key":"exceptions","label":"Trường hợp đặc biệt"}]'::jsonb, true),
('extended', 'Cấu trúc ngữ pháp mở rộng', '[{"key":"structureType","label":"Loại cấu trúc","options":["Articles","Quantifiers","Determiners","Possessive Structures","Emphasis","Parallel Structures","Reported Speech","Question Tags","Wishes","Cleft Sentences","Ellipsis","Other Grammar Structures"]},{"key":"usage","label":"Cách dùng"},{"key":"pattern","label":"Công thức / mẫu câu"},{"key":"variants","label":"Biến thể"},{"key":"commonErrors","label":"Lỗi thường gặp"}]'::jsonb, true),
('other', 'Khác', '[{"key":"structureType","label":"Dạng ngữ pháp"},{"key":"usage","label":"Cách dùng"},{"key":"pattern","label":"Cấu trúc chính"}]'::jsonb, true)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE grammar_topics
    ADD CONSTRAINT fk_grammar_topics_group
        FOREIGN KEY (grammar_group) REFERENCES grammar_categories(code),
    ADD CONSTRAINT ck_grammar_topics_difficulty
        CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    ADD CONSTRAINT ck_grammar_topics_parent_not_self
        CHECK (parent_topic_id IS NULL OR parent_topic_id <> id);

UPDATE grammar_topics
SET toeic_parts = (
        SELECT COALESCE(jsonb_agg(part_name ORDER BY part_name), '[]'::jsonb)
        FROM (VALUES ('Part 5', '5'), ('Part 6', '6'), ('Part 7', '7')) AS parts(part_name, token)
        WHERE grammar_topics.part ILIKE '%' || token || '%'
    )
WHERE toeic_parts = '[]'::jsonb;

UPDATE grammar_topics
SET target_score = CASE
        WHEN replace(upper(target_score), '-', '_') IN ('350_500', '500_750', '750_PLUS', 'ALL')
            THEN replace(upper(target_score), '-', '_')
        WHEN target_score ILIKE '%750%' OR target_score ILIKE '%850%' THEN '750_PLUS'
        WHEN target_score ILIKE '%500%' OR target_score ILIKE '%650%' THEN '500_750'
        ELSE '350_500'
    END;
