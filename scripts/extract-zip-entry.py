#!/usr/bin/env python3
"""Extrai uma entrada de ZIP por regex no caminho (suporta nomes com acentos)."""
import re
import sys
import zipfile


def main() -> None:
    if len(sys.argv) != 4:
        print("uso: extract-zip-entry.py <zip> <dest> <regex>", file=sys.stderr)
        sys.exit(2)
    zip_path, dest_path, pattern = sys.argv[1], sys.argv[2], sys.argv[3]
    pat = re.compile(pattern, re.IGNORECASE)
    with zipfile.ZipFile(zip_path) as zf:
        for name in zf.namelist():
            if pat.search(name):
                with open(dest_path, "wb") as out:
                    out.write(zf.read(name))
                print(name)
                return
    sys.exit(1)


if __name__ == "__main__":
    main()
