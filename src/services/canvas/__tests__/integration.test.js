/**
 * Integration test for Canvas services
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { CanvasDataService } from '../index.js';

// Mock sessionStorage for testing
const mockSessionStorage = {
    store: {},
    getItem: vi.fn((key) => mockSessionStorage.store[key] || null),
    setItem: vi.fn((key, value) => {
        mockSessionStorage.store[key] = value;
    }),
    removeItem: vi.fn((key) => {
        delete mockSessionStorage.store[key];
    }),
    clear: vi.fn(() => {
        mockSessionStorage.store = {};
    })
};

// Replace global sessionStorage with mock
Object.defineProperty(global, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true
});

describe('Canvas Services Integration', () => {
    beforeEach(() => {
        mockSessionStorage.clear();
        vi.clearAllMocks();
    });

    test('should export CanvasDataService correctly', () => {
        expect(CanvasDataService).toBeDefined();
        expect(typeof CanvasDataService.storePoemForCanvas).toBe('function');
        expect(typeof CanvasDataService.getPoemForCanvas).toBe('function');
        expect(typeof CanvasDataService.clearPoemData).toBe('function');
        expect(typeof CanvasDataService.standardizePoemData).toBe('function');
        expect(typeof CanvasDataService.validatePoemData).toBe('function');
    });

    test('should handle complete workflow', () => {
        // Test complete workflow: store -> retrieve -> clear
        const testPoem = {
            title: 'Integration Test Poem',
            author: 'Test Author',
            text: 'Line 1\nLine 2\nLine 3'
        };

        // Store poem
        const stored = CanvasDataService.storePoemForCanvas(testPoem);
        expect(stored).toBeDefined();
        expect(stored.title).toBe('Integration Test Poem');
        expect(stored.lines).toHaveLength(3);

        // Retrieve poem
        const retrieved = CanvasDataService.getPoemForCanvas();
        expect(retrieved).toEqual(stored);

        // Clear poem
        CanvasDataService.clearPoemData();
        const afterClear = CanvasDataService.getPoemForCanvas();
        expect(afterClear).toBeNull();
    });
});