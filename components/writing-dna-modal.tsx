'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dna, Loader2, Upload, X } from 'lucide-react'
import { setStoredWritingDna } from '@/lib/humanizer-priority'
import {
  extractTextFromWritingFile,
  isSupportedWritingFile,
  WRITING_SAMPLE_MAX_CHARS,
} from '@/lib/extract-writing-file-text'
import { cn } from '@/lib/utils'

const MAX_SAMPLES = 5
const MIN_SAMPLES = 3

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSamples?: string[]
  onExtracted?: () => void
}

function charCount(s: string) {
  return s.length
}

export function WritingDnaModal({ open, onOpenChange, initialSamples = [], onExtracted }: Props) {
  const [draft, setDraft] = useState('')
  const [samples, setSamples] = useState<string[]>(() =>
    initialSamples.length ? initialSamples.slice(0, MAX_SAMPLES) : []
  )
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const samplesRef = useRef(samples)
  samplesRef.current = samples
  const fileInputRef = useRef<HTMLInputElement>(null)
  const wasOpenRef = useRef(false)

  // Only reset when the dialog transitions closed → open (not on every render while open).
  // Otherwise Radix/re-renders can wipe samples right after a successful file upload.
  useEffect(() => {
    if (open) {
      if (!wasOpenRef.current) {
        const next = initialSamples.slice(0, MAX_SAMPLES)
        samplesRef.current = next
        setSamples(next)
        setDraft('')
        setExtractError(null)
      }
      wasOpenRef.current = true
    } else {
      wasOpenRef.current = false
    }
  }, [open, initialSamples])

  const draftChars = charCount(draft)
  const canAddPaste =
    draft.trim().length > 0 &&
    draftChars <= WRITING_SAMPLE_MAX_CHARS &&
    samples.length < MAX_SAMPLES

  const addSampleFromPaste = () => {
    if (!canAddPaste) return
    setSamples((s) => {
      const next = [...s, draft.trim()]
      samplesRef.current = next
      return next
    })
    setDraft('')
  }

  const removeAt = (i: number) => {
    setSamples((s) => {
      const next = s.filter((_, j) => j !== i)
      samplesRef.current = next
      return next
    })
  }

  const ready = samples.length >= MIN_SAMPLES && samples.length <= MAX_SAMPLES

  const needed = useMemo(() => Math.max(0, MIN_SAMPLES - samples.length), [samples.length])

  const handleExtract = () => {
    if (!ready) return
    setStoredWritingDna(samples)
    onExtracted?.()
    onOpenChange(false)
  }

  const handleFilesChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.target
    const list = inputEl.files
    if (!list?.length) return

    setExtractError(null)
    const files = Array.from(list)
    const prev = samplesRef.current
    const slotsLeft = MAX_SAMPLES - prev.length
    if (slotsLeft <= 0) {
      setExtractError('You already have the maximum number of samples (5).')
      inputEl.value = ''
      return
    }

    setExtracting(true)
    try {
      const toProcess = files.slice(0, slotsLeft)
      const merged: string[] = [...prev]
      const errors: string[] = []

      for (const file of toProcess) {
        if (merged.length >= MAX_SAMPLES) break
        if (!isSupportedWritingFile(file)) {
          errors.push(`${file.name}: use .txt, .docx, or .pdf`)
          continue
        }
        try {
          const text = await extractTextFromWritingFile(file)
          if (!text.trim()) {
            errors.push(`${file.name}: no text found`)
            continue
          }
          merged.push(text)
        } catch (err) {
          const detail = err instanceof Error ? err.message : String(err)
          errors.push(`${file.name}: ${detail || 'could not read'}`)
        }
      }

      samplesRef.current = merged
      setSamples(merged)
      if (files.length > slotsLeft) {
        errors.push(`Only ${slotsLeft} file(s) added (max ${MAX_SAMPLES} total).`)
      }
      if (errors.length) setExtractError(errors.slice(0, 4).join(' · '))
      if (merged.length === prev.length && toProcess.length > 0 && errors.length === 0) {
        setExtractError('No samples were added. Check file type (.txt, .docx, .pdf) and try again.')
      }
    } finally {
      setExtracting(false)
      inputEl.value = ''
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-left text-xl text-slate-900 dark:text-zinc-50">Mimic (Writing DNA)</DialogTitle>
          <DialogDescription className="text-left text-slate-600 dark:text-zinc-400">
            Add {MIN_SAMPLES}–{MAX_SAMPLES} samples of your writing—upload .txt, .docx, or .pdf files (we extract text
            only) or paste paragraphs. When you humanize, the model matches your rhythm and vocabulary. Nothing is stored
            on our servers; samples stay in your browser until you clear them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              tabIndex={-1}
              disabled={samples.length >= MAX_SAMPLES || extracting}
              onChange={handleFilesChange}
            />
            <button
              type="button"
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800',
                (samples.length >= MAX_SAMPLES || extracting) && 'pointer-events-none opacity-50'
              )}
              disabled={samples.length >= MAX_SAMPLES || extracting}
              onClick={() => fileInputRef.current?.click()}
            >
              {extracting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Upload className="h-4 w-4" aria-hidden />
              )}
              {extracting ? 'Extracting text…' : 'Upload files'}
            </button>
            <span className="text-xs text-slate-500 dark:text-zinc-500">
              Up to {MAX_SAMPLES} files total; long files trimmed to {WRITING_SAMPLE_MAX_CHARS.toLocaleString()} chars
              each.
            </span>
          </div>

          {extractError && (
            <p className="text-xs text-amber-800 dark:text-amber-200" role="alert">
              {extractError}
            </p>
          )}

          {samples.length > 0 && (
            <ul className="space-y-2">
              {samples.map((s, i) => (
                <li
                  key={`${i}-${s.slice(0, 24)}`}
                  className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-2 text-xs text-slate-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200"
                >
                  <span className="line-clamp-4 flex-1 whitespace-pre-wrap break-words">{s}</span>
                  <button
                    type="button"
                    className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800"
                    aria-label="Remove sample"
                    onClick={() => removeAt(i)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="relative rounded-xl border border-slate-200 dark:border-zinc-700">
            <Textarea
              placeholder="Or paste something you’ve written—email, essay excerpt, or any paragraph in your voice…"
              className="min-h-[140px] resize-y border-0 bg-transparent pr-3 pb-10 dark:bg-transparent"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="absolute bottom-2 right-2 text-xs text-slate-500 tabular-nums dark:text-zinc-500">
              {draftChars.toLocaleString()}/{WRITING_SAMPLE_MAX_CHARS.toLocaleString()} characters
            </div>
          </div>
          {draftChars > WRITING_SAMPLE_MAX_CHARS && (
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Shorten to {WRITING_SAMPLE_MAX_CHARS.toLocaleString()} characters or fewer per pasted sample.
            </p>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!canAddPaste}
            onClick={addSampleFromPaste}
            className="w-full"
          >
            Add pasted text as sample ({samples.length}/{MAX_SAMPLES})
          </Button>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: MAX_SAMPLES }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 w-6 rounded-full',
                    i < samples.length ? 'bg-slate-700 dark:bg-zinc-300' : 'bg-slate-200 dark:bg-zinc-700'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-slate-600 dark:text-zinc-400">
              {ready ? 'Ready' : `${needed} more needed`}
            </span>
          </div>
          <Button variant="default" disabled={!ready} onClick={handleExtract} className="gap-2">
            <Dna className="h-4 w-4" aria-hidden />
            Save & use with Humanize
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
