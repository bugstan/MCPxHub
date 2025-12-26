
import { describe, it, expect } from 'vitest';
import { isValidIDEType } from '../src/utils.js';

describe('Utils', () => {
    describe('isValidIDEType', () => {
        it('should return true for "vscode"', () => {
            expect(isValidIDEType('vscode')).toBe(true);
        });

        it('should return true for "jetbrains"', () => {
            expect(isValidIDEType('jetbrains')).toBe(true);
        });

        it('should return false for invalid types', () => {
            expect(isValidIDEType('sublime')).toBe(false);
            expect(isValidIDEType('')).toBe(false);
            expect(isValidIDEType(' ')).toBe(false);
            expect(isValidIDEType('vim')).toBe(false);
        });
    });
});
