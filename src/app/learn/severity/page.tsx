import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";

const levels = [
  { level: "critical", color: "text-terminal-critical", description: "A core task or essential content is blocked, with no reasonable workaround." },
  { level: "serious", color: "text-terminal-serious", description: "A significant barrier or partial blockage — the task is possible but difficult." },
  { level: "moderate", color: "text-terminal-moderate", description: "Meaningful friction, but the task remains achievable." },
  { level: "minor", color: "text-terminal-muted", description: "Limited impact or a nuisance, though it may still fail conformance." },
];

export default function SeverityLearnPage() {
  return (
    <PageShell>
      <PageHeading>Understanding severity</PageHeading>

      <MutedText className="mt-4">
        Each finding is graded by its impact on real users, from critical to minor.
      </MutedText>

      <ul className="mt-6 space-y-3">
        {levels.map((item) => (
          <li key={item.level} className="rounded border border-terminal-border bg-terminal-surface p-4">
            <span className={`font-mono font-semibold ${item.color}`}>{item.level}</span>
            <span className="mt-1 block font-mono text-terminal-muted">{item.description}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">
        Severity is not the conformance level
      </h2>
      <p className="mt-3 font-mono text-terminal-muted">
        Do not read &ldquo;critical&rdquo; as &ldquo;Level A&rdquo; or &ldquo;minor&rdquo; as
        &ldquo;Level AAA&rdquo;. The conformance level (A/AA/AAA) describes how strict a
        success criterion is. The severity describes how much a specific violation affects
        users on your site. A single Level A criterion can produce a critical finding; a
        Level AAA criterion can produce a minor one. They answer different questions.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">How the score works</h2>
      <p className="mt-3 font-mono text-terminal-muted">
        The overall score starts at 100 and subtracts a fixed weight per finding:
        critical −10, serious −5, moderate −2, minor −0.5, clamped at 0. A score of 90 or
        above is a pass, 70–89 is partial, and below 70 is a fail.
      </p>
    </PageShell>
  );
}
