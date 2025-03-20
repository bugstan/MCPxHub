@echo off
REM Test run script for MCP x Hub
REM Usage: test.bat [ide_type] [mcp_server_port] [mcp_server]
REM Example: test.bat jetbrains 63342 127.0.0.1

REM Print banner
echo ==================================================
echo MCP x Hub Test Runner
echo ==================================================

REM Set environment variables
set LOG_ENABLED=true
echo ✓ Logging enabled

REM If command line argument provided, set IDE_TYPE
if not "%~1"=="" (
  set IDE_TYPE=%~1
  echo ✓ Using specified IDE_TYPE: %IDE_TYPE%
) else (
  echo ✓ Using default IDE_TYPE: jetbrains
)

REM If second argument provided, set MCP_SERVER_PORT
if not "%~2"=="" (
  set MCP_SERVER_PORT=%~2
  echo ✓ Using specified MCP_SERVER_PORT: %MCP_SERVER_PORT%
) else (
  echo - No MCP_SERVER_PORT specified, will scan port ranges
)

REM If third argument provided, set MCP_SERVER
if not "%~3"=="" (
  set MCP_SERVER=%~3
  echo ✓ Using specified MCP_SERVER: %MCP_SERVER%
) else (
  echo ✓ Using default MCP_SERVER: 127.0.0.1
)

echo --------------------------------------------------
echo Starting MCP x Hub...
echo Press Ctrl+C to exit
echo --------------------------------------------------

REM Run bundled application
node dist/bundle.js