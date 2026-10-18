"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Database,
  RefreshCw,
  Server,
  Users,
} from "lucide-react";
import { getAdminDashboard, type AdminDashboard } from "@/lib/api/admin";
import { getReports, type SupportReport } from "@/lib/api/support";

const reportStatusLabel: Record<SupportReport["status"], string> = {
  PENDING: "Chờ xử lý",
  IN_PROGRESS: "Đang xử lý",
  RESOLVED: "Đã xử lý",
  REJECTED: "Đã từ chối",
};

const priorityStyle: Record<SupportReport["priority"], string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-sky-100 text-sky-800",
  HIGH: "bg-amber-100 text-amber-800",
  URGENT: "bg-rose-100 text-rose-800",
};

const priorityLabel: Record<SupportReport["priority"], string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  URGENT: "Khẩn cấp",
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Không rõ ngày"
    : new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
};

export function AdminOverviewDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [reports, setReports] = useState<SupportReport[] | null>(null);
  const [dashboardError, setDashboardError] = useState("");
  const [reportsError, setReportsError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setDashboardError("");
    setReportsError("");
    const [dashboardResult, reportsResult] = await Promise.allSettled([
      getAdminDashboard(),
      getReports(),
    ]);

    if (dashboardResult.status === "fulfilled") setDashboard(dashboardResult.value);
    else setDashboardError(dashboardResult.reason instanceof Error ? dashboardResult.reason.message : "Không tải được số liệu tổng quan.");

    if (reportsResult.status === "fulfilled") setReports(reportsResult.value);
    else setReportsError(reportsResult.reason instanceof Error ? reportsResult.reason.message : "Không tải được báo cáo của người dùng.");

    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  const summary = dashboard?.summary;
  const openReports = reports?.filter((report) => report.status === "PENDING" || report.status === "IN_PROGRESS") ?? [];
  const openSystemBugs = openReports.filter((report) => report.category === "SYSTEM_BUG");
  const urgentReports = openReports.filter((report) => report.priority === "URGENT" || report.priority === "HIGH");
  const recentReports = [...(reports ?? [])]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5);
  const registrations = summary?.weeklyRegistrations ?? [];
  const maxRegistrations = Math.max(1, ...registrations.map((day) => day.count));
  const recentImports = summary?.recentImports ?? [];

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm">
        <div className="relative grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="pointer-events-none absolute -right-12 -top-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Tổng quan vận hành</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Bảng điều khiển</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Theo dõi học viên, nội dung, báo lỗi và tình trạng dịch vụ từ dữ liệu hệ thống hiện có.
            </p>
          </div>
          <div className="relative flex flex-wrap items-center gap-3">
            <SystemStatus label="API" status={dashboard?.system.api} />
            <SystemStatus label="Cơ sở dữ liệu" status={dashboard?.system.database} />
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              Làm mới
            </button>
          </div>
        </div>
      </header>

      {dashboardError ? <LoadError message={dashboardError} onRetry={() => void loadData()} /> : null}

      <section aria-label="Chỉ số chính" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Học viên đang hoạt động"
          value={summary ? summary.activeStudents.toLocaleString("vi-VN") : "—"}
          detail={summary ? `+${summary.newStudentsLast7Days.toLocaleString("vi-VN")} đăng ký trong 7 ngày` : "Chưa có dữ liệu"}
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
          tone="blue"
        />
        <MetricCard
          label="Báo cáo chưa đóng"
          value={reports ? openReports.length.toLocaleString("vi-VN") : "—"}
          detail={reports ? `${openSystemBugs.length} báo lỗi hệ thống đang mở` : "Chưa có dữ liệu"}
          icon={<AlertCircle className="h-5 w-5" aria-hidden="true" />}
          tone="amber"
        />
        <MetricCard
          label="Ưu tiên cao / khẩn cấp"
          value={reports ? urgentReports.length.toLocaleString("vi-VN") : "—"}
          detail={reports ? "Báo cáo cần được chú ý sớm" : "Chưa có dữ liệu"}
          icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
          tone={urgentReports.length > 0 ? "rose" : "green"}
        />
        <MetricCard
          label="Nội dung chờ kiểm duyệt"
          value={summary ? summary.pendingReviews.toLocaleString("vi-VN") : "—"}
          detail={summary ? `${summary.failedImportBatchesLast7Days} lô nhập lỗi trong 7 ngày` : "Chưa có dữ liệu"}
          icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
          tone="violet"
        />
      </section>

      {reportsError ? <LoadError message={reportsError} onRetry={() => void loadData()} /> : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.8fr)]">
        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <h2 className="font-semibold text-slate-900">Đăng ký học viên</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">Số tài khoản mới theo ngày · 7 ngày gần nhất</p>
            </div>
            <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">
              Danh sách học viên <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {summary ? registrations.length > 0 ? (
            <div className="mt-7 flex h-48 items-end gap-2 sm:gap-4" role="img" aria-label="Biểu đồ số đăng ký học viên trong 7 ngày">
              {registrations.map((day) => {
                const height = Math.max(6, (day.count / maxRegistrations) * 100);
                const date = new Date(`${day.date}T00:00:00`);
                const label = Number.isNaN(date.getTime())
                  ? day.date
                  : new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "numeric" }).format(date);
                return (
                  <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-xs font-semibold tabular-nums text-slate-600">{day.count}</span>
                    <div className="flex h-32 w-full items-end rounded-t-lg bg-slate-50">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-blue-700 to-blue-500 transition-[height]"
                        style={{ height: `${height}%` }}
                        title={`${day.count} đăng ký`}
                      />
                    </div>
                    <span className="truncate text-[11px] text-slate-500">{label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyPanel message="Chưa có số liệu đăng ký trong khoảng thời gian này." />
          ) : loading ? (
            <LoadingPanel />
          ) : (
            <EmptyPanel message="Không thể hiển thị biểu đồ khi chưa tải được dữ liệu tổng quan." />
          )}
          {summary ? (
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
              <SmallStat label="Từ vựng" value={`${summary.publishedVocabularies}/${summary.totalVocabularies}`} />
              <SmallStat label="Bài đọc" value={`${summary.publishedReadingPassages}/${summary.totalReadingPassages}`} />
              <SmallStat label="Lô nhập · 7 ngày" value={summary.importsLast7Days.toLocaleString("vi-VN")} />
              <SmallStat label="Chờ kiểm duyệt" value={summary.pendingReviews.toLocaleString("vi-VN")} />
            </div>
          ) : null}
        </article>

        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                <h2 className="font-semibold text-slate-900">Hàng đợi hỗ trợ</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">Phản hồi và lỗi do học viên gửi</p>
            </div>
            <Link href="/admin/support/reports" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">
              Mở hàng đợi <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {reports ? (
            <div className="mt-5 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <TicketCount label="Đang mở" count={openReports.length} style="bg-amber-50 text-amber-800" />
                <TicketCount label="Lỗi hệ thống" count={openSystemBugs.length} style="bg-rose-50 text-rose-800" />
                <TicketCount label="Cần ưu tiên" count={urgentReports.length} style="bg-violet-50 text-violet-800" />
              </div>
              {recentReports.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {recentReports.slice(0, 4).map((report) => (
                    <li key={report.id} className="py-3 first:pt-1">
                      <Link href="/admin/support/reports" className="group block min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <span className="min-w-0 break-words text-sm font-semibold text-slate-800 group-hover:text-blue-700">{report.title}</span>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${priorityStyle[report.priority]}`}>{priorityLabel[report.priority]}</span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                          <span>{report.userName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{reportStatusLabel[report.status]}</span>
                          <span aria-hidden="true">·</span>
                          <time dateTime={report.createdAt}>{formatDate(report.createdAt)}</time>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyPanel message="Chưa có báo cáo nào từ học viên." />
              )}
            </div>
          ) : loading ? (
            <LoadingPanel />
          ) : (
            <EmptyPanel message="Không thể hiển thị hàng đợi hỗ trợ." />
          )}
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="h-5 w-5 text-violet-600" aria-hidden="true" />
                <h2 className="font-semibold text-slate-900">Nhập dữ liệu gần đây</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">Tình trạng các lô nhập nội dung mới nhất</p>
            </div>
            <Link href="/admin/data/import" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">
              Quản lý dữ liệu <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {summary ? recentImports.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr>
                    <th className="pb-2 font-medium">Tệp</th>
                    <th className="pb-2 font-medium">Trạng thái</th>
                    <th className="pb-2 text-right font-medium">Thành công / tổng</th>
                    <th className="pb-2 text-right font-medium">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentImports.slice(0, 5).map((item) => (
                    <tr key={`${item.fileName}-${item.createdAt}`}>
                      <td className="max-w-52 truncate py-3 pr-3 font-medium text-slate-800" title={item.fileName}>{item.fileName}</td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${item.failedCount > 0 ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>
                          {item.failedCount > 0 ? <AlertTriangle size={12} aria-hidden="true" /> : <CheckCircle2 size={12} aria-hidden="true" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 text-right tabular-nums text-slate-600">{item.successCount}/{item.totalRecords}</td>
                      <td className="py-3 text-right text-xs text-slate-500">{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyPanel message="Chưa có lô nhập dữ liệu gần đây." />
          ) : loading ? (
            <LoadingPanel />
          ) : (
            <EmptyPanel message="Không thể tải lịch sử nhập dữ liệu." />
          )}
        </article>

        <article className="min-w-0 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <h2 className="font-semibold text-slate-900">Tiến độ & thành tích học tập</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Hiện hệ thống chưa lưu hoạt động luyện tập và thành tích lên máy chủ. Các tiến độ trên giao diện học viên đang lưu cục bộ trên thiết bị nên quản trị viên chưa thể xem tổng hợp đáng tin cậy.
          </p>
          <div className="mt-4 rounded-xl border border-blue-100 bg-white/80 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-800">Chưa có dữ liệu backend</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />Thời lượng học, bài hoàn thành và mức độ hoạt động</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />Điểm tiến bộ theo kỹ năng và kết quả bài thi</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />Chuỗi ngày học và thành tích đạt được</li>
            </ul>
          </div>
          <Link href="/admin/users" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:text-blue-950">
            Xem tài khoản học viên <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </article>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>Chỉ số được lấy từ API hiện có; các trường chưa được thu thập sẽ không hiển thị dưới dạng 0.</span>
        {dashboard?.generatedAt ? <span>Cập nhật lúc {formatDate(dashboard.generatedAt)}</span> : null}
      </footer>
    </div>
  );
}

function MetricCard({ label, value, detail, icon, tone }: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone: "blue" | "amber" | "rose" | "green" | "violet";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    green: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

function SystemStatus({ label, status }: { label: string; status?: "UP" | "DOWN" }) {
  const connected = status === "UP";
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100">
      {label === "API" ? <Server size={14} aria-hidden="true" /> : <Database size={14} aria-hidden="true" />}
      <span>{label}</span>
      <span className={`h-2 w-2 rounded-full ${status ? connected ? "bg-emerald-400" : "bg-rose-400" : "bg-slate-400"}`} />
      <span className="sr-only">{status ? connected ? "Đang hoạt động" : "Đang gián đoạn" : "Chưa có trạng thái"}</span>
    </span>
  );
}

function TicketCount({ label, count, style }: { label: string; count: number; style: string }) {
  return (
    <div className={`min-w-0 rounded-xl px-3 py-3 ${style}`}>
      <p className="break-words text-[11px] font-semibold leading-4">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{count}</p>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold tabular-nums text-slate-800">{value}</p>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div role="status" className="mt-5 flex min-h-24 items-center justify-center gap-2 text-sm text-slate-500">
      <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> Đang tải dữ liệu…
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return <p className="mt-5 rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">{message}</p>;
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <span className="break-words">{message}</span>
      <button type="button" onClick={onRetry} className="shrink-0 font-semibold underline">Thử tải lại</button>
    </div>
  );
}
