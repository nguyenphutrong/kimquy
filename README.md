<p align="center">
  <img src="https://raw.githubusercontent.com/nguyenphutrong/kimquy/main/.github/assets/logo.png" alt="Kim Quy Logo" width="120" height="120" />
</p>

<h1 align="center">🐢 Kim Quy</h1>

<p align="center">
  <strong>Manage AI Profiles and Skills for your AI coding assistants</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/kimquy"><img src="https://img.shields.io/npm/v/kimquy?style=flat-square&color=blue" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/kimquy"><img src="https://img.shields.io/npm/dm/kimquy?style=flat-square&color=green" alt="npm downloads" /></a>
  <a href="https://github.com/nguyenphutrong/kimquy/blob/main/LICENSE"><img src="https://img.shields.io/github/license/nguyenphutrong/kimquy?style=flat-square" alt="license" /></a>
  <a href="https://github.com/nguyenphutrong/kimquy/stargazers"><img src="https://img.shields.io/github/stars/nguyenphutrong/kimquy?style=flat-square" alt="GitHub stars" /></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/bun-%3E%3D1.0.0-orange?style=flat-square" alt="Bun" /></a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-contributing">Contributing</a>
</p>

<p align="center">
  <a href="./README.vi.md">🇻🇳 Tiếng Việt</a>
</p>

---

## 🌟 Why Kim Quy?

As AI coding assistants become an integral part of modern development workflows, managing context and instructions across different projects and tools becomes challenging. **Kim Quy** solves this by providing:

- **🎯 Single Source of Truth**: Define your AI instructions once, deploy everywhere
- **🔄 Profile Switching**: Instantly switch between work, personal, or project-specific contexts
- **🛠️ Multi-Tool Support**: Works with Claude Code, Cursor, and more adapters coming soon
- **📝 Skill System**: Organize reusable instructions in `SKILL.md` files with priority and tagging
- **⚡ TypeScript First**: Full TypeScript support with type-safe configuration

> **Kim Quy** (金龜) means "Golden Turtle" in Vietnamese - a legendary creature symbolizing wisdom and longevity.

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Profile Management** | Switch between different AI contexts (work, personal, project-specific) |
| **Skill System** | Organize reusable AI instructions in `SKILL.md` files |
| **Adapter System** | Generate configuration for multiple AI tools from a single source |
| **TypeScript Config** | Full TypeScript support with `kimquy.config.ts` |
| **CLI Interface** | Intuitive command-line interface with helpful diagnostics |
| **Validation** | Built-in validation for skill files and configuration |

## 📦 Installation

### Using Bun (Recommended)

```bash
bun add -g kimquy
```

### Using npm

```bash
npm install -g kimquy
```

### Using pnpm

```bash
pnpm add -g kimquy
```

### From Source

```bash
git clone https://github.com/nguyenphutrong/kimquy.git
cd kimquy
bun install
bun run build
bun link
```

## 🚀 Quick Start

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

## 📖 Documentation

### CLI Commands

| Command | Description |
|---------|-------------|
| `kq init` | Initialize Kim Quy in a directory |
| `kq use <profile>` | Switch to a different profile |
| `kq profile` | Manage profiles (list, show, create, delete) |
| `kq scan` | Scan and index all skills |
| `kq skill` | Manage skills (list, validate) |
| `kq adapt <adapter>` | Generate configuration for AI tools |
| `kq status` | Show current configuration status |
| `kq doctor` | Diagnose configuration issues |

<details>
<summary><b>📌 kq init</b></summary>

Initialize Kim Quy in a directory.

```bash
kq init [options]

Options:
  --profile <name>  Initial profile name (default: "default")
  --force           Overwrite existing configuration
```

</details>

<details>
<summary><b>📌 kq use</b></summary>

Switch to a different profile.

```bash
kq use work
kq use personal
```

</details>

<details>
<summary><b>📌 kq profile</b></summary>

Manage profiles.

```bash
kq profile list              # List all profiles
kq profile show <name>       # Show profile details
kq profile create <name>     # Create a new profile
kq profile delete <name>     # Delete a profile
```

</details>

<details>
<summary><b>📌 kq scan</b></summary>

Scan and index all skills.

```bash
kq scan [options]

Options:
  -d, --dir <dir>   Additional directory to scan
  -f, --force       Force full rescan
  -v, --verbose     Show detailed output
  -q, --quiet       Only show summary
```

</details>

<details>
<summary><b>📌 kq skill</b></summary>

Manage skills.

```bash
kq skill list [options]      # List skills
  -a, --all                  # Show all skills
  -t, --tags <tags>          # Filter by tags
  -v, --verbose              # Show details

kq skill validate [options]  # Validate SKILL.md files
  -v, --verbose              # Show detailed errors
```

</details>

<details>
<summary><b>📌 kq adapt</b></summary>

Generate configuration for AI tools.

```bash
kq adapt <adapter> [options]
kq adapt claude-code         # Generate Claude Code config
kq adapt cursor              # Generate Cursor config
kq adapt --all               # Run all adapters
kq adapt --dry-run           # Preview changes
kq adapt --clean             # Remove generated files
```

</details>

### Configuration

#### `kimquy.config.ts`

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

#### Profile Options

| Option | Type | Description |
|--------|------|-------------|
| `name` | string | Display name for the profile |
| `description` | string | Profile description |
| `skillDirs` | string[] | Directories to scan for skills |
| `envVars` | object | Environment variables to set |

### SKILL.md Format

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

#### Frontmatter Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Skill name |
| `description` | string | ❌ | `""` | Brief description |
| `tags` | string[] | ❌ | `[]` | Tags for filtering |
| `profiles` | string[] | ❌ | `["*"]` | Profiles this skill applies to (`*` = all) |
| `priority` | `low\|medium\|high` | ❌ | `medium` | Skill priority |
| `triggers` | string[] | ❌ | - | Slash commands that trigger this skill |

### Adapters

#### Claude Code

Generates configuration for [Claude Code](https://www.anthropic.com/claude-code).

**Generated files:**
- `.claude/skills.md` - Combined skill content
- `.claude/settings.local.json` - Local settings
- `.claude/commands/<trigger>.md` - Slash commands (if triggers defined)

#### Cursor

Generates configuration for [Cursor IDE](https://cursor.com).

**Generated files:**
- `.cursor/rules` - Cursor rules file with skill content

### Project Structure

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

## 🔧 Troubleshooting

<details>
<summary><b>"Kim Quy is not initialized"</b></summary>

Run `kq init` in your project directory.

</details>

<details>
<summary><b>"No skills found"</b></summary>

1. Check your `skillDirs` in `kimquy.config.ts`
2. Run `kq scan` to discover skills
3. Ensure your skill files are named `SKILL.md`

</details>

<details>
<summary><b>"Invalid frontmatter"</b></summary>

Run `kq skill validate --verbose` to see detailed errors.

</details>

<details>
<summary><b>Configuration issues</b></summary>

Run `kq doctor` to diagnose problems.

</details>

## 🗺️ Roadmap

- [ ] **Windsurf Adapter** - Support for Windsurf IDE
- [ ] **Zed Adapter** - Support for Zed editor
- [ ] **VS Code Adapter** - Support for VS Code with AI extensions
- [ ] **Skill Marketplace** - Share and discover community skills
- [ ] **Team Profiles** - Shared profiles for teams
- [ ] **Skill Inheritance** - Extend skills from base templates
- [ ] **Watch Mode** - Auto-regenerate on skill changes

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See the [open issues](https://github.com/nguyenphutrong/kimquy/issues) for a list of proposed features and known issues.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need for better AI context management
- Built with [Bun](https://bun.sh), [Commander.js](https://github.com/tj/commander.js), and [Zod](https://zod.dev)
- Thanks to all [contributors](https://github.com/nguyenphutrong/kimquy/graphs/contributors)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/nguyenphutrong">Trong Nguyen</a>
</p>
