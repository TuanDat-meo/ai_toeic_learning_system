"use client";

import React from "react";

export type BoyAction =
  | "idle"
  | "running"
  | "jumping"
  | "sliding"
  | "dashing"
  | "stumble"
  | "victory"
  | "defeated";

export interface BoyCharacterProps {
  action: BoyAction;
  hasShield?: boolean;
  reducedMotion?: boolean;
}

/**
 * BoyCharacter - Nhân vật Anh Hùng Chạy Bộ (Runner Hero)
 * Thiết kế hoạt họa vector SVG chất lượng cao:
 * - Tỷ lệ cân đối, phong cách Anime/Arcade Runner hiện đại.
 * - Đầy đủ 8 trạng thái hoạt ảnh chuyển động mượt mà (60 FPS).
 * - Sử dụng CSS keyframes tăng tốc phần cứng (transform, opacity).
 * - Tương thích hoàn toàn trên Mobile, Tablet, Desktop.
 */
export function BoyCharacter({
  action,
  hasShield = false,
  reducedMotion = false,
}: BoyCharacterProps) {
  return (
    <div className="relative select-none pointer-events-none flex items-center justify-center">
      {/* ── Keyframes Hoạt Ảnh Chuyên Nghiệp ── */}
      <style>{`
        @keyframes boyRunBob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(1.5deg); }
        }
        @keyframes boyLegSwingFront {
          0% { transform: rotate(-32deg); }
          50% { transform: rotate(36deg); }
          100% { transform: rotate(-32deg); }
        }
        @keyframes boyLegSwingBack {
          0% { transform: rotate(36deg); }
          50% { transform: rotate(-32deg); }
          100% { transform: rotate(36deg); }
        }
        @keyframes boyArmSwingFront {
          0% { transform: rotate(-28deg); }
          50% { transform: rotate(32deg); }
          100% { transform: rotate(-28deg); }
        }
        @keyframes boyArmSwingBack {
          0% { transform: rotate(32deg); }
          50% { transform: rotate(-28deg); }
          100% { transform: rotate(32deg); }
        }
        @keyframes boyHeadbandWave {
          0%, 100% { transform: rotate(0deg) skewX(0deg); }
          50% { transform: rotate(-8deg) skewX(-12deg); }
        }
        @keyframes boyDashFlames {
          0%, 100% { opacity: 0.85; transform: scale(1) translateX(0px); }
          50% { opacity: 1; transform: scale(1.15) translateX(-4px); }
        }
        @keyframes boySlideDust {
          0% { opacity: 0.9; transform: translateX(0) scale(0.6); }
          100% { opacity: 0; transform: translateX(-24px) scale(1.4); }
        }
        @keyframes boyStumbleRecoil {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-12px) rotate(-14deg); }
          75% { transform: translateX(-4px) rotate(-6deg); }
        }
        @keyframes boyStarSpin {
          0% { transform: rotate(0deg) scale(0.8); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(0.8); }
        }
        @keyframes boyVictoryCelebration {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-16px) scale(1.05); }
        }
        @keyframes boyShieldAura {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>

      {/* ── 1. MÀN THUA CUỘC (DEFEATED) ── */}
      {action === "defeated" && (
        <div className="relative w-32 h-24 sm:w-36 sm:h-28 transition-all">
          {/* Sao choáng váng quay vòng */}
          <div
            className="absolute -top-3 left-6 flex items-center gap-1.5"
            style={{ animation: reducedMotion ? "none" : "boyStarSpin 2s linear infinite" }}
          >
            <span className="text-xl">💫</span>
            <span className="text-xs text-amber-300">⭐</span>
            <span className="text-sm">💫</span>
          </div>
          <svg viewBox="0 0 150 110" className="w-full h-full drop-shadow-xl overflow-visible">
            {/* Bóng tối mờ dưới đất */}
            <ellipse cx="75" cy="95" rx="55" ry="9" fill="#020617" opacity="0.45" />

            {/* Chân duỗi rũ xuống sàn */}
            <path d="M 85 78 L 120 74 L 138 88" stroke="#1E293B" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 132 85 L 145 90 L 140 98 L 127 94 Z" fill="#EF4444" />
            <path d="M 135 91 L 144 94 L 142 97 L 133 94 Z" fill="#FFFFFF" />

            {/* Thân ngã gục */}
            <rect x="50" y="65" width="46" height="24" rx="8" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" />
            <path d="M 64 65 L 82 65 L 80 89 L 66 89 Z" fill="#FFFFFF" opacity="0.9" />
            <path d="M 68 65 L 73 78 L 78 65" stroke="#DC2626" strokeWidth="2.5" fill="none" />

            {/* Tay buông xuôi */}
            <path d="M 58 72 L 48 88 L 38 90" stroke="#3B82F6" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="36" cy="90" r="5" fill="#FBBF24" />

            {/* Đầu gục xuống */}
            <circle cx="42" cy="56" r="18" fill="#FDE047" stroke="#F59E0B" strokeWidth="2" />
            {/* Mắt nhắm tịt (X) */}
            <text x="34" y="58" fontSize="11" fill="#78350F" fontWeight="900">✕</text>
            <text x="44" y="58" fontSize="11" fill="#78350F" fontWeight="900">✕</text>
            {/* Miệng mếu */}
            <path d="M 37 66 Q 42 62 47 66" stroke="#9A3412" strokeWidth="2" fill="none" />
            {/* Giọt mồ hôi rơi */}
            <path d="M 58 48 Q 63 54 60 58 Q 57 60 55 56 Z" fill="#38BDF8" opacity="0.9" />

            {/* Tóc nâu & Băng đô */}
            <path d="M 26 50 Q 22 36 36 32 Q 48 28 58 35 Q 62 44 56 54 Z" fill="#78350F" />
            <path d="M 28 46 Q 42 40 56 46 L 54 52 Q 42 45 29 52 Z" fill="#EF4444" />
            <circle cx="42" cy="46" r="3" fill="#FFFFFF" />
          </svg>
        </div>
      )}

      {/* ── 2. MÀN THẮNG CUỘC (VICTORY) ── */}
      {action === "victory" && (
        <div
          className="relative w-32 h-36 sm:w-36 sm:h-40 transition-all"
          style={{ animation: reducedMotion ? "none" : "boyVictoryCelebration 1.2s ease-in-out infinite" }}
        >
          {/* Ánh sáng sao lung linh xung quanh */}
          <div className="absolute -top-3 inset-x-0 flex justify-between px-2 text-xl">
            <span className="animate-spin">✨</span>
            <span className="animate-pulse">🏆</span>
            <span className="animate-spin">✨</span>
          </div>

          <svg viewBox="0 0 150 160" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Bóng mặt đất */}
            <ellipse cx="75" cy="152" rx="42" ry="8" fill="#020617" opacity="0.35" />

            {/* Hai chân đứng hiên ngang */}
            <path d="M 60 108 L 52 142" stroke="#1E293B" strokeWidth="12" strokeLinecap="round" />
            <path d="M 90 108 L 98 142" stroke="#1E293B" strokeWidth="12" strokeLinecap="round" />
            {/* Giày thể thao đỏ viền trắng */}
            <path d="M 40 142 L 56 142 L 56 150 L 38 150 Z" fill="#EF4444" />
            <path d="M 38 148 L 56 148 L 56 151 L 38 151 Z" fill="#FFFFFF" />
            <path d="M 94 142 L 110 142 L 112 150 L 94 150 Z" fill="#EF4444" />
            <path d="M 94 148 L 112 148 L 112 151 L 94 151 Z" fill="#FFFFFF" />

            {/* Áo thể thao năng động */}
            <path d="M 52 70 Q 75 66 98 70 L 95 112 Q 75 116 55 112 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" />
            <path d="M 68 68 L 82 68 L 80 108 L 70 108 Z" fill="#FFFFFF" />
            <polygon points="75,76 82,90 68,90" fill="#F59E0B" />

            {/* Tay Trái Giơ Cao Cúp Vàng */}
            <path d="M 56 78 L 32 54 L 30 36" stroke="#3B82F6" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <g transform="translate(10, 6)">
              <path d="M 12 16 Q 22 16 28 26 Q 22 36 12 36 Q 2 36 2 26 Q 2 16 12 16 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
              <path d="M 12 36 L 12 44" stroke="#D97706" strokeWidth="3" />
              <rect x="6" y="44" width="12" height="5" rx="1.5" fill="#B45309" />
              <text x="7" y="29" fontSize="12">⭐</text>
            </g>

            {/* Tay Phải Làm Dấu Chiến Thắng V */}
            <path d="M 94 78 L 118 54 L 122 38" stroke="#3B82F6" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="122" cy="36" r="6" fill="#FDE047" />

            {/* Cổ & Đầu */}
            <rect x="70" y="58" width="10" height="12" fill="#FCD34D" rx="2" />
            <circle cx="75" cy="46" r="20" fill="#FDE047" stroke="#F59E0B" strokeWidth="2" />

            {/* Khuôn mặt rạng rỡ hạnh phúc */}
            <ellipse cx="68" cy="44" rx="3.5" ry="4" fill="#0F172A" />
            <circle cx="67" cy="42" r="1.5" fill="#FFFFFF" />
            <ellipse cx="82" cy="44" rx="3.5" ry="4" fill="#0F172A" />
            <circle cx="81" cy="42" r="1.5" fill="#FFFFFF" />
            {/* Má hồng */}
            <ellipse cx="64" cy="50" rx="4" ry="2" fill="#F87171" opacity="0.7" />
            <ellipse cx="86" cy="50" rx="4" ry="2" fill="#F87171" opacity="0.7" />
            {/* Nụ cười tươi */}
            <path d="M 70 50 Q 75 58 80 50 Z" fill="#B91C1C" />

            {/* Tóc Anime & Băng Đô Vô Địch */}
            <path d="M 54 38 Q 48 20 64 15 Q 75 10 86 15 Q 98 22 96 38 Z" fill="#78350F" />
            <path d="M 55 36 Q 75 30 95 36 L 94 43 Q 75 36 56 43 Z" fill="#EF4444" />
            <circle cx="75" cy="37" r="3.5" fill="#FFFFFF" />
          </svg>
        </div>
      )}

      {/* ── 3. TRƯỢT THẤP NGƯỜI (SLIDING - Qua Cành Cây Thấp) ── */}
      {action === "sliding" && (
        <div className="relative w-36 h-20 sm:w-40 sm:h-24 transition-all translate-y-3">
          {/* Bụi trượt mặt đường phía sau */}
          <div
            className="absolute -left-6 bottom-2 flex gap-1 pointer-events-none"
            style={{ animation: reducedMotion ? "none" : "boySlideDust 0.6s ease-out infinite" }}
          >
            <span className="text-xl">💨</span>
            <span className="text-amber-400 font-black text-sm">⚡</span>
          </div>

          <svg viewBox="0 0 160 90" className="w-full h-full drop-shadow-xl overflow-visible">
            {/* Bóng dài sát đất */}
            <ellipse cx="80" cy="82" rx="60" ry="7" fill="#020617" opacity="0.4" />

            {/* Chân duỗi dài trượt cỏ */}
            <path d="M 28 78 L 74 72 L 115 76" stroke="#1E293B" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 18 80 L 34 77 L 30 86 L 16 84 Z" fill="#EF4444" />
            <path d="M 16 84 L 32 82 L 30 85 L 14 85 Z" fill="#FFFFFF" />

            {/* Thân nghiêng áp sát mặt đất */}
            <rect x="65" y="48" width="50" height="24" rx="8" transform="rotate(-10 65 48)" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" />
            <path d="M 76 50 L 92 48 L 88 72 L 72 74 Z" fill="#FFFFFF" />

            {/* Tay trước giữ thăng bằng */}
            <path d="M 108 55 L 130 68 L 142 66" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="143" cy="66" r="4.5" fill="#FBBF24" />

            {/* Đầu ngẩng tập trung phía trước */}
            <circle cx="126" cy="42" r="16" fill="#FDE047" stroke="#F59E0B" strokeWidth="1.5" />
            <ellipse cx="124" cy="40" rx="3" ry="3.5" fill="#0F172A" />
            <circle cx="123" cy="39" r="1.2" fill="#FFFFFF" />
            <ellipse cx="132" cy="40" rx="3" ry="3.5" fill="#0F172A" />
            <circle cx="131" cy="39" r="1.2" fill="#FFFFFF" />
            <path d="M 124 49 Q 128 53 133 49" stroke="#9A3412" strokeWidth="2" fill="none" />

            {/* Băng đô & Tóc bay rạp ra sau */}
            <path d="M 112 36 Q 106 24 122 22 Q 132 20 138 28 Z" fill="#78350F" />
            <path d="M 114 36 Q 126 31 138 36 L 136 41 Q 126 35 115 41 Z" fill="#EF4444" />
            <circle cx="126" cy="35" r="2.5" fill="#FFFFFF" />
            {/* Đuôi băng đô bay ngược gió */}
            <path d="M 112 38 Q 98 32 88 38 Q 98 43 110 42 Z" fill="#DC2626" />
          </svg>
        </div>
      )}

      {/* ── 4. BẬT NHẢY CAO (JUMPING - Qua Tảng Đá / Hố Sâu) ── */}
      {action === "jumping" && (
        <div className="relative w-28 h-32 sm:w-32 sm:h-36 transition-transform duration-300 -translate-y-14 sm:-translate-y-16">
          {/* Vệt gió lướt dưới chân */}
          <div className="absolute -bottom-2 inset-x-0 flex justify-center gap-1.5 opacity-80 text-sky-400">
            <span className="text-base font-mono">≈</span>
            <span className="text-xs font-mono">≈</span>
            <span className="text-base font-mono">≈</span>
          </div>

          <svg viewBox="0 0 140 150" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Bóng nhỏ mờ xa tít mặt đất */}
            <ellipse cx="70" cy="146" rx="20" ry="4" fill="#020617" opacity="0.2" />

            {/* Chân co gập lại trên không để vượt qua vật cản */}
            <path d="M 58 88 L 42 106 L 56 120" stroke="#1E293B" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 82 88 L 96 102 L 86 118" stroke="#1E293B" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Giày thể thao */}
            <path d="M 52 118 L 66 118 L 64 126 L 50 124 Z" fill="#EF4444" />
            <path d="M 80 116 L 94 116 L 92 124 L 78 122 Z" fill="#EF4444" />

            {/* Thân người bay bổng */}
            <path d="M 52 56 Q 70 52 88 56 L 85 92 Q 70 96 55 92 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" />
            <path d="M 64 54 L 76 54 L 74 88 L 66 88 Z" fill="#FFFFFF" />

            {/* Hai tay dang rộng vút lên đón gió */}
            <path d="M 52 64 L 28 48 L 22 36" stroke="#3B82F6" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="21" cy="35" r="5" fill="#FBBF24" />
            <path d="M 88 64 L 112 48 L 118 36" stroke="#3B82F6" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="119" cy="35" r="5" fill="#FBBF24" />

            {/* Đầu & Mặt biểu cảm quyết đoán */}
            <circle cx="70" cy="36" r="18" fill="#FDE047" stroke="#F59E0B" strokeWidth="2" />
            <ellipse cx="65" cy="35" rx="3" ry="4" fill="#0F172A" />
            <circle cx="64" cy="33" r="1.3" fill="#FFFFFF" />
            <ellipse cx="76" cy="35" rx="3" ry="4" fill="#0F172A" />
            <circle cx="75" cy="33" r="1.3" fill="#FFFFFF" />
            <path d="M 66 43 Q 70 48 75 43" stroke="#9A3412" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Tóc và Dải băng đô đỏ tung bay theo gió */}
            <path d="M 52 30 Q 48 16 62 12 Q 74 10 82 14 Q 90 20 88 32 Z" fill="#78350F" />
            <path d="M 52 30 Q 70 26 88 30 L 87 36 Q 70 32 53 36 Z" fill="#EF4444" />
            <circle cx="70" cy="31" r="3" fill="#FFFFFF" />
            <path d="M 52 32 Q 38 24 24 30 Q 34 37 48 36 Z" fill="#DC2626" />
          </svg>
        </div>
      )}

      {/* ── 5. CÁC TRẠNG THÁI TIÊU CHUẨN: RUNNING / DASHING / STUMBLE / IDLE ── */}
      {action !== "defeated" && action !== "victory" && action !== "sliding" && action !== "jumping" && (
        <div
          className={`relative w-28 h-28 sm:w-32 sm:h-32 transition-all duration-300 ${
            action === "dashing"
              ? "scale-105 sm:scale-110 translate-x-2"
              : action === "stumble"
              ? "-translate-x-3 rotate-6"
              : ""
          }`}
          style={{
            animation:
              reducedMotion || action === "idle"
                ? "none"
                : action === "stumble"
                ? "boyStumbleRecoil 0.4s ease-in-out infinite"
                : "boyRunBob 0.38s ease-in-out infinite",
          }}
        >
          {/* Hiệu ứng Lửa & Tốc Độ khi Combo x5 (DASHING) */}
          {action === "dashing" && (
            <div
              className="absolute -left-10 top-4 flex items-center gap-0.5 text-2xl"
              style={{ animation: reducedMotion ? "none" : "boyDashFlames 0.3s ease-in-out infinite" }}
            >
              <span className="text-orange-500 scale-125">🔥</span>
              <span className="text-amber-400 -ml-2 text-xl">💨</span>
              <span className="text-yellow-300 -ml-2 text-base">⚡</span>
            </div>
          )}

          {/* Hiệu ứng Choáng Váng khi Va Chạm (STUMBLE) */}
          {action === "stumble" && (
            <div className="absolute -top-4 left-2 flex items-center gap-1 animate-bounce">
              <span className="text-xl">💥</span>
              <span className="text-xs font-black text-rose-500 bg-white/90 px-1.5 py-0.5 rounded-md shadow">
                Ouch!
              </span>
            </div>
          )}

          {/* Khiên Năng Lượng Bảo Vệ (SHIELD BUFF) */}
          {hasShield && (
            <div
              className="absolute -inset-3 rounded-full border-2 border-cyan-300 bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.7)] pointer-events-none z-30"
              style={{ animation: reducedMotion ? "none" : "boyShieldAura 1.5s ease-in-out infinite" }}
            />
          )}

          <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-xl overflow-visible">
            {/* Dải băng đô đỏ tung bay phía sau đầu */}
            <path
              d="M 52 36 Q 38 28 24 34 Q 34 41 48 40 Z"
              fill="#DC2626"
              style={{
                transformOrigin: "52px 36px",
                animation: reducedMotion || action === "idle" ? "none" : "boyHeadbandWave 0.45s ease-in-out infinite",
              }}
            />

            {/* Bóng mặt đất co giãn nhịp nhàng */}
            <ellipse cx="70" cy="132" rx="32" ry="6" fill="#020617" opacity="0.35" />

            {/* ── CHÂN SAU (Chân Trái) ── */}
            <g
              style={{
                transformOrigin: "62px 88px",
                animation:
                  reducedMotion || action === "idle" || action === "stumble"
                    ? "none"
                    : "boyLegSwingBack 0.42s ease-in-out infinite",
              }}
            >
              <path
                d="M 62 88 L 48 108 L 36 122"
                stroke="#1E293B"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M 30 122 L 46 122 C 48 126 42 129 32 129 L 24 129 C 22 125 26 122 30 122 Z"
                fill="#EF4444"
              />
              <path d="M 24 128 L 46 128 L 46 130 L 24 130 Z" fill="#FFFFFF" />
            </g>

            {/* ── TAY SAU (Tay Trái) ── */}
            <g
              style={{
                transformOrigin: "58px 64px",
                animation:
                  reducedMotion || action === "idle" || action === "stumble"
                    ? "none"
                    : "boyArmSwingFront 0.42s ease-in-out infinite",
              }}
            >
              <path
                d="M 58 64 L 40 76 L 30 70"
                stroke="#3B82F6"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="28" cy="69" r="5" fill="#FBBF24" />
            </g>

            {/* ── THÂN NGƯỜI & ÁO KHOÁC THỂ THAO ── */}
            <path
              d="M 54 58 Q 70 54 86 58 L 83 94 Q 70 98 56 94 Z"
              fill="#2563EB"
              stroke="#1D4ED8"
              strokeWidth="2"
            />
            {/* Vạt áo trắng thể thao */}
            <path d="M 64 56 L 76 56 L 73 90 L 67 90 Z" fill="#F8FAFC" />
            <polygon points="70,62 74,72 66,72" fill="#F59E0B" />

            {/* ── CHÂN TRƯỚC (Chân Phải) ── */}
            <g
              style={{
                transformOrigin: "78px 88px",
                animation:
                  reducedMotion || action === "idle" || action === "stumble"
                    ? "none"
                    : "boyLegSwingFront 0.42s ease-in-out infinite",
              }}
            >
              <path
                d="M 78 88 L 94 108 L 108 120"
                stroke="#1E293B"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M 104 120 L 120 122 C 122 126 114 129 104 129 L 96 129 C 96 125 100 121 104 120 Z"
                fill="#EF4444"
              />
              <path d="M 96 128 L 120 128 L 120 130 L 96 130 Z" fill="#FFFFFF" />
            </g>

            {/* ── TAY TRƯỚC (Tay Phải) ── */}
            <g
              style={{
                transformOrigin: "82px 64px",
                animation:
                  reducedMotion || action === "idle" || action === "stumble"
                    ? "none"
                    : "boyArmSwingBack 0.42s ease-in-out infinite",
              }}
            >
              <path
                d="M 82 64 L 98 76 L 108 70"
                stroke="#1D4ED8"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="110" cy="70" r="5" fill="#FBBF24" />
            </g>

            {/* ── CỔ VÀ KHUÔN MẶT ── */}
            <rect x="65" y="48" width="10" height="10" fill="#FCD34D" rx="2" />
            <circle cx="70" cy="38" r="18" fill="#FDE047" stroke="#F59E0B" strokeWidth="2" />

            {/* Mắt: Bình thường hoặc Mắt Choáng khi Stumble */}
            {action === "stumble" ? (
              <>
                <text x="61" y="41" fontSize="11" fill="#78350F" fontWeight="900">✕</text>
                <text x="71" y="41" fontSize="11" fill="#78350F" fontWeight="900">✕</text>
                <path d="M 66 47 Q 70 42 74 47" stroke="#9A3412" strokeWidth="2" fill="none" />
              </>
            ) : (
              <>
                <ellipse cx="65" cy="37" rx="3.2" ry="4" fill="#0F172A" />
                <circle cx="64" cy="35" r="1.3" fill="#FFFFFF" />
                <ellipse cx="76" cy="37" rx="3.2" ry="4" fill="#0F172A" />
                <circle cx="75" cy="35" r="1.3" fill="#FFFFFF" />
                {/* Nụ cười quyết tâm khi chạy */}
                <path
                  d="M 66 45 Q 70 49 75 45"
                  stroke="#9A3412"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </>
            )}

            {/* Mái tóc anime nâu & Băng đô thể thao đỏ viền trắng */}
            <path
              d="M 52 32 Q 48 18 62 14 Q 72 10 82 14 Q 92 18 90 30 Q 92 38 86 42 L 88 30 Q 82 22 72 22 Q 62 22 56 32 Z"
              fill="#78350F"
            />
            <path d="M 50 30 Q 56 16 68 18 Q 60 22 56 32 Z" fill="#92400E" />
            <path d="M 52 32 Q 70 27 88 32 L 87 38 Q 70 33 53 38 Z" fill="#EF4444" />
            <circle cx="70" cy="33" r="3" fill="#FFFFFF" />
          </svg>
        </div>
      )}
    </div>
  );
}
