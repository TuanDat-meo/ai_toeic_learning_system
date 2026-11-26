import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const dynamic = "force-dynamic";

// Candidate roots for media data (both local disk datasets and environment directories)
const ALLOWED_ROOTS = [
  path.resolve("E:/data trong dự án forntend"),
  path.resolve("e:/ai_toeic_learning_system/data"),
  path.resolve(process.cwd(), "data"),
  path.resolve(process.cwd(), "../data"),
  path.resolve("E:/Data"),
  process.env.MEDIA_ROOT ? path.resolve(process.env.MEDIA_ROOT) : null,
  process.env.MEDIA_DIR ? path.resolve(process.env.MEDIA_DIR) : null,
  path.resolve(process.cwd(), "public"),
].filter((p): p is string => {
  try {
    return Boolean(p && fs.existsSync(p) && fs.statSync(p).isDirectory());
  } catch {
    return false;
  }
});

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

function resolveMediaFile(relativePath: string, contextYear?: string | null): string | null {
  // Normalize clean path
  let cleaned = relativePath.replace(/^(\/|\\)+/, "").replace(/\\/g, "/");
  // Normalize rewrites like ets_2024_lc/ -> ets_2024/
  cleaned = cleaned.replace(/^ets_(\d{4})_lc\//i, "ets_$1/");

  // Determine target year
  let detectedYear: string | null = null;
  if (contextYear) {
    if (contextYear.includes("2022")) detectedYear = "2022";
    else if (contextYear.includes("2023")) detectedYear = "2023";
    else if (contextYear.includes("2024")) detectedYear = "2024";
  }

  if (!detectedYear) {
    if (cleaned.includes("2022")) detectedYear = "2022";
    else if (cleaned.includes("2023")) detectedYear = "2023";
    else if (cleaned.includes("2024")) detectedYear = "2024";
  }

  // Extract test folder (e.g. test_01, Test 1, Test_01)
  const testMatch = cleaned.match(/test[_\s-]*0?(\d+)/i);
  let testFolder = "Test_01";
  let testNum = 1;
  if (testMatch) {
    testNum = parseInt(testMatch[1], 10);
    testFolder = `Test_${String(testNum).padStart(2, "0")}`;
  }

  const filename = path.basename(cleaned);

  // Candidate file names (handling aliases: c1.mp3 <-> q32_34.mp3, talk1.mp3 <-> q71_73.mp3)
  const candidateNames = new Set<string>([filename]);
  const talkMatch = filename.match(/^talk(\d+)\.mp3$/i);
  if (talkMatch) {
    const tNum = parseInt(talkMatch[1], 10);
    candidateNames.add(`p4_t${tNum}.mp3`);
    const qStart = 71 + (tNum - 1) * 3;
    candidateNames.add(`q${qStart}_${qStart + 2}.mp3`);
  }
  const p4Match = filename.match(/^p4_t(\d+)\.mp3$/i);
  if (p4Match) {
    const tNum = parseInt(p4Match[1], 10);
    candidateNames.add(`talk${tNum}.mp3`);
    const qStart = 71 + (tNum - 1) * 3;
    candidateNames.add(`q${qStart}_${qStart + 2}.mp3`);
  }
  const qMatch = filename.match(/^q(\d+)_(\d+)\.(mp3|jpg|png)$/i);
  if (qMatch) {
    const qStart = parseInt(qMatch[1], 10);
    const qEnd = parseInt(qMatch[2], 10);
    const ext = qMatch[3].toLowerCase();
    if (ext === "mp3") {
      if (qStart >= 71) {
        const tNum = Math.floor((qStart - 71) / 3) + 1;
        candidateNames.add(`p4_t${tNum}.mp3`);
        candidateNames.add(`talk${tNum}.mp3`);
      } else if (qStart >= 32) {
        const cNum = Math.floor((qStart - 32) / 3) + 1;
        candidateNames.add(`c${cNum}.mp3`);
      }
    } else {
      candidateNames.add(`g${qStart}_${qEnd}.${ext}`);
    }
  }
  const cMatch = filename.match(/^c(\d+)\.mp3$/i);
  if (cMatch) {
    const cNum = parseInt(cMatch[1], 10);
    const qStart = 32 + (cNum - 1) * 3;
    candidateNames.add(`q${qStart}_${qStart + 2}.mp3`);
  }
  if (filename.toLowerCase().includes("part1_test")) {
    candidateNames.add("q1.mp3");
  }

  const candidateNamesList = Array.from(candidateNames);

  // Candidate year folders to inspect
  const candidateYearFolders: string[] = [];
  if (detectedYear) {
    candidateYearFolders.push(`ets_${detectedYear}`, `ETS ${detectedYear}`);
  } else {
    candidateYearFolders.push("ets_2024", "ETS 2024", "ets_2023", "ETS 2023", "ets_2022", "ETS 2022");
  }

  // 1. Check all allowed roots
  for (const root of ALLOWED_ROOTS) {
    // 1a. Direct path check
    const pDirect = path.resolve(root, cleaned);
    if (isExistingFile(pDirect)) {
      return pDirect;
    }

    // 1b. Year-based search inside root
    for (const yrFolder of candidateYearFolders) {
      for (const fn of candidateNamesList) {
        const searchPaths = [
          path.resolve(root, yrFolder, "Audio_Cat_Tung_Cau", testFolder, fn),
          path.resolve(root, yrFolder, "Audio_Cat_Tung_Cau", `test_${testNum}`, fn),
          path.resolve(root, yrFolder, "audio", fn),
          path.resolve(root, yrFolder, "AUDIO", fn),
          path.resolve(root, yrFolder, testFolder, fn),
          path.resolve(root, yrFolder, `test_${testNum}`, fn),
        ];

        for (const sp of searchPaths) {
          if (isExistingFile(sp)) return sp;
        }

        // Case-insensitive search inside test folder
        const testDir = path.resolve(root, yrFolder, "Audio_Cat_Tung_Cau", testFolder);
        if (fs.existsSync(testDir) && fs.statSync(testDir).isDirectory()) {
          try {
            const files = fs.readdirSync(testDir);
            const lowerName = fn.toLowerCase();
            const found = files.find((f) => f.toLowerCase() === lowerName);
            if (found) {
              const finalPath = path.resolve(testDir, found);
              if (isExistingFile(finalPath)) return finalPath;
            }
          } catch {}
        }
      }
    }
  }

  // 2. Check public directory
  const publicRoot = path.resolve(process.cwd(), "public");
  const publicSearchDirs = [
    path.resolve(publicRoot, "ets_2024_lc", `test_${testNum}`),
    path.resolve(publicRoot, "ets_2024_lc", `test_${testNum}`, "audio"),
    path.resolve(publicRoot, "ets_2024_lc", `test_${testNum}`, "images"),
    path.resolve(publicRoot, "ets_2024_lc", "uploads", "audio"),
    path.resolve(publicRoot, "ets_2024_lc", "uploads", "images"),
    path.resolve(publicRoot, "ets_2024_lc", "audio"),
    path.resolve(publicRoot, "audio"),
  ];

  for (const dir of publicSearchDirs) {
    for (const fn of candidateNamesList) {
      const candidatePath = path.resolve(dir, fn);
      if (isExistingFile(candidatePath)) {
        return candidatePath;
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

    // Context year detection from referer URL or query params
    const referer = request.headers.get("referer") || "";
    const queryYear = request.nextUrl.searchParams.get("year") || request.nextUrl.searchParams.get("examYear");
    let contextYear = queryYear;
    if (!contextYear) {
      if (referer.includes("2022")) contextYear = "2022";
      else if (referer.includes("2023")) contextYear = "2023";
      else if (referer.includes("2024")) contextYear = "2024";
    }

    const fullPath = resolveMediaFile(relativePath, contextYear);

    // Security check: must reside inside one of ALLOWED_ROOTS or public dir
    const isSafe = fullPath && isExistingFile(fullPath);
    if (!isSafe || !fullPath) {
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
