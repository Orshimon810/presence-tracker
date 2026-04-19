import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מערכת נוכחות",
  description: "מערכת ניהול נוכחות תלמידים בקורסים",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
