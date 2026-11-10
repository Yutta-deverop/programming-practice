import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-sm font-bold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold">ページが見つかりません</h1>
      <p className="mt-2 max-w-prose text-sm leading-7 text-muted-foreground">
        問題が削除されたか、URL が変わった可能性があります。問題一覧から選び直してください。
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/problems" className="btn-primary">
          問題一覧へ
        </Link>
        <Link href="/" className="btn-secondary">
          ホームへ
        </Link>
      </div>
    </div>
  );
}
