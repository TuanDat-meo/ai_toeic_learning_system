import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const dynamic = "force-dynamic";

const DATA_ROOT = path.resolve("E:/Data");

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

function resolveMediaFile(relativePath: string): string | null {
  const directPath = path.resolve(DATA_ROOT, relativePath);
  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    return directPath;
  }

  // Determine target year
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
  let testFolder = "Test_01";
  if (testMatch) {
    const num = parseInt(testMatch[1], 10);
    testFolder = `Test_${String(num).padStart(2, "0")}`;
  }

  const filename = path.basename(relativePath);

  // Candidate years to check (preferred year first)
  const candidateYears = [year, "ETS 2024", "ETS 2023", "ETS 2022"];
  for (const yr of candidateYears) {
    const p1 = path.resolve(DATA_ROOT, yr, "Audio_Cat_Tung_Cau", testFolder, filename);
    if (fs.existsSync(p1) && fs.statSync(p1).isFile()) return p1;

    // Check direct audio folder under year (e.g. E:/Data/ETS 2024/audio/part1_test1.mp3)
    const pAudio = path.resolve(DATA_ROOT, yr, "audio", filename);
    if (fs.existsSync(pAudio) && fs.statSync(pAudio).isFile()) return pAudio;

    // Check talkX -> p4_tX
    const talkMatch = filename.match(/^talk(\d+)\.mp3$/i);
    if (talkMatch) {
      const tNum = parseInt(talkMatch[1], 10);
      const pTalk = path.resolve(DATA_ROOT, yr, "Audio_Cat_Tung_Cau", testFolder, `p4_t${tNum}.mp3`);
      if (fs.existsSync(pTalk) && fs.statSync(pTalk).isFile()) return pTalk;

      const qStart = 71 + (tNum - 1) * 3;
      const pQ = path.resolve(DATA_ROOT, yr, "Audio_Cat_Tung_Cau", testFolder, `q${qStart}_${qStart + 2}.mp3`);
      if (fs.existsSync(pQ) && fs.statSync(pQ).isFile()) return pQ;
    }

    // Check cX -> q32_34 etc.
    const cMatch = filename.match(/^c(\d+)\.mp3$/i);
    if (cMatch) {
      const cNum = parseInt(cMatch[1], 10);
      const qStart = 32 + (cNum - 1) * 3;
      const pQ = path.resolve(DATA_ROOT, yr, "Audio_Cat_Tung_Cau", testFolder, `q${qStart}_${qStart + 2}.mp3`);
      if (fs.existsSync(pQ) && fs.statSync(pQ).isFile()) return pQ;
    }

    // Check part1_test1.mp3 -> q1.mp3
    if (filename.toLowerCase().includes("part1_test")) {
      const pQ1 = path.resolve(DATA_ROOT, yr, "Audio_Cat_Tung_Cau", testFolder, "q1.mp3");
      if (fs.existsSync(pQ1) && fs.statSync(pQ1).isFile()) return pQ1;
    }

    // Case-insensitive file search in test directory
    const testDir = path.resolve(DATA_ROOT, yr, "Audio_Cat_Tung_Cau", testFolder);
    if (fs.existsSync(testDir) && fs.statSync(testDir).isDirectory()) {
      try {
        const files = fs.readdirSync(testDir);
        const lowerName = filename.toLowerCase();
        const found = files.find((f) => f.toLowerCase() === lowerName);
        if (found) {
          const finalPath = path.resolve(testDir, found);
          if (fs.existsSync(finalPath) && fs.statSync(finalPath).isFile()) return finalPath;
        }
      } catch {}
    }
  }

  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const rawSegments = resolvedParams.path || [];
    if (rawSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const decodedSegments = rawSegments.map((s) => decodeURIComponent(s));
    const relativePath = decodedSegments.join("/");

    const fullPath = resolveMediaFile(relativePath);

    // Security check: must reside inside DATA_ROOT
    if (!fullPath || !fullPath.toLowerCase().startsWith(DATA_ROOT.toLowerCase()) || !fs.existsSync(fullPath)) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) {
      return new NextResponse("Invalid File", { status: 400 });
    }

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
