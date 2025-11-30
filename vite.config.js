import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        svgr(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@styles': path.resolve(__dirname, 'src/styles')
        }
    },
    // Exclude LEGACY directory from build
    build: {
        rollupOptions: {
            external: (id) => id.includes('/LEGACY/'),
            output: {
                manualChunks: {
                    // React ecosystem
                    'react-vendor': ['react', 'react-dom', 'react-router'],

                    // Canvas/Graphics libraries (DesignPage)
                    'pixi': ['pixi.js'],

                    // Audio libraries (AudioPage)
                    'wavesurfer': ['wavesurfer.js'],

                    // Data fetching & state management
                    'tanstack-query': ['@tanstack/react-query', '@tanstack/react-query-persist-client', '@tanstack/query-sync-storage-persister'],

                    // Supabase
                    'supabase': ['@supabase/supabase-js'],

                    // Utilities
                    'axios': ['axios']
                }
            }
        },
        chunkSizeWarningLimit: 600 // Increase to 600kb to reduce warnings
    },
    define: {
        // PIXI.js optimalisatie
        __PIXI_DEVTOOLS__: process.env.NODE_ENV === 'development',
    }
})
