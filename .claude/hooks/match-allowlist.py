#!/usr/bin/env python3
"""match-allowlist.py — Glob-aware allowlist match for the /implement lock.

Usage:
    match-allowlist.py <rel-path> <lock-path>

Reads the JSON lock at <lock-path>, iterates `files[]`, and returns:
    exit 0 — at least one entry matches <rel-path>.
    exit 1 — no entry matches.

Matching semantics:
    - Literal paths compare with string equality (the common case where
      the spec lists concrete files).
    - Entries containing glob metacharacters (`*`, `?`, `[`) match via
      fnmatch.fnmatchcase.
    - `**` is supported as "zero or more path segments", emulating
      pathlib.PurePath.match. `apps/**/*.test.ts` matches
      `apps/x/y/a.test.ts` and `apps/a.test.ts`.

Spec 131 §4.1.
"""

from __future__ import annotations

import fnmatch
import json
import re
import sys


def _has_meta(pattern: str) -> bool:
    return any(c in pattern for c in "*?[")


def _matches(rel: str, pattern: str) -> bool:
    if not _has_meta(pattern):
        return rel == pattern
    if "**" in pattern:
        # Translate `**` to a regex fragment that spans path segments
        # (including zero segments), keep other metacharacters to
        # fnmatch's regex translation.
        parts = pattern.split("**")
        regex_parts = []
        for i, part in enumerate(parts):
            if i > 0:
                regex_parts.append(r".*")
            # fnmatch.translate yields a full-string regex; strip its
            # anchors so we can stitch fragments.
            translated = fnmatch.translate(part)
            translated = re.sub(r"^\(\?s:", "", translated)
            translated = re.sub(r"\)\\Z$", "", translated)
            translated = re.sub(r"\\Z$", "", translated)
            regex_parts.append(translated)
        regex = "(?s:" + "".join(regex_parts) + r")\Z"
        return re.match(regex, rel) is not None
    return fnmatch.fnmatchcase(rel, pattern)


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(f"Usage: {argv[0]} <rel-path> <lock-path>", file=sys.stderr)
        return 2
    rel, lock_path = argv[1], argv[2]
    try:
        with open(lock_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, ValueError):
        return 1
    for entry in data.get("files") or []:
        if _matches(rel, entry):
            return 0
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
