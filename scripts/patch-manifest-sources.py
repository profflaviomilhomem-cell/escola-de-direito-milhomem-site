#!/usr/bin/env python3
"""Atualiza sourceFile/sourceArchive no manifest sem reextrair vídeos."""
import json
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "src/data/provas-digitais-manifest.json"
SOURCE = ROOT / "public/curso/milhomem"


def kind(path: str) -> str:
    u = path.upper()
    if re.search(r"EDITAD|EDITA\)|_EDIT|\(EDIT", u):
        return "editado"
    if re.search(r"CRUA|BRUTA|GRAVA|PARA EDITAR", u):
        return "cru"
    return "outro"


def lesson_num(path: str) -> int | None:
    m = re.search(r"AULA\s*0*(\d+)", path, re.I)
    return int(m.group(1)) if m else None


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    index: dict[tuple[int, int, bool], list[dict]] = {}

    for zpath in SOURCE.glob("*.zip"):
        with zipfile.ZipFile(zpath) as zf:
            for info in zf.infolist():
                low = info.filename.lower()
                if not (low.endswith(".mp4") or low.endswith(".pptx")):
                    continue
                n = lesson_num(info.filename)
                if not n:
                    continue
                is_video = low.endswith(".mp4")
                key = (n, info.file_size, is_video)
                index.setdefault(key, []).append(
                    {
                        "archive": zpath.name,
                        "file": info.filename.split("/")[-1],
                        "kind": kind(info.filename),
                    }
                )

    for f in SOURCE.glob("*.mp4"):
        n = lesson_num(f.name)
        if n:
            key = (n, f.stat().st_size, True)
            index.setdefault(key, []).append(
                {
                    "archive": "(solto)",
                    "file": f.name,
                    "kind": kind(f.name),
                }
            )

    for entry in manifest["lessons"]:
        n = entry["number"]
        video = entry.get("video")
        if video:
            sz = video["bytes"]
            cands = index.get((n, sz, True), [])
            edited = [c for c in cands if c["kind"] == "editado"]
            pick = edited[0] if edited else (cands[0] if cands else None)
            if pick:
                video["variant"] = pick["kind"]
                video["sourceArchive"] = pick["archive"]
                video["sourceFile"] = pick["file"]
            video.pop("source", None)

        slides = entry.get("slides")
        if slides:
            sz = slides["bytes"]
            cands = index.get((n, sz, False), [])
            pick = cands[0] if cands else None
            if pick:
                slides["sourceArchive"] = pick["archive"]
                slides["sourceFile"] = pick["file"]
            slides.pop("source", None)

    manifest["importedAt"] = datetime.now(timezone.utc).isoformat()
    MANIFEST.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print("Manifest atualizado com sourceFile/sourceArchive.")


if __name__ == "__main__":
    main()
