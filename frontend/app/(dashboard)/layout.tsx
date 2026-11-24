import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { StudentChatBubble } from "@/components/layout/StudentChatBubble";
import { StudentStudyTracker } from "@/components/layout/StudentStudyTracker";
import { DoubleClickDictionary } from "@/components/layout/DoubleClickDictionary";
import { FeedbackSupportModal } from "@/components/layout/FeedbackSupportModal";

export const metadata: Metadata = {
  title: "TOEIC AI - Học & Luyện Thi TOEIC Cá Nhân Hóa",
  description: "Nền tảng tự học và luyện thi TOEIC chuẩn format mới nhất cùng trợ lý AI",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="w-full flex-1 bg-surface px-4 py-6 pt-24 sm:px-6 lg:px-8">
        {children}
      </main>
      <StudentChatBubble />
      <StudentStudyTracker />
      <DoubleClickDictionary />
      <FeedbackSupportModal />
    </div>
  );
}
