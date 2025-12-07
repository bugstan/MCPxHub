/**
 * types.ts
 * 
 * Type Definitions Module for MCP x Hub
 * 
 * This module centralizes all TypeScript type definitions used throughout the application.
 */

export type IDEType = 'vscode' | 'jetbrains';

export interface PortRange {
    start: number;
    end: number;
}

export interface JsonRpcRequest {
    jsonrpc: '2.0';
    id?: string | number | null;
    method: string;
    params?: Record<string, any>;
}

export interface JsonRpcResponse {
    jsonrpc: '2.0';
    id: string | number | null;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}