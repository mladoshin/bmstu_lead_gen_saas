import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@entities": path.resolve(__dirname, "src/ui/entities"),
      "@features": path.resolve(__dirname, "src/ui/features"),
      "@widgets": path.resolve(__dirname, "src/ui/widgets"),
      "@pages": path.resolve(__dirname, "src/ui/pages"),
      "@layouts": path.resolve(__dirname, "src/ui/layouts"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/ui/styles/_variables.scss";
          @import "@/ui/styles/_mixins.scss";
        `,
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
