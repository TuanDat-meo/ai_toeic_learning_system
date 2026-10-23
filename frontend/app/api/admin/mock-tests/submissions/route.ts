import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080").replace(/\/$/, "");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testIdParam = searchParams.get("testId");
    const testId = testIdParam ? parseInt(testIdParam, 10) : null;
    const query = testId && !isNaN(testId) && testId > 0 ? `?testId=${testId}` : "";

    // Proxy to backend Spring Boot which queries PostgreSQL directly
    const authHeader = request.headers.get("authorization");
    const cookieHeader = request.headers.get("cookie");

    const res = await fetch(`${BACKEND_URL}/api/admin/mock-tests/submissions${query}`, {
      headers: {
        Accept: "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
