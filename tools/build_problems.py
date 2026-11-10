"""problems_meta.json と Drive から取得した解答コードを結合して src/data/problems.json を作る。

使い方:  python tools/build_problems.py
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
META = ROOT / "docs" / "problems_meta.json"
SOLUTIONS = ROOT / "docs" / "drive_source" / "c"
OUT = ROOT / "src" / "data" / "problems.json"


def main() -> None:
    meta = json.loads(META.read_text(encoding="utf-8"))
    problems = []
    for item in meta:
        references = []
        for filename in item["referenceFiles"]:
            path = SOLUTIONS / filename
            if not path.exists():
                raise FileNotFoundError(f"解答ファイルが見つかりません: {path}")
            references.append(
                {
                    "filename": filename,
                    "code": path.read_text(encoding="utf-8").rstrip("\n"),
                }
            )
        problem = dict(item)
        problem.pop("referenceFiles", None)
        problem["references"] = references
        problems.append(problem)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(problems, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"{len(problems)} 問を書き出しました: {OUT}")


if __name__ == "__main__":
    main()
