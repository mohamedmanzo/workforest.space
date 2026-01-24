#!/usr/bin/env python3
"""List all plans with status.

Usage: ./list_plans.py [repo-name]
"""
import sys
import re
from pathlib import Path


def parse_frontmatter(content: str) -> dict:
    """Extract YAML frontmatter from markdown."""
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return {}

    data = {}
    for line in match.group(1).split("\n"):
        if ":" in line:
            key, value = line.split(":", 1)
            data[key.strip()] = value.strip()
    return data


def list_plans(repo: str = None) -> list:
    """Find and parse all plan files."""
    plans_dir = Path("plans")
    if not plans_dir.exists():
        return []

    pattern = f"{repo}/*.md" if repo else "*/*.md"
    plans = []

    for path in plans_dir.glob(pattern):
        content = path.read_text()
        meta = parse_frontmatter(content)
        if meta.get("id"):
            plans.append({
                "id": meta.get("id"),
                "status": meta.get("status", "unknown"),
                "repo": meta.get("repo", path.parent.name),
                "file": str(path),
            })

    return sorted(plans, key=lambda p: p["status"])


if __name__ == "__main__":
    repo = sys.argv[1] if len(sys.argv) > 1 else None
    plans = list_plans(repo)

    if not plans:
        print("No plans found.")
        sys.exit(0)

    # Simple table output
    print(f"{'ID':<10} {'Status':<12} {'Repo':<20} File")
    print("-" * 60)
    for p in plans:
        print(f"{p['id']:<10} {p['status']:<12} {p['repo']:<20} {p['file']}")
