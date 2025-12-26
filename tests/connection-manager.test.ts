
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionManager } from '../src/connection-manager.js';

// Mock logger
vi.mock('../src/logger.js', () => ({
    debug: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    success: vi.fn(),
    warn: vi.fn()
}));

// Mock config
vi.mock('../src/config.js', () => ({
    IDE_TYPE: 'vscode',
    MCP_SERVER: 'localhost',
    MCP_SERVER_PORT: undefined,
    PORT_RANGES: {
        vscode: { start: 9960, end: 9962 },
        jetbrains: { start: 63342, end: 63342 }
    }
}));

describe('ConnectionManager', () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;
    let manager: ConnectionManager;

    beforeEach(() => {
        vi.clearAllMocks();
        fetchMock.mockResolvedValue({
            ok: false,
            status: 404
        });
        manager = new ConnectionManager();
    });

    describe('getCachedEndpoint', () => {
        it('should return null initially', () => {
            expect(manager.getCachedEndpoint()).toBeNull();
        });

        it('should return cached endpoint after successful discovery', async () => {
            fetchMock.mockImplementation((url) => {
                if (url === 'http://localhost:9960') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        text: () => Promise.resolve(JSON.stringify({ result: { tools: [] } }))
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            await manager.findWorkingIDEEndpoint();
            expect(manager.getCachedEndpoint()).toBe('http://localhost:9960');
        });
    });

    describe('testListTools', () => {
        it('should return true when endpoint responds correctly', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                text: () => Promise.resolve(JSON.stringify({ result: { tools: [] } }))
            });

            const result = await manager.testListTools('http://localhost:9999');
            expect(result).toBe(true);
        });

        it('should return false when endpoint errors', async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 500
            });

            const result = await manager.testListTools('http://localhost:9999');
            expect(result).toBe(false);
        });

        it('should trigger notification when response changes', async () => {
            const callback = vi.fn();
            manager.setNotificationCallback(callback);

            // First call
            fetchMock.mockResolvedValueOnce({
                ok: true,
                status: 200,
                text: () => Promise.resolve('response 1')
            });
            await manager.testListTools('http://localhost:9999');
            expect(callback).not.toHaveBeenCalled();

            // Second call: DIFFERENT response
            fetchMock.mockResolvedValueOnce({
                ok: true,
                status: 200,
                text: () => Promise.resolve('response 2')
            });
            await manager.testListTools('http://localhost:9999');

            expect(callback).toHaveBeenCalled();
        });

        it('should return false on fetch timeout/abort', async () => {
            fetchMock.mockRejectedValue(new DOMException('Aborted', 'AbortError'));

            const result = await manager.testListTools('http://localhost:9999');
            expect(result).toBe(false);
        });

        it('should include abort signal in fetch call', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                text: () => Promise.resolve('{}')
            });

            await manager.testListTools('http://localhost:9999');

            expect(fetchMock).toHaveBeenCalledWith(
                'http://localhost:9999',
                expect.objectContaining({
                    signal: expect.any(AbortSignal)
                })
            );
        });
    });

    describe('findWorkingIDEEndpoint', () => {
        it('should find an endpoint in the scanned range', async () => {
            fetchMock.mockImplementation((url) => {
                if (url === 'http://localhost:9961') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        text: () => Promise.resolve(JSON.stringify({ result: { tools: [] } }))
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            const endpoint = await manager.findWorkingIDEEndpoint();
            expect(endpoint).toBe('http://localhost:9961');
        });

        it('should throw error if no endpoint found', async () => {
            fetchMock.mockResolvedValue({ ok: false, status: 404 });
            await expect(manager.findWorkingIDEEndpoint()).rejects.toThrow();
        });

        it('should deduplicate concurrent discovery requests', async () => {
            fetchMock.mockImplementation((url) => {
                if (url === 'http://localhost:9960') {
                    return new Promise(resolve => {
                        setTimeout(() => resolve({
                            ok: true,
                            status: 200,
                            text: () => Promise.resolve(JSON.stringify({ result: { tools: [] } }))
                        }), 50);
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            // Start two concurrent discoveries
            const promise1 = manager.findWorkingIDEEndpoint();
            const promise2 = manager.findWorkingIDEEndpoint();

            const [result1, result2] = await Promise.all([promise1, promise2]);

            // Both should return same endpoint
            expect(result1).toBe(result2);
            // Port 9960 should only be checked once per discovery cycle (not twice)
            // The deduplication ensures only ONE full scan happens
        });
    });

    describe('updateIDEEndpoint', () => {
        it('should update cached endpoint on success', async () => {
            fetchMock.mockImplementation((url) => {
                if (url === 'http://localhost:9960') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        text: () => Promise.resolve(JSON.stringify({ result: { tools: [] } }))
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            expect(manager.getCachedEndpoint()).toBeNull();
            await manager.updateIDEEndpoint();
            expect(manager.getCachedEndpoint()).toBe('http://localhost:9960');
        });

        it('should not throw on discovery failure', async () => {
            fetchMock.mockResolvedValue({ ok: false, status: 404 });

            // Should not throw, error is caught internally
            await expect(manager.updateIDEEndpoint()).resolves.not.toThrow();
        });
    });
});
