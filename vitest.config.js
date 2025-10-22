import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest Configuration for Gedichtgevel.nl
 *
 * Testing & Coverage Setup:
 * - Unit tests voor components, hooks, en services
 * - Coverage reporting voor Codecov
 * - Integration met Sentry Spotlight.js voor local debugging
 */
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@styles': path.resolve(__dirname, 'src/styles')
    }
  },

  test: {
    // Test environment
    environment: 'jsdom',

    // Global test utilities (geen imports nodig in test files)
    globals: true,

    // Setup files
    setupFiles: ['./src/test/setup.js'], // We maken deze later aan

    // Coverage configuratie
    coverage: {
      // Coverage provider
      provider: 'v8',

      // Output formats
      reporter: [
        'text',           // Console output
        'html',           // Browser viewable report (coverage/index.html)
        'json',           // Voor Codecov upload
        'json-summary',   // Summary voor CI
        'lcov'            // Standard format voor coverage tools
      ],

      // Coverage thresholds (tests falen als onder deze percentages)
      // NOTE: Thresholds zijn tijdelijk laag tijdens setup fase
      // TODO: Verhoog naar 70% zodra tests zijn geschreven
      thresholds: {
        branches: 10,
        functions: 5,
        lines: 1,
        statements: 1
      },

      // Files to include in coverage
      include: [
        'src/**/*.{js,jsx}',
      ],

      // Files to exclude from coverage
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/**/__tests__/**',
        'src/test/**',
        'src/dev/**',
        'src/debug/**',
        'src/LEGACY/**',
        'src/FUTURE/**',
        'src/main.jsx',              // Entry point
        'src/services/sentry/**',    // Sentry config (external dependency)
        '**/node_modules/**',
        '**/dist/**',
        '**/.{git,cache}/**',
      ],

      // Clean coverage directory before each run
      clean: true,

      // Output directory
      reportsDirectory: './coverage',
    },

    // Environment variables for testing
    env: {
      // Sentry/Spotlight.js integration
      VITE_SENTRY_DSN: process.env.VITE_SENTRY_DSN || '',
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',

      // Test mode
      NODE_ENV: 'test',
    },

    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,jsx}',
      'src/**/__tests__/**/*.{js,jsx}'
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'src/LEGACY/**',
      'src/FUTURE/**',
    ],

    // Test timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Watch mode excludes
    watchExclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
    ],
  },
});
