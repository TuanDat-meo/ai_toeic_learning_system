"use client";

import { useEffect, useState } from "react";
import { FeatureQuotaUsage, getStudentFeatureUsage } from "@/lib/api/billing";

const FEATURE_LABELS: Record<string, string> = {
  LISTENING: "Nghe",
  VOCABULARY: "Từ vựng",
  GRAMMAR: "Ngữ pháp",
  READING_PRACTICE: "Đọc",
  MOCK_TEST: "Thi thử",
};

const PERIOD_LABELS: Record<FeatureQuotaUsage["period"], string> = {
  DAY: "ngày",
  WEEK: "tuần",
  MONTH: "tháng",
  PLAN_TERM: "thời hạn gói",
};

export function LearningQuotaBadge({ featureKey }: { featureKey: string }) {
  const [quota, setQuota] = useState<FeatureQuotaUsage | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const features = await getStudentFeatureUsage();
        if (mounted) {
          setQuota(features.find((feature) => feature.featureKey === featureKey) ?? null);
          setLoadError(null);
        }
      } catch (error) {
        if (mounted) {
          setQuota(null);
          setLoadError(error instanceof Error ? error.message : "Chưa tải được hạn mức.");
        }
      }
    };

    void refresh();
    window.addEventListener("learning-quota-updated", refresh);
    return () => {
      mounted = false;
      window.removeEventListener("learning-quota-updated", refresh);
    };
  }, [featureKey]);

  if (!quota) {
    return (
      <span
        role="status"
        title={loadError || "Chưa tải hạn mức hoặc chưa có gói học đang hiệu lực."}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700"
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Chưa tải hạn mức
      </span>
    );
  }

  const limitLabel = quota.limit === null ? "∞" : quota.limit.toLocaleString("vi-VN");
  const label = FEATURE_LABELS[featureKey] ?? quota.name;
  const title = quota.limit === null
    ? `${label}: không giới hạn`
    : `${label}: ${quota.used}/${quota.limit} lượt trong ${PERIOD_LABELS[quota.period]}`;
  const usageRatio = quota.limit === null ? 0 : quota.limit > 0 ? quota.used / quota.limit : 1;
  const quotaColor = usageRatio >= 0.8
    ? {
        badge: "border-red-200 bg-red-50 text-red-700",
        dot: "bg-red-500",
      }
    : usageRatio >= 0.6
      ? {
          badge: "border-amber-200 bg-amber-50 text-amber-800",
          dot: "bg-amber-500",
        }
      : {
          badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
          dot: "bg-emerald-500",
        };

  return (
    <span
      role="status"
      aria-label={title}
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${quotaColor.badge}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${quotaColor.dot}`} />
      {label} ({quota.used.toLocaleString("vi-VN")}/{limitLabel})
    </span>
  );
}
