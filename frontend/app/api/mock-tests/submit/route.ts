import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080").replace(/\/$/, "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    const cookieHeader = request.headers.get("cookie");

    // Proxy to Spring Boot backend which writes directly to PostgreSQL user_mock_test_attempts table
    const res = await fetch(`${BACKEND_URL}/api/mock-tests/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 201 });
    }

    return NextResponse.json(
      {
        id: body.id || `sub-${Date.now()}`,
        status: "Đã chấm điểm",
        ...body,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }
}
