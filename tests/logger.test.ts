
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Logger Module', () => {
    const originalConsoleError = console.error;
    let consoleErrorMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.resetModules();
        consoleErrorMock = vi.fn();
        console.error = consoleErrorMock;
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    describe('when LOG_ENABLED is false', () => {
        beforeEach(() => {
            vi.doMock('../src/config.js', () => ({
                LOG_ENABLED: false
            }));
        });

        it('log() should not output anything', async () => {
            const { log } = await import('../src/logger.js');
            log('test message');
            expect(consoleErrorMock).not.toHaveBeenCalled();
        });

        it('debug() should not output anything', async () => {
            const { debug } = await import('../src/logger.js');
            debug('test message');
            expect(consoleErrorMock).not.toHaveBeenCalled();
        });

        it('success() should not output anything', async () => {
            const { success } = await import('../src/logger.js');
            success('test message');
            expect(consoleErrorMock).not.toHaveBeenCalled();
        });

        it('error() should always output', async () => {
            const { error } = await import('../src/logger.js');
            error('error message');
            expect(consoleErrorMock).toHaveBeenCalled();
            expect(consoleErrorMock.mock.calls[0][0]).toContain('[ERROR]');
            expect(consoleErrorMock.mock.calls[0][0]).toContain('error message');
        });

        it('warn() should always output', async () => {
            const { warn } = await import('../src/logger.js');
            warn('warning message');
            expect(consoleErrorMock).toHaveBeenCalled();
            expect(consoleErrorMock.mock.calls[0][0]).toContain('[WARN]');
            expect(consoleErrorMock.mock.calls[0][0]).toContain('warning message');
        });
    });

    describe('when LOG_ENABLED is true', () => {
        beforeEach(() => {
            vi.doMock('../src/config.js', () => ({
                LOG_ENABLED: true
            }));
        });

        it('log() should output with INFO level', async () => {
            const { log } = await import('../src/logger.js');
            log('info message');
            expect(consoleErrorMock).toHaveBeenCalled();
            expect(consoleErrorMock.mock.calls[0][0]).toContain('[INFO]');
            expect(consoleErrorMock.mock.calls[0][0]).toContain('info message');
        });

        it('debug() should output with DEBUG level', async () => {
            const { debug } = await import('../src/logger.js');
            debug('debug message');
            expect(consoleErrorMock).toHaveBeenCalled();
            expect(consoleErrorMock.mock.calls[0][0]).toContain('[DEBUG]');
        });

        it('success() should output with SUCCESS level', async () => {
            const { success } = await import('../src/logger.js');
            success('success message');
            expect(consoleErrorMock).toHaveBeenCalled();
            expect(consoleErrorMock.mock.calls[0][0]).toContain('[SUCCESS]');
        });
    });

    describe('message formatting', () => {
        beforeEach(() => {
            vi.doMock('../src/config.js', () => ({
                LOG_ENABLED: true
            }));
        });

        it('should include ISO timestamp', async () => {
            const { log } = await import('../src/logger.js');
            log('test');
            const output = consoleErrorMock.mock.calls[0][0];
            // ISO timestamp pattern: YYYY-MM-DDTHH:mm:ss.sssZ
            expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });

        it('should format object arguments as JSON', async () => {
            const { log } = await import('../src/logger.js');
            log('test', { key: 'value' });
            const output = consoleErrorMock.mock.calls[0][0];
            expect(output).toContain('"key"');
            expect(output).toContain('"value"');
        });

        it('should handle multiple arguments', async () => {
            const { log } = await import('../src/logger.js');
            log('test', 'arg1', 123);
            const output = consoleErrorMock.mock.calls[0][0];
            expect(output).toContain('arg1');
            expect(output).toContain('123');
        });
    });
});
