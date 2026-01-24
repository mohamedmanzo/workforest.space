#!/usr/bin/env bash
# Create a new plan with GUID.
# Usage: ./create-plan.sh "Plan Name" repo-name

set -euo pipefail

NAME="${1:-}"
REPO="${2:-}"

if [[ -z "$NAME" || -z "$REPO" ]]; then
    echo "Usage: ./create-plan.sh 'Plan Name' repo-name"
    exit 1
fi

# Generate short GUID (5 chars)
GUID=$(uuidgen | tr -d '-' | head -c 5 | tr '[:upper:]' '[:lower:]')

# Plan ID: repo prefix + guid
PREFIX="${REPO:0:2}"
PLAN_ID="${PREFIX}${GUID}"

# Slugify name for filename
SLUG=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

# Create directory and file
DIR="plans/${REPO}"
FILE="${DIR}/${PLAN_ID}-${SLUG}.md"
mkdir -p "$DIR"

# Write plan content
cat > "$FILE" << EOF
---
id: ${PLAN_ID}
status: draft
repo: ${REPO}
created: $(date -Iseconds)
---

# ${NAME}

## Goal

## Tasks
- [ ]
EOF

echo "Created: $FILE"
