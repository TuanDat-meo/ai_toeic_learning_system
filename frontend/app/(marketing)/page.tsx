'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingBrand } from '@/components/marketing/MarketingBrand';
import { RoadmapPlanner } from '@/components/marketing/RoadmapPlanner';
import { LoginModal } from '@/components/auth/LoginModal';
import {
  describePlanEntitlements,
  getAvailableLearningFeatures,
  getAvailableLearningPlans,
  type LearningFeature,
  type SubscriptionPlan,
} from '@/lib/api/billing';
import { GoogleAuthErrorModal } from '@/components/auth/GoogleAuthErrorModal';

const learningSteps = [
  ['01', 'Đánh giá đầu vào', 'Xác định trình độ và mục tiêu điểm của bạn.'],
  ['02', 'Nhận lộ trình riêng', 'Ưu tiên đúng kỹ năng cần cải thiện nhất.'],
  ['03', 'Theo dõi tiến bộ', 'Điều chỉnh kế hoạch sau mỗi lần luyện tập.'],
];

const planCategoryOrder: Record<SubscriptionPlan['planCategory'], number> = {
  FREE: 0,
  PRO: 1,
  PREMIUM: 2,
  PROMOTION: 3,
};

const planCategoryStyles: Record<SubscriptionPlan['planCategory'], {
  card: string;
  badge: string;
  description: string;
  price: string;
  duration: string;
  benefit: string;
  button: string;
}> = {
  FREE: {
    card: 'border-emerald-200 bg-gradient-to-b from-emerald-50 to-white shadow-emerald-100/70',
    badge: 'bg-emerald-100 text-emerald-800',
    description: 'text-emerald-900/70',
    price: 'text-emerald-800',
    duration: 'text-emerald-900/65',
    benefit: 'text-emerald-700',
    button: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  PRO: {
    card: 'border-blue-300 bg-gradient-to-b from-blue-50 to-white shadow-blue-100/70',
    badge: 'bg-blue-100 text-blue-800',
    description: 'text-blue-900/70',
    price: 'text-blue-800',
    duration: 'text-blue-900/65',
    benefit: 'text-blue-700',
    button: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  PREMIUM: {
    card: 'border-violet-700 bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 text-white shadow-violet-300/40',
    badge: 'bg-violet-300/20 text-violet-100',
    description: 'text-violet-100/75',
    price: 'text-white',
    duration: 'text-violet-100/70',
    benefit: 'text-violet-100',
    button: 'bg-white text-violet-900 hover:bg-violet-100',
  },
  PROMOTION: {
    card: 'border-amber-300 bg-gradient-to-b from-amber-50 via-orange-50 to-white shadow-amber-100/70',
    badge: 'bg-amber-200 text-amber-900',
    description: 'text-amber-950/70',
    price: 'text-orange-800',
    duration: 'text-amber-950/65',
    benefit: 'text-amber-800',
    button: 'bg-amber-600 text-white hover:bg-amber-700',
  },
};

function LoginQueryTrigger({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('login') === 'true' || window.location.hash === '#login') {
      onOpen();
    }
  }, [searchParams, onOpen]);
  return null;
}

function GoogleAuthErrorQueryTrigger({ onErrorChange }: { onErrorChange: (errorCode: string | null) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onErrorChange(searchParams.get('authError'));
  }, [searchParams, onErrorChange]);
  return null;
}

export default function LandingPage() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [learningPlans, setLearningPlans] = useState<SubscriptionPlan[]>([]);
  const [featureCatalog, setFeatureCatalog] = useState<LearningFeature[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(false);
  const [featuresError, setFeaturesError] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const loadLearningData = useCallback(async () => {
    setPlansLoading(true);
    setPlansError(false);
    setFeaturesError(false);
    const [plansResult, featuresResult] = await Promise.allSettled([
      getAvailableLearningPlans(),
      getAvailableLearningFeatures(),
    ]);
    if (plansResult.status === 'fulfilled') setLearningPlans(plansResult.value);
    else setPlansError(true);
    if (featuresResult.status === 'fulfilled') setFeatureCatalog(featuresResult.value);
    else setFeaturesError(true);
    setPlansLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([getAvailableLearningPlans(), getAvailableLearningFeatures()])
      .then(([plansResult, featuresResult]) => {
        if (cancelled) return;
        if (plansResult.status === 'fulfilled') setLearningPlans(plansResult.value);
        else setPlansError(true);
        if (featuresResult.status === 'fulfilled') setFeatureCatalog(featuresResult.value);
        else setFeaturesError(true);
      })
      .finally(() => {
        if (!cancelled) setPlansLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    router.replace('/', { scroll: false });
  }, [router]);

  const closeGoogleAuthError = useCallback(() => {
    setGoogleAuthError(null);
    router.replace('/', { scroll: false });
  }, [router]);

  const displayedPlans = [...learningPlans]
    .sort((first, second) => planCategoryOrder[first.planCategory] - planCategoryOrder[second.planCategory])
    .slice(0, 4);

  return (
    <div className="marketing-page min-h-screen flex flex-col bg-surface font-sans">
      <Suspense fallback={null}>
        <LoginQueryTrigger onOpen={openLoginModal} />
        <GoogleAuthErrorQueryTrigger onErrorChange={setGoogleAuthError} />
      </Suspense>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4">
        <MarketingBrand />
        <MarketingNav />
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 font-label-md text-label-md font-semibold text-on-surface transition-colors hover:bg-slate-100 hover:text-primary sm:px-4"
          >
            <span>Đăng nhập</span>
          </button>
          <Link href="/register" className="marketing-button inline-flex h-10 items-center justify-center rounded-lg bg-primary px-3.5 font-label-md text-label-md font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-container sm:px-5">
            <span className="hidden sm:inline">Đăng ký học</span>
            <span className="sm:hidden">Đăng ký</span>
          </Link>
        </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section id="home" className="relative px-4 py-16 sm:px-6 sm:py-20 lg:py-5 flex flex-col items-center text-center overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/50 border border-secondary-container text-on-secondary-fixed font-label-sm text-label-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Hệ thống TOEIC AI thế hệ mới ra mắt
          </div>
          
          <h1 className="max-w-4xl font-display text-[32px] leading-[40px] sm:text-display sm:leading-[44px] md:text-[52px] md:leading-[60px] font-bold tracking-tight text-on-surface mb-6">
            Làm chủ TOEIC với Lộ trình <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Cá nhân hóa bằng AI</span>
          </h1>
          
          <p className="max-w-xl font-body-lg text-body-lg text-on-surface-variant mb-8 sm:mb-10">
            Nền tảng đầu tiên ứng dụng mô hình Bayesian Knowledge Tracing và Generative AI để theo dõi chính xác lỗ hổng kiến thức, giúp bạn đạt mục tiêu nhanh hơn gấp 3 lần.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/register" className="marketing-button w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2 bg-primary text-white rounded-xl font-label-md text-label-md font-medium hover:bg-primary-container hover:text-on-primary-container transition-all shadow-lg shadow-primary/25">
              <span>Đăng ký học ngay</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <a href="#demo" className="marketing-button w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2 bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl font-label-md text-label-md font-medium hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined text-[18px] text-tertiary">groups</span>
              <span>Xem thành tích học viên</span>
            </a>
          </div>
        </section>

        {/* Community Results */}
        <section id="demo" className="px-4 pb-16 sm:px-6 sm:pb-20 lg:pb-24">
          <div className="marketing-layer mx-auto grid max-w-7xl items-center gap-8 rounded-2xl bg-on-surface p-6 text-white shadow-xl shadow-primary/10 md:grid-cols-[0.85fr_1.15fr] md:p-10">
            <div>
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.12em] text-tertiary-fixed">Cộng đồng TOEIC AI</span>
              <h2 className="mt-3 font-headline-lg text-headline-lg font-bold">Mỗi tiến bộ nhỏ đều tạo nên một thành tích lớn.</h2>
              <p className="mt-4 font-body-lg text-body-lg leading-relaxed text-white/70">Hàng nghìn học viên đang luyện tập theo năng lực thực tế, theo dõi điểm mạnh và từng bước tiến gần hơn đến mục tiêu TOEIC.</p>
              <Link href="/register" className="marketing-button mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-primary-fixed px-5 font-label-md text-label-md font-semibold text-on-primary-fixed transition hover:bg-white"><span>Tham gia cộng đồng</span><span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
            </div>
            <div className="marketing-layer-soft rounded-xl bg-surface-container-lowest p-5 text-on-surface sm:p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-surface-container-low p-4"><span className="font-body-sm text-body-sm text-on-surface-variant">Học viên đang học</span><strong className="mt-2 block text-2xl text-primary sm:text-3xl">5.000+</strong></div>
                <div className="rounded-lg bg-surface-container-low p-4"><span className="font-body-sm text-body-sm text-on-surface-variant">Bài luyện đã hoàn thành</span><strong className="mt-2 block text-2xl text-tertiary sm:text-3xl">128K</strong></div>
                <div className="col-span-2 rounded-lg bg-surface-container-low p-4 sm:col-span-1"><span className="font-body-sm text-body-sm text-on-surface-variant">Mức tăng điểm trung bình</span><strong className="mt-2 block text-2xl text-primary sm:text-3xl">+18%</strong></div>
              </div>
              <div className="mt-5 flex items-center justify-between border-b border-outline-variant/30 pb-3"><h3 className="font-headline-md text-headline-md font-bold">Những bước tiến gần đây</h3><span className="font-label-sm text-label-sm text-tertiary">Đã ghi nhận</span></div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/30 p-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">MA</span><div className="min-w-0"><p className="truncate font-label-md text-label-md font-semibold">Minh Anh</p><p className="font-caption text-caption text-on-surface-variant">Mục tiêu 650+</p></div></div><strong className="shrink-0 text-tertiary">520 → 675</strong></div>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/30 p-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tertiary-container text-sm font-bold text-white">TN</span><div className="min-w-0"><p className="truncate font-label-md text-label-md font-semibold">Tuấn Nam</p><p className="font-caption text-caption text-on-surface-variant">Mục tiêu 750+</p></div></div><strong className="shrink-0 text-tertiary">640 → 780</strong></div>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/30 p-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">HL</span><div className="min-w-0"><p className="truncate font-label-md text-label-md font-semibold">Hoài Linh</p><p className="font-caption text-caption text-on-surface-variant">Mục tiêu 550+</p></div></div><strong className="shrink-0 text-tertiary">405 → 565</strong></div>
            </div>
          </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-20 lg:py-24 bg-surface-container-lowest border-t border-outline-variant/20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 lg:mb-16">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-4">Học thông minh hơn, không phải học nhiều hơn</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Chúng tôi không cung cấp những bài kiểm tra rập khuôn. Hệ thống phân tích từng cú click chuột để thấu hiểu bạn.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="marketing-layer p-8 rounded-2xl bg-surface border border-outline-variant/20 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[24px]">psychology</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-3">Phân tích bằng AI</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Thuật toán BKT theo dõi chính xác mức độ thành thạo của bạn trên từng kỹ năng nhỏ nhất như Ngữ pháp, Từ vựng, hay Khả năng suy luận.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="marketing-layer p-8 rounded-2xl bg-surface border border-outline-variant/20 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-tertiary-container text-on-tertiary-container flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[24px]">trending_up</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-3">Lộ trình Thích ứng</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Độ khó bài tập tự động điều chỉnh tăng/giảm dựa trên phong độ thực tế, đảm bảo bạn luôn ở trạng thái &quot;Flow&quot; - không quá khó, không quá dễ.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="marketing-layer p-8 rounded-2xl bg-surface border border-outline-variant/20 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[24px]">smart_toy</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-3">Gia sư Gemini AI</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Không chỉ cho bạn biết đúng hay sai. Trợ lý ảo giải thích cặn kẽ tại sao bạn sai và cung cấp ví dụ tương tự để khắc phục triệt để lỗ hổng.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section id="methodology" className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-2 md:items-end"><div><span className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.12em] text-tertiary">Cách học có cơ sở</span><h2 className="mt-3 font-headline-lg text-headline-lg font-bold">Từ dữ liệu luyện tập đến bước tiến tiếp theo</h2></div><p className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant">Mô hình theo dõi kiến thức ghi nhận từng câu trả lời để hiểu mức độ ghi nhớ thực tế, thay vì chỉ nhìn vào một điểm số đơn lẻ.</p></div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">{learningSteps.map(([number, title, description]) => <article key={number} className="marketing-layer rounded-2xl border border-outline-variant/30 bg-surface-container-low p-7"><span className="font-display text-display font-bold text-primary/25">{number}</span><h3 className="mt-5 font-headline-sm text-headline-sm font-bold">{title}</h3><p className="mt-3 font-body-md text-body-md leading-relaxed text-on-surface-variant">{description}</p></article>)}</div>
          </div>
        </section>

        <section id="roadmap" className="border-y border-outline-variant/20 bg-surface-container-lowest px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl"><span className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.12em] text-primary">Lộ trình theo mục tiêu</span><h2 className="mt-3 font-headline-lg text-headline-lg font-bold">Định hướng học tập trước, cá nhân hóa sâu hơn sau bài test</h2><p className="mt-4 font-body-lg text-body-lg leading-relaxed text-on-surface-variant">Chọn mục tiêu điểm và mức hiểu biết hiện tại để xem lộ trình cơ bản. Khi có kết quả Baseline, hệ thống sẽ ưu tiên skill yếu, điều chỉnh độ khó và cập nhật từng bước học.</p></div>
            <RoadmapPlanner />
          </div>
        </section>

        {/* Plans */}
        <section id="pricing" className="border-y border-outline-variant/20 bg-surface-container-lowest px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl"><div className="mx-auto max-w-2xl text-center"><span className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.12em] text-primary">Chọn cách bắt đầu</span><h2 className="mt-3 font-headline-lg text-headline-lg font-bold">Gói học theo nhu cầu</h2><p className="mt-4 font-body-md text-body-md text-on-surface-variant">Các gói được cập nhật từ hệ thống quản lý gói học.</p></div>
            {plansLoading ? <p role="status" className="mt-10 text-center text-sm text-on-surface-variant">Đang tải gói học…</p> : plansError ? <div className="mt-10 text-center"><p role="alert" className="text-sm text-on-surface-variant">Chưa tải được danh sách gói học.</p><button type="button" onClick={() => void loadLearningData()} className="mt-3 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary">Thử lại</button></div> : displayedPlans.length === 0 ? <p className="mt-10 text-center text-sm text-on-surface-variant">Hiện chưa có gói học được phát hành.</p> : <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{displayedPlans.map((plan) => {
              const styles = planCategoryStyles[plan.planCategory];
              const categoryName = plan.planCategory === 'PROMOTION'
                ? 'Ưu đãi'
                : plan.planCategory === 'FREE'
                  ? 'Free'
                  : plan.planCategory === 'PREMIUM'
                    ? 'Premium'
                    : 'Pro';
              const benefits = describePlanEntitlements(plan, featureCatalog);

              return <article key={plan.id} className={`flex min-w-0 flex-col rounded-2xl border p-5 shadow-lg ${styles.card} ${plan.isPopular ? 'ring-2 ring-primary/25' : ''}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`w-fit rounded-full px-3 py-1 font-label-sm text-label-sm font-bold ${styles.badge}`}>{categoryName}</span>
                  {plan.isPopular ? <span className={`w-fit rounded-full px-3 py-1 font-label-sm text-label-sm font-bold ${plan.planCategory === 'PREMIUM' ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary'}`}>{plan.badgeTag || 'Phổ biến'}</span> : null}
                </div>
                <h3 className="mt-4 break-words font-headline-md text-headline-md font-bold">{plan.name}</h3>
                <p className={`mt-2 min-h-10 font-body-md text-body-md ${styles.description}`}>{plan.badgeTag || 'Quyền học theo gói đã chọn.'}</p>
                <p className={`mt-5 text-3xl font-bold ${styles.price}`}>{plan.promotionalPrice === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN').format(plan.promotionalPrice) + ' ₫'}</p>
                {plan.originalPrice > plan.promotionalPrice ? <p className={`mt-1 text-sm line-through ${styles.duration}`}>{new Intl.NumberFormat('vi-VN').format(plan.originalPrice)} ₫</p> : null}
                <p className={`mt-2 text-sm ${styles.duration}`}>{plan.billingCycle === 'LIFETIME' ? 'Không hết hạn' : `${plan.durationDays} ngày kể từ khi mua thành công`}</p>
                {featuresError ? <p className={`mt-6 flex-1 font-body-md text-body-md ${styles.description}`}>Chưa tải được danh mục quyền lợi.</p> : <ul className={`mt-6 flex-1 space-y-3 font-body-md text-body-md ${styles.description}`}>
                  {benefits.map((benefit) => <li key={benefit} className="flex gap-2"><span aria-hidden="true" className={`font-bold ${styles.benefit}`}>✓</span><span>{benefit}</span></li>)}
                  {benefits.length === 0 ? <li>Quyền lợi chưa được phát hành.</li> : null}
                </ul>}
                <Link href="/register" className={`mt-8 inline-flex h-11 w-full items-center justify-center rounded-lg px-3 text-center font-label-md text-label-md font-semibold transition ${styles.button}`}>Đăng ký tài khoản</Link>
              </article>;
            })}</div>}
            {featuresError ? <p role="status" className="mt-4 text-center text-sm text-on-surface-variant">Chưa tải được danh mục quyền lợi nên thông tin chi tiết có thể chưa đầy đủ.</p> : null}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/30 bg-surface py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">school</span>
            <span className="font-label-md text-label-md font-bold text-on-surface">TOEIC AI Learning</span>
          </div>
          <div className="font-caption text-caption text-on-surface-variant">
            © 2026 Hệ thống hỗ trợ học tập cá nhân hóa. Đồ án tốt nghiệp.
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <GoogleAuthErrorModal errorCode={googleAuthError} onClose={closeGoogleAuthError} />
    </div>
  );
}
