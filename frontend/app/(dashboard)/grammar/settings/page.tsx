"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Settings,
  Target,
  Bell,
  Volume2,
  Type,
  CheckCircle2,
  Save,
} from "lucide-react";
import { GrammarSubpageShell } from "@/components/grammar/GrammarSubpageShell";
import {
  getGrammarUserSettings,
  putGrammarUserSettings,
  type GrammarUserSettings,
} from "@/lib/api/grammar";
import { playUnifiedAnswerSound } from "@/lib/sound";

const DEFAULTS: GrammarUserSettings = {
  dailyTargetMinutes: 20,
  reminderEnabled: true,
  reminderTime: "20:00",
  timezone: "Asia/Ho_Chi_Minh",
  soundEnabled: true,
  fontScale: 100,
};

const GOAL_PRESETS = [15, 20, 30, 45, 60];

export default function GrammarSettingsPage() {
  const [settings, setSettings] = useState<GrammarUserSettings>(DEFAULTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGrammarUserSettings();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải cài đặt học tập.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setError(null);
    setSavedSuccess(false);
    setSaving(true);
    try {
      const updated = await putGrammarUserSettings(settings);
      setSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu cài đặt học tập.");
    } finally {
      setSaving(false);
    }
  };

  const testCorrectSound = () => {
    playUnifiedAnswerSound();
  };

  const testIncorrectSound = () => {
    playUnifiedAnswerSound();
  };

  return (
    <GrammarSubpageShell
      title="Cài Đặt Học Tập Ngữ Pháp"
      description="Tùy chỉnh thời gian mục tiêu hàng ngày, lịch thông báo nhắc học, âm thanh phản hồi và cỡ chữ hiển thị phù hợp với thói quen của bạn."
      icon={<Settings className="h-6 w-6" />}
      action={
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || loading || Boolean(error)}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-4 w-4" />
          {saving ? "Đang lưu..." : "Lưu cài đặt"}
        </button>
      }
    >
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between"
        >
          <span>Lỗi: {error}</span>
          <button type="button" onClick={() => void loadSettings()} className="font-bold underline">
            Tải lại
          </button>
        </div>
      )}

      {savedSuccess && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 animate-in fade-in duration-200"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Đã lưu cài đặt học tập thành công vào tài khoản của bạn!
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6" />
          ))}
        </div>
      ) : !error && settings ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* 1. Daily Target Minutes */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mục tiêu luyện tập hàng ngày</h3>
                <p className="text-xs text-slate-500">Số phút học tập ngữ pháp bạn đặt ra mỗi ngày</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                {GOAL_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSettings({ ...settings, dailyTargetMinutes: m })}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                      settings.dailyTargetMinutes === m
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {m} phút
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={settings.dailyTargetMinutes}
                  onChange={(e) =>
                    setSettings({ ...settings, dailyTargetMinutes: Math.max(5, Number(e.target.value) || 20) })
                  }
                  className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-bold focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-500">phút mỗi ngày (tối đa 240 phút)</span>
              </div>
            </div>
          </div>

          {/* 2. Notification Reminder */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Nhắc nhở học tập</h3>
                  <p className="text-xs text-slate-500">Gửi thông báo nhắc học để duy trì streak</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminderEnabled}
                  onChange={(e) => setSettings({ ...settings, reminderEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Giờ nhắc nhở</label>
                <input
                  type="time"
                  disabled={!settings.reminderEnabled}
                  value={settings.reminderTime || "20:00"}
                  onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold disabled:opacity-40 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Múi giờ</label>
                <input
                  type="text"
                  value={settings.timezone || "Asia/Ho_Chi_Minh"}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Audio & SFX */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Volume2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Âm thanh phản hồi</h3>
                  <p className="text-xs text-slate-500">Phát âm thanh khi làm bài đúng / sai</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            <div className="pt-2">
              <p className="text-xs text-slate-600 mb-2">Nghe thử hiệu ứng âm thanh:</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={testCorrectSound}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                >
                  🔊 Âm thanh đúng
                </button>
                <button
                  type="button"
                  onClick={testIncorrectSound}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                >
                  🔊 Âm thanh sai
                </button>
              </div>
            </div>
          </div>

          {/* 4. Font Scale */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Type className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cỡ chữ hiển thị câu hỏi</h3>
                <p className="text-xs text-slate-500">Tỷ lệ phóng to chữ khi đọc đề thi</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={90}
                  max={130}
                  step={5}
                  value={settings.fontScale || 100}
                  onChange={(e) => setSettings({ ...settings, fontScale: Number(e.target.value) })}
                  className="flex-1 accent-blue-600 cursor-pointer"
                />
                <span className="font-mono text-xs font-bold text-slate-700 w-12 text-right">
                  {settings.fontScale || 100}%
                </span>
              </div>

              {/* Live Preview Box */}
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Xem trước hiển thị:</p>
                <p
                  className="text-slate-800 font-medium leading-relaxed"
                  style={{ fontSize: `${(settings.fontScale || 100) / 100 * 0.875}rem` }}
                >
                  Ms. Carter reviewed the quarterly financial statements before the executive board meeting began.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </GrammarSubpageShell>
  );
}
