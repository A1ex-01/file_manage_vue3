import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ElementPlus from "unplugin-element-plus/vite";
const path = require("path");
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), ElementPlus()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  base: "./",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8001", //服务端地址
        ws: true,
        changeOrigin: true, // 允许跨域
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    port: 8002,
  },
});
