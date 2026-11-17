import React from "react";
import type { BattleShip, BattleShipType } from "./config";

interface ShipSvgProps {
  type: BattleShipType | "player";
  hp?: number;
  maxHp?: number;
  isTarget?: boolean;
  isFiring?: boolean;
  isHit?: boolean;
  isDestroyed?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Top-down SVG vector rendering for naval warships.
 * - Player: Sleek modern dreadnought with dual-gun forward turret
 * - Patrol: Small agile interceptor craft
 * - Destroyer: Medium warship with twin artillery turrets
 * - Boss: Massive battleship with armored deck plates, gold trim & bridge tower
 */
export function ShipSvg({
  type,
  hp = 1,
  maxHp = 1,
  isTarget = false,
  isHit = false,
  isDestroyed = false,
  className = "",
}: ShipSvgProps) {
  if (type === "player") {
    return (
      <div className={`relative flex flex-col items-center select-none ${className}`}>
        <svg
          viewBox="0 0 100 160"
          className={`w-20 h-32 md:w-24 md:h-36 drop-shadow-2xl transition-transform duration-300 ${
            isHit ? "animate-pulse brightness-150 filter hue-rotate-90" : ""
          }`}
        >
          {/* Water wake behind player ship */}
          <path
            d="M 30 150 Q 50 170 70 150 Q 50 160 30 150"
            fill="rgba(56, 189, 248, 0.25)"
            className="animate-pulse"
          />

          {/* Hull shadow */}
          <path
            d="M 50 10 C 70 30 78 70 76 130 C 74 145 66 150 50 150 C 34 150 26 145 24 130 C 22 70 30 30 50 10 Z"
            fill="rgba(2, 6, 23, 0.6)"
            transform="translate(0, 4)"
          />

          {/* Main Hull */}
          <path
            d="M 50 10 C 70 30 78 70 76 130 C 74 145 66 150 50 150 C 34 150 26 145 24 130 C 22 70 30 30 50 10 Z"
            fill="url(#playerHullGrad)"
            stroke="#38bdf8"
            strokeWidth="1.5"
          />

          {/* Deck plating & centerline */}
          <path
            d="M 50 25 L 50 135"
            stroke="#0284c7"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <polygon
            points="35,60 65,60 62,110 38,110"
            fill="#1e293b"
            stroke="#0ea5e9"
            strokeWidth="1"
          />

          {/* Bridge / Conning Tower */}
          <rect
            x="42"
            y="75"
            width="16"
            height="26"
            rx="4"
            fill="#334155"
            stroke="#7dd3fc"
            strokeWidth="1"
          />
          {/* Bridge windshield glass */}
          <path
            d="M 44 78 Q 50 75 56 78 L 56 83 Q 50 81 44 83 Z"
            fill="#38bdf8"
            opacity="0.8"
          />

          {/* Forward Dual-Cannon Main Turret */}
          <g transform="translate(50, 45)">
            {/* Cannon Barrels pointing upward */}
            <line x1="-3" y1="0" x2="-3" y2="-22" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="3" y1="0" x2="3" y2="-22" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            {/* Muzzle Brakes */}
            <rect x="-4.5" y="-24" width="3" height="3" fill="#cbd5e1" />
            <rect x="1.5" y="-24" width="3" height="3" fill="#cbd5e1" />
            {/* Turret Ring */}
            <circle cx="0" cy="0" r="10" fill="#475569" stroke="#60a5fa" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="4" fill="#1e293b" />
          </g>

          {/* Aft Turret */}
          <g transform="translate(50, 122)">
            <line x1="-2.5" y1="0" x2="-2.5" y2="14" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="2.5" y1="0" x2="2.5" y2="14" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="0" r="8" fill="#475569" stroke="#38bdf8" strokeWidth="1" />
          </g>

          {/* Radar Antenna */}
          <line x1="50" y1="88" x2="50" y2="94" stroke="#f59e0b" strokeWidth="1.5" />
          <circle cx="50" cy="88" r="2" fill="#f59e0b" />

          {/* Hull Gradients */}
          <defs>
            <linearGradient id="playerHullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // ENEMY SHIPS
  const isPatrol = type === "patrol";
  const isDestroyer = type === "destroyer";
  const isBoss = type === "boss";

  return (
    <div
      className={`relative flex flex-col items-center select-none transition-all duration-300 ${
        isDestroyed ? "opacity-25 grayscale scale-90" : isHit ? "scale-105" : ""
      } ${className}`}
    >
      {/* Target Reticle Crosshair */}
      {isTarget && !isDestroyed && (
        <div className="absolute -inset-3 pointer-events-none flex items-center justify-center animate-pulse">
          <svg viewBox="0 0 100 100" className="w-full h-full text-red-500 opacity-90">
            {/* Crosshair corners */}
            <path d="M 15 30 L 15 15 L 30 15" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 85 30 L 85 15 L 70 15" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 15 70 L 15 85 L 30 85" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 85 70 L 85 85 L 70 85" stroke="currentColor" strokeWidth="2" fill="none" />
            {/* Center tick marks */}
            <line x1="50" y1="5" x2="50" y2="18" stroke="currentColor" strokeWidth="2" />
            <line x1="50" y1="82" x2="50" y2="95" stroke="currentColor" strokeWidth="2" />
            <line x1="5" y1="50" x2="18" y2="50" stroke="currentColor" strokeWidth="2" />
            <line x1="82" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      )}

      {/* SVG Ship Models */}
      {isPatrol && (
        <svg
          viewBox="0 0 70 110"
          className={`w-14 h-22 md:w-16 md:h-24 drop-shadow-lg transition-transform ${
            isHit ? "filter brightness-150 hue-rotate-180" : ""
          }`}
        >
          {/* Hull */}
          <path
            d="M 35 100 C 48 85 52 50 50 18 C 48 8 42 5 35 5 C 28 5 22 8 20 18 C 18 50 22 85 35 100 Z"
            fill="url(#patrolHullGrad)"
            stroke={isTarget ? "#ef4444" : "#64748b"}
            strokeWidth="1.5"
          />
          {/* Cabin */}
          <polygon points="26,45 44,45 41,70 29,70" fill="#334155" stroke="#475569" strokeWidth="1" />
          {/* Single Gun pointing down towards player */}
          <line x1="35" y1="70" x2="35" y2="85" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="35" cy="70" r="5" fill="#475569" />

          <defs>
            <linearGradient id="patrolHullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {isDestroyer && (
        <svg
          viewBox="0 0 80 140"
          className={`w-16 h-28 md:w-20 md:h-32 drop-shadow-xl transition-transform ${
            isHit ? "filter brightness-150 hue-rotate-180" : ""
          }`}
        >
          {/* Hull */}
          <path
            d="M 40 130 C 58 110 64 65 60 20 C 58 8 50 5 40 5 C 30 5 22 8 20 20 C 16 65 22 110 40 130 Z"
            fill="url(#destroyerHullGrad)"
            stroke={isTarget ? "#ef4444" : "#64748b"}
            strokeWidth="1.5"
          />
          {/* Deck plating */}
          <rect x="28" y="45" width="24" height="40" rx="3" fill="#334155" stroke="#475569" strokeWidth="1" />
          {/* Forward Gun pointing towards player */}
          <g transform="translate(40, 95)">
            <line x1="-2.5" y1="0" x2="-2.5" y2="18" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="2.5" y1="0" x2="2.5" y2="18" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="0" r="8" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
          </g>
          {/* Aft Gun */}
          <g transform="translate(40, 30)">
            <line x1="0" y1="0" x2="0" y2="-12" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="0" r="6" fill="#475569" />
          </g>

          <defs>
            <linearGradient id="destroyerHullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {isBoss && (
        <svg
          viewBox="0 0 130 180"
          className={`w-28 h-38 md:w-36 md:h-48 drop-shadow-2xl transition-transform ${
            isHit ? "filter brightness-150 hue-rotate-180" : ""
          }`}
        >
          {/* Menacing Boss Aura */}
          <circle cx="65" cy="90" r="60" fill="rgba(239, 68, 68, 0.08)" className="animate-pulse" />

          {/* Heavy Armored Dreadnought Hull */}
          <path
            d="M 65 170 C 95 145 105 85 100 25 C 96 10 82 5 65 5 C 48 5 34 10 30 25 C 25 85 35 145 65 170 Z"
            fill="url(#bossHullGrad)"
            stroke={isTarget ? "#ef4444" : "#eab308"}
            strokeWidth="2.5"
          />

          {/* Gold Imperial Armor Crest Trims */}
          <path d="M 40 40 L 90 40 L 85 60 L 45 60 Z" fill="#78350f" stroke="#fbbf24" strokeWidth="1.2" />
          <path d="M 45 110 L 85 110 L 80 130 L 50 130 Z" fill="#78350f" stroke="#fbbf24" strokeWidth="1.2" />

          {/* Superstructure Bridge Fortress */}
          <rect x="46" y="65" width="38" height="40" rx="5" fill="#1e1e24" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="52" y="75" width="26" height="14" rx="2" fill="#dc2626" opacity="0.85" />

          {/* Heavy Main Artillery Turrets pointing at Player */}
          <g transform="translate(65, 140)">
            <line x1="-4" y1="0" x2="-4" y2="24" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
            <line x1="4" y1="0" x2="4" y2="24" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="0" r="12" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
            <circle cx="0" cy="0" r="4" fill="#fbbf24" />
          </g>

          <g transform="translate(65, 30)">
            <line x1="-3" y1="0" x2="-3" y2="-18" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="3" y1="0" x2="3" y2="-18" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="0" r="10" fill="#450a0a" stroke="#eab308" strokeWidth="1.5" />
          </g>

          <defs>
            <linearGradient id="bossHullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#450a0a" />
              <stop offset="50%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#292524" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* HP Badge / Bar */}
      <div className="mt-1 flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-700/80 shadow text-xs">
        {isBoss ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">BOSS</span>
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-amber-500/40">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
                style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-red-400 font-bold">{Math.max(0, hp)}/{maxHp}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {Array.from({ length: maxHp }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < hp ? (isTarget ? "bg-red-500 shadow-sm shadow-red-500" : "bg-emerald-400") : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
