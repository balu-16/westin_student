import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = path.resolve(root, "../references/homepage-rebuild");
const destination = path.join(root, "public/images/skybook");
await mkdir(destination, { recursive: true });
const masters = new Set([
  "skybook-desktop",
  "skybook-mobile",
  "business",
  "hospitality",
  "foundation",
  "campus",
  "mentoring",
  "collaboration",
  "publications",
]);
for (const file of await readdir(source)) {
  if (!file.endsWith(".png") || !masters.has(path.basename(file, ".png")))
    continue;
  const name = path.basename(file, ".png");
  const widths =
    name === "skybook-desktop"
      ? [960, 1440, 1920]
      : name === "skybook-mobile"
        ? [480, 720, 960]
        : [480, 720, 960, 1440];
  for (const width of widths) {
    const result = await sharp(path.join(source, file))
      .resize({ width })
      .webp({ quality: 82, effort: 6 })
      .toFile(path.join(destination, `${name}-${width}.webp`));
    console.log(`${name}-${width}.webp: ${Math.round(result.size / 1024)} KB`);
  }
}
