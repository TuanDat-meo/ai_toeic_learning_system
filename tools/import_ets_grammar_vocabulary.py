#!/usr/bin/env python3
"""Import supplied Grammar and Vocabulary JSON sets into the TOEIC app."""

from __future__ import annotations

import argparse
import csv
import io
import json
import subprocess
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
GRAMMAR_FIELDS = ("id", "code", "title", "english_title", "grammar_group", "summary", "formula", "signal_words", "traps", "questions", "theory", "metadata", "order_index")
VOCAB_SET_FIELDS = ("id", "title", "category", "word_count")
VOCAB_FIELDS = ("id", "set_id", "word", "ipa", "part_of_speech", "meaning", "example", "example_meaning", "level", "order_index", "audio_url")
BANK_FIELDS = ("external_code", "part", "question_text", "options", "correct_answer", "explanation", "difficulty", "source_difficulty", "status", "skill", "question_translation", "option_translations")

def s(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""

def j(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))

def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))

def grammar_rows(folder: Path) -> list[dict[str, str]]:
    files = sorted(p for p in folder.glob("*.json") if p.name.upper() != "INDEX.JSON")
    if len(files) != 25:
        raise ValueError(f"Expected 25 grammar topic files, found {len(files)}")
    rows = []
    seen = set()
    for index, path in enumerate(files, 1):
        d = read_json(path)
        code = s(d.get("topicCode"))
        if not code or code in seen:
            raise ValueError(f"Missing or duplicate grammar topic code in {path.name}")
        seen.add(code)
        topic_id = f"ets-grammar-{index:02d}"
        category = s(d.get("category")).lower()
        group = ("parts_of_speech" if "parts of speech" in category else
                 "verb_structures" if "verbs & forms" in category else
                 "sentence_structures" if "structures" in category or "syntax" in category else
                 "extended" if "advanced" in category else "other")
        questions = []
        for q in d.get("gradedQuestions", []):
            answer = s(q.get("correctAnswer")).upper()
            opts = q.get("options") if isinstance(q.get("options"), dict) else {}
            if not s(q.get("question")) or answer not in opts or len(opts) != 4:
                raise ValueError(f"Invalid grammar question {code}/{q.get('id')}")
            tr = q.get("translation") if isinstance(q.get("translation"), dict) else {}
            questions.append({
                "id": f"{code}-{int(q['id']):03d}", "part": "Part 5", "level": s(q.get("level")),
                "levelShort": s(q.get("levelShort")), "questionText": s(q.get("question")),
                "options": opts, "correctAnswer": answer, "translation": s(tr.get("questionVi")),
                "optionTranslations": tr.get("optionsVi", {}), "fullSentenceVi": s(tr.get("fullSentenceVi")),
                "signalInQuestion": s(q.get("signalInQuestion")), "explanation": s(q.get("solutionMethod")),
                "trapNote": s(q.get("trapNote")), "formulaApplied": s(q.get("formulaApplied")),
            })
        rows.append({
            "id": topic_id, "code": code, "title": s(d.get("titleVi")), "english_title": s(d.get("titleEn")),
            "grammar_group": group, "summary": s(d.get("description")), "formula": s(d.get("coreTheory")),
            "signal_words": j([s(d.get("signalClues"))] if s(d.get("signalClues")) else []),
            "traps": j([s(d.get("commonTraps"))] if s(d.get("commonTraps")) else []),
            "questions": j(questions), "theory": j({"coreTheory": s(d.get("coreTheory")), "tipsAndTricks": s(d.get("tipsAndTricks")), "summaryTable": s(d.get("summaryTable"))}),
            "metadata": j({"source": "ETS dataset", "sourceFile": path.name, "category": s(d.get("category")), "levelCounts": {level: sum(q["levelShort"] == level for q in questions) for level in sorted({q["levelShort"] for q in questions})}}),
            "order_index": str(index + 2),
        })
    return rows

def vocabulary_rows(folder: Path):
    files = sorted(p for p in folder.glob("*.json") if p.name.upper() != "INDEX.JSON")
    if len(files) != 20:
        raise ValueError(f"Expected 20 vocabulary set files, found {len(files)}")
    sets, words = [], []
    for path in files:
        d = read_json(path)
        num = int(d.get("setId", 0))
        if not 1 <= num <= 20:
            raise ValueError(f"Invalid vocabulary set id in {path.name}")
        set_id = f"set-{num:02d}"
        category = ("corporate" if num <= 3 else "finance_marketing" if num <= 6 else "commerce_production" if num <= 10 else "office_travel" if num <= 15 else "tech_services")
        entries = d.get("words", [])
        if not entries:
            raise ValueError(f"No words in {path.name}")
        sets.append({"id": set_id, "title": s(d.get("setName")), "category": category, "word_count": str(len(entries))})
        for ix, w in enumerate(entries, 1):
            word = s(w.get("word")); meaning = s(w.get("meaningVi"))
            if not word or not meaning:
                raise ValueError(f"Missing word/meaning in {path.name}, row {ix}")
            examples = w.get("examples") if isinstance(w.get("examples"), list) else []
            en = "\n".join(s(e.get("sentenceEn")) for e in examples if isinstance(e, dict) and s(e.get("sentenceEn")))
            vi = "\n".join(s(e.get("sentenceVi")) for e in examples if isinstance(e, dict) and s(e.get("sentenceVi")))
            words.append({"id": f"ets-vocab-{num:02d}-{ix:03d}", "set_id": set_id, "word": word,
                "ipa": s(w.get("ipa")), "part_of_speech": s(w.get("partOfSpeech")),
                "meaning": meaning, "example": en, "example_meaning": vi,
                # The vocabulary UI stores CEFR only; map the source's four TOEIC bands in order.
                "level": {"Level 1": "A1", "Level 2": "A2", "Level 3": "B1", "Level 4": "B2"}.get(s(w.get("level")).split(":", 1)[0], "B1"),
                "order_index": str(ix), "audio_url": ""})
    if len(words) != 4000:
        raise ValueError(f"Expected 4000 vocabulary words, found {len(words)}")
    return sets, words

def bank_rows(data_dir: Path) -> list[dict[str, str]]:
    rows = []
    band_for_level = {"Level 1": "450-550", "Level 2": "550-650", "Level 3": "650-750", "Level 4": "750-850"}
    for topic_path in sorted((data_dir / "grammar").glob("*.json")):
        if topic_path.name.upper() == "INDEX.JSON":
            continue
        topic = read_json(topic_path)
        for q in topic.get("gradedQuestions", []):
            raw_level = s(q.get("levelShort"))
            translation = q.get("translation") if isinstance(q.get("translation"), dict) else {}
            rows.append({
                "external_code": f"GRAMMAR-{s(topic.get('topicCode'))}-Q{int(q['id']):03d}",
                "part": "GRAMMAR", "question_text": s(q.get("question")), "options": j(q.get("options", {})),
                "correct_answer": s(q.get("correctAnswer")).upper(), "explanation": s(q.get("solutionMethod")),
                "difficulty": band_for_level.get(raw_level, "650-750"), "source_difficulty": s(q.get("level")),
                "status": "PUBLISHED", "skill": "Grammar (Ngữ pháp)",
                "question_translation": s(translation.get("questionVi")), "option_translations": j(translation.get("optionsVi", {})),
            })
    for path in sorted((data_dir / "vocabulary").glob("*.json")):
        if path.name.upper() == "INDEX.JSON":
            continue
        dataset = read_json(path)
        set_num = int(dataset.get("setId", 0))
        for word_index, word in enumerate(dataset.get("words", []), 1):
            source_level = s(word.get("level"))
            level_key = source_level.split(":", 1)[0]
            for game_num, game_key in ((1, "miniGame1_WordToMeaning"), (2, "miniGame2_MeaningToWord")):
                game = word.get(game_key) if isinstance(word.get(game_key), dict) else {}
                options = game.get("options") if isinstance(game.get("options"), dict) else {}
                answer = s(game.get("correctAnswer")).upper()
                if not s(game.get("question")) or answer not in options or len(options) != 4:
                    raise ValueError(f"Invalid vocabulary question {set_num}/{word.get('id')}/{game_num}")
                rows.append({
                    "external_code": f"VOCAB-SET{set_num:02d}-W{word_index:04d}-G{game_num}",
                    "part": "VOCABULARY", "question_text": s(game.get("question")), "options": j(options),
                    "correct_answer": answer, "explanation": s(game.get("explanation")),
                    "difficulty": band_for_level.get(level_key, "650-750"), "source_difficulty": source_level,
                    "status": "PUBLISHED", "skill": "Vocabulary (Từ vựng)",
                    "question_translation": "", "option_translations": "{}",
                })
    return rows

def copy_block(table: str, fields: tuple[str, ...], rows: list[dict[str, str]]) -> str:
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=fields, lineterminator="\n")
    writer.writeheader(); writer.writerows(rows)
    cols = ", ".join(fields)
    return f"\\copy {table} ({cols}) FROM STDIN WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')\n{stream.getvalue()}\\.\n"

def payload(g_rows, sets, words, bank) -> bytes:
    sql = "BEGIN;\n"
    sql += "CREATE TEMP TABLE g_import (" + ", ".join(f"{f} TEXT" for f in GRAMMAR_FIELDS) + ");\n"
    sql += copy_block("g_import", GRAMMAR_FIELDS, g_rows)
    sql += "INSERT INTO grammar_topics (id,code,title,english_title,grammar_group,summary,formula,signal_words,traps,examples,questions,order_index,theory,metadata,toeic_parts,difficulty,target_score,status,source_notes) SELECT id,code,title,english_title,grammar_group,summary,formula,signal_words::jsonb,traps::jsonb,'[]'::jsonb,questions::jsonb,order_index::int,theory::jsonb,metadata::jsonb,'[\"Part 5\"]'::jsonb,'MEDIUM','350_500','PUBLISHED','Imported from provided grammar dataset' FROM g_import ON CONFLICT(id) DO NOTHING;\n"
    sql += "CREATE TEMP TABLE vs_import (id TEXT,title TEXT,category TEXT,word_count TEXT);\n"
    sql += copy_block("vs_import", VOCAB_SET_FIELDS, sets)
    sql += "INSERT INTO vocabulary_test_sets (id,title,year,category,word_count,status) SELECT id,title,'TOEIC',category,word_count::int,'PUBLISHED' FROM vs_import ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,category=EXCLUDED.category,word_count=EXCLUDED.word_count,updated_at=now();\n"
    sql += "CREATE TEMP TABLE vi_import (" + ", ".join(f"{f} TEXT" for f in VOCAB_FIELDS) + ");\n"
    sql += copy_block("vi_import", VOCAB_FIELDS, words)
    sql += "INSERT INTO vocabulary_items (id,set_id,word,ipa,part_of_speech,meaning,example,example_meaning,level,starred,order_index,audio_url,meaning_source,meaning_edited) SELECT id,set_id,word,NULLIF(ipa,''),NULLIF(part_of_speech,''),meaning,NULLIF(example,''),NULLIF(example_meaning,''),level,false,order_index::int,NULLIF(audio_url,''),'IMPORT',false FROM vi_import ON CONFLICT(id) DO NOTHING;\n"
    sql += "INSERT INTO vocabulary_set_words (set_id,word_id,order_index) SELECT set_id,id,order_index::int FROM vi_import ON CONFLICT DO NOTHING;\n"
    sql += "INSERT INTO vocabulary_item_senses (vocabulary_item_id,part_of_speech,meaning,example,example_meaning,order_index) SELECT v.id,COALESCE(NULLIF(v.part_of_speech,''),'Noun'),v.meaning,v.example,v.example_meaning,0 FROM vocabulary_items v JOIN vi_import i ON i.id=v.id WHERE NOT EXISTS (SELECT 1 FROM vocabulary_item_senses s WHERE s.vocabulary_item_id=v.id);\n"
    sql += "CREATE TEMP TABLE bank_import (" + ", ".join(f"{f} TEXT" for f in BANK_FIELDS) + ");\n"
    sql += copy_block("bank_import", BANK_FIELDS, bank)
    sql += "INSERT INTO toeic_question_bank (external_code,part,question_text,options,correct_answer,explanation,difficulty,source_difficulty,status,skill,question_translation,option_translations) SELECT external_code,part,question_text,options::jsonb,correct_answer,explanation,difficulty,source_difficulty,status,skill,NULLIF(question_translation,''),option_translations::jsonb FROM bank_import ON CONFLICT(external_code) DO NOTHING;\n"
    sql += "COMMIT;\n"
    return sql.encode("utf-8")

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--data-dir", type=Path, required=True)
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()
    g = grammar_rows(args.data_dir / "grammar")
    sets, words = vocabulary_rows(args.data_dir / "vocabulary")
    bank = bank_rows(args.data_dir)
    print(f"Validated: {len(g)} grammar topics / {sum(len(json.loads(x['questions'])) for x in g)} grammar questions; {len(sets)} vocab sets / {len(words)} words; {len(bank)} questions for the question bank")
    if args.dry_run:
        return
    result = subprocess.run(["docker", "compose", "exec", "-T", "postgres", "sh", "-lc", 'psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'], cwd=ROOT, input=payload(g, sets, words, bank), capture_output=True)
    print(result.stdout.decode("utf-8", "replace"), end="")
    if result.returncode:
        print(result.stderr.decode("utf-8", "replace"), end="")
        raise SystemExit(result.returncode)

if __name__ == "__main__":
    main()
