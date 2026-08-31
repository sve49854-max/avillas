import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import JavaScriptObfuscator from "javascript-obfuscator";

const root = fileURLToPath(new URL(".", import.meta.url));

function obfuscatorPlugin() {
  return {
    name: "vite-plugin-custom-obfuscator",
    enforce: "post",
    apply: "build",
    generateBundle(options, bundle) {
      for (const [fileName, file] of Object.entries(bundle)) {
        if (file.type === "chunk" && fileName.endsWith(".js")) {
          const result = JavaScriptObfuscator.obfuscate(file.code, {
            compact: true,
            controlFlowFlattening: false,
            deadCodeInjection: false,
            debugProtection: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: "hexadecimal",
            log: false,
            numbersToExpressions: true,
            renameGlobals: false,
            selfDefending: true,
            simplify: true,
            splitStrings: true,
            stringArray: true,
            stringArrayCallsTransform: true,
            stringArrayEncoding: ["rc4"],
            stringArrayThreshold: 0.75,
            unicodeEscapeSequence: false,
          });
          file.code = result.getObfuscatedCode();
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [obfuscatorPlugin()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 5173,
    allowedHosts: true,
    watch: {
      ignored: ["**/assets/ref/**", "**/assets/shots/**", "**/assets/principal/**", "**/assets/portal/**"],
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
        empresas: resolve(root, "empresas.html"),
        portal: resolve(root, "portal.html"),
        panel: resolve(root, "pages/panel.html"),
      },
    },
  },
});
