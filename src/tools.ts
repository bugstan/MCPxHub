/**
 * tools.ts
 * 
 * Tool Call Handling Module for MCP x Hub
 * 
 * This module is responsible for handling tool calls between the MCP client and IDE,
 * forwarding requests, processing responses, and error handling.
 */

import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { IDE_TYPE } from './config.js';
import { debug, error, log, success, warn } from './logger.js';
import { IDEResponse } from './types.js';

export async function handleToolCall(name: string, args: any, endpoint: string): Promise<CallToolResult> {
    log(`====== TOOL CALL START: ${name} ======`);
    debug(`Tool name: ${name}`);
    debug(`IDE type: ${IDE_TYPE}`);
    debug(`Endpoint: ${endpoint}`);
    debug(`Request arguments: ${JSON.stringify(args, null, 2)}`);
    
    try {
        const requestUrl = `${endpoint}/mcp/${name}`;
        debug(`Request URL: ${requestUrl}`);
        
        const requestBody = JSON.stringify(args);
        debug(`Request body: ${requestBody}`);
        
        debug(`Sending request...`);
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBody,
        });

        debug(`Response status: ${response.status} ${response.statusText}`);
        debug(`Response headers: ${JSON.stringify(Object.fromEntries([...response.headers]))}`);

        if (!response.ok) {
            error(`Response failed with status ${response.status} for tool ${name}`);
            throw new Error(`Response failed: ${response.status}`);
        }

        const rawResponseText = await response.text();
        debug(`Raw response: ${rawResponseText}`);
        
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(rawResponseText);
            debug(`Parsed response: ${JSON.stringify(parsedResponse, null, 2)}`);
        } catch (jsonError) {
            error(`Failed to parse response as JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
            parsedResponse = { status: rawResponseText, error: null };
            debug(`Using raw text as status: ${rawResponseText}`);
        }

        const {status, error: responseError} = parsedResponse as IDEResponse;
        
        const isError = !!responseError;
        const text = status ?? responseError ?? "";
        
        if (isError) {
            warn(`Tool call resulted in error: ${responseError}`);
        } else {
            success(`Tool call completed successfully`);
            debug(`Response text: ${typeof text === 'string' ? text.substring(0, 200) : JSON.stringify(text).substring(0, 200)}${text && text.length > 200 ? '...' : ''}`);
        }

        log(`====== TOOL CALL END: ${name} ======`);
        
        return {
            content: [{type: "text", text: text}],
            isError,
        };
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

export async function fetchToolsList(endpoint: string): Promise<{tools: any}> {
    log(`====== FETCHING TOOLS LIST ======`);
    debug(`Using endpoint ${endpoint} to list tools`);
    
    try {
        debug(`Sending request to ${endpoint}/mcp/list_tools`);
        const toolsResponse = await fetch(`${endpoint}/mcp/list_tools`);
        
        debug(`Response status: ${toolsResponse.status} ${toolsResponse.statusText}`);
        
        if (!toolsResponse.ok) {
            error(`Failed to fetch tools with status ${toolsResponse.status}`);
            throw new Error("Unable to list tools");
        }
        
        const rawResponse = await toolsResponse.text();
        debug(`Raw tools list response: ${rawResponse.substring(0, 500)}${rawResponse.length > 500 ? '...' : ''}`);
        
        let tools;
        try {
            tools = JSON.parse(rawResponse);
            success(`Successfully parsed tools list JSON`);
        } catch (jsonError) {
            error(`Failed to parse tools list as JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
            throw new Error(`Invalid tools list response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
        }
        
        const toolCount = Array.isArray(tools) ? tools.length : 'unknown (not an array)';
        success(`Found ${toolCount} tools`);
        debug(`Tools details: ${JSON.stringify(tools, null, 2)}`);
        
        log(`====== TOOLS LIST FETCHED ======`);
        return {tools};
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