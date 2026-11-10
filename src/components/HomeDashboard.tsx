"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { SECTIONS, problemCount, problems, taskCount } from "@/data/problems";
import { statusOf, useProgress } from "@/lib/storage";

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-border"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${value} / ${total} 問正解`}
    >
      <div
        className="h-full rounded-full bg-success transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function HomeDashboard() {
  const progress = useProgress();
  const router = useRouter();

  const stats = useMemo(() => {
    let correct = 0;
    let tried = 0;
    for (const problem of problems) {
      const status = statusOf(progress, problem.id);
      if (status === "correct") correct += 1;
      if (status !== "untouched") tried += 1;
    }
    return { correct, tried };
  }, [progress]);

  const lastProblem = progress.lastProblemId
    ? problems.find((problem) => problem.id === progress.lastProblemId)
    : undefined;

  function pickRandom() {
    const unsolved = problems.filter((p) => statusOf(progress, p.id) !== "correct");
    const pool = unsolved.length > 0 ? unsolved : problems;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    router.push(`/problems/${picked.id}`);
  }

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-surface to-background">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
          <div>
            <p className="section-title">C言語 第1章 / 例題と課題</p>
            <h1 className="mt-3 text-3xl font-bold leading-[1.35] tracking-tight sm:text-4xl">
              書いて、判定して、
              <br className="hidden sm:block" />
              間違いを理解する。
            </h1>
            <p className="mt-4 max-w-prose text-sm leading-7 text-muted-foreground">
              例題 {problemCount - taskCount} 問・課題 {taskCount} 問（全 {problemCount} 問）を、
              一覧から選ぶかランダム出題で練習できます。提出したコードは AI
              が読み取り、正誤と「どこを直せばよいか」を日本語で返します。
              模範解答と違う書き方でも、問題の条件を満たしていれば正解です。
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/problems" className="btn-primary">
                問題一覧を見る
              </Link>
              <button type="button" onClick={pickRandom} className="btn-secondary">
                ランダムに1問
              </button>
              <Link href="/notes" className="btn-ghost">
                学習ノート
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              コードはサーバーで実行しません。AI が1行ずつ読んで判定します。
            </p>
          </div>

          <div className="card p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="section-title">あなたの進捗</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  正解 {stats.correct} 問 / 全 {problemCount} 問
                </p>
              </div>
              <p className="font-mono text-3xl font-bold text-success">
                {problemCount > 0 ? Math.round((stats.correct / problemCount) * 100) : 0}
                <span className="text-base font-semibold">%</span>
              </p>
            </div>
            <div className="mt-3">
              <ProgressBar value={stats.correct} total={problemCount} />
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
              <div>
                <dt className="text-[11px] text-muted-foreground">挑戦した</dt>
                <dd className="mt-1 font-mono text-xl font-bold">{stats.tried}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">正解</dt>
                <dd className="mt-1 font-mono text-xl font-bold text-success">
                  {stats.correct}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">残り</dt>
                <dd className="mt-1 font-mono text-xl font-bold text-muted-foreground">
                  {problemCount - stats.correct}
                </dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-border pt-4">
              {lastProblem ? (
                <Link
                  href={`/problems/${lastProblem.id}`}
                  className="group flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-3 py-2.5 transition-colors hover:border-border-strong hover:bg-surface"
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] text-muted-foreground">
                      つづきから
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-semibold">
                      {lastProblem.label}　{lastProblem.title}
                    </span>
                  </span>
                  <span className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              ) : (
                <p className="text-xs leading-6 text-muted-foreground">
                  まだ挑戦した問題がありません。まずは例題 1.1 から始めてみましょう。
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-title">セクション</p>
            <h2 className="mt-1 text-xl font-bold">学習範囲から選ぶ</h2>
          </div>
          <Link
            href="/problems"
            className="text-sm font-semibold text-primary hover:underline"
          >
            すべての問題を見る →
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {SECTIONS.map((section) => {
            const list = problems.filter((problem) => problem.section === section.id);
            const correct = list.filter(
              (problem) => statusOf(progress, problem.id) === "correct",
            ).length;
            const firstUnsolved =
              list.find((problem) => statusOf(progress, problem.id) !== "correct") ??
              list[0];

            return (
              <Link
                key={section.id}
                href={`/problems/${firstUnsolved.id}`}
                className="card group flex flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs font-semibold text-primary">
                      {section.id}
                    </p>
                    <h3 className="mt-1 text-base font-bold">{section.title}</h3>
                  </div>
                  <span className="chip shrink-0">
                    {correct} / {list.length} 正解
                  </span>
                </div>
                <p className="text-xs leading-6 text-muted-foreground">{section.summary}</p>
                <div className="mt-auto space-y-2">
                  <ProgressBar value={correct} total={list.length} />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {list[0].label} 〜 {list[list.length - 1].label}
                    </span>
                    <span className="font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      開く →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="card flex flex-col gap-4 border-primary/20 bg-primary-soft/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-title">はじめての方へ</p>
            <h2 className="mt-1 text-lg font-bold">
              セミコロン・&lt;stdio.h&gt;・%lf の違いは「学習ノート」にまとめてあります
            </h2>
            <p className="mt-1 max-w-prose text-xs leading-6 text-muted-foreground">
              提出前に自動で行う静的チェック（全角文字・&amp; 忘れ・セミコロンなど）の
              元ネタもここにあります。
            </p>
          </div>
          <Link href="/notes" className="btn-secondary shrink-0">
            学習ノートを読む
          </Link>
        </div>
      </section>

      {stats.tried > 0 && (
        <p className="container-page pb-10 text-center text-[11px] text-muted-foreground">
          進捗はこのブラウザに保存されています（
          <Link href="/progress" className="underline hover:text-foreground">
            バックアップ / 復元
          </Link>
          ）。
        </p>
      )}
    </>
  );
}
