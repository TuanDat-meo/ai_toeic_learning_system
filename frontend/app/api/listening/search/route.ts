import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface AudioUnit {
  unitId: string;
  year: number;
  testNumber: number;
  testCode: string;
  partNumber: number;
  partName: string;
  partNameVi: string;
  groupRange?: string;
  questionNumbers?: number[];
  audioFile?: string;
  audioUrl?: string;
  imageFile?: string | null;
  imageUrl?: string | null;
  transcriptEn?: string;
  transcriptVi?: string;
  difficultySummary?: {
    primaryLevel?: string;
    tier?: string;
  };
  questions?: any[];
  searchKeywords?: string;
}

let cachedUnits: AudioUnit[] | null = null;
let lastLoadTime = 0;

function loadAudioUnits(): AudioUnit[] {
  const now = Date.now();
  if (cachedUnits && now - lastLoadTime < 30000) {
    return cachedUnits;
  }

  const units: AudioUnit[] = [];
  const configs = [
    { year: 2024, displayName: "ETS 2024", file: "ETS_2024_Listening_Search_Data.json" },
    { year: 2023, displayName: "ETS 2023", file: "ETS_2023_Listening_Search_Data.json" },
    { year: 2022, displayName: "ETS 2022", file: "ETS_2022_Listening_Search_Data.json" },
  ];

  for (const cfg of configs) {
    try {
      const p = path.resolve("E:/Data", cfg.displayName, cfg.file);
      if (fs.existsSync(p)) {
        const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
        const list = raw.audioUnits || [];
        for (const u of list) {
          units.push({
            ...u,
            audioUrl: u.audioFile ? `/api/media/${cfg.displayName}/${u.audioFile}` : "",
            imageUrl: u.imageFile ? `/api/media/${cfg.displayName}/${u.imageFile}` : null,
          });
        }
      }
    } catch (e) {
      console.error(`Failed to load search data for ${cfg.displayName}:`, e);
    }
  }

  cachedUnits = units;
  lastLoadTime = now;
  return units;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();
    const year = searchParams.get("year") || "all";
    const part = searchParams.get("part") || "all";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const allUnits = loadAudioUnits();

    let filtered = allUnits;

    if (year !== "all") {
      const yrNum = parseInt(year, 10);
      filtered = filtered.filter((u) => u.year === yrNum);
    }

    if (part !== "all") {
      filtered = filtered.filter(
        (u) =>
          u.partName.toLowerCase().includes(part.toLowerCase()) ||
          u.partNameVi.toLowerCase().includes(part.toLowerCase())
      );
    }

    if (query) {
      filtered = filtered.filter((u) => {
        const matchUnit = u.unitId.toLowerCase().includes(query);
        const matchCode = u.testCode.toLowerCase().includes(query);
        const matchTransEn = (u.transcriptEn || "").toLowerCase().includes(query);
        const matchTransVi = (u.transcriptVi || "").toLowerCase().includes(query);
        const matchKw = (u.searchKeywords || "").toLowerCase().includes(query);
        return matchUnit || matchCode || matchTransEn || matchTransVi || matchKw;
      });
    }

    const total = filtered.length;
    const items = filtered.slice(0, limit);

    return NextResponse.json({
      total,
      limit,
      items,
    });
  } catch (error) {
    console.error("Error in listening search API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
