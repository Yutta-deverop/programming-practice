import type { Metadata } from "next";
import Link from "next/link";

import { yenText } from "@/lib/yen";

export const metadata: Metadata = {
  title: "学習ノート | プログラミング練習",
  description:
    "C言語の基本構造、セミコロン・改行・インデント、scanf の &、%d と %lf、キャスト、math.h、ファイル名のルールをまとめた学習ノート。",
};

const TOC = [
  { id: "structure", label: "Cプログラムの基本構造" },
  { id: "syntax", label: "セミコロン・改行・インデント" },
  { id: "variables", label: "変数と scanf" },
  { id: "format", label: "書式指定子と桁指定" },
  { id: "cast", label: "整数除算とキャスト" },
  { id: "math", label: "標準関数（math.h）" },
  { id: "filename", label: "ファイル名のルール" },
  { id: "handwriting", label: "手書き文字の書き分け" },
  { id: "flowchart", label: "フローチャートの記号" },
];

function CodeBlock({ children, filename }: { children: string; filename?: string }) {
  return (
    <div className="my-3 overflow-hidden rounded-md border border-border">
      {filename && (
        <div className="border-b border-border bg-surface-2 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
          {filename}
        </div>
      )}
      <pre className="overflow-x-auto bg-[var(--code-background)] p-3 font-mono text-xs leading-6 text-[var(--code-text)]">
        {yenText(children)}
      </pre>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border pt-8 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="prose-jp mt-3 text-sm leading-7">{children}</div>
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-3 rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-xs leading-6 text-warning">
      {children}
    </div>
  );
}

export default function NotesPage() {
  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-10">
          <p className="section-title">Study Notes</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">学習ノート</h1>
          <p className="mt-2 max-w-prose text-sm leading-7 text-muted-foreground">
            授業資料「プログラミングノート」の内容を、練習サイトで間違えやすい点を中心に
            まとめ直したものです。提出前の自動チェックもこの内容に沿っています。
          </p>
        </div>
      </section>

      <div className="container-page grid gap-10 py-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-20 space-y-1 border-l border-border pl-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              目次
            </p>
            {TOC.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block py-0.5 text-xs leading-6 text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-10">
          <Section id="structure" title="1. Cプログラムの基本構造">
            <p>
              プログラムは「コンピュータにやらせる作業手順を記述したもの」です。C言語では
              ソースファイルをコンパイルして実行ファイルを作ります。大文字と小文字は
              厳密に区別されます。
            </p>
            <CodeBlock filename="hello.c">{`#include <stdio.h>

int main(void)
{
    printf("Hello C World\\n");
    return 0;
}`}</CodeBlock>
            <ul>
              <li>
                <code>#include &lt;stdio.h&gt;</code>：標準入出力ライブラリの読み込み。
                printf / scanf を使うのに必要。
              </li>
              <li>
                <code>int main(void) {"{ ... }"}</code>：プログラムの実行開始地点。
                波カッコは必ず対にする。
              </li>
              <li>
                <code>printf(&quot;...&quot;);</code>：画面に文字列を出力する関数。
              </li>
              <li>
                <code>return 0;</code>：プログラムの正常終了を OS に伝える。
                <code>return (0);</code> でも動くが <code>return 0;</code> が一般的。
              </li>
            </ul>
            <Note>
              日本語（全角文字）は文字列リテラルとコメントの中だけに書けます。コードの部分
              （変数名・記号・セミコロン）に全角が混ざるとコンパイルエラーになります。
            </Note>
          </Section>

          <Section id="syntax" title="2. セミコロン・改行・インデント">
            <h3 className="mt-2 font-semibold">(1) 文の区切り（セミコロン）</h3>
            <p>
              各処理の末尾には必ずセミコロン <code>;</code> を付けます。日本語の句点「。」
              に相当します。付け忘れるとコンパイルエラーになります。
            </p>
            <CodeBlock>{`printf("Hello\\n");   /* ○ セミコロンがある */
printf("Hello\\n")    /* × セミコロンが無い */`}</CodeBlock>

            <h3 className="mt-4 font-semibold">(2) 改行文字（\\n）</h3>
            <p>
              printf の中の <code>\\n</code>（環境によっては <code>¥n</code>）は改行を表します。
              半角の <code>¥</code> と <code>\\</code>（バックスラッシュ）は同じ意味です。
              文字列の最後に <code>\\n</code> を書かないと、次の出力が同じ行につながります。
            </p>
            <CodeBlock>{`printf("1行目\\n2行目\\n");
/* 実行結果
1行目
2行目
*/`}</CodeBlock>

            <h3 className="mt-4 font-semibold">(3) インデント（字下げ）</h3>
            <p>
              波カッコ <code>{"{ }"}</code> の中身は Tab 1個分（またはスペース2〜4個）字下げします。
              処理の階層構造が見やすくなり、間違いに気づきやすくなります。
            </p>
            <Note>
              全角スペースで字下げしないこと。見た目は同じでもコンパイルエラーの原因に
              なります。
            </Note>
          </Section>

          <Section id="variables" title="3. 変数と scanf">
            <p>
              変数は数値などを入れる「箱」です。<code>int</code>（整数型）で宣言します。
              宣言しないと使えません。変数名は小文字で始めるのが基本です。
            </p>
            <CodeBlock>{`int nasi, ringo, s;              /* 宣言（コンマで区切る） */
scanf("%d %d", &nasi, &ringo);   /* キーボードから入力 */
s = 50 * nasi + 190 * ringo;     /* 計算して代入 */
printf("総額 = %d 円\\n", s);`}</CodeBlock>
            <ul>
              <li>
                <code>scanf</code> は入力を受け取る関数です。<code>%d</code> は整数1つ分。
              </li>
              <li>
                <strong>変数名の前に <code>&amp;</code> を付ける</strong>（<code>&amp;nasi</code>）。
                付け忘れは最頻出のミスです。
              </li>
              <li>
                <code>=</code> は「右辺の計算結果を左辺に格納する」代入演算子です。
                数学の等号ではありません。
              </li>
              <li>
                演算子の優先順位：<code>*</code> <code>/</code> は <code>+</code>{" "}
                <code>-</code> より先に計算されます。順序を変えたいときはカッコを使います。
              </li>
            </ul>
          </Section>

          <Section id="format" title="4. 書式指定子と桁指定">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-3 font-semibold">指定子</th>
                    <th className="py-2 pr-3 font-semibold">意味</th>
                    <th className="py-2 font-semibold">使う場所</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 pr-3 font-mono">%d</td>
                    <td className="py-2 pr-3">整数（int）</td>
                    <td className="py-2 font-mono">printf / scanf</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">%f</td>
                    <td className="py-2 pr-3">実数（double）を表示</td>
                    <td className="py-2 font-mono">printf</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">%lf</td>
                    <td className="py-2 pr-3">実数（double）を読み取る</td>
                    <td className="py-2 font-mono">scanf</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Note>
              scanf で double を読み取るときに <code>%f</code> を使うと値が壊れます。
              <strong>scanf は %lf、printf は %f</strong> と覚えましょう。
            </Note>

            <h3 className="mt-4 font-semibold">桁指定（実数の場合）</h3>
            <ul>
              <li>
                <code>%N.Mf</code>：全体で N 桁（小数点も含む）、小数部 M 桁。
              </li>
              <li>
                <code>%Nf</code>：全体を N 桁で表示。
              </li>
              <li>
                <code>%.Mf</code>：小数部を M 桁で表示。
              </li>
            </ul>
            <p>
              例：<code>%5.1f</code> は全体5桁・小数部1桁。値が収まらないときは小数部の桁が
              守られ、全体の桁数は無視されます（はみ出して表示される）。桁指定は見た目の
              問題なので、課題では必須でないことが多いです。
            </p>

            <h3 className="mt-4 font-semibold">実数型定数の書き分け</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-3 font-semibold">表記</th>
                    <th className="py-2 pr-3 font-semibold">型</th>
                    <th className="py-2 font-semibold">意味</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 pr-3 font-mono">2</td>
                    <td className="py-2 pr-3">int</td>
                    <td className="py-2">整数の 2</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">2.0</td>
                    <td className="py-2 pr-3">double</td>
                    <td className="py-2">実数の 2.0</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2">
              この違いが次の「整数除算」の話につながります。
            </p>
          </Section>

          <Section id="cast" title="5. 整数除算とキャスト">
            <p>
              計算はデータ型ごとに行われ、<strong>整数同士の割り算の答えは整数</strong>
              になります（小数部は切り捨て）。10 ÷ 3 は 3 です。
            </p>
            <CodeBlock>{`int a = 10, n = 3;
double b;

b = a / n;             /* × 3.0 になる（整数同士の割り算が先） */
b = (double)a / n;     /* ○ 3.333... になる */`}</CodeBlock>
            <p>
              <code>(double)</code> はキャスト演算子で、「この計算のときだけ double 型として
              扱う」という指示です。分子・分母のどちらかを実数にすれば、もう一方も暗黙の型変換で
              実数になります。
            </p>
            <p>
              暗黙の型変換では、型の階級が高い方（整数型 &lt; 実数型）に自動で合わせられます。
              ただし「整数同士の計算」が先に確定してしまうと、あとから double に代入しても
              小数は戻りません。
            </p>
            <Note>
              実数を扱う問題で <code>/ 2</code> のように整数定数で割っている箇所は、
              自動チェックでも警告します。<code>2.0</code> で割るか、キャストしましょう。
            </Note>
          </Section>

          <Section id="math" title="6. 標準関数（math.h）">
            <p>
              三角関数や対数などの数学計算には標準関数を使います。角度の単位はラジアンです。
              使うときは <code>#include &lt;math.h&gt;</code> が必要です。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-3 font-semibold">関数</th>
                    <th className="py-2 font-semibold">意味</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 pr-3 font-mono">sin(x)</td>
                    <td className="py-2">三角関数（正弦）。引数はラジアン</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">cos(x)</td>
                    <td className="py-2">三角関数（余弦）。引数はラジアン</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">tan(x)</td>
                    <td className="py-2">三角関数（正接）。sin / cos でも計算できる</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">sqrt(x)</td>
                    <td className="py-2">平方根（Square Root）</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">log(x)</td>
                    <td className="py-2">自然対数（底は e）</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">log10(x)</td>
                    <td className="py-2">常用対数（底は 10）</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">exp(x)</td>
                    <td className="py-2">指数関数</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <CodeBlock>{`#include <stdio.h>
#include <math.h>   /* 数学標準関数を使うために必要 */

int main(void)
{
    double pi = 3.1416;
    printf("sin(pi/2) = %.3f\\n", sin(pi / 2.0));
    return 0;
}`}</CodeBlock>
            <p>
              円周率は問題文の指定（3.1416 など）に従います。
              <code>pi / 6</code> のように書くと整数除算になり 0 になるので、
              <code>pi / 6.0</code> と書きましょう。
            </p>
            <p>
              <Link href="/problems" className="font-semibold text-primary hover:underline">
                1.4 の例題・課題で練習する →
              </Link>
            </p>
          </Section>

          <Section id="filename" title="7. ファイル名のルール">
            <ul>
              <li>使用できる文字は半角英数字とアンダースコア（_）のみ。</li>
              <li>全角文字・空白（スペース）・途中の <code>.</code>（ドット）は禁止。</li>
              <li>必ずアルファベットから始める。小文字を使うのが基本。</li>
              <li>
                拡張子は必ず <code>.c</code>（例：<code>hello.c</code>、
                <code>k1_1.c</code>）。
              </li>
            </ul>
            <p>
              コンパイルの例：<code>cl hello.c</code>（Windows の開発環境によって異なります）。
            </p>
          </Section>

          <Section id="handwriting" title="8. 手書き文字の書き分け">
            <p>
              手書きのテストやノートでは、形が似た文字を間違えないように書き分けます。
              原則として筆記体は使いません。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-3 font-semibold">文字</th>
                    <th className="py-2 font-semibold">書き分けのポイント</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 pr-3 font-mono">l / I / 1 / 7</td>
                    <td className="py-2">
                      小文字エルは曲線を意識、大文字アイは上下にセリフ、1はまっすぐ、7は斜め
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">O / 0 / D</td>
                    <td className="py-2">ゼロには斜線を入れる。O と D の形を明確に</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">+ / t</td>
                    <td className="py-2">t は下部をはねる</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">2 / Z</td>
                    <td className="py-2">Z は中央に横線を入れる</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">9 / q / g</td>
                    <td className="py-2">q と g はテールの曲げ方で書き分ける</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">5 / S</td>
                    <td className="py-2">5 は角を意識、S は丸みを持たせる</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-mono">u / v</td>
                    <td className="py-2">u は底面に丸み＋右下に縦線、v は底面を尖らせる</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="flowchart" title="9. フローチャートの記号">
            <p>
              プログラムの流れを図で表したものがフローチャート（流れ図）です。厳密には
              アルゴリズムを表現するためのものです。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-3 font-semibold">記号</th>
                    <th className="py-2 pr-3 font-semibold">名称</th>
                    <th className="py-2 font-semibold">役割</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 pr-3">長方形</td>
                    <td className="py-2 pr-3">処理</td>
                    <td className="py-2">代入・計算などの一般的な処理</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">ひし形</td>
                    <td className="py-2 pr-3">分岐</td>
                    <td className="py-2">条件分岐（if 文など）</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">六角形（上下平ら）</td>
                    <td className="py-2 pr-3">反復</td>
                    <td className="py-2">繰り返し処理の開始・終了</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">角丸長方形</td>
                    <td className="py-2 pr-3">端子</td>
                    <td className="py-2">始端子・終端子（スタート／エンド）</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">円形</td>
                    <td className="py-2 pr-3">結合子</td>
                    <td className="py-2">処理の合流点</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">二重線の長方形</td>
                    <td className="py-2 pr-3">定義済み処理</td>
                    <td className="py-2">別途定義された関数・処理の呼び出し</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">平行四辺形</td>
                    <td className="py-2 pr-3">データ</td>
                    <td className="py-2">データの入出力</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">六角形（横長）</td>
                    <td className="py-2 pr-3">準備</td>
                    <td className="py-2">メイン処理の前に行う初期化など</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">矢印・線</td>
                    <td className="py-2 pr-3">線</td>
                    <td className="py-2">処理の流れ</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2">
              参考：システムフローチャートの記号として、台形＝手入力、凸型＝表示 があります
              （プログラムフローチャートではあまり使いません）。
            </p>
          </Section>

          <div className="rounded-lg border border-primary/25 bg-primary-soft p-5">
            <p className="text-sm font-semibold">準備ができたら問題を解いてみましょう</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              判定は模範解答と一字一句同じである必要はありません。問題の条件を満たしていれば
              正解です。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/problems" className="btn-primary">
                問題一覧へ
              </Link>
              <Link href="/" className="btn-secondary">
                ホームへ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
