#!/usr/bin/env npx tsx
/**
 * Create a new plan with GUID.
 * Usage: npx tsx create-plan.ts "Plan Name" repo-name
 */
import { randomUUID } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";

interface PlanOptions {
  name: string;
  repo: string;
}

function createPlan({ name, repo }: PlanOptions): string {
  // Short GUID: 5 chars from uuid
  const guid = randomUUID().replace(/-/g, "").slice(0, 5);
  // Plan ID: repo prefix + guid
  const planId = `${repo.slice(0, 2)}${guid}`;

  const content = `---
id: ${planId}
status: draft
repo: ${repo}
created: ${new Date().toISOString()}
---

# ${name}

## Goal

## Tasks
- [ ]
`;

  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const path = `plans/${repo}/${planId}-${slug}.md`;

  // Create directory and write file
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);

  return path;
}

// CLI
const [, , name, repo] = process.argv;

if (!name || !repo) {
  console.log("Usage: npx tsx create-plan.ts 'Plan Name' repo-name");
  process.exit(1);
}

const path = createPlan({ name, repo });
console.log(`Created: ${path}`);
