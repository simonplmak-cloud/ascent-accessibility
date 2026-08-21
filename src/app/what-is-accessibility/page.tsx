import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "What is web accessibility?",
  description:
    "A plain-language introduction to web accessibility for NGOs and government — what it means, who it affects, why it matters, and how to start. No jargon.",
  alternates: { canonical: "/what-is-accessibility" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-terminal-fg">{title}</h2>
      <div className="mt-3 font-sans leading-7 text-terminal-muted">{children}</div>
    </section>
  );
}

export default function WhatIsAccessibilityPage() {
  return (
    <PageShell width="3xl">
      <PageHeading>What is web accessibility?</PageHeading>
      <MutedText className="mt-4">
        A plain-language introduction — no jargon, no prior knowledge needed.
      </MutedText>

      <Section title="The short answer">
        <p>
          Web accessibility means that everyone can use your website — including people with
          disabilities. A person who is blind, has low vision, cannot hear, has limited movement,
          or finds some content hard to understand should still be able to read, navigate, and
          use what you publish.
        </p>
        <p className="mt-3">
          It is not a special feature for a few people. It is simply a website that works for
          everyone.
        </p>
      </Section>

      <Section title="Who it affects">
        <p>
          Around one in six people live with a disability. Barriers can be visual, hearing,
          motor, or cognitive — and they can be permanent (blindness), temporary (a broken arm),
          or situational (bright sunlight on a phone screen, or holding a baby).
        </p>
        <p className="mt-3">
          Designing for people with disabilities usually makes things better for everyone.
        </p>
      </Section>

      <Section title="Why it matters">
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="text-terminal-fg">Reach.</span> You serve your whole community, not
            just part of it.
          </li>
          <li>
            <span className="text-terminal-fg">It is the right thing.</span> Everyone deserves
            equal access to public information and services.
          </li>
          <li>
            <span className="text-terminal-fg">It is often required.</span> Many governments and
            funders ask for it by law or policy.
          </li>
        </ul>
      </Section>

      <Section title="The basics, in four ideas (POUR)">
        <p>WCAG — the web accessibility standard — groups everything into four principles:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            <span className="text-terminal-fg">Perceivable.</span> People can see or hear the
            content (for example, images have text alternatives).
          </li>
          <li>
            <span className="text-terminal-fg">Operable.</span> People can use it (for example,
            everything works with a keyboard).
          </li>
          <li>
            <span className="text-terminal-fg">Understandable.</span> People can follow it (clear
            language, predictable behaviour).
          </li>
          <li>
            <span className="text-terminal-fg">Robust.</span> It works with the tools people use,
            now and in the future.
          </li>
        </ul>
      </Section>

      <Section title="The tools people use">
        <p>
          People browse the web in many ways: a screen reader (reads the page aloud), screen
          magnification, keyboard-only navigation, voice control, or a switch device. A good
          website works with all of them.
        </p>
      </Section>

      <Section title="The standard: WCAG">
        <p>
          WCAG (Web Content Accessibility Guidelines) is the international standard. It has three
          levels — A, AA, and AAA. Most laws and policies ask for level AA. This site itself
          targets AAA, the highest level.{" "}
          <InlineLink href="/standards">Browse the WCAG criteria</InlineLink> or look up any term
          in our <InlineLink href="/glossary">plain-language glossary</InlineLink>.
        </p>
      </Section>

      <Section title="How to start">
        <p>
          You do not need to be an expert. Run a free scan of your site to see where you stand,
          or take the free course to learn at your own pace.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink href="/assess">Scan your site free</ButtonLink>
          <ButtonLink href="/training" variant="outline">
            Take the free course
          </ButtonLink>
          <ButtonLink href="/glossary" variant="outline">
            Open the glossary
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}
