# AI Agent Setup (Kim Quy)

This guide is optimized for AI coding assistants that can execute shell commands.

## Goal

Install Kim Quy globally and generate tool-specific config in your project.

## Preconditions

- Node.js 18+ or Bun 1.0+
- Git installed
- Access to your project directory

## Install Kim Quy

Choose one:

```bash
bun add -g kimquy
```

```bash
npm install -g kimquy
```

```bash
pnpm add -g kimquy
```

## Project Setup

```bash
cd /path/to/your-project
kq init --profile=default
```

This creates:
- `kimquy.config.ts`
- `.kimquy/`
- `skills/`

## Optional: Global Setup

Use this if you want a shared profile across all projects:

```bash
kq init --global --profile=default
```

Global config lives in `~/.config/kimquy/` and is merged with project config.

## Scan Skills

```bash
kq scan
```

## Generate AI Tool Config

Claude Code:

```bash
kq adapt claude-code
```

Cursor:

```bash
kq adapt cursor
```

## Verify

```bash
kq status
```

## Common Issues

- "Kim Quy is not initialized": run `kq init` in the project folder
- "No skills found": ensure `skills/` exists and contains `SKILL.md`

## Next

Create or import skills:

```bash
kq import claude
kq import cursor
```
