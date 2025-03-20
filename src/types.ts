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

export interface IDEResponseOk {
    status: string;
    error: null;
}

export interface IDEResponseErr {
    status: null;
    error: string;
}

export type IDEResponse = IDEResponseOk | IDEResponseErr;