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

async function verifyAdminOrTeacherSession(req: NextRequest): Promise<{ ok: boolean; status: number; message?: string }> {
  const cookieHeader = req.headers.get("cookie") || "";
  if (!cookieHeader.trim()) {
    return { ok: false, status: 401, message: "Vui lòng đăng nhập tài khoản Quản trị viên hoặc Giảng viên để tải tệp lên." };
  }
  const candidates = [
    process.env.BACKEND_INTERNAL_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    "http://backend:8080",
    "http://127.0.0.1:8080",
  ].filter((u): u is string => Boolean(u && u.trim()));

  for (const base of candidates) {
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/api/auth/me`, {
        method: "GET",
        headers: { cookie: cookieHeader, accept: "application/json" },
        cache: "no-store",
      });
      if (res.status === 401 || res.status === 403) {
        return { ok: false, status: res.status, message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." };
      }
      if (res.ok) {
        const user = (await res.json()) as { role?: string; roles?: string[] };
        const roleStr = String(user.role || (Array.isArray(user.roles) ? user.roles.join(",") : "")).toUpperCase();
        if (roleStr.includes("ADMIN") || roleStr.includes("TEACHER")) {
          return { ok: true, status: 200 };
        }
        return { ok: false, status: 403, message: "Chỉ Quản trị viên hoặc Giảng viên mới có quyền tải tệp media lên hệ thống." };
      }
    } catch {
      // Thử endpoint nội bộ tiếp theo
    }
  }
  return { ok: false, status: 401, message: "Không thể xác thực quyền tải tệp với máy chủ." };
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAdminOrTeacherSession(req);
    if (!authCheck.ok) {
      return NextResponse.json(
        { error: authCheck.message || "Không có quyền truy cập." },
        { status: authCheck.status }
      );
    }

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

