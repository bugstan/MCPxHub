/**
 * types.ts
 * 
 * Type Definitions Module for MCP x Hub
 * 
 * This module centralizes all TypeScript type definitions used throughout the application.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

export type IDEType = 'vscode' | 'jetbrains';

export interface PortRange {
    start: number;
    end: number;
}

export interface JsonRpcRequest {
    jsonrpc: '2.0';
    id?: string | number | null;
    method: string;
    params?: Record<string, unknown>;
}

export interface ToolsListResult {
    tools: Tool[];
}

export interface JsonRpcResponse<T = unknown> {
    jsonrpc: '2.0';
    id: string | number | null;
    result?: T;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
}