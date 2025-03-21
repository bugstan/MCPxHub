# MCP x Hub

A middleware that forwards MCP (Model Context Protocol) requests from clients (like Claude Desktop) to local IDE extension instances (JetBrains or VS Code). It supports automatic discovery of IDE endpoints, tool list update detection, and tool call forwarding.

[![npm version](https://img.shields.io/npm/v/@bugstan/mcpxhub.svg)](https://www.npmjs.com/package/@bugstan/mcpxhub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Start

1. **Install MCP x Hub**:
   ```bash
   npm install -g @bugstan/mcpxhub
   ```

2. **Install Required IDE Plugin**:
   - For VS Code: [ggMCP4VSCode](https://github.com/bugstan/ggMCP4VSCode)
   - For JetBrains IDEs: [MCP Server Plugin](https://github.com/bugstan/mcp-server-plugin)

3. **Configure Claude Desktop**:
   
   Edit your Claude Desktop config file (typically `claude_desktop_config.json`):
   ```json
   {
     "globalShortcut": "",
     "mcpServers": {
       "MCPxHub": {
         "command": "npx",
         "args": [
           "-y",
           "@bugstan/mcpxhub"
         ],
         "env": {
           "LOG_ENABLED": "true",
           "IDE_TYPE": "jetbrains"
         }
       }
     }
   }
   ```

4. **Start your IDE** (JetBrains or VS Code) with the MCP Server plugin installed

5. **Launch Claude Desktop** - It will automatically start MCP x Hub and connect to your IDE

For more detailed configuration options, see the [Environment Variable Configuration](#environment-variable-configuration) section below.

## Features

- Automatic IDE endpoint discovery
- Tool list update detection
- Tool call forwarding
- Detailed logging and error handling
- Automatic reconnection mechanism, waits for IDE to start

## Required IDE Plugins

MCP x Hub requires an MCP server plugin installed in your IDE to function:

### VS Code Plugin
- **Plugin**: [ggMCP4VSCode](https://github.com/bugstan/ggMCP4VSCode)
- **Features**: Implements MCP server in VS Code, allowing communication with Claude Desktop through MCP x Hub

### JetBrains Plugin
- **Plugin**: [MCP Server Plugin](https://github.com/bugstan/mcp-server-plugin)
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
git clone https://github.com/bugstan/MCPxHub.git
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

MCP x Hub now includes an automatic reconnection mechanism:

- Even if IDE is not started yet when MCP x Hub starts, the program will continue running and wait for IDE to start
- Attempts to reconnect every 10 seconds
- Gives up after 30 attempts (approximately 5 minutes)
- If connection was previously successful but later disconnected, will continue trying to reconnect
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