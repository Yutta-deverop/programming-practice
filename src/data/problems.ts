import raw from "./problems.json";

export type SectionId = "1.1" | "1.2" | "1.3" | "1.4";
export type ProblemKind = "example" | "task";

export type FigureKind = "star" | "triangle" | "parallel-resistor";

export interface Reference {
  filename: string;
  code: string;
}

export interface Problem {
  id: string;
  section: SectionId;
  kind: ProblemKind;
  label: string;
  title: string;
  statement: string;
  inputSpec: string | null;
  sampleInput: string | null;
  expected: string[];
  figure: FigureKind | null;
  hints: string[];
  checkpoints: string[];
  commonMistakes: string[];
  references: Reference[];
  notes: string[];
}

export const problems = raw as Problem[];

export const SECTIONS: { id: SectionId; title: string; summary: string }[] = [
  { id: "1.1", title: "初めてのプログラム", summary: "printf で文字や模様を表示する" },
  { id: "1.2", title: "整数の四則演算", summary: "int・scanf・四則演算で計算する" },
  { id: "1.3", title: "実数の四則演算", summary: "double・キャスト・桁指定を扱う" },
  { id: "1.4", title: "標準関数", summary: "math.h の sin・sqrt・log を使う" },
];

export function getProblem(id: string): Problem | undefined {
  return problems.find((p) => p.id === id);
}

export function getSectionsWithProblems() {
  return SECTIONS.map((section) => ({
    ...section,
    problems: problems.filter((p) => p.section === section.id),
  }));
}

export const problemCount = problems.length;
export const taskCount = problems.filter((p) => p.kind === "task").length;
