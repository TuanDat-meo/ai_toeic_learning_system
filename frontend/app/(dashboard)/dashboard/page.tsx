import { BookOpen, Brain, ClipboardCheck, Headphones, ListChecks } from 'lucide-react';
import { LEARNING_CAPABILITIES } from '@/lib/learning-capabilities';

export default function Home() {
  const moduleIcons = { VOCABULARY: BookOpen, GRAMMAR: Brain, LISTENING: Headphones, READING: ListChecks, MOCK_TEST: ClipboardCheck };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section aria-labelledby="progress-title">
        <div className="mb-4">
          <h2 id="progress-title" className="text-xl font-semibold text-on-surface">Tổng quan học tập</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Các chỉ số cá nhân sẽ được cập nhật từ hoạt động học thực tế.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Tiến độ học', value: 'Chưa có dữ liệu' },
            { label: 'Chuỗi ngày học', value: 'Chưa có dữ liệu' },
            { label: 'Điểm TOEIC gần nhất', value: 'Chưa có bài thi' },
          ].map((metric) => (
            <div key={metric.label} className="rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-5">
              <p className="text-sm text-on-surface-variant">{metric.label}</p>
              <p className="mt-3 text-lg font-semibold text-on-surface">{metric.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="modules-title">
        <div>
          <h2 id="modules-title" className="text-xl font-semibold text-on-surface">Khu vực học tập</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Các bài học và công cụ luyện tập sẽ mở tại đây khi hoàn tất.</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {LEARNING_CAPABILITIES.map(({ key, label, description }) => {
            const Icon = moduleIcons[key as keyof typeof moduleIcons];
            return <article key={key} className="flex min-h-36 flex-col rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-5 opacity-75">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-container text-primary">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="font-semibold text-on-surface">{label}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant">Đang phát triển</span>
              </div>
              <p className="mt-4 text-sm leading-5 text-on-surface-variant">{description}</p>
            </article>;
          })}
        </div>
      </section>
    </div>
  );
}
