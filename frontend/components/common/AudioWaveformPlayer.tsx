"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, RotateCw, RefreshCw } from "lucide-react";

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
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Trạng thái phát
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const isPlaying = controlledIsPlaying !== undefined ? controlledIsPlaying : internalIsPlaying;

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const skipStep = 3; // Tua mặc định 3 giây theo yêu cầu
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Trạng thái kéo / tua (Drag & Scrub)
  const [isDragging, setIsDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState<number | null>(null);
  const [dragTime, setDragTime] = useState<number>(0);

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

  // Tính tỷ lệ vị trí (0 -> 1) dựa theo khung track của các thanh sóng
  const getRatioFromClientX = (clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    return Math.max(0, Math.min(1, clickX / rect.width));
  };

  const updateDrag = (clientX: number, immediateApply: boolean = false) => {
    const ratio = getRatioFromClientX(clientX);
    const percent = ratio * 100;
    setDragPercent(percent);

    const totalDur = audioRef.current?.duration || duration || 0;
    const targetTime = ratio * totalDur;
    setDragTime(targetTime);

    if (immediateApply && audioRef.current && totalDur > 0) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const applySeek = (clientX: number) => {
    const ratio = getRatioFromClientX(clientX);
    const totalDur = audioRef.current?.duration || duration || 0;
    const targetTime = ratio * totalDur;

    setDragPercent(null);
    if (audioRef.current && totalDur > 0) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
      if (autoPlayOnSeek) {
        audioRef.current.play().then(() => {
          setInternalIsPlaying(true);
          onPlayPauseChangeRef.current?.(true);
        }).catch((err) => {
          console.warn("Play on seek failed:", err);
        });
      }
    }
  };

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    updateDrag(e.clientX, true);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      updateDrag(e.touches[0].clientX, true);
    }
  };

  const updateDragRef = useRef(updateDrag);
  const applySeekRef = useRef(applySeek);
  useEffect(() => {
    updateDragRef.current = updateDrag;
    applySeekRef.current = applySeek;
  });

  // Global mousemove and mouseup listeners when dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      updateDragRef.current(e.clientX, false);
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      applySeekRef.current(e.clientX);
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateDragRef.current(e.touches[0].clientX, false);
      }
    };

    const handleWindowTouchEnd = (e: TouchEvent) => {
      setIsDragging(false);
      if (e.changedTouches.length > 0) {
        applySeekRef.current(e.changedTouches[0].clientX);
      }
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    window.addEventListener("touchmove", handleWindowTouchMove);
    window.addEventListener("touchend", handleWindowTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
      window.removeEventListener("touchmove", handleWindowTouchMove);
      window.removeEventListener("touchend", handleWindowTouchEnd);
    };
  }, [isDragging]);

  // Hover di chuột trên khung để xem trước thời gian
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const ratio = getRatioFromClientX(e.clientX);
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
  // Vị trí thanh dọc dài: khi đang kéo thì theo tay kéo, bình thường theo thời gian phát
  const activePercent = isDragging && dragPercent !== null ? dragPercent : progressPercent;
  // Thời gian hiển thị trên đầu thanh dọc dài
  const activeDisplayTime = isDragging ? dragTime : currentTime;

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
      <div className="flex items-center gap-2 sm:gap-2.5 w-full">
        {/* NHÓM NÚT ĐIỀU HƯỚNG: TUA LÙI (-3s) - PLAY/PAUSE - TUA TỚI (+3s) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Nút tua lùi 3s */}
          <button
            type="button"
            onClick={() => handleRewind(3)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-600 flex flex-col items-center justify-center transition active:scale-95 cursor-pointer shadow-xs group"
            title="Tua lại 3 giây"
          >
            <RotateCcw className="w-3.5 h-3.5 transition-transform group-hover:-rotate-45" />
            <span className="text-[9px] font-black -mt-0.5 tracking-tight">-3s</span>
          </button>

          {/* Nút Play / Pause tròn màu xanh lớn */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-md shadow-blue-500/25 active:scale-95 shrink-0 cursor-pointer"
            title={isPlaying ? "Tạm dừng" : "Phát audio"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 fill-white" />
            )}
          </button>

          {/* Nút tua tới 3s */}
          <button
            type="button"
            onClick={() => handleForward(3)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-600 flex flex-col items-center justify-center transition active:scale-95 cursor-pointer shadow-xs group"
            title="Tua tới 3 giây"
          >
            <RotateCw className="w-3.5 h-3.5 transition-transform group-hover:rotate-45" />
            <span className="text-[9px] font-black -mt-0.5 tracking-tight">+3s</span>
          </button>
        </div>

        {/* KHUNG PHÁT ÂM THANH / THANH SÓNG KÉO & CLICK ĐỂ TUA (OVERFLOW VISIBLE ĐỂ HIỆN BADGE THỜI GIAN) */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            if (!isDragging) setIsHovering(false);
          }}
          onMouseMove={handleMouseMove}
          className="flex-1 min-w-0 relative h-11 sm:h-12 px-2.5 sm:px-3 bg-slate-50 hover:bg-blue-50/30 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex items-center select-none group"
          title="Kéo hoặc nhấn vào bất kỳ vị trí nào để nghe từ đoạn đó"
        >
          {/* TRACK SÓNG ÂM (CÙNG HỆ QUY CHIẾU TỌA ĐỘ CHO CẢ CÁC THANH VÀ THANH DỌC) */}
          <div ref={trackRef} className="relative w-full h-8 flex items-center min-w-0">
            {/* Vạch kẻ chỉ thị vị trí chuột hover (khi chưa kéo) */}
            {isHovering && !isDragging && duration > 0 && Math.abs(hoverPercent - activePercent) > 2.5 && (
              <div
                className="absolute top-0 bottom-0 w-[1.5px] bg-blue-400/60 z-10 pointer-events-none"
                style={{ left: `${hoverPercent}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-800/90 text-white font-mono text-[9px] font-medium rounded shadow-sm pointer-events-none whitespace-nowrap">
                  {formatTime(hoverTime)}
                </div>
              </div>
            )}

            {/* Dãy các thanh sóng âm thanh (Đồng bộ 100% với thanh dọc dài) */}
            <div className="w-full h-full flex items-center justify-between gap-[1.5px] sm:gap-[2px] pointer-events-none min-w-0">
              {WAVEFORM_HEIGHTS.map((h, i) => {
                const totalBars = WAVEFORM_HEIGHTS.length;
                // Vị trí phần trăm (0% -> 100%) của thanh thứ i
                const barPercent = totalBars > 1 ? (i / (totalBars - 1)) * 100 : 50;
                // Thanh được tô màu xanh KHI VÀ CHỈ KHI vị trí của nó nằm trước hoặc ngay tại thanh dọc dài!
                const isPlayed = barPercent <= activePercent + 0.5;
                const isNearHead = isPlaying && !isDragging && Math.abs(barPercent - activePercent) < (100 / totalBars * 1.5);

                // Chiều cao pixel từ 6px đến 28px
                const baseHeightPx = Math.max(6, Math.min(28, Math.round(h * 0.28)));
                const activeHeightPx = isPlaying && !isDragging && (isPlayed || isNearHead)
                  ? Math.max(8, Math.min(28, Math.round(((h * ((i % 3) + 1)) % 100) * 0.28)))
                  : baseHeightPx;

                return (
                  <div
                    key={i}
                    className={`flex-1 min-w-[1.5px] max-w-[4px] sm:max-w-[5px] rounded-full transition-all duration-150 ${
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

            {/* THANH DỌC DÀI MÀU XANH (PLAYHEAD / SCRUBBER) LUÔN KHỚP CHÍNH XÁC VỚI CÁC THANH XANH */}
            <div
              className={`absolute top-0 bottom-0 w-[2px] bg-blue-600 z-20 pointer-events-none transition-[left] ${
                isDragging ? "duration-0" : "duration-75"
              } ease-out shadow-xs`}
              style={{ left: `${activePercent}%` }}
            >
              {/* BADGE HIỂN THỊ THỜI GIAN NGAY TRÊN ĐẦU THANH DỌC DÀI */}
              <div
                className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-600 text-white font-mono text-[10px] font-bold rounded-md shadow-md flex items-center justify-center whitespace-nowrap transition-transform duration-100 ${
                  isDragging || isHovering || isPlaying || currentTime > 0 ? "scale-100 opacity-100" : "scale-95 opacity-90"
                }`}
              >
                <span>{formatTime(activeDisplayTime)}</span>
                {/* Mũi tên nhỏ chỉ thẳng xuống đỉnh thanh dọc */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[3.5px] border-x-transparent border-t-[4px] border-t-blue-600" />
              </div>

              {/* Núm tròn ở giữa thanh dọc giúp dễ quan sát vị trí đầu phát */}
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white shadow-sm" />
            </div>
          </div>
        </div>

        {/* THÔNG TIN THỜI GIAN THỰC & CÁC NÚT TIỆN ÍCH */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Badge đồng hồ mm:ss / mm:ss */}
          <span className="font-mono text-[11px] sm:text-xs font-bold text-slate-700 bg-slate-100 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl border border-slate-200/90 whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Nút điều chỉnh tốc độ nghe (0.8x, 1.0x, 1.2x, 1.5x) */}
          {showSpeedControl && (
            <button
              type="button"
              onClick={cyclePlaybackSpeed}
              className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shrink-0"
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer shrink-0"
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
