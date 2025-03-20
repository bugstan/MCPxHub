/**
 * logger.ts
 * 
 * Logging system for MCP x Hub
 * 
 * This module provides logging capabilities for the application with different
 * log levels (INFO, WARN, ERROR, DEBUG) and timestamp support.
 */

import { LOG_ENABLED } from './config.js';

const Colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m"
};

function getTimestamp(): string {
    const now = new Date();
    return `[${now.toISOString().replace('T', ' ').replace('Z', '')}]`;
}

export function log(...args: any[]) {
    if (LOG_ENABLED) {
        const timestamp = getTimestamp();
        console.error(`${Colors.gray}${timestamp}${Colors.reset} ${Colors.blue}[INFO]${Colors.reset}`, ...args);
    }
}

export function warn(...args: any[]) {
    if (LOG_ENABLED) {
        const timestamp = getTimestamp();
        console.error(`${Colors.gray}${timestamp}${Colors.reset} ${Colors.yellow}[WARN]${Colors.reset}`, ...args);
    }
}

export function error(...args: any[]) {
    if (LOG_ENABLED) {
        const timestamp = getTimestamp();
        console.error(`${Colors.gray}${timestamp}${Colors.reset} ${Colors.red}[ERROR]${Colors.reset}`, ...args);
    }
}

export function debug(...args: any[]) {
    if (LOG_ENABLED) {
        const timestamp = getTimestamp();
        console.error(`${Colors.gray}${timestamp}${Colors.reset} ${Colors.cyan}[DEBUG]${Colors.reset}`, ...args);
    }
}

export function success(...args: any[]) {
    if (LOG_ENABLED) {
        const timestamp = getTimestamp();
        console.error(`${Colors.gray}${timestamp}${Colors.reset} ${Colors.green}[SUCCESS]${Colors.reset}`, ...args);
    }
}