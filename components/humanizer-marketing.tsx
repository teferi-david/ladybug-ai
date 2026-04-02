import type { ReactNode } from 'react'
import Link from 'next/link'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-gray-100 py-10 last:border-0">
      <h2 className="mb-4 text-xl font-bold text-gray-900 md:text-2xl">{title}</h2>
      <div className="space-y-4 text-sm leading-relaxed text-gray-700 md:text-base">{children}</div>
    </section>
  )
}

function Subheading({ children }: { children: ReactNode }) {
  return <h3 className="mt-6 text-lg font-semibold text-gray-900">{children}</h3>
}

export function HumanizerMarketing() {
  return (
    <article className="border-t border-gray-200 bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <p className="mb-10 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
          Curious about the Ladybug AI humanizer? Peek at the{' '}
          <Link
            href="/ai-humanizer"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/90"
          >
            AI humanizer landing page
          </Link>
          .
        </p>

        <Section title="Humanize AI content that actually sounds like you">
          <p>
            Want AI text that clears Turnitin, GPTZero, and the usual suspects? We built Ladybug AI to rewrite
            robotic drafts into something you could plausibly have typed at 2 a.m. It should read clear, sound
            human, and still mean what you meant. People also find us when they search stuff like bypass
            Turnitin, GPTZero checker, undetectable AI, or beat Turnitin. Fair warning: no tool is magic, but
            this one tries hard.
          </p>
          <p>
            The humanizer nudges ChatGPT-ish lines toward real sentences. Same ideas, less &quot;beep boop.&quot;
            Handy for essays, posts, emails, or anything that needs to not sound like a template.
          </p>
          <p>
            For a straight talk on Turnitin, AI detection, and not getting yourself in trouble, read our{' '}
            <Link
              href="/bypass-turnitin"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/90"
            >
              AI humanizer &amp; Turnitin guide
            </Link>
            .
          </p>
          <p>
            Works with output from ChatGPT, Gemini, Claude, and friends. Tone stays steadier, structure stays
            sensible, and you still have to follow your school&apos;s rules (we are not your dean).
          </p>
        </Section>

        <Section title="Why people pick this humanizer">
          <Subheading>Detector scores (the messy reality)</Subheading>
          <p>
            Lots of folks care about ZeroGPT, GPTZero, Copyleaks, Quillbot, Turnitin-style scans, and whatever
            gets invented next month. We tune for that world. Scores move around when vendors update stuff, so
            treat numbers as a hint, not a promise.
          </p>
          <Subheading>Sound like a person, not a brochure</Subheading>
          <p>
            The goal is simple: your ideas in front, filler in the back. Less &quot;furthermore,&quot; more
            sentences a human would actually say out loud.
          </p>
          <Subheading>Swap words without losing the plot</Subheading>
          <p>
            Pick alternatives that fit the paragraph, tighten lines that ramble, then hit submit with slightly
            less dread.
          </p>
          <Subheading>Rephrase, polish, done</Subheading>
          <p>
            Still sounds a bit AI-ish? Run it again. Slide from casual to formal without inventing facts you
            did not put in.
          </p>
        </Section>

        <Section title="Modes and writing levels">
          <p>
            Basic, Advanced, and Academic (Turnitin) are all on the free tier, inside the daily limits and the
            per-run word cap. Pick the vibe you need: quick cleanup, sharper voice, or paper mode.
          </p>
          <Subheading>Keywords without sounding like SEO spam</Subheading>
          <p>
            Keep the phrases you need for search; wrap them in sentences people want to read.
          </p>
          <Subheading>Cleaner grammar, fewer winces</Subheading>
          <p>
            We lean toward clear wording and fewer obvious mistakes so the page does not look thrown together.
          </p>
        </Section>

        <Section title='What people mean by &quot;humanize AI&quot;'>
          <p>
            Basically: make machine text feel like a person wrote it. Conversational when it fits, clear when
            it matters, and not like a stiff FAQ. Ladybug is basically your &quot;make this readable&quot;
            button for students, creators, and anyone who lives in Google Docs.
          </p>
          <p>
            Under the hood we use modern models plus a pile of little checks to keep meaning and structure
            intact. You still proofread. We are not submitting your paper for you.
          </p>
        </Section>

        <Section title="How to humanize text (no drama version)">
          <ol className="list-decimal space-y-3 pl-5">
            <li>Open Ladybug in the browser.</li>
            <li>Paste the AI draft.</li>
            <li>Choose Basic, Advanced, or Academic (Turnitin). Free tier keeps the same daily rules.</li>
            <li>Hit Humanize and wait.</li>
            <li>Read it, tweak it, copy it.</li>
            <li>
              Repeat until it feels right. Free tier has daily caps; Pro bumps limits and unlocks Paraphraser,
              Citations, and the rest of the toolbox.
            </li>
          </ol>
        </Section>

        <Section title="Benefits">
          <ul className="list-disc space-y-2 pl-5">
            <li>Less &quot;AI voice,&quot; more you</li>
            <li>Fewer repetitive robot phrases</li>
            <li>Works for school or work when your rules allow it</li>
            <li>Faster than rewriting every sentence from scratch</li>
            <li>Keeps structure steady so your argument stays intact</li>
          </ul>
        </Section>

        <Section title="Features">
          <ul className="list-disc space-y-2 pl-5">
            <li>Paste, pick a level, click. That is the whole vibe.</li>
            <li>Runs in normal browsers; phone and desktop</li>
            <li>
              Free tier: all humanizer levels, fair daily limits, 200 words per run. Paid plans add bigger caps
              and extra tools
            </li>
            <li>Do not paste passwords or state secrets. Obviously.</li>
          </ul>
        </Section>

        <Section title="Why bother humanizing?">
          <p>
            People stick around when writing feels personal. Humanizing also smooths weird phrasing and that
            same-y AI rhythm, especially next to your own edits and real citations.
          </p>
        </Section>

        <Section title="Who uses this">
          <p className="mb-3">
            Students, writers, marketers, devs, researchers, teachers, and anyone who pasted from ChatGPT and
            immediately regretted the tone.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Bloggers and journalists</li>
            <li>Anyone turning in homework (where it is allowed)</li>
            <li>Email and Slack power users</li>
            <li>Social teams who need copy yesterday</li>
            <li>Freelancers and small agencies</li>
          </ul>
        </Section>

        <Section title="Privacy and support">
          <p>
            Drafts get processed so we can give you output. Follow your school or job policy on AI. Billing
            questions? Settings, after you log in.
          </p>
        </Section>

        <Section title="Modes and voice">
          <p>
            Match the level to the assignment. Pro tiers can go heavier on nuance; you still check it against
            the syllabus or your boss.
          </p>
          <p>
            Need plain English or a more academic feel? Steer it here, then add sources and citations on your
            side.
          </p>
        </Section>

        <Section title="Readers, Google, and the rest">
          <p>
            Natural copy keeps eyeballs on the page. Search engines like helpful content too. Humanizing helps;
            it does not replace research or original thinking.
          </p>
        </Section>

        <Section title="Pretty much anyone with text">
          <ul className="list-disc space-y-2 pl-5">
            <li>Creators, bloggers, reporters</li>
            <li>Growth and marketing teams</li>
            <li>Students trying to sound like themselves</li>
            <li>Product and design folks fixing microcopy</li>
            <li>Shops, HR, social, ecomm, and the occasional lawyer (with a real lawyer double-checking)</li>
          </ul>
        </Section>

        <Section title="Before you go">
          <p>
            Skip pasting nuclear launch codes. For invoices and passwords, use Settings when you are signed in.
            Stuck? Email us from the footer.
          </p>
        </Section>

        <Section title="FAQ">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900">What does humanize AI text mean?</h4>
              <p className="mt-2">
                You take AI output and rewrite it so it sounds like a person wrote it: better flow, fewer weird
                tells, same ideas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Is Ladybug AI free?</h4>
              <p className="mt-2">
                Yep, there is a free tier with daily limits. Pro adds more room, more tools, and fewer
                headaches on long projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">How fast is humanization?</h4>
              <p className="mt-2">
                Long chunks take longer. Stay on the page until it finishes. If it times out, try a shorter
                chunk. Rome was not humanized in one pass.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Do AI detectors always work?</h4>
              <p className="mt-2">
                Nope. They update, they misfire, and your professor still has common sense. Follow integrity
                rules and disclose AI when you have to.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Can I use this on mobile?</h4>
              <p className="mt-2">Sure. The layout stretches for phones and tablets.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Do I need an account for the free tier?</h4>
              <p className="mt-2">
                You can poke around within limits without an account. Signing in keeps your usage from
                wandering off between sessions.
              </p>
            </div>
          </div>
        </Section>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50/80 px-6 py-8 text-center">
          <p className="text-sm font-semibold text-gray-900">Ladybug AI™</p>
          <p className="mt-2 text-sm text-gray-600">
            Humanizer, Paraphraser, Citations, and friends. One spot. Less tab chaos.
          </p>
        </div>
      </div>
    </article>
  )
}
