import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    port: 3000, // Ensures frontend runs on port 3000
    hmr: {
      overlay: false, // Reduces reloads on errors
      // Reduce HMR update frequency to prevent excessive API calls
      clientPort: 3000,
    },
    proxy: {
      "/api": "http://localhost:4000", // Redirects API calls to the backend
    },
    // Add watch options to reduce file system events
    watch: {
      // Ignore node_modules to reduce watch events
      ignored: ['**/node_modules/**', '**/.git/**'],
      // Use polling only if needed (can increase CPU usage)
      usePolling: false,
    }
  },
  build: {
    target: "esnext", // Optimizes build for ESNext
    outDir: "dist", // Specifies output directory for production build
    // Add build optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor packages to improve caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      'react',
      'react-dom',
      'react-router-dom'
    ],
    // Exclude large dependencies that don't need pre-bundling
    exclude: []
  },
  // Add environment-specific settings
  define: {
    // Make NODE_ENV available to the client
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  // Enable source maps in development for better debugging
  css: {
    devSourcemap: true
  }
});