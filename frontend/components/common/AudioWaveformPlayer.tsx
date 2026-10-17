"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, RefreshCw } from "lucide-react";

export interface AudioWaveformPlayerProps {
  audioUrl?: string;
  isPlaying?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  className?: string;
  autoPlayOnSeek?: boolean;
  title?: string;
  showSpeedControl?: boolean;
  showReplayButton?: boolean;
  replayCount?: number;
  onReplayClick?: () => void;
  onTimeUpdateCallback?: (currentTime: number, duration: number) => void;
}

// Mảng 36 chiều cao mẫu sóng âm thanh tự nhiên (tỷ lệ 0 -> 100)
const WAVEFORM_HEIGHTS = [
  35, 55, 75, 40, 90, 65, 45, 80, 60, 30, 70, 95, 50, 85, 40, 60,
  75, 90, 35, 65, 80, 45, 70, 55, 30, 85, 60, 40, 95, 50, 75, 85,
  45, 65, 35, 50
];

export const AudioWaveformPlayer: React.FC<AudioWaveformPlayerProps> = ({
  audioUrl,
  isPlaying: controlledIsPlaying,
  onPlayPauseChange,
  className = "",
  autoPlayOnSeek = true,
  title,
  showSpeedControl = true,
  showReplayButton = false,
  replayCount = 0,
  onReplayClick,
  onTimeUpdateCallback,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);

  // Trạng thái phát
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const isPlaying = controlledIsPlaying !== undefined ? controlledIsPlaying : internalIsPlaying;

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const skipStep = 3; // Tua mặc định 3 giây theo yêu cầu
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hover preview state trên waveform
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [hoverPercent, setHoverPercent] = useState(0);

  // Giữ ref callback để tránh re-render loop
  const onPlayPauseChangeRef = useRef(onPlayPauseChange);
  useEffect(() => {
    onPlayPauseChangeRef.current = onPlayPauseChange;
  }, [onPlayPauseChange]);

  // Đồng bộ controlledIsPlaying từ bên ngoài (chỉ khi có sự khác biệt thực tế)
  useEffect(() => {
    if (!audioRef.current) return;
    if (controlledIsPlaying !== undefined) {
      if (controlledIsPlaying && audioRef.current.paused) {
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay blocked or playback error:", err);
          onPlayPauseChangeRef.current?.(false);
          setInternalIsPlaying(false);
        });
      } else if (!controlledIsPlaying && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
  }, [controlledIsPlaying]);

  // Cập nhật tốc độ nghe khi playbackSpeed thay đổi
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Chỉ reset khi audioUrl THẬT SỰ thay đổi (tránh pause oan khi cha re-render)
  const prevAudioUrlRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (prevAudioUrlRef.current !== undefined && prevAudioUrlRef.current !== audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.load();
      }
      setCurrentTime(0);
      setDuration(0);
      setInternalIsPlaying(false);
      onPlayPauseChangeRef.current?.(false);
      setErrorMessage(null);
    }
    prevAudioUrlRef.current = audioUrl;
  }, [audioUrl]);

  // Hàm bật/tắt phát âm thanh
  const togglePlay = () => {
    if (!audioRef.current) return;
    setErrorMessage(null);

    // Nếu đã chạy xong bài trước đó, tự động quay về đầu phát lại
    if (audioRef.current.ended || (duration > 0 && currentTime >= duration)) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }

    if (!audioRef.current.paused) {
      audioRef.current.pause();
      setInternalIsPlaying(false);
      onPlayPauseChangeRef.current?.(false);
    } else {
      audioRef.current.play().then(() => {
        setInternalIsPlaying(true);
        onPlayPauseChangeRef.current?.(true);
      }).catch((err) => {
        console.error("Audio playback error:", err);
        setErrorMessage("Trình duyệt chặn tự động phát. Hãy bấm nút Play một lần nữa.");
        setInternalIsPlaying(false);
        onPlayPauseChangeRef.current?.(false);
      });
    }
  };

  // Tua lùi (Rewind) 3s hoặc 5s
  const handleRewind = (seconds?: number) => {
    if (!audioRef.current) return;
    const step = seconds ?? skipStep;
    const newTime = Math.max(0, (audioRef.current.currentTime || 0) - step);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    if (audioRef.current.paused && autoPlayOnSeek) {
      audioRef.current.play().catch(() => {});
    }
  };

  // Tua tới (Fast Forward) 3s hoặc 5s
  const handleForward = (seconds?: number) => {
    if (!audioRef.current) return;
    const step = seconds ?? skipStep;
    const maxTime = audioRef.current.duration || duration || 0;
    const newTime = Math.min(maxTime, (audioRef.current.currentTime || 0) + step);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    if (audioRef.current.paused && autoPlayOnSeek) {
      audioRef.current.play().catch(() => {});
    }
  };

  // Khi bấm chuột vào khung phát sóng âm -> phát lại ngay từ khúc đó
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current || !audioRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));

    const totalDur = audioRef.current.duration || duration;
    if (!totalDur || Number.isNaN(totalDur)) return;

    const targetTime = ratio * totalDur;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);

    // Phát lại ngay lập tức từ khúc được bấm
    if (autoPlayOnSeek) {
      audioRef.current.play().then(() => {
        setInternalIsPlaying(true);
        onPlayPauseChangeRef.current?.(true);
      }).catch((err) => {
        console.warn("Play on seek failed:", err);
      });
    }
  };

  // Hover di chuột trên khung để xem trước thời gian
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
    const totalDur = audioRef.current?.duration || duration || 0;
    setHoverPercent(ratio * 100);
    setHoverTime(ratio * totalDur);
  };

  // Đổi tốc độ phát
  const cyclePlaybackSpeed = () => {
    const speeds = [0.8, 1.0, 1.2, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  // Format giây thành mm:ss
  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const progressPercent = progressRatio * 100;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3 ${className}`}>
      {/* Thẻ audio ẩn */}
      <audio
        ref={audioRef}
        src={audioUrl || "/ets_2024_lc/audio/part1_test1.mp3"}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onCanPlay={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          const d = e.currentTarget.duration;
          setCurrentTime(t);
          if (Number.isFinite(d) && d > 0 && Math.abs(d - duration) > 0.1) {
            setDuration(d);
          }
          onTimeUpdateCallback?.(t, d || duration);
        }}
        onPlay={() => {
          setInternalIsPlaying(true);
          onPlayPauseChangeRef.current?.(true);
        }}
        onPause={() => {
          setInternalIsPlaying(false);
          onPlayPauseChangeRef.current?.(false);
        }}
        onEnded={() => {
          setInternalIsPlaying(false);
          onPlayPauseChangeRef.current?.(false);
          // Giữ thanh sóng ở trạng thái hoàn thành đầy đủ khi nói xong
          if (duration > 0) {
            setCurrentTime(duration);
          }
        }}
        onError={(e) => {
          console.error("Audio error event:", e);
          setErrorMessage("Không thể tải file âm thanh. Vui lòng kiểm tra lại đường dẫn.");
        }}
        className="hidden"
      />

      {/* Header nhỏ */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
        <div className="flex items-center gap-2 font-medium">
          {title && <span className="text-slate-700 font-bold">{title}</span>}
          <span className="text-[11px] text-slate-400">
            • Nhấn vào sóng âm để phát từ điểm mong muốn
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-2 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* HÀNG ĐIỀU KHIỂN CHÍNH */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* NHÓM NÚT ĐIỀU HƯỚNG: TUA LÙI (-3s) - PLAY/PAUSE - TUA TỚI (+3s) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Nút tua lùi 3s */}
          <button
            type="button"
            onClick={() => handleRewind(3)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-600 flex flex-col items-center justify-center transition active:scale-95 cursor-pointer shadow-xs group"
            title="Tua lại 3 giây"
          >
            <RotateCcw className="w-4 h-4 transition-transform group-hover:-rotate-45" />
            <span className="text-[9px] font-black -mt-0.5 tracking-tight">-3s</span>
          </button>

          {/* Nút Play / Pause tròn màu xanh lớn */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-md shadow-blue-500/25 active:scale-95 shrink-0 cursor-pointer"
            title={isPlaying ? "Tạm dừng" : "Phát audio"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 ml-0.5 fill-white" />
            )}
          </button>

          {/* Nút tua tới 3s */}
          <button
            type="button"
            onClick={() => handleForward(3)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-600 flex flex-col items-center justify-center transition active:scale-95 cursor-pointer shadow-xs group"
            title="Tua tới 3 giây"
          >
            <RotateCw className="w-4 h-4 transition-transform group-hover:rotate-45" />
            <span className="text-[9px] font-black -mt-0.5 tracking-tight">+3s</span>
          </button>
        </div>

        {/* KHUNG PHÁT ÂM THANH / THANH SÓNG CLICK-TO-SEEK */}
        <div
          ref={waveformRef}
          onClick={handleSeek}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          className="flex-1 relative h-12 px-3 sm:px-4 bg-slate-50 hover:bg-blue-50/30 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex items-center overflow-hidden select-none group"
          title="Nhấn vào bất kỳ vị trí nào để phát âm thanh từ khúc đấy"
        >
          {/* Tooltip hiển thị mốc thời gian khi rê chuột */}
          {isHovering && duration > 0 && (
            <div
              className="absolute -top-7 transform -translate-x-1/2 bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none z-30 whitespace-nowrap"
              style={{ left: `${hoverPercent}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Vạch kẻ chỉ thị vị trí chuột hover */}
          {isHovering && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-400/80 z-20 pointer-events-none"
              style={{ left: `${hoverPercent}%` }}
            />
          )}

          {/* Dãy các thanh sóng âm thanh (Cố định chiều cao pixel và độ rộng rõ ràng) */}
          <div className="w-full h-8 flex items-center justify-between gap-[2px] sm:gap-[3px] px-0.5 pointer-events-none">
            {WAVEFORM_HEIGHTS.map((h, i) => {
              const totalBars = WAVEFORM_HEIGHTS.length;
              const barThreshold = (i + 1) / totalBars;
              const isPlayed = progressRatio >= barThreshold;
              const isNearHead = isPlaying && Math.abs(barThreshold - progressRatio) < (1.5 / totalBars);

              // Chiều cao pixel từ 6px đến 28px
              const baseHeightPx = Math.max(6, Math.min(28, Math.round(h * 0.28)));
              const activeHeightPx = isPlaying && (isPlayed || isNearHead)
                ? Math.max(8, Math.min(28, Math.round(((h * ((i % 3) + 1)) % 100) * 0.28)))
                : baseHeightPx;

              return (
                <div
                  key={i}
                  className={`w-1 sm:w-1.5 rounded-full transition-all duration-150 shrink-0 ${
                    isPlayed
                      ? isNearHead
                        ? "bg-blue-600 scale-y-110 shadow-xs ring-1 ring-blue-400"
                        : "bg-blue-600"
                      : "bg-slate-300 group-hover:bg-slate-400/80"
                  }`}
                  style={{
                    height: `${activeHeightPx}px`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* THÔNG TIN THỜI GIAN THỰC & CÁC NÚT TIỆN ÍCH */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Badge đồng hồ mm:ss / mm:ss */}
          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200/90 whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Nút điều chỉnh tốc độ nghe (0.8x, 1.0x, 1.2x, 1.5x) */}
          {showSpeedControl && (
            <button
              type="button"
              onClick={cyclePlaybackSpeed}
              className="px-2.5 py-1.5 sm:py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              title="Đổi tốc độ phát âm thanh"
            >
              {playbackSpeed}x
            </button>
          )}

          {/* Nút phát lại từ đầu (Replay) nếu bật */}
          {showReplayButton && (
            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  setCurrentTime(0);
                  audioRef.current.play().then(() => {
                    setInternalIsPlaying(true);
                    onPlayPauseChangeRef.current?.(true);
                  }).catch(() => {});
                }
                onReplayClick?.();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              title="Phát lại từ đầu (0:00)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {replayCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-mono">
                  {replayCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
