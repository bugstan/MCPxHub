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
import { debug, log } from './logger.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取package.json来获取版本号
const packageJsonPath = resolve(__dirname, '../..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageVersion = packageJson.version || '1.0.0';

let server: Server | null = null;

export function getServer(): Server {
    if (!server) {
        debug("Creating new MCP server instance");
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