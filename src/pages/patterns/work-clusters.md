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

That's it. Claude will:
1. Create worktrees for each cluster
2. Spawn sub-agents to work in parallel
3. Merge everything and resolve conflicts

```
You: "Build auth. Backend, frontend, database. Parallel."
│
├── Cluster 1: Backend (auth-api/)
│   └── Agent: API routes, JWT, middleware
│
├── Cluster 2: Frontend (auth-ui/)
│   └── Agent: Forms, providers, hooks
│
├── Cluster 3: Data (auth-db/)
│   └── Agent: Schema, migrations, seeds
│
└── Integration Agent: Merge branches, resolve conflicts, verify
```

## Why Clusters (Not Just Parallelism)

Work Clusters is about **semantic grouping**, not just concurrency.

**Isolation**: Each cluster can be reasoned about independently. The auth API agent doesn't need to think about React hooks. The UI agent doesn't need to know about database indexes.

**Cohesion**: Group related things together. API routes, middleware, and validation belong in one cluster. Components, hooks, and context belong in another.

**Abstraction**: You work at a higher level. Instead of writing every line, you orchestrate specialists who handle the details.

## The Trade-off

This is explicitly a trade-off:

| Benefit | Cost |
|---------|------|
| Higher-level thinking | Some redundant or lost work |
| Parallel execution | Integration overhead |
| Cleaner separation | Need for conflict resolution |
| Faster overall completion | More prompting/coordination |

You're trading some efficiency for the ability to work at higher abstraction levels. The integration phase handles cleanup and resolves inconsistencies.

## How It Works

You don't need to manually orchestrate anything. Just describe what you want:

### Plain English Examples

**Building a feature:**
> "Add user authentication. Split the work into API, UI, and database. Use parallel agents, then merge everything together."

**Refactoring across layers:**
> "Extract the payment logic into a service. Have one agent handle the backend, another the frontend, another the tests. Work in parallel."

**Investigating a bug:**
> "This is slow. Check the database queries, the API endpoints, and the frontend bundle size. Look at all three in parallel and tell me what you find."

**Cross-repo library extraction:**
> "These three sites all have the same nav component. Extract it into a shared package. One agent makes the library, the others update each site to use it."

### What Claude Does

When you ask for parallel work, Claude:

1. **Creates worktrees** for isolation
2. **Spawns sub-agents** to work on each cluster
3. **Waits for completion** of all parallel work
4. **Integrates** by merging branches and resolving conflicts
5. **Verifies** the combined result works

You work at the task level. Claude handles the orchestration.

### Manual Control (Optional)

If you want explicit control, you can still script it:

```bash
git worktree add ../auth-api -b auth-api
git worktree add ../auth-ui -b auth-ui

claude "Implement the API" --cwd auth-api/ &
claude "Implement the UI" --cwd auth-ui/ &
wait

claude "Merge auth-api and auth-ui, resolve conflicts, verify"
```

But usually you don't need to. Just describe the clusters and ask for parallel work.

## Keeping Clusters in Sync

Clusters work in isolation, so you need some way for them to agree on interfaces. Options:

**Let Claude figure it out** - The integration agent sees all the code and fixes mismatches. Works for small projects.

**Describe the interface in your prompt:**
> "Backend returns `{ token, user }`. Frontend expects a `login(email, password)` function that stores the token."

**Create a shared types file first:**
```typescript
// types/auth.ts (commit before spawning clusters)
interface User { id: string; email: string }
interface AuthResponse { token: string; user: User }
```

The integration agent resolves any drift between what clusters produce and what they expect.

## Examples

**Shopping cart feature:**
> "Build a shopping cart. API handles validation and checkout. UI has the drawer and item components. State management handles persistence and optimistic updates. Work in parallel, merge when done."

**Performance investigation:**
> "The app is slow. Check the backend queries, the frontend bundle, and the database indexes. All three in parallel. Then give me a prioritized list of fixes."

**Library extraction:**
> "I keep copying this theme toggle between sites. Extract it into a package. One agent builds the package, others update each site. Integrate when ready."

## When to Use

**Good fit:**
- Task has 3+ semantically distinct pieces
- Clear boundaries exist between concerns
- You want to work at a higher abstraction level
- Integration overhead is acceptable

**Poor fit:**
- Highly coupled code that can't be isolated
- Tasks smaller than 30 minutes each
- No clear semantic boundaries
- You need line-by-line control
