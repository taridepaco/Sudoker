#!/usr/bin/env bash
# Tests that must pass before publishing (run by .github/workflows/pages.yml).
# They check the sudoku engine in web/js/engine/ (pure modules, no browser): parsing, the
# backtracking search, the solving techniques T1-T6 and the generator's levels.
set -euo pipefail
cd "$(dirname "$0")/.."
node --test tests/engine/*.test.js
