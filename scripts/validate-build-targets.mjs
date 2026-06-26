import { existsSync, statSync } from "node:fs";

const expected = [
  "dist/riemannian-eeg-widgets.js",
  "dist/riemannian-eeg-riemannian-eeg-widgets.css",
  "dist-pages/index.html",
];

for (const path of expected) {
  if (!existsSync(path) || statSync(path).size === 0) {
    throw new Error(`Missing required build output: ${path}`);
  }
}

console.log("Validated independent Wix and GitHub Pages build targets.");
