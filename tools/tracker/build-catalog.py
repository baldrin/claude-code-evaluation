#!/usr/bin/env python3
"""Embed the test catalog (IDs, priorities, titles) into tracker.html.

Run after adding or renaming tests:
    python3 tools/tracker/build-catalog.py
Options:
    --catalog DIR   folder with the catalog Markdown files (default: docs/03-test-plan/catalog)
    --tracker FILE  tracker HTML to update (default: tools/tracker/tracker.html)
"""
import argparse
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROW = re.compile(r"^\| \[([A-Z]+-\d{3})\]\(#[a-z]+-\d{3}\) \| (.*?) \| (P\d) \|", re.M)
BLOCK = re.compile(r'(<script id="catalog-data" type="application/json">\n)(.*?)(\n</script>)', re.S)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--catalog", type=Path, default=HERE.parent.parent / "docs/03-test-plan/catalog")
    ap.add_argument("--tracker", type=Path, default=HERE / "tracker.html")
    args = ap.parse_args()

    tests = []
    for f in sorted(args.catalog.glob("*.md")):
        for m in ROW.finditer(f.read_text(encoding="utf-8")):
            title = re.sub(r"\s*\[verify\]\s*", " ", m.group(2)).strip()
            tests.append({"id": m.group(1), "pri": m.group(3), "title": title, "domain": m.group(1).split("-")[0]})
    if not tests:
        raise SystemExit(f"No tests found under {args.catalog}")
    ids = [t["id"] for t in tests]
    dups = sorted({i for i in ids if ids.count(i) > 1})
    if dups:
        raise SystemExit(f"Duplicate test IDs: {', '.join(dups)}")

    html = args.tracker.read_text(encoding="utf-8")
    payload = json.dumps(tests, ensure_ascii=False, indent=0).replace("</", "<\\/")
    new, n = BLOCK.subn(lambda m: m.group(1) + payload + m.group(3), html)
    if n != 1:
        raise SystemExit("Couldn't find the catalog-data block in the tracker")
    args.tracker.write_text(new, encoding="utf-8")
    p0 = sum(1 for t in tests if t["pri"] == "P0")
    print(f"Embedded {len(tests)} tests ({p0} P0) into {args.tracker}")


if __name__ == "__main__":
    main()
