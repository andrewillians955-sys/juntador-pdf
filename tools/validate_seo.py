#!/usr/bin/env python3
"""Valida presença de canonical e hreflang nos HTML."""
from __future__ import annotations

import importlib.util
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_apply_module():
    p = ROOT / "tools" / "apply_seo_canonical_hreflang.py"
    spec = importlib.util.spec_from_file_location("apply_seo", p)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(mod)
    return mod


def main() -> int:
    mod = load_apply_module()
    files = sorted(mod.FILE_SEO.keys())
    err = 0
    for name in files:
        path = ROOT / name
        if not path.exists():
            print(f"[ERRO] ficheiro em falta: {name}")
            err += 1
            continue
        t = path.read_text(encoding="utf-8")
        can = len(re.findall(r'<link\s+rel="canonical"', t, re.I))
        alts = re.findall(
            r'<link\s+rel="alternate"\s+hreflang="([^"]+)"', t, re.I
        )
        if can != 1:
            print(f"[ERRO] {name}: esperado 1 canonical, tem {can}")
            err += 1
        if len(alts) != 4:
            print(f"[ERRO] {name}: esperado 4 hreflang, tem {len(alts)} ({alts})")
            err += 1
        if len(set(alts)) != 4:
            print(f"[ERRO] {name}: hreflang duplicados ou em falta: {alts}")
            err += 1
    if err == 0:
        print(f"OK: {len(files)} ficheiros com 1 canonical e 4 hreflang.")
    return 1 if err else 0


if __name__ == "__main__":
    sys.exit(main())
