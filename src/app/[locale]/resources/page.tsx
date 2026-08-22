import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";

export default function ResourcesPage() {
  return (
    <PageShell>
      <PageHeading>Resources</PageHeading>
      <ul className="mt-6 list-disc space-y-3 pl-6 font-sans text-terminal-fg">
        <li>
          <a
            href="https://www.w3.org/TR/WCAG22/"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            WCAG 2.2 Specification (W3C)<span className="sr-only"> (opens in a new window)</span>
          </a>
        </li>
        <li>
          <a
            href="https://www.w3.org/WAI/WCAG22/quickref/"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            How to Meet WCAG 2.2 (Quick Reference)<span className="sr-only"> (opens in a new window)</span>
          </a>
        </li>
        <li>
          <a
            href="https://www.section508.gov/"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            Section 508 Standards<span className="sr-only"> (opens in a new window)</span>
          </a>
        </li>
      </ul>
      <MutedText className="mt-6">
        Start with a self-assessment using our{" "}
        <InlineLink href="/assess">accessibility tool</InlineLink>
        , or learn more in our{" "}
        <InlineLink href="/training">training path</InlineLink>
        .
      </MutedText>
    </PageShell>
  );
}
