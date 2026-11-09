/**
 * Turns the site's own photos (not product photos — those live on Cloudinary,
 * which already serves WebP/AVIF) into descriptively named, compressed AVIF,
 * WebP and JPEG files at the widths the page actually displays.
 *
 *   npm run images
 *
 * Add a new photo: drop the original in public/products/ (or anywhere), add an
 * entry below with a descriptive kebab-case name, run the script, and use the
 * <picture> pattern from src/components/ui/Picture.jsx.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const OUT = 'public/images'

const IMAGES = [
  {
    src: 'public/products/cover.jpg',
    name: 'lit-pillar-and-tealight-candles-with-pampas',
    widths: [480, 900],
    // Link previews (WhatsApp, Instagram, Google) want ~1.91:1.
    og: { width: 900, height: 472 },
  },
  {
    src: 'public/products/love-note.jpg',
    name: 'secret-message-letter-bead-jar-candles',
    widths: [360, 512],
  },
]

const FORMATS = {
  avif: (img) => img.avif({ quality: 50, effort: 6 }),
  webp: (img) => img.webp({ quality: 72, effort: 6 }),
  jpg: (img) => img.jpeg({ quality: 76, mozjpeg: true, progressive: true }),
}

fs.mkdirSync(OUT, { recursive: true })
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`

for (const image of IMAGES) {
  const before = fs.statSync(image.src).size
  const meta = await sharp(image.src).metadata()
  for (const width of image.widths.filter((w) => w <= meta.width)) {
    for (const [ext, encode] of Object.entries(FORMATS)) {
      const file = path.join(OUT, `${image.name}-${width}.${ext}`)
      // .rotate() honours EXIF orientation; metadata (GPS, camera) is stripped by default.
      await encode(sharp(image.src).rotate().resize({ width, withoutEnlargement: true })).toFile(file)
      console.log(`${file.padEnd(72)} ${kb(fs.statSync(file).size)}  (original ${kb(before)})`)
    }
  }
  if (image.og) {
    const file = path.join(OUT, `${image.name}-share.jpg`)
    await sharp(image.src)
      .rotate()
      .resize({ ...image.og, fit: 'cover', position: sharp.strategy.attention })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(file)
    console.log(`${file.padEnd(72)} ${kb(fs.statSync(file).size)}  (social share)`)
  }
}
