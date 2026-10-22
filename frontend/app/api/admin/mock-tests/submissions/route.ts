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

const DEFAULT_SUBMISSIONS = [
  {
    id: "sub-101",
    testId: 1,
    testTitle: "ETS 2024 - Test 1",
    volId: "vol1",
    studentName: "Nguyễn Văn An",
    studentEmail: "an.nguyen@example.com",
    score: 760, // 152 câu * 5 = 760
    listeningScore: 385,
    readingScore: 375,
    correctCount: 152,
    totalCount: 200,
    durationSeconds: 6900,
    completedAt: "10/10/2026 14:35",
    status: "Đã chấm điểm",
  },
  {
    id: "sub-102",
    testId: 1,
    testTitle: "ETS 2024 - Test 1",
    volId: "vol1",
    studentName: "Trần Thị Mai",
    studentEmail: "mai.tran@example.com",
    score: 890, // 178 câu * 5 = 890
    listeningScore: 450,
    readingScore: 440,
    correctCount: 178,
    totalCount: 200,
    durationSeconds: 7080,
    completedAt: "10/10/2026 11:20",
    status: "Đã chấm điểm",
  },
  {
    id: "sub-103",
    testId: 2,
    testTitle: "ETS 2024 - Test 2",
    volId: "vol1",
    studentName: "Lê Hoàng Long",
    studentEmail: "long.le@example.com",
    score: 590, // 118 câu * 5 = 590
    listeningScore: 300,
    readingScore: 290,
    correctCount: 118,
    totalCount: 200,
    durationSeconds: 7200,
    completedAt: "09/10/2026 20:15",
    status: "Đã chấm điểm",
  },
  {
    id: "sub-104",
    testId: 1,
    testTitle: "ETS 2024 - Test 1",
    volId: "vol1",
    studentName: "Phạm Hải Đăng",
    studentEmail: "dang.pham@example.com",
    score: 805, // 161 câu * 5 = 805
    listeningScore: 410,
    readingScore: 395,
    correctCount: 161,
    totalCount: 200,
    durationSeconds: 5700,
    completedAt: "09/10/2026 16:40",
    status: "Đã chấm điểm",
  },
  {
    id: "sub-105",
    testId: 3,
    testTitle: "ETS 2024 - Test 3",
    volId: "vol1",
    studentName: "Vũ Phương Thảo",
    studentEmail: "thao.vu@example.com",
    score: 955, // 191 câu * 5 = 955
    listeningScore: 480,
    readingScore: 475,
    correctCount: 191,
    totalCount: 200,
    durationSeconds: 7140,
    completedAt: "08/10/2026 09:30",
    status: "Đã chấm điểm",
  },
];

function readStoredSubmissions(): any[] {
  let fileList: any[] = [];
  try {
    const file = getSubmissionsFilePath();
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      const list = JSON.parse(content);
      if (Array.isArray(list)) fileList = list;
    }
  } catch {}

  const map = new Map<string, any>();
  fileList.forEach((s) => map.set(s.id, s));
  DEFAULT_SUBMISSIONS.forEach((s) => {
    if (!map.has(s.id)) map.set(s.id, s);
  });
  return Array.from(map.values());
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testIdParam = searchParams.get("testId");
    const testId = testIdParam ? parseInt(testIdParam, 10) : null;

    let submissions = readStoredSubmissions();

    if (testId && !isNaN(testId) && testId > 0) {
      submissions = submissions.filter((s) => s.testId === testId);
    }

    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
