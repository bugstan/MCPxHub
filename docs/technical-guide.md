# MCP x Hub Technical Guide

This document provides comprehensive technical information about MCP x Hub, including design principles, interfaces, development guidelines, and integration instructions.

## Table of Contents

- [Project Design](#project-design)
- [Communication Interfaces](#communication-interfaces)
- [Development Guide](#development-guide)
- [Integration Guide](#integration-guide)

## Project Design

### Overview

MCP x Hub is a middleware that forwards Model Context Protocol (MCP) requests from clients (like Claude Desktop) to local IDE extension instances. It enables AI code assistants to interact directly with IDEs, allowing them to read and write code files automatically.

Currently supports two types of IDEs:
- JetBrains IDEs (IntelliJ, WebStorm, PyCharm, etc., with MCP Server plugin installed)
- Visual Studio Code (with MCP Server extension installed)

### Technical Architecture

The project follows a three-layer architecture pattern:

1. **Client Layer**: AI assistant (e.g., Claude Desktop)
2. **Middleware Layer**: This project (MCP x Hub)
3. **Server Layer**: MCP Server instance in the IDE

Communication flow:
```
AI Assistant <--MCP Protocol--> MCPxHub <--HTTP Protocol--> MCP Server (IDE plugin)
```

### Technology Stack

- **Development Language**: TypeScript 5.3+
- **Runtime Environment**: Node.js (ES Modules)
- **Build Tool**: TypeScript compiler (tsc)
- **Package Manager**: npm (or pnpm)
- **Core Dependencies**:
  - `@modelcontextprotocol/sdk`: MCP protocol SDK
  - `node-fetch`: HTTP request library

### Core Features

#### MCP Server Discovery Mechanism

The middleware uses a multi-level strategy to automatically discover and connect to MCP Server in the IDE:

1. **Explicit Port Specification**: Prioritize using the `MCP_SERVER_PORT` environment variable
2. **Cached Endpoint Reuse**: Use previously verified available cached endpoint
3. **Port Scanning**: Automatically scan port range based on IDE type
   - JetBrains IDEs: 63342-63352
   - VS Code: 9960-9990

Implementation in the `findWorkingIDEEndpoint()` function:
```typescript
async function findWorkingIDEEndpoint(): Promise<string> {
    log(`Attempting to find a working ${IDE_TYPE ? IDE_TYPE.toUpperCase() : 'IDE'} endpoint... (Attempt ${retryCount + 1}/${MAX_RETRY_COUNT})`);

    // 1. Priority use of specified port
    if (MCP_SERVER_PORT) {
        log(`MCP_SERVER_PORT is set to ${MCP_SERVER_PORT}. Testing this port first.`);
        const testEndpoint = `http://${MCP_SERVER}:${MCP_SERVER_PORT}/api`;
        if (await testListTools(testEndpoint)) {
            success(`MCP_SERVER_PORT ${MCP_SERVER_PORT} is working - using endpoint ${testEndpoint}`);
            return testEndpoint;
        } else {
            warn(`Specified MCP_SERVER_PORT=${MCP_SERVER_PORT} is not responding correctly. Will retry later.`);
        }
    }

    // 2. Use cached endpoint (if still available)
    if (cachedEndpoint != null && await testListTools(cachedEndpoint)) {
        debug('Using cached endpoint, it\'s still working');
        return cachedEndpoint;
    }

    // 3. Scan port range based on IDE_TYPE
    let portRange;
    
    if (!isValidIDEType(IDE_TYPE)) {
        warn(`Invalid or missing IDE_TYPE: ${IDE_TYPE}. Will try JetBrains IDE ports as default.`);
        portRange = PORT_RANGES.jetbrains;
    } else {
        portRange = PORT_RANGES[IDE_TYPE];
    }
    
    log(`Scanning port range: ${portRange.start}-${portRange.end}`);

    for (let port = portRange.start; port <= portRange.end; port++) {
        const candidateEndpoint = `http://${MCP_SERVER}:${port}/api`;
        debug(`Testing port ${port}...`);
        const isWorking = await testListTools(candidateEndpoint);
        if (isWorking) {
            success(`Found working endpoint at ${candidateEndpoint}`);
            return candidateEndpoint;
        }
    }

    // 4. Handle retry/failure cases
    retryCount++;
    if (retryCount >= MAX_RETRY_COUNT) {
        error(`Reached maximum retry count (${MAX_RETRY_COUNT}). No working endpoint found.`);
        throw new Error(`No working endpoint found after ${MAX_RETRY_COUNT} attempts.`);
    } else if (hasEverConnected) {
        warn(`Connection lost. Previously connected but now not responding. Will retry.`);
        throw new Error(`Connection lost. Waiting for reconnection...`);
    } else {
        warn(`No working endpoint found in range ${portRange.start}-${portRange.end}. Will retry in 10 seconds.`);
        throw new Error(`Waiting for IDE to start (Attempt ${retryCount}/${MAX_RETRY_COUNT})...`);
    }
}
```

#### Request Forwarding Implementation

The middleware uses `@modelcontextprotocol/sdk` to create a server instance and implements two key request handlers:

1. **Tool List Request**: Get the list of tools supported by the IDE and return it to the AI assistant
2. **Tool Call Request**: Forward the AI assistant's tool call request to the IDE's MCP Server

## Communication Interfaces

### Communication Architecture

```
+-----------------+       +---------------------+       +---------------+
|                 |       |                     |       |               |
| AI Client       | <---> | MCP x Hub           | <---> | MCP Server    |
| (Claude Desktop)|       | (MCP Middleware)    |       | (JetBrains/   |
|                 |       |                     |       |  VS Code)     |
+-----------------+       +---------------------+       +---------------+
      MCP Protocol                                      HTTP Protocol
     (stdio transport)                                 (Port Communication)
```

### Communication Methods

#### Communication with MCP Server
- **Protocol**: HTTP
- **Connection Type**: Short connection, request-response mode
- **Endpoint Format**: `http://${MCP_SERVER}:${PORT}/api/mcp/*`
- **Endpoint Discovery**: Automatically scan ports for MCP Server instances

#### Communication with Client
- **Protocol**: MCP (Model Context Protocol)
- **Transport Layer**: StdioServerTransport (standard input output)
- **Connection Type**: Long connection, based on stdio stream

### IDE Request Interfaces

MCP x Hub as a client sends HTTP requests to MCP Server:

#### 1. Get Tool List

- **URL**: `http://${MCP_SERVER}:${PORT}/api/mcp/list_tools`
- **Method**: GET
- **Function**: Get all tools supported by MCP Server
- **Response Format**: JSON object
  ```json
  {
    "tools": [
      {
        "name": "tool_name",
        "description": "tool_description",
        "parameters": {
          "type": "object",
          "properties": {
            "param1": { "type": "string" },
            "param2": { "type": "number" }
          },
          "required": ["param1"]
        }
      }
    ]
  }
  ```

#### 2. Tool Call

- **URL**: `http://${MCP_SERVER}:${PORT}/api/mcp/${toolName}`
- **Method**: POST
- **Request Headers**: 
  ```
  Content-Type: application/json
  ```
- **Request Body**: JSON object, tool parameters
  ```json
  {
    "param1": "value1",
    "param2": 123
  }
  ```
- **Function**: Execute specific tool call
- **Response Format**: JSON object
  ```json
  {
    "status": "Operation successful message",
    "error": null
  }
  ```
  or
  ```json
  {
    "status": null,
    "error": "Error message"
  }
  ```

### Client Interfaces

MCP x Hub as a server provides MCP protocol interfaces to AI assistants:

#### 1. Tool List Request Handler

- **Protocol**: MCP
- **Request Type**: ListToolsRequestSchema
- **Function**: Respond to client's request to get tool list
- **Response Format**:
  ```json
  {
    "jsonrpc": "2.0",
    "id": "request-id",
    "result": {
      "tools": [
        {
          "name": "tool_name",
          "description": "tool_description",
          "parameters": {
            "type": "object",
            "properties": {
              "param1": { "type": "string" },
              "param2": { "type": "number" }
            },
            "required": ["param1"]
          }
        }
      ]
    }
  }
  ```

#### 2. Tool Call Request Handler

- **Protocol**: MCP
- **Request Type**: CallToolRequestSchema
- **Function**: Respond to client's tool call request
- **Response Format**:
  ```json
  {
    "jsonrpc": "2.0",
    "id": "request-id",
    "result": {
      "content": [
        {
          "type": "text",
          "text": "Operation result message"
        }
      ],
      "isError": false
    }
  }
  ```

### Data Structures

```typescript
interface IDEResponseOk {
    /** Operation successful status message */
    status: string;
    /** Error is null */
    error: null;
}

interface IDEResponseErr {
    /** Status is null */
    status: null;
    /** Error message */
    error: string;
}

type IDEResponse = IDEResponseOk | IDEResponseErr;
```

```typescript
interface CallToolResult {
    content: Array<{
        type: string;
        text: string;
    }>;
    isError: boolean;
}
```

## Development Guide

### Code Structure

The project code is organized concisely, with main functionality concentrated in the source files:

```
/
├── src/                 # TypeScript source files
├── dist/                # Compiled JavaScript code
├── package.json         # Project configuration and dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

### Development Environment Setup

```bash
# Install prerequisites
npm install -g npm  # Update npm if needed

# Install project dependencies
npm install
```

### Building the Project

```bash
npm run build
```

### Development Mode

Use watch mode during development to automatically recompile changed files:
```bash
npm run watch
```

### Logging System

```typescript
const LOG_ENABLED = process.env.LOG_ENABLED === 'true';

export function log(...args: any[]) {
    if (LOG_ENABLED) {
        console.error(...args);
    }
}
```

- Control log output through environment variables
- Use `console.error` for log output (doesn't affect stdout communication)

### Error Handling Strategy

The project implements a multi-level error handling mechanism:

1. **Connection Error Handling**:
   - Automatically try other ports when MCP Server is unavailable
   - Return clear error messages on connection failure

2. **Request Error Handling**:
   - Catch and handle HTTP request exceptions
   - Correctly pass MCP Server error responses back to AI assistant

3. **Server-level Error Handling**:
   - Catch and log server startup exceptions

### Performance Optimization

1. **Endpoint Caching**: Cache discovered MCP Server endpoints to reduce repeated scanning
2. **Periodic Checking**: Check connection status every 10 seconds, balancing real-time and performance overhead
3. **Error Retry**: Retain previous valid endpoint on connection failure, improving reliability

## Integration Guide

This section provides detailed instructions on how to use MCP x Hub with different IDEs.

### JetBrains IDEs (IntelliJ, WebStorm, PyCharm, etc.)

#### Setup

1. Install the MCP plugin in your JetBrains IDE:
   - Go to Settings/Preferences > Plugins
   - Search for "Model Context Protocol" or "MCP"
   - Install the plugin and restart the IDE

2. Start MCP x Hub:
   ```bash
   # Using the bundled version
   node dist/bundle.js
   
   # Or with explicit settings
   LOG_ENABLED=true IDE_TYPE=jetbrains node dist/bundle.js
   ```

#### Configuration Tips

- JetBrains IDEs typically use port 63342 for built-in web server
- If your IDE is configured to use a different port, specify it with:
  ```bash
  MCP_SERVER_PORT=<custom_port> node dist/bundle.js
  ```
- If running IDE on a different machine, specify the server address:
  ```bash
  MCP_SERVER=<server_ip> node dist/bundle.js
  ```

#### Troubleshooting

- If connection fails, check in JetBrains IDE:
  - Settings > Build, Execution, Deployment > Debugger > Built-in Server
  - Verify that "Can accept external connections" is enabled
  - Note the port number and use it as MCP_SERVER_PORT if needed

### VS Code

#### Setup

1. Install the MCP extension in VS Code:
   - Open the Extensions view (Ctrl+Shift+X)
   - Search for "Model Context Protocol" or "MCP"
   - Install the extension and reload VS Code

2. Start MCP x Hub:
   ```bash
   # Using the bundled version with VS Code settings
   IDE_TYPE=vscode node dist/bundle.js
   
   # Or with explicit settings
   LOG_ENABLED=true IDE_TYPE=vscode node dist/bundle.js
   ```

#### Configuration Tips

- VS Code MCP extension typically uses ports in the 9960-9990 range
- If your extension is configured to use a specific port, specify it with:
  ```bash
  MCP_SERVER_PORT=<custom_port> node dist/bundle.js
  ```
- If running VS Code on a different machine, specify the server address:
  ```bash
  MCP_SERVER=<server_ip> node dist/bundle.js
  ```

### Connection Verification

To verify that MCP x Hub is successfully connected to your IDE:

1. Enable logging:
   ```bash
   LOG_ENABLED=true node dist/bundle.js
   ```

2. Look for logs indicating successful connection:
   ```
   Found working endpoint at http://127.0.0.1:<port>/api
   Successfully fetched tools: [...]
   ```

3. If using with Claude or another AI assistant, test a simple tool call to verify end-to-end functionality

### Common Issues

#### Port Conflicts

If you're experiencing port conflicts:

1. Check which processes are using the required ports:
   ```bash
   # On Linux/Mac
   lsof -i:<port>
   
   # On Windows
   netstat -ano | findstr "<port>"
   ```

2. Either close the conflicting process or use a different port with MCP_SERVER_PORT

#### Firewall Issues

If you suspect firewall issues:

1. Ensure localhost/127.0.0.1 traffic is allowed
2. Temporarily disable firewall to test connection
3. Add specific exception for the required ports

#### IDE Not Responding

If your IDE is running but MCP x Hub can't connect:

1. Restart your IDE
2. Verify the MCP plugin/extension is enabled
3. Check IDE logs for any errors related to the MCP plugin/extension