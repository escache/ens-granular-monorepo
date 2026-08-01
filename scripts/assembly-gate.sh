#!/usr/bin/env bash
# Assembly gate — run by integration-gate agent and locally before PRs.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${ROOT}/.agent/output"
REPORT="${OUTPUT_DIR}/gate-report.json"
mkdir -p "${OUTPUT_DIR}"

cd "${ROOT}"

declare -a RESULTS=()
FAILED=0

run_gate() {
  local name="$1"
  shift
  echo "==> ${name}"
  if "$@"; then
    RESULTS+=("{\"name\":\"${name}\",\"status\":\"pass\"}")
    echo "    PASS"
  else
    RESULTS+=("{\"name\":\"${name}\",\"status\":\"fail\"}")
    echo "    FAIL"
    FAILED=1
  fi
}

run_gate "npm ci" npm ci --prefer-offline
run_gate "build" npm run build
run_gate "test:contracts" npm run test:contracts
run_gate "test:ui" npm run test:ui -- --run
run_gate "lint" npm run lint

TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"

{
  echo "{"
  echo "  \"timestamp\": \"${TIMESTAMP}\","
  echo "  \"branch\": \"${BRANCH}\","
  echo "  \"commit\": \"${COMMIT}\","
  echo "  \"overall\": \"$([ "${FAILED}" -eq 0 ] && echo pass || echo fail)\","
  echo "  \"checks\": ["
  printf '    %s' "${RESULTS[0]}"
  for ((i=1; i<${#RESULTS[@]}; i++)); do
    printf ',\n    %s' "${RESULTS[$i]}"
  done
  echo ""
  echo "  ]"
  echo "}"
} > "${REPORT}"

echo ""
echo "Gate report: ${REPORT}"
if [ "${FAILED}" -ne 0 ]; then
  echo "ASSEMBLY GATE: FAILED"
  exit 1
fi
echo "ASSEMBLY GATE: PASSED"
