#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is not installed or is not available in PATH." >&2
  echo "Install pnpm 10 and try again." >&2
  exit 1
fi

exec pnpm dev
