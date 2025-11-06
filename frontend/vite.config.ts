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
      target: 'es2015', // Better mobile browser support
      cssTarget: 'chrome61', // Better CSS compatibility
      sourcemap: false, // Disable sourcemaps for smaller build
      minify: 'terser', // Use terser for better minification
      terserOptions: {
        compress: {
          drop_console: false, // Keep console logs for debugging
          drop_debugger: true
        }
      },
      rollupOptions: {
        external: [],
        output: {
          // Add hash to filenames to bust cache
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'query-vendor': ['@tanstack/react-query'],
            'ui-vendor': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            'charts-vendor': ['recharts']
          }
        }
      },
      // Optimize chunk size for mobile
      chunkSizeWarningLimit: 1000
    }
  }
})