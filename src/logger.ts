/**
 * logger.ts
 * 
 * Logging system for MCP x Hub
 * 
 * This module provides logging capabilities for the application with different
 * log levels (INFO, WARN, ERROR, DEBUG) and timestamp support.
 */

import { LOG_ENABLED } from './config.js';


function getTimestamp(): string {
    const now = new Date();
    return now.toISOString();
}

function formatMessage(level: string, message: string, ...args: unknown[]) {
    const timestamp = getTimestamp();
    const formattedArgs = args.length > 0 ? args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ') : '';

    // In production (stdio transport), we must write logs to stderr to avoid interfering with JSON-RPC on stdout
    const logOutput = `[${timestamp}] [${level}] ${message} ${formattedArgs}`.trim();
    console.error(logOutput);
}

export function log(message: string, ...args: unknown[]) {
    if (LOG_ENABLED) {
        formatMessage('INFO', message, ...args);
    }
}

export function error(message: string, ...args: unknown[]) {
    // Errors are always logged
    formatMessage('ERROR', message, ...args);
}

export function debug(message: string, ...args: unknown[]) {
    if (LOG_ENABLED) {
        formatMessage('DEBUG', message, ...args);
    }
}

export function success(message: string, ...args: unknown[]) {
    if (LOG_ENABLED) {
        formatMessage('SUCCESS', message, ...args);
    }
}

export function warn(message: string, ...args: unknown[]) {
    formatMessage('WARN', message, ...args);
}