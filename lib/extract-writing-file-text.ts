/**
 * Client-only: extract plain text from writing-sample uploads (.txt, .docx, .pdf).
 * Used by the Mimic / Writing DNA flow before humanize.
 */

/** Max characters kept per file or pasted sample (matches modal paste limit). */
export const WRITING_SAMPLE_MAX_CHARS = 12_000

const DEFAULT_MAX_CHARS = WRITING_SAMPLE_MAX_CHARS

export function isSupportedWritingFile(file: File): boolean {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return (
    name.endsWith('.txt') ||
    type === 'text/plain' ||
    name.endsWith('.docx') ||
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.pdf') ||
    type === 'application/pdf'
  )
}

function truncateSample(text: string, maxChars = DEFAULT_MAX_CHARS): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= maxChars) return t
  return `${t.slice(0, maxChars)}…`
}

export async function extractTextFromTxtFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const dec = new TextDecoder('utf-8', { fatal: false })
  let text = dec.decode(buf)
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  return truncateSample(text)
}

type MammothLike = { extractRawText: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> }

export async function extractTextFromDocxFile(file: File): Promise<string> {
  const mod = await import('mammoth')
  const api = (mod as { default?: MammothLike }).default ?? (mod as unknown as MammothLike)
  const arrayBuffer = await file.arrayBuffer()
  const result = await api.extractRawText({ arrayBuffer })
  return truncateSample((result.value || '').trim())
}

export async function extractTextFromPdfFile(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  // Same-origin worker avoids CDN/CSP issues that silently break PDF parsing in dialogs.
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.mjs`
  }

  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjs.getDocument({ data }).promise
  const parts: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const tc = await page.getTextContent()
    for (const item of tc.items) {
      if (typeof item === 'object' && item !== null && 'str' in item) {
        const s = (item as { str?: string }).str
        if (s) parts.push(s)
      }
    }
    parts.push('\n')
  }
  return truncateSample(parts.join(' '))
}

export async function extractTextFromWritingFile(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return extractTextFromPdfFile(file)
  }
  if (
    name.endsWith('.docx') ||
    file.type.includes('wordprocessingml') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractTextFromDocxFile(file)
  }
  return extractTextFromTxtFile(file)
}
