import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ testId: string }> | { testId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const rawIdStr = resolvedParams.testId?.trim() || "";
    const testIdRaw = parseInt(rawIdStr, 10);

    let yearFolder = "ets_2024";
    let yearDisplayName = "ETS 2024";
    let testNum = 1;

    if (!isNaN(testIdRaw)) {
      if (testIdRaw >= 1 && testIdRaw <= 10) {
        yearFolder = "ets_2024";
        yearDisplayName = "ETS 2024";
        testNum = testIdRaw;
      } else if (testIdRaw >= 202401 && testIdRaw <= 202410) {
        yearFolder = "ets_2024";
        yearDisplayName = "ETS 2024";
        testNum = testIdRaw - 202400;
      } else if (testIdRaw >= 202301 && testIdRaw <= 202310) {
        yearFolder = "ets_2023";
        yearDisplayName = "ETS 2023";
        testNum = testIdRaw - 202300;
        // ETS 2023 does not have Test 2; fallback gracefully if 2 is requested
        if (testNum === 2) testNum = 3;
      } else if (testIdRaw >= 202201 && testIdRaw <= 202210) {
        yearFolder = "ets_2022";
        yearDisplayName = "ETS 2022";
        testNum = testIdRaw - 202200;
      }
    } else {
      // String ID parsing, e.g., "ets2023_test03", "vol2_test1", "vol3_5"
      const lower = rawIdStr.toLowerCase();
      if (lower.includes("2022") || lower.includes("vol3")) {
        yearFolder = "ets_2022";
        yearDisplayName = "ETS 2022";
      } else if (lower.includes("2023") || lower.includes("vol2")) {
        yearFolder = "ets_2023";
        yearDisplayName = "ETS 2023";
      } else {
        yearFolder = "ets_2024";
        yearDisplayName = "ETS 2024";
      }
      const match = lower.match(/\d+/);
      if (match) {
        testNum = parseInt(match[0], 10);
        if (testNum > 2000) testNum = testNum % 100;
      }
      if (yearDisplayName === "ETS 2023" && testNum === 2) testNum = 3;
    }

    if (testNum < 1) testNum = 1;
    if (testNum > 10) testNum = 10;

    const testNumPadded = String(testNum).padStart(2, "0");
    const filename = `${yearDisplayName.replace(" ", "_")}_Test_${testNumPadded}_Chi_Tiet.json`;

    // Candidate file paths: project data directory, then E:/Data
    const candidatePaths = [
      path.resolve(process.cwd(), "..", "data", yearFolder, filename),
      path.resolve(process.cwd(), "data", yearFolder, filename),
      path.resolve("E:/Data", yearDisplayName, filename),
      path.resolve("E:/Data", yearFolder, filename),
    ];

    let filePath = candidatePaths.find((p) => fs.existsSync(p));

    // Fallback if specific test in 2023 does not exist
    if (!filePath && yearDisplayName === "ETS 2023") {
      const fallbackFile = path.resolve("E:/Data", yearDisplayName, "ETS_2023_Test_01_Chi_Tiet.json");
      if (fs.existsSync(fallbackFile)) filePath = fallbackFile;
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return new NextResponse(`Test data not found for ${filename}`, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const rawData = JSON.parse(fileContent);
    const questions = rawData.questions || [];

    const practiceQuestions = questions.map((q: any) => {
      const num = q.questionNumber;
      const partRaw = q.part || "";
      let partName = "Part 1";
      for (const p of ["Part 1", "Part 2", "Part 3", "Part 4", "Part 5", "Part 6", "Part 7"]) {
        if (partRaw.includes(p)) {
          partName = p;
          break;
        }
      }

      const audFile = q.audioFile || q.audioGroupFile;
      const audUrl = audFile ? `/api/media/${yearDisplayName}/${audFile}` : "";

      const imgFile = q.imageFile;
      const imgUrl = imgFile ? `/api/media/${yearDisplayName}/${imgFile}` : null;

      // Extract passages for Reading Parts 6 & 7
      let passageText = q.passageTextEn || q.passageGroup || q.passage || "";
      let bilingualPassage = q.passageTextVi || q.fullPassageVi || "";
      if (!passageText && Array.isArray(q.passages) && q.passages.length > 0) {
        passageText = q.passages.map((p: any) => p.text || p.contentEn || "").filter(Boolean).join("\n\n");
      }
      if (!bilingualPassage && Array.isArray(q.passages) && q.passages.length > 0) {
        bilingualPassage = q.passages.map((p: any) => p.textVi || p.contentVi || "").filter(Boolean).join("\n\n");
      }

      // Extract listening transcript vs question text
      const transcript = q.fullTranscriptEn || q.transcript || q.questionEn || "";
      const translation = q.fullTranscriptVi || q.translation || q.questionVi || "";

      // Extract group title
      const groupTitle = q.passageTitle || q.conversationGroup || q.talkGroup || q.passageGroup || "";

      return {
        id: num,
        part: partName,
        questionText: q.questionEn || "",
        audioUrl: audUrl,
        imageUrl: imgUrl,
        passage: passageText,
        bilingualPassage: bilingualPassage,
        options: q.options || {},
        optionTranslations: q.optionTranslations || {},
        correctAnswer: (q.correctAnswer || "A").toUpperCase(),
        explanation: q.explanation || "",
        transcript: transcript,
        translation: translation,
        vocabList: q.vocabulary || [],
        groupTitle: groupTitle,
        trapNote: q.trapNote || "",
        steps: q.steps || [],
        difficultyLevel: q.difficultyLevel || null,
      };
    });

    return NextResponse.json(practiceQuestions, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching mock test questions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
