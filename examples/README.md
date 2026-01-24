# Work Forest Examples

Minimal example scripts implementing the Work Forest pattern in multiple languages. Each is a starting point, not a complete tool.

## Scripts

| Script | Purpose |
|--------|---------|
| `create-plan` | Generate a new plan file with GUID |
| `list-plans` | Show all plans with status |
| `create-worktree` | Create a git worktree for a task |

## Python

```bash
cd examples/python
chmod +x *.py

# Create a plan
./create_plan.py "Add dark mode" my-project

# List all plans
./list_plans.py
./list_plans.py my-project  # Filter by repo

# Create worktree
./create_worktree.py my-project feature-branch
```

## Bash

```bash
cd examples/bash
chmod +x *.sh

# Create a plan
./create-plan.sh "Add dark mode" my-project

# List all plans
./list-plans.sh
./list-plans.sh my-project  # Filter by repo

# Create worktree
./create-worktree.sh my-project feature-branch
```

## TypeScript

Requires Node.js 18+.

```bash
cd examples/typescript
npm install

# Create a plan
npx tsx create-plan.ts "Add dark mode" my-project

# List all plans
npx tsx list-plans.ts
npx tsx list-plans.ts my-project  # Filter by repo

# Create worktree
npx tsx create-worktree.ts my-project feature-branch
```

## Plan File Format

Plans use YAML frontmatter:

```yaml
---
id: mp12345
status: draft
repo: my-project
created: 2024-01-15T10:30:00
---

# Plan Title

## Goal

## Tasks
- [ ] Task 1
- [ ] Task 2
```

**Status values:** `draft`, `active`, `blocked`, `done`

## Directory Structure

```
your-workspace/
  plans/
    my-project/
      mp12345-add-dark-mode.md
    other-project/
      op67890-fix-bug.md
  my-project/           # Base repo (stays on main)
  my-project-feature/   # Worktree for feature branch
```

## Extending

These scripts are intentionally minimal. Consider adding:

- Archive/cleanup commands
- Status transitions
- Plan templates
- Worktree manifest tracking
- Integration with your issue tracker
