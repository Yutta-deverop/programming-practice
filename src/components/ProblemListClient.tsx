"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SECTIONS, problems } from "@/data/problems";
import {
  STATUS_LABEL,
  STATUS_STYLE,
  statusOf,
  useProgress,
  type ProblemStatus,
} from "@/lib/storage";

type StatusFilter = "all" | ProblemStatus;
type KindFilter = "all" | "example" | "task";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "untouched", label: "未挑戦" },
  { value: "trying", label: "挑戦中" },
  { value: "review", label: "要復習" },
  { value: "correct", label: "正解" },
];

const KIND_FILTERS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "example", label: "例題" },
  { value: "task", label: "課題" },
];

function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={
              active
                ? "rounded-full border border-primary bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                : "rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ProblemListClient() {
  const progress = useProgress();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");

  const filtered = useMemo(
    () =>
      problems.filter((problem) => {
        if (kindFilter !== "all" && problem.kind !== kindFilter) return false;
        if (statusFilter !== "all" && statusOf(progress, problem.id) !== statusFilter) {
          return false;
        }
        return true;
      }),
    [kindFilter, statusFilter, progress],
  );

  const correctCount = problems.filter(
    (problem) => statusOf(progress, problem.id) === "correct",
  ).length;

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-10">
          <p className="section-title">Problems</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">問題一覧</h1>
          <p className="mt-2 max-w-prose text-sm leading-7 text-muted-foreground">
            例題と課題をあわせて {problems.length} 問あります。問題を選ぶと、問題文・入力例・
            ヒントとコード入力欄が開きます。正解状況はこのブラウザに保存されます。
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            現在 <span className="font-semibold text-success">{correctCount}</span> 問正解 /{" "}
            {problems.length} 問
          </p>
        </div>
      </section>

      <section className="container-page py-6">
        <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-xs font-semibold text-muted-foreground">種類</span>
            <FilterChips
              label="種類で絞り込む"
              options={KIND_FILTERS}
              value={kindFilter}
              onChange={setKindFilter}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-xs font-semibold text-muted-foreground">状態</span>
            <FilterChips
              label="状態で絞り込む"
              options={STATUS_FILTERS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            条件に合う問題がありません。フィルタを変えてみてください。
          </p>
        ) : (
          <div className="mt-8 space-y-10">
            {SECTIONS.map((section) => {
              const list = filtered.filter((problem) => problem.section === section.id);
              if (list.length === 0) return null;
              const total = problems.filter((p) => p.section === section.id).length;

              return (
                <section key={section.id} id={`s-${section.id}`} className="scroll-mt-20">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-2">
                    <h2 className="font-mono text-sm font-bold text-primary">{section.id}</h2>
                    <h3 className="text-base font-bold">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">{section.summary}</p>
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      {list.length} / {total} 問を表示
                    </span>
                  </div>

                  <ul className="mt-2 divide-y divide-border">
                    {list.map((problem) => {
                      const status = statusOf(progress, problem.id);
                      const attempt = progress.attempts[problem.id];
                      return (
                        <li key={problem.id}>
                          <Link
                            href={`/problems/${problem.id}`}
                            className="group flex items-start gap-4 rounded-md px-2 py-4 transition-colors hover:bg-surface-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                                  {problem.label}
                                </span>
                                <span
                                  className={
                                    problem.kind === "example"
                                      ? "chip border-primary/30 bg-primary-soft text-primary"
                                      : "chip"
                                  }
                                >
                                  {problem.kind === "example" ? "例題" : "課題"}
                                </span>
                                {problem.inputSpec && <span className="chip">入力あり</span>}
                                {problem.figure && <span className="chip">図あり</span>}
                              </div>
                              <p className="mt-1 truncate text-sm font-semibold group-hover:text-primary">
                                {problem.title}
                              </p>
                              <p className="mt-0.5 line-clamp-2 text-xs leading-6 text-muted-foreground">
                                {problem.statement.split("\n")[0].slice(0, 120)}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[status]}`}
                              >
                                {STATUS_LABEL[status]}
                              </span>
                              {attempt && (
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  {attempt.result.score} 点
                                </span>
                              )}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
