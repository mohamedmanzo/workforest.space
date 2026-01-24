#!/usr/bin/env python3
"""Create a git worktree for a task.

Usage: ./create_worktree.py repo-name branch-name
"""
import sys
import subprocess
from pathlib import Path


def run(cmd: list, cwd: str = None) -> str:
    """Run command and return output."""
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd)
    if result.returncode != 0:
        raise RuntimeError(f"Command failed: {result.stderr}")
    return result.stdout.strip()


def create_worktree(repo: str, branch: str) -> Path:
    """Create a git worktree for the given repo and branch."""
    base_path = Path(repo)
    worktree_path = Path(f"{repo}-{branch}")

    if not base_path.exists():
        raise FileNotFoundError(f"Base repo not found: {repo}")

    if worktree_path.exists():
        raise FileExistsError(f"Worktree already exists: {worktree_path}")

    # Create worktree with new branch
    run(["git", "worktree", "add", "-b", branch, str(worktree_path.absolute())],
        cwd=str(base_path))

    return worktree_path


def list_worktrees(repo: str) -> list:
    """List existing worktrees for a repo."""
    output = run(["git", "worktree", "list", "--porcelain"], cwd=repo)
    worktrees = []
    current = {}

    for line in output.split("\n"):
        if line.startswith("worktree "):
            if current:
                worktrees.append(current)
            current = {"path": line.split(" ", 1)[1]}
        elif line.startswith("branch "):
            current["branch"] = line.split("/")[-1]

    if current:
        worktrees.append(current)
    return worktrees


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: ./create_worktree.py repo-name branch-name")
        sys.exit(1)

    repo = sys.argv[1]
    branch = sys.argv[2]

    try:
        path = create_worktree(repo, branch)
        print(f"Created worktree: {path}")
        print(f"  cd {path}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
