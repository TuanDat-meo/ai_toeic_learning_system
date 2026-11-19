import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".m4a"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const MAX_AUDIO_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB

function sanitizeBaseName(name: string): string {
  const base = path.basename(name, path.extname(name));
  const clean = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
  return clean || "media";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fileEntry = formData.get("file");

    if (!fileEntry || !(fileEntry instanceof File)) {
      return NextResponse.json(
        { error: "Vui lòng chọn tệp âm thanh hoặc hình ảnh để tải lên." },
        { status: 400 }
      );
    }

    const originalName = fileEntry.name || "upload";
    const ext = path.extname(originalName).toLowerCase();
    const isAudio = AUDIO_EXTENSIONS.has(ext);
    const isImage = IMAGE_EXTENSIONS.has(ext);

    if (!isAudio && !isImage) {
      return NextResponse.json(
        {
          error:
            "Định dạng tệp không hợp lệ. Chỉ hỗ trợ âm thanh (.mp3, .wav, .ogg, .m4a) hoặc hình ảnh (.png, .jpg, .jpeg, .webp).",
        },
        { status: 400 }
      );
    }

    const maxBytes = isAudio ? MAX_AUDIO_BYTES : MAX_IMAGE_BYTES;
    if (fileEntry.size <= 0 || fileEntry.size > maxBytes) {
      return NextResponse.json(
        {
          error: isAudio
            ? "Dung lượng tệp âm thanh không hợp lệ (tối đa 50 MB)."
            : "Dung lượng tệp hình ảnh không hợp lệ (tối đa 15 MB).",
        },
        { status: 400 }
      );
    }

    const subFolder = isAudio ? "audio" : "images";
    const safeName = `${Date.now()}-${sanitizeBaseName(originalName)}${ext}`;

    const basePublicRoot =
      process.env.MEDIA_ROOT
        ? path.resolve(process.env.MEDIA_ROOT)
        : process.env.MEDIA_DIR
        ? path.resolve(process.env.MEDIA_DIR)
        : path.resolve(process.cwd(), "public");

    const uploadDir = path.join(basePublicRoot, "ets_2024_lc", "uploads", subFolder);
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const targetPath = path.join(uploadDir, safeName);
    const arrayBuffer = await fileEntry.arrayBuffer();
    await fs.promises.writeFile(targetPath, Buffer.from(arrayBuffer));

    const publicUrl = `/ets_2024_lc/uploads/${subFolder}/${safeName}`;

    return NextResponse.json(
      {
        url: publicUrl,
        fileName: originalName,
        mediaType: isAudio ? "audio" : "image",
        sizeBytes: fileEntry.size,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Không thể tải tệp media lên máy chủ.",
      },
      { status: 500 }
    );
  }
}

