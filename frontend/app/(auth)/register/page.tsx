import { SignupForm } from '@/components/auth/SignupForm';
import { SystemTrainingShowcase } from '@/components/auth/SystemTrainingShowcase';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Unified Single Card Container */}
      <div className="w-full max-w-[940px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl grid lg:grid-cols-12">
        {/* Left Column: Compact Promotional Showcase about System & Training */}
        <div className="lg:col-span-5 flex flex-col">
          <SystemTrainingShowcase />
        </div>

        {/* Right Column: Condensed Signup Form */}
        <div className="lg:col-span-7 flex flex-col justify-center p-5 sm:p-7 lg:p-8 bg-white">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}