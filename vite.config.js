import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        registro: resolve(__dirname, "pages/registro.html"),
        recuperar: resolve(__dirname, "pages/recuperar.html"),
        ayuda: resolve(__dirname, "pages/ayuda.html"),
        dashboard: resolve(__dirname, "pages/dashboard.html"),
      },
    },
  },
});
