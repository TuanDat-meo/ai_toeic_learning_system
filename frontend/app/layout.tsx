import type { Metadata } from "next";
import { StudentPagesGuard } from "@/components/auth/StudentPagesGuard";
import "./globals.css";

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
    <html lang="vi" className="h-full antialiased font-sans">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-surface font-body-md text-on-surface">
        <StudentPagesGuard>{children}</StudentPagesGuard>
      </body>
    </html>
  );
}
