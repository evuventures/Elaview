import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Ensures frontend runs on port 3000
    proxy: {
      "/api": "http://localhost:3001", // Redirects API calls to the backend
    }
  },
  build: {
    target: "esnext", // Optimizes build for ESNext
    outDir: "dist", // Specifies output directory for production build
  }
});