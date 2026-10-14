"use client";

import React from "react";
import { CheckCircle2, Clock } from "lucide-react";

interface PracticeProgressBarProps {
  completed: number;
  total: number;
  unit?: string;
  compact?: boolean;
  className?: string;
}

export const PracticeProgressBar: React.FC<PracticeProgressBarProps> = ({
  completed,
  total,
  unit = "câu",
  compact = false,
  className = "",
}) => {
  const safeTotal = total > 0 ? total : 0;
  const safeCompleted = Math.max(0, Math.min(safeTotal, completed));
  const percent = safeTotal > 0 ? Math.min(100, Math.round((safeCompleted / safeTotal) * 100)) : 0;
  const isCompleted = percent >= 100;
  const isInProgress = percent > 0 && percent < 100;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-slate-600">
            {isCompleted ? "Đã xong:" : isInProgress ? "Đang làm:" : "Chưa làm:"}
          </span>
          <span className="font-mono font-bold text-slate-900">
            {safeCompleted}/{safeTotal} {unit}
          </span>
          <span className="text-[11px] font-bold text-slate-400 font-mono">
            ({percent}%)
          </span>
        </div>

        {isCompleted ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Hoàn thành
          </span>
        ) : isInProgress ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            <Clock className="w-3 h-3 text-blue-600" />
            Đang học
          </span>
        ) : (
          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            Chưa làm
          </span>
        )}
      </div>

      {/* Visual Progress Bar */}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${compact ? "h-1.5" : "h-2"}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isCompleted
              ? "bg-emerald-500"
              : isInProgress
              ? "bg-blue-600"
              : "bg-transparent"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
