"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as studyTrackerModule from "@/lib/studyTracker";

// Các tiền tố route học tập & rèn luyện chính trong hệ thống
const STUDY_ROUTES = [
  "/listening",
  "/reading",
  "/mock-tests",
  "/grammar",
  "/vocabulary",
];

export function StudentStudyTracker() {
  const pathname = usePathname();
  const pendingSecondsRef = useRef<number>(0);
  const lastActivityTimeRef = useRef<number>(Date.now());
  const pathnameRef = useRef<string>(pathname);
  pathnameRef.current = pathname;

  // Đẩy số giây học tích lũy vào studyTracker an toàn tuyệt đối
  const flushStudyTime = () => {
    if (pendingSecondsRef.current > 0) {
      const sec = pendingSecondsRef.current;
      pendingSecondsRef.current = 0;

      // 1. Kiểm tra hàm addStudySeconds từ module
      const trackerFn = (studyTrackerModule as any)?.addStudySeconds;
      if (typeof trackerFn === "function") {
        try {
          trackerFn(sec);
          return;
        } catch (e) {
          console.warn("Could not call addStudySeconds:", e);
        }
      }

      // 2. Fallback an toàn nếu Turbopack cache đang bị stale
      try {
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("toeic_study_tracker_data");
          if (raw) {
            const data = JSON.parse(raw);
            const now = new Date();
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            if (!data.history) data.history = {};
            if (!data.history[today]) {
              data.history[today] = { date: today, minutesSpent: 0, secondsSpent: 0, completedLessons: 0 };
            }
            const rec = data.history[today];
            rec.secondsSpent = (rec.secondsSpent || 0) + sec;
            const newMins = Math.floor(rec.secondsSpent / 60);
            const diff = newMins - (rec.minutesSpent || 0);
            rec.minutesSpent = newMins;
            if (diff > 0) {
              data.totalMinutesOverall = (data.totalMinutesOverall || 0) + diff;
            }
            data.todayMinutes = newMins;
            data.todaySeconds = rec.secondsSpent;
            localStorage.setItem("toeic_study_tracker_data", JSON.stringify(data));
            window.dispatchEvent(new CustomEvent("toeic-study-tracker-updated", { detail: data }));
          }
        }
      } catch {}
    }
  };

  useEffect(() => {
    // Đánh dấu người dùng đang có tương tác thực tế
    const markActive = () => {
      lastActivityTimeRef.current = Date.now();
    };

    const activityEvents = ["mousemove", "keydown", "pointerdown", "touchstart", "scroll", "click"];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, markActive, { passive: true });
    });

    // Bắt sự kiện phát audio bài nghe TOEIC
    const handleAudioPlay = () => {
      lastActivityTimeRef.current = Date.now();
    };
    window.addEventListener("play", handleAudioPlay, true);

    // Chu kỳ 1 giây kiểm tra và tích lũy thời gian học
    const interval = setInterval(() => {
      const currentPath = pathnameRef.current || "";
      const isStudyPage = STUDY_ROUTES.some((route) => currentPath.startsWith(route));

      // Kiểm tra có đang mở modal luyện tập / phòng thi thử không
      const hasOpenStudyModal = typeof document !== "undefined" && Boolean(
        document.querySelector('[role="dialog"]') ||
        document.querySelector(".fixed.inset-0")
      );

      // Người dùng được tính là đang học nếu:
      // 1. Đang ở trang học tập/luyện tập HOẶC đang mở modal làm bài
      // 2. Có tương tác trong vòng 2 phút (120 giây) HOẶC audio bài nghe đang phát
      const timeSinceLastActivity = Date.now() - lastActivityTimeRef.current;
      const isAudioPlaying = typeof document !== "undefined" && Array.from(document.querySelectorAll("audio")).some((a) => !a.paused);
      const isUserActive = timeSinceLastActivity < 120000 || isAudioPlaying;

      if ((isStudyPage || hasOpenStudyModal) && isUserActive) {
        pendingSecondsRef.current += 1;

        // Cứ mỗi 10 giây học tích cực thì lưu vào localStorage và cập nhật thời gian
        if (pendingSecondsRef.current >= 10) {
          flushStudyTime();
        }
      }
    }, 1000);

    // Khi người dùng chuyển tab hoặc ẩn trình duyệt -> flush ngay
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushStudyTime();
      } else {
        lastActivityTimeRef.current = Date.now();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Khi người dùng đóng hoặc tải lại trang -> flush ngay
    const handleBeforeUnload = () => {
      flushStudyTime();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      flushStudyTime();
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, markActive);
      });
      window.removeEventListener("play", handleAudioPlay, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Khi chuyển trang (ví dụ từ bài nghe / thi thử quay về dashboard) -> lưu ngay lập tức
  useEffect(() => {
    flushStudyTime();
  }, [pathname]);

  return null;
}
