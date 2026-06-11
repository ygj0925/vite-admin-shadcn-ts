import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 8890,
      open: true,
      proxy: {
        [env.VITE_API_PREFIX]: {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(new RegExp(`^${env.VITE_API_PREFIX}`), ""),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      outDir: "dist",
      minify: "terser",
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
          // 手动分包：把体积大且首屏非必需的依赖独立成 chunk，提升缓存命中和首屏速度
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('recharts') || id.includes('d3-')) return 'charts'
            if (id.includes('highlight.js')) return 'highlight'
            if (id.includes('crypto-js') || id.includes('jsencrypt')) return 'crypto'
            if (id.includes('@tanstack/react-table')) return 'table'
            if (id.includes('@tanstack/react-form') || id.includes('zod')) return 'form'
            if (id.includes('radix-ui') || id.includes('@radix-ui')) return 'radix'
            if (id.includes('lucide-react')) return 'icons'
            if (id.includes('date-fns') || id.includes('dayjs')) return 'date'
            if (id.includes('react-dom') || id.includes('react-router')) return 'react'
            if (id.includes('zustand') || id.includes('immer')) return 'state'
          },
        },
      },
    },
    envPrefix: ["VITE", "FILE"],
  };
});