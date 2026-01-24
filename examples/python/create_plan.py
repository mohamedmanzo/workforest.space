#!/usr/bin/env python3
"""Create a new plan with GUID.

Usage: ./create_plan.py "Plan Name" repo-name
"""
import sys
import uuid
from pathlib import Path
from datetime import datetime


def create_plan(name: str, repo: str) -> Path:
    """Generate a plan file with unique ID."""
    # Short GUID: 5 chars from uuid4
    guid = uuid.uuid4().hex[:5]
    # Plan ID: repo prefix + guid (e.g., "wf001a")
    plan_id = f"{repo[:2]}{guid}"

    # Frontmatter + template
    content = f"""---
id: {plan_id}
status: draft
repo: {repo}
created: {datetime.now().isoformat()}
---

# {name}

## Goal

## Tasks
- [ ]
"""

    # Create plans directory structure
    slug = name.lower().replace(" ", "-")
    path = Path(f"plans/{repo}/{plan_id}-{slug}.md")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)
    return path


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: ./create_plan.py 'Plan Name' repo-name")
        sys.exit(1)

    name = sys.argv[1]
    repo = sys.argv[2]
    path = create_plan(name, repo)
    print(f"Created: {path}")
