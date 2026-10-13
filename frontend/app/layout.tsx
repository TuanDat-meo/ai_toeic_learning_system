import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StudentPagesGuard } from "@/components/auth/StudentPagesGuard";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
});

export const metadata: Metadata = {
  title: "TOEIC AI - Quản Trị Hệ Thống",
  description: "Hệ thống hỗ trợ học tập cá nhân hóa bằng AI cho TOEIC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-surface font-body-md text-on-surface">
        <StudentPagesGuard>{children}</StudentPagesGuard>
      </body>
    </html>
  );
}
