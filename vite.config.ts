import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll("\\", "/");
          if (normalizedId.includes("node_modules/react") || normalizedId.includes("node_modules/scheduler")) return "vendor-react";
          if (normalizedId.includes("node_modules/zrender")) return "vendor-zrender";
        },
      },
    },
  },
});
