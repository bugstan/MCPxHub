# MCPxHub - Deployment Guide

This document covers the build, release, and publishing process for the MCPxHub npm package.

---

## Prerequisites

- Node.js >= 20.x
- pnpm (recommended) or npm
- npm account with publish access

---

## 1. Local Development

### Install Dependencies

```bash
pnpm install
# Or with npm:
npm install
```

### Build

```bash
pnpm build
# Or with npm:
npm run build
```

### Watch Mode

```bash
pnpm watch
```

### Bundle (Single File)

```bash
pnpm bundle
# Or with npm:
npm run bundle:npm
```

The bundled file will be located at `dist/bundle.js`.

---

## 2. Local Testing

### Method 1: Using Test Script

**Linux/macOS:**
```bash
chmod +x test.sh
./test.sh [ide_type]

# Example:
./test.sh vscode
```

**Windows:**
```cmd
test.bat [ide_type] [mcp_server_port] [mcp_server]

# Example:
test.bat jetbrains 63342 127.0.0.1
```

### Method 2: Environment Variables

```bash
export LOG_ENABLED=true
export IDE_TYPE=vscode
node dist/bundle.js
```

---

## 3. Release Process

This project uses **GitHub Actions** for automated releases to npm.

### How to Release

```bash
# 1. Update version in package.json
# 2. Update version in README.md (Current Version badge)

# 3. Commit changes
git add .
git commit -m "chore: bump version to x.x.x"
git push origin main

# 4. Create and push tag
git tag vx.x.x
git push origin vx.x.x
```

### Automated Publishing

When a tag matching `v*` is pushed, GitHub Actions automatically:

1. **Install** - Uses pnpm to install dependencies
2. **Build** - Bundles the package
3. **Publish** - Publishes to npm as `@bugstan/mcpxhub`

---

## 4. Required GitHub Secrets

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `NPM_TOKEN` | npm Automation Token | [npmjs.com](https://www.npmjs.com/) → Access Tokens → Generate |

### Creating NPM_TOKEN

1. Go to [npmjs.com](https://www.npmjs.com/)
2. Sign in to your account
3. Click your avatar → Access Tokens
4. Generate New Token → Select "Automation"
5. Copy and save the token

---

## 5. Manual Publishing (Optional)

### Using npm

```bash
npm run bundle:npm
npm publish --access public
```

### Using pnpm

```bash
pnpm bundle
npm publish --access public
```

---

## 6. CI/CD Configuration

| Setting | Value |
|---------|-------|
| Trigger | Push tag matching `v*` |
| Workflow | `.github/workflows/publish.yaml` |
| Node Version | 20.x |
| Package Manager | pnpm |
| Target | npm Registry |
| Package Name | `@bugstan/mcpxhub` |

---

## 7. Verifying Release

After publishing, verify the release:

```bash
# Check npm
npm view @bugstan/mcpxhub version

# Test installation
npm install -g @bugstan/mcpxhub
mcpxhub --help
```

---

## 8. Troubleshooting

### npm Publish Errors

| Error | Solution |
|-------|----------|
| `403 Forbidden` | Ensure `NPM_TOKEN` has publish access |
| `E404 Not Found` | First publish requires `--access public` for scoped packages |
| `ENEEDAUTH` | Token is invalid or expired, regenerate it |

### Build Errors

```bash
# Clean build
rm -rf dist node_modules
pnpm install
pnpm bundle
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.2.0 | 2025-12-26 | Enhanced test coverage (52 tests), code quality improvements, documentation updates |
| v1.1.0 | 2025-12-26 | Performance optimizations, adaptive polling, request timeouts, Node.js 20+ requirement |
| v1.0.0 | 2025-12-07 | Initial release |
