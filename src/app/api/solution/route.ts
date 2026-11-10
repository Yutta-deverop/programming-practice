import { NextResponse } from "next/server";

import { getProblem } from "@/data/problems";

export const runtime = "nodejs";

/**
 * 模範解答は「判定後」にだけ表示したいので、初期表示の HTML / RSC には含めず
 * この API から取得する。
 */
export async function GET(request: Request) {
  const problemId = new URL(request.url).searchParams.get("problemId");
  if (!problemId) {
    return NextResponse.json({ error: "problemId を指定してください" }, { status: 400 });
  }

  const problem = getProblem(problemId);
  if (!problem) {
    return NextResponse.json({ error: "問題が見つかりません" }, { status: 404 });
  }

  return NextResponse.json(
    {
      problemId: problem.id,
      references: problem.references,
      note: "この解答はあくまで一例です。書き方が違っても、問題の条件を満たしていれば正解です。",
    },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" } },
  );
}
