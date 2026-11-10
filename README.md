# プログラミング練習（C言語 第1章）

Google Drive の演習資料（問題・授業ノート・解答例）をもとにした、C言語の例題・課題の練習サイトです。
問題一覧／ランダム出題から選んでコードを書き、**Sarashina API** が正誤と間違いの解説を返します。

- フレームワーク: Next.js 15（App Router）+ TypeScript + Tailwind CSS
- エディタ: CodeMirror 6
- 判定: Sarashina API（`sarashina3-mini` / `sarashina3-nano`）
- 進捗: ブラウザの localStorage（JSON でバックアップ・復元可能）
- デプロイ: Vercel（Hobby）想定。API キーはサーバー側（Route Handler）だけが保持します。

**公開 URL**: https://programming-practice-lemon.vercel.app

## 収録内容

| セクション | 内容 | 問題数 |
| --- | --- | --- |
| 1.1 | printf で文字・模様を表示 | 例題1 + 課題3 |
| 1.2 | int・scanf・四則演算 | 例題1 + 課題3 |
| 1.3 | double・キャスト・桁指定 | 例題1 + 課題5 |
| 1.4 | math.h の標準関数 | 例題1 + 課題4 |

合計 19 問。各問題に問題文・入力例・期待される出力・ヒント・採点チェックリスト・よくある間違い・
解答例（判定後のみ表示）を持たせています。

## セットアップ

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
# .env.local の SARASHINA_API_KEY に API キーを設定
npm run dev
```

http://localhost:3000 を開きます。

> 作業フォルダは `C:\dev\programming-practice` です。
> OneDrive 上に置くと `node_modules` の読み書きが遅く、C: の空き容量も圧迫するため、
> OneDrive の外（`C:\dev`）に置いています。`node_modules` と `.next` は再生成できるので、
> 別の場所に移したら `npm install` をやり直してください。
> （USB メモリは FAT32 だと Next.js のビルドが通らないため、NTFS のドライブが必要です）

### API キーの確認

```bash
curl http://localhost:3000/api/health
```

`apiKeyConfigured` が `true` なら判定 API を呼べます。

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | ビルド結果を起動 |
| `npm run typecheck` | TypeScript の型チェック |

判定 API の動作確認（サーバー起動中に実行）:

```bash
node tools/test-judge.mjs ex-1-1 docs/drive_source/c/r1-1.c
node tools/test-judge.mjs k-1-2a docs/drive_source/c/k1-2a.c sarashina3-nano
```

## 判定のしくみ

1. ブラウザ内の静的チェック（`src/lib/lint.ts`）が、全角文字・`int main` の欠落・
   `#include <stdio.h>` 忘れ・`scanf` の `&` 忘れ・セミコロン・整数除算などを先に指摘します。
2. 「判定する」で `POST /api/judge` にコードを送信します。
3. サーバー側（`src/app/api/judge/route.ts`）が Sarashina API を呼び、JSON Schema で
   `verdict` / `score` / `issues` / `output_check` などを受け取り、正規化して返します。
4. 画面に判定結果と解説を表示し、**その後に** `/api/solution` から解答例を取得して表示します。

コードは実行しません。AI が1行ずつ読んで、入力例に対する出力を推測して判定します。
解答は1つではないため、模範解答と書き方が違っても要件を満たしていれば正解になります。

### API キーを隠すためのポイント

- キーは `SARASHINA_API_KEY`（`NEXT_PUBLIC_` を付けない）として **サーバーだけで** 読みます。
- ブラウザから直接 Sarashina API を叩かないため、開発者ツールからキーは見えません。
- `export const preferredRegion = "hnd1"` で東京リージョン実行にしています
  （Sarashina は日本国外 IP を 403 で拒否するため）。Vercel でも同様に反映されます。
- `POST /api/judge` に簡易レート制限（同一 IP・1分10回）を入れています。

## Vercel へのデプロイ

1. GitHub などにこのフォルダを push します。
2. Vercel でプロジェクトを作成（Framework Preset: Next.js）。リポジトリ直下がこのフォルダになるようにします（サブフォルダに置いた場合は Root Directory にそのフォルダ名を指定）。
3. Project Settings → Environment Variables に `SARASHINA_API_KEY` を登録（Production / Preview）。
4. Deploy。関数リージョンは `hnd1`（東京）になります。
5. `/api/health` にアクセスして `apiKeyConfigured: true` を確認。

## ディレクトリ構成

```
src/
  app/
    page.tsx                 ホーム（進捗・ランダム出題）
    problems/page.tsx        問題一覧
    problems/[id]/page.tsx   出題・判定画面
    notes/page.tsx           学習ノート
    progress/page.tsx        進捗のバックアップ / 復元
    api/judge/route.ts       判定 API（Sarashina）
    api/solution/route.ts    解答例の取得（判定後）
    api/health/route.ts      設定確認
  components/                UI コンポーネント（CodeMirror・判定結果など）
  data/problems.ts           problems.json の型と一覧
  data/problems.json         19問の問題データ（模範解答を含む・サーバー専用）
  lib/lint.ts                提出前の静的チェック
  lib/sarashina.ts           プロンプト・JSON Schema・API 呼び出し
  lib/storage.ts             localStorage の進捗・下書き
docs/
  SPEC.md                    仕様
  problems_meta.json         問題メタ情報（原本）
  drive_source/              Drive から取得した問題文・ノート・解答例
tools/
  build_problems.py          meta + 解答例 → src/data/problems.json
  test-judge.mjs             判定 API の動作確認スクリプト
```

## データの再生成

問題文や解答例を更新したときは `docs/problems_meta.json` を編集してから:

```bash
python tools/build_problems.py
```

## 注意

- 教材は Google Drive の演習資料に基づきます。解答例は「あくまで一例」であり、
  最善手とは限りません（資料の注意書きに準拠）。
- 問題 PDF に図が無い箇所（星模様・図1.1 の三角形・図1.2 の並列回路）は、
  本文と解答例から仕様を起こして SVG / テキストで作成しています。
