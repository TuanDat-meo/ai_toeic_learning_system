package com.toeic.ai.toeic_api.contentimport;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class DocumentContentRecognizer {
    private static final Logger log = LoggerFactory.getLogger(DocumentContentRecognizer.class);

    private static final Set<String> NOISE_LINES = Set.of(
            "stt", "từ vựng", "loại từ", "phiên âm", "nghĩa của từ", "nghĩa", "ví dụ",
            "mochimochi", "mochidemy.com", "page", "trang");

    private static final Set<String> COMMON_POS = Set.of(
            "n", "v", "adj", "adv", "prep", "conj", "pron", "interj", "abbr", "abbr.",
            "phr v", "noun", "verb", "adjective", "adverb", "preposition", "conjunction",
            "n, v", "v, n", "adj, adv", "adv, adj", "n, adj", "adj, n", "v, adj", "adj, v");

    private static final Pattern SINGLE_LINE_PATTERN = Pattern.compile(
            "^\\s*(?:\\d+[\\.\\)]\\s*)?([A-Za-z\\s\\-\\']{2,40})\\s*(?:[\\(\\[]([a-zA-Z\\s,\\.\\/]+)[\\)\\]])?\\s*(?:/([^/]+)/)?\\s*[:\\-–—]\\s*(.+)$");

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient geminiRestClient;
    private final String geminiApiKey;
    private final String geminiModel;

    public DocumentContentRecognizer(
            @Value("${gemini.api-key:}") String geminiApiKey,
            @Value("${gemini.model:gemini-2.5-flash}") String geminiModel) {
        this.geminiApiKey = geminiApiKey == null ? "" : geminiApiKey.trim();
        this.geminiModel = (geminiModel == null || geminiModel.isBlank()) ? "gemini-2.5-flash" : geminiModel.trim();
        this.geminiRestClient = RestClient.create("https://generativelanguage.googleapis.com");
    }

    public List<Map<String, Object>> recognize(ContentType type, String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return List.of();
        }

        // 1. Try JSON parsing if text looks like JSON
        List<Map<String, Object>> jsonItems = tryParseJson(rawText);
        if (!jsonItems.isEmpty()) {
            return jsonItems;
        }

        if (type == ContentType.VOCABULARY) {
            return recognizeVocabulary(rawText);
        } else if (type == ContentType.GRAMMAR) {
            return recognizeGrammar(rawText);
        } else if (type == ContentType.READING) {
            return recognizeReading(rawText);
        }

        return fallbackAiRecognize(type, rawText);
    }

    private List<Map<String, Object>> recognizeVocabulary(String rawText) {
        List<Map<String, Object>> sequentialResults = parseSequentialVocabularyBlocks(rawText);
        List<Map<String, Object>> dictResults = parseDictionaryVocabularyBlocks(rawText);
        List<Map<String, Object>> lineResults = parseSingleLineVocabulary(rawText);
        List<Map<String, Object>> tableResults = parseTabDelimitedVocabulary(rawText);
        List<Map<String, Object>> results = mergeVocabularyCandidates(
                sequentialResults, dictResults, lineResults, tableResults);
        if (!results.isEmpty()) {
            log.info("Recognized {} vocabulary items (sequential={}, dictionary={}, single-line={}, table={})",
                    results.size(), sequentialResults.size(), dictResults.size(), lineResults.size(),
                    tableResults.size());
            return results;
        }

        return fallbackAiRecognize(ContentType.VOCABULARY, rawText);
    }

    @SafeVarargs
    private final List<Map<String, Object>> mergeVocabularyCandidates(List<Map<String, Object>>... candidates) {
        Map<String, List<Integer>> mergedIndexes = new LinkedHashMap<>();
        List<Map<String, Object>> merged = new ArrayList<>();
        for (List<Map<String, Object>> candidateList : candidates) {
            Map<String, Integer> occurrences = new LinkedHashMap<>();
            for (Map<String, Object> candidate : candidateList) {
                String word = String.valueOf(candidate.getOrDefault("word", "")).trim();
                if (word.isBlank()) continue;
                String key = canonicalizeVocabularyText(word);
                int occurrence = occurrences.merge(key,
                        1, (current, increment) -> Objects.requireNonNull(current) + Objects.requireNonNull(increment)) - 1;
                List<Integer> indexes = mergedIndexes.computeIfAbsent(key, ignored -> new ArrayList<>());
                if (occurrence == indexes.size()) {
                    indexes.add(merged.size());
                    merged.add(new LinkedHashMap<>(candidate));
                } else if (occurrence < indexes.size()) {
                    candidate.forEach(merged.get(indexes.get(occurrence))::putIfAbsent);
                } else {
                    indexes.add(merged.size());
                    merged.add(new LinkedHashMap<>(candidate));
                }
            }
        }
        return merged;
    }

    private String canonicalizeVocabularyText(String value) {
        return value.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    private List<Map<String, Object>> parseSequentialVocabularyBlocks(String rawText) {
        List<Map<String, Object>> items = new ArrayList<>();
        String[] rawLines = rawText.split("\\r?\\n");
        List<String> lines = new ArrayList<>();
        for (String raw : rawLines) {
            String trimmed = raw.trim();
            if (!trimmed.isEmpty() && !isNoiseLine(trimmed)) {
                lines.add(trimmed);
            }
        }

        int i = 0;
        while (i < lines.size()) {
            String line = lines.get(i);
            // Skip numeric index line (STT)
            if (isIndexLine(line) && i + 1 < lines.size()) {
                i++;
                line = lines.get(i);
            }

            // Word must be English word / phrase
            if (isEnglishWord(line)) {
                String word = line;
                String pos = "";
                String ipa = "";
                StringBuilder meaningBuilder = new StringBuilder();
                int j = i + 1;

                // Check for POS
                if (j < lines.size() && isPartOfSpeech(lines.get(j))) {
                    pos = lines.get(j);
                    j++;
                }

                // Check for IPA
                if (j < lines.size() && isIpa(lines.get(j))) {
                    ipa = lines.get(j);
                    j++;
                }

                // Check for meaning
                while (j < lines.size() && !isIndexLine(lines.get(j)) && !isEnglishWord(lines.get(j))) {
                    if (meaningBuilder.length() > 0) meaningBuilder.append("; ");
                    meaningBuilder.append(lines.get(j));
                    j++;
                    // Limit meaning to at most 2 lines
                    if (meaningBuilder.length() > 200) break;
                }

                String meaning = meaningBuilder.toString().trim();
                if (!meaning.isEmpty()) {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("word", word);
                    if (!pos.isEmpty()) map.put("pos", pos);
                    if (!ipa.isEmpty()) map.put("ipa", ipa);
                    map.put("meaning", meaning);
                    items.add(map);
                    i = j;
                    continue;
                }
            }
            i++;
        }

        return items;
    }

    private List<Map<String, Object>> parseDictionaryVocabularyBlocks(String rawText) {
        List<Map<String, Object>> items = new ArrayList<>();
        String[] rawLines = rawText.split("\\r?\\n");
        List<String> lines = new ArrayList<>();
        for (String raw : rawLines) {
            String trimmed = raw.trim();
            if (!trimmed.isEmpty() && !trimmed.startsWith("Forms:") && !trimmed.startsWith("–––") && !trimmed.startsWith("---")) {
                lines.add(trimmed);
            }
        }

        Set<String> prefixes = Set.of("abbr.", "abbr", "n.", "v.", "adj.", "adv.", "prep.", "conj.", "pron.");
        int i = 0;
        while (i < lines.size()) {
            String line = lines.get(i);
            if (isIndexLine(line) && i + 1 < lines.size()) {
                line = lines.get(++i);
            }
            if (line.length() >= 2 && line.length() <= 40 && isEnglishWord(line) && !line.matches("^\\d+$")) {
                if (i + 1 < lines.size()) {
                    String next = lines.get(i + 1);
                    for (String prefix : prefixes) {
                        if (next.toLowerCase(Locale.ROOT).startsWith(prefix)) {
                            String pos = prefix.replace(".", "");
                            String meaning = next.substring(prefix.length()).trim();
                            if (meaning.startsWith(".")) meaning = meaning.substring(1).trim();

                            int j = i + 2;
                            while (j < lines.size() && !isEnglishWord(lines.get(j)) && !startsWithPos(lines.get(j), prefixes)) {
                                if (!lines.get(j).matches("^\\d+$")) {
                                    meaning += " " + lines.get(j);
                                }
                                j++;
                                if (meaning.length() > 300) break;
                            }

                            if (!meaning.isBlank()) {
                                Map<String, Object> map = new LinkedHashMap<>();
                                map.put("word", line);
                                map.put("pos", pos);
                                map.put("meaning", meaning.trim());
                                items.add(map);
                                i = j - 1;
                                break;
                            }
                        }
                    }
                }
            }
            i++;
        }
        return items;
    }

    private List<Map<String, Object>> parseSingleLineVocabulary(String rawText) {
        List<Map<String, Object>> items = new ArrayList<>();
        String[] lines = rawText.split("\\r?\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || isNoiseLine(trimmed)) continue;

            Matcher matcher = SINGLE_LINE_PATTERN.matcher(trimmed);
            if (matcher.find()) {
                String word = matcher.group(1).trim();
                String pos = matcher.group(2) != null ? matcher.group(2).trim() : null;
                String ipa = matcher.group(3) != null ? "/" + matcher.group(3).trim() + "/" : null;
                String meaning = matcher.group(4).trim();

                Map<String, Object> map = new LinkedHashMap<>();
                map.put("word", word);
                if (pos != null && !pos.isEmpty()) map.put("pos", pos);
                if (ipa != null && !ipa.isEmpty()) map.put("ipa", ipa);
                map.put("meaning", meaning);
                items.add(map);
            }
        }
        return items;
    }

    private List<Map<String, Object>> parseTabDelimitedVocabulary(String rawText) {
        List<Map<String, Object>> items = new ArrayList<>();
        String[] lines = rawText.split("\\r?\\n");
        for (String line : lines) {
            if (!line.contains("\t") && !line.contains("|")) continue;
            String[] cols = line.split("[\\t|]");
            List<String> cleanCols = new ArrayList<>();
            for (String col : cols) {
                String c = col.trim();
                if (!c.isEmpty()) cleanCols.add(c);
            }
            if (cleanCols.size() >= 2) {
                String candidateWord = cleanCols.get(0).matches("^\\d+$") && cleanCols.size() >= 3
                        ? cleanCols.get(1) : cleanCols.get(0);
                String candidateMeaning = cleanCols.get(cleanCols.size() - 1);
                if (isEnglishWord(candidateWord) && !candidateMeaning.isBlank()) {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("word", candidateWord);
                    map.put("meaning", candidateMeaning);
                    if (cleanCols.size() >= 4) {
                        for (int k = 1; k < cleanCols.size() - 1; k++) {
                            String col = cleanCols.get(k);
                            if (isPartOfSpeech(col)) map.put("pos", col);
                            else if (isIpa(col)) map.put("ipa", col);
                        }
                    }
                    items.add(map);
                }
            }
        }
        return items;
    }

    private List<Map<String, Object>> recognizeGrammar(String rawText) {
        List<Map<String, Object>> qaItems = parseGrammarQAFormat(rawText);
        if (!qaItems.isEmpty()) return qaItems;

        List<Map<String, Object>> sections = parseGrammarSectionFormat(rawText);
        if (!sections.isEmpty()) return sections;

        return fallbackAiRecognize(ContentType.GRAMMAR, rawText);
    }

    private static String stripAccents(String s) {
        if (s == null) return "";
        String normalized = Normalizer.normalize(s, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd').replace('Đ', 'D');
    }

    private static String cleanOptionText(String opt) {
        if (opt == null) return "";
        return opt.replaceAll("^[\\s,;:–-]+", "").replaceAll("[\\s,;:–-]+$", "").trim();
    }

    private record InlineOptionsResult(String prefix, Map<String, String> options, String trailing) {}

    private static InlineOptionsResult extractInlineOptions(String text) {
        if (text == null || text.isBlank()) return null;

        Pattern optMarkerPattern = Pattern.compile("(?:^|(?<=\\s)|(?<=\\())(?:[A-D])[.)\\]/:–-]\\s*", Pattern.CASE_INSENSITIVE);
        Matcher m = optMarkerPattern.matcher(text);

        List<int[]> matches = new ArrayList<>();
        List<String> labels = new ArrayList<>();

        while (m.find()) {
            String token = m.group().toUpperCase(Locale.ROOT).trim();
            char label = token.charAt(0);
            if (token.startsWith("(")) {
                label = token.length() > 1 ? token.charAt(1) : ' ';
            }
            if (label >= 'A' && label <= 'D') {
                matches.add(new int[]{m.start(), m.end()});
                labels.add(String.valueOf(label));
            }
        }

        if (matches.size() >= 3) {
            int aIdx = labels.indexOf("A");
            int bIdx = labels.indexOf("B");
            int cIdx = labels.indexOf("C");
            int dIdx = labels.indexOf("D");

            if (aIdx != -1 && bIdx != -1 && cIdx != -1 && aIdx < bIdx && bIdx < cIdx) {
                boolean hasD = (dIdx != -1 && dIdx > cIdx);
                int startA = matches.get(aIdx)[0];
                int endA = matches.get(aIdx)[1];
                int startB = matches.get(bIdx)[0];
                int endB = matches.get(bIdx)[1];
                int startC = matches.get(cIdx)[0];
                int endC = matches.get(cIdx)[1];
                int startD = hasD ? matches.get(dIdx)[0] : -1;
                int endD = hasD ? matches.get(dIdx)[1] : -1;

                String prefix = text.substring(0, startA).trim();
                String optA = text.substring(endA, startB).trim();
                String optB = text.substring(endB, startC).trim();
                String optC = hasD ? text.substring(endC, startD).trim() : text.substring(endC).trim();
                String optD = "";
                String trailing = "";

                if (hasD) {
                    String afterD = text.substring(endD).trim();
                    Matcher ansM = Pattern.compile("(?i)(?:[⭢→⇒=>\\-*\u2B62\u2192\u21D2]|\\b(?:dap\\s*an|đáp\\s*án|answer|key)\\b)").matcher(afterD);
                    if (ansM.find()) {
                        optD = afterD.substring(0, ansM.start()).trim();
                        trailing = afterD.substring(ansM.start()).trim();
                    } else {
                        optD = afterD;
                    }
                }

                Map<String, String> opts = new LinkedHashMap<>();
                opts.put("A", cleanOptionText(optA));
                opts.put("B", cleanOptionText(optB));
                opts.put("C", cleanOptionText(optC));
                if (hasD) opts.put("D", cleanOptionText(optD));

                return new InlineOptionsResult(prefix, opts, trailing);
            }
        }
        return null;
    }

    private record AnswerInfo(String answer, String explanation, boolean isAnswerLine) {}

    private static AnswerInfo extractAnswerInfo(String line) {
        if (line == null || line.isBlank()) return new AnswerInfo(null, null, false);
        String trimmed = line.trim();
        String stripped = stripAccents(trimmed).toLowerCase(Locale.ROOT);

        // Header lines like "STT Đáp án Giải thích..." or "Đáp án và giải thích" alone are NOT answers
        if (stripped.matches("^(?:stt\\s+)?dap\\s*an(?:\\s+va\\s+giai\\s+thich)?(?:\\s+chi\\s+tiet)?[:\\s]*$")
                || stripped.matches("^stt\\s+dap\\s*an.*")
                || stripped.matches("^stt\\s+sua\\s*loi.*")) {
            return new AnswerInfo(null, null, false);
        }

        // 1. Dòng bảng STT + Đáp án A/B/C/D: ví dụ "1 D A. writer..." hoặc "1 C Căn cứ..."
        Pattern tableRowPat = Pattern.compile("^(\\d+)[\\s\\t]+([A-D])(?:[\\s\\t]+([\\s\\S]*))?$", Pattern.CASE_INSENSITIVE);
        Matcher mTable = tableRowPat.matcher(trimmed);
        if (mTable.matches()) {
            String ans = mTable.group(2).toUpperCase(Locale.ROOT);
            String rem = mTable.group(3) != null ? mTable.group(3).trim() : "";
            return new AnswerInfo(ans, rem, true);
        }

        // 2. Dạng Question 1 A, Question 2 B
        Pattern qNumPat = Pattern.compile("^Question\\s*\\d+[\\s\\t:]+([A-D])(?:[\\s\\t]+([\\s\\S]*))?$", Pattern.CASE_INSENSITIVE);
        Matcher mQ = qNumPat.matcher(trimmed);
        if (mQ.matches()) {
            String ans = mQ.group(1).toUpperCase(Locale.ROOT);
            String rem = mQ.group(2) != null ? mQ.group(2).trim() : "";
            return new AnswerInfo(ans, rem, true);
        }

        // 3. Keyword-based answer format: "⭢ Đáp án: B", "=> Đáp án: goes, do...", "→ Đáp án: is watching"
        Pattern ansKwPattern = Pattern.compile("(?i)(?:^[⭢→⇒=>\\-*\u2B62\u2192\u21D2\\s]*)(?:dap\\s*an|đáp\\s*án|answer|key|da|d/a)\\s*(?:la)?[:=\\-\\s]*", Pattern.UNICODE_CASE);
        Matcher mKw = ansKwPattern.matcher(trimmed);
        if (mKw.find()) {
            String afterKw = trimmed.substring(mKw.end()).trim();
            if (afterKw.isEmpty()) {
                return new AnswerInfo(null, null, true);
            }

            Pattern singleLetterPat = Pattern.compile("^([A-D])(?:\\b|[\\s,;:.()\\-–])(.*)$", Pattern.CASE_INSENSITIVE);
            Matcher mLetter = singleLetterPat.matcher(afterKw);
            if (mLetter.find()) {
                String ans = mLetter.group(1).toUpperCase(Locale.ROOT);
                String exp = mLetter.group(2).replaceAll("^[(),:;\\s–-]+", "").replaceAll("[)]$", "").trim();
                return new AnswerInfo(ans, exp, true);
            }

            int commaIdx = afterKw.indexOf(',');
            if (commaIdx != -1) {
                String ans = afterKw.substring(0, commaIdx).trim();
                String exp = afterKw.substring(commaIdx + 1).trim();
                return new AnswerInfo(ans, exp, true);
            }
            int semiIdx = afterKw.indexOf(';');
            if (semiIdx != -1) {
                String ans = afterKw.substring(0, semiIdx).trim();
                String exp = afterKw.substring(semiIdx + 1).trim();
                return new AnswerInfo(ans, exp, true);
            }

            return new AnswerInfo(afterKw, null, true);
        }

        // 4. Arrow directly pointing to letter: "⭢ B", "=> C"
        Pattern arrowAnsPat = Pattern.compile("^[⭢→⇒=>\\-*\u2B62\u2192\u21D2]+\\s*([A-D])(?:[\\s,;:.()\\-–]+(.*))?$", Pattern.CASE_INSENSITIVE);
        Matcher mArrow = arrowAnsPat.matcher(trimmed);
        if (mArrow.matches()) {
            String ans = mArrow.group(1).toUpperCase(Locale.ROOT);
            String exp = mArrow.group(2) != null ? mArrow.group(2).trim() : "";
            return new AnswerInfo(ans, exp, true);
        }

        return new AnswerInfo(null, null, false);
    }

    private static boolean isGrammarQA(String rawText) {
        if (rawText == null || rawText.isBlank()) return false;
        String stripped = stripAccents(rawText).toLowerCase(Locale.ROOT);

        Pattern dapAnPat = Pattern.compile("(?i)(?:[⭢→⇒=>\\-*\u2B62\u2192\u21D2]|\\b)(?:dap\\s*an|answer|key)\\b");
        Matcher mDapAn = dapAnPat.matcher(stripped);
        int dapAnCount = 0;
        while (mDapAn.find()) dapAnCount++;
        if (dapAnCount >= 2) return true;

        Pattern qNumPat = Pattern.compile("(?im)^question\\s*\\d+[\\s\\t:]+[A-D]\\b");
        Matcher mQNum = qNumPat.matcher(stripped);
        int qNumCount = 0;
        while (mQNum.find()) qNumCount++;
        if (qNumCount >= 2) return true;

        Pattern tableRowPat = Pattern.compile("(?m)^\\s*\\d+[\\s\\t]+[A-D][\\s\\t]+");
        Matcher mTableRow = tableRowPat.matcher(rawText);
        int tableRowCount = 0;
        while (mTableRow.find()) tableRowCount++;
        if (tableRowCount >= 2) return true;

        Pattern inlineOptPat = Pattern.compile("(?i)(?:^|\\s)[A][.)/\\s].+(?:\\s)[B][.)/\\s].+(?:\\s)[C][.)/\\s]");
        Matcher mInline = inlineOptPat.matcher(rawText);
        int inlineCount = 0;
        while (mInline.find()) inlineCount++;
        if (inlineCount >= 2) return true;

        Pattern singleOptPat = Pattern.compile("(?m)^\\s*[A-D][.)\\s]\\s*.+");
        Matcher mSingle = singleOptPat.matcher(rawText);
        int singleCount = 0;
        while (mSingle.find()) singleCount++;
        return singleCount >= 4;
    }

    private List<Map<String, Object>> parseGrammarQAFormat(String rawText) {
        if (!isGrammarQA(rawText)) {
            return List.of();
        }

        String[] lines = rawText.split("\\r?\\n");
        List<Map<String, Object>> topics = new ArrayList<>();
        List<Map<String, Object>> currentQuestions = new ArrayList<>();

        String currentTopicTitle = "Ngữ pháp TOEIC";
        String currentLevel = "Level 1: Nhận biết";
        int questionIdCounter = 0;

        String currentQuestionText = null;
        Map<String, String> currentOptions = new LinkedHashMap<>();
        String currentCorrect = null;
        StringBuilder currentExplanation = new StringBuilder();

        Pattern topicPat = Pattern.compile(
                "^(?:chuyen\\s*de|bai|phan|part|topic|chuong|unit|lesson|revision)\\s*\\d*[:.\\-–]?\\s*(.*)",
                Pattern.CASE_INSENSITIVE);
        Pattern levelPat = Pattern.compile(
                "(?:level|muc\\s*do|cap\\s*do)[:\\s]+(\\S[^\\n]*)",
                Pattern.CASE_INSENSITIVE);
        Pattern singleOptPat = Pattern.compile("^([A-D])[.)\\]/:–-]\\s*(.+)$", Pattern.CASE_INSENSITIVE);
        Pattern parenOptPat = Pattern.compile("^\\(([A-D])\\)\\s*(.+)$", Pattern.CASE_INSENSITIVE);
        Pattern questionNumPat = Pattern.compile("^(?:c[aâ]u|question|q\\.?|c[aâ]u\\s*h[oỏ]i)?\\s*(\\d+)[.):\\s]\\s*(.*)$", Pattern.CASE_INSENSITIVE);

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;

            String stripped = stripAccents(trimmed).toLowerCase(Locale.ROOT);

            // Bỏ qua dòng header bảng
            if (stripped.matches("^stt\\s+dap\\s*an.*") || stripped.matches("^stt\\s+sua\\s*loi.*")
                    || stripped.matches("^(?:dap\\s*an|answer|key)\\s*(?:va\\s*giai\\s*thich)?[:\\s]*$")) {
                continue;
            }

            // 1. Tiêu đề chuyên đề / topic
            Matcher mTopic = topicPat.matcher(stripped);
            boolean isAllCapsTopic = trimmed.length() < 60 && trimmed.matches("^[A-Z0-9\\s\\-\\–\\(\\):/]+$")
                    && (stripped.contains("chuyen de") || stripped.contains("revision") || stripped.contains("pronunciation")
                    || stripped.contains("stress") || stripped.contains("tense") || stripped.contains("verb")
                    || stripped.contains("noun") || stripped.contains("clause") || stripped.contains("passive"));

            if (mTopic.find() || isAllCapsTopic) {
                String topicTitle = trimmed;
                if (i + 1 < lines.length) {
                    String nextLine = lines[i + 1].trim();
                    if (!nextLine.isEmpty() && nextLine.length() < 70
                            && !questionNumPat.matcher(stripAccents(nextLine)).matches()
                            && !extractAnswerInfo(nextLine).isAnswerLine()) {
                        String nextStripped = stripAccents(nextLine).toLowerCase(Locale.ROOT);
                        if (!topicPat.matcher(nextStripped).find() && !nextStripped.startsWith("exercise")
                                && !nextStripped.startsWith("dap an") && !nextStripped.startsWith("stt")) {
                            topicTitle = topicTitle + " - " + nextLine;
                            i++;
                        }
                    }
                }

                if (hasValidQuestion(currentQuestionText, currentOptions, currentCorrect)) {
                    questionIdCounter++;
                    saveGrammarQuestion(currentQuestions, questionIdCounter, currentLevel,
                            currentQuestionText, currentOptions, currentCorrect, currentExplanation.toString());
                    currentQuestionText = null;
                    currentOptions = new LinkedHashMap<>();
                    currentCorrect = null;
                    currentExplanation.setLength(0);
                }

                if (!currentQuestions.isEmpty()) {
                    topics.add(buildGrammarTopicMap(currentTopicTitle, currentQuestions));
                    currentQuestions = new ArrayList<>();
                    questionIdCounter = 0;
                }
                currentTopicTitle = topicTitle;
                continue;
            }

            // 2. Level
            Matcher mLevel = levelPat.matcher(stripped);
            if (mLevel.find()) {
                currentLevel = "Level " + mLevel.group(1).trim();
                continue;
            }

            // 3. Dòng bảng STT + Đáp án A/B/C/D ("1 D A. writer..." hoặc "Question 1 A ...")
            Pattern tableStartPat = Pattern.compile("^(\\d+)[\\s\\t]+([A-D])\\b|^Question\\s*(\\d+)[\\s\\t:]+([A-D])\\b", Pattern.CASE_INSENSITIVE);
            Matcher mTableStart = tableStartPat.matcher(trimmed);
            if (mTableStart.find()) {
                AnswerInfo tableAns = extractAnswerInfo(trimmed);
                if (tableAns.isAnswerLine() && tableAns.answer() != null) {
                    if (hasValidQuestion(currentQuestionText, currentOptions, currentCorrect)) {
                        questionIdCounter++;
                        saveGrammarQuestion(currentQuestions, questionIdCounter, currentLevel,
                                currentQuestionText, currentOptions, currentCorrect, currentExplanation.toString());
                        currentQuestionText = null;
                        currentOptions = new LinkedHashMap<>();
                        currentCorrect = null;
                        currentExplanation.setLength(0);
                    }

                    currentCorrect = tableAns.answer();
                    String rem = tableAns.explanation() != null ? tableAns.explanation() : "";

                    InlineOptionsResult inline = extractInlineOptions(rem);
                    if (inline != null) {
                        currentQuestionText = (inline.prefix().isEmpty() ? ("Câu " + (questionIdCounter + 1)) : inline.prefix());
                        currentOptions.putAll(inline.options());
                        if (!inline.trailing().isEmpty()) {
                            currentExplanation.append(inline.trailing()).append("\n");
                        }
                    } else {
                        currentQuestionText = "Câu " + (questionIdCounter + 1);
                        if (!rem.isEmpty()) {
                            currentExplanation.append(rem).append("\n");
                        }
                    }
                    continue;
                }
            }

            // 4. Dòng Đáp án đứng riêng ("⭢ Đáp án: B", "=> Đáp án: goes, do...")
            AnswerInfo directAns = extractAnswerInfo(trimmed);
            if (directAns.isAnswerLine()) {
                if (directAns.answer() != null) {
                    currentCorrect = directAns.answer();
                }
                if (directAns.explanation() != null && !directAns.explanation().isBlank()) {
                    currentExplanation.append(directAns.explanation()).append("\n");
                }
                continue;
            }

            // 5. Dòng có đáp án ở đuôi dòng ("... ⭢ Đáp án: B")
            Matcher endAnsM = Pattern.compile("(?i)[\\s\\t]+(?:[⭢→⇒=>\\-*\u2B62\u2192\u21D2]|\\b(?:dap\\s*an|đáp\\s*án)\\b)[:\\s]*([A-D])\\s*$", Pattern.UNICODE_CASE).matcher(trimmed);
            if (endAnsM.find()) {
                currentCorrect = endAnsM.group(1).toUpperCase(Locale.ROOT);
                trimmed = trimmed.substring(0, endAnsM.start()).trim();
                stripped = stripAccents(trimmed).toLowerCase(Locale.ROOT);
            }

            // 6. Dòng câu hỏi được đánh số ("1. A. head B. please...", "1. He (go)...")
            Matcher mQNum = questionNumPat.matcher(stripped);
            if (mQNum.matches()) {
                String qNumStr = mQNum.group(1);
                String restOfLine = trimmed.replaceFirst("^(?i)(?:c[aâ]u|question|q\\.?|c[aâ]u\\s*h[oỏ]i)?\\s*\\d+[.):\\s]\\s*", "").trim();

                // If restOfLine is empty or looks like just a subsection (e.g. "1. Trọng âm theo phiên âm")
                // and the next line is "STT Đáp án" or "Đáp án", treat it as a sub-header, not a question
                if (i + 1 < lines.length) {
                    String nextStr = stripAccents(lines[i + 1]).toLowerCase(Locale.ROOT).trim();
                    if (nextStr.startsWith("stt dap an") || nextStr.startsWith("dap an va") || nextStr.equals("dap an")) {
                        continue;
                    }
                }

                if (hasValidQuestion(currentQuestionText, currentOptions, currentCorrect)) {
                    questionIdCounter++;
                    saveGrammarQuestion(currentQuestions, questionIdCounter, currentLevel,
                            currentQuestionText, currentOptions, currentCorrect, currentExplanation.toString());
                    currentQuestionText = null;
                    currentOptions = new LinkedHashMap<>();
                    currentCorrect = null;
                    currentExplanation.setLength(0);
                }

                InlineOptionsResult inline = extractInlineOptions(restOfLine);
                if (inline != null) {
                    String qTitle = qNumStr + ". " + inline.prefix();
                    currentQuestionText = qTitle.trim();
                    currentOptions.putAll(inline.options());
                    if (!inline.trailing().isEmpty()) {
                        AnswerInfo trailingAns = extractAnswerInfo(inline.trailing());
                        if (trailingAns.isAnswerLine() && trailingAns.answer() != null) {
                            currentCorrect = trailingAns.answer();
                            if (trailingAns.explanation() != null) {
                                currentExplanation.append(trailingAns.explanation()).append("\n");
                            }
                        } else {
                            currentExplanation.append(inline.trailing()).append("\n");
                        }
                    }
                } else {
                    currentQuestionText = qNumStr + ". " + restOfLine;
                }
                continue;
            }

            // 7. Dòng option đơn lẻ ("A. head", "B. please")
            Matcher mSingleOpt = singleOptPat.matcher(trimmed);
            if (mSingleOpt.matches()) {
                currentOptions.put(mSingleOpt.group(1).toUpperCase(Locale.ROOT), mSingleOpt.group(2).trim());
                continue;
            }
            Matcher mParenOpt = parenOptPat.matcher(trimmed);
            if (mParenOpt.matches()) {
                currentOptions.put(mParenOpt.group(1).toUpperCase(Locale.ROOT), mParenOpt.group(2).trim());
                continue;
            }

            // 8. Dòng giải thích / dịch nghĩa / phiên âm
            if (stripped.startsWith("tam dich:") || stripped.startsWith("dich nghia:")
                    || stripped.startsWith("giai thich:") || stripped.startsWith("kien thuc:")
                    || stripped.startsWith("cau truc:") || stripped.startsWith("quy tac:")
                    || (trimmed.startsWith("/") && trimmed.endsWith("/"))) {
                currentExplanation.append(trimmed).append("\n");
                continue;
            }

            // 9. Dòng text thông thường
            if (currentQuestionText != null && currentOptions.isEmpty() && currentCorrect == null) {
                currentQuestionText += " " + trimmed;
            } else if (currentQuestionText != null || !currentOptions.isEmpty() || currentCorrect != null) {
                currentExplanation.append(trimmed).append("\n");
            }
        }

        if (hasValidQuestion(currentQuestionText, currentOptions, currentCorrect)) {
            questionIdCounter++;
            saveGrammarQuestion(currentQuestions, questionIdCounter, currentLevel,
                    currentQuestionText, currentOptions, currentCorrect, currentExplanation.toString());
        }

        if (!currentQuestions.isEmpty()) {
            topics.add(buildGrammarTopicMap(currentTopicTitle, currentQuestions));
        }

        return topics;
    }

    private static boolean hasValidQuestion(String qText, Map<String, String> opts, String correct) {
        if (correct != null && !correct.isBlank()) return true;
        if (opts != null && opts.size() >= 2) return true;
        return qText != null && !qText.isBlank() && qText.length() > 5;
    }

    private void saveGrammarQuestion(List<Map<String, Object>> questions, int id,
            String level, String question, Map<String, String> options, String correct, String explanation) {
        Map<String, Object> q = new LinkedHashMap<>();
        q.put("id", id);
        q.put("level", level != null ? level : "Level 1: Nhận biết");
        q.put("levelShort", level != null && level.contains(":") ? level.split(":")[0].trim() : "Level 1");

        String safeQuestion = question != null && !question.isBlank() ? question.trim() : ("Câu " + id);
        q.put("question", safeQuestion);

        Map<String, String> opts = new LinkedHashMap<>();
        if (options != null && !options.isEmpty()) {
            opts.put("A", options.getOrDefault("A", ""));
            opts.put("B", options.getOrDefault("B", ""));
            opts.put("C", options.getOrDefault("C", ""));
            opts.put("D", options.getOrDefault("D", ""));
        }
        q.put("options", opts);

        String safeCorrect = (correct != null && !correct.isBlank()) ? correct.trim() : "A";
        q.put("correctAnswer", safeCorrect);

        if (explanation != null && !explanation.isBlank()) {
            String expTrimmed = explanation.trim();
            q.put("solutionMethod", expTrimmed);
            q.put("explanation", expTrimmed);
        }

        questions.add(q);
    }

    private Map<String, Object> buildGrammarTopicMap(String title,
            List<Map<String, Object>> questions) {
        Map<String, Object> topic = new LinkedHashMap<>();
        String safeTitle = (title != null && !title.isBlank()) ? title.trim() : "Ngữ pháp TOEIC";
        topic.put("title", safeTitle);
        topic.put("titleVi", safeTitle);
        topic.put("rule", safeTitle);
        topic.put("explanation", "Chuyên đề " + safeTitle);
        topic.put("gradedQuestions", new ArrayList<>(questions));
        topic.put("questions", new ArrayList<>(questions));
        return topic;
    }

    private List<Map<String, Object>> parseGrammarSectionFormat(String rawText) {
        List<Map<String, Object>> items = new ArrayList<>();
        String[] lines = rawText.split("\\r?\\n");
        StringBuilder currentExplanation = new StringBuilder();
        String currentTitle = null;

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            boolean isSectionHeader =
                    trimmed.matches("(?i)^(?:Bài|Chương|Unit|Lesson|Part|Topic)\\s*\\d+[:\\.].*")
                    || trimmed.matches("^[IVX]+\\..*")
                    || (trimmed.length() < 60 && trimmed.matches("^[A-Z0-9\\s\\-\\(\\)]+$"));
            if (isSectionHeader) {
                if (currentTitle != null && currentExplanation.length() > 0) {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("title", currentTitle);
                    map.put("rule", currentTitle);
                    map.put("explanation", currentExplanation.toString().trim());
                    items.add(map);
                    currentExplanation.setLength(0);
                }
                currentTitle = trimmed;
            } else if (currentTitle != null) {
                if (currentExplanation.length() > 0) currentExplanation.append("\n");
                currentExplanation.append(trimmed);
            }
        }
        if (currentTitle != null && currentExplanation.length() > 0) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("title", currentTitle);
            map.put("rule", currentTitle);
            map.put("explanation", currentExplanation.toString().trim());
            items.add(map);
        }
        return items;
    }

    private List<Map<String, Object>> recognizeReading(String rawText) {
        String[] rawLines = rawText.split("\\r?\\n");
        String explicitTitle = "";
        String explicitPart = "";
        String explicitTag = "";
        StringBuilder passageBuilder = new StringBuilder();
        StringBuilder passageViBuilder = new StringBuilder();
        String mode = "none";

        List<Map<String, Object>> parsedQuestions = new ArrayList<>();
        List<Map<String, Object>> globalVocab = new ArrayList<>();
        String currentQNum = null;
        String currentQText = null;
        String currentBilingual = null;
        Map<String, String> currentOptions = new LinkedHashMap<>();
        String currentCorrect = null;
        String currentExplanation = null;
        List<Map<String, Object>> currentVocab = new ArrayList<>();

        Pattern qStartPat = Pattern.compile("^(?:(?iu)câu\\s*|(?iu)question\\s*)?(\\d{1,3})[\\.:\\)\\s]+(.+)$");
        Pattern optSinglePat = Pattern.compile("^\\(?([A-Da-d])[\\.:\\)\\s]+(.+)$");
        Pattern optInlinePat = Pattern.compile("\\(?([A-D])[\\.\\)]\\s*(.+?)(?=\\s+\\(?[A-D][\\.\\)]\\s|$)");
        Pattern ansPat = Pattern.compile("^(?iu)(?:đáp án|answer|key|chọn|đa)[:\\s]+\\(?([A-Da-d])\\)?.*$");
        Pattern expPat = Pattern.compile("^(?iu)(?:giải thích|lời giải|explanation|hướng dẫn giải)[:\\s]+(.+)$");
        Pattern viPat = Pattern.compile("^(?iu)(?:dịch|bản dịch|translation|dịch câu)[:\\s]+(.+)$");
        Pattern vocabInlinePat = Pattern.compile("^(?iu)(?:từ vựng|vocab|vocabulary)\\s*:\\s*(.*)$");

        for (String rawLine : rawLines) {
            String line = rawLine.trim();
            if (line.isEmpty()) {
                if ("passage".equals(mode) && passageBuilder.length() > 0) passageBuilder.append("\n\n");
                else if ("passageVi".equals(mode) && passageViBuilder.length() > 0) passageViBuilder.append("\n\n");
                continue;
            }
            String lower = line.toLowerCase(Locale.ROOT);
            if (lower.startsWith("[tiêu đề]") || lower.startsWith("tiêu đề:") || lower.startsWith("[title]")) {
                explicitTitle = line.replaceFirst("^(?iu)(\\[tiêu đề\\]|tiêu đề:|\\[title\\])\\s*", "").trim();
                continue;
            }
            if (lower.startsWith("[phần thi]") || lower.startsWith("phần thi:") || lower.startsWith("[part]")) {
                if (lower.contains("6")) explicitPart = "PART_6";
                else if (lower.contains("7")) explicitPart = "PART_7";
                else if (lower.contains("5")) explicitPart = "PART_5";
                continue;
            }
            if (lower.startsWith("[thẻ]") || lower.startsWith("thẻ:") || lower.startsWith("[tag]")) {
                explicitTag = line.replaceFirst("^(?iu)(\\[thẻ\\]|thẻ:|\\[tag\\])\\s*", "").trim();
                continue;
            }
            if (lower.startsWith("[đoạn văn]") || lower.equals("đoạn văn:") || lower.startsWith("[passage]") || lower.equals("passage:")) {
                mode = "passage";
                continue;
            }
            if (lower.startsWith("[bản dịch đoạn văn]") || lower.startsWith("[dịch đoạn văn]")
                    || lower.startsWith("[bản dịch]") || lower.startsWith("[passage vi]") || lower.equals("bản dịch:")) {
                mode = "passageVi";
                continue;
            }
            if (lower.equals("[từ vựng]") || lower.equals("từ vựng:") || lower.equals("[vocabulary]")) {
                mode = "vocab";
                continue;
            }
            Matcher vGlobalM = vocabInlinePat.matcher(line);
            if (vGlobalM.matches() && !"passage".equals(mode) && !"passageVi".equals(mode)) {
                parseInlineReadingVocab(vGlobalM.group(1),
                        ("question".equals(mode) && currentQText != null) ? currentVocab : globalVocab);
                continue;
            }

            Matcher qm = qStartPat.matcher(line);
            if (qm.matches() && !lower.startsWith("(a)") && !lower.startsWith("(b)")
                    && !lower.startsWith("(c)") && !lower.startsWith("(d)")) {
                if (currentQText != null && (!currentQText.isBlank() || currentOptions.size() >= 2)) {
                    parsedQuestions.add(buildRecognizedReadingQuestion(
                            currentQNum, currentQText, currentBilingual, currentOptions,
                            currentCorrect, currentExplanation, currentVocab, parsedQuestions.size()));
                }
                mode = "question";
                currentQNum = qm.group(1);
                currentQText = qm.group(2).trim();
                currentBilingual = null;
                currentOptions = new LinkedHashMap<>();
                currentCorrect = null;
                currentExplanation = null;
                currentVocab = new ArrayList<>();
                continue;
            }

            if ("question".equals(mode) && currentQText != null) {
                Matcher inlineCheck = optInlinePat.matcher(line);
                List<String[]> inlinePairs = new ArrayList<>();
                while (inlineCheck.find()) {
                    inlinePairs.add(new String[] { inlineCheck.group(1).toUpperCase(Locale.ROOT), inlineCheck.group(2).trim() });
                }
                if (inlinePairs.size() >= 2) {
                    for (String[] pair : inlinePairs) currentOptions.put(pair[0], pair[1]);
                    continue;
                }
                Matcher optM = optSinglePat.matcher(line);
                if (optM.matches()) {
                    currentOptions.put(optM.group(1).toUpperCase(Locale.ROOT), optM.group(2).trim());
                    continue;
                }
                Matcher ansM = ansPat.matcher(line);
                if (ansM.matches()) {
                    currentCorrect = ansM.group(1).toUpperCase(Locale.ROOT);
                    continue;
                }
                Matcher expM = expPat.matcher(line);
                if (expM.matches()) {
                    currentExplanation = expM.group(1).trim();
                    continue;
                }
                Matcher viM = viPat.matcher(line);
                if (viM.matches()) {
                    currentBilingual = viM.group(1).trim();
                    continue;
                }
                Matcher vM = vocabInlinePat.matcher(line);
                if (vM.matches()) {
                    parseInlineReadingVocab(vM.group(1), currentVocab);
                    continue;
                }
            }

            if (!"passage".equals(mode) && !"passageVi".equals(mode)
                    && (line.startsWith("-") || line.startsWith("•"))) {
                Map<String, Object> bulletVocab = parseSingleReadingVocabToken(line);
                if (bulletVocab != null) {
                    if (currentQText != null && "question".equals(mode)) {
                        currentVocab.add(bulletVocab);
                    } else {
                        globalVocab.add(bulletVocab);
                    }
                    continue;
                }
            }
            if ("vocab".equals(mode)) {
                parseInlineReadingVocab(line, globalVocab);
                continue;
            }

            if ("passage".equals(mode)) {
                if (passageBuilder.length() > 0 && passageBuilder.charAt(passageBuilder.length() - 1) != '\n') {
                    passageBuilder.append("\n");
                }
                passageBuilder.append(line);
            } else if ("passageVi".equals(mode)) {
                if (passageViBuilder.length() > 0 && passageViBuilder.charAt(passageViBuilder.length() - 1) != '\n') {
                    passageViBuilder.append("\n");
                }
                passageViBuilder.append(line);
            }
        }

        if (currentQText != null && (!currentQText.isBlank() || currentOptions.size() >= 2)) {
            parsedQuestions.add(buildRecognizedReadingQuestion(
                    currentQNum, currentQText, currentBilingual, currentOptions,
                    currentCorrect, currentExplanation, currentVocab, parsedQuestions.size()));
        }

        String passage = passageBuilder.toString().trim();
        String passageVi = passageViBuilder.toString().trim();

        Map<String, Object> map = new LinkedHashMap<>();
        String title = explicitTitle;
        if (title.isBlank()) {
            for (String line : rawLines) {
                String t = line.trim();
                if (!t.isEmpty() && !t.startsWith("[") && t.length() < 100) {
                    title = t;
                    break;
                }
            }
            if (title.isBlank()) title = "Đoạn văn đọc hiểu";
        }
        map.put("title", title);

        if (!parsedQuestions.isEmpty()) {
            String resolvedPart = explicitPart;
            if (resolvedPart.isBlank()) {
                if (passage.contains("[131]") || passage.contains("[132]") || passage.contains("[133]")) {
                    resolvedPart = "PART_6";
                } else if (!passage.isBlank() || parsedQuestions.size() >= 2) {
                    resolvedPart = "PART_7";
                } else {
                    resolvedPart = "PART_5";
                }
            }
            map.put("part", resolvedPart);
            if (!explicitTag.isBlank()) map.put("tag", explicitTag);
            if (!passage.isBlank()) {
                map.put("content", passage);
            } else if ("PART_5".equals(resolvedPart)) {
                map.put("content", "Directions: A word or phrase is missing in each of the sentences below. Four answer choices are given below each sentence. Select the best answer to complete the sentence.");
            }
            if (!passageVi.isBlank()) map.put("passageTextVi", passageVi);
            map.put("questions", parsedQuestions);
            map.put("totalQuestions", parsedQuestions.size());
            if (!globalVocab.isEmpty()) map.put("vocabList", globalVocab);
            return List.of(map);
        }

        if (!explicitPart.isBlank()) map.put("part", explicitPart);
        if (!explicitTag.isBlank()) map.put("tag", explicitTag);
        map.put("content", !passage.isBlank() ? passage : rawText.trim());
        if (!passageVi.isBlank()) map.put("passageTextVi", passageVi);
        if (!globalVocab.isEmpty()) map.put("vocabList", globalVocab);
        return List.of(map);
    }

    private Map<String, Object> buildRecognizedReadingQuestion(
            String qNum, String qText, String bilingual, Map<String, String> options,
            String correct, String explanation, List<Map<String, Object>> vocabList, int index) {
        Map<String, Object> q = new LinkedHashMap<>();
        q.put("questionNum", (qNum != null && !qNum.isBlank()) ? qNum : String.valueOf(101 + index));
        q.put("question", qText != null ? qText : "");
        if (bilingual != null && !bilingual.isBlank()) q.put("bilingual", bilingual);
        Map<String, String> opts = new LinkedHashMap<>();
        opts.put("A", options.getOrDefault("A", ""));
        opts.put("B", options.getOrDefault("B", ""));
        opts.put("C", options.getOrDefault("C", ""));
        opts.put("D", options.getOrDefault("D", ""));
        q.put("options", opts);
        q.put("correctAnswer", (correct != null && !correct.isBlank()) ? correct : "A");
        if (explanation != null && !explanation.isBlank()) q.put("explanation", explanation);
        if (vocabList != null && !vocabList.isEmpty()) q.put("vocabList", new ArrayList<>(vocabList));
        return q;
    }

    private void parseInlineReadingVocab(String payload, List<Map<String, Object>> target) {
        if (payload == null || payload.isBlank()) return;
        for (String seg : payload.split("[,;]")) {
            Map<String, Object> item = parseSingleReadingVocabToken(seg);
            if (item != null) target.add(item);
        }
    }

    private Map<String, Object> parseSingleReadingVocabToken(String raw) {
        if (raw == null) return null;
        String clean = raw.replaceFirst("^[\\-\\•\\*\\d\\.]+\\s*", "").trim();
        if (clean.isEmpty()) return null;
        String ipa = "";
        Matcher ipaM = Pattern.compile("/([^/]+)/").matcher(clean);
        if (ipaM.find()) ipa = "/" + ipaM.group(1).trim() + "/";
        String pos = "n";
        Matcher posM = Pattern.compile("(?i)\\((n|v|adj|adv|prep|conj|pron|n,\\s*v)[^\\)]*\\)").matcher(clean);
        if (posM.find()) pos = posM.group(1).trim().toLowerCase(Locale.ROOT);
        String cleaned = clean
                .replaceAll("\\(\\s*/[^/]+/\\s*\\)", "")
                .replaceAll("/[^/]+/", "")
                .replaceAll("(?i)\\((?:n|v|adj|adv|prep|conj|pron|n,\\s*v)[^\\)]*\\)", "")
                .replaceAll("\\(\\s*\\)", "")
                .trim();
        String[] parts = cleaned.split("[:\\-=]\\s*", 2);
        String word = parts[0].replaceAll("[\\(\\)\\[\\]]", "").trim();
        if (word.isEmpty() || !word.matches("^[A-Za-z][A-Za-z\\s'\\-]*$")) return null;
        String meaning = (parts.length >= 2 && !parts[1].isBlank()) ? parts[1].trim() : "Từ vựng trọng tâm";
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("word", word);
        item.put("pos", pos);
        item.put("ipa", ipa);
        item.put("meaning", meaning);
        item.put("level", "B1");
        return item;
    }

    private List<Map<String, Object>> fallbackAiRecognize(ContentType type, String rawText) {
        if (geminiApiKey.isBlank()) {
            log.warn("Gemini API key is blank, cannot use AI fallback recognition");
            return List.of();
        }

        try {
            String prompt = switch (type) {
                case VOCABULARY -> "Phân tích văn bản và trích xuất danh sách từ vựng TOEIC.\n"
                        + "Trả về DUY NHẤT một mảng JSON, không có văn bản giải thích.\n"
                        + "Mỗi object phải có ít nhất: \"word\" (từ tiếng Anh), \"meaning\" (nghĩa tiếng Việt).\n"
                        + "Tùy chọn: \"pos\" (loại từ), \"ipa\" (phiên âm), \"exampleEn\", \"exampleVi\".\n"
                        + "\nVăn bản:\n" + (rawText.length() > 10000 ? rawText.substring(0, 10000) : rawText);
                case GRAMMAR -> "Phân tích văn bản và trích xuất danh sách chuyên đề ngữ pháp TOEIC.\n"
                        + "Trả về DUY NHẤT một mảng JSON, không có văn bản giải thích.\n"
                        + "Mỗi object phải có: \"title\" (tên chuyên đề tiếng Việt), \"titleEn\" (tiếng Anh nếu có), "
                        + "\"rule\" (quy tắc ngữ pháp), \"explanation\" (giải thích chi tiết).\n"
                        + "Tùy chọn: \"coreTheory\" (lý thuyết cốt lõi dạng Markdown), "
                        + "\"signalClues\" (dấu hiệu nhận biết), \"tipsAndTricks\" (mẹo), "
                        + "\"commonTraps\" (bẫy thường gặp), \"category\" (phân loại), "
                        + "\"gradedQuestions\" (mảng câu hỏi trắc nghiệm, mỗi item có: "
                        + "\"level\", \"question\", \"options\":{\"A\":\"\",\"B\":\"\",\"C\":\"\",\"D\":\"\"}, \"correctAnswer\", "
                        + "\"translation\":{\"questionVi\":\"\"}, \"signalInQuestion\", \"solutionMethod\", \"trapNote\").\n"
                        + "\nVăn bản:\n" + (rawText.length() > 12000 ? rawText.substring(0, 12000) : rawText);
                default -> "Phân tích văn bản và trích xuất danh sách các mục " + type.name() + " TOEIC.\n"
                        + "Trả về DUY NHẤT một mảng JSON, không có văn bản giải thích.\n"
                        + "Mỗi object có: \"title\", \"explanation\"...\n"
                        + "\nVăn bản:\n" + (rawText.length() > 10000 ? rawText.substring(0, 10000) : rawText);
            };

            var request = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of("temperature", 0.1, "maxOutputTokens", 8192));

            JsonNode response = geminiRestClient.post()
                    .uri("/v1beta/models/{model}:generateContent", geminiModel)
                    .header("x-goog-api-key", geminiApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(JsonNode.class);

            if (response != null) {
                String aiText = response.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
                return tryParseJson(aiText);
            }
        } catch (Exception exc) {
            log.warn("Gemini AI recognition failed: {}", exc.getMessage());
        }
        return List.of();
    }

    private List<Map<String, Object>> tryParseJson(String text) {
        if (text == null) return List.of();
        String cleaned = text.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        cleaned = cleaned.trim();

        if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
            try {
                return objectMapper.readValue(cleaned, new TypeReference<List<Map<String, Object>>>() {});
            } catch (Exception ignored) {
            }
        } else if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
            try {
                JsonNode root = objectMapper.readTree(cleaned);
                if (root.has("items") && root.get("items").isArray()) {
                    return objectMapper.convertValue(root.get("items"), new TypeReference<List<Map<String, Object>>>() {});
                } else if (root.has("words") && root.get("words").isArray()) {
                    return objectMapper.convertValue(root.get("words"), new TypeReference<List<Map<String, Object>>>() {});
                }
            } catch (Exception ignored) {
            }
        }
        return List.of();
    }

    private static boolean isEnglishWord(String str) {
        if (str == null || str.isBlank()) return false;
        String t = str.trim();
        return t.length() >= 2 && t.length() <= 45 && t.matches("^[a-zA-Z\\s\\-\\']+$");
    }

    private static boolean isIndexLine(String value) {
        return value != null && value.trim().matches("^\\d{1,4}[.)]?$");
    }

    private static boolean isPartOfSpeech(String str) {
        if (str == null) return false;
        String t = str.trim().toLowerCase(Locale.ROOT);
        return COMMON_POS.contains(t) || COMMON_POS.contains(t.replace(".", ""));
    }

    private static boolean startsWithPos(String str, Set<String> prefixes) {
        if (str == null) return false;
        String lower = str.trim().toLowerCase(Locale.ROOT);
        return prefixes.stream().anyMatch(lower::startsWith);
    }

    private static boolean isIpa(String str) {
        if (str == null) return false;
        String t = str.trim();
        return (t.startsWith("/") && t.endsWith("/")) || (t.startsWith("[") && t.endsWith("]"))
                || t.contains("ə") || t.contains("ɪ") || t.contains("ˈ") || t.contains("ʊ") || t.contains("æ");
    }

    private static boolean isNoiseLine(String str) {
        String lower = str.trim().toLowerCase(Locale.ROOT);
        return NOISE_LINES.contains(lower) || lower.startsWith("trang ") || lower.startsWith("page ");
    }
}
