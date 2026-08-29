import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 5173,
    allowedHosts: true,
    watch: {
      ignored: ["**/assets/ref/**", "**/assets/shots/**", "**/assets/principal/**"],
    },
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 4173,
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        registro: resolve(root, "pages/registro.html"),
        recuperar: resolve(root, "pages/recuperar.html"),
        ayuda: resolve(root, "pages/ayuda.html"),
        dashboard: resolve(root, "pages/dashboard.html"),
        login: resolve(root, "login.html"),
      },
    },
  },
});
