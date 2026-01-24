# Work Forest

Documentation site for AI-assisted development workflows at [workforest.space](https://workforest.space).

## What This Is

A pattern catalog for working effectively with Claude Code and similar AI coding assistants:
- Git worktree workflows for parallel development
- Project-level instructions (CLAUDE.md)
- Skills and commands for common tasks
- Context management strategies

## Key Patterns

### Git Submodules + npm link
When developing libraries alongside consuming sites:
1. Use git submodules to track library versions
2. Use `npm link` for local development
3. Commit submodule refs to lock versions
4. See [npm-link pattern](/patterns/npm-link) for details

### Projects Folder Structure
Commit your `~/.claude/projects/` folder to version control:
```
~/.claude/projects/
├── -Users-you-Projects-myapp/
│   ├── CLAUDE.md          # Project instructions
│   └── skills/            # Custom skills/commands
└── ...
```
This preserves context across sessions and machines.

## Development

```bash
npm install
npm run dev     # localhost:4321
npm run build   # production build
```

## Related Projects

- [bearing.dev](https://bearing.dev) - Git worktree management tooling
- [fightingwithai.com](https://fightingwithai.com) - AI engineering patterns
