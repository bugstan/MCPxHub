/**
 * tools.ts
 * 
 * Tool Call Handling Module for MCP x Hub
 * 
 * This module is responsible for handling tool calls between the MCP client and IDE,
 * forwarding requests, processing responses, and error handling.
 */

import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { IDE_TYPE } from './config.js';
import { debug, error, log, success, warn } from './logger.js';
import { JsonRpcResponse, ToolsListResult } from './types.js';

export async function handleToolCall(name: string, args: Record<string, unknown>, endpoint: string): Promise<CallToolResult> {
    log(`====== TOOL CALL START: ${name} ======`);
    debug(`Tool name: ${name}`);
    debug(`IDE type: ${IDE_TYPE}`);
    debug(`Endpoint: ${endpoint}`);
    debug(`Request arguments: ${JSON.stringify(args, null, 2)}`);

    try {
        debug(`Sending JSON-RPC request...`);

        // 30s timeout for tool calls - operations may take time but shouldn't hang indefinitely
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "tools/call",
                params: {
                    name,
                    arguments: args
                },
                id: `call-${Date.now()}`
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        debug(`Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            error(`Response failed with status ${response.status} for tool ${name}`);
            throw new Error(`Response failed: ${response.status}`);
        }

        const rawResponseText = await response.text();
        debug(`Raw response: ${rawResponseText.substring(0, 500)}...`);

        let parsedResponse: JsonRpcResponse;
        try {
            parsedResponse = JSON.parse(rawResponseText);
        } catch (jsonError) {
            error(`Failed to parse response as JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
            throw new Error("Invalid JSON response from IDE");
        }

        if (parsedResponse.error) {
            warn(`Tool call resulted in error: ${parsedResponse.error.message}`);
            return {
                content: [{
                    type: "text",
                    text: `Error: ${parsedResponse.error.message}`
                }],
                isError: true,
            };
        }

        // Success case - result should be a CallToolResult
        const result = parsedResponse.result as CallToolResult;

        if (!result) {
            warn("Response had no result field");
            return {
                content: [],
                isError: true
            };
        }

        success(`Tool call completed successfully`);
        log(`====== TOOL CALL END: ${name} ======`);

        return result;
    } catch (err) {
        error(`====== TOOL CALL ERROR: ${name} ======`);
        error(`Error in handleToolCall: ${err}`);
        if (err instanceof Error) {
            error(`Error message: ${err.message}`);
            error(`Error stack: ${err.stack}`);
        }

        return {
            content: [{
                type: "text",
                text: err instanceof Error ? err.message : "Unknown error",
            }],
            isError: true,
        };
    }
}

export async function fetchToolsList(endpoint: string): Promise<{ tools: Tool[] }> {
    log(`====== FETCHING TOOLS LIST ======`);
    debug(`Using endpoint ${endpoint} to list tools`);

    try {
        debug(`Sending JSON-RPC request to ${endpoint}`);

        // 10s timeout for listing tools - should be quick operation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const toolsResponse = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "tools/list",
                id: `list-${Date.now()}`
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        debug(`Response status: ${toolsResponse.status} ${toolsResponse.statusText}`);

        if (!toolsResponse.ok) {
            error(`Failed to fetch tools with status ${toolsResponse.status}`);
            throw new Error("Unable to list tools");
        }

        const rawResponse = await toolsResponse.text();
        debug(`Raw tools list response: ${rawResponse.substring(0, 500)}${rawResponse.length > 500 ? '...' : ''}`);

        let parsedResponse: JsonRpcResponse<ToolsListResult>;
        try {
            parsedResponse = JSON.parse(rawResponse);
            success(`Successfully parsed tools list JSON`);
        } catch (jsonError) {
            error(`Failed to parse tools list as JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
            throw new Error(`Invalid tools list response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
        }

        if (parsedResponse.error) {
            throw new Error(`IDE returned error: ${parsedResponse.error.message}`);
        }

        const tools = parsedResponse.result?.tools;

        if (!Array.isArray(tools)) {
            error("Response result.tools is not an array");
            throw new Error("Invalid format: tools list is missing or invalid");
        }

        success(`Found ${tools.length} tools`);
        debug(`Tools details: ${JSON.stringify(tools, null, 2)}`);

        log(`====== TOOLS LIST FETCHED ======`);
        return { tools };
    } catch (err) {
        error(`====== TOOLS LIST ERROR ======`);
        error(`Error fetching tools list: ${err}`);
        if (err instanceof Error) {
            error(`Error message: ${err.message}`);
            error(`Error stack: ${err.stack}`);
        }
        throw err;
    }
}