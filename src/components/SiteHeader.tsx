import Link from "next/link";

const NAV = [
  { href: "/", label: "ホーム" },
  { href: "/problems", label: "問題一覧" },
  { href: "/notes", label: "学習ノート" },
  { href: "/progress", label: "進捗" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary font-mono text-sm font-bold text-primary-foreground">
            C
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold">プログラミング練習</span>
            <span className="hidden text-[11px] text-muted-foreground sm:inline">
              C言語 第1章 例題・課題
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-2 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground sm:px-3 sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
