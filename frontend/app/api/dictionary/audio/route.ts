import { NextRequest, NextResponse } from "next/server";

const TTS_API_URL = "https://dict.minhqnd.com/api/v1/tts";

export async function GET(request: NextRequest) {
  const word = new URL(request.url).searchParams.get("word")?.trim();
  if (!word || word.length > 80 || !/^[a-zA-Z][a-zA-Z' -]*$/.test(word)) {
    return NextResponse.json({ error: "Từ cần phát âm không hợp lệ." }, { status: 400 });
  }

  const query = new URLSearchParams({ word, lang: "en" });
  try {
    const response = await fetch(`${TTS_API_URL}?${query}`, {
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(10_000)]),
    });
    if (!response.ok || !response.body) {
      console.error("Dictionary TTS API returned HTTP", response.status);
      return NextResponse.json({ error: "Audio phát âm hiện không khả dụng." }, { status: 502 });
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    if (request.signal.aborted) {
      return NextResponse.json({ error: "Yêu cầu phát âm đã bị hủy." }, { status: 499 });
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json({ error: "Dịch vụ audio phản hồi quá lâu." }, { status: 504 });
    }
    console.error("Dictionary TTS proxy failed:", error);
    return NextResponse.json({ error: "Không thể kết nối dịch vụ audio từ điển." }, { status: 502 });
  }
}
