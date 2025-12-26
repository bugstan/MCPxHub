
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as serverModule from '../src/server.js';

// Mock logger
vi.mock('../src/logger.js', () => ({
    debug: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    success: vi.fn(),
    warn: vi.fn()
}));

// Mock Config
vi.mock('../src/config.js', () => ({
    IDE_TYPE: 'vscode'
}));

// Correctly Mock MCP SDK Server Class
const mockSetRequestHandler = vi.fn();
const mockNotification = vi.fn();

vi.mock('@modelcontextprotocol/sdk/server/index.js', () => {
    return {
        // The Mock should be a constructor function
        Server: vi.fn().mockImplementation(function (this: Record<string, unknown>, info: unknown) {
            this.info = info;
            this.setRequestHandler = mockSetRequestHandler;
            this.notification = mockNotification;
            this.connect = vi.fn();
        })
    };
});

describe('Server Module', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset the singleton before each test
        serverModule.resetServerInstance();
    });

    describe('getServer', () => {
        it('should return a server instance', () => {
            const server = serverModule.getServer();
            expect(server).toBeDefined();
            // Since we mocked via implementation, the instance returned should have our properties
            expect((server as unknown as Record<string, unknown>).notification).toBeDefined();
        });

        it('should return the same instance on multiple calls', () => {
            const server1 = serverModule.getServer();
            const server2 = serverModule.getServer();
            expect(server1).toBe(server2);
            // The constructor mock should have been called only once
            // But we need access to the mock class constructor to check calls.
            // verifying identity is enough for singleton test.
        });
    });
});
