'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { HUMANIZE_PRIORITIES, type HumanizePriority, setStoredPriority } from '@/lib/humanizer-priority'
import { cn } from '@/lib/utils'

type Props = {
  onComplete: () => void
}

export function HumanizerPriorityStep({ onComplete }: Props) {
  const [selected, setSelected] = useState<HumanizePriority | null>(null)

  const handleContinue = () => {
    if (!selected) return
    setStoredPriority(selected)
    onComplete()
  }

  return (
    <div className="min-h-[min(70vh,600px)] px-4 py-10 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          What should we optimize for first?
        </h1>
        <p className="mt-3 text-sm text-gray-600 md:text-base">
          Pick a focus for this session. You can change it anytime in the humanizer toolbar.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
        {HUMANIZE_PRIORITIES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(p.id)}
            className={cn(
              'rounded-2xl border-2 bg-white/80 p-5 text-left shadow-sm transition hover:border-primary/40',
              selected === p.id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200/80'
            )}
          >
            <p className="font-semibold text-gray-900">{p.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.description}</p>
          </button>
        ))}
      </div>

      <div className="mx-auto mt-10 flex max-w-xl justify-center">
        <Button
          type="button"
          size="lg"
          className="min-w-[200px] rounded-full"
          disabled={!selected}
          onClick={handleContinue}
        >
          Continue to humanizer
        </Button>
      </div>
    </div>
  )
}
