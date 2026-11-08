import { NextRequest, NextResponse } from "next/server";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse("Dữ liệu dịch ví dụ không hợp lệ.", 400);
  }

  if (!isRecord(payload) || typeof payload.text !== "string") {
    return errorResponse("Vui lòng gửi câu ví dụ cần dịch.", 400);
  }

  const text = payload.text.trim();
  if (!text || text.length > 1000) {
    return errorResponse("Câu ví dụ cần có từ 1 đến 1000 ký tự.", 400);
  }

  try {
    const query = new URLSearchParams({ q: text, langpair: "en|vi" });
    const response = await fetch(`https://api.mymemory.translated.net/get?${query}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(8_000)]),
    });
    if (!response.ok) {
      console.error("Example translation API returned HTTP", response.status);
      return errorResponse("Dịch vụ dịch ví dụ hiện không khả dụng. Vui lòng thử lại.", 502);
    }

    const result: unknown = await response.json();
    if (!isRecord(result) || !isRecord(result.responseData)
      || typeof result.responseData.translatedText !== "string"
      || !result.responseData.translatedText.trim()) {
      console.error("Example translation API returned an unexpected response shape.");
      return errorResponse("Dịch vụ dịch không trả về kết quả hợp lệ.", 502);
    }

    return NextResponse.json({
      translation: result.responseData.translatedText.trim(),
      source: "MyMemory (dịch máy)",
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (request.signal.aborted) {
      return errorResponse("Yêu cầu dịch đã bị hủy.", 499);
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      return errorResponse("Dịch vụ dịch phản hồi quá lâu. Vui lòng thử lại.", 504);
    }
    console.error("Example translation proxy failed:", error);
    return errorResponse("Không thể kết nối dịch vụ dịch ví dụ.", 502);
  }
}
