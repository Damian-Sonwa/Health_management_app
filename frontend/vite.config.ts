import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      exclude: ['mongodb']
    },
    server: {
      // Disable caching for development to ensure latest code runs
      headers: {
        'Cache-Control': 'no-store',
      },
    },
    build: {
      rollupOptions: {
        external: [],
        output: {
          // Add hash to filenames to bust cache
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`
        }
      }
    }
  }
})