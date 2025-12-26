# MCP x Hub: Universal MCP Bridge for Your IDE

> **Connect Claude Desktop to VS Code & JetBrains IDEs. Unlock Agentic Coding.**

**MCP x Hub** is the ultimate middleware bridge that seamlessly connects AI Assistants (like **Claude Desktop**) to your local development environment. By adhering to the **Model Context Protocol (MCP)**, it empowers your AI to read files, execute terminal commands, and analyze code directly within **VS Code**, **Cursor**, **Windsurf**, **Antigravity**, and **JetBrains** IDEs.

[![npm version](https://img.shields.io/npm/v/@bugstan/mcpxhub.svg)](https://www.npmjs.com/package/@bugstan/mcpxhub)
[![npm downloads](https://img.shields.io/npm/dt/@bugstan/mcpxhub.svg)](https://www.npmjs.com/package/@bugstan/mcpxhub)
[![MCP Compliant](https://img.shields.io/badge/MCP-JSON--RPC%202.0-blue)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Current Version: v1.2.0**

## 🚀 Why MCP x Hub?

While Claude Desktop is powerful, it's isolated from your codebase. **MCP x Hub** bridges this gap. It acts as a smart gateway, auto-discovering your running IDE instances and proxying MCP tool calls securely.

*   **⚡️ Universal Compatibility**: Works with **VS Code** and all its forks (**Cursor**, **Windsurf**, **Antigravity**) via [ggMCP4VSCode](https://github.com/bugstan/ggMCP4VSCode), as well as **JetBrains IDEs** (IntelliJ, PyCharm, WebStorm, etc.).
*   **🔌 Zero-Config Connection**: Automatically detects active IDE ports. No manual IP/Port editing needed.
*   **🛠 standard-compliant**: Full support for **MCP JSON-RPC 2.0**, ensuring reliable communication and error handling.
*   **🔄 Auto-Reconnection**: Robustly handles IDE restarts without crashing your AI session.
*   **🛡 Secure Proxy**: Forwards requests locally, keeping your code data on your machine.

## 📖 Quick Start guide

Get your AI Agent coding in minutes:

1.  **Install MCP x Hub**:
    ```bash
    npm install -g @bugstan/mcpxhub
    ```

2.  **Install Your IDE Plugin**:
    *   **VS Code**: [ggMCP4VSCode](https://github.com/n2ns/ggMCP4VSCode)
    *   **JetBrains**: [MCP Server Plugin](https://github.com/n2ns/mcp-server-plugin)

3.  **Configure Claude Desktop**:
    Edit your `claude_desktop_config.json`:
    ```json
    {
      "mcpServers": {
        "MCPxHub": {
          "command": "npx",
          "args": ["-y", "@bugstan/mcpxhub"],
          "env": {
            "IDE_TYPE": "vscode" // or "jetbrains"
          }
        }
      }
    }
    ```

4.  **Start Coding**: Launch your IDE, then open Claude Desktop. They will connect automatically!

---

## ✨ Key Features

*   **Smart Discovery**: Scans standard port ranges to find your active IDE (VS Code: 9960-9990, JetBrains: 63342-63352).
*   **Parallel Port Scanning**: Uses advanced parallel scanning to detect your IDE instance instantly, even across large port ranges.
*   **Live Tool Sync**: Detecting new tools or capabilities as you update your IDE plugins.
*   **Protocol Compliance**: Implements the latest MCP JSON-RPC 2.0 specification for maximum compatibility with Claude 3.5 Sonnet and other models.
*   **Resilient Connectivity**: Built-in "Wait for IDE" logic means you can start the tools in any order.

## Required IDE Plugins

MCP x Hub requires an MCP server plugin installed in your IDE to function:

### VS Code Plugin
- **Plugin**: [ggMCP4VSCode](https://github.com/n2ns/ggMCP4VSCode)
- **Features**: Implements MCP server in VS Code, allowing communication with Claude Desktop through MCP x Hub

### JetBrains Plugin
- **Plugin**: [MCP Server Plugin](https://github.com/n2ns/mcp-server-plugin)
- **Compatible IDEs**: IntelliJ IDEA, WebStorm, PyCharm, PhpStorm, and other JetBrains IDEs
- **Features**: Implements MCP server in JetBrains IDEs, enabling Claude integration

## Installation

### NPM Package (Recommended)
```bash
# Global installation
npm install -g @bugstan/mcpxhub

# Or as a project dependency
npm install @bugstan/mcpxhub
```

### From Source

```bash
# Clone the repository
git clone https://github.com/n2ns/MCPxHub.git
cd MCPxHub

# Install dependencies
npm install

# Build the project
npm run build
```

## Building the Project

```bash
npm run build
```

## Bundling into a Single File

```bash
npm run bundle
```

The bundled file will be located at `dist/bundle.js`.

## Local Testing

### Method 1: Using Test Script

#### Linux/macOS
```bash
# Give execution permission to the script
chmod +x test.sh

# Run test script
./test.sh [ide_type]

# Example:
./test.sh jetbrains
```

#### Windows
```cmd
# Run test script
test.bat [ide_type] [mcp_server_port] [mcp_server]

# Example:
test.bat jetbrains 63342 127.0.0.1
```

### Method 2: Manual Environment Variables

The `.claude.example.json` file in this repository contains a sample configuration for Claude Desktop. For manual testing with environment variables:

1. Set environment variables directly:

```bash
# Enable logging
export LOG_ENABLED=true
# Set IDE type ('jetbrains' or 'vscode')
export IDE_TYPE=jetbrains
# Optionally specify MCP server address
# export MCP_SERVER=127.0.0.1
# Optionally specify MCP server port
# export MCP_SERVER_PORT=63342
```

2. Run the bundled application:

```bash
node dist/bundle.js
```

## Automatic Reconnection Feature

MCP x Hub now includes an automatic reconnection mechanism with adaptive polling:

- Even if IDE is not started yet when MCP x Hub starts, the program will continue running and wait for IDE to start
- **Adaptive polling**: 5 seconds when disconnected (quick reconnection), 30 seconds when stable (reduced overhead)
- Continuously attempts to connect without timeout, ensuring stability even if the IDE starts late
- If connection was previously successful but later disconnected, uses fast recovery to reconnect immediately
- Displays friendly status messages during reconnection process

This means you can start MCP x Hub and IDE in any order, and the system will automatically establish a connection.

## Environment Variable Configuration

| Variable Name   | Description        | Default Value |
|-----------------|--------------------|---------------|
| LOG_ENABLED     | Enable log output  | false         |
| MCP_SERVER      | MCP server address | 127.0.0.1     |
| IDE_TYPE        | IDE type           | jetbrains     |
| MCP_SERVER_PORT | MCP server port    | None          |

## Port Ranges

- JetBrains IDE: 63342-63352
- VS Code: 9960-9990

## Connection Priority

1. MCP_SERVER_PORT (if set) - Checks the specific port provided
2. Cached endpoint - Reuses previously successful connection 
3. Scan port range based on IDE_TYPE:
   - For jetbrains: Ports 63342-63352
   - For vscode: Ports 9960-9990
4. If IDE_TYPE is invalid or not set, tries JetBrains port range (63342-63352) as default

## Troubleshooting

1. If connection fails, ensure IDE is running with MCP Server plugin installed
2. Check if firewall allows access to specified ports
3. Enable LOG_ENABLED=true to see detailed logs
4. For JetBrains IDE, default port is 63342

## Technical Documentation

For detailed technical information, development guidelines, and integration instructions, see the docs directory.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.