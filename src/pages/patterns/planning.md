---
layout: ../../layouts/Base.astro
title: Planning Documents
---

# Planning Documents

## Problem

Plans get lost across sessions. You start a task, context resets, and the next session doesn't know the plan exists. Plans get duplicated. Worktrees become orphaned from their plans. You lose track of what's in progress.

## Solution

Structured plan files in a central `plans/` directory. Every plan gets a unique identifier. Worktrees reference plan IDs. Plans survive context resets because they're files, not conversation history.

## Plan File Format

```markdown
---
id: wf001a
status: in-progress
repo: myproject
worktree: myproject-feature-a
created: 2024-01-15
---

# Feature A Implementation

## Goal
Add feature A to myproject.

## Tasks
- [ ] Create component
- [ ] Add tests
- [ ] Update docs

## Notes
Decided to use approach X because of Y.
```

### Required Fields

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (e.g., `wf001a`, `auth-001`) |
| `status` | `draft`, `in-progress`, `blocked`, `done` |
| `repo` | Which repository this plan targets |

### Optional Fields

| Field | Description |
|-------|-------------|
| `worktree` | Associated worktree directory |
| `parent` | Parent plan ID (for sub-tasks) |
| `created` | Creation date |
| `blocked-by` | What's blocking progress |

## Unique Identifiers

Short alphanumeric IDs work well:

```
wf001    # Sequential
auth-001 # Domain-prefixed
a1b2c    # Random short (5 chars)
```

Avoid full UUIDs—they're hard to type and reference in conversation.

## Directory Structure

```
plans/
├── myproject/
│   ├── wf001-feature-a.md
│   ├── wf002-feature-b.md
│   └── wf003-bugfix.md
└── otherproject/
    └── op001-refactor.md
```

Group by project. Include ID in filename for easy lookup.

## Workflow

### Creating a Plan

```bash
# Create plan file
cat > plans/myproject/wf001-feature-a.md << 'EOF'
---
id: wf001
status: draft
repo: myproject
---

# Feature A

## Goal
...
EOF

# Commit immediately
git add plans/myproject/wf001-feature-a.md
git commit -m "Add plan wf001: Feature A"
```

### Starting Work

```bash
# Create worktree
git -C myproject worktree add ../myproject-feature-a -b feature-a

# Update plan status and add worktree reference
```

### Referencing in Conversation

When starting a new session:

```
Continue work on plan wf001 in myproject-feature-a/
```

The agent reads the plan file, picks up context, continues work.

## Cross-Session Context

Plans capture decisions that would otherwise be lost:

```markdown
## Decisions

- Using PostgreSQL, not MySQL (performance benchmarks showed 2x faster)
- JWT in httpOnly cookie, not localStorage (security review feedback)
- Splitting into 3 sub-plans: wf001a, wf001b, wf001c
```

Next session reads this, doesn't re-debate settled decisions.

## Plan Hierarchy

Complex tasks spawn sub-plans:

```markdown
---
id: wf001
status: in-progress
---

# Auth System

## Sub-plans
- wf001a: API routes (in-progress)
- wf001b: UI components (in-progress)
- wf001c: Database (done)
```

Each sub-plan references the parent:

```markdown
---
id: wf001a
parent: wf001
status: in-progress
---

# Auth API Routes
...
```

## Querying Plans

Find all in-progress plans:

```bash
grep -l "status: in-progress" plans/**/*.md
```

Find plans for a repo:

```bash
ls plans/myproject/
```
