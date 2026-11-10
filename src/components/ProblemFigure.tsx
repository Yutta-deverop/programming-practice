import type { Problem } from "@/data/problems";

export function ProblemFigure({
  problem,
}: {
  problem: Pick<Problem, "figure" | "expected">;
}) {
  if (problem.figure === "star") {
    return (
      <figure className="rounded-md border border-border bg-surface-2 p-4">
        <figcaption className="mb-2 text-xs font-semibold text-muted-foreground">
          表示したい模様（解答例より）
        </figcaption>
        <pre className="overflow-x-auto text-[11px] leading-[1.15] tracking-[0.02em] text-foreground sm:text-xs">
          {problem.expected.join("\n")}
        </pre>
      </figure>
    );
  }

  if (problem.figure === "triangle") {
    return (
      <figure className="rounded-md border border-border bg-surface-2 p-4">
        <figcaption className="mb-2 text-xs font-semibold text-muted-foreground">
          図1.1：三角形（y₂ = y₁）
        </figcaption>
        <svg viewBox="0 0 420 260" className="h-auto w-full max-w-md" role="img" aria-label="三角形の図">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="#94a3b8" />
            </marker>
          </defs>
          {/* 軸 */}
          <line x1="50" y1="210" x2="390" y2="210" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <line x1="50" y1="210" x2="50" y2="24" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="394" y="214" fontSize="12" fill="#64748b">x</text>
          <text x="38" y="20" fontSize="12" fill="#64748b">y</text>

          {/* 三角形 */}
          <polygon points="110,170 330,170 250,60" fill="#eef1ff" stroke="#3450cf" strokeWidth="2" />

          {/* 高さ */}
          <line x1="250" y1="60" x2="250" y2="170" stroke="#c2410c" strokeWidth="1.5" strokeDasharray="5 4" />
          <text x="258" y="120" fontSize="12" fill="#c2410c">高さ = y₃ − y₁</text>

          {/* 底辺 */}
          <text x="120" y="190" fontSize="12" fill="#3450cf">底辺 = x₂ − x₁</text>

          {/* 点 */}
          <circle cx="110" cy="170" r="3.5" fill="#3450cf" />
          <circle cx="330" cy="170" r="3.5" fill="#3450cf" />
          <circle cx="250" cy="60" r="3.5" fill="#3450cf" />

          <text x="86" y="190" fontSize="12" fill="#1e293b">(x₁, y₁)</text>
          <text x="300" y="190" fontSize="12" fill="#1e293b">(x₂, y₂)</text>
          <text x="258" y="52" fontSize="12" fill="#1e293b">(x₃, y₃)</text>

          <text x="112" y="228" fontSize="11" fill="#64748b">y₂ = y₁ なので、底辺は水平</text>
        </svg>
      </figure>
    );
  }

  if (problem.figure === "parallel-resistor") {
    return (
      <figure className="rounded-md border border-border bg-surface-2 p-4">
        <figcaption className="mb-2 text-xs font-semibold text-muted-foreground">
          図1.2：並列接続
        </figcaption>
        <svg viewBox="0 0 420 220" className="h-auto w-full max-w-sm" role="img" aria-label="並列抵抗の図">
          {/* 左の配線 */}
          <line x1="60" y1="60" x2="150" y2="60" stroke="#334155" strokeWidth="2" />
          <line x1="60" y1="160" x2="150" y2="160" stroke="#334155" strokeWidth="2" />
          <line x1="60" y1="60" x2="60" y2="160" stroke="#334155" strokeWidth="2" />

          {/* R1 */}
          <rect x="150" y="48" width="80" height="24" fill="#eef1ff" stroke="#3450cf" strokeWidth="2" />
          <text x="172" y="42" fontSize="13" fill="#3450cf">R₁</text>
          <line x1="230" y1="60" x2="330" y2="60" stroke="#334155" strokeWidth="2" />

          {/* R2 */}
          <rect x="150" y="148" width="80" height="24" fill="#fff2ea" stroke="#c2410c" strokeWidth="2" />
          <text x="172" y="142" fontSize="13" fill="#c2410c">R₂</text>
          <line x1="230" y1="160" x2="330" y2="160" stroke="#334155" strokeWidth="2" />

          {/* 右の配線 */}
          <line x1="330" y1="60" x2="330" y2="160" stroke="#334155" strokeWidth="2" />
          <line x1="330" y1="110" x2="380" y2="110" stroke="#334155" strokeWidth="2" />
          <circle cx="392" cy="110" r="10" fill="none" stroke="#334155" strokeWidth="2" />
          <text x="387" y="114" fontSize="11" fill="#334155">R</text>

          <text x="60" y="196" fontSize="11" fill="#64748b">
            合成抵抗 R = R₁R₂ / (R₁ + R₂)
          </text>
        </svg>
      </figure>
    );
  }

  return null;
}
