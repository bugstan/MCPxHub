
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to test config with different env values, so we'll mock process.env

describe('Config Module', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('LOG_ENABLED', () => {
        it('should be true when LOG_ENABLED env is "true"', async () => {
            process.env.LOG_ENABLED = 'true';
            const { LOG_ENABLED } = await import('../src/config.js');
            expect(LOG_ENABLED).toBe(true);
        });

        it('should be false when LOG_ENABLED env is not "true"', async () => {
            process.env.LOG_ENABLED = 'false';
            const { LOG_ENABLED } = await import('../src/config.js');
            expect(LOG_ENABLED).toBe(false);
        });

        it('should be false when LOG_ENABLED env is undefined', async () => {
            delete process.env.LOG_ENABLED;
            const { LOG_ENABLED } = await import('../src/config.js');
            expect(LOG_ENABLED).toBe(false);
        });
    });

    describe('MCP_SERVER', () => {
        it('should use env value when set', async () => {
            process.env.MCP_SERVER = '192.168.1.1';
            const { MCP_SERVER } = await import('../src/config.js');
            expect(MCP_SERVER).toBe('192.168.1.1');
        });

        it('should default to 127.0.0.1 when not set', async () => {
            delete process.env.MCP_SERVER;
            const { MCP_SERVER } = await import('../src/config.js');
            expect(MCP_SERVER).toBe('127.0.0.1');
        });
    });

    describe('IDE_TYPE', () => {
        it('should use env value (lowercased)', async () => {
            process.env.IDE_TYPE = 'VSCODE';
            const { IDE_TYPE } = await import('../src/config.js');
            expect(IDE_TYPE).toBe('vscode');
        });

        it('should default to jetbrains when not set', async () => {
            delete process.env.IDE_TYPE;
            const { IDE_TYPE } = await import('../src/config.js');
            expect(IDE_TYPE).toBe('jetbrains');
        });
    });

    describe('MCP_SERVER_PORT', () => {
        it('should use env value when set', async () => {
            process.env.MCP_SERVER_PORT = '9999';
            const { MCP_SERVER_PORT } = await import('../src/config.js');
            expect(MCP_SERVER_PORT).toBe('9999');
        });

        it('should be undefined when not set', async () => {
            delete process.env.MCP_SERVER_PORT;
            const { MCP_SERVER_PORT } = await import('../src/config.js');
            expect(MCP_SERVER_PORT).toBeUndefined();
        });
    });

    describe('PORT_RANGES', () => {
        it('should have correct port ranges for jetbrains', async () => {
            const { PORT_RANGES } = await import('../src/config.js');
            expect(PORT_RANGES.jetbrains).toEqual({ start: 63342, end: 63352 });
        });

        it('should have correct port ranges for vscode', async () => {
            const { PORT_RANGES } = await import('../src/config.js');
            expect(PORT_RANGES.vscode).toEqual({ start: 9960, end: 9990 });
        });
    });
});
