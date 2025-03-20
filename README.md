# MCP x Hub

A middleware that forwards MCP (Model Context Protocol) requests from clients (like Claude Desktop) to local IDE extension instances (JetBrains or VS Code). It supports automatic discovery of IDE endpoints, tool list update detection, and tool call forwarding.

## Features

- Automatic IDE endpoint discovery
- Tool list update detection
- Tool call forwarding
- Detailed logging and error handling
- Automatic reconnection mechanism, waits for IDE to start

## Installation

Recommended using pnpm:

```bash
pnpm install
```

Or using npm:

```bash
npm install
```

## Building the Project

```bash
pnpm build
```

## Bundling into a Single File

```bash
pnpm bundle
```

The bundled file will be located at `dist/bundle.js`.

## Local Testing

### Method 1: Using Test Script

```bash
# Give execution permission to the script
chmod +x test.sh

# Run test script
./test.sh [ide_type]

# Example:
./test.sh jetbrains
```

### Method 2: Manual Environment Variables

1. Copy the environment variable configuration file:

```bash
cp .claude.example .env
```

2. Modify the `.env` file as needed:

```bash
# Enable logging
LOG_ENABLED=true
# Set IDE type ('jetbrains' or 'vscode')
IDE_TYPE=jetbrains
# Optionally specify MCP server address
# MCP_SERVER=127.0.0.1
# Optionally specify MCP server port
# MCP_SERVER_PORT=63342
```

3. Run the bundled application:

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

1. MCP_SERVER_PORT (if set)
2. Scan port range based on IDE type
3. If IDE_TYPE not set, try JetBrains port range as default

## Troubleshooting

1. If connection fails, ensure IDE is running with MCP Server plugin installed
2. Check if firewall allows access to specified ports
3. Enable LOG_ENABLED=true to see detailed logs
4. For JetBrains IDE, default port is 63342

## Future Development Plans

### Short-Term Goals (Next 1-2 releases)

- Add support for secure connections (HTTPS)
- Implement better error reporting and diagnostics
- Add configuration file support
- Create comprehensive test suite
- Improve logging with different log levels

### Medium-Term Goals (3-6 months)

- Support for multiple simultaneous IDE connections
- Web-based admin UI for configuration and monitoring
- Performance optimizations for high-volume tool calls
- Docker container for easier deployment
- Plugin system for extending functionality

### Long-Term Goals (6+ months)

- Full MCP 2.0 protocol support when released
- Extended IDE support for additional editors
- Cross-language tooling support
- Analytics and metrics collection (opt-in)
- Distributed deployment options for enterprise environments

## Technical Documentation

For detailed technical information, development guidelines, and integration instructions, see [Technical Guide](docs/technical-guide.md).

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.