export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Resources</h1>
      <ul className="mt-6 list-disc space-y-3 pl-6 text-neutral-700">
        <li>
          <a
            href="https://www.w3.org/TR/WCAG22/"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            WCAG 2.2 Specification (W3C)
          </a>
        </li>
        <li>
          <a
            href="https://www.w3.org/WAI/WCAG22/quickref/"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            How to Meet WCAG 2.2 (Quick Reference)
          </a>
        </li>
        <li>
          <a
            href="https://www.section508.gov/"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            Section 508 Standards
          </a>
        </li>
      </ul>
      <p className="mt-6 text-neutral-600">
        Start with a self-assessment using our{" "}
        <a href="/assess" className="underline underline-offset-4">
          accessibility tool
        </a>
        , then use these references to guide your remediation.
      </p>
    </div>
  );
}
