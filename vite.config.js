import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import svgr from 'vite-plugin-svgr'; // Importeer svgr hier
import { codecovVitePlugin } from "@codecov/vite-plugin";
import { visualizer } from 'rollup-plugin-visualizer';


// TODO: Check React Router v7 Framework Mode vs Library Mode configuration
// Currently using Library Mode with existing structure
// Framework Mode would require app/root.tsx structure
// See: https://reactrouter.com/start/framework/installation

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        svgr(),
        // Bundle visualizer - generates interactive treemap of bundle
        visualizer({
            open: true,              // Open automatically in browser after build
            filename: 'stats.html',  // Output file in project root
            gzipSize: true,          // Show gzipped size
            brotliSize: true,        // Show brotli compressed size
            template: 'treemap',     // Use treemap visualization
        }),
        // Put the Codecov vite plugin after all other plugins
        codecovVitePlugin({
            enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
            bundleName: "gedichtgevel",
            uploadToken: process.env.CODECOV_TOKEN,
        })
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
