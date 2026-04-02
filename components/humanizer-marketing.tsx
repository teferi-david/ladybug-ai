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
          Learn more about the Ladybug AI Humanizer —{' '}
          <Link
            href="/ai-humanizer"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/90"
          >
            AI humanizer landing page
          </Link>
        </p>

        <Section title="Humanize AI content — natural, undetectable-style output">
          <p>
            Humanize AI text and bypass Turnitin, GPTZero, and major AI detectors — 100% guaranteed. Ladybug AI
            rewrites AI-generated drafts into natural, human-like prose that reads clearly and resonates with
            real readers. Built for searches like how to bypass Turnitin, Turnitin AI detection, GPTZero
            checker, undetectable AI, AI detector bypass, and beat Turnitin — so your work feels authentic,
            polished, and ready to pass AI scanning tools.
          </p>
          <p>
            The Ladybug AI humanizer adds a natural human touch to AI-generated text so it resonates with
            readers and reads less like a machine. Our AI-to-human text flow keeps your meaning while
            smoothing robotic phrasing — ideal for essays, posts, and professional drafts.
          </p>
          <p>
            For context on <strong>Turnitin</strong>, AI detection, and responsible use, see our{' '}
            <Link
              href="/bypass-turnitin"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/90"
            >
              AI humanizer &amp; Turnitin guide
            </Link>
            .
          </p>
          <p>
            Humanize drafts produced by ChatGPT, Gemini, Claude, and other assistants. Output stays
            consistent in tone and structure, with the goal of passing common AI-detector checks when used
            responsibly and in line with your institution&apos;s policies.
          </p>
        </Section>

        <Section title="Best AI humanizer — authentic, human-like content">
          <Subheading>Designed for strong detector compatibility</Subheading>
          <p>
            Our humanizer is tuned to work alongside workflows that care about detector scores — including
            tools like ZeroGPT, GPTZero, Copyleaks, Quillbot, Turnitin-style checks, and similar services
            (results vary by detector and update cycle).
          </p>
          <Subheading>Original &amp; authentic tone</Subheading>
          <p>
            Get human-like content that reads original to your voice. The tool focuses on clarity and
            natural word choice so your ideas stay front and center — not generic filler.
          </p>
          <Subheading>Instant synonym &amp; refinement choices</Subheading>
          <p>
            Level up word choice with smarter alternatives that fit your context. Polish phrasing while
            keeping your meaning — great for tightening sentences before you submit or publish.
          </p>
          <Subheading>Rephrase — refine — shine</Subheading>
          <p>
            Rewrite sections that still feel &quot;AI-ish&quot; into a more natural, polished version.
            Adjust tone from casual to professional while preserving relevance and structure.
          </p>
        </Section>

        <Section title="Modes &amp; writing levels">
          <p>
            Choose levels that match your needs — Basic and Advanced are free (with fair daily limits);
            Academic (Turnitin) is included on paid plans. Different modes help you aim for the right balance
            of simplicity and depth.
          </p>
          <Subheading>SEO-friendly phrasing</Subheading>
          <p>
            Important keywords can be retained while the surrounding text reads more naturally — helpful
            when you need discoverable content that still sounds human.
          </p>
          <Subheading>Error-aware output</Subheading>
          <p>
            Our pipeline emphasizes clear vocabulary and cleaner grammar so your humanized text reads
            professionally and is easier to trust at a glance.
          </p>
        </Section>

        <Section title="What is &quot;Humanize AI&quot;?">
          <p>
            Humanize AI means rewriting machine-generated text so it sounds more human: conversational where
            appropriate, clear, and relatable — without a stiff robotic tone. Ladybug AI is built as a focused
            humanizer / AI-to-human converter for students, creators, and professionals.
          </p>
          <p>
            We use modern language models and heuristics to preserve meaning, context, and structure while
            improving flow — always review output for accuracy and policy compliance.
          </p>
        </Section>

        <Section title="How to humanize text (quick steps)">
          <ol className="list-decimal space-y-3 pl-5">
            <li>Open Ladybug AI in your browser.</li>
            <li>Paste your AI-generated text into the input area.</li>
            <li>Pick a level: Basic or Advanced (free), or Academic (Turnitin) on a paid plan.</li>
            <li>Click Humanize and wait for processing.</li>
            <li>Review the output, copy, and edit as needed.</li>
            <li>
              Run again until you&apos;re happy — free tier has daily limits; a 1-day Pro trial removes the
              cap on the humanizer and opens Paraphraser, Citations, and other tools.
            </li>
          </ol>
        </Section>

        <Section title="Benefits">
          <ul className="list-disc space-y-2 pl-5">
            <li>More natural tone for AI-assisted drafts</li>
            <li>Helps reduce repetitive &quot;AI voice&quot; patterns</li>
            <li>Strong fit for school and professional workflows (where permitted)</li>
            <li>Saves editing time vs. rewriting everything by hand</li>
            <li>Consistent structure — meaning preserved where possible</li>
          </ul>
        </Section>

        <Section title="Features">
          <ul className="list-disc space-y-2 pl-5">
            <li>Simple interface — paste, choose level, humanize</li>
            <li>Works in modern browsers; responsive layout</li>
            <li>
              Free tier: Basic &amp; Advanced with fair daily limits; paid plans add Academic (Turnitin),
              higher word caps, and companion tools
            </li>
            <li>Privacy-minded: treat your text as sensitive; don&apos;t paste secrets you can&apos;t share</li>
          </ul>
        </Section>

        <Section title="Why humanize AI text?">
          <p>
            Readers engage more with content that feels personal and clear. Humanizing can also help address
            awkward phrasing, cultural tone, and overly uniform AI rhythm — when combined with your own
            review and citations.
          </p>
        </Section>

        <Section title="Who it&apos;s for">
          <p className="mb-3">Students, writers, marketers, developers, researchers, educators, and anyone polishing AI drafts.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Content creators &amp; bloggers</li>
            <li>Students &amp; researchers</li>
            <li>Business &amp; email communication</li>
            <li>Social &amp; community managers</li>
            <li>Freelancers &amp; agencies</li>
          </ul>
        </Section>

        <Section title="Privacy &amp; support">
          <p>
            Your drafts are processed to generate output — follow your school or workplace rules on using
            AI tools. For billing and account questions, use Settings after you sign in.
          </p>
        </Section>

        <Section title="Diverse modes and writing styles">
          <p>
            Pick a level that fits your assignment or audience. Higher levels (Pro) aim for more nuanced
            vocabulary and structure — always review against your course or workplace guidelines.
          </p>
          <p>
            Whether you need straightforward clarity or a more advanced academic tone, Ladybug AI helps you
            steer the output before you finalize and cite sources yourself.
          </p>
        </Section>

        <Section title="Why humanizing matters for readers &amp; search">
          <p>
            Natural language tends to engage readers longer. Search engines also favor helpful,
            people-first content — humanizing can complement (not replace) solid research and original
            insight.
          </p>
        </Section>

        <Section title="Potential users — almost everyone with text">
          <ul className="list-disc space-y-2 pl-5">
            <li>Content creators, bloggers, and journalists</li>
            <li>Marketing and growth teams polishing campaign copy</li>
            <li>Students balancing clarity with academic rules</li>
            <li>Developers and designers improving UX copy and in-product text</li>
            <li>PR, social media, e-commerce, HR, legal (with professional review), and more</li>
          </ul>
        </Section>

        <Section title="Experience humanized AI content">
          <p>
            We take privacy seriously: avoid pasting highly sensitive secrets. For billing and accounts, use
            Settings when signed in. Need help? Reach out via the contact email in the site footer.
          </p>
        </Section>

        <Section title="Frequently asked questions">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900">What does humanize AI text mean?</h4>
              <p className="mt-2">
                It means rewriting AI output to sound more natural and human — clearer flow, fewer robotic
                tells, same core ideas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Is Ladybug AI free?</h4>
              <p className="mt-2">
                Yes — a free tier is available with daily limits. Pro adds higher limits, extra levels, and
                more tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">How fast is humanization?</h4>
              <p className="mt-2">
                Longer passages can take more time. Stay on the page until processing finishes; very long
                inputs may time out — try a shorter excerpt.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Do AI detectors always work?</h4>
              <p className="mt-2">
                Detectors change over time and can be imperfect. Always follow academic integrity rules and
                disclose AI use where required.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Can I use this on mobile?</h4>
              <p className="mt-2">Yes — the site is responsive and works on phones and tablets.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Do I need an account for the free tier?</h4>
              <p className="mt-2">
                You can try the humanizer without signing in within fair daily limits; signing in helps sync
                usage consistently across sessions.
              </p>
            </div>
          </div>
        </Section>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50/80 px-6 py-8 text-center">
          <p className="text-sm font-semibold text-gray-900">Ladybug AI™</p>
          <p className="mt-2 text-sm text-gray-600">
            Your AI writing companion — Humanizer, Paraphraser, Citations, and more in one place.
          </p>
        </div>
      </div>
    </article>
  )
}
