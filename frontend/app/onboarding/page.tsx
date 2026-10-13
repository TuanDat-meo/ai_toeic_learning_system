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

const scoreGoals = [450, 600, 750, 900];
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

  useEffect(() => {
    let active = true;

    getLearningOnboardingStatus()
      .then(({ state }) => {
        if (!active) return;
        if (state.completed) {
          router.replace('/dashboard');
          return;
        }
        setForm({
          targetScore: state.targetScore ?? 0,
          examDate: state.examDate,
          learningReason: state.learningReason as OnboardingForm['learningReason'],
          currentLevel: state.currentLevel as OnboardingForm['currentLevel'],
          recentScore: state.recentScore,
          dailyStudyMinutes: state.dailyStudyMinutes,
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
    if (form.targetScore === 0 || form.learningReason === null) return;

    setSaving(true);
    setError('');
    try {
      await completeLearningOnboarding({
        ...form,
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
      await saveLearningOnboardingDraft({
        ...form,
        targetScore: form.targetScore || null,
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
          <div className="hidden items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2 text-xs font-medium text-cyan-200 sm:flex">
            <Sparkles className="size-4" />
            Lộ trình học dành riêng cho bạn
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Bắt đầu hành trình TOEIC</p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Thiết lập mục tiêu học tập</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Cho chúng tôi biết mục tiêu của bạn để xây dựng lộ trình phù hợp nhất.
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
                <h3 className="mb-3 text-sm font-semibold text-slate-200">Bạn muốn đạt bao nhiêu điểm TOEIC?</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {scoreGoals.map((score) => (
                    <ChoiceButton key={score} selected={form.targetScore === score} onClick={() => setForm({ ...form, targetScore: score })} className="py-4 text-base">
                      {score}<span className="ml-1 text-xs font-normal text-slate-400">điểm</span>
                    </ChoiceButton>
                  ))}
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
                  disabled={step === 0 && (form.targetScore === 0 || form.learningReason === null)}
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
                  {saving ? 'Đang lưu...' : 'Lưu mục tiêu & bắt đầu'}
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
