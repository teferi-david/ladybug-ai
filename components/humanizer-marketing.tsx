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
    <article className="border-t border-white/30 bg-white/40 backdrop-blur-sm">
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <p className="mb-10 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
          Learn more about the Ladybug AI humanizer on the{' '}
          <Link
            href="/ai-humanizer"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/90"
          >
            AI humanizer landing page
          </Link>
          .
        </p>

        <Section title="Humanize AI content that sounds like you">
          <p>
            Ladybug AI rewrites stiff AI drafts into clear, natural language that keeps your meaning. It is
            built for workflows where Turnitin, GPTZero, and similar checks matter. Many people find us through
            searches for humanizing text, Turnitin readiness, GPTZero, and related terms. No tool replaces
            your judgment, but Ladybug is designed to deliver strong results you can edit and stand behind.
          </p>
          <p>
            The humanizer moves ChatGPT style lines toward real sentences with the same core ideas. Use it for
            essays, posts, emails, or any draft that should not read like a generic template.
          </p>
          <p>
            For direct guidance on Turnitin, AI detection, and academic integrity, read our{' '}
            <Link
              href="/bypass-turnitin"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/90"
            >
              AI humanizer &amp; Turnitin guide
            </Link>
            .
          </p>
          <p>
            Works with output from ChatGPT, Gemini, Claude, and similar assistants. Tone and structure stay
            coherent, and you remain responsible for following your school&apos;s policies.
          </p>
        </Section>

        <Section title="Why people pick this humanizer">
          <Subheading>Detector scores and what to expect</Subheading>
          <p>
            Many users care about ZeroGPT, GPTZero, Copyleaks, Quillbot, Turnitin style scans, and new tools as
            they appear. We tune for that landscape. Scores shift when vendors update models, so treat any
            number as guidance, not a guarantee.
          </p>
          <Subheading>Sound like a person, not a brochure</Subheading>
          <p>
            The goal is simple: your ideas stay in front, filler stays minimal. Fewer stiff transitions, more
            sentences a real person would say out loud.
          </p>
          <Subheading>Keep your meaning while you edit</Subheading>
          <p>
            Choose alternatives that fit the paragraph, tighten lines that ramble, and submit with confidence
            after your own review.
          </p>
          <Subheading>Iterate with confidence</Subheading>
          <p>
            If the tone still reads like generic AI, run another pass. Move from casual to formal without
            inventing facts you did not provide.
          </p>
        </Section>

        <Section title="Modes and writing levels">
          <p>
            Basic, Advanced, and Academic (Turnitin) are all on the free tier, inside the daily limits and the
            per-run word cap. Choose the level that fits: quick cleanup, sharper voice, or academic mode.
          </p>
          <Subheading>Keywords in natural sentences</Subheading>
          <p>
            Keep the phrases you need for search; wrap them in sentences people want to read.
          </p>
          <Subheading>Cleaner grammar, clearer sentences</Subheading>
          <p>
            We lean toward clear wording and fewer obvious mistakes so your draft reads polished and intentional.
          </p>
        </Section>

        <Section title='What people mean by &quot;humanize AI&quot;'>
          <p>
            In practice it means making machine generated text read as if a person wrote it: conversational when
            it fits, clear when it matters, and free of stiff FAQ tone. Ladybug gives students, creators, and
            professionals a focused way to improve AI drafts inside normal writing workflows, including Google
            Docs.
          </p>
          <p>
            Under the hood we use modern models plus checks that preserve meaning and structure. You should
            still proofread. Ladybug does not replace your responsibility for the final submission.
          </p>
        </Section>

        <Section title="How to humanize text">
          <ol className="list-decimal space-y-3 pl-5">
            <li>Open Ladybug in the browser.</li>
            <li>Paste the AI draft.</li>
            <li>Choose Basic, Advanced, or Academic (Turnitin). Free tier keeps the same daily rules.</li>
            <li>Run Humanize and wait for the result.</li>
            <li>Review the output, adjust as needed, then copy.</li>
            <li>
              Repeat until the draft meets your standard. The free tier has daily caps; Pro raises limits and
              unlocks Paraphraser, Citations, and the full toolbox.
            </li>
          </ol>
        </Section>

        <Section title="Benefits">
          <ul className="list-disc space-y-2 pl-5">
            <li>Less generic AI tone, more of your voice</li>
            <li>Fewer repetitive robot phrases</li>
            <li>Works for school or work when your rules allow it</li>
            <li>Faster than rewriting every sentence from scratch</li>
            <li>Keeps structure steady so your argument stays intact</li>
          </ul>
        </Section>

        <Section title="Features">
          <ul className="list-disc space-y-2 pl-5">
            <li>Paste your text, pick a level, run Humanize. The flow stays simple end to end.</li>
            <li>Runs in standard browsers on phone and desktop</li>
            <li>
              Free tier: all humanizer levels, fair daily limits, 200 words per run. Paid plans add bigger caps
              and extra tools
            </li>
            <li>Do not paste passwords or sensitive credentials into the tool.</li>
          </ul>
        </Section>

        <Section title="Why humanize AI drafts">
          <p>
            Readers stay engaged when writing feels personal. Humanizing smooths awkward phrasing and repetitive
            AI rhythm, especially alongside your own edits and real citations.
          </p>
        </Section>

        <Section title="Who uses this">
          <p className="mb-3">
            Students, writers, marketers, developers, researchers, teachers, and anyone refining AI generated
            tone before publishing or turning work in.
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

        <Section title="Readers, search, and clarity">
          <p>
            Clear copy keeps readers engaged. Search engines favor helpful content. Humanizing supports both; it
            does not replace research or original thinking.
          </p>
        </Section>

        <Section title="Who else uses Ladybug">
          <ul className="list-disc space-y-2 pl-5">
            <li>Creators, bloggers, reporters</li>
            <li>Growth and marketing teams</li>
            <li>Students refining their own voice</li>
            <li>Product and design teams polishing microcopy</li>
            <li>Retail, HR, social, ecommerce, and legal teams that pair output with professional review</li>
          </ul>
        </Section>

        <Section title="Before you go">
          <p>
            Do not paste highly sensitive data into the humanizer. For billing and account security, use
            Settings while signed in. Need help? Contact us through the footer.
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
                Yes. A free tier includes daily limits. Pro adds higher caps, more tools, and a smoother workflow
                on long projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">How fast is humanization?</h4>
              <p className="mt-2">
                Longer passages take more time. Stay on the page until processing finishes. If a run times out,
                split the text into a shorter chunk and try again.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Do AI detectors always work?</h4>
              <p className="mt-2">
                No. Models change, false positives happen, and instructors still apply judgment. Follow
                integrity rules and disclose AI use whenever your institution requires it.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Can I use this on mobile?</h4>
              <p className="mt-2">Yes. The layout works on phones and tablets.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Do I need an account for the free tier?</h4>
              <p className="mt-2">
                You can try the tool within limits before creating an account. Signing in keeps your usage
                consistent across sessions and devices.
              </p>
            </div>
          </div>
        </Section>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50/80 px-6 py-8 text-center">
          <p className="text-sm font-semibold text-gray-900">Ladybug AI™</p>
          <p className="mt-2 text-sm text-gray-600">
            Humanizer, Paraphraser, Citations, and more in one place for a focused workflow.
          </p>
        </div>
      </div>
    </article>
  )
}
