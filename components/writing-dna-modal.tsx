'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dna, Upload, X } from 'lucide-react'
import { setStoredWritingDna } from '@/lib/humanizer-priority'
import { cn } from '@/lib/utils'

const MAX_SAMPLES = 5
const MIN_SAMPLES = 3
const MAX_WORDS_PER_SAMPLE = 50

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSamples?: string[]
  onExtracted?: () => void
}

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter((w) => w.length > 0).length
}

export function WritingDnaModal({ open, onOpenChange, initialSamples = [], onExtracted }: Props) {
  const [draft, setDraft] = useState('')
  const [samples, setSamples] = useState<string[]>(() =>
    initialSamples.length ? initialSamples.slice(0, MAX_SAMPLES) : []
  )

  const initKey = initialSamples.join('\u0001').slice(0, 4000)
  useEffect(() => {
    if (!open) return
    setSamples(initialSamples.slice(0, MAX_SAMPLES))
    setDraft('')
  }, [open, initKey])

  const wc = wordCount(draft)
  const canAdd =
    draft.trim().length > 0 && wc <= MAX_WORDS_PER_SAMPLE && samples.length < MAX_SAMPLES

  const addSample = () => {
    if (!canAdd) return
    setSamples((s) => [...s, draft.trim()])
    setDraft('')
  }

  const removeAt = (i: number) => {
    setSamples((s) => s.filter((_, j) => j !== i))
  }

  const ready = samples.length >= MIN_SAMPLES && samples.length <= MAX_SAMPLES

  const needed = useMemo(() => Math.max(0, MIN_SAMPLES - samples.length), [samples.length])

  const handleExtract = () => {
    if (!ready) return
    setStoredWritingDna(samples)
    onExtracted?.()
    onOpenChange(false)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('text/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const t = typeof reader.result === 'string' ? reader.result : ''
      setDraft(t.slice(0, 2000))
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-left text-xl text-slate-900">Writing DNA</DialogTitle>
          <DialogDescription className="text-left text-slate-600">
            Add {MIN_SAMPLES}–{MAX_SAMPLES} short samples of your writing. We use them to mirror your
            rhythm and vocabulary in humanized text—not to store essays.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {samples.length > 0 && (
            <ul className="space-y-2">
              {samples.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-2 text-xs text-slate-700"
                >
                  <span className="line-clamp-3 flex-1">{s}</span>
                  <button
                    type="button"
                    className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-200"
                    aria-label="Remove sample"
                    onClick={() => removeAt(i)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="relative rounded-xl border border-slate-200">
            <Textarea
              placeholder="Paste something you’ve written — an essay, email, or paragraph with your voice…"
              className="min-h-[140px] resize-y border-0 bg-transparent pr-3 pb-10"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                <Upload className="h-3.5 w-3.5" aria-hidden />
                Upload file
                <input type="file" accept=".txt,text/plain" className="hidden" onChange={handleFile} />
              </label>
            </div>
            <div className="absolute bottom-2 right-2 text-xs text-slate-500 tabular-nums">
              {wc}/{MAX_WORDS_PER_SAMPLE} words
            </div>
          </div>
          {wc > MAX_WORDS_PER_SAMPLE && (
            <p className="text-xs text-amber-800">Shorten to {MAX_WORDS_PER_SAMPLE} words or fewer per sample.</p>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!canAdd}
            onClick={addSample}
            className="w-full"
          >
            Add sample ({samples.length}/{MAX_SAMPLES})
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
                    i < samples.length ? 'bg-slate-700' : 'bg-slate-200'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-slate-600">
              {ready ? 'Ready' : `${needed} more needed`}
            </span>
          </div>
          <Button variant="default" disabled={!ready} onClick={handleExtract} className="gap-2">
            <Dna className="h-4 w-4" aria-hidden />
            Extract DNA
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
