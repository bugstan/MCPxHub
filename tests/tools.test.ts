
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleToolCall, fetchToolsList } from '../src/tools.js';

// Mock logger to avoid cluttering test output
vi.mock('../src/logger.js', () => ({
    debug: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    success: vi.fn(),
    warn: vi.fn()
}));

// Mock config
vi.mock('../src/config.js', () => ({
    IDE_TYPE: 'vscode'
}));

describe('Tools Module', () => {
    const mockEndpoint = 'http://localhost:9999';

    // Setup global fetch mock
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('handleToolCall', () => {
        it('should successfully handle a tool call', async () => {
            const mockResponse = {
                jsonrpc: '2.0',
                id: '123',
                result: {
                    content: [{ type: 'text', text: 'success' }],
                    isError: false
                }
            };

            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve(JSON.stringify(mockResponse))
            });

            const result = await handleToolCall('test_tool', { arg: 1 }, mockEndpoint);

            expect(result).toEqual(mockResponse.result);
            expect(fetchMock).toHaveBeenCalledWith(mockEndpoint, expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"method":"tools/call"')
            }));
        });

        it('should handle tool call errors returned by endpoint', async () => {
            const mockResponse = {
                jsonrpc: '2.0',
                id: '123',
                error: {
                    code: -32000,
                    message: 'Tool execution failed'
                }
            };

            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve(JSON.stringify(mockResponse))
            });

            const result = await handleToolCall('test_tool', {}, mockEndpoint);

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Tool execution failed');
        });

        it('should handle network errors (non-ok status)', async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: () => Promise.resolve('Server Error')
            });

            const result = await handleToolCall('test_tool', {}, mockEndpoint);

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Response failed: 500');
        });

        it('should handle JSON parse errors', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve('Invalid JSON')
            });

            const result = await handleToolCall('test_tool', {}, mockEndpoint);

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Invalid JSON response');
        });

        it('should handle empty result field', async () => {
            const mockResponse = {
                jsonrpc: '2.0',
                id: '123',
                result: null
            };

            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve(JSON.stringify(mockResponse))
            });

            const result = await handleToolCall('test_tool', {}, mockEndpoint);

            expect(result.isError).toBe(true);
            expect(result.content).toEqual([]);
        });

        it('should include abort signal in fetch call', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve(JSON.stringify({
                    jsonrpc: '2.0',
                    id: '1',
                    result: { content: [], isError: false }
                }))
            });

            await handleToolCall('test_tool', {}, mockEndpoint);

            expect(fetchMock).toHaveBeenCalledWith(
                mockEndpoint,
                expect.objectContaining({
                    signal: expect.any(AbortSignal)
                })
            );
        });

        it('should handle fetch abort/timeout', async () => {
            fetchMock.mockRejectedValue(new DOMException('Aborted', 'AbortError'));

            const result = await handleToolCall('test_tool', {}, mockEndpoint);

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Aborted');
        });
    });

    describe('fetchToolsList', () => {
        it('should successfully fetch tools list', async () => {
            const mockTools = [
                { name: 'tool1', description: 'desc1', inputSchema: {} }
            ];

            const mockResponse = {
                jsonrpc: '2.0',
                id: '123',
                result: {
                    tools: mockTools
                }
            };

            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve(JSON.stringify(mockResponse))
            });

            const result = await fetchToolsList(mockEndpoint);

            expect(result.tools).toEqual(mockTools);
            expect(fetchMock).toHaveBeenCalledWith(mockEndpoint, expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"method":"tools/list"')
            }));
        });

        it('should throw error when tools list is invalid', async () => {
            const mockResponse = {
                jsonrpc: '2.0',
                id: '123',
                result: {
                    tools: 'not-an-array' // Invalid format
                }
            };

            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve(JSON.stringify(mockResponse))
            });

            await expect(fetchToolsList(mockEndpoint)).rejects.toThrow('Invalid format: tools list is missing or invalid');
        });

        it('should throw error when endpoint returns error', async () => {
            const mockResponse = {
                jsonrpc: '2.0',
                id: '123',
                error: {
                    code: -32601,
                    message: 'Method not found'
                }
            };

            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve(JSON.stringify(mockResponse))
            });

            await expect(fetchToolsList(mockEndpoint)).rejects.toThrow('IDE returned error: Method not found');
        });

        it('should include abort signal in fetch call', async () => {
            const mockResponse = {
                jsonrpc: '2.0',
                id: '123',
                result: { tools: [] }
            };

            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve(JSON.stringify(mockResponse))
            });

            await fetchToolsList(mockEndpoint);

            expect(fetchMock).toHaveBeenCalledWith(
                mockEndpoint,
                expect.objectContaining({
                    signal: expect.any(AbortSignal)
                })
            );
        });

        it('should throw on fetch abort/timeout', async () => {
            fetchMock.mockRejectedValue(new DOMException('Aborted', 'AbortError'));

            await expect(fetchToolsList(mockEndpoint)).rejects.toThrow('Aborted');
        });

        it('should throw on network failure', async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 503,
                statusText: 'Service Unavailable'
            });

            await expect(fetchToolsList(mockEndpoint)).rejects.toThrow('Unable to list tools');
        });
    });
});
