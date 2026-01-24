---
layout: ../../layouts/Base.astro
title: Work Clusters Pattern
---

# Work Clusters Pattern

## Problem

Complex tasks have semantically cohesive pieces that could be developed in isolation. A single agent works on everything, mixing concerns and losing the ability to reason about each piece independently.

## Solution

Just ask Claude to do it. Plain English works:

> "Build an auth system. Split it into backend, frontend, and database clusters. Work on each in parallel, then integrate."

That's it. Claude creates worktrees, spawns sub-agents, and merges everything.

## Why Clusters (Not Just Parallelism)

Work Clusters is about **semantic grouping**, not just concurrency.

**Isolation**: Each cluster can be reasoned about independently. The API agent doesn't need to think about React hooks.

**Cohesion**: Group related things together. API routes and middleware in one cluster. Components and hooks in another.

**Abstraction**: You work at a higher level. Orchestrate specialists instead of writing every line.

## The Trade-off

| Benefit | Cost |
|---------|------|
| Higher-level thinking | Some redundant or lost work |
| Parallel execution | Integration overhead |
| Cleaner separation | Need for conflict resolution |

You're trading some efficiency for the ability to work at higher abstraction levels. The integration phase handles cleanup.

## When to Use

**Good fit:**
- Task has 3+ semantically distinct pieces
- Clear boundaries exist between concerns
- You want to work at a higher abstraction level

**Poor fit:**
- Highly coupled code that can't be isolated
- Small tasks that don't benefit from splitting
- You need line-by-line control
