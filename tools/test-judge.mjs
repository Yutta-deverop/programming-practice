/**
 * 判定 API の動作確認用スクリプト（開発用）。
 *
 *   node tools/test-judge.mjs <problemId> <code-file> [model]
 *
 * 例:
 *   node tools/test-judge.mjs ex-1-1 docs/drive_source/c/r1-1.c
 *   node tools/test-judge.mjs k-1-2a docs/drive_source/c/k1-2a.c sarashina3-nano
 *
 * 先に `npm run dev`（または `npm run start`）でサーバーを起動しておくこと。
 */

import { readFileSync } from "node:fs";

const [, , problemId, file, model] = process.argv;

if (!problemId || !file) {
  console.error("使い方: node tools/test-judge.mjs <problemId> <code-file> [model]");
  process.exit(1);
}

const code = readFileSync(file, "utf8");
const endpoint = process.env.JUDGE_URL ?? "http://localhost:3000/api/judge";

const started = Date.now();
const res = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ problemId, code, model }),
});

const elapsed = ((Date.now() - started) / 1000).toFixed(1);
const text = await res.text();

console.log(`HTTP ${res.status} (${elapsed}s)`);
try {
  const data = JSON.parse(text);
  if (data.result) {
    const r = data.result;
    console.log(`verdict: ${r.verdict}  score: ${r.score}  model: ${data.model}`);
    console.log(`summary: ${r.summary}`);
    console.log("good_points:");
    for (const point of r.good_points) console.log(`  + ${point}`);
    console.log(`issues (${r.issues.length}):`);
    for (const issue of r.issues) {
      console.log(`  - [${issue.severity}] line ${issue.line ?? "-"}: ${issue.message}`);
      if (issue.fix_hint) console.log(`      → ${issue.fix_hint}`);
    }
    if (r.output_check) {
      console.log(`output match: ${r.output_check.match}`);
      console.log(`  expected: ${JSON.stringify(r.output_check.expected)}`);
      console.log(`  actual  : ${JSON.stringify(r.output_check.actual)}`);
    }
    if (r.hint) console.log(`hint: ${r.hint}`);
  } else {
    console.log(text);
  }
} catch {
  console.log(text.slice(0, 1000));
}
