#!/usr/bin/env bash
# Push current branch to cleaninguklondon-cloud/Plamen using GH_TOKEN or PLAMEN_GITHUB_TOKEN.
set -euo pipefail
cd "$(dirname "$0")/.."

TOKEN="${PLAMEN_GITHUB_TOKEN:-${GH_TOKEN:-}}"
if [ -z "$TOKEN" ]; then
  echo "Set PLAMEN_GITHUB_TOKEN or GH_TOKEN (PAT with push access to cleaninguklondon-cloud/Plamen)."
  exit 1
fi

REMOTE="https://x-access-token:${TOKEN}@github.com/cleaninguklondon-cloud/Plamen.git"
BRANCH="${1:-$(git branch --show-current)}"

git push "$REMOTE" "${BRANCH}:main"
