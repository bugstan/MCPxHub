#!/usr/bin/env node
/**
 * index.ts
 * 
 * Main Entry Point for MCP x Hub
 * 
 * This module serves as the application entry point and orchestrates the main functionality.
 * It provides server initialization and startup, request handlers registration,
 * connection management, and periodic endpoint checking.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { IDE_TYPE } from './config.js';
import { cachedEndpoint, setNotificationCallback, updateIDEEndpoint } from './discovery.js';
import { debug, error, log, success, warn } from './logger.js';
import { getServer } from './server.js';
import { fetchToolsList, handleToolCall } from './tools.js';

const server = getServer();

function sendToolsChanged() {
    try {
        log("Sending tools changed notification to client");
        server.notification({method: "notifications/tools/list_changed"});
        success("Tools changed notification sent successfully");
    } catch (err) {
        error("Error sending tools changed notification:", err);
    }
}

setNotificationCallback(sendToolsChanged);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    log("Handling list tools request from client");
    if (!cachedEndpoint) {
        debug("No cached endpoint available, attempting to update endpoint");
        await updateIDEEndpoint();
        
        if (!cachedEndpoint) {
            const waitMsg = `Waiting for IDE to start...`;
            warn(waitMsg);
            throw new Error(waitMsg);
        }
    }
    
    try {
        debug(`Forwarding list tools request to cached endpoint: ${cachedEndpoint}`);
        const result = await fetchToolsList(cachedEndpoint);
        success("Successfully handled list tools request");
        return result;
    } catch (err) {
        error("Error handling list tools request:", err);
        setTimeout(updateIDEEndpoint, 100);
        throw err;
    }
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    log(`Handling tool call request for tool: ${request.params.name}`);
    debug(`Tool call request details: ${JSON.stringify(request)}`);
    
    if (!cachedEndpoint) {
        warn("No cached endpoint available, attempting to update endpoint");
        await updateIDEEndpoint();
        
        if (!cachedEndpoint) {
            error("Cannot handle tool call - no IDE connection available");
            throw new Error(`Not connected to IDE. Please ensure IDE is running with MCP plugin installed.`);
        }
    }
    
    try {
        debug(`Forwarding tool call to endpoint: ${cachedEndpoint}`);
        const result = await handleToolCall(
            request.params.name, 
            request.params.arguments ?? {}, 
            cachedEndpoint
        );
        success(`Tool call '${request.params.name}' handled successfully`);
        return result;
    } catch (err) {
        error(`Error handling tool call '${request.params.name}':`, err);
        setTimeout(updateIDEEndpoint, 100);
        throw err;
    }
});

async function runServer() {
    log(`Initializing Local MCP x Hub for ${IDE_TYPE ? IDE_TYPE.toUpperCase() : 'IDE'}...`);
    
    console.error(`
===================================================
MCP x Hub Started
---------------------------------------------------
IDE Type: ${IDE_TYPE ? IDE_TYPE.toUpperCase() : 'Not specified (using JetBrains as default)'}
Searching for available IDE instances...
===================================================
`);

    const transport = new StdioServerTransport();
    try {
        debug("Connecting server to stdio transport");
        await server.connect(transport);
        success("Server successfully connected to transport");
    } catch (err) {
        error("Error connecting server to transport:", err);
        throw err;
    }

    setInterval(updateIDEEndpoint, 10_000);
    log("Scheduled endpoint check every 10 seconds");

    success(`Local MCP x Hub running and ready for connections`);
}

debug("Performing initial IDE endpoint discovery");
await updateIDEEndpoint();

runServer().catch(err => {
    error(`Server failed to start:`, err);
});