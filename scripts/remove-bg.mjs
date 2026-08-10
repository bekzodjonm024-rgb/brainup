import sharp from "sharp";

const inp = "C:/Users/bekzo/Downloads/BRAINUP/public/brainup-logo.png";
const out = "C:/Users/bekzo/Downloads/BRAINUP/public/brainup-logo-transparent.png";

const { data, info } = await sharp(inp)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
for (let i = 0; i < data.length; i += channels) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  if (r > 230 && g > 230 && b > 230) data[i + 3] = 0;
}

await sharp(data, { raw: { width, height, channels } }).png().toFile(out);
console.log("done:", out);
