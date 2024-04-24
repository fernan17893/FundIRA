import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
 plugins: [react()],
 resolve: {
   alias: {
     "@": path.resolve(__dirname, "./src"),
   },
 },
 proxy: {
  // proxy all webpack dev-server requests starting with /api to our backend (Node.js) server on port 3000
  '/add-bank': {
    target: 'http://localhost:3000', // can be [protocol][hostname][port][base_path]
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/add-bank/, '')
  },
},
})
