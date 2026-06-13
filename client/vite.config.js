import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      // output: {
      //   manualChunks: {
      //     "vendor-react": ["react", "react-dom", "react-router-dom"],
      //     "vendor-three": ["three"],
      //     "vendor-postprocessing": ["postprocessing"],
      //     "vendor-charts": ["chart.js", "react-chartjs-2", "recharts"],
      //     "vendor-motion": ["motion"],
      //   },
      // },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router-dom")) {
            return "vendor-react";
          }

          if (id.includes("node_modules/three")) {
            return "vendor-three";
          }

          if (id.includes("node_modules/postprocessing")) {
            return "vendor-postprocessing";
          }

          if (
            id.includes("node_modules/chart.js") ||
            id.includes("node_modules/react-chartjs-2") ||
            id.includes("node_modules/recharts")
          ) {
            return "vendor-charts";
          }

          if (id.includes("node_modules/motion")) {
            return "vendor-motion";
          }
        },
      },
    },
  },
})
