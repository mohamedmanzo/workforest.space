#!/usr/bin/env bash
# List all plans with status.
# Usage: ./list-plans.sh [repo-name]

set -euo pipefail

REPO="${1:-}"
PLANS_DIR="plans"

if [[ ! -d "$PLANS_DIR" ]]; then
    echo "No plans directory found."
    exit 0
fi

# Set search pattern
if [[ -n "$REPO" ]]; then
    PATTERN="${PLANS_DIR}/${REPO}/*.md"
else
    PATTERN="${PLANS_DIR}/*/*.md"
fi

# Header
printf "%-10s %-12s %-20s %s\n" "ID" "Status" "Repo" "File"
printf "%s\n" "------------------------------------------------------------"

# Parse each plan file
for file in $PATTERN; do
    [[ -f "$file" ]] || continue

    # Extract frontmatter values (simple grep approach)
    id=$(grep -m1 "^id:" "$file" 2>/dev/null | cut -d: -f2 | tr -d ' ' || echo "")
    status=$(grep -m1 "^status:" "$file" 2>/dev/null | cut -d: -f2 | tr -d ' ' || echo "unknown")
    repo=$(grep -m1 "^repo:" "$file" 2>/dev/null | cut -d: -f2 | tr -d ' ' || echo "")

    if [[ -n "$id" ]]; then
        printf "%-10s %-12s %-20s %s\n" "$id" "$status" "$repo" "$file"
    fi
done | sort -k2
