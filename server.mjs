import { build, preview } from "vite";

const port = Number(process.env.PORT || 4173);

await build();

const server = await preview({
  preview: {
    host: "0.0.0.0",
    port,
    allowedHosts: true,
    strictPort: true,
  },
});

server.printUrls();
console.log(`AV Villas Co-banking listo en el puerto ${port}`);
