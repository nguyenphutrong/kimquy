# Kim Quy

A CLI tool for managing AI Profiles and Skills for AI coding assistants like Claude Code, Cursor, and more.

## Features

- **Profile Management**: Switch between different AI contexts (work, personal, project-specific)
- **Skill System**: Organize reusable AI instructions in `SKILL.md` files
- **Adapter System**: Generate configuration for multiple AI tools from a single source
- **TypeScript Config**: Full TypeScript support with `kimquy.config.ts`

## Installation

### Using Bun (Recommended)

```bash
bun add -g kimquy
```

### Using npm

```bash
npm install -g kimquy
```

### From Source

```bash
git clone https://github.com/nguyenphutrong/kimquy.git
cd kimquy
bun install
bun run build
bun link
```

## Quick Start

### 1. Initialize Kim Quy in your project

```bash
cd your-project
kq init --profile=default
```

This creates:
- `kimquy.config.ts` - Configuration file
- `.kimquy/` - State directory
- `skills/` - Default skill directory with a sample `SKILL.md`

### 2. Create a skill

Create `skills/typescript/SKILL.md`:

```markdown
---
name: TypeScript Guidelines
tags: [typescript, coding]
profiles: [default]
priority: high
---

# TypeScript Guidelines

## When to Use
- When writing TypeScript code
- When reviewing TypeScript files

## Guidelines
- Use strict mode
- Prefer interfaces over type aliases for object shapes
- Use const assertions for literal types
```

### 3. Scan for skills

```bash
kq scan
```

### 4. Generate AI tool configuration

```bash
kq adapt claude-code
```

This generates `.claude/skills.md` and `.claude/settings.local.json` for Claude Code.

### 5. Check status

```bash
kq status
```

## CLI Commands

### `kq init`

Initialize Kim Quy in a directory.

```bash
kq init [options]

Options:
  --profile <name>  Initial profile name (default: "default")
  --force           Overwrite existing configuration
```

### `kq use <profile>`

Switch to a different profile.

```bash
kq use work
kq use personal
```

### `kq profile`

Manage profiles.

```bash
kq profile list              # List all profiles
kq profile show <name>       # Show profile details
kq profile create <name>     # Create a new profile
kq profile delete <name>     # Delete a profile
```

### `kq scan`

Scan and index all skills.

```bash
kq scan [options]

Options:
  -d, --dir <dir>   Additional directory to scan
  -f, --force       Force full rescan
  -v, --verbose     Show detailed output
  -q, --quiet       Only show summary
```

### `kq skill`

Manage skills.

```bash
kq skill list [options]      # List skills
  -a, --all                  # Show all skills
  -t, --tags <tags>          # Filter by tags
  -v, --verbose              # Show details

kq skill validate [options]  # Validate SKILL.md files
  -v, --verbose              # Show detailed errors
```

### `kq adapt`

Generate configuration for AI tools.

```bash
kq adapt <adapter> [options]
kq adapt claude-code         # Generate Claude Code config
kq adapt --all               # Run all adapters
kq adapt --dry-run           # Preview changes
kq adapt --clean             # Remove generated files
```

### `kq status`

Show current configuration status.

```bash
kq status
```

### `kq doctor`

Diagnose configuration issues.

```bash
kq doctor
```

## Configuration

### `kimquy.config.ts`

```typescript
export default {
  profiles: {
    default: {
      name: 'Default Profile',
      description: 'Default AI context',
      skillDirs: ['./skills'],
      envVars: {
        PAI_PROFILE: 'default',
      },
    },
    work: {
      name: 'Work Profile',
      description: 'Enterprise development',
      skillDirs: ['./skills/work', './skills/shared'],
    },
  },
  defaultProfile: 'default',
  skillPatterns: ['**/SKILL.md'],
};
```

### Profile Options

| Option | Type | Description |
|--------|------|-------------|
| `name` | string | Display name for the profile |
| `description` | string | Profile description |
| `skillDirs` | string[] | Directories to scan for skills |
| `envVars` | object | Environment variables to set |

## SKILL.md Format

Skills are Markdown files with YAML frontmatter:

```markdown
---
name: Skill Name
description: Brief description
tags: [tag1, tag2]
profiles: [default, work]
priority: high
triggers: [/my-command]
---

# Skill Content

Markdown content that will be provided to the AI.
```

### Frontmatter Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | Yes | - | Skill name |
| `description` | string | No | `""` | Brief description |
| `tags` | string[] | No | `[]` | Tags for filtering |
| `profiles` | string[] | No | `["*"]` | Profiles this skill applies to (`*` = all) |
| `priority` | `low\|medium\|high` | No | `medium` | Skill priority |
| `triggers` | string[] | No | - | Slash commands that trigger this skill |

## Adapters

### Claude Code

Generates configuration for [Claude Code](https://www.anthropic.com/claude-code).

**Generated files:**
- `.claude/skills.md` - Combined skill content
- `.claude/settings.local.json` - Local settings
- `.claude/commands/<trigger>.md` - Slash commands (if triggers defined)

**Usage:**
```bash
kq adapt claude-code
```

### Cursor

Generates configuration for [Cursor IDE](https://cursor.com).

**Generated files:**
- `.cursor/rules` - Cursor rules file with skill content

**Usage:**
```bash
kq adapt cursor
```

**Notes:**
- Skills are wrapped in markers to allow updates without losing manual rules
- Existing rules outside the Kim Quy section are preserved

## Project Structure

```
your-project/
├── kimquy.config.ts    # Configuration
├── .kimquy/
│   ├── state.json      # Current state
│   └── skills.json     # Skill cache
├── skills/
│   ├── typescript/
│   │   └── SKILL.md
│   └── react/
│       └── SKILL.md
└── .claude/            # Generated by adapter
    ├── skills.md
    └── settings.local.json
```

## Troubleshooting

### "Kim Quy is not initialized"

Run `kq init` in your project directory.

### "No skills found"

1. Check your `skillDirs` in `kimquy.config.ts`
2. Run `kq scan` to discover skills
3. Ensure your skill files are named `SKILL.md`

### "Invalid frontmatter"

Run `kq skill validate --verbose` to see detailed errors.

### Configuration issues

Run `kq doctor` to diagnose problems.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `bun test`
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.
