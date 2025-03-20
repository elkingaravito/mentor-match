import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno basadas en el modo
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
        },
        '/socket.io': {
          target: env.VITE_WS_URL || 'ws://localhost:8000',
          ws: true,
        },
      },
      host: true, // Necesario para acceder desde otros dispositivos en la red
    },
    define: {
      // Asegura que process.env esté disponible en el cliente
      'process.env': env
    }
  }
})
