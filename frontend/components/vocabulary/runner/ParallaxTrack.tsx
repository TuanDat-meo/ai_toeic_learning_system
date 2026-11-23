"use client";

import React from "react";
import { BoyCharacter, type BoyAction } from "./BoyCharacter";
import type { EncounterType, ObstacleKind } from "./types";

export interface ParallaxTrackProps {
  trackOffset: number;
  distanceToChaser: number;
  distanceToNextEncounter: number;
  obstacleKind?: ObstacleKind;
  encounterType?: EncounterType;
  boyAction: BoyAction;
  hasShield?: boolean;
  reducedMotion?: boolean;
  highContrast?: boolean;
}

/**
 * ParallaxTrack - Đường Chạy Game 4 Tầng Parallax Đồ Họa Vector Chuyên Nghiệp
 * - Loại bỏ toàn bộ emoji thô sơ, thay bằng vector SVG sắc nét và đồng bộ.
 * - 4 lớp parallax tạo chiều sâu phối cảnh: Bầu trời sao, Đô thị xa, Hàng cây trung cảnh, Mặt đường cao tốc.
 * - Kẻ đuổi (Chaser) dạng Thủy Quái Bóng Đêm (Shadow Titan Wave) hung tợn.
 * - Chướng ngại vật và Hộp mù đạt chuẩn thị giác (Kích thước >= 48px, độ tương phản >= 3:1).
 * - Cảnh báo sớm thanh thoát, tinh tế ở mép phải.
 */
export function ParallaxTrack({
  trackOffset,
  distanceToChaser,
  distanceToNextEncounter,
  obstacleKind = "rock",
  encounterType = "obstacle",
  boyAction,
  hasShield = false,
  reducedMotion = false,
  highContrast = false,
}: ParallaxTrackProps) {
  // Tính toán mức độ nguy hiểm từ kẻ đuổi (0% - 100%)
  const dangerLevel = Math.max(0, 100 - distanceToChaser);
  const chaserScale = 1 + (dangerLevel / 100) * 0.45;
  const chaserLeftPx = -20 + dangerLevel * 2.3;
  const isDangerZone = distanceToChaser < 30;

  // Cảnh báo sớm đủ lâu để người chơi nhìn thấy chướng ngại.
  const showEarlyWarning = distanceToNextEncounter <= 480 && distanceToNextEncounter > 150;
  const isEncounterZone = distanceToNextEncounter <= 150;

  return (
    <div
      className={`relative h-44 sm:h-52 md:h-56 w-full mt-auto overflow-hidden select-none transition-colors duration-500 rounded-b-2xl border-t-2 ${
        highContrast
          ? "border-amber-400 bg-slate-950"
          : "border-indigo-400/30 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950"
      }`}
    >
      {/* ── Keyframes Cho Đường Chạy & Kẻ Đuổi ── */}
      <style>{`
        @keyframes chaserWaveSurge {
          0%, 100% { transform: translateY(0px) scaleY(1); }
          50% { transform: translateY(-6px) scaleY(1.08); }
        }
        @keyframes mysteryBoxGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.7)); transform: translateY(0px); }
          50% { filter: drop-shadow(0 0 18px rgba(245, 158, 11, 0.95)); transform: translateY(-5px); }
        }
        @keyframes obstacleIdleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes warningPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>

      {/* ── LỚP 1: BẦU TRỜI ĐÊM, TRĂNG SAO & MÂY PARALLAX (Tốc độ 0.05) ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 transition-transform duration-75"
        style={{
          transform: `translateX(-${(trackOffset * 0.04) % 600}px)`,
        }}
      >
        <svg viewBox="0 0 1200 160" className="w-[1200px] h-full" preserveAspectRatio="none">
          {/* Mặt trăng phát sáng */}
          <circle cx="850" cy="35" r="22" fill="#FEF08A" opacity="0.8" />
          <circle cx="850" cy="35" r="30" fill="#FEF08A" opacity="0.15" />

          {/* Các vì sao lấp lánh */}
          <circle cx="80" cy="20" r="1.5" fill="#FFFFFF" opacity="0.7" />
          <circle cx="210" cy="45" r="2" fill="#FFFFFF" opacity="0.9" />
          <circle cx="340" cy="18" r="1.5" fill="#FDE047" opacity="0.8" />
          <circle cx="480" cy="38" r="2.5" fill="#FFFFFF" opacity="0.6" />
          <circle cx="620" cy="15" r="1.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="750" cy="48" r="2" fill="#FDE047" opacity="0.7" />
          <circle cx="980" cy="22" r="2" fill="#FFFFFF" opacity="0.8" />
          <circle cx="1120" cy="35" r="1.5" fill="#FFFFFF" opacity="0.9" />

          {/* Cụm mây vector trôi êm đềm */}
          <path d="M 120 40 Q 140 25 165 35 Q 185 20 210 32 Q 225 45 205 52 Q 130 54 120 40 Z" fill="#94A3B8" opacity="0.25" />
          <path d="M 520 45 Q 545 30 575 40 Q 600 25 625 38 Q 640 52 615 58 Q 535 60 520 45 Z" fill="#94A3B8" opacity="0.2" />
          <path d="M 880 32 Q 900 18 925 28 Q 945 15 970 26 Q 985 40 965 46 Q 890 48 880 32 Z" fill="#94A3B8" opacity="0.2" />
        </svg>
      </div>

      {/* ── LỚP 2: DÃY NÚI & TÒA NHÀ ĐÔ THỊ XA (Tốc độ 0.15) ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 flex items-end pb-12 transition-transform duration-75"
        style={{
          transform: `translateX(-${(trackOffset * 0.14) % 500}px)`,
        }}
      >
        <svg viewBox="0 0 1000 100" className="w-[1000px] h-24 shrink-0" preserveAspectRatio="none">
          {/* Dãy núi viễn cảnh */}
          <polygon points="0,100 120,40 220,100" fill="#1E1B4B" />
          <polygon points="180,100 320,30 460,100" fill="#312E81" />
          <polygon points="420,100 580,45 700,100" fill="#1E1B4B" />
          <polygon points="660,100 820,25 960,100" fill="#312E81" />
          <polygon points="900,100 1000,50 1000,100" fill="#1E1B4B" />
          {/* Tòa nhà cao tầng thành phố với cửa sổ sáng đèn */}
          <rect x="70" y="30" width="30" height="70" fill="#0F172A" />
          <rect x="75" y="36" width="4" height="6" fill="#FBBF24" opacity="0.8" />
          <rect x="85" y="48" width="4" height="6" fill="#60A5FA" opacity="0.8" />
          <rect x="250" y="20" width="36" height="80" fill="#0F172A" />
          <rect x="256" y="28" width="5" height="7" fill="#FBBF24" opacity="0.9" />
          <rect x="268" y="42" width="5" height="7" fill="#FBBF24" opacity="0.7" />
          <rect x="490" y="25" width="28" height="75" fill="#0F172A" />
          <rect x="760" y="22" width="34" height="78" fill="#0F172A" />
          <rect x="768" y="32" width="5" height="7" fill="#60A5FA" opacity="0.8" />
        </svg>
      </div>

      {/* ── LỚP 3: HÀNG CÂY VECTOR TRUNG CẢNH (Tốc độ 0.42) ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 flex items-end pb-10 transition-transform duration-75"
        style={{
          transform: `translateX(-${(trackOffset * 0.42) % 400}px)`,
        }}
      >
        <svg viewBox="0 0 800 80" className="w-[800px] h-20 shrink-0" preserveAspectRatio="none">
          {/* Cụm cây thông & cây tùng vector */}
          <g transform="translate(60, 20)">
            <polygon points="15,0 0,35 30,35" fill="#065F46" />
            <polygon points="15,15 2,48 28,48" fill="#047857" />
            <rect x="12" y="48" width="6" height="12" fill="#78350F" />
          </g>
          <g transform="translate(220, 25)">
            <circle cx="16" cy="18" r="18" fill="#047857" />
            <circle cx="28" cy="16" r="14" fill="#059669" />
            <rect x="18" y="32" width="6" height="14" fill="#78350F" />
          </g>
          <g transform="translate(390, 18)">
            <polygon points="16,0 0,36 32,36" fill="#065F46" />
            <polygon points="16,16 3,50 29,50" fill="#047857" />
            <rect x="13" y="50" width="6" height="12" fill="#78350F" />
          </g>
          <g transform="translate(580, 24)">
            <circle cx="18" cy="18" r="18" fill="#047857" />
            <rect x="15" y="32" width="6" height="14" fill="#78350F" />
          </g>
          <g transform="translate(720, 20)">
            <polygon points="14,0 0,34 28,34" fill="#065F46" />
            <rect x="11" y="34" width="6" height="12" fill="#78350F" />
          </g>
        </svg>
      </div>

      {/* ── LỚP 4: MẶT ĐƯỜNG ĐUA HIỆN ĐẠI (Tốc độ 1.0) ── */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-12 sm:h-14 border-t-4 shadow-2xl ${
          highContrast
            ? "bg-slate-900 border-amber-400"
            : "bg-gradient-to-t from-slate-950 via-slate-900 to-indigo-950 border-cyan-400"
        }`}
      >
        {/* Viền neon trên mép đường */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            highContrast ? "bg-amber-400" : "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400"
          } shadow-[0_0_10px_rgba(34,211,238,0.8)]`}
        />

        {/* Vạch kẻ đường đứt đoạn chuyển động liên tục */}
        <div
          className="absolute top-4 left-0 right-0 h-1.5 flex gap-10 opacity-70 pointer-events-none"
          style={{
            transform: `translateX(-${(trackOffset * 1.0) % 90}px)`,
          }}
        >
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className={`w-12 h-1.5 rounded-full shrink-0 ${
                highContrast ? "bg-amber-300" : "bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)]"
              }`}
            />
          ))}
        </div>

        {/* Vệt vạch đo khoảng cách mặt đường */}
        <div
          className="absolute bottom-2 left-0 right-0 h-0.5 flex gap-6 opacity-30 pointer-events-none"
          style={{
            transform: `translateX(-${(trackOffset * 1.0) % 60}px)`,
          }}
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="w-4 h-0.5 bg-white shrink-0" />
          ))}
        </div>
      </div>

      {/* ── KẺ ĐUỔI BÁM ĐUỔI PHÍA SAU (THỦY QUÁI BÓNG ĐÊM CHASER) ── */}
      <div
        className="absolute bottom-6 pointer-events-none transition-all duration-1000 ease-out z-10 select-none flex items-center"
        style={{
          left: `${chaserLeftPx}px`,
          transform: `scale(${chaserScale})`,
          opacity: Math.min(1, 0.65 + dangerLevel / 80),
          animation: reducedMotion ? "none" : "chaserWaveSurge 1.4s ease-in-out infinite",
        }}
      >
        <div className="relative w-36 h-36 overflow-visible">
          {/* Cảnh báo đỏ rực nếu kẻ đuổi đã rất gần */}
          {isDangerZone && (
            <div className="absolute -top-7 left-4 z-20 flex items-center gap-1 bg-red-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg shadow-red-500/50 animate-pulse whitespace-nowrap border border-red-300">
              <span>⚠️</span>
              <span>ÁP SÁT NGUY HIỂM!</span>
            </div>
          )}

          {/* Sóng thần bóng đêm + Quái thú năng lượng SVG */}
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-[0_0_25px_rgba(239,68,68,0.7)]">
            <defs>
              <linearGradient id="chaserWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E1B4B" />
                <stop offset="60%" stopColor="#4C0519" />
                <stop offset="100%" stopColor="#E11D48" />
              </linearGradient>
            </defs>

            {/* Thân sóng thần khổng lồ cuồn cuộn */}
            <path
              d="M 10 150 C 30 110, 20 80, 50 60 C 80 40, 110 50, 130 30 C 145 15, 155 35, 140 60 C 125 80, 145 100, 130 130 C 120 150, 60 155, 10 150 Z"
              fill="url(#chaserWaveGrad)"
              opacity="0.95"
            />
            {/* Lớp bọt sóng & gai năng lượng */}
            <path
              d="M 50 60 L 65 40 L 75 58 L 95 32 L 105 52 L 130 30"
              stroke="#FDA4AF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Đôi mắt quái vật đỏ rực ma mị */}
            <circle cx="85" cy="72" r="7" fill="#EF4444" />
            <circle cx="87" cy="71" r="3" fill="#FEF08A" />
            <circle cx="112" cy="74" r="7" fill="#EF4444" />
            <circle cx="114" cy="73" r="3" fill="#FEF08A" />

            {/* Hàm răng quái vật sắc nhọn */}
            <polygon points="85,92 92,104 98,92" fill="#FFFFFF" />
            <polygon points="98,92 105,104 112,92" fill="#FFFFFF" />
            <polygon points="112,92 118,104 124,92" fill="#FFFFFF" />
            <path d="M 80 92 Q 105 98 128 92" stroke="#991B1B" strokeWidth="3" fill="none" />
          </svg>
        </div>
      </div>

      {/* ── CẢNH BÁO SỚM Ở MÉP PHẢI (EARLY WARNING) ── */}
      {showEarlyWarning && (
        <div
          className="absolute right-3 top-4 sm:top-6 z-30 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs sm:text-sm font-black px-3 py-1.5 rounded-xl shadow-xl border-2 border-amber-300"
          style={{ animation: reducedMotion ? "none" : "warningPulse 0.8s ease-in-out infinite" }}
        >
          <span className="text-base">⚠️</span>
          <span>{encounterType === "mystery_box" ? "Hộp Mù phía trước!" : "Chướng ngại vật!"}</span>
          <span className="font-mono text-base font-black">▶</span>
        </div>
      )}

      {/* ── ĐIỂM CHẠM PHÍA TRƯỚC (CHƯỚNG NGẠI VẬT HOẶC HỘP MÙ SVG VECTOR) ── */}
      <div
        className={`absolute bottom-9 sm:bottom-10 transition-transform duration-75 z-20 ${
          isEncounterZone ? "scale-110 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]" : ""
        }`}
        style={{
          // Anchor the obstacle to the runner; a fixed left offset made it
          // appear behind the character on narrow screens.
          left: `calc(24% + ${Math.max(20, distanceToNextEncounter * 0.72)}px)`,
        }}
      >
        {/* 1. HỘP MÙ MAY RỦI (MYSTERY BOX - Rương Báu Hoàng Kim Vector) */}
        {encounterType === "mystery_box" ? (
          <div
            className="flex flex-col items-center select-none"
            style={{ animation: reducedMotion ? "none" : "mysteryBoxGlow 1.6s ease-in-out infinite" }}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-xl">
                {/* Hộp rương vàng 3D */}
                <rect x="15" y="30" width="70" height="55" rx="14" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
                <rect x="20" y="34" width="60" height="47" rx="10" fill="#FBBF24" />
                {/* Dải ruy băng ngọc bích đỏ */}
                <rect x="42" y="30" width="16" height="55" fill="#EF4444" />
                <rect x="15" y="52" width="70" height="12" fill="#EF4444" />
                {/* Nơ ruy băng uốn lượn bên trên */}
                <path d="M 50 30 C 35 15, 25 24, 45 30 Z" fill="#DC2626" />
                <path d="M 50 30 C 65 15, 75 24, 55 30 Z" fill="#DC2626" />
                <circle cx="50" cy="30" r="6" fill="#FDE047" />
                {/* Biểu tượng Dấu hỏi may mắn ở tâm */}
                <text x="50" y="64" fontSize="22" fontWeight="900" fill="#FFFFFF" textAnchor="middle" dominantBaseline="middle">
                  ?
                </text>
              </svg>
            </div>
            <span className="mt-1 text-[10px] sm:text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-md border border-amber-200">
              Hộp Mù
            </span>
          </div>
        ) : obstacleKind === "low_branch" ? (
          /* 2. CÀNH CÂY THẤP (LOW BRANCH - Cần Trượt Người Qua) */
          <div
            className="flex flex-col items-center select-none"
            style={{ animation: reducedMotion ? "none" : "obstacleIdleFloat 2s ease-in-out infinite" }}
          >
            <div className="w-16 h-14 sm:w-20 sm:h-16 relative">
              <svg viewBox="0 0 120 100" className="w-full h-full overflow-visible drop-shadow-lg">
                {/* Thân cành cây gỗ sồi vắt ngang */}
                <path d="M 10 40 Q 60 20 110 50 Q 80 65 10 40 Z" fill="#78350F" stroke="#451A03" strokeWidth="3" />
                {/* Các chùm lá rừng xum xuê */}
                <circle cx="45" cy="32" r="14" fill="#059669" />
                <circle cx="58" cy="24" r="16" fill="#10B981" />
                <circle cx="75" cy="35" r="15" fill="#047857" />
                <circle cx="95" cy="48" r="13" fill="#10B981" />
                {/* Dây leo rủ xuống */}
                <path d="M 50 45 Q 48 65 54 75" stroke="#059669" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 78 50 Q 82 68 76 80" stroke="#047857" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <span className="mt-1 text-[9px] sm:text-[10px] font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-md border border-emerald-400">
              Trượt Qua
            </span>
          </div>
        ) : obstacleKind === "pit" ? (
          /* 3. HỐ SÂU / VỰC THẲM ĐỨT ĐƯỜNG (PIT - Cần Nghe & Nhảy Qua) */
          <div className="flex flex-col items-center select-none">
            <div className="w-16 h-12 sm:w-20 sm:h-14 relative">
              <svg viewBox="0 0 120 80" className="w-full h-full overflow-visible drop-shadow-md">
                {/* Vết nứt vỡ mặt đường */}
                <polygon points="10,25 35,65 85,65 110,25 90,15 30,15" fill="#020617" stroke="#38BDF8" strokeWidth="2.5" />
                {/* Lõi vực thẳm phát sáng cyber */}
                <polygon points="25,28 45,58 75,58 95,28" fill="#0C4A6E" />
                <path d="M 20 22 L 40 45 L 80 45 L 100 22" stroke="#0284C7" strokeWidth="2" fill="none" />
                {/* Ký hiệu sóng âm thanh */}
                <text x="60" y="44" fontSize="18" fill="#38BDF8" textAnchor="middle" dominantBaseline="middle">
                  🔊
                </text>
              </svg>
            </div>
            <span className="mt-1 text-[9px] sm:text-[10px] font-black bg-sky-600 text-white px-2.5 py-0.5 rounded-full shadow-md border border-sky-400">
              Nghe & Nhảy
            </span>
          </div>
        ) : obstacleKind === "boss" ? (
          /* 4. TRÙM CUỐI HUYỀN THOẠI (BOSS - Thử Thách Cực Hạn) */
          <div
            className="flex flex-col items-center select-none"
            style={{ animation: reducedMotion ? "none" : "obstacleIdleFloat 1.2s ease-in-out infinite" }}
          >
            <div className="w-18 h-18 sm:w-22 sm:h-22 relative">
              <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]">
                {/* Đầu titan bọc giáp đỏ đen */}
                <polygon points="60,10 95,35 85,90 60,110 35,90 25,35" fill="#450A0A" stroke="#F59E0B" strokeWidth="3" />
                {/* Sừng quỷ dung nham */}
                <path d="M 35 35 Q 10 15 20 0 Q 35 15 42 28 Z" fill="#DC2626" />
                <path d="M 85 35 Q 110 15 100 0 Q 85 15 78 28 Z" fill="#DC2626" />
                {/* Mắt rực lửa vàng kim */}
                <polygon points="45,50 55,56 45,62" fill="#FEF08A" />
                <polygon points="75,50 65,56 75,62" fill="#FEF08A" />
                {/* Miệng gầm thét */}
                <polygon points="50,78 60,86 70,78 60,74" fill="#EF4444" />
              </svg>
            </div>
            <span className="mt-1 text-[10px] sm:text-xs font-black bg-red-600 text-amber-200 px-3 py-0.5 rounded-full shadow-lg border border-amber-400 animate-pulse">
              BOSS TRÙM
            </span>
          </div>
        ) : (
          /* 5. TẢNG ĐÁ TIÊU CHUẨN (ROCK - Đoán Nghĩa & Nhảy Qua) */
          <div className="flex flex-col items-center select-none">
            <div className="w-15 h-13 sm:w-18 sm:h-15 relative">
              <svg viewBox="0 0 110 90" className="w-full h-full overflow-visible drop-shadow-xl">
                {/* Khối đá đa diện 3D viền vàng nổi bật */}
                <polygon points="20,75 10,45 35,15 75,10 100,40 90,75" fill="#334155" stroke="#FDE68A" strokeWidth="2.5" />
                {/* Mặt cắt sáng phía trên */}
                <polygon points="35,15 75,10 65,40 30,42" fill="#64748B" />
                {/* Mặt tối góc dưới */}
                <polygon points="20,75 30,42 65,40 90,75" fill="#1E293B" />
                {/* Vết nứt trên đá */}
                <path d="M 45 22 L 52 35 L 48 48" stroke="#FDE68A" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <span className="mt-1 text-[9px] sm:text-[10px] font-black bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full shadow-md border border-amber-300">
              Nhảy Qua
            </span>
          </div>
        )}
      </div>

      {/* ── NHÂN VẬT ANH HÙNG (Cùng trục mặt đất với chướng ngại vật) ── */}
      <div className="absolute bottom-4 sm:bottom-5 left-[22%] sm:left-[24%] z-20">
        <BoyCharacter
          action={boyAction}
          hasShield={hasShield}
          reducedMotion={reducedMotion}
        />
      </div>
    </div>
  );
}
