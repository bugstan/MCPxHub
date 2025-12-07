# Project Development Rules

## ⚠️ CRITICAL: Package Identity Protection

### Published Platforms

This project is published to the following platforms:

| Platform | Package ID | URL |
|----------|------------|-----|
| **NPM Registry** | `@bugstan/mcpxhub` | https://www.npmjs.com/package/@bugstan/mcpxhub |

### NPM Package Name (DO NOT MODIFY)

The following fields in `package.json` are **PERMANENTLY LOCKED** and MUST NEVER be changed:

```json
{
  "name": "@bugstan/mcpxhub"
}
```

**Reason**: This package is published to NPM Registry. Changing the `name` field would:
- Create a completely new package on NPM
- Break all existing users' installations
- Lose all download statistics and reputation
- Require users to manually update their `claude_desktop_config.json`

### What CAN Be Changed

| Field | Can Change? | Notes |
|-------|-------------|-------|
| `name` | ❌ NO | NPM package identity |
| `version` | ✅ YES | Follow semver |
| `repository.url` | ✅ YES | GitHub URL can change |
| `homepage` | ✅ YES | GitHub URL can change |
| `bugs.url` | ✅ YES | GitHub URL can change |
| `author` | ✅ YES | Can update |
| `description` | ✅ YES | Can update |

### Repository Migration Notes

This project was migrated from `github.com/bugstan/MCPxHub` to `github.com/n2ns/MCPxHub`.

- **GitHub repository**: `n2ns/MCPxHub` (new)
- **NPM package**: `@bugstan/mcpxhub` (unchanged, must remain)

---

## Version Consistency Check

Before ANY release, verify version is consistent in:

1. **`package.json`**: `"version": "x.y.z"`
2. **`README.md`**: `> **Current Version: vx.y.z**`

---

## Code Quality

- Use TypeScript strict mode
- Ensure `npm run build` passes without errors
- Follow existing code patterns

---

*Last updated: December 2024*
