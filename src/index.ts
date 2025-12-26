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
import { ConnectionManager } from './connection-manager.js';
import { debug, error, log, success, warn } from './logger.js';
import { getServer } from './server.js';
import { fetchToolsList, handleToolCall } from './tools.js';

const server = getServer();
const connectionManager = new ConnectionManager();

function sendToolsChanged() {
    try {
        log("Sending tools changed notification to client");
        server.notification({ method: "notifications/tools/list_changed" });
        success("Tools changed notification sent successfully");
    } catch (err) {
        error("Error sending tools changed notification:", err);
    }
}

connectionManager.setNotificationCallback(sendToolsChanged);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    log("Handling list tools request from client");
    const endpoint = connectionManager.getCachedEndpoint();

    if (!endpoint) {
        debug("No cached endpoint available, attempting to update endpoint");
        await connectionManager.updateIDEEndpoint();
        const newEndpoint = connectionManager.getCachedEndpoint();

        if (!newEndpoint) {
            const waitMsg = `Waiting for IDE to start...`;
            warn(waitMsg);
            throw new Error(waitMsg);
        }
        // Use the newly found endpoint immediately
        return await fetchToolsList(newEndpoint);
    }

    try {
        debug(`Forwarding list tools request to cached endpoint: ${endpoint}`);
        const result = await fetchToolsList(endpoint);
        success("Successfully handled list tools request");
        return result;
    } catch (err) {
        error("Error handling list tools request:", err);
        setTimeout(() => connectionManager.updateIDEEndpoint(), 100);
        throw err;
    }
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    log(`Handling tool call request for tool: ${request.params.name}`);
    debug(`Tool call request details: ${JSON.stringify(request)}`);

    let endpoint = connectionManager.getCachedEndpoint();

    if (!endpoint) {
        warn("No cached endpoint available, attempting to update endpoint");
        await connectionManager.updateIDEEndpoint();
        endpoint = connectionManager.getCachedEndpoint();

        if (!endpoint) {
            error("Cannot handle tool call - no IDE connection available");
            throw new Error(`Not connected to IDE. Please ensure IDE is running with MCP plugin installed.`);
        }
    }

    try {
        debug(`Forwarding tool call to endpoint: ${endpoint}`);
        const result = await handleToolCall(
            request.params.name,
            request.params.arguments ?? {},
            endpoint
        );
        success(`Tool call '${request.params.name}' handled successfully`);
        return result;
    } catch (err) {
        error(`Error handling tool call '${request.params.name}':`, err);
        setTimeout(() => connectionManager.updateIDEEndpoint(), 100);
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

    // Adaptive polling: fast when disconnected, slow when stable
    const scheduleNextCheck = () => {
        const isConnected = connectionManager.getCachedEndpoint() !== null;
        // 5s when disconnected (quick reconnection), 30s when stable (reduce overhead)
        const interval = isConnected ? 30_000 : 5_000;

        setTimeout(async () => {
            await connectionManager.updateIDEEndpoint();
            scheduleNextCheck();
        }, interval);
    };

    scheduleNextCheck();
    log("Scheduled adaptive endpoint check (5s disconnected / 30s connected)");

    success(`Local MCP x Hub running and ready for connections`);
}

debug("Performing initial IDE endpoint discovery");
await connectionManager.updateIDEEndpoint();

runServer().catch(err => {
    error(`Server failed to start:`, err);
});