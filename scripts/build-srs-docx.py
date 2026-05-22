#!/usr/bin/env python3
"""Convert SRS markdown to docx with rendered Mermaid diagrams via mermaid.ink."""
import base64
import re
import ssl
import subprocess
import sys
import urllib.request
from pathlib import Path

import certifi

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "SRS-Karang-Taruna.md"
OUT_MD = ROOT / "docs" / "_build" / "SRS-Karang-Taruna.docx.md"
OUT_DOCX = ROOT / "docs" / "SRS-Karang-Taruna.docx"
IMG_DIR = ROOT / "docs" / "_build" / "diagrams"
IMG_DIR.mkdir(parents=True, exist_ok=True)
OUT_MD.parent.mkdir(parents=True, exist_ok=True)

CTX = ssl.create_default_context(cafile=certifi.where())


def render_mermaid(code: str, idx: int) -> Path:
    encoded = base64.urlsafe_b64encode(code.encode("utf-8")).decode("ascii").rstrip("=")
    url = f"https://mermaid.ink/img/{encoded}?type=png&bgColor=ffffff"
    out = IMG_DIR / f"diagram-{idx:02d}.png"
    print(f"[{idx}] Fetching {len(code)}b mermaid -> {out.name} ...")
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8"})
    with urllib.request.urlopen(req, context=CTX, timeout=120) as r:
        data = r.read()
    out.write_bytes(data)
    print(f"    -> {len(data)} bytes")
    return out


def main() -> int:
    text = SRC.read_text(encoding="utf-8")

    pattern = re.compile(r"```mermaid\n(.*?)\n```", re.DOTALL)
    counter = {"i": 0}

    def replace(match: "re.Match[str]") -> str:
        counter["i"] += 1
        idx = counter["i"]
        code = match.group(1)
        try:
            img = render_mermaid(code, idx)
            rel = img.relative_to(OUT_MD.parent)
            return f"\n![Diagram {idx}]({rel.as_posix()})\n"
        except Exception as exc:
            print(f"   FAILED diagram {idx}: {exc}", file=sys.stderr)
            return f"\n> _(Diagram {idx} - rendering gagal)_\n\n```\n{code}\n```\n"

    new_text = pattern.sub(replace, text)
    OUT_MD.write_text(new_text, encoding="utf-8")
    print(f"Wrote intermediate markdown: {OUT_MD}")
    print(f"Diagrams rendered: {counter['i']}")

    pandoc = "/root/pandoc-3.5/bin/pandoc"
    cmd = [
        pandoc,
        str(OUT_MD),
        "-o", str(OUT_DOCX),
        "--from", "gfm+pipe_tables+task_lists",
        "--toc",
        "--toc-depth=3",
        "--standalone",
        "--resource-path", str(OUT_MD.parent),
    ]
    print("Running:", " ".join(cmd))
    subprocess.run(cmd, check=True)
    print(f"Wrote DOCX: {OUT_DOCX} ({OUT_DOCX.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
