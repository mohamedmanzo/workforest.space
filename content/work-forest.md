---
title: Work Forest Pattern
---

# Work Forest Pattern

## Problem

AI coding agents work serially. You wait for one task to complete before starting the next. Context windows fill up. Reviews block progress. A single agent cannot parallelize itself.

## Solution

Create a **forest** of git worktrees—each worktree is an independent workstream. Multiple agents work in parallel across worktrees. A parent repository tracks all worktrees as submodules.

```
parent-repo/
├── project/              # Base (main branch, read-only)
├── project-feature-a/    # Worktree for feature A
├── project-feature-b/    # Worktree for feature B
└── project-bugfix/       # Worktree for bugfix
```

## How It Works

### Git Worktrees

Worktrees let you check out multiple branches of the same repo simultaneously:

```bash
# Create a worktree for a new feature
git -C project worktree add ../project-feature-a -b feature-a

# Each worktree is a full working copy
ls project-feature-a/
# src/ package.json README.md ...
```

Unlike cloning, worktrees share the same `.git` database. Commits in one worktree are immediately visible to others.

### Submodules for Tracking

The parent repo tracks worktrees as submodules:

```bash
# Add worktree as submodule
git submodule add ../project-feature-a ./project-feature-a
git commit -m "Add feature-a worktree"
```

Git status shows which worktrees have uncommitted work:

```bash
git status
# modified: project-feature-a (modified content)
# modified: project-bugfix (untracked content)
```

### Agent Assignment

Each agent gets its own worktree. No merge conflicts during development:

```
Agent 1 → project-feature-a/
Agent 2 → project-feature-b/
Agent 3 → project-bugfix/
```

Agents work independently. Merge conflicts only happen at integration time, after human review.

## Benefits

**Parallel development**: N agents = N times faster (for independent tasks).

**Clear isolation**: Each task has its own directory. No stepping on each other's changes.

**Git-native visibility**: `git status` shows all in-flight work. Dirty submodules = active work.

**Context independence**: Each agent starts fresh. No context pollution between tasks.

**Easy cleanup**: Delete the worktree directory and prune:

```bash
rm -rf project-feature-a
git -C project worktree prune
git submodule deinit project-feature-a
```

## When to Use

- Multiple independent features in development
- Large refactors that can be split into pieces
- Bug triage with parallel investigation
- Any scenario where you'd otherwise wait for one task before starting another
