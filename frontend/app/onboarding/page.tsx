'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Heart,
  LoaderCircle,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  completeLearningOnboarding,
  getLearningOnboardingStatus,
  saveLearningOnboardingDraft,
  type LearningOnboardingPayload,
} from '@/lib/api/auth';

type OnboardingForm = Omit<LearningOnboardingPayload, 'learningReason'> & {
  learningReason: LearningOnboardingPayload['learningReason'] | null;
};

const steps = [
  { label: 'Mục tiêu', icon: Target },
  { label: 'Xuất phát', icon: Sparkles },
  { label: 'Thời gian', icon: Clock3 },
  { label: 'Sở thích', icon: Heart },
  { label: 'Xác nhận', icon: Check },
];

const scoreGoals = [450, 550, 650, 750, 850, 900];

function getScoreBandInfo(score: number) {
  if (score <= 0) return null;
  if (score < 450) {
    return {
      band: 'Sơ cấp (CEFR A1 - A2)',
      color: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
      desc: 'Tập trung củng cố phát âm chuẩn, từ vựng nền tảng và ngữ pháp câu đơn.',
    };
  }
  if (score < 550) {
    return {
      band: 'Sơ trung cấp (CEFR B1)',
      color: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
      desc: 'Đạt chuẩn tốt nghiệp Đại học / Cao đẳng, giao tiếp và đọc hiểu văn bản cơ bản.',
    };
  }
  if (score < 650) {
    return {
      band: 'Trung cấp (CEFR B1+)',
      color: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
      desc: 'Tự tin giao tiếp công sở, xử lý email, công việc văn phòng và phỏng vấn doanh nghiệp.',
    };
  }
  if (score < 750) {
    return {
      band: 'Trung cao cấp (CEFR B2)',
      color: 'text-blue-300 border-blue-500/30 bg-blue-500/10',
      desc: 'Làm việc chuyên nghiệp tại doanh nghiệp quốc tế, đàm phán và soạn thảo hợp đồng.',
    };
  }
  if (score < 850) {
    return {
      band: 'Nâng cao (CEFR B2+)',
      color: 'text-purple-300 border-purple-500/30 bg-purple-500/10',
      desc: 'Năng lực ngôn ngữ lưu loát, thuyết trình tự tin, đáp ứng vị trí quản lý đa quốc gia.',
    };
  }
  return {
    band: 'Xuất sắc (CEFR C1)',
    color: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
    desc: 'Thành thạo như người bản ngữ, sử dụng tiếng Anh linh hoạt cho nghiên cứu và giảng dạy.',
  };
}
const reasons: { value: LearningOnboardingPayload['learningReason']; label: string }[] = [
  { value: 'CAREER', label: 'Phát triển sự nghiệp' },
  { value: 'STUDY', label: 'Học tập' },
  { value: 'TRAVEL', label: 'Du lịch' },
  { value: 'PERSONAL', label: 'Mục tiêu cá nhân' },
];
const levels: { value: NonNullable<LearningOnboardingPayload['currentLevel']>; label: string; detail: string }[] = [
  { value: 'BEGINNER', label: 'Mới bắt đầu', detail: 'Tôi muốn xây nền tảng từ đầu' },
  { value: 'INTERMEDIATE', label: 'Đã có căn bản', detail: 'Tôi biết một ít tiếng Anh' },
  { value: 'ADVANCED', label: 'Khá tự tin', detail: 'Tôi muốn cải thiện điểm số' },
];
const durations = [15, 30, 45, 60, 90];
const weekdays = [
  { value: 1, label: 'T2' },
  { value: 2, label: 'T3' },
  { value: 3, label: 'T4' },
  { value: 4, label: 'T5' },
  { value: 5, label: 'T6' },
  { value: 6, label: 'T7' },
  { value: 7, label: 'CN' },
];
const interests: { value: LearningOnboardingPayload['interests'][number]; label: string }[] = [
  { value: 'LISTENING', label: 'Luyện nghe' },
  { value: 'READING', label: 'Luyện đọc' },
  { value: 'VOCABULARY', label: 'Từ vựng' },
  { value: 'GRAMMAR', label: 'Ngữ pháp' },
  { value: 'MOCK_TESTS', label: 'Đề thi thử' },
];

const initialForm: OnboardingForm = {
  targetScore: 0,
  examDate: null,
  learningReason: null,
  currentLevel: null,
  recentScore: null,
  dailyStudyMinutes: null,
  studyDays: [],
  interests: [],
};

function ChoiceButton({
  selected,
  children,
  onClick,
  className = '',
}: {
  selected: boolean;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
        selected
          ? 'border-cyan-400 bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-400/40'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:bg-white/[0.06]'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    let active = true;

    getLearningOnboardingStatus()
      .then(({ state }) => {
        if (!active) return;
        const isEdit = typeof window !== 'undefined' && window.location.search.includes('mode=edit');
        setIsEditMode(isEdit);
        if (state.completed && !isEdit) {
          router.replace('/dashboard');
          return;
        }
        let initialTargetScore = state.targetScore ?? 0;
        let initialDailyMinutes = state.dailyStudyMinutes ?? null;

        try {
          const rawExt = typeof window !== 'undefined' ? localStorage.getItem('toeic_system_extended_settings') : null;
          if (rawExt) {
            const parsed = JSON.parse(rawExt);
            if (!initialTargetScore && parsed.defaultTargetScore) {
              initialTargetScore = Number(parsed.defaultTargetScore);
            }
          }
          const rawBrand = typeof window !== 'undefined' ? localStorage.getItem('toeic_system_branding') : null;
          if (rawBrand) {
            const parsed = JSON.parse(rawBrand);
            if (!initialDailyMinutes && parsed.dailyStudyMinutes) {
              initialDailyMinutes = Number(parsed.dailyStudyMinutes);
            }
          }
        } catch {
          // ignore parsing error
        }

        setForm({
          targetScore: initialTargetScore,
          examDate: state.examDate,
          learningReason: state.learningReason as OnboardingForm['learningReason'],
          currentLevel: state.currentLevel as OnboardingForm['currentLevel'],
          recentScore: state.recentScore,
          dailyStudyMinutes: initialDailyMinutes,
          studyDays: state.studyDays,
          interests: state.interests as OnboardingForm['interests'],
        });
        setStep(Math.min(Math.max(state.currentStep, 0), steps.length - 1));
        setLoadingDraft(false);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Không thể tải mục tiêu đang thiết lập.');
        setLoadingDraft(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  function toggleNumber(values: number[], selected: number) {
    return values.includes(selected) ? values.filter((value) => value !== selected) : [...values, selected];
  }

  function toggleInterest(selected: LearningOnboardingPayload['interests'][number]) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(selected)
        ? current.interests.filter((value) => value !== selected)
        : [...current.interests, selected],
    }));
  }

  async function submit() {
    if (form.targetScore <= 0 || form.learningReason === null) return;

    setSaving(true);
    setError('');
    try {
      const normalizedTargetScore = Math.max(10, Math.min(990, Math.round(form.targetScore / 5) * 5));
      await completeLearningOnboarding({
        ...form,
        targetScore: normalizedTargetScore,
        learningReason: form.learningReason,
        examDate: form.examDate || null,
      });
      router.replace('/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể lưu mục tiêu học tập. Vui lòng thử lại.');
      setSaving(false);
    }
  }

  async function doLater() {
    setSaving(true);
    setError('');
    try {
      const normalizedTargetScore =
        form.targetScore > 0 ? Math.max(10, Math.min(990, Math.round(form.targetScore / 5) * 5)) : null;
      await saveLearningOnboardingDraft({
        ...form,
        targetScore: normalizedTargetScore,
        currentStep: step,
      });
      router.replace('/dashboard');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không thể lưu tiến độ. Vui lòng thử lại.');
      setSaving(false);
    }
  }

  const currentStep = steps[step];

  if (loadingDraft) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b14] text-slate-300">
        <p role="status" className="flex items-center gap-3 text-sm">
          <LoaderCircle className="size-4 animate-spin" /> Đang tải tiến độ thiết lập...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100">
      <header className="border-b border-white/[0.08] bg-[#090e19]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <span className="text-lg font-extrabold tracking-tight text-white">
            TOEIC<span className="text-cyan-400">AI</span>
          </span>
          {isEditMode ? (
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> Trở về Dashboard
            </button>
          ) : (
            <div className="hidden items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2 text-xs font-medium text-cyan-200 sm:flex">
              <Sparkles className="size-4" />
              Lộ trình học dành riêng cho bạn
            </div>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
            {isEditMode ? 'Cập nhật lộ trình TOEIC' : 'Bắt đầu hành trình TOEIC'}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {isEditMode ? 'Cập nhật mục tiêu học tập' : 'Thiết lập mục tiêu học tập'}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            {isEditMode
              ? 'Tùy chỉnh lại điểm số mục tiêu, thời lượng học và sở thích để hệ thống gợi ý bài tập chuẩn xác nhất.'
              : 'Cho chúng tôi biết mục tiêu của bạn để xây dựng lộ trình phù hợp nhất.'}
          </p>
        </div>

        <nav aria-label="Các bước thiết lập" className="mb-8">
          <ol className="flex items-center justify-between">
            {steps.map(({ label, icon: Icon }, index) => (
              <li key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={`flex size-10 items-center justify-center rounded-full border text-sm ${
                      index < step
                        ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                        : index === step
                          ? 'border-cyan-300 bg-cyan-300/10 text-cyan-200 ring-4 ring-cyan-300/10'
                          : 'border-white/10 bg-white/[0.03] text-slate-500'
                    }`}
                  >
                    {index < step ? <Check className="size-4" /> : <Icon className="size-4" />}
                  </span>
                  <span className={`hidden text-xs font-medium sm:block ${index === step ? 'text-cyan-200' : 'text-slate-500'}`}>
                    {label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <span className={`mx-2 mb-5 h-px flex-1 sm:mx-4 ${index < step ? 'bg-cyan-400/70' : 'bg-white/10'}`} />
                )}
              </li>
            ))}
          </ol>
        </nav>

        <section className="rounded-2xl border border-white/[0.09] bg-[#0d1422] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="mb-7 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <currentStep.icon className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-cyan-300">BƯỚC {step + 1} / {steps.length}</p>
              <h2 className="mt-1 text-xl font-bold text-white">{currentStep.label}</h2>
            </div>
          </div>

          {step === 0 && (
            <div className="space-y-7">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">Bạn muốn đạt bao nhiêu điểm TOEIC?</h3>
                  {form.targetScore > 0 && (
                    <span className="text-xs font-semibold text-cyan-300">
                      Mục tiêu: {form.targetScore} điểm
                    </span>
                  )}
                </div>

                {/* Popular score milestones */}
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                  {scoreGoals.map((score) => (
                    <ChoiceButton
                      key={score}
                      selected={form.targetScore === score}
                      onClick={() => setForm({ ...form, targetScore: score })}
                      className="py-3 text-sm"
                    >
                      {score}
                      <span className="ml-0.5 text-xs font-normal text-slate-400">đ</span>
                    </ChoiceButton>
                  ))}
                </div>

                {/* Custom score input card */}
                <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#090e19] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <label htmlFor="custom-target-score" className="block text-xs font-medium text-slate-200">
                        Hoặc tự nhập điểm mục tiêu tùy chỉnh:
                      </label>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Thang điểm từ 10 đến 990 (bội số của 5, ví dụ: 550, 700, 825)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const current = form.targetScore || 450;
                          const next = Math.max(10, current - 5);
                          setForm({ ...form, targetScore: next });
                        }}
                        className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                        title="Giảm 5 điểm"
                      >
                        -5
                      </button>

                      <div className="relative">
                        <input
                          id="custom-target-score"
                          type="number"
                          min={10}
                          max={990}
                          step={5}
                          value={form.targetScore > 0 ? form.targetScore : ''}
                          onChange={(event) => {
                            const val = parseInt(event.target.value, 10);
                            if (isNaN(val)) {
                              setForm({ ...form, targetScore: 0 });
                            } else {
                              const clamped = Math.max(0, Math.min(990, val));
                              setForm({ ...form, targetScore: clamped });
                            }
                          }}
                          onBlur={() => {
                            if (form.targetScore > 0) {
                              const rounded = Math.max(10, Math.min(990, Math.round(form.targetScore / 5) * 5));
                              if (rounded !== form.targetScore) {
                                setForm({ ...form, targetScore: rounded });
                              }
                            }
                          }}
                          placeholder="VD: 550"
                          className="w-28 rounded-lg border border-cyan-500/30 bg-[#0d1422] px-3 py-2 text-center text-base font-bold text-cyan-200 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const current = form.targetScore || 450;
                          const next = Math.min(990, current + 5);
                          setForm({ ...form, targetScore: next });
                        }}
                        className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                        title="Tăng 5 điểm"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  {/* Dynamic target description */}
                  {(() => {
                    const info = getScoreBandInfo(form.targetScore);
                    if (!info) return null;
                    return (
                      <div className={`mt-3 flex items-start gap-2.5 rounded-lg border p-2.5 text-xs ${info.color}`}>
                        <Sparkles className="size-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">{info.band}: </span>
                          <span>{info.desc}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {form.targetScore > 0 && form.targetScore % 5 !== 0 && (
                    <p className="mt-2 text-xs text-amber-300">
                      ⚠️ Điểm TOEIC chuẩn là bội số của 5. Hệ thống sẽ tự động làm tròn thành {Math.round(form.targetScore / 5) * 5} điểm khi lưu.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="exam-date" className="mb-3 block text-sm font-semibold text-slate-200">
                  <CalendarDays className="mr-2 inline size-4 text-cyan-300" />Ngày thi dự kiến <span className="font-normal text-slate-500">(không bắt buộc)</span>
                </label>
                <input
                  id="exam-date"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={form.examDate ?? ''}
                  onChange={(event) => setForm({ ...form, examDate: event.target.value || null })}
                  className="w-full rounded-xl border border-white/10 bg-[#090e19] px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-200">Lý do bạn muốn học TOEIC?</h3>
                <div className="flex flex-wrap gap-2">
                  {reasons.map(({ value, label }) => (
                    <ChoiceButton key={value} selected={form.learningReason === value} onClick={() => setForm({ ...form, learningReason: value })}>
                      {label}
                    </ChoiceButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-200">Bạn đang ở trình độ nào?</h3>
                <div className="grid gap-3">
                  {levels.map(({ value, label, detail }) => (
                    <ChoiceButton key={value} selected={form.currentLevel === value} onClick={() => setForm({ ...form, currentLevel: value })} className="flex w-full flex-col items-start gap-1 text-left">
                      <span>{label}</span><span className="text-xs font-normal text-slate-400">{detail}</span>
                    </ChoiceButton>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="recent-score" className="mb-2 block text-sm font-semibold text-slate-200">
                  Điểm TOEIC gần nhất <span className="font-normal text-slate-500">(nếu đã thi)</span>
                </label>
                <input
                  id="recent-score"
                  type="number"
                  min="0"
                  max="990"
                  step="5"
                  value={form.recentScore ?? ''}
                  onChange={(event) => setForm({ ...form, recentScore: event.target.value ? Number(event.target.value) : null })}
                  placeholder="Ví dụ: 550"
                  className="w-full rounded-xl border border-white/10 bg-[#090e19] px-4 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-7">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-200">Mỗi ngày bạn muốn học bao lâu?</h3>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {durations.map((minutes) => (
                    <ChoiceButton key={minutes} selected={form.dailyStudyMinutes === minutes} onClick={() => setForm({ ...form, dailyStudyMinutes: minutes })}>
                      {minutes}<span className="ml-1 text-xs font-normal text-slate-400">phút</span>
                    </ChoiceButton>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-200">Bạn thường có thể học vào những ngày nào?</h3>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {weekdays.map(({ value, label }) => (
                    <ChoiceButton key={value} selected={form.studyDays.includes(value)} onClick={() => setForm({ ...form, studyDays: toggleNumber(form.studyDays, value) })} className="px-2">
                      {label}
                    </ChoiceButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-200">Bạn muốn tập trung cải thiện nội dung nào?</h3>
              <p className="mb-5 text-sm text-slate-400">Có thể chọn nhiều mục hoặc bỏ qua để thiết lập sau.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {interests.map(({ value, label }) => (
                  <ChoiceButton key={value} selected={form.interests.includes(value)} onClick={() => toggleInterest(value)} className="flex items-center justify-between">
                    {label}
                    {form.interests.includes(value) && <Check className="size-4 text-cyan-300" />}
                  </ChoiceButton>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm leading-6 text-slate-400">Kiểm tra lại thông tin trước khi lưu hồ sơ và bắt đầu học.</p>
              <dl className="divide-y divide-white/[0.08] rounded-xl border border-white/[0.08] bg-[#090e19] px-4">
                <SummaryRow label="Điểm mục tiêu" value={`${form.targetScore} điểm`} />
                <SummaryRow label="Ngày thi" value={form.examDate ? new Date(`${form.examDate}T00:00:00`).toLocaleDateString('vi-VN') : 'Chưa chọn'} />
                <SummaryRow label="Mục đích" value={reasons.find((reason) => reason.value === form.learningReason)?.label ?? 'Chưa chọn'} />
                <SummaryRow label="Trình độ" value={levels.find((level) => level.value === form.currentLevel)?.label ?? 'Chưa chọn'} />
                <SummaryRow label="Điểm gần nhất" value={form.recentScore == null ? 'Chưa cung cấp' : `${form.recentScore} điểm`} />
                <SummaryRow label="Thời gian học" value={form.dailyStudyMinutes == null ? 'Chưa chọn' : `${form.dailyStudyMinutes} phút/ngày`} />
                <SummaryRow label="Ngày học" value={form.studyDays.length ? weekdays.filter((day) => form.studyDays.includes(day.value)).map((day) => day.label).join(', ') : 'Chưa chọn'} />
                <SummaryRow label="Quan tâm" value={form.interests.length ? interests.filter((interest) => form.interests.includes(interest.value)).map((interest) => interest.label).join(', ') : 'Chưa chọn'} />
              </dl>

              {/* Dự kiến Lộ trình cá nhân hóa */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="size-4" />
                  <span>Dự kiến phân bổ mục tiêu học tập hàng ngày</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 text-center">
                  <div className="rounded-lg bg-white/[0.04] p-2.5">
                    <span className="text-[11px] text-slate-400 block">Từ mới / ngày</span>
                    <span className="text-base font-bold text-white font-mono mt-0.5 block">
                      {form.dailyStudyMinutes ? (form.dailyStudyMinutes <= 15 ? '5 - 8' : form.dailyStudyMinutes <= 30 ? '10 - 15' : '15 - 25') : '10'} từ
                    </span>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] p-2.5">
                    <span className="text-[11px] text-slate-400 block">Ôn tập SRS / ngày</span>
                    <span className="text-base font-bold text-white font-mono mt-0.5 block">
                      {form.dailyStudyMinutes ? (form.dailyStudyMinutes <= 15 ? '15 - 20' : form.dailyStudyMinutes <= 30 ? '25 - 30' : '40 - 50') : '20'} từ
                    </span>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] p-2.5 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-400 block">Luyện thi thử</span>
                    <span className="text-base font-bold text-white font-mono mt-0.5 block">1 - 2 đề / tuần</span>
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] text-cyan-200/80 leading-relaxed">
                  Lộ trình chi tiết sẽ được tự động đồng bộ vào Bảng điều khiển và mục tiêu học hàng ngày ngay khi bạn bấm hoàn tất.
                </p>
              </div>
            </div>
          )}

          {error && <p role="alert" className="mt-5 rounded-lg border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 text-sm text-rose-200">{error}</p>}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0 || saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:invisible"
            >
              <ArrowLeft className="size-4" /> Quay lại
            </button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {step < steps.length - 1 && (
                <button
                  type="button"
                  onClick={doLater}
                  disabled={saving}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Làm sau
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((current) => current + 1)}
                  disabled={
                    step === 0 &&
                    (form.targetScore < 10 || form.targetScore > 990 || form.learningReason === null)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  Tiếp tục <ArrowRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-70"
                >
                  {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
                  {saving ? 'Đang lưu...' : isEditMode ? 'Lưu cập nhật & trở về' : 'Lưu mục tiêu & bắt đầu'}
                </button>
              )}
            </div>
          </div>
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          Thông tin của bạn được lưu trong hồ sơ học tập để cá nhân hóa trải nghiệm.
        </p>
      </section>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <dt className="shrink-0 text-sm text-slate-400">{label}</dt>
      <dd className="text-sm font-medium text-slate-100 sm:text-right">{value}</dd>
    </div>
  );
}
