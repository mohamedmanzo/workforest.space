#!/usr/bin/env npx tsx
/**
 * List all plans with status.
 * Usage: npx tsx list-plans.ts [repo-name]
 */
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

interface Plan {
  id: string;
  status: string;
  repo: string;
  file: string;
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return data;
}

function listPlans(repo?: string): Plan[] {
  const plansDir = "plans";
  if (!existsSync(plansDir)) return [];

  const plans: Plan[] = [];
  const repos = repo ? [repo] : readdirSync(plansDir);

  for (const r of repos) {
    const repoDir = join(plansDir, r);
    if (!existsSync(repoDir)) continue;

    for (const file of readdirSync(repoDir)) {
      if (!file.endsWith(".md")) continue;

      const path = join(repoDir, file);
      const content = readFileSync(path, "utf-8");
      const meta = parseFrontmatter(content);

      if (meta.id) {
        plans.push({
          id: meta.id,
          status: meta.status || "unknown",
          repo: meta.repo || r,
          file: path,
        });
      }
    }
  }

  return plans.sort((a, b) => a.status.localeCompare(b.status));
}

// CLI
const [, , repo] = process.argv;
const plans = listPlans(repo);

if (plans.length === 0) {
  console.log("No plans found.");
  process.exit(0);
}

// Table output
console.log(
  `${"ID".padEnd(10)} ${"Status".padEnd(12)} ${"Repo".padEnd(20)} File`
);
console.log("-".repeat(60));
for (const p of plans) {
  console.log(
    `${p.id.padEnd(10)} ${p.status.padEnd(12)} ${p.repo.padEnd(20)} ${p.file}`
  );
}
