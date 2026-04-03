import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const BASIC_EQ = (59.4 / 12).toFixed(2)
const UNLIMITED_EQ = (119.4 / 12).toFixed(2)

export function PricingTeaser() {
  return (
    <section className="border-t border-white/30 bg-white/25 py-14 backdrop-blur-sm md:py-20" id="pricing-preview">
      <div className="container mx-auto max-w-5xl px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-primary">Pricing</p>
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          Flexible plans
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-gray-600 md:text-base">
          Start with a 1-day free trial. Annual billing shows as a simple monthly number. Cancel anytime in
          Stripe.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="liquid-glass-bubble flex flex-col rounded-3xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-gray-900">Basic</h3>
            <p className="mt-1 text-sm text-gray-600">500k words/year across tools</p>
            <p className="mt-4">
              <span className="text-3xl font-bold text-primary">${BASIC_EQ}</span>
              <span className="text-gray-600">/mo billed annually</span>
            </p>
            <ul className="mt-6 flex flex-col gap-2 text-sm text-gray-700">
              {['Humanizer (all modes)', 'Paraphraser & citations', '1-day free trial'].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 w-full rounded-full" size="lg">
              <Link href="/pricing">
                See Basic
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="liquid-glass-bubble flex flex-col rounded-3xl p-6 ring-2 ring-primary/25 md:p-8">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-gray-900">Unlimited</h3>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                Popular
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">No word cap across tools</p>
            <p className="mt-4">
              <span className="text-3xl font-bold text-primary">${UNLIMITED_EQ}</span>
              <span className="text-gray-600">/mo billed annually</span>
            </p>
            <ul className="mt-6 flex flex-col gap-2 text-sm text-gray-700">
              {['Everything in Basic', 'Unlimited words', '1-day free trial'].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 w-full rounded-full" size="lg">
              <Link href="/pricing">
                See Unlimited
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          Full comparison and monthly options on the{' '}
          <Link href="/pricing" className="font-medium text-primary underline underline-offset-2">
            pricing page
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
