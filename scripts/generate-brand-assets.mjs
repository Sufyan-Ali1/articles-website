import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const directory = path.join(root, "public/images/brand");
await mkdir(directory, { recursive: true });
const mark = await readFile(path.join(directory, "ae-mark.svg"), "utf8");
const paths = mark
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");
const embeddedMark = (x, y, width, height) =>
  `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="0 0 800 430">${paths}</svg>`;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="106" fill="#f4f8ff"/>${embeddedMark(24, 130, 464, 250)}</svg>`;
await Promise.all([
  writeFile(path.join(root, "src/app/icon.svg"), icon),
  sharp(Buffer.from(icon))
    .resize(180, 180)
    .png()
    .toFile(path.join(root, "src/app/apple-icon.png")),
  ...[192, 512].map((size) =>
    sharp(Buffer.from(icon))
      .resize(size, size)
      .png()
      .toFile(path.join(directory, `ae-icon-${size}.png`)),
  ),
]);

const sizes = [16, 32, 48, 64];
const entries = await Promise.all(
  sizes.map((size) =>
    sharp(Buffer.from(icon)).resize(size, size).png().toBuffer(),
  ),
);
const header = Buffer.alloc(6 + entries.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(entries.length, 4);
let offset = header.length;
entries.forEach((entry, index) => {
  const start = 6 + index * 16;
  header[start] = sizes[index];
  header[start + 1] = sizes[index];
  header.writeUInt16LE(1, start + 4);
  header.writeUInt16LE(32, start + 6);
  header.writeUInt32LE(entry.length, start + 8);
  header.writeUInt32LE(offset, start + 12);
  offset += entry.length;
});
await writeFile(
  path.join(root, "src/app/favicon.ico"),
  Buffer.concat([header, ...entries]),
);

if (process.argv[2]) {
  await sharp(process.argv[2])
    .resize(1920, 1080, {
      fit: "contain",
      background: "#eef5f8",
    })
    .webp({ quality: 86 })
    .toFile(path.join(directory, "article-fallback.webp"));
}
console.log(
  "AE icon, favicon, Apple icon, app icons, and supplied fallback artwork saved.",
);
