/**
 * server.ts
 * 
 * MCP Server Implementation Module for MCP x Hub
 * 
 * This module handles the MCP server instance creation and request handler setup.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { IDE_TYPE } from './config.js';
import { debug, error, log } from './logger.js';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs';

// 获取版本号的安全函数
function getPackageVersion(): string {
    try {
        // 尝试从多个可能的位置读取 package.json
        const possiblePaths = [
            join(process.cwd(), 'package.json'),                 // 当前工作目录
            join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json'), // 基于当前文件位置
            join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'),       // 上一级目录
            join(dirname(process.execPath), 'package.json')      // 执行路径
        ];
        
        for (const path of possiblePaths) {
            if (fs.existsSync(path)) {
                const packageJson = JSON.parse(fs.readFileSync(path, 'utf8'));
                debug(`Found package.json at: ${path}`);
                return packageJson.version || '1.0.5';
            }
        }
        
        // 找不到 package.json 时使用默认版本
        debug('Could not find package.json, using default version: 1.0.5');
        return '1.0.5';  // 发生错误时的默认版本
    } catch (err) {
        error('Error reading package version:', err);
        return '1.0.5';  // 发生错误时的默认版本
    }
}

let server: Server | null = null;

export function getServer(): Server {
    if (!server) {
        debug("Creating new MCP server instance");
        const packageVersion = getPackageVersion();
        debug(`Using package version: ${packageVersion}`);
        server = new Server(
            {
                name: `mcpxhub/${IDE_TYPE || 'ide'}`,
                version: packageVersion,
            },
            {
                capabilities: {
                    tools: {
                        listChanged: true,
                    },
                    resources: {},
                },
            },
        );
        log(`Created MCP server with name: mcpxhub/${IDE_TYPE || 'ide'}`);
    } else {
        debug("Returning existing MCP server instance");
    }
    
    return server;
}

export function setupRequestHandlers(
    handleToolListRequest: () => Promise<{tools: any}>,
    handleToolCallRequest: (request: any) => Promise<any>
) {
    const serverInstance = getServer();
    
    debug("Setting up request handlers for MCP server");
    
    serverInstance.setRequestHandler(ListToolsRequestSchema, handleToolListRequest);
    log("Registered handler for ListToolsRequestSchema");
    
    serverInstance.setRequestHandler(CallToolRequestSchema, handleToolCallRequest);
    log("Registered handler for CallToolRequestSchema");
}