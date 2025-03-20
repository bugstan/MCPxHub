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

let server: Server | null = null;

export function getServer(): Server {
    if (!server) {
        debug("Creating new MCP server instance");
        server = new Server(
            {
                name: `mcpxhub/${IDE_TYPE || 'ide'}`,
                version: "1.0.0",
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