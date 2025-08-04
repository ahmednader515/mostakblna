import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playpenSansArabic = localFont({
  src: '../public/fonts/PlaypenSansArabic-VariableFont_wght.ttf',
  variable: '--font-playpen-sans-arabic',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "منصة مستقبلنا",
  description: "منصة تعليمية متكاملة",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="ar" dir="rtl" className={`${geistSans.variable} ${geistMono.variable} ${playpenSansArabic.variable}`}>
      <body suppressHydrationWarning className="font-playpen-sans-arabic">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
