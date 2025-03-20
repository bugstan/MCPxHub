/**
 * discovery.ts
 * 
 * IDE Endpoint Discovery Module for MCP x Hub
 * 
 * This module is responsible for discovering and maintaining connections to IDE endpoints,
 * testing endpoint connectivity, managing connection retries, and notifying clients of tool list changes.
 */

import { MCP_SERVER, IDE_TYPE, MCP_SERVER_PORT, PORT_RANGES } from './config.js';
import { debug, error, log, success, warn } from './logger.js';
import { isValidIDEType } from './utils.js';

export let cachedEndpoint: string | null = null;

export let previousResponse: string | null = null;

let retryCount = 0;

const MAX_RETRY_COUNT = 30;

let hasEverConnected = false;

type NotificationCallback = () => void;

let notificationCallback: NotificationCallback | null = null;

export function setNotificationCallback(callback: NotificationCallback) {
    debug("Setting notification callback");
    notificationCallback = callback;
}

function sendToolsChanged() {
    try {
        log("Detected tool list change, sending notification");
        if (notificationCallback) {
            notificationCallback();
            debug("Notification callback executed successfully");
        } else {
            warn("No notification callback set - tool list change notification not sent");
        }
    } catch (err) {
        error("Error sending tools changed notification:", err);
    }
}

export async function testListTools(endpoint: string): Promise<boolean> {
    debug(`Testing endpoint ${endpoint} for availability`);
    try {
        log(`Sending test request to ${endpoint}/mcp/list_tools`);
        const res = await fetch(`${endpoint}/mcp/list_tools`);
        
        if (!res.ok) {
            warn(`Test request to ${endpoint}/mcp/list_tools failed with status ${res.status}`);
            return false;
        }

        const currentResponse = await res.text();
        debug(`Received response from ${endpoint}/mcp/list_tools: ${currentResponse.substring(0, 100)}...`);

        if (previousResponse !== null && previousResponse !== currentResponse) {
            log("Tool list response has changed since the last check");
            sendToolsChanged();
        }
        previousResponse = currentResponse;

        retryCount = 0;
        if (!hasEverConnected) {
            success(`First successful connection to ${endpoint}`);
        }
        hasEverConnected = true;

        return true;
    } catch (err) {
        error(`Error during testListTools for endpoint ${endpoint}:`, err);
        return false;
    }
}

export async function findWorkingIDEEndpoint(): Promise<string> {
    log(`Attempting to find a working ${IDE_TYPE ? IDE_TYPE.toUpperCase() : 'IDE'} endpoint... (Attempt ${retryCount + 1}/${MAX_RETRY_COUNT})`);

    if (MCP_SERVER_PORT) {
        log(`MCP_SERVER_PORT is set to ${MCP_SERVER_PORT}. Testing this port first.`);
        const testEndpoint = `http://${MCP_SERVER}:${MCP_SERVER_PORT}/api`;
        if (await testListTools(testEndpoint)) {
            success(`MCP_SERVER_PORT ${MCP_SERVER_PORT} is working - using endpoint ${testEndpoint}`);
            return testEndpoint;
        } else {
            warn(`Specified MCP_SERVER_PORT=${MCP_SERVER_PORT} is not responding correctly. Will retry later.`);
        }
    }

    if (cachedEndpoint != null && await testListTools(cachedEndpoint)) {
        debug('Using cached endpoint, it\'s still working');
        return cachedEndpoint;
    }

    let portRange;
    
    if (!isValidIDEType(IDE_TYPE)) {
        warn(`Invalid or missing IDE_TYPE: ${IDE_TYPE}. Will try JetBrains IDE ports as default.`);
        portRange = PORT_RANGES.jetbrains;
    } else {
        portRange = PORT_RANGES[IDE_TYPE];
    }
    
    log(`Scanning port range: ${portRange.start}-${portRange.end}`);

    for (let port = portRange.start; port <= portRange.end; port++) {
        const candidateEndpoint = `http://${MCP_SERVER}:${port}/api`;
        debug(`Testing port ${port}...`);
        const isWorking = await testListTools(candidateEndpoint);
        if (isWorking) {
            success(`Found working endpoint at ${candidateEndpoint}`);
            return candidateEndpoint;
        } else {
            debug(`Port ${port} is not responding correctly.`);
        }
    }

    retryCount++;

    if (retryCount >= MAX_RETRY_COUNT) {
        error(`Reached maximum retry count (${MAX_RETRY_COUNT}). No working endpoint found.`);
        throw new Error(`No working endpoint found after ${MAX_RETRY_COUNT} attempts. Please ensure your IDE is running with the MCP plugin installed.`);
    } else if (hasEverConnected) {
        warn(`Connection lost. Previously connected but now not responding. Will retry.`);
        throw new Error(`Connection lost. Waiting for reconnection...`);
    } else {
        warn(`No working endpoint found in range ${portRange.start}-${portRange.end}. Will retry in 10 seconds.`);
        throw new Error(`Waiting for IDE to start (Attempt ${retryCount}/${MAX_RETRY_COUNT})...`);
    }
}

export async function updateIDEEndpoint() {
    debug("Updating IDE endpoint cache");
    try {
        cachedEndpoint = await findWorkingIDEEndpoint();
        log(`Updated cachedEndpoint to: ${cachedEndpoint}`);
    } catch (err) {
        warn("Failed to update IDE endpoint:", err);
    }
}