#!/usr/bin/env python3
"""bash-write-targets.py — Extract write-target paths from a bash command.

Reads a single bash command from stdin and emits one line per detected
write-target path, or `__UNKNOWN__:<reason>` when the command contains a
construct opaque to static inspection (eval, dynamic redirect target,
xargs into a known mutator). Read-only commands produce no output.

Spec 055 §4.2.
"""

from __future__ import annotations

import os.path
import re
import shlex
import sys
from dataclasses import dataclass
from typing import Iterable, List, Optional, Tuple

# Commands that take one or more path arguments and mutate them.
PATH_MUTATORS = {
    "rm": "all",
    "touch": "all",
    "mkdir": "all",
    "chmod": "all_after_mode",
    "chown": "all_after_owner",
}

# Commands that take src... dst (last arg is the write-target).
SRC_DST_MUTATORS = {"cp", "mv", "ln"}

# Commands invoking opaque interpretation.
OPAQUE_COMMANDS = {"eval", "source", "."}

# Commands whose -c/-e flag turns the next arg into opaque code.
OPAQUE_DASH_C = {"bash", "sh", "zsh", "dash", "ksh"}


def strip_heredocs(cmd: str) -> str:
    """Remove heredoc bodies; their contents are data, not commands."""
    lines = cmd.splitlines()
    out: List[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        out.append(line)
        m = re.search(r"<<-?\s*['\"]?([A-Za-z_][A-Za-z0-9_]*)['\"]?", line)
        if m:
            tag = m.group(1)
            i += 1
            while i < len(lines) and lines[i].strip() != tag:
                i += 1
            # Drop the heredoc body and the closing tag line.
            if i < len(lines):
                i += 1
            continue
        i += 1
    return "\n".join(out)


def pad_operators(stmt: str) -> str:
    """Insert spaces around redirect operators outside quotes so shlex can
    tokenize them separately. Handles >>, &>, >&, and >."""
    out: List[str] = []
    quote: Optional[str] = None
    i = 0
    while i < len(stmt):
        c = stmt[i]
        if quote:
            out.append(c)
            if c == "\\" and i + 1 < len(stmt):
                out.append(stmt[i + 1])
                i += 2
                continue
            if c == quote:
                quote = None
            i += 1
            continue
        if c in ("'", '"'):
            quote = c
            out.append(c)
            i += 1
            continue
        if c == "\\" and i + 1 < len(stmt):
            out.append(c)
            out.append(stmt[i + 1])
            i += 2
            continue
        # Two-char operators.
        two = stmt[i:i + 2]
        if two in (">>", "&>", ">&"):
            # Avoid splitting fd-spec tail like `2>&1` adjacency: pad anyway,
            # the consumer handles "&" + digit dup detection.
            out.append(" ")
            out.append(two)
            out.append(" ")
            i += 2
            continue
        if c == ">":
            # Allow leading fd digits to remain attached: "2>" stays as "2>".
            # Pad spaces around the operator.
            out.append(" ")
            out.append(">")
            out.append(" ")
            i += 1
            continue
        out.append(c)
        i += 1
    return "".join(out)


def split_statements(cmd: str) -> List[str]:
    """Split on unquoted ; && || | and unwrap subshells/groups."""
    cmd = cmd.replace("\n", " ")
    out: List[str] = []
    buf: List[str] = []
    quote: Optional[str] = None
    i = 0
    while i < len(cmd):
        c = cmd[i]
        if quote:
            buf.append(c)
            if c == "\\" and i + 1 < len(cmd):
                buf.append(cmd[i + 1])
                i += 2
                continue
            if c == quote:
                quote = None
            i += 1
            continue
        if c in ("'", '"'):
            quote = c
            buf.append(c)
            i += 1
            continue
        if c == "\\" and i + 1 < len(cmd):
            buf.append(c)
            buf.append(cmd[i + 1])
            i += 2
            continue
        # Two-char operators.
        two = cmd[i:i + 2]
        if two in ("&&", "||"):
            out.append("".join(buf).strip())
            buf = []
            i += 2
            continue
        if c in (";", "|", "\n"):
            out.append("".join(buf).strip())
            buf = []
            i += 1
            continue
        buf.append(c)
        i += 1
    out.append("".join(buf).strip())
    # Unwrap (...) and { ...; } groups one level.
    cleaned: List[str] = []
    for stmt in out:
        s = stmt.strip()
        if not s:
            continue
        if s.startswith("(") and s.endswith(")"):
            s = s[1:-1].strip()
        if s.startswith("{") and s.endswith("}"):
            s = s[1:-1].strip().rstrip(";").strip()
        if s:
            cleaned.append(s)
    return cleaned


def has_dynamic(token: str) -> bool:
    """True if the token contains a variable or command substitution."""
    if "$" in token:
        return True
    if "`" in token:
        return True
    return False


@dataclass
class Result:
    targets: List[str]
    unknown_reasons: List[str]

    def merge(self, other: "Result") -> None:
        self.targets.extend(other.targets)
        self.unknown_reasons.extend(other.unknown_reasons)


def parse_redirects(tokens: List[str]) -> Tuple[List[str], List[str], List[str]]:
    """Pull out redirect write-targets, leaving the command tokens.

    Returns (command_tokens, write_targets, unknown_reasons).
    """
    write_targets: List[str] = []
    unknowns: List[str] = []
    cmd_tokens: List[str] = []
    i = 0
    redir_re = re.compile(r"^([0-9]*)(>>|>&|&>|>)$")
    combined_re = re.compile(r"^([0-9]*)(>>|&>|>)(.+)$")
    while i < len(tokens):
        t = tokens[i]
        # Standalone redirect operator with target as next token (try first
        # so ">>" alone is not split into ">" + ">").
        m = redir_re.match(t)
        if m:
            op = m.group(2)
            # `>&` / `&>` followed by a numeric fd is a dup, not a write.
            if i + 1 < len(tokens):
                target = tokens[i + 1]
                if op == ">&" and target.isdigit():
                    i += 2
                    continue
                if has_dynamic(target):
                    unknowns.append(f"dynamic redirect target: {target}")
                else:
                    write_targets.append(target)
                i += 2
                continue
            else:
                unknowns.append("dangling redirect operator")
                i += 1
                continue
        # Combined token like ">file" or ">>file" or "2>file".
        m = combined_re.match(t)
        if m:
            target = m.group(3)
            if has_dynamic(target):
                unknowns.append(f"dynamic redirect target: {target}")
            else:
                write_targets.append(target)
            i += 1
            continue
        cmd_tokens.append(t)
        i += 1
    return cmd_tokens, write_targets, unknowns


def parse_command_word(tokens: List[str]) -> Tuple[List[str], List[str]]:
    """Inspect the command word (post-redirect) and return write-targets.

    Returns (write_targets, unknown_reasons).
    """
    if not tokens:
        return [], []

    # Skip leading env assignments (FOO=bar BAR=baz cmd ...).
    idx = 0
    while idx < len(tokens) and re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", tokens[idx]):
        idx += 1
    if idx >= len(tokens):
        return [], []

    cmd = tokens[idx]
    args = tokens[idx + 1:]

    # Strip leading ./ or absolute path from command word for matching.
    cmd_basename = cmd.rsplit("/", 1)[-1]

    if cmd_basename in OPAQUE_COMMANDS:
        return [], [f"opaque command: {cmd_basename}"]

    if cmd_basename in OPAQUE_DASH_C:
        # `bash -c "..."`, `sh -c "..."` — check for -c / -lc.
        for a in args:
            if a in ("-c", "-lc", "-cl") or (a.startswith("-") and "c" in a):
                return [], [f"{cmd_basename} -c with opaque payload"]

    if cmd_basename == "xargs":
        # Look at the command xargs is invoking.
        # Skip xargs's own flags (-n, -I, -0, etc., simple form).
        j = 0
        while j < len(args) and args[j].startswith("-"):
            # -I {} takes a value.
            if args[j] in ("-I", "-J", "-n", "-L", "-P", "-s") and j + 1 < len(args):
                j += 2
                continue
            j += 1
        if j < len(args):
            inner = args[j].rsplit("/", 1)[-1]
            if inner in PATH_MUTATORS or inner in SRC_DST_MUTATORS or inner == "tee":
                return [], [f"xargs into mutator: {inner}"]
        return [], []

    if cmd_basename == "find":
        # `find ... -delete` or `-exec rm/cp/mv/...`.
        for k, a in enumerate(args):
            if a == "-delete":
                return [], ["find -delete (paths unknown)"]
            if a in ("-exec", "-execdir") and k + 1 < len(args):
                inner = args[k + 1].rsplit("/", 1)[-1]
                if inner in PATH_MUTATORS or inner in SRC_DST_MUTATORS or inner == "tee" or inner == "sed":
                    return [], [f"find -exec into mutator: {inner}"]
        return [], []

    if cmd_basename == "tee":
        return _parse_tee(args)

    if cmd_basename == "sed":
        return _parse_sed(args)

    if cmd_basename == "awk":
        return _parse_awk(args)

    if cmd_basename in PATH_MUTATORS:
        return _parse_path_mutator(cmd_basename, args)

    if cmd_basename in SRC_DST_MUTATORS:
        return _parse_src_dst(cmd_basename, args)

    return [], []


def _flag_value_args(arg: str) -> bool:
    """Heuristic: treat tokens starting with - as flags (no path)."""
    return arg.startswith("-")


def _classify_dynamic(paths: List[str]) -> Tuple[List[str], List[str]]:
    targets: List[str] = []
    unknowns: List[str] = []
    for p in paths:
        if has_dynamic(p):
            unknowns.append(f"dynamic path: {p}")
        else:
            targets.append(p)
    return targets, unknowns


def _parse_tee(args: List[str]) -> Tuple[List[str], List[str]]:
    paths = [a for a in args if not _flag_value_args(a)]
    return _classify_dynamic(paths)


def _parse_sed(args: List[str]) -> Tuple[List[str], List[str]]:
    # In-place edit only mutates files. Detect -i / -i'' / -i ''.
    in_place = False
    j = 0
    while j < len(args):
        a = args[j]
        if a == "-i":
            in_place = True
            # GNU: -i with no arg, or -i SUFFIX. BSD: -i '' SUFFIX or -i SUFFIX.
            # If next arg is a suffix (typically empty string), skip it.
            if j + 1 < len(args) and (args[j + 1] == "" or (
                not args[j + 1].startswith("-")
                and not _looks_like_path(args[j + 1])
                and not _looks_like_sed_script(args[j + 1])
            )):
                j += 2
                continue
            j += 1
            continue
        if a.startswith("-i"):
            in_place = True
            j += 1
            continue
        j += 1
    if not in_place:
        return [], []
    # Path args: skip flags, skip the script (first non-flag is the script
    # unless preceded by -e/-f).
    paths: List[str] = []
    j = 0
    saw_script = False
    while j < len(args):
        a = args[j]
        if a == "-e" or a == "-f":
            j += 2
            saw_script = True
            continue
        if a.startswith("-") or a == "":
            j += 1
            continue
        if not saw_script:
            saw_script = True
            j += 1
            continue
        paths.append(a)
        j += 1
    return _classify_dynamic(paths)


def _parse_awk(args: List[str]) -> Tuple[List[str], List[str]]:
    in_place = False
    j = 0
    while j < len(args):
        if args[j] == "-i" and j + 1 < len(args) and args[j + 1] == "inplace":
            in_place = True
            break
        j += 1
    if not in_place:
        return [], []
    # Skip flags, -i inplace, -f script, -v var=val, the program string.
    paths: List[str] = []
    j = 0
    saw_program = False
    while j < len(args):
        a = args[j]
        if a == "-i" and j + 1 < len(args) and args[j + 1] == "inplace":
            j += 2
            continue
        if a in ("-f", "-v") and j + 1 < len(args):
            j += 2
            saw_program = True
            continue
        if a.startswith("-"):
            j += 1
            continue
        if not saw_program:
            saw_program = True
            j += 1
            continue
        paths.append(a)
        j += 1
    return _classify_dynamic(paths)


def _parse_path_mutator(cmd: str, args: List[str]) -> Tuple[List[str], List[str]]:
    mode = PATH_MUTATORS[cmd]
    paths: List[str] = []
    skip_next = False
    seen_non_flag = 0
    for a in args:
        if skip_next:
            skip_next = False
            continue
        if a.startswith("-"):
            continue
        seen_non_flag += 1
        if mode == "all_after_mode" and seen_non_flag == 1:
            # chmod MODE PATH... — skip the mode.
            continue
        if mode == "all_after_owner" and seen_non_flag == 1:
            # chown OWNER PATH...
            continue
        paths.append(a)
    return _classify_dynamic(paths)


def _parse_src_dst(cmd: str, args: List[str]) -> Tuple[List[str], List[str]]:
    # `ln -s target linkname` — linkname is the write-target.
    # `cp src... dst` / `mv src... dst` — dst is the write-target. mv also
    # removes src, so srcs are write-targets too.
    operands = [a for a in args if not a.startswith("-")]
    if cmd == "ln":
        # ln [-s] target linkname → write to linkname (last operand).
        if len(operands) >= 2:
            return _classify_dynamic([operands[-1]])
        return [], []
    if not operands:
        return [], []
    if cmd == "cp":
        if len(operands) < 2:
            return [], []
        return _classify_dynamic([operands[-1]])
    if cmd == "mv":
        if len(operands) < 2:
            return _classify_dynamic(operands)  # all srcs + dst
        # All operands except possibly the last are srcs (removed), last is dst.
        return _classify_dynamic(operands)
    return [], []


def _looks_like_path(s: str) -> bool:
    return "/" in s or s.endswith((".md", ".sh", ".py", ".ts", ".tsx", ".json", ".txt"))


def _looks_like_sed_script(s: str) -> bool:
    return bool(re.match(r"^[sg]/", s)) or s.startswith("/")


def parse(cmd: str) -> Result:
    cmd = strip_heredocs(cmd)
    statements = [pad_operators(s) for s in split_statements(cmd)]
    result = Result(targets=[], unknown_reasons=[])
    for stmt in statements:
        try:
            tokens = shlex.split(stmt, posix=True)
        except ValueError as e:
            result.unknown_reasons.append(f"unparseable: {e}")
            continue
        if not tokens:
            continue
        cmd_tokens, redir_targets, redir_unknowns = parse_redirects(tokens)
        result.targets.extend(redir_targets)
        result.unknown_reasons.extend(redir_unknowns)
        cmd_targets, cmd_unknowns = parse_command_word(cmd_tokens)
        result.targets.extend(cmd_targets)
        result.unknown_reasons.extend(cmd_unknowns)
    return result


def main() -> int:
    cmd = sys.stdin.read()
    if not cmd.strip():
        return 0
    result = parse(cmd)
    for r in result.unknown_reasons:
        print(f"__UNKNOWN__:{r}")
    seen = set()
    for t in result.targets:
        # Normalize the emitted path so the hook's allow-list match is exact:
        # collapse `foo/./bar` and resolve `..` segments. Absolute paths are
        # left absolute (the shell hook strips the repo-root prefix).
        norm = os.path.normpath(t) if t else t
        if norm in seen:
            continue
        seen.add(norm)
        print(norm)
    return 0


if __name__ == "__main__":
    sys.exit(main())
