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

    // Fallback normalizations
    // If request is e.g. "Audio_Cat_Tung_Cau/Test_01/q1.mp3", search in ETS 2024, ETS 2023, ETS 2022
    let fullPath = path.resolve(DATA_ROOT, relativePath);

    if (!fs.existsSync(fullPath)) {
      if (relativePath.startsWith("Audio_Cat_Tung_Cau/")) {
        const candidateYears = ["ETS 2024", "ETS 2023", "ETS 2022"];
        for (const yr of candidateYears) {
          const tryPath = path.resolve(DATA_ROOT, yr, relativePath);
          if (fs.existsSync(tryPath)) {
            fullPath = tryPath;
            break;
          }
        }
      } else if (relativePath.toLowerCase().startsWith("ets2024/")) {
        const sub = relativePath.slice("ets2024/".length);
        const tryPath = path.resolve(DATA_ROOT, "ETS 2024/Audio_Cat_Tung_Cau", sub);
        if (fs.existsSync(tryPath)) fullPath = tryPath;
      } else if (relativePath.toLowerCase().startsWith("ets2023/")) {
        const sub = relativePath.slice("ets2023/".length);
        const tryPath = path.resolve(DATA_ROOT, "ETS 2023/Audio_Cat_Tung_Cau", sub);
        if (fs.existsSync(tryPath)) fullPath = tryPath;
      } else if (relativePath.toLowerCase().startsWith("ets2022/")) {
        const sub = relativePath.slice("ets2022/".length);
        const tryPath = path.resolve(DATA_ROOT, "ETS 2022/Audio_Cat_Tung_Cau", sub);
        if (fs.existsSync(tryPath)) fullPath = tryPath;
      }

      // Strict isolation: Each year serves its own verified media only
    }

    // Security check: must reside inside DATA_ROOT
    if (!fullPath.startsWith(DATA_ROOT) || !fs.existsSync(fullPath)) {
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
