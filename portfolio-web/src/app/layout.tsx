import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio.example.com"
  ),
  title: "Portfolio LP | 課題を成果に変える実装者",
  description:
    "戦略・デザイン・実装をつなぎ、課題を成果に変えるためのポートフォリオLPです。",
  openGraph: {
    title: "Portfolio LP | 課題を成果に変える実装者",
    description:
      "Before / Afterで実績を示し、相談導線まで設計した1ページポートフォリオ。",
    images: ["/og-cover.svg"],
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
