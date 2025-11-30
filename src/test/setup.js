/**
 * Vitest Test Setup
 *
 * Global test configuration en mocks voor alle tests.
 * Dit bestand wordt automatisch geladen voor elke test suite.
 */

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom'; // Extended matchers (toBeInTheDocument, etc.)

// Automatische cleanup na elke test
afterEach(() => {
  cleanup();
});

// Mock environment variables voor tests
if (!import.meta.env.VITE_SUPABASE_URL) {
  import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-key';
}

// Mock window.matchMedia (gebruikt door responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver (gebruikt door lazy loading components)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver (gebruikt door canvas/responsive components)
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock Audio API (gebruikt door WaveSurfer.js)
global.AudioContext = class AudioContext {
  constructor() {
    this.destination = {};
    this.sampleRate = 44100;
  }
  createMediaStreamSource() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  createAnalyser() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: vi.fn(),
    };
  }
  close() {
    return Promise.resolve();
  }
};

// Mock MediaRecorder (gebruikt door audio recording)
global.MediaRecorder = class MediaRecorder {
  constructor() {
    this.state = 'inactive';
    this.ondataavailable = null;
    this.onstop = null;
  }
  start() {
    this.state = 'recording';
  }
  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
  }
  addEventListener(event, handler) {
    if (event === 'dataavailable') this.ondataavailable = handler;
    if (event === 'stop') this.onstop = handler;
  }
  removeEventListener() {}
};

// Mock localStorage (gebruikt door TanStack Query cache)
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Console spy setup (voor testing van logging)
global.consoleError = console.error;
global.consoleWarn = console.warn;

// Suppress specific console warnings in tests
const originalError = console.error;
console.error = (...args) => {
  // Suppress React Router warnings in tests
  if (
    args[0]?.includes?.('Warning: ReactDOM.render') ||
    args[0]?.includes?.('Warning: useLayoutEffect')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Custom matchers kunnen hier worden toegevoegd
// expect.extend({ ... });
