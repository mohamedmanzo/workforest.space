#!/usr/bin/env npx tsx
/**
 * Create a git worktree for a task.
 * Usage: npx tsx create-worktree.ts repo-name branch-name
 */
import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";

function run(cmd: string, cwd?: string): string {
  return execSync(cmd, { cwd, encoding: "utf-8" }).trim();
}

interface WorktreeOptions {
  repo: string;
  branch: string;
}

function createWorktree({ repo, branch }: WorktreeOptions): string {
  const worktreePath = `${repo}-${branch}`;

  // Validate base repo
  if (!existsSync(repo)) {
    throw new Error(`Base repo not found: ${repo}`);
  }

  // Check worktree doesn't exist
  if (existsSync(worktreePath)) {
    throw new Error(`Worktree already exists: ${worktreePath}`);
  }

  // Create worktree with new branch
  const absolutePath = resolve(worktreePath);
  run(`git worktree add -b ${branch} "${absolutePath}"`, repo);

  return worktreePath;
}

function listWorktrees(repo: string): Array<{ path: string; branch?: string }> {
  const output = run("git worktree list --porcelain", repo);
  const worktrees: Array<{ path: string; branch?: string }> = [];
  let current: { path: string; branch?: string } | null = null;

  for (const line of output.split("\n")) {
    if (line.startsWith("worktree ")) {
      if (current) worktrees.push(current);
      current = { path: line.slice(9) };
    } else if (line.startsWith("branch ") && current) {
      current.branch = line.split("/").pop();
    }
  }
  if (current) worktrees.push(current);

  return worktrees;
}

// CLI
const [, , repo, branch] = process.argv;

if (!repo || !branch) {
  console.log("Usage: npx tsx create-worktree.ts repo-name branch-name");
  process.exit(1);
}

try {
  const path = createWorktree({ repo, branch });
  console.log(`Created worktree: ${path}`);
  console.log(`  cd ${path}`);
} catch (e) {
  console.error(`Error: ${(e as Error).message}`);
  process.exit(1);
}
