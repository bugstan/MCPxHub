#!/bin/bash
# Test run script for MCP x Hub
# Usage: ./test.sh [ide_type] [mcp_server_port] [mcp_server]
# Example: ./test.sh jetbrains 63342 127.0.0.1

# Print banner
echo "=================================================="
echo "MCP x Hub Test Runner"
echo "=================================================="

# Set environment variables
export LOG_ENABLED=true
echo "✓ Logging enabled"

# If command line argument provided, set IDE_TYPE
if [ ! -z "$1" ]; then
  export IDE_TYPE=$1
  echo "✓ Using specified IDE_TYPE: $IDE_TYPE"
else
  echo "✓ Using default IDE_TYPE: jetbrains"
fi

# If second argument provided, set MCP_SERVER_PORT
if [ ! -z "$2" ]; then
  export MCP_SERVER_PORT=$2
  echo "✓ Using specified MCP_SERVER_PORT: $MCP_SERVER_PORT"
else
  echo "- No MCP_SERVER_PORT specified, will scan port ranges"
fi

# If third argument provided, set MCP_SERVER
if [ ! -z "$3" ]; then
  export MCP_SERVER=$3
  echo "✓ Using specified MCP_SERVER: $MCP_SERVER"
else
  echo "✓ Using default MCP_SERVER: 127.0.0.1"
fi

echo "--------------------------------------------------"
echo "Starting MCP x Hub..."
echo "Press Ctrl+C to exit"
echo "--------------------------------------------------"

# Run bundled application
node dist/bundle.js