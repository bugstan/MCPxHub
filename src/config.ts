/**
 * config.ts
 * 
 * Configuration Management Module for MCP x Hub
 * 
 * This module centralizes all configuration settings for the application,
 * including environment variable handling, default values, and port range definitions.
 */

import { IDEType, PortRange } from './types.js';

export const LOG_ENABLED = process.env.LOG_ENABLED === 'true';

export const MCP_SERVER = process.env.MCP_SERVER ?? "127.0.0.1"

export const PORT_RANGES: Record<IDEType, PortRange> = {
    jetbrains: { start: 63342, end: 63352 },
    vscode: { start: 9960, end: 9990 }
};

export const IDE_TYPE = (process.env.IDE_TYPE || 'jetbrains').toLowerCase() as IDEType;

export const MCP_SERVER_PORT = process.env.MCP_SERVER_PORT;