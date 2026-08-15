import Link from "next/link";

const readers = [
  { name: "NVDA", platform: "Windows · free", note: "the most widely used open-source screen reader" },
  { name: "JAWS", platform: "Windows · paid", note: "common in enterprise and government" },
  { name: "VoiceOver", platform: "macOS & iOS · built in", note: "Apple's screen reader" },
  { name: "Narrator", platform: "Windows · built in", note: "Microsoft's screen reader" },
  { name: "TalkBack", platform: "Android · built in", note: "Google's screen reader" },
];

export default function ScreenReadersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">
        Reading with a screen reader
      </h1>
      <p className="mt-4 font-mono leading-7 text-terminal-muted">
        A screen reader turns a page into speech or braille and lets a blind or low-vision
        person move around using a keyboard or touch gestures. The five most common ones are:
      </p>

      <ul className="mt-6 space-y-2 font-mono text-terminal-fg">
        {readers.map((reader) => (
          <li key={reader.name} className="rounded border border-terminal-border bg-terminal-surface p-3">
            <span className="font-semibold">{reader.name}</span>
            <span className="text-terminal-muted"> — {reader.platform}, {reader.note}.</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-mono text-xl font-semibold text-terminal-fg">
        What makes a page easy to read
      </h2>
      <ul className="mt-4 list-disc space-y-3 pl-6 font-mono leading-7 text-terminal-muted">
        <li>
          <span className="text-terminal-fg">Headings in order</span> — a clear h1 → h2 → h3
          outline, because every screen reader can jump from heading to heading.
        </li>
        <li>
          <span className="text-terminal-fg">Landmarks</span> — header, navigation, main, and
          footer, so a reader can skip straight to the content.
        </li>
        <li>
          <span className="text-terminal-fg">Descriptive names</span> — every link and button
          announces what it does, not just “click here”.
        </li>
        <li>
          <span className="text-terminal-fg">Labels on everything</span> — form fields have
          labels, images have alt text, tables have row and column headings.
        </li>
        <li>
          <span className="text-terminal-fg">Visible focus</span> — a clear outline on whatever
          is focused, so keyboard users always know where they are.
        </li>
        <li>
          <span className="text-terminal-fg">Live announcements</span> — dynamic changes (like a
          scan finishing) are spoken automatically.
        </li>
      </ul>

      <h2 className="mt-10 font-mono text-xl font-semibold text-terminal-fg">
        How this site is built for them
      </h2>
      <p className="mt-4 font-mono leading-7 text-terminal-muted">
        This tool is written against WCAG 2.2 AAA and is designed to read cleanly in all five
        readers. Pages use a single, ordered heading outline and standard landmarks; the
        assessment form labels every field; results are announced as they appear; and repeated
        actions — like “Open”, “Re-run”, and “Delete” in the history list — carry descriptive
        names such as “Open report for example.com”. You can verify this yourself with the free
        NVDA reader on Windows or VoiceOver on a Mac.
      </p>

      <p className="mt-8 font-mono text-sm text-terminal-fg">
        <Link href="/assess" className="underline underline-offset-4 hover:text-terminal-serious">
          Try the assessment
        </Link>
      </p>
    </div>
  );
}
