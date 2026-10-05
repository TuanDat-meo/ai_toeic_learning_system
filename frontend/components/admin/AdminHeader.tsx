"use client";

import { startTransition, useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Clock3,
  LockKeyhole,
  LogOut,
  Menu,
  Mail,
  Search,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

type AdminProfile = {
  name: string;
  email: string;
};

type ActivityEntry = {
  id: string;
  action: string;
  detail: string;
  createdAt: string;
};

const PROFILE_KEY = "toeic-admin-profile";
const ACTIVITY_KEY = "toeic-admin-activity";

const defaultProfile: AdminProfile = {
  name: "Quản trị viên",
  email: "admin@toeic-ai.vn",
};

const pageNames: Record<string, string> = {
  "/admin": "Trang quản trị",
  "/admin/overview": "Bảng điều khiển",
  "/admin/content/vocabulary": "Quản lý từ vựng",
  "/admin/content/grammar": "Quản lý ngữ pháp",
  "/admin/content/listening": "Quản lý Listening",
  "/admin/content/reading": "Quản lý Reading",
  "/admin/content/questions": "Ngân hàng câu hỏi",
  "/admin/content/mock-tests": "Đề thi thử",
  "/admin/support/reports": "Phản hồi & Báo lỗi",
  "/admin/support/announcements": "Quản lý Thông báo",
  "/admin/billing/subscriptions": "Quản lý Gói cước",
  "/admin/billing/transactions": "Lịch sử Giao dịch",
  "/admin/ai-review": "Kiểm duyệt AI",
  "/admin/data/import": "Quản lý dữ liệu",
  "/admin/users": "Quản lý người dùng",
  "/admin/settings": "Cài đặt hệ thống",
  "/admin/analytics": "Phân tích dữ liệu",
  "/admin/recommendation": "Đề xuất học tập",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0]?.toLocaleUpperCase() ?? "")
    .join("");
}

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
}

function readActivities(): ActivityEntry[] {
  try {
    const stored = localStorage.getItem(ACTIVITY_KEY);
    const entries: unknown = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(entries)) return [];

    return entries.filter(
      (entry): entry is ActivityEntry =>
        typeof entry?.id === "string" &&
        typeof entry?.action === "string" &&
        typeof entry?.detail === "string" &&
        typeof entry?.createdAt === "string",
    );
  } catch {
    return [];
  }
}

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState(defaultProfile);
  const [draft, setDraft] = useState(defaultProfile);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<"profile" | "security" | "activity" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = normalizeSearch(searchQuery.trim());
  const searchResults = normalizedQuery
    ? Object.entries(pageNames)
        .filter(([href, label]) => normalizeSearch(`${label} ${href}`).includes(normalizedQuery))
        .slice(0, 6)
    : [];

  useEffect(() => {
    let savedProfile = defaultProfile;
    try {
      const storedProfile = localStorage.getItem(PROFILE_KEY);
      if (storedProfile) {
        const parsed: unknown = JSON.parse(storedProfile);
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "name" in parsed &&
          typeof parsed.name === "string" &&
          "email" in parsed &&
          typeof parsed.email === "string"
        ) {
          savedProfile = { name: parsed.name, email: parsed.email };
        }
      }
    } catch {
      localStorage.removeItem(PROFILE_KEY);
    }

    const savedActivities = readActivities();
    startTransition(() => {
      setProfile(savedProfile);
      setDraft(savedProfile);
      setActivities(savedActivities);
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const pageName = pageNames[pathname] ?? "Khu vực quản trị";
    recordActivity("Truy cập trang", pageName);
  }, [isReady, pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }

      if (event.key === "Escape") setSearchOpen(false);
    }

    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  function recordActivity(action: string, detail: string) {
    const current = readActivities();
    const lastEntry = current[0];
    if (
      lastEntry?.action === action &&
      lastEntry.detail === detail &&
      Date.now() - new Date(lastEntry.createdAt).getTime() < 2000
    ) {
      setActivities(current);
      return;
    }

    const next = [
      { id: crypto.randomUUID(), action, detail, createdAt: new Date().toISOString() },
      ...current,
    ].slice(0, 30);

    try {
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next));
    } catch {
      // Keep the current session usable when browser storage is unavailable.
    }
    setActivities(next);
  }

  function openProfile() {
    setDraft(profile);
    setMenuOpen(false);
    setDialog("profile");
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const updated = { name: draft.name.trim(), email: draft.email.trim() };
    setProfile(updated);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    } catch {
      // Keep the updated profile visible for this session.
    }
    recordActivity("Cập nhật hồ sơ", updated.name);
    setDialog(null);
  }

  function openActivity() {
    setActivities(readActivities());
    setMenuOpen(false);
    setDialog("activity");
  }

  function openSecurity() {
    setMenuOpen(false);
    setDialog("security");
  }

  function logout() {
    recordActivity("Đăng xuất", profile.email);
    ["accessToken", "refreshToken", "token", "authToken", "currentUser", "auth"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    router.replace("/login");
  }

  function openSearchResult(href: string) {
    setSearchQuery("");
    setSearchOpen(false);
    searchInputRef.current?.blur();
    router.push(href);
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl md:h-[76px] md:gap-6 md:px-8">
        <button
          type="button"
          aria-label="Mở điều hướng"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1 md:flex-none md:w-56">
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 md:block">Admin workspace</p>
          <h1 className="truncate text-sm font-semibold text-slate-900 md:mt-1 md:text-base">
            {pageNames[pathname] ?? "Khu vực quản trị"}
          </h1>
        </div>

        <div className="hidden w-full max-w-xl flex-1 items-center lg:flex">
          <label className="sr-only" htmlFor="admin-search">Tìm kiếm hệ thống</label>
          <div className="relative w-full">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              id="admin-search"
              type="search"
              placeholder="Tìm kiếm hệ thống..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && searchResults[0]) {
                  event.preventDefault();
                  openSearchResult(searchResults[0][0]);
                }
              }}
              aria-label="Tìm nhanh trang quản trị"
              aria-controls="admin-search-results"
              aria-autocomplete="list"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-20 text-sm text-on-surface placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">Ctrl K</kbd>
            {searchOpen && normalizedQuery ? (
              <div id="admin-search-results" role="listbox" aria-label="Kết quả tìm kiếm" className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                {searchResults.length > 0 ? searchResults.map(([href, label]) => (
                  <button
                    key={href}
                    type="button"
                    role="option"
                    aria-selected={pathname === href}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => openSearchResult(href)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 aria-selected:bg-blue-50 aria-selected:text-blue-700"
                  >
                    <span>{label}</span>
                    <span className="ml-4 text-[11px] text-slate-400">{href}</span>
                  </button>
                )) : (
                  <p className="px-3 py-4 text-center text-sm text-slate-500">Không tìm thấy trang phù hợp.</p>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center">
          <div className="relative">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 text-left transition-colors hover:bg-slate-50 md:pr-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dce8ff] text-xs font-bold text-[#2346a8]">
                {getInitials(profile.name) || "AD"}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-36 truncate text-xs font-semibold text-on-surface">{profile.name}</span>
                <span className="block text-[10px] text-on-surface-variant">Quản trị viên</span>
              </span>
              <ChevronDown aria-hidden="true" className="h-4 w-4 text-on-surface-variant" />
            </button>

            {menuOpen ? (
              <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="border-b border-slate-100 px-4 py-3.5">
                  <p className="text-sm font-semibold text-slate-900">Quản trị viên</p>
                  <p className="mt-1.5 flex items-center gap-2 truncate text-xs text-slate-500">
                    <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                    {profile.email}
                  </p>
                </div>
                <div className="p-1.5">
                  <button role="menuitem" type="button" onClick={openProfile} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">
                    <UserRound aria-hidden="true" className="h-4 w-4 text-slate-500" />
                    Hồ sơ cá nhân
                  </button>
                  <button role="menuitem" type="button" onClick={openSecurity} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">
                    <LockKeyhole aria-hidden="true" className="h-4 w-4 text-slate-500" />
                    Bảo mật
                  </button>
                  <button role="menuitem" type="button" onClick={openActivity} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">
                    <Clock3 aria-hidden="true" className="h-4 w-4 text-slate-500" />
                    Lịch sử thao tác
                    {activities.length > 0 ? <span className="ml-auto text-xs text-slate-400">{activities.length}</span> : null}
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button role="menuitem" type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50">
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {dialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDialog(null);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title" className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Tài khoản quản trị</p>
                <h2 id="admin-dialog-title" className="mt-1 text-lg font-semibold text-slate-900">
                  {dialog === "profile" ? "Hồ sơ cá nhân" : dialog === "security" ? "Bảo mật" : "Lịch sử thao tác"}
                </h2>
              </div>
              <button type="button" aria-label="Đóng" onClick={() => setDialog(null)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            {dialog === "profile" ? (
              <form onSubmit={saveProfile} className="space-y-4 p-5">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dce8ff] text-sm font-bold text-[#2346a8]">
                    {getInitials(profile.name) || "AD"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Quản trị viên</p>
                    <p className="mt-0.5 text-xs text-slate-500">Thông tin hiển thị trong không gian quản trị</p>
                  </div>
                </div>
                <label className="block text-sm font-medium text-slate-700">
                  Họ và tên
                  <input required maxLength={80} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <input required maxLength={120} type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setDialog(null)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Hủy</button>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                    <Save aria-hidden="true" className="h-4 w-4" /> Lưu hồ sơ
                  </button>
                </div>
              </form>
            ) : dialog === "security" ? (
              <div className="space-y-4 p-5">
                <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">Phiên quản trị hiện tại</p>
                    <p className="mt-1 text-xs leading-5 text-emerald-800">Thông tin phiên được lưu trên trình duyệt này. Đăng xuất sẽ xóa các khóa phiên đã lưu.</p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">Tài khoản</p>
                  <p className="mt-1 truncate text-sm font-medium text-slate-800">{profile.email}</p>
                </div>
                <div className="flex justify-end border-t border-slate-100 pt-4">
                  <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                    <LogOut aria-hidden="true" className="h-4 w-4" /> Đăng xuất thiết bị này
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto p-5">
                {activities.length > 0 ? (
                  <ol className="space-y-0">
                    {activities.map((entry, index) => (
                      <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
                        {index < activities.length - 1 ? <span aria-hidden="true" className="absolute left-[7px] top-4 h-full w-px bg-slate-200" /> : null}
                        <span className="relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-blue-500 bg-white" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800">{entry.action}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">{entry.detail}</p>
                          <time dateTime={entry.createdAt} className="mt-1 block text-[11px] text-slate-400">
                            {new Date(entry.createdAt).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}
                          </time>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="py-8 text-center">
                    <Clock3 aria-hidden="true" className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-3 text-sm font-medium text-slate-700">Chưa có thao tác nào</p>
                    <p className="mt-1 text-xs text-slate-500">Các lần truy cập và cập nhật hồ sơ sẽ xuất hiện tại đây.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}