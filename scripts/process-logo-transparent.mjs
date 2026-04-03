/**
 * Remove outer black background via edge flood-fill (keeps interior black on the bug).
 * Reads public/logo-source.png → writes public/logo.png
 * Run: node scripts/process-logo-transparent.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const input = path.join(root, 'public', 'logo-source.png')
const output = path.join(root, 'public', 'logo.png')

function isNearBlack(r, g, b, t = 18) {
  return r <= t && g <= t && b <= t
}

async function main() {
  if (!fs.existsSync(input)) {
    console.error('Missing', input)
    process.exit(1)
  }

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const w = info.width
  const h = info.height
  const pixels = new Uint8ClampedArray(data)
  const visited = new Uint8Array(w * h)
  const idx = (x, y) => y * w + x
  const at = (x, y) => idx(x, y) * 4

  const q = []
  const pushEdge = (x, y) => {
    const i = idx(x, y)
    if (visited[i]) return
    const p = at(x, y)
    if (!isNearBlack(pixels[p], pixels[p + 1], pixels[p + 2])) return
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
    const p = at(x, y)
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
      const vi = idx(nx, ny)
      if (visited[vi]) continue
      const np = at(nx, ny)
      if (!isNearBlack(pixels[np], pixels[np + 1], pixels[np + 2])) continue
      visited[vi] = 1
      q.push([nx, ny])
    }
  }

  await sharp(Buffer.from(pixels), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(output)

  console.log('Wrote', output)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
