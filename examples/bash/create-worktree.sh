#!/usr/bin/env bash
# Create a git worktree for a task.
# Usage: ./create-worktree.sh repo-name branch-name

set -euo pipefail

REPO="${1:-}"
BRANCH="${2:-}"

if [[ -z "$REPO" || -z "$BRANCH" ]]; then
    echo "Usage: ./create-worktree.sh repo-name branch-name"
    exit 1
fi

WORKTREE_PATH="${REPO}-${BRANCH}"

# Validate base repo exists
if [[ ! -d "$REPO/.git" && ! -f "$REPO/.git" ]]; then
    echo "Error: Base repo not found: $REPO"
    exit 1
fi

# Check worktree doesn't exist
if [[ -d "$WORKTREE_PATH" ]]; then
    echo "Error: Worktree already exists: $WORKTREE_PATH"
    exit 1
fi

# Create worktree with new branch
git -C "$REPO" worktree add -b "$BRANCH" "$(pwd)/${WORKTREE_PATH}"

echo "Created worktree: $WORKTREE_PATH"
echo "  cd $WORKTREE_PATH"
