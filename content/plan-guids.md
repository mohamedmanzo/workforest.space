---
title: Plan GUIDs Pattern
---

# Plan GUIDs Pattern

## Problem

Plans get lost across sessions. You start a task, context resets, and the next session doesn't know the plan exists. Plans get duplicated. Worktrees become orphaned from their plans. You lose track of what's in progress.

## Solution

Every plan gets a globally unique identifier. Plans live in a central `plans/` directory. Worktrees reference plan IDs. Plans survive context resets because they're files, not conversation history.

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
| `id` | Unique identifier (e.g., `wf001a`, `auth-api-001`) |
| `status` | `draft`, `in-progress`, `blocked`, `done` |
| `repo` | Which repository this plan targets |

### Optional Fields

| Field | Description |
|-------|-------------|
| `worktree` | Associated worktree directory |
| `parent` | Parent plan ID (for sub-tasks) |
| `created` | Creation date |
| `blocked-by` | What's blocking progress |

## ID Formats

Short alphanumeric IDs work well:

```
wf001    # Sequential
auth-001 # Domain-prefixed
a1b2c    # Random short
```

Avoid UUIDs—they're hard to type and reference in conversation.

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

# Update plan status
sed -i '' 's/status: draft/status: in-progress/' plans/myproject/wf001-feature-a.md

# Add worktree reference
echo "worktree: myproject-feature-a" >> plans/myproject/wf001-feature-a.md
```

### Referencing in Conversation

When starting a new session:

```
Continue work on plan wf001 in myproject-feature-a/
```

The agent reads the plan file, picks up context, continues work.

### Completing Work

```bash
# Update plan
sed -i '' 's/status: in-progress/status: done/' plans/myproject/wf001-feature-a.md

# Cleanup worktree
rm -rf myproject-feature-a
git -C myproject worktree prune
```

## Cross-Session Context

Plans capture decisions that would otherwise be lost:

```markdown
## Decisions

- Using PostgreSQL, not MySQL (performance benchmarks showed 2x faster for our queries)
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

Find orphaned plans (no worktree):

```bash
for f in plans/**/*.md; do
  if grep -q "status: in-progress" "$f" && ! grep -q "worktree:" "$f"; then
    echo "$f"
  fi
done
```
