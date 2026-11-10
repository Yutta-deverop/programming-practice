/**
 * 表示用のユーティリティ。
 *
 * 日本の入門書では C のバックスラッシュ（\）を円マーク（¥）で表記する
 * （JIS の文字集合では同じ文字として扱われる）。授業の資料に合わせるため、
 * 画面に出すときだけ \ を ¥ に置き換える。
 *
 * コード本体・localStorage・判定 API へ送る文字列は半角の \ のまま扱う。
 */

export const YEN_MARK = "\u00A5";

/** バックスラッシュを円マークに置き換えた表示用の文字列を返す。 */
export function yenText(text: string): string {
  return text.includes("\\") ? text.replace(/\\/g, YEN_MARK) : text;
}
