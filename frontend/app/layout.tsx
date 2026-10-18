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
    <html lang="vi" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-surface font-body-md text-on-surface">
        <StudentPagesGuard>{children}</StudentPagesGuard>
      </body>
    </html>
  );
}
