/**
 * One-shot: build favicons from public/logo.jpg (contained on white — readable at 16–32px in tabs).
 * Run: node scripts/generate-favicons.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import toIco from 'to-ico'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const src = path.join(root, 'public', 'logo.jpg')
const publicDir = path.join(root, 'public')

const white = { r: 255, g: 255, b: 255, alpha: 1 }

async function squarePng(size, outPath) {
  await sharp(src)
    .resize(size, size, { fit: 'contain', background: white, position: 'centre' })
    .png({ compressionLevel: 9 })
    .toFile(outPath)
}

async function main() {
  if (!fs.existsSync(src)) {
    console.error('Missing', src)
    process.exit(1)
  }

  const icon32 = path.join(publicDir, 'icon-32.png')
  const icon48 = path.join(publicDir, 'icon-48.png')
  const icon192 = path.join(publicDir, 'icon-192.png')
  const apple = path.join(publicDir, 'apple-touch-icon.png')
  const faviconIco = path.join(publicDir, 'favicon.ico')

  // Tab icons: 32px first (Chrome tab). 192px is for shortcuts / high-DPI only — not as generic rel=icon.
  await squarePng(32, icon32)
  await squarePng(48, icon48)
  await squarePng(192, icon192)
  await squarePng(180, apple)

  const buf32 = fs.readFileSync(icon32)
  const buf16 = await sharp(src)
    .resize(16, 16, { fit: 'contain', background: white, position: 'centre' })
    .png({ compressionLevel: 9 })
    .toBuffer()

  // Single-size ICO stacks often break Chrome; use 16 + 32 only (no 48 inside .ico).
  const ico = await toIco([buf16, buf32])
  fs.writeFileSync(faviconIco, ico)

  console.log('Wrote:', icon32, icon48, icon192, apple, faviconIco)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
