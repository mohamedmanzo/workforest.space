---
title: Work Clusters Pattern
---

# Work Clusters Pattern

## Problem

Complex tasks decompose into independent sub-tasks. A single agent works on them serially, even when they could run in parallel. You wait for the API before starting the UI, even though they don't depend on each other during development.

## Solution

Spawn multiple agents simultaneously. Each agent works on an independent piece. Coordinate through shared plan files, not real-time communication.

```
Main agent: "Build auth system"
├── Agent 1: Backend API routes    → auth-api/
├── Agent 2: Frontend components   → auth-ui/
└── Agent 3: Database migrations   → auth-db/
```

## How It Works

### Decompose the Task

Before spawning, identify independent sub-tasks:

```markdown
# plans/auth-system.md

## Sub-tasks

1. **API routes** (auth-api)
   - POST /login, POST /register, GET /me
   - JWT token generation
   - No dependencies on other sub-tasks

2. **UI components** (auth-ui)
   - LoginForm, RegisterForm, AuthProvider
   - Mock API responses during development
   - No dependencies on other sub-tasks

3. **Database** (auth-db)
   - User table migration
   - Password hashing setup
   - No dependencies on other sub-tasks
```

### Create Worktrees

One worktree per sub-task:

```bash
git worktree add ../auth-api -b auth-api
git worktree add ../auth-ui -b auth-ui
git worktree add ../auth-db -b auth-db
```

### Spawn Agents

Start each agent with its specific task:

```bash
# Terminal 1
claude --worktree auth-api "Implement auth API routes per plans/auth-system.md"

# Terminal 2
claude --worktree auth-ui "Build auth UI components per plans/auth-system.md"

# Terminal 3
claude --worktree auth-db "Create user table migration per plans/auth-system.md"
```

### Coordinate via Plans

Agents don't talk to each other. They read from shared plan files:

```markdown
# plans/auth-system.md

## Interface Contract

API returns:
- POST /login → { token: string, user: { id, email } }
- POST /register → { token: string, user: { id, email } }
- GET /me → { id, email, createdAt }

UI mocks this interface during development.
```

Each agent follows the contract. Integration happens at merge time.

## Example Scenarios

### Feature Development

```
Feature: Shopping cart
├── Agent 1: Cart API (add, remove, checkout)
├── Agent 2: Cart UI (CartDrawer, CartItem, CheckoutForm)
└── Agent 3: Cart state management (context, persistence)
```

### Bug Investigation

```
Bug: Performance regression
├── Agent 1: Profile backend endpoints
├── Agent 2: Analyze frontend bundle size
└── Agent 3: Check database query plans
```

### Refactoring

```
Refactor: Extract shared library
├── Agent 1: Identify shared code, create package structure
├── Agent 2: Update site A imports
└── Agent 3: Update site B imports
```

## Coordination Patterns

### Shared Plan File

All agents read from the same plan. Updates to the plan are visible to all:

```markdown
# plans/feature.md

## Status
- [ ] API routes (agent 1 working)
- [x] Database schema (agent 3 done)
- [ ] UI components (agent 2 working)

## Decisions
- Using JWT, not sessions (decided by agent 1)
- Token stored in httpOnly cookie (decided by agent 1)
```

### Interface-First

Define interfaces before spawning:

```typescript
// shared/types.ts (committed before spawning)
interface AuthResponse {
  token: string;
  user: User;
}

interface User {
  id: string;
  email: string;
}
```

Agents implement against the interface, not each other's code.

### Staggered Start

When there's a soft dependency, stagger the spawn:

```bash
# Agent 1 starts immediately (defines interfaces)
claude "Define auth types and API contract"

# Wait for types to be committed
# Then spawn parallel agents
claude "Implement API" &
claude "Implement UI" &
```

## When to Use

- Task has 3+ independent pieces
- Each piece takes 30+ minutes
- Clear interface boundaries exist
- Human will review before integration
