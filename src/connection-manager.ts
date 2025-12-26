
/**
 * connection-manager.ts
 * 
 * Manages the connection state and discovery logic for IDE endpoints.
 * Replaces the functional approach in discovery.ts with a class-based approach.
 */

import { MCP_SERVER, PORT_RANGES, IDE_TYPE, MCP_SERVER_PORT } from './config.js';
import { debug, error, log, success, warn } from './logger.js';
import { isValidIDEType } from './utils.js';

export class ConnectionManager {
    private cachedEndpoint: string | null = null;
    private previousResponse: string | null = null;
    private retryCount: number = 0;
    private maxRetryCount: number = 30;
    private hasEverConnected: boolean = false;
    private notificationCallback: (() => void) | null = null;

    constructor() { }

    public setNotificationCallback(callback: () => void) {
        debug("Setting notification callback");
        this.notificationCallback = callback;
    }

    private sendToolsChanged() {
        try {
            log("Detected tool list change, sending notification");
            if (this.notificationCallback) {
                this.notificationCallback();
                debug("Notification callback executed successfully");
            } else {
                warn("No notification callback set - tool list change notification not sent");
            }
        } catch (err) {
            error("Error sending tools changed notification:", err);
        }
    }

    public getCachedEndpoint(): string | null {
        return this.cachedEndpoint;
    }

    public async testListTools(endpoint: string): Promise<boolean> {
        debug(`Testing endpoint ${endpoint} for availability`);

        // Timeout for quick failure detection - critical for hub responsiveness
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "tools/list",
                    id: "discovery-check"
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                return false;
            }

            const currentResponse = await res.text();

            if (this.previousResponse !== null && this.previousResponse !== currentResponse) {
                log("Tool list response has changed since the last check");
                this.sendToolsChanged();
            }
            this.previousResponse = currentResponse;

            this.retryCount = 0;
            if (!this.hasEverConnected) {
                success(`First successful connection to ${endpoint}`);
            }
            this.hasEverConnected = true;

            return true;
        } catch {
            clearTimeout(timeoutId);
            return false;
        }
    }

    private discoveryPromise: Promise<string> | null = null;

    public async findWorkingIDEEndpoint(): Promise<string> {
        // If a discovery is already in progress, return that promise directly (deduplication)
        if (this.discoveryPromise) {
            log("Discovery already in progress, joining existing request...");
            return this.discoveryPromise;
        }

        // Create a new discovery promise and cache it
        this.discoveryPromise = (async () => {
            try {
                return await this._performDiscovery();
            } finally {
                // Always clear the lock when done (success or fail)
                this.discoveryPromise = null;
            }
        })();

        return this.discoveryPromise;
    }

    private async _performDiscovery(): Promise<string> {
        log(`Attempting to find a working ${IDE_TYPE ? IDE_TYPE.toUpperCase() : 'IDE'} endpoint... (Attempt ${this.retryCount + 1}/${this.maxRetryCount})`);

        // 1. Check explicit port
        if (MCP_SERVER_PORT) {
            const testEndpoint = `http://${MCP_SERVER}:${MCP_SERVER_PORT}`;
            if (await this.testListTools(testEndpoint)) {
                return testEndpoint;
            }
        }

        // 2. Check cached (optimization: fast check before scan)
        if (this.cachedEndpoint != null && await this.testListTools(this.cachedEndpoint)) {
            debug('Using cached endpoint, it\'s still working');
            return this.cachedEndpoint;
        }

        // 3. Scan ports
        let portRange;
        if (!isValidIDEType(IDE_TYPE)) {
            portRange = PORT_RANGES.jetbrains;
        } else {
            portRange = PORT_RANGES[IDE_TYPE];
        }

        const checkPromises = [];
        for (let port = portRange.start; port <= portRange.end; port++) {
            const candidateEndpoint = `http://${MCP_SERVER}:${port}`;
            checkPromises.push((async () => {
                if (await this.testListTools(candidateEndpoint)) return candidateEndpoint;
                throw new Error();
            })());
        }

        try {
            const workingEndpoint = await Promise.any(checkPromises);
            success(`Found working endpoint at ${workingEndpoint}`);
            this.cachedEndpoint = workingEndpoint;
            this.retryCount = 0; // Reset retry count on success
            return workingEndpoint;
        } catch {
            // Failed scan
        }

        this.retryCount++;

        if (this.retryCount >= this.maxRetryCount) {
            this.retryCount = 0; // Reset to avoid permanent failure state
            error(`Reached maximum retry count.`);
            throw new Error(`No working endpoint found.`);
        } else if (this.hasEverConnected) {
            // If we lost connection, we don't increment retry count drastically, 
            // but we do want to signal the caller to wait/retry.
            // We return a rejected promise so caller knows discovery failed this time.
            warn(`Connection lost. Waiting for reconnection...`);
        }

        throw new Error(`Waiting for IDE to start...`);
    }

    public async updateIDEEndpoint() {
        try {
            this.cachedEndpoint = await this.findWorkingIDEEndpoint();
        } catch {
            // Error logged in findWorking
        }
    }
}
