import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const outputDir = "dist-pages";
const indexPath = join(outputDir, "index.html");
const requestedBase = process.env.PAGES_BASE_PATH || "/curved-spaces-brain-signals/";
const base = `/${requestedBase.replace(/^\/+|\/+$/g, "")}/`;

if (!existsSync(indexPath)) {
  throw new Error("Pages build is missing dist-pages/index.html.");
}

const html = readFileSync(indexPath, "utf8");
const projectAttributes = [...html.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((value) => value.startsWith("/"));
const invalidAttributes = projectAttributes.filter(
  (value) => !value.startsWith(base),
);

if (invalidAttributes.length > 0) {
  throw new Error(
    `Pages build contains unhandled root-absolute assets:\n${invalidAttributes.join("\n")}`,
  );
}

if (html.includes("/src/main.ts")) {
  throw new Error("Pages build still references the development TypeScript entry.");
}

const requiredFiles = [
  "index.html",
  "media/curved-spaces-hook.mp4",
  "media/covariance-path.mp4",
  "media/riemannian-mean.mp4",
  "media/tangent-space.mp4",
  "media/mdm-classifier.mp4",
  "downloads/01_riemannian_eeg_motor_imagery.ipynb",
  "downloads/01_riemannian_eeg_motor_imagery_colab.ipynb",
];

for (const relativePath of requiredFiles) {
  const path = join(outputDir, relativePath);
  if (!existsSync(path) || statSync(path).size === 0) {
    throw new Error(`Pages build is missing required artifact: ${relativePath}`);
  }
}

if (!html.includes('name="robots" content="noindex,nofollow"')) {
  throw new Error("Pages review build is missing its noindex metadata.");
}

console.log(
  `Validated Pages build at ${base} with ${requiredFiles.length} required artifacts.`,
);
