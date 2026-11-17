#!/usr/bin/env python3
"""Import ETS 2022/2023/2024 detailed JSON questions into the shared question bank."""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
YEARS = (2022, 2023, 2024)
PART_RE = re.compile(r"^Part\s+([1-7])\b", re.IGNORECASE)
TEST_RE = re.compile(r"ETS_(2022|2023|2024)_Test_(\d{2})_Chi_Tiet\.json$", re.IGNORECASE)
BANDS = {1: "450-550", 2: "550-650", 3: "650-750", 4: "750-850"}
FIELDS = (
    "external_code", "part", "question_text", "passage", "bilingual_passage",
    "audio_url", "image_url", "options", "correct_answer", "explanation",
    "transcript", "translation", "question_translation", "option_translations", "trap_note", "vocab_list",
    "difficulty", "source_difficulty", "source_audio_path", "source_image_path", "skill", "status",
)


def text(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def json_text(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")) if value is not None else ""


def iter_questions(data_dir: Path):
    found: dict[int, list[Path]] = {year: [] for year in YEARS}
    for year in YEARS:
        folder = data_dir / f"ets_{year}"
        if not folder.is_dir():
            raise SystemExit(f"Thiếu thư mục dữ liệu: {folder}")
        for path in sorted(folder.glob("ETS_*_Test_*_Chi_Tiet.json")):
            match = TEST_RE.fullmatch(path.name)
            if match and int(match.group(1)) == year:
                found[year].append(path)

    for year, files in found.items():
        if not files:
            raise SystemExit(f"Không tìm thấy file ETS {year} chi tiết.")
        for path in files:
            match = TEST_RE.fullmatch(path.name)
            assert match is not None
            test_number = int(match.group(2))
            try:
                data = json.loads(path.read_text(encoding="utf-8-sig"))
            except (OSError, json.JSONDecodeError) as exc:
                raise SystemExit(f"JSON không đọc được ({path.name}): {exc}") from exc
            for item in data.get("questions", []):
                yield year, test_number, path.name, item


def passage_for(item: dict[str, Any]) -> tuple[str, str]:
    passage = text(item.get("passageTextEn"))
    bilingual = text(item.get("passageTextVi") or item.get("fullPassageVi"))
    passages = item.get("passages")
    if isinstance(passages, list):
        blocks = [text(block.get("text")) for block in passages if isinstance(block, dict)]
        blocks = [block for block in blocks if block]
        if not passage and blocks:
            passage = "\n\n".join(blocks)
    return passage, bilingual


def source_difficulty(item: dict[str, Any]) -> tuple[str, str]:
    raw = item.get("difficultyLevel")
    if not isinstance(raw, dict):
        return "650-750", "Không có phân loại độ khó trong dữ liệu nguồn"
    try:
        level = int(raw.get("level"))
    except (TypeError, ValueError):
        level = 0
    name = text(raw.get("name")) or text(raw.get("scoreRange")) or text(raw.get("code"))
    return BANDS.get(level, "650-750"), name or "Không rõ mức độ khó gốc"


def explanation_for(item: dict[str, Any]) -> str:
    parts = [text(item.get("explanation"))]
    steps = item.get("steps")
    if isinstance(steps, list):
        for index, step in enumerate(steps, start=1):
            if isinstance(step, dict):
                content = text(step.get("desc") or step.get("text") or step.get("content"))
                title = text(step.get("title"))
                if title and content:
                    parts.append(f"Step {index} — {title}: {content}")
                elif content or title:
                    parts.append(f"Step {index}: {content or title}")
            elif text(step):
                parts.append(f"Step {index}: {text(step)}")
    else:
        for index in range(1, 4):
            step = text(item.get(f"step{index}"))
            if step:
                parts.append(f"Step {index}: {step}")
    return "\n\n".join(part for part in parts if part)


def row_for(year: int, test_number: int, item: dict[str, Any]) -> dict[str, str]:
    part_label = text(item.get("part"))
    match = PART_RE.match(part_label)
    if not match:
        raise ValueError(f"Part không hợp lệ trong ETS {year} Test {test_number}: {part_label!r}")
    part_num = int(match.group(1))
    question_num = item.get("questionNumber")
    if not isinstance(question_num, (int, str)) or not str(question_num).isdigit():
        raise ValueError(f"Thiếu questionNumber trong ETS {year} Test {test_number}")
    code = f"ETS{year}-T{test_number:02d}-Q{int(question_num):03d}"

    raw_options = item.get("options")
    if isinstance(raw_options, dict):
        options = {str(key).strip().upper(): str(value).strip() for key, value in raw_options.items()
                   if str(key).strip().upper() in {"A", "B", "C", "D"} and text(str(value))}
    elif isinstance(raw_options, list):
        options = {chr(ord("A") + index): text(value) for index, value in enumerate(raw_options[:4]) if text(value)}
    else:
        options = {}
    answer = text(item.get("correctAnswer")).upper()
    if len(options) < 2 or answer not in options:
        raise ValueError(f"Thiếu lựa chọn/đáp án hợp lệ tại {code}")

    passage, bilingual_passage = passage_for(item)
    difficulty, original_difficulty = source_difficulty(item)
    skills = {
        1: "Photographs", 2: "Question-Response", 3: "Conversations", 4: "Short Talks",
        5: "Grammar & Vocabulary", 6: "Text Completion", 7: "Reading Comprehension",
    }
    return {
        "external_code": code,
        "part": f"PART_{part_num}",
        "question_text": text(item.get("questionEn") or item.get("questionText")),
        "passage": passage,
        "bilingual_passage": bilingual_passage,
        # The provided archive has no media files. Keep source references separately,
        # and do not publish dead relative paths as playable URLs.
        "audio_url": "",
        "image_url": "",
        "options": json_text(options),
        "correct_answer": answer,
        "explanation": explanation_for(item),
        "transcript": text(item.get("fullTranscriptEn")),
        "translation": text(item.get("fullTranscriptVi")),
        "question_translation": text(item.get("questionVi")),
        "option_translations": json_text(item.get("optionTranslations") if isinstance(item.get("optionTranslations"), dict) else {}),
        "trap_note": text(item.get("trapNote")),
        "vocab_list": json_text(item.get("vocabulary") if isinstance(item.get("vocabulary"), list) else []),
        "difficulty": difficulty,
        "source_difficulty": original_difficulty,
        "source_audio_path": text(item.get("audioGroupFile") or item.get("audioFile")),
        "source_image_path": text(item.get("imageFile")),
        "skill": skills[part_num],
        "status": "PUBLISHED",
    }


def collect_rows(data_dir: Path) -> tuple[list[dict[str, str]], list[str]]:
    rows: list[dict[str, str]] = []
    source_files: set[str] = set()
    seen_codes: set[str] = set()
    for year, test_number, filename, item in iter_questions(data_dir):
        source_files.add(filename)
        row = row_for(year, test_number, item)
        if not row["question_text"]:
            raise ValueError(f"Thiếu nội dung câu hỏi tại {row['external_code']}")
        if row["external_code"] in seen_codes:
            raise ValueError(f"Mã câu hỏi trùng trong dữ liệu đầu vào: {row['external_code']}")
        seen_codes.add(row["external_code"])
        rows.append(row)
    return rows, sorted(source_files)


def psql_payload(rows: list[dict[str, str]]) -> bytes:
    csv_stream = io.StringIO(newline="")
    writer = csv.DictWriter(csv_stream, fieldnames=FIELDS, lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)

    json_columns = {"options", "option_translations", "vocab_list"}
    definitions = []
    for field in FIELDS:
        if field in json_columns:
            definitions.append(f"{field} TEXT")
        else:
            definitions.append(f"{field} TEXT")
    staging = ", ".join(definitions)
    target_columns = ", ".join(FIELDS)
    select_columns = ", ".join(
        f"{field}::jsonb" if field in json_columns else field for field in FIELDS
    )
    header = (
        "BEGIN;\n"
        f"CREATE TEMP TABLE ets_question_import ({staging});\n"
        "\\copy ets_question_import (" + target_columns + ") FROM STDIN WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')\n"
    )
    footer = (
        "\\.\n"
        "INSERT INTO toeic_question_bank (" + target_columns + ")\n"
        "SELECT " + select_columns + " FROM ets_question_import\n"
        "ON CONFLICT (external_code) DO UPDATE SET\n"
        "  explanation = EXCLUDED.explanation,\n"
        "  question_translation = EXCLUDED.question_translation,\n"
        "  option_translations = EXCLUDED.option_translations,\n"
        "  source_difficulty = EXCLUDED.source_difficulty,\n"
        "  source_audio_path = EXCLUDED.source_audio_path,\n"
        "  source_image_path = EXCLUDED.source_image_path;\n"
        "COMMIT;\n"
    )
    return (header + csv_stream.getvalue() + footer).encode("utf-8")


def import_with_compose(payload: bytes) -> None:
    command = [
        "docker", "compose", "exec", "-T", "postgres", "sh", "-c",
        'psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"',
    ]
    result = subprocess.run(command, cwd=ROOT, input=payload, capture_output=True)
    if result.returncode:
        sys.stderr.write(result.stdout.decode("utf-8", errors="replace"))
        sys.stderr.write(result.stderr.decode("utf-8", errors="replace"))
        raise SystemExit(result.returncode)
    output = result.stdout.decode("utf-8", errors="replace").strip()
    if output:
        print(output)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, required=True, help="Thư mục chứa ets_2022, ets_2023, ets_2024")
    parser.add_argument("--dry-run", action="store_true", help="Chỉ kiểm tra và thống kê dữ liệu, không ghi database")
    args = parser.parse_args()

    rows, files = collect_rows(args.data_dir.resolve())
    counts: dict[int, int] = {year: 0 for year in YEARS}
    for row in rows:
        counts[int(row["external_code"][3:7])] += 1
    print(f"Đã kiểm tra {len(files)} file đề, {len(rows)} câu hỏi.")
    print("Số câu theo năm: " + ", ".join(f"ETS {year}: {counts[year]}" for year in YEARS))
    print(f"Câu Part 1-7 đã chuẩn hóa; band gốc được ánh xạ theo thứ tự: {dict(BANDS)}")
    print("Mã ổn định theo năm/đề/số câu; chạy lại cập nhật nội dung nguồn nhưng giữ nguyên band admin đã chỉnh.")
    if args.dry_run:
        return
    import_with_compose(psql_payload(rows))
    print("Đã nhập xong vào toeic_question_bank.")


if __name__ == "__main__":
    main()
