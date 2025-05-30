import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import svgr from 'vite-plugin-svgr'; // Importeer svgr hier

// TODO: Check React Router v7 Framework Mode vs Library Mode configuration
// Currently using Library Mode with existing structure
// Framework Mode would require app/root.tsx structure
// See: https://reactrouter.com/start/framework/installation

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        svgr()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@styles': path.resolve(__dirname, 'src/styles')
        }
    }
})
