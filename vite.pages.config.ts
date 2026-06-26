import { defineConfig } from "vite";

function normalizeBase(value: string | undefined): string {
  const raw = value?.trim() || "/curved-spaces-brain-signals/";
  return `/${raw.replace(/^\/+|\/+$/g, "")}/`;
}

const base = normalizeBase(process.env.PAGES_BASE_PATH);
const reviewSha = process.env.REVIEW_SHA || process.env.GITHUB_SHA || "local";
const reviewDate =
  process.env.REVIEW_BUILD_DATE || new Date().toISOString().slice(0, 10);

export default defineConfig({
  base,
  define: {
    "import.meta.env.VITE_REVIEW_BUILD": JSON.stringify("true"),
    "import.meta.env.VITE_REVIEW_SHA": JSON.stringify(reviewSha),
    "import.meta.env.VITE_REVIEW_DATE": JSON.stringify(reviewDate),
  },
  build: {
    outDir: "dist-pages",
    emptyOutDir: true,
  },
});
