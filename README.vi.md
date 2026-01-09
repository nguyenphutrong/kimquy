<p align="center">
  <img src="https://raw.githubusercontent.com/nguyenphutrong/kimquy/main/.github/assets/logo.png" alt="Kim Quy Logo" width="120" height="120" />
</p>

<h1 align="center">🐢 Kim Quy</h1>

<p align="center">
  <strong>Quản lý Profiles và Skills AI cho các trợ lý lập trình AI</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/kimquy"><img src="https://img.shields.io/npm/v/kimquy?style=flat-square&color=blue" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/kimquy"><img src="https://img.shields.io/npm/dm/kimquy?style=flat-square&color=green" alt="npm downloads" /></a>
  <a href="https://github.com/nguyenphutrong/kimquy/blob/main/LICENSE"><img src="https://img.shields.io/github/license/nguyenphutrong/kimquy?style=flat-square" alt="license" /></a>
  <a href="https://github.com/nguyenphutrong/kimquy/stargazers"><img src="https://img.shields.io/github/stars/nguyenphutrong/kimquy?style=flat-square" alt="GitHub stars" /></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/bun-%3E%3D1.0.0-orange?style=flat-square" alt="Bun" /></a>
</p>

<p align="center">
  <a href="#-tính-năng">Tính năng</a> •
  <a href="#-cài-đặt">Cài đặt</a> •
  <a href="#-bắt-đầu-nhanh">Bắt đầu nhanh</a> •
  <a href="#-best-practices">Best Practices</a> •
  <a href="#-tài-liệu">Tài liệu</a> •
  <a href="#-đóng-góp">Đóng góp</a>
</p>

<p align="center">
  <a href="./README.md">🇬🇧 English</a>
</p>

---

## 🌟 Tại sao chọn Kim Quy?

Khi các trợ lý lập trình AI trở thành một phần không thể thiếu trong quy trình phát triển hiện đại, việc quản lý ngữ cảnh và hướng dẫn qua các dự án và công cụ khác nhau trở nên khó khăn. **Kim Quy** giải quyết vấn đề này bằng cách cung cấp:

- **🎯 Nguồn Chân lý Duy nhất**: Định nghĩa hướng dẫn AI một lần, triển khai ở mọi nơi
- **🔄 Chuyển đổi Profile**: Chuyển đổi tức thì giữa các ngữ cảnh công việc, cá nhân hoặc dự án cụ thể
- **🛠️ Hỗ trợ Đa công cụ**: Hoạt động với Claude Code, Cursor và nhiều adapter sắp ra mắt
- **📝 Hệ thống Skill**: Tổ chức hướng dẫn tái sử dụng trong các file `SKILL.md` với độ ưu tiên và gắn thẻ
- **⚡ TypeScript First**: Hỗ trợ TypeScript đầy đủ với cấu hình type-safe

> **Kim Quy** (金龜) có nghĩa là "Rùa Vàng" trong tiếng Việt - một sinh vật huyền thoại tượng trưng cho trí tuệ và trường thọ.

## ✨ Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| **Quản lý Profile** | Chuyển đổi giữa các ngữ cảnh AI khác nhau (công việc, cá nhân, dự án cụ thể) |
| **Hệ thống Skill** | Tổ chức hướng dẫn AI tái sử dụng trong các file `SKILL.md` |
| **Hệ thống Adapter** | Tạo cấu hình cho nhiều công cụ AI từ một nguồn duy nhất |
| **Cấu hình TypeScript** | Hỗ trợ TypeScript đầy đủ với `kimquy.config.ts` |
| **Giao diện CLI** | Giao diện dòng lệnh trực quan với chẩn đoán hữu ích |
| **Xác thực** | Xác thực tích hợp cho file skill và cấu hình |

## 📦 Cài đặt

### Dành cho người dùng

#### Sử dụng Bun (Khuyến nghị)

```bash
bun add -g kimquy
```

#### Sử dụng npm

```bash
npm install -g kimquy
```

#### Sử dụng pnpm

```bash
pnpm add -g kimquy
```

#### Từ mã nguồn

```bash
git clone https://github.com/nguyenphutrong/kimquy.git
cd kimquy
bun install
bun run build
bun link
```

### Dành cho AI Agent

Copy prompt sau vào AI coding assistant:

```
Install and configure agentlens by following the instructions at:
https://github.com/nguyenphutrong/kimquy/blob/main/docs/ai-agent-setup.md
```

## 🚀 Bắt đầu nhanh

### 1. Khởi tạo Kim Quy

Cấp project:

```bash
cd your-project
kq init --profile=default
```

Cấp user (global):

```bash
kq init --global --profile=default
```

Lệnh này tạo ra:
- `kimquy.config.ts` - File cấu hình
- `.kimquy/` - Thư mục trạng thái
- `skills/` - Thư mục skill mặc định với file `SKILL.md` mẫu

Global config nằm ở `~/.config/kimquy/` và được merge với config của project (project ưu tiên).

### 2. Tạo một skill

Tạo file `skills/typescript/SKILL.md`:

```markdown
---
name: TypeScript Guidelines
tags: [typescript, coding]
profiles: [default]
priority: high
---

# Hướng dẫn TypeScript

## Khi nào sử dụng
- Khi viết code TypeScript
- Khi review các file TypeScript

## Hướng dẫn
- Sử dụng strict mode
- Ưu tiên interfaces hơn type aliases cho object shapes
- Sử dụng const assertions cho literal types
```

### 3. Quét tìm skills

```bash
kq scan
```

### 4. Tạo cấu hình cho công cụ AI

```bash
kq adapt claude-code
```

Lệnh này tạo ra `.claude/skills.md` và `.claude/settings.local.json` cho Claude Code.

### 5. Kiểm tra trạng thái

```bash
kq status
```

## ✅ Best Practices

- Dùng global config cho quy tắc chung, project config cho quy tắc riêng.
- Giữ skills ngắn gọn, tập trung và gắn tag để dễ tìm.
- Dùng profiles để tách ngữ cảnh work/personal.
- Dùng triggers cho các quy trình lặp lại.
- Sau khi sửa skills, chạy `kq scan` và `kq adapt`.

## 📖 Tài liệu

### Các lệnh CLI

| Lệnh | Mô tả |
|------|-------|
| `kq init` | Khởi tạo Kim Quy trong thư mục |
| `kq use <profile>` | Chuyển sang profile khác |
| `kq profile` | Quản lý profiles (list, show, create, delete) |
| `kq scan` | Quét và lập chỉ mục tất cả skills |
| `kq skill` | Quản lý skills (list, validate) |
| `kq adapt <adapter>` | Tạo cấu hình cho công cụ AI |
| `kq status` | Hiển thị trạng thái cấu hình hiện tại |
| `kq doctor` | Chẩn đoán vấn đề cấu hình |
| `kq import <tool>` | Import skills từ công cụ bên ngoài |

<details>
<summary><b>📌 kq init</b></summary>

Khởi tạo Kim Quy trong thư mục hoặc global.

```bash
kq init [options]

Options:
  --profile <name>  Tên profile ban đầu (mặc định: "default")
  --force           Ghi đè cấu hình hiện có
  --global          Khởi tạo cấu hình global ở cấp user
```

</details>

<details>
<summary><b>📌 kq use</b></summary>

Chuyển sang profile khác.

```bash
kq use work
kq use personal
```

</details>

<details>
<summary><b>📌 kq profile</b></summary>

Quản lý profiles.

```bash
kq profile list              # Liệt kê tất cả profiles
kq profile show <name>       # Hiển thị chi tiết profile
kq profile create <name>     # Tạo profile mới
kq profile delete <name>     # Xóa profile
```

</details>

<details>
<summary><b>📌 kq scan</b></summary>

Quét và lập chỉ mục tất cả skills.

```bash
kq scan [options]

Options:
  -d, --dir <dir>   Thư mục bổ sung để quét
  -f, --force       Bắt buộc quét lại toàn bộ
  -v, --verbose     Hiển thị output chi tiết
  -q, --quiet       Chỉ hiển thị tóm tắt
```

</details>

<details>
<summary><b>📌 kq skill</b></summary>

Quản lý skills.

```bash
kq skill list [options]      # Liệt kê skills
  -a, --all                  # Hiển thị tất cả skills
  -t, --tags <tags>          # Lọc theo tags
  -v, --verbose              # Hiển thị chi tiết

kq skill validate [options]  # Xác thực các file SKILL.md
  -v, --verbose              # Hiển thị lỗi chi tiết
```

</details>

<details>
<summary><b>📌 kq adapt</b></summary>

Tạo cấu hình cho công cụ AI.

```bash
kq adapt <adapter> [options]
kq adapt claude-code         # Tạo cấu hình Claude Code
kq adapt cursor              # Tạo cấu hình Cursor
kq adapt --all               # Chạy tất cả adapters
kq adapt --dry-run           # Xem trước thay đổi
kq adapt --clean             # Xóa các file đã tạo
```

</details>

<details>
<summary><b>📌 kq import</b></summary>

Import skills từ công cụ bên ngoài.

```bash
kq import claude             # Import Claude Code commands
kq import cursor             # Import Cursor rules
kq import claude --output ./skills/claude
kq import cursor --force
```

</details>

### Cấu hình

#### `kimquy.config.ts`

```typescript
export default {
  profiles: {
    default: {
      name: 'Default Profile',
      description: 'Ngữ cảnh AI mặc định',
      skillDirs: ['./skills'],
      envVars: {
        PAI_PROFILE: 'default',
      },
    },
    work: {
      name: 'Work Profile',
      description: 'Phát triển doanh nghiệp',
      skillDirs: ['./skills/work', './skills/shared'],
    },
  },
  defaultProfile: 'default',
  skillPatterns: ['**/SKILL.md'],
};
```

#### Tùy chọn Profile

| Tùy chọn | Kiểu | Mô tả |
|----------|------|-------|
| `name` | string | Tên hiển thị của profile |
| `description` | string | Mô tả profile |
| `skillDirs` | string[] | Các thư mục để quét skills |
| `envVars` | object | Biến môi trường cần thiết lập |

### Định dạng SKILL.md

Skills là các file Markdown với YAML frontmatter:

```markdown
---
name: Tên Skill
description: Mô tả ngắn gọn
tags: [tag1, tag2]
profiles: [default, work]
priority: high
triggers: [/my-command]
---

# Nội dung Skill

Nội dung Markdown sẽ được cung cấp cho AI.
```

#### Các trường Frontmatter

| Trường | Kiểu | Bắt buộc | Mặc định | Mô tả |
|--------|------|----------|----------|-------|
| `name` | string | ✅ | - | Tên skill |
| `description` | string | ❌ | `""` | Mô tả ngắn gọn |
| `tags` | string[] | ❌ | `[]` | Tags để lọc |
| `profiles` | string[] | ❌ | `["*"]` | Profiles skill này áp dụng (`*` = tất cả) |
| `priority` | `low\|medium\|high` | ❌ | `medium` | Độ ưu tiên skill |
| `triggers` | string[] | ❌ | - | Slash commands kích hoạt skill này |

### Adapters

#### Claude Code

Tạo cấu hình cho [Claude Code](https://www.anthropic.com/claude-code).

**Các file được tạo:**
- `.claude/skills.md` - Nội dung skill kết hợp
- `.claude/settings.local.json` - Cài đặt local
- `.claude/commands/<trigger>.md` - Slash commands (nếu triggers được định nghĩa)

#### Cursor

Tạo cấu hình cho [Cursor IDE](https://cursor.com).

**Các file được tạo:**
- `.cursor/rules` - File rules Cursor với nội dung skill

### Cấu trúc Dự án

```
your-project/
├── kimquy.config.ts    # Cấu hình
├── .kimquy/
│   ├── state.json      # Trạng thái hiện tại
│   └── skills.json     # Cache skills
├── skills/
│   ├── typescript/
│   │   └── SKILL.md
│   └── react/
│       └── SKILL.md
└── .claude/            # Được tạo bởi adapter
    ├── skills.md
    └── settings.local.json
```

## 🔧 Xử lý sự cố

<details>
<summary><b>"Kim Quy is not initialized"</b></summary>

Chạy `kq init` trong thư mục dự án của bạn.

</details>

<details>
<summary><b>"No skills found"</b></summary>

1. Kiểm tra `skillDirs` trong `kimquy.config.ts`
2. Chạy `kq scan` để khám phá skills
3. Đảm bảo các file skill có tên `SKILL.md`

</details>

<details>
<summary><b>"Invalid frontmatter"</b></summary>

Chạy `kq skill validate --verbose` để xem lỗi chi tiết.

</details>

<details>
<summary><b>Vấn đề cấu hình</b></summary>

Chạy `kq doctor` để chẩn đoán vấn đề.

</details>

## 🗺️ Lộ trình

- [ ] **Windsurf Adapter** - Hỗ trợ Windsurf IDE
- [ ] **Zed Adapter** - Hỗ trợ Zed editor
- [ ] **VS Code Adapter** - Hỗ trợ VS Code với các extension AI
- [ ] **Skill Marketplace** - Chia sẻ và khám phá skills cộng đồng
- [ ] **Team Profiles** - Profiles chia sẻ cho team
- [ ] **Skill Inheritance** - Kế thừa skills từ template cơ sở
- [ ] **Watch Mode** - Tự động tạo lại khi skill thay đổi

## 🤝 Đóng góp

Chúng tôi hoan nghênh đóng góp! Vui lòng đọc [Hướng dẫn Đóng góp](CONTRIBUTING.md) trước khi gửi PR.

1. Fork repository
2. Tạo nhánh tính năng (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi (`git commit -m 'feat: add amazing feature'`)
4. Push lên nhánh (`git push origin feature/amazing-feature`)
5. Mở Pull Request

Xem [issues đang mở](https://github.com/nguyenphutrong/kimquy/issues) để biết danh sách tính năng đề xuất và vấn đề đã biết.

## 📄 Giấy phép

Dự án này được cấp phép theo MIT License - xem file [LICENSE](LICENSE) để biết chi tiết.

## 🙏 Lời cảm ơn

- Lấy cảm hứng từ nhu cầu quản lý ngữ cảnh AI tốt hơn
- Được xây dựng với [Bun](https://bun.sh), [Commander.js](https://github.com/tj/commander.js), và [Zod](https://zod.dev)
- Cảm ơn tất cả [contributors](https://github.com/nguyenphutrong/kimquy/graphs/contributors)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/nguyenphutrong">Trong Nguyen</a>
</p>
