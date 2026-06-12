#!/usr/bin/env bash
# release-lock.sh — Remove the /implement lock file. Idempotent.
#
# Usage:
#   release-lock.sh
#
# Spec 049 §4.1.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

root=$(git rev-parse --show-toplevel)
rm -f "$root/.claude/.implement-lock"
