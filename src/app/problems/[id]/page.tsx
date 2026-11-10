import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PracticeClient } from "@/components/PracticeClient";
import { getProblem, problems } from "@/data/problems";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return problems.map((problem) => ({ id: problem.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const problem = getProblem(id);
  if (!problem) return { title: "問題が見つかりません | プログラミング練習" };
  return {
    title: `${problem.label} ${problem.title} | プログラミング練習`,
    description: problem.statement.split("\n")[0].slice(0, 120),
  };
}

export default async function ProblemPage({ params }: PageProps) {
  const { id } = await params;
  const problem = getProblem(id);
  if (!problem) notFound();

  const index = problems.findIndex((p) => p.id === problem.id);
  const nextProblemId = index >= 0 ? (problems[index + 1]?.id ?? null) : null;
  const { references, ...publicProblem } = problem;

  return (
    <PracticeClient
      key={problem.id}
      problem={publicProblem}
      hasReferences={references.length > 0}
      usesRealNumbers={problem.section === "1.3" || problem.section === "1.4"}
      nextProblemId={nextProblemId}
    />
  );
}
