import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const dynamic = "force-dynamic";

const ALLOWED_ROOTS = [
  process.env.MEDIA_ROOT ? path.resolve(process.env.MEDIA_ROOT) : null,
  path.resolve(process.cwd(), "public"),
  path.resolve("D:/Project/Data"),
  path.resolve("E:/Data"),
].filter((r): r is string => Boolean(r));

const MIME_MAP: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".pdf": "application/pdf",
};

function isExistingFile(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function getAlternativeFilenames(filename: string): string[] {
  const candidates = new Set<string>([filename]);

  // Map q32_34.mp3 <-> c1.mp3 (Part 3: q32..q70, 13 conversations)
  // Map q71_73.mp3 <-> p4_t1.mp3 / talk1.mp3 (Part 4: q71..q100, 10 talks)
  const qGroupMatch = filename.match(/^q(\d+)_(\d+)\.(mp3|jpg|png)$/i);
  if (qGroupMatch) {
    const qStart = parseInt(qGroupMatch[1], 10);
    const qEnd = parseInt(qGroupMatch[2], 10);
    const ext = qGroupMatch[3].toLowerCase();
    if (ext === "mp3") {
      if (qStart >= 32 && qStart <= 70) {
        const cNum = Math.floor((qStart - 32) / 3) + 1;
        candidates.add(`c${cNum}.mp3`);
      } else if (qStart >= 71 && qStart <= 100) {
        const tNum = Math.floor((qStart - 71) / 3) + 1;
        candidates.add(`p4_t${tNum}.mp3`);
        candidates.add(`talk${tNum}.mp3`);
      }
    } else {
      candidates.add(`g${qStart}_${qEnd}.${ext}`);
    }
  }

  // Map talkX.mp3 -> p4_tX.mp3, q71_73.mp3
  const talkMatch = filename.match(/^(?:talk|p4_t)(\d+)\.mp3$/i);
  if (talkMatch) {
    const tNum = parseInt(talkMatch[1], 10);
    const qStart = 71 + (tNum - 1) * 3;
    candidates.add(`p4_t${tNum}.mp3`);
    candidates.add(`talk${tNum}.mp3`);
    candidates.add(`q${qStart}_${qStart + 2}.mp3`);
  }

  // Map cX.mp3 -> q32_34.mp3
  const cMatch = filename.match(/^c(\d+)\.mp3$/i);
  if (cMatch) {
    const cNum = parseInt(cMatch[1], 10);
    const qStart = 32 + (cNum - 1) * 3;
    candidates.add(`q${qStart}_${qStart + 2}.mp3`);
  }

  // Map part1_testX.mp3 -> q1.mp3
  if (filename.toLowerCase().includes("part1_test")) {
    candidates.add("q1.mp3");
  }

  return Array.from(candidates);
}

function resolveMediaFile(relativePath: string): string | null {
  // 1. Direct path check across all allowed roots
  for (const root of ALLOWED_ROOTS) {
    const directPath = path.resolve(root, relativePath);
    if (directPath.toLowerCase().startsWith(root.toLowerCase()) && isExistingFile(directPath)) {
      return directPath;
    }
  }

  // Extract year
  let year = "ETS 2024";
  if (relativePath.includes("2022")) {
    year = "ETS 2022";
  } else if (relativePath.includes("2023")) {
    year = "ETS 2023";
  } else if (relativePath.includes("2024")) {
    year = "ETS 2024";
  }

  // Extract test number (e.g. test_1, test_01, Test 1, Test_1)
  const testMatch = relativePath.match(/test[_\s-]*0?(\d+)/i);
  const testNum = testMatch ? parseInt(testMatch[1], 10) : 1;
  const testFolderPadded = `Test_${String(testNum).padStart(2, "0")}`;
  const testFolderPublic = `test_${testNum}`;

  const rawFilename = path.basename(relativePath);
  const candidateFilenames = getAlternativeFilenames(rawFilename);

  // 2. Check inside frontend/public/ets_2024_lc (and audio)
  const publicRoot = path.resolve(process.cwd(), "public");
  const publicSearchDirs = [
    path.resolve(publicRoot, "ets_2024_lc", testFolderPublic),
    path.resolve(publicRoot, "ets_2024_lc", "audio"),
    path.resolve(publicRoot, "ets_2024_lc1"),
    path.resolve(publicRoot, "audio"),
  ];

  for (const dir of publicSearchDirs) {
    for (const candidateName of candidateFilenames) {
      const candidatePath = path.resolve(dir, candidateName);
      if (isExistingFile(candidatePath)) {
        return candidatePath;
      }
    }
  }

  // 3. Check external data roots (D:/Project/Data, E:/Data, MEDIA_ROOT)
  const candidateYears = Array.from(new Set([year, "ETS 2024", "ETS 2023", "ETS 2022"]));
  for (const root of ALLOWED_ROOTS) {
    for (const yr of candidateYears) {
      const searchDirs = [
        path.resolve(root, yr, "Audio_Cat_Tung_Cau", testFolderPadded),
        path.resolve(root, yr, "Audio_Cat_Tung_Cau", testFolderPublic),
        path.resolve(root, yr, "audio"),
        path.resolve(root, yr, "AUDIO"),
      ];

      for (const dir of searchDirs) {
        for (const candidateName of candidateFilenames) {
          const candidatePath = path.resolve(dir, candidateName);
          if (isExistingFile(candidatePath)) {
            return candidatePath;
          }
        }

        // Case-insensitive search in directory
        if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
          try {
            const files = fs.readdirSync(dir);
            for (const candidateName of candidateFilenames) {
              const lowerName = candidateName.toLowerCase();
              const found = files.find((f) => f.toLowerCase() === lowerName);
              if (found) {
                const finalPath = path.resolve(dir, found);
                if (isExistingFile(finalPath)) return finalPath;
              }
            }
          } catch {}
        }
      }
    }
  }

  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await context.params;
    const rawSegments = resolvedParams.path || [];
    if (rawSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const decodedSegments = rawSegments.map((s) => decodeURIComponent(s));
    const relativePath = decodedSegments.join("/");

    const fullPath = resolveMediaFile(relativePath);

    // Security check: must reside inside one of ALLOWED_ROOTS
    const isInsideAllowedRoot = fullPath
      ? ALLOWED_ROOTS.some((root) => fullPath.toLowerCase().startsWith(root.toLowerCase()))
      : false;

    if (!fullPath || !isInsideAllowedRoot || !isExistingFile(fullPath)) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const stat = fs.statSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";
    const fileSize = stat.size;

    const rangeHeader = request.headers.get("range");

    if (rangeHeader && ext.match(/\.(mp3|wav|ogg|m4a)$/)) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        return new NextResponse("Requested Range Not Satisfiable", {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const chunkLength = end - start + 1;
      const fileStream = fs.createReadStream(fullPath, { start, end });
      const webStream = Readable.toWeb(fileStream);

      return new Response(webStream as unknown as BodyInit, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkLength.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Full content response (200)
    const fileStream = fs.createReadStream(fullPath);
    const webStream = Readable.toWeb(fileStream);

    return new Response(webStream as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving media file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
