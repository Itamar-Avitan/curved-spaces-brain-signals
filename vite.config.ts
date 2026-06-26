import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/main.ts",
      formats: ["es"],
      fileName: "riemannian-eeg-widgets",
    },
    rollupOptions: {
      output: {
        assetFileNames: "riemannian-eeg-[name][extname]",
      },
    },
  },
});
