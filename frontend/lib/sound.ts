/**
 * Unified Sound Effects System for TOEIC Learning Platform
 * Cung cấp một âm thanh phản hồi duy nhất, êm tai, chuẩn UX khi người dùng chọn đáp án hoặc tương tác.
 */

let sharedAudioCtx: AudioContext | null = null;

export function playUnifiedAnswerSound(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtxClass) return;

    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioCtxClass();
    }

    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }

    const ctx = sharedAudioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Tần số 587.33 Hz (Note D5) - âm thanh êm dịu, thanh thoát, phản hồi bấm nhẹ nhàng chuẩn UX
    osc.frequency.setValueAtTime(587.33, now);

    // Fade out mượt mà, không gắt, không méo tiếng, âm lượng nhẹ nhàng 0.08
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // Bỏ qua lỗi audio nếu trình duyệt chưa cấp quyền
  }
}

/**
 * Hàm phát âm thanh hiệu ứng duy nhất cho toàn bộ hệ thống:
 * Dù chọn đúng, sai hay bấm chuyển câu, toàn bộ hệ thống đều dùng chung một âm thanh phản hồi duy nhất.
 */
export function playSfx(_type?: string): void {
  playUnifiedAnswerSound();
}
