import type { ReactNode } from "react";

export type AdminMetric = {
  label: string;
  value: string;
  trend: string;
  tone?: "primary" | "secondary" | "tertiary" | "neutral";
  icon?: ReactNode;
};

export function AdminPageFrame({
  title,
  subtitle,
  metrics,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  metrics?: AdminMetric[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-7">
      <div className="overflow-hidden rounded-[28px] border border-[rgba(116,118,132,0.12)] bg-[linear-gradient(135deg,#ffffff_0%,#f7f9ff_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-[0_14px_28px_rgba(72,103,255,0.22)]">
              T
            </div>
            <div>
              <div className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Hệ thống TOEIC AI
              </div>
              <h1 className="mt-3 text-[30px] font-bold tracking-[-0.05em] text-[#111827]">{title}</h1>
              {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p> : null}
            </div>
          </div>

          {actions ? <div className="flex flex-wrap items-center gap-2 xl:justify-end">{actions}</div> : null}
        </div>
      </div>

      {metrics && metrics.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const tones: Record<string, string> = {
              primary: "bg-primary-container text-on-primary-container",
              secondary: "bg-[#eef4ff] text-[#2346d5]",
              tertiary: "bg-[#eefbf5] text-[#0d8a5b]",
              neutral: "bg-surface-container text-on-surface",
            };

            return (
              <div
                key={metric.label}
                className="rounded-[22px] border border-[rgba(116,118,132,0.12)] bg-white p-5 shadow-[0_10px_25px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{metric.label}</p>
                    <p className="mt-4 break-words text-[30px] font-bold tracking-[-0.05em] text-slate-900">{metric.value}</p>
                    <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${tones[metric.tone ?? "neutral"]}`}>
                      {metric.trend}
                    </span>
                  </div>
                  {metric.icon ? (
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[metric.tone ?? "neutral"]}`}>
                      {metric.icon}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="space-y-6">{children}</div>
    </div>
  );
}
