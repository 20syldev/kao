#!/usr/bin/env python3
"""Offline check that every part referenced by the editor menus is present in public/.

Usage: assets.py
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public"
# Typo in the m/05/05 descriptor ("1.swf" next to "01.swf"): this file never existed.
KNOWN_MISSING = {"library/m/05/05/1.swf"}


def expected_files():
    """List every swf referenced by menu.xml + descriptor.xml files."""
    menu = (OUT / "library/menu.xml").read_text(encoding="utf-8", errors="replace")
    expected, descriptors = set(), set()
    for link in re.finditer(r"<link\b([^>]*)>(.*?)</link>", menu, re.S):
        attrs = link.group(1)
        # Hidden categories load their parts by path, without a descriptor.
        if 'hidden="Y"' in attrs:
            continue
        directory = re.search(r'dir="(\d+)"', attrs).group(1)
        for sub in re.finditer(r'<sub_link\b([^>]*)>\s*(\d+)\s*</sub_link>', link.group(2)):
            scope = re.search(r'gender="(\w)"', sub.group(1))
            families = ["f", "m"] if not scope or scope.group(1).lower() == "b" else [
                scope.group(1).lower()
            ]
            for family in families:
                descriptors.add(f"library/{family}/{directory}/{sub.group(2)}/descriptor.xml")
    for desc in sorted(descriptors):
        file = OUT / desc
        if not file.exists():
            expected.add(desc)
            continue
        text = file.read_text(encoding="utf-8", errors="replace")
        main_path = re.search(r'main_path="([^"]+)"', text)
        base = main_path.group(1) if main_path else desc.rsplit("/", 1)[0]
        for item in re.findall(r"<item>\s*([^<\s]+\.swf)\s*</item>", text):
            expected.add(f"{base}/{item}")
        expected.add(desc)
    return expected


def check():
    """Offline check: every part referenced by the menus exists locally."""
    missing = sorted(p for p in expected_files() if not (OUT / p).exists())
    unexpected = [p for p in missing if p not in KNOWN_MISSING]
    for path in unexpected:
        print(f"missing: {path}")
    print(f"{len(missing)} missing, {len(unexpected)} unexpected")
    return 1 if unexpected else 0


if __name__ == "__main__":
    sys.exit(check())
