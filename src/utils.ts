/**
 * utils.ts
 * 
 * Utility Functions Module for MCP x Hub
 * 
 * This module provides various utility functions used throughout the application.
 */

import { IDEType } from './types.js';

export function isValidIDEType(type: string): type is IDEType {
    return type === 'vscode' || type === 'jetbrains';
}