"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { problems } from "@/data/problems";
import {
  STATUS_LABEL,
  STATUS_STYLE,
  clearProgress,
  exportProgress,
  importProgress,
  statusOf,
  useProgress,
} from "@/lib/storage";

export function ProgressClient() {
  const progress = useProgress();
  const [text, setText] = useState("");
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(
    null,
  );
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setText(exportProgress());
  }, [progress]);

  const attempted = problems.filter((problem) => progress.attempts[problem.id]);
  const correct = problems.filter((problem) => statusOf(progress, problem.id) === "correct");

  function download() {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `programming-practice-progress-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(exportProgress());
      setMessage({ tone: "ok", text: "進捗JSONをコピーしました" });
    } catch {
      setMessage({ tone: "error", text: "コピーできませんでした。下の欄から選択してください。" });
    }
  }

  function restore() {
    const result = importProgress(text);
    setMessage({ tone: result.ok ? "ok" : "error", text: result.message });
  }

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setText(String(reader.result ?? ""));
      setMessage({ tone: "ok", text: "ファイルを読み込みました。「復元する」を押してください。" });
    };
    reader.readAsText(file);
  }

  function reset() {
    if (!window.confirm("このブラウザの進捗と下書きをすべて消します。よろしいですか？")) return;
    clearProgress();
    setMessage({ tone: "ok", text: "進捗をリセットしました" });
  }

  return (
    <div className="container-page py-8">
      <p className="text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          ホーム
        </Link>{" "}
        / 進捗のバックアップ
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">進捗のバックアップ / 復元</h1>
      <p className="mt-2 max-w-prose text-sm leading-7 text-muted-foreground">
        進捗・判定結果・下書きコードはこのブラウザの localStorage に保存されています。
        別の端末やブラウザに移すときは、下の JSON を保存して読み込んでください。
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-[11px] text-muted-foreground">挑戦した問題</p>
          <p className="mt-1 font-mono text-2xl font-bold">
            {attempted.length}
            <span className="text-sm font-normal text-muted-foreground"> / {problems.length}</span>
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] text-muted-foreground">正解</p>
          <p className="mt-1 font-mono text-2xl font-bold text-success">{correct.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] text-muted-foreground">累計提出回数</p>
          <p className="mt-1 font-mono text-2xl font-bold">
            {Object.values(progress.tries).reduce((sum, n) => sum + n, 0)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" onClick={download} className="btn-primary">
          JSONをダウンロード
        </button>
        <button type="button" onClick={copy} className="btn-secondary">
          JSONをコピー
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary">
          ファイルから読み込む
        </button>
        <button type="button" onClick={reset} className="btn-ghost text-danger">
          進捗をリセット
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) readFile(file);
            event.target.value = "";
          }}
        />
      </div>

      {message && (
        <p
          role="status"
          className={
            message.tone === "ok"
              ? "mt-3 rounded-md border border-success/30 bg-success-soft px-3 py-2 text-xs text-success"
              : "mt-3 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger"
          }
        >
          {message.text}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="section-title">保存されている進捗 JSON</h2>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={18}
            spellCheck={false}
            className="mt-2 w-full rounded-md border border-border bg-[var(--code-background)] p-3 font-mono text-[11px] leading-5 text-[var(--code-text)]"
          />
          <button type="button" onClick={restore} className="btn-secondary mt-2">
            この内容で復元する
          </button>
        </section>

        <section>
          <h2 className="section-title">問題ごとの状態</h2>
          <ul className="mt-2 divide-y divide-border">
            {problems.map((problem) => {
              const status = statusOf(progress, problem.id);
              return (
                <li key={problem.id} className="flex items-center gap-3 py-2 text-xs">
                  <span className="w-16 shrink-0 font-mono text-[10px] text-muted-foreground">
                    {problem.label}
                  </span>
                  <Link
                    href={`/problems/${problem.id}`}
                    className="min-w-0 flex-1 truncate hover:text-primary"
                  >
                    {problem.title}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[status]}`}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
