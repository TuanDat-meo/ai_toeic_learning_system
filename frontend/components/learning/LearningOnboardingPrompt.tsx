'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { getLearningOnboardingStatus } from '@/lib/api/auth';

export function LearningOnboardingPrompt() {
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    getLearningOnboardingStatus()
      .then((res) => {
        if (active && res?.state) {
          setOnboardingStep(res.state.completed ? null : (res.state.currentStep || 0) + 1);
        }
      })
      .catch(() => {
        // Silently hide prompt if onboarding status service is unavailable
        if (active) setOnboardingStep(null);
      });

    return () => {
      active = false;
    };
  }, []);

  if (onboardingStep === null) return null;

  return (
    <section
      aria-labelledby="onboarding-prompt-title"
      className="flex flex-col gap-5 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 sm:flex-row sm:items-center sm:gap-6 sm:px-7 sm:py-6"
    >
      <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
        <GraduationCap className="size-9" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="onboarding-prompt-title" className="text-lg font-bold text-on-surface">
          Hoàn thiện mục tiêu học tập ({onboardingStep}/5)
        </h2>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
          Cho TOEIC AI biết điểm mục tiêu, điểm hiện tại và ngày thi để theo dõi tiến độ ngay trên trang chủ. Mất khoảng 2 phút.
        </p>
      </div>
      <Link
        href="/onboarding"
        className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:brightness-110"
      >
        Tiếp tục <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
