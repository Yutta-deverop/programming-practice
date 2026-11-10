import type { Metadata } from "next";

import { SiteHeader } from "@/components/SiteHeader";

import "./globals.css";

export const metadata: Metadata = {
  title: "プログラミング練習 | C言語 例題・課題",
  description:
    "C言語の例題・課題を、問題一覧またはランダム出題で練習できるサイト。Sarashina API が正誤判定と間違いの解説を行います。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">
        <SiteHeader />
        <main className="pb-20">{children}</main>
        <footer className="border-t border-border py-8">
          <div className="container-page flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              プログラミング練習 — 教材: プログラミング演習資料（Google Drive）／判定: Sarashina API
            </p>
            <p>コードはサーバーで実行しません。AIが読み取って判定します。</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
