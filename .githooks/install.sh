#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Installing git hooks..."

git config core.hooksPath "$SCRIPT_DIR"

chmod +x "$SCRIPT_DIR/pre-commit"

echo "Git hooks installed successfully."
echo "Hooks directory: $SCRIPT_DIR"
echo ""
echo "To uninstall, run: git config --unset core.hooksPath"
