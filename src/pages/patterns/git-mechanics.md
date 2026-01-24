---
layout: ../../layouts/Base.astro
title: Git Mechanics
---

# Git Mechanics

The Work Forest pattern builds on standard git features: worktrees and submodules. No custom tooling required.

## Worktrees

A worktree is an additional working directory attached to your repository. Unlike cloning, worktrees share the same `.git` database.

### Creating Worktrees

```bash
# From inside the repo
git worktree add ../myproject-feature -b feature

# Creates:
# ../myproject-feature/  ← new working directory
# .git/worktrees/myproject-feature/  ← worktree metadata
```

The new directory is a full checkout on the `feature` branch.

### Listing Worktrees

```bash
git worktree list
# /path/to/myproject         abc1234 [main]
# /path/to/myproject-feature def5678 [feature]
```

### Shared History

Commits in any worktree are immediately available to others:

```bash
# In myproject-feature/
git commit -m "Add feature"

# In myproject/ (main worktree)
git log feature  # Shows the commit
```

No push/pull needed between worktrees.

### Cleanup

```bash
# Remove worktree directory
rm -rf ../myproject-feature

# Clean up git metadata
git worktree prune
```

## Submodules for Tracking

The parent repository uses submodules to track worktree state.

### Adding Worktrees as Submodules

```bash
# In parent repo
git submodule add ../myproject ./myproject
git submodule add ../myproject-feature ./myproject-feature
git commit -m "Track project worktrees"
```

### Dirty State Detection

Git status shows which worktrees have uncommitted changes:

```bash
git status
# modified: myproject-feature (modified content)
# modified: myproject-bugfix (untracked content)
```

This gives a dashboard of all in-flight work.

### Submodule Commit Pointers

Each submodule points to a specific commit:

```bash
git diff --submodule
# Submodule myproject-feature abc1234..def5678:
#   > Add login form
#   > Fix validation
```

Committing the parent repo snapshots current worktree state.

## Dirty State Patterns

### Quick Status Check

```bash
git status --short
# m myproject-feature
#   myproject-bugfix
```

`m` = modified content, space = clean.

### Detailed Submodule Status

```bash
git submodule status
#  abc1234 myproject (heads/main)
# +def5678 myproject-feature (heads/feature)
```

`+` = submodule commit differs from recorded commit.

### Scripted Health Check

```bash
#!/bin/bash
for sub in $(git submodule --quiet foreach 'echo $path'); do
  if git diff --quiet "$sub"; then
    echo "✓ $sub (clean)"
  else
    echo "✗ $sub (dirty)"
  fi
done
```

## Prior Art: Beads Pattern

The beads pattern addresses context continuity across sessions:

- Each session is a "bead" on a string
- Beads pass context forward via artifacts (files, commits)
- No reliance on conversation history

Work Forest extends this:

| Beads | Work Forest |
|-------|-------------|
| Single thread of work | Multiple parallel threads |
| Context in session artifacts | Context in plan files |
| Linear progression | Forest of branches |

Both patterns share the principle: **persist context in files, not memory**.

## Common Operations

### Start New Workstream

```bash
# Create worktree
git -C myproject worktree add ../myproject-feature -b feature

# Track in parent
git submodule add ../myproject-feature ./myproject-feature
git commit -m "Add feature workstream"
```

### Complete and Cleanup

```bash
# Merge the feature
git -C myproject merge myproject-feature

# Remove submodule
git submodule deinit myproject-feature
git rm myproject-feature

# Remove worktree
rm -rf myproject-feature
git -C myproject worktree prune
git -C myproject branch -d feature

git commit -m "Complete feature, cleanup worktree"
```

## Directory Layout

Typical structure:

```
workspace/
├── parent/                 # Parent repo (tracks submodules)
│   ├── .gitmodules
│   ├── plans/
│   ├── myproject           # submodule → ../myproject
│   └── myproject-feature   # submodule → ../myproject-feature
├── myproject/              # Base repo (main branch)
└── myproject-feature/      # Worktree (feature branch)
```

The parent repo is your command center. `git status` shows all activity.
