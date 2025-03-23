import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react({
        // Add this configuration for better React refresh
        fastRefresh: true,
        // Include all the necessary babel plugins
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
          ],
        },
      }),
      // Add visualizer in build mode
      mode === 'production' && visualizer(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'components': path.resolve(__dirname, './src/components'),
        'services': path.resolve(__dirname, './src/services'),
        'context': path.resolve(__dirname, './src/context'),
        'types': path.resolve(__dirname, './src/types'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/socket.io': {
          target: env.VITE_WS_URL || 'ws://localhost:3001',
          ws: true,
        },
      },
      host: true,
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'mui-vendor': ['@mui/material', '@mui/icons-material'],
            'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          },
        },
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@reduxjs/toolkit/query/react'
      ],
      exclude: ['@reduxjs/toolkit'],
    },
  };
});
