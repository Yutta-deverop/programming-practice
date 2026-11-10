import type { Metadata } from "next";

import { ProgressClient } from "@/components/ProgressClient";

export const metadata: Metadata = {
  title: "進捗のバックアップ | プログラミング練習",
  description: "このブラウザに保存された学習進捗をJSONで保存・復元できます。",
};

export default function ProgressPage() {
  return <ProgressClient />;
}
