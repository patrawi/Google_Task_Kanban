import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@/*": path.resolve(__dirname, "./src"),
      "@/components/*": path.resolve(__dirname, "./src/components/*"),
      "@/hooks/*": path.resolve(__dirname, "./src/hooks/*"),
      "@/services/*": path.resolve(__dirname, "./src/services/*"),
      "@/utils/*": path.resolve(__dirname, "./src/utils/*"),
      "@/types/*": path.resolve(__dirname, "./src/types/*"),
      "@/config/*": path.resolve(__dirname, "./src/config/*"),
    },
  },
});
