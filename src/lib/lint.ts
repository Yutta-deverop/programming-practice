/**
 * 提出前の静的チェック（ブラウザ内で実行、AIは使わない）。
 * Drive の「プログラミングノート」に書かれている注意点をルール化したもの。
 */

export type LintSeverity = "error" | "warning" | "info";

export interface LintIssue {
  id: string;
  severity: LintSeverity;
  line: number;
  message: string;
}

interface ScanResult {
  /** コメント・文字列リテラルを空白に置き換えたコード（行番号は維持） */
  masked: string;
  /** コード部分（文字列・コメント以外）に出てきた全角文字 */
  fullWidth: { line: number; char: string }[];
  lines: string[];
  maskedLines: string[];
}

const FULL_WIDTH = /[\u3000\uFF01-\uFF60\uFFE0-\uFFE6]/;

function scan(code: string): ScanResult {
  const chars = Array.from(code);
  const out: string[] = [];
  const fullWidth: { line: number; char: string }[] = [];
  let line = 1;
  let i = 0;

  type State = "code" | "lineComment" | "blockComment" | "string" | "char";
  let state: State = "code";

  while (i < chars.length) {
    const c = chars[i];
    const next = chars[i + 1] ?? "";

    if (c === "\n") {
      out.push("\n");
      line += 1;
      if (state === "lineComment") state = "code";
      i += 1;
      continue;
    }

    switch (state) {
      case "code": {
        if (c === "/" && next === "/") {
          state = "lineComment";
          out.push(" ", " ");
          i += 2;
          continue;
        }
        if (c === "/" && next === "*") {
          state = "blockComment";
          out.push(" ", " ");
          i += 2;
          continue;
        }
        if (c === '"') {
          state = "string";
          out.push(" ");
          i += 1;
          continue;
        }
        if (c === "'") {
          state = "char";
          out.push(" ");
          i += 1;
          continue;
        }
        if (FULL_WIDTH.test(c)) {
          fullWidth.push({ line, char: c });
        }
        out.push(c);
        i += 1;
        continue;
      }
      case "lineComment": {
        out.push(" ");
        i += 1;
        continue;
      }
      case "blockComment": {
        if (c === "*" && next === "/") {
          out.push(" ", " ");
          state = "code";
          i += 2;
          continue;
        }
        out.push(" ");
        i += 1;
        continue;
      }
      case "string": {
        if (c === "\\") {
          out.push(" ", " ");
          i += 2;
          continue;
        }
        if (c === '"') {
          out.push(" ");
          state = "code";
          i += 1;
          continue;
        }
        out.push(" ");
        i += 1;
        continue;
      }
      case "char": {
        if (c === "\\") {
          out.push(" ", " ");
          i += 2;
          continue;
        }
        if (c === "'") {
          out.push(" ");
          state = "code";
          i += 1;
          continue;
        }
        out.push(" ");
        i += 1;
        continue;
      }
    }
  }

  const masked = out.join("");
  return {
    masked,
    fullWidth,
    lines: code.split("\n"),
    maskedLines: masked.split("\n"),
  };
}

function countParens(line: string): number {
  let depth = 0;
  for (const c of line) {
    if (c === "(") depth += 1;
    else if (c === ")") depth -= 1;
  }
  return depth;
}

export interface LintOptions {
  /** 実数（double）を扱う問題か。整数除算の疑いを出すかどうかの判定に使う。 */
  usesRealNumbers: boolean;
}

export function lintCode(code: string, options: LintOptions): LintIssue[] {
  const issues: LintIssue[] = [];
  if (!code.trim()) {
    return [
      {
        id: "EMPTY",
        severity: "info",
        line: 1,
        message: "まだコードが空です。ひな形から書き始めましょう。",
      },
    ];
  }

  const { masked, fullWidth, maskedLines } = scan(code);
  const compact = masked.replace(/\s+/g, " ");

  // 1. 全角文字（文字列・コメント以外）
  if (fullWidth.length > 0) {
    const first = fullWidth[0];
    issues.push({
      id: "FW001",
      severity: "error",
      line: first.line,
      message:
        fullWidth.length === 1
          ? `全角文字「${first.char}」が混ざっています。コード部分は半角で書きましょう。`
          : `全角文字が ${fullWidth.length} か所あります（最初は ${first.line} 行目「${first.char}」）。コード部分は半角で書きましょう。`,
    });
  }

  // 2. main 関数
  if (!/int\s+main\s*\(/.test(compact)) {
    issues.push({
      id: "MAIN001",
      severity: "error",
      line: 1,
      message: "int main(void) がありません。プログラムの開始地点が必要です。",
    });
  }

  // 3. #include <stdio.h>
  if (!/#\s*include\s*<\s*stdio\.h\s*>/.test(compact)) {
    issues.push({
      id: "INC001",
      severity: "error",
      line: 1,
      message: "#include <stdio.h> がありません。printf / scanf を使うのに必要です。",
    });
  }

  // 4. return 0;
  if (!/return\s*0\s*;/.test(compact)) {
    issues.push({
      id: "RET001",
      severity: "warning",
      line: 1,
      message: "return 0; が見つかりません。プログラムの正常終了を示します。",
    });
  }

  // 5. 波カッコの対応
  const opens = (masked.match(/{/g) ?? []).length;
  const closes = (masked.match(/}/g) ?? []).length;
  if (opens !== closes) {
    issues.push({
      id: "BRACE001",
      severity: "error",
      line: 1,
      message: `波カッコ { と } の数が合っていません（{ が ${opens} 個、} が ${closes} 個）。`,
    });
  }

  // 6. scanf の & 忘れ
  const scanfRe = /scanf\s*\(\s*"[^"]*"\s*,([^;]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = scanfRe.exec(masked)) !== null) {
    const args = m[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const missing = args.filter((a) => !a.startsWith("&"));
    if (missing.length > 0) {
      const index = masked.slice(0, m.index).split("\n").length;
      issues.push({
        id: "SCAN001",
        severity: "error",
        line: index,
        message: `scanf の引数 ${missing.join(", ")} に & が付いていません。入力を受け取る変数には & が必要です。`,
      });
    }
  }

  // 7. scanf で double に %f を使っていないか
  const declaresDouble = /\bdouble\b/.test(compact);
  if (declaresDouble) {
    const badScanf = /scanf\s*\(\s*"[^"]*%f[^"]*"/.exec(masked);
    if (badScanf && !/%lf/.test(badScanf[0])) {
      const index = masked.slice(0, badScanf.index).split("\n").length;
      issues.push({
        id: "SCAN002",
        severity: "warning",
        line: index,
        message:
          "scanf で double を読み取るときは %lf を使います（printf は %f でかまいません）。",
      });
    }
  }

  // 8. セミコロン漏れの疑い
  maskedLines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;
    if (line.startsWith("#")) return;
    if (/[;{}(),]$/.test(line)) return;
    if (/^[{}]$/.test(line)) return;
    if (countParens(line) !== 0) return;
    if (/^(\/\/|\*|\/\*)/.test(line)) return;
    if (/[+\-*/&|=<>?:]$/.test(line)) return;
    if (!/[A-Za-z0-9_")]$/.test(line)) return;
    issues.push({
      id: "SEMI001",
      severity: "warning",
      line: index + 1,
      message: `行末にセミコロン ; が無いかもしれません（${index + 1} 行目）。`,
    });
  });

  // 9. 整数除算の疑い（実数問題のみ）
  if (options.usesRealNumbers) {
    maskedLines.forEach((rawLine, index) => {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) return;
      if (/\/\s*-?\d+(?![\d.])/.test(line)) {
        issues.push({
          id: "DIV001",
          severity: "warning",
          line: index + 1,
          message:
            "整数の定数で割っています。整数同士の割り算は小数が切り捨てられます。2.0 で割る、または (double) で型変換しましょう。",
        });
      }
    });
  }

  // 重複除去（同じ行・同じID）
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.id}:${issue.line}:${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const LINT_SEVERITY_LABEL: Record<LintSeverity, string> = {
  error: "エラー",
  warning: "注意",
  info: "情報",
};

export const STARTER_CODE = `#include <stdio.h>

int main(void)
{
\t

\treturn 0;
}
`;
