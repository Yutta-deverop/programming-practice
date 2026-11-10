import type { Metadata } from "next";

import { ProblemListClient } from "@/components/ProblemListClient";

export const metadata: Metadata = {
  title: "問題一覧 | プログラミング練習",
  description: "C言語 第1章の例題・課題 全19問の一覧。正解状況で絞り込めます。",
};

export default function ProblemsPage() {
  return <ProblemListClient />;
}
