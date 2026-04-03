/**
 * Remove a solid / near-white background only (edge flood — no color heuristics on the bug).
 *
 * Floods from image edges through near-white pixels only. Red, black, and white markings
 * inside the bug stay intact (they are not reachable from the edge through white alone).
 *
 * Input: public/logo-source.jpg or public/logo-source.png
 * Writes: public/logo.png (RGBA), public/logo.jpg (flattened on white for OG / crawlers)
 * Run: node scripts/process-logo-transparent.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const jpgIn = path.join(root, 'public', 'logo-source.jpg')
const pngIn = path.join(root, 'public', 'logo-source.png')
const input = fs.existsSync(jpgIn) ? jpgIn : pngIn
const output = path.join(root, 'public', 'logo.png')
const outputJpg = path.join(root, 'public', 'logo.jpg')

/** Background white (tweak 235–248 if fringe remains or edges eat into art) */
function isNearWhite(r, g, b) {
  return r >= 240 && g >= 240 && b >= 240
}

function idx(x, y, w) {
  return y * w + x
}

async function main() {
  if (!fs.existsSync(jpgIn) && !fs.existsSync(pngIn)) {
    console.error('Missing', jpgIn, 'or', pngIn)
    process.exit(1)
  }

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const w = info.width
  const h = info.height
  const orig = new Uint8ClampedArray(data)
  const pixels = new Uint8ClampedArray(orig)

  const visited = new Uint8Array(w * h)
  const q = []
  const pushEdge = (x, y) => {
    const i = idx(x, y, w)
    if (visited[i]) return
    const p = (y * w + x) * 4
    if (!isNearWhite(orig[p], orig[p + 1], orig[p + 2])) return
    visited[i] = 1
    q.push([x, y])
  }

  for (let x = 0; x < w; x++) {
    pushEdge(x, 0)
    pushEdge(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    pushEdge(0, y)
    pushEdge(w - 1, y)
  }

  while (q.length) {
    const [x, y] = q.shift()
    const p = (y * w + x) * 4
    pixels[p + 3] = 0
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      const vi = idx(nx, ny, w)
      if (visited[vi]) continue
      const np = (ny * w + nx) * 4
      if (!isNearWhite(orig[np], orig[np + 1], orig[np + 2])) continue
      visited[vi] = 1
      q.push([nx, ny])
    }
  }

  await sharp(Buffer.from(pixels), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(output)

  await sharp(output)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(outputJpg)

  console.log('Wrote', output, outputJpg)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
