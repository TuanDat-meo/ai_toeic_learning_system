#!/usr/bin/env python3
"""Extract audio/image assets from the supplied RAR and store their bytes in PostgreSQL."""

from __future__ import annotations

import argparse
import csv
import io
import mimetypes
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
CONTAINER = "toeic-postgres"
CONTAINER_ROOT = "/tmp/ets-media-import"
ALLOWED = {".mp3", ".wav", ".m4a", ".ogg", ".jpg", ".jpeg", ".png", ".webp"}


def run(command: list[str], **kwargs):
    return subprocess.run(command, check=True, **kwargs)


def archive_media_entries(archive: Path) -> list[str]:
    result = subprocess.run(["tar", "-tf", str(archive)], capture_output=True, text=True, encoding="utf-8", errors="replace")
    entries = []
    for raw in result.stdout.splitlines():
        name = raw.strip().replace("\\", "/")
        relative = PurePosixPath(name)
        if not name or relative.is_absolute() or ".." in relative.parts or relative.suffix.lower() not in ALLOWED:
            continue
        if not name.startswith("Data/"):
            continue
        entries.append(name)
    entries = list(dict.fromkeys(entries))
    if not entries:
        raise SystemExit("The archive contains no supported audio or image files under Data/.")
    if result.returncode not in (0, 1):
        raise SystemExit("Could not read the RAR directory. Install a RAR-capable tar/bsdtar utility and retry.")
    return entries


def make_manifest(stage: Path, entries: list[str]) -> tuple[bytes, int, int]:
    output = io.StringIO(newline="")
    writer = csv.writer(output, lineterminator="\n")
    writer.writerow(("storage_key", "original_name", "content_type", "size_bytes", "file_path"))
    total_bytes = 0
    for entry in entries:
        local = stage.joinpath(*PurePosixPath(entry).parts)
        if local.is_symlink() or not local.is_file():
            raise ValueError(f"Expected regular extracted media file is missing: {entry}")
        size = local.stat().st_size
        if size <= 0:
            raise ValueError(f"Empty media file in archive: {entry}")
        ext = local.suffix.lower()
        content_type = mimetypes.types_map.get(ext, "application/octet-stream")
        container_file = f"{CONTAINER_ROOT}/{entry}"
        writer.writerow((entry, local.name, content_type, size, container_file))
        total_bytes += size
    return output.getvalue().encode("utf-8"), len(entries), total_bytes


def psql_import(manifest: bytes, entries: int, expected_bytes: int) -> None:
    script = (
        "BEGIN;\n"
        "CREATE TEMP TABLE import_media_stage (storage_key TEXT, original_name TEXT, content_type TEXT, size_bytes TEXT, file_path TEXT);\n"
        "\\copy import_media_stage FROM STDIN WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')\n"
    ).encode("utf-8") + manifest + b"\\.\n" + f"""
DO $$
DECLARE item RECORD;
BEGIN
  FOR item IN SELECT * FROM import_media_stage ORDER BY storage_key LOOP
    INSERT INTO media_assets (storage_key, original_name, content_type, size_bytes, content)
    VALUES (item.storage_key, item.original_name, item.content_type, item.size_bytes::bigint,
            pg_read_binary_file(item.file_path))
    ON CONFLICT (storage_key) DO UPDATE SET
      original_name = EXCLUDED.original_name,
      content_type = EXCLUDED.content_type,
      size_bytes = EXCLUDED.size_bytes,
      content = EXCLUDED.content;
  END LOOP;
END $$;

UPDATE toeic_question_bank q
SET audio_url = '/api/media-assets/' || m.id::text
FROM media_assets m
WHERE q.source_audio_path IS NOT NULL
  AND q.external_code ~ '^ETS20(22|23|24)-'
  AND m.storage_key = 'Data/ETS ' || substring(q.external_code from '^ETS(20[0-9]{2})') || '/' || q.source_audio_path;

UPDATE toeic_question_bank q
SET image_url = '/api/media-assets/' || m.id::text
FROM media_assets m
WHERE q.source_image_path IS NOT NULL
  AND q.external_code ~ '^ETS20(22|23|24)-'
  AND m.storage_key = 'Data/ETS ' || substring(q.external_code from '^ETS(20[0-9]{2})') || '/' || q.source_image_path;

COMMIT;
""".encode("utf-8")
    result = subprocess.run(
        ["docker", "exec", "-i", CONTAINER, "sh", "-lc", 'psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'],
        input=script, capture_output=True,
    )
    sys.stdout.write(result.stdout.decode("utf-8", "replace"))
    if result.returncode:
        sys.stderr.write(result.stderr.decode("utf-8", "replace"))
        raise SystemExit(result.returncode)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("archive", type=Path)
    parser.add_argument("--stage", type=Path, default=ROOT / ".media-import-staging")
    parser.add_argument("--keep-extracted", action="store_true")
    args = parser.parse_args()
    archive = args.archive.resolve()
    stage = args.stage.resolve()
    entries = archive_media_entries(archive)
    print(f"Archive inventory: {len(entries):,} audio/image files. Extracting to {stage}", flush=True)

    if stage.exists():
        # Reuse only previously extracted files; reject symlink staging roots.
        if stage.is_symlink() or not stage.is_dir():
            raise SystemExit(f"Unsafe staging path: {stage}")
    else:
        stage.mkdir(parents=True)

    listing = stage / "media-list.txt"
    listing.write_text("\n".join(entries) + "\n", encoding="utf-8")
    log_path = stage / "tar-extract.log"
    with log_path.open("w", encoding="utf-8", errors="replace") as error_log:
        extraction = subprocess.run(["tar", "-xf", str(archive), "-C", str(stage), "-T", str(listing)], stdout=subprocess.DEVNULL, stderr=error_log)
    if extraction.returncode not in (0, 1):
        raise SystemExit(f"Archive extraction failed. Review {log_path}")

    manifest, count, total_bytes = make_manifest(stage, entries)
    print(f"Extracted {count:,} files ({total_bytes / 1024**3:.2f} GiB). Preparing PostgreSQL import.", flush=True)

    run(["docker", "exec", CONTAINER, "mkdir", "-p", CONTAINER_ROOT])
    run(["docker", "cp", str(stage / "Data"), f"{CONTAINER}:{CONTAINER_ROOT}/"])
    run(["docker", "exec", "-u", "0", CONTAINER, "chown", "-R", "postgres:postgres", CONTAINER_ROOT])
    psql_import(manifest, count, total_bytes)

    if not args.keep_extracted:
        run(["docker", "exec", CONTAINER, "rm", "-rf", CONTAINER_ROOT])
        shutil.rmtree(stage)
    print(f"Imported {count:,} audio/image files ({total_bytes / 1024**3:.2f} GiB) into PostgreSQL.")


if __name__ == "__main__":
    main()
