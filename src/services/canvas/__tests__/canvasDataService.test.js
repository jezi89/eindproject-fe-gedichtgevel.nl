/**
 * Tests for CanvasDataService
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { CanvasDataService } from '../canvasDataService.js';

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

describe('CanvasDataService', () => {
    beforeEach(() => {
        mockSessionStorage.clear();
        vi.clearAllMocks();
    });

    describe('standardizePoemData', () => {
        test('should standardize poem data with lines array', () => {
            const input = {
                id: 'test-1',
                title: 'Test Poem',
                author: 'Test Author',
                lines: ['Line 1', 'Line 2', 'Line 3']
            };

            const result = CanvasDataService.standardizePoemData(input);

            expect(result.id).toBe('test-1');
            expect(result.title).toBe('Test Poem');
            expect(result.author).toBe('Test Author');
            expect(result.lines).toEqual(['Line 1', 'Line 2', 'Line 3']);
            expect(result.source).toBe('search');
            expect(result.metadata.wordCount).toBe(6);
            expect(result.metadata.lineCount).toBe(3);
        });

        test('should handle text string format', () => {
            const input = {
                title: 'Test Poem',
                author: 'Test Author',
                text: 'Line 1\nLine 2\nLine 3'
            };

            const result = CanvasDataService.standardizePoemData(input);

            expect(result.lines).toEqual(['Line 1', 'Line 2', 'Line 3']);
            expect(result.metadata.originalFormat).toBe('text-string');
        });

        test('should generate ID when missing', () => {
            const input = {
                title: 'Test Poem',
                author: 'Test Author',
                lines: ['Line 1']
            };

            const result = CanvasDataService.standardizePoemData(input);

            expect(result.id).toMatch(/^test-poem-/);
        });

        test('should sanitize text content', () => {
            const input = {
                title: '<script>alert("xss")</script>',
                author: 'Test & Author',
                lines: ['Line with <tags>']
            };

            const result = CanvasDataService.standardizePoemData(input);

            expect(result.title).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
            expect(result.author).toBe('Test &amp; Author');
            expect(result.lines[0]).toBe('Line with &lt;tags&gt;');
        });
    });

    describe('storage operations', () => {
        test('should store and retrieve poem data', () => {
            const poemData = {
                title: 'Test Poem',
                author: 'Test Author',
                lines: ['Line 1', 'Line 2']
            };

            const stored = CanvasDataService.storePoemForCanvas(poemData);
            const retrieved = CanvasDataService.getPoemForCanvas();

            expect(retrieved).toEqual(stored);
            expect(retrieved.title).toBe('Test Poem');
        });

        test('should return null when no data stored', () => {
            const result = CanvasDataService.getPoemForCanvas();
            expect(result).toBeNull();
        });

        test('should clear poem data', () => {
            const poemData = {
                title: 'Test Poem',
                author: 'Test Author',
                lines: ['Line 1']
            };

            CanvasDataService.storePoemForCanvas(poemData);
            CanvasDataService.clearPoemData();
            
            const result = CanvasDataService.getPoemForCanvas();
            expect(result).toBeNull();
        });
    });

    describe('validation', () => {
        test('should validate correct poem data', () => {
            const validData = {
                id: 'test-1',
                title: 'Test Poem',
                author: 'Test Author',
                lines: ['Line 1', 'Line 2']
            };

            expect(CanvasDataService.validatePoemData(validData)).toBe(true);
        });

        test('should reject invalid poem data', () => {
            expect(CanvasDataService.validatePoemData(null)).toBe(false);
            expect(CanvasDataService.validatePoemData({})).toBe(false);
            expect(CanvasDataService.validatePoemData({ title: 'Test' })).toBe(false);
        });
    });
});