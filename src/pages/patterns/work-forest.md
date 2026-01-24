---
layout: ../../layouts/Base.astro
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

## Semantic Commits and Stacked PRs

Work Forest makes [semantic commits](https://www.conventionalcommits.org/) practical.

**The problem with mixed PRs:** You're adding a feature but realize the code needs refactoring first. So you refactor and add the feature in one PR. The tests change too. Now reviewers can't tell: did the refactor break something, or is that the new feature? More changes = more places for bugs to hide.

**The solution:** Split it up. Refactor in one PR. Feature in a stacked PR on top.

```
main
└── refactor-auth (PR #1: just cleanup, tests shouldn't change)
    └── add-oauth (PR #2: the actual feature, built on clean code)
```

**The objection:** "Stacked PRs are complicated to manage."

**With Work Forest:** Just ask for it.

> "Refactor the auth module first, then add OAuth in a stacked PR. Work in separate worktrees."

The pattern handles the complexity. You work at the intent level.

## Trade-offs

This isn't magic. Real constraints remain:

- **Work can get lost.** Agents working in parallel may duplicate effort or make incompatible decisions. The integration phase catches most of this, but not all.
- **You still decide granularity.** How big should each worktree's task be? When to commit? These are judgment calls.
- **Integration takes effort.** Merge conflicts happen. Type mismatches happen. Someone (human or agent) resolves them.
- **Not everything parallelizes.** Tightly coupled code can't be split. Sequential dependencies are sequential.

The pattern doesn't eliminate complexity—it gives you tools to manage it.

## When to Use

- Multiple independent features in development
- Large refactors that can be split into pieces
- Bug triage with parallel investigation
- Stacked PRs for clean, reviewable changes
- Any scenario where you'd otherwise wait for one task before starting another
