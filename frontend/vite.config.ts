import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const publicBasePath = process.env.VITE_PUBLIC_BASE_PATH || "/";

export default defineConfig({
  base: publicBasePath,
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  server: {
    port: 5173
  }
});
