'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { getLearningOnboardingStatus } from '@/lib/api/auth';

export function LearningOnboardingPrompt() {
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getLearningOnboardingStatus()
      .then(({ state }) => {
        if (active) setOnboardingStep(state.completed ? null : state.currentStep + 1);
      })
      .catch((statusError: unknown) => {
        if (active) {
          setError(statusError instanceof Error ? statusError.message : 'Không thể tải trạng thái mục tiêu học tập.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-error/30 bg-error-container px-5 py-4 text-sm text-on-error-container">
        {error}
      </p>
    );
  }
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
          Cho Đậu TOEIC biết điểm mục tiêu, điểm hiện tại và ngày thi để theo dõi tiến độ ngay trên trang chủ. Mất khoảng 2 phút.
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
