---
layout: ../../layouts/Base.astro
title: Work Clusters Pattern
---

# Work Clusters Pattern

## Problem

Complex tasks have semantically cohesive pieces that could be developed in isolation. A single agent works on everything, mixing concerns and losing the ability to reason about each piece independently.

## Solution

Identify **semantic clusters**—cohesive groups of related functionality. Spawn agents to work on each cluster in isolation. Then hand off to an **integration agent** that merges all changes and resolves conflicts.

```
Orchestrator: "Build auth system"
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

### 1. Identify Semantic Clusters

Look for cohesive functionality that can be isolated:

```markdown
# plans/auth-system.md

## Clusters

1. **Backend Cluster** (auth-api/)
   - API routes: /login, /register, /me
   - JWT token handling
   - Auth middleware
   - Cohesive because: all server-side auth logic

2. **Frontend Cluster** (auth-ui/)
   - LoginForm, RegisterForm components
   - AuthProvider context
   - useAuth hook
   - Cohesive because: all client-side auth UI

3. **Data Cluster** (auth-db/)
   - User table schema
   - Password hashing
   - Session storage
   - Cohesive because: all persistence concerns
```

### 2. Create Isolated Worktrees

Each cluster gets its own worktree:

```bash
git worktree add ../auth-api -b auth-api
git worktree add ../auth-ui -b auth-ui
git worktree add ../auth-db -b auth-db
```

### 3. Spawn Cluster Agents

Each agent works in isolation on their cluster:

```bash
# Spawn in parallel
claude "Implement backend auth cluster per plans/auth-system.md" --cwd auth-api/ &
claude "Implement frontend auth cluster per plans/auth-system.md" --cwd auth-ui/ &
claude "Implement data auth cluster per plans/auth-system.md" --cwd auth-db/ &
wait
```

Agents don't communicate directly. They follow the interface contract in the plan.

### 4. Integration Phase

Once cluster agents complete, spawn an integration agent:

```bash
claude "Integrate auth clusters: merge auth-api, auth-ui, auth-db branches.
        Resolve any conflicts. Verify types align. Run tests."
```

The integration agent:
- Merges branches into main
- Resolves conflicts (type mismatches, naming inconsistencies)
- Verifies the integrated system works
- Documents any decisions made during integration

## Interface Contracts

Define contracts before spawning clusters:

```typescript
// contracts/auth.ts (committed before spawning)

// Backend provides:
interface AuthAPI {
  'POST /login': { body: LoginRequest; response: AuthResponse }
  'POST /register': { body: RegisterRequest; response: AuthResponse }
  'GET /me': { response: User }
}

// Frontend expects:
interface AuthContext {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Shared types:
interface User { id: string; email: string }
interface AuthResponse { token: string; user: User }
```

Cluster agents implement against the contract. The integration agent verifies alignment.

## Example: Feature Development

```
Feature: Shopping Cart

Cluster 1: Cart API (cart-api/)
├── Routes: add, remove, update, checkout
├── Cart validation logic
└── Inventory checks

Cluster 2: Cart UI (cart-ui/)
├── CartDrawer component
├── CartItem component
├── useCart hook

Cluster 3: Cart State (cart-state/)
├── Cart context
├── Local storage persistence
└── Optimistic updates

Integration Agent:
├── Merge all branches
├── Ensure hook calls API correctly
├── Verify state syncs with server
└── Run e2e tests
```

## Example: Investigation Clusters

```
Bug: Performance Regression

Cluster 1: Backend Profiling
└── Agent: Profile endpoints, identify slow queries

Cluster 2: Frontend Analysis
└── Agent: Bundle size, render performance, network waterfall

Cluster 3: Database Analysis
└── Agent: Query plans, index usage, connection pool

Integration Agent:
└── Synthesize findings, prioritize fixes, create action plan
```

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
