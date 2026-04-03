/**
 * Remove solid black background without stripping bug blacks that connect to the edge.
 *
 * 1) Edge flood-fill removes black connected to image edges (same as before).
 * 2) Restore black pixels that belong to the art: near red/white seeds (distance cap),
 *    or any black pixel 8-adjacent to white (head markings next to black outline).
 *
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

function isNearBlack(r, g, b, t = 22) {
  return r <= t && g <= t && b <= t
}

/** Coral / red wing — tuned for flat illustration reds */
function isRed(r, g, b) {
  return r >= 85 && r > g + 10 && r > b + 10
}

function isWhite(r, g, b) {
  return r >= 228 && g >= 228 && b >= 228
}

function idx(x, y, w) {
  return y * w + x
}

function at(pixels, x, y, w) {
  const i = (y * w + x) * 4
  return [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]]
}

async function main() {
  if (!fs.existsSync(input)) {
    console.error('Missing', input)
    process.exit(1)
  }

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const w = info.width
  const h = info.height
  const orig = new Uint8ClampedArray(data)
  const pixels = new Uint8ClampedArray(orig)

  // --- 1) Edge flood: remove black connected to edges (4-neighbor) ---
  const visited = new Uint8Array(w * h)
  const q = []
  const pushEdge = (x, y) => {
    const i = idx(x, y, w)
    if (visited[i]) return
    const p = (y * w + x) * 4
    if (!isNearBlack(orig[p], orig[p + 1], orig[p + 2])) return
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
      if (!isNearBlack(orig[np], orig[np + 1], orig[np + 2])) continue
      visited[vi] = 1
      q.push([nx, ny])
    }
  }

  // --- 2) Distance from any red or white pixel (8-neighbor BFS) ---
  const dist = new Uint16Array(w * h)
  dist.fill(65535)
  const q2 = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4
      const r = orig[p],
        g0 = orig[p + 1],
        b0 = orig[p + 2]
      if (isRed(r, g0, b0) || isWhite(r, g0, b0)) {
        const i = idx(x, y, w)
        dist[i] = 0
        q2.push([x, y])
      }
    }
  }

  let head = 0
  while (head < q2.length) {
    const [x, y] = q2[head++]
    const d0 = dist[idx(x, y, w)]
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const ni = idx(nx, ny, w)
        if (dist[ni] !== 65535) continue
        dist[ni] = d0 + 1
        q2.push([nx, ny])
      }
    }
  }

  const maxDist = Math.min(140, Math.max(64, Math.floor(0.2 * Math.hypot(w, h))))

  const touchesWhite = (x, y) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const p = (ny * w + nx) * 4
        if (isWhite(orig[p], orig[p + 1], orig[p + 2])) return true
      }
    }
    return false
  }

  // --- 3) Restore bug blacks that were wrongly cleared ---
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4
      if (pixels[p + 3] !== 0) continue
      if (!isNearBlack(orig[p], orig[p + 1], orig[p + 2])) continue

      const d = dist[idx(x, y, w)]
      const nearArt = d <= maxDist && d >= 2
      const nextToWhiteHead = touchesWhite(x, y)

      if (nearArt || nextToWhiteHead) {
        pixels[p] = orig[p]
        pixels[p + 1] = orig[p + 1]
        pixels[p + 2] = orig[p + 2]
        pixels[p + 3] = 255
      }
    }
  }

  await sharp(Buffer.from(pixels), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(output)

  console.log('Wrote', output, `(maxDist=${maxDist})`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
