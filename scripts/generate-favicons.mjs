/**
 * One-shot: build favicons from public/logo.jpg (square center-crop, small files for Google / browsers).
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
async function squarePng(size, outPath) {
  await sharp(src)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toFile(outPath)
}

async function main() {
  if (!fs.existsSync(src)) {
    console.error('Missing', src)
    process.exit(1)
  }

  const icon48 = path.join(publicDir, 'icon-48.png')
  const icon192 = path.join(publicDir, 'icon-192.png')
  const apple = path.join(publicDir, 'apple-touch-icon.png')
  const faviconIco = path.join(publicDir, 'favicon.ico')

  await squarePng(48, icon48)
  await squarePng(192, icon192)
  await squarePng(180, apple)

  const buf48 = fs.readFileSync(icon48)
  const buf32 = await sharp(src)
    .resize(32, 32, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toBuffer()
  const buf16 = await sharp(src)
    .resize(16, 16, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toBuffer()

  const ico = await toIco([buf16, buf32, buf48])
  fs.writeFileSync(faviconIco, ico)

  console.log('Wrote:', icon48, icon192, apple, faviconIco)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
