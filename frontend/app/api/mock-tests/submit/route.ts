import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function getSubmissionsFilePath(): string {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return path.join(dir, "mock_test_submissions.json");
}

function readStoredSubmissions(): any[] {
  try {
    const file = getSubmissionsFilePath();
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      const list = JSON.parse(content);
      if (Array.isArray(list)) return list;
    }
  } catch {}
  return [];
}

function writeStoredSubmissions(list: any[]): void {
  try {
    const file = getSubmissionsFilePath();
    fs.writeFileSync(file, JSON.stringify(list, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not write submissions to disk:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const testId = Number(body.testId) || 1;
    const score = Number(body.score) || 0;
    const listeningScore = Number(body.listeningScore) || 0;
    const readingScore = Number(body.readingScore) || 0;
    const correctCount = Number(body.correctCount) || 0;
    const totalCount = Number(body.totalCount) || 200;
    const durationSeconds = Number(body.durationSeconds) || 0;
    const studentName = body.studentName || "Học viên";
    const studentEmail = body.studentEmail || "student@toeic-ai.local";
    const testTitle = body.testTitle || `ETS Test #${testId}`;
    const volId = body.volId || "vol1";

    const newSub = {
      id: body.id || `sub-${Date.now()}`,
      testId,
      testTitle,
      volId,
      studentName,
      studentEmail,
      score,
      listeningScore,
      readingScore,
      correctCount,
      totalCount,
      durationSeconds,
      completedAt: new Date().toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "Đã chấm điểm",
    };

    const currentList = readStoredSubmissions();
    const updated = [newSub, ...currentList.filter((s) => s.id !== newSub.id)];
    writeStoredSubmissions(updated);

    return NextResponse.json(newSub, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }
}
