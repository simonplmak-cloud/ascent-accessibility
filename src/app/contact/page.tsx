export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Contact us</h1>
      <p className="mt-4 font-mono text-terminal-muted">
        Want help improving your accessibility, or a deeper audit of your site? Get in
        touch.
      </p>
      <address className="mt-6 not-italic font-mono text-terminal-fg">
        <p>
          Email:{" "}
          <a href="mailto:hello@ascent.partners" className="underline underline-offset-4">
            hello@ascent.partners
          </a>
        </p>
        <p className="mt-2">
          Website:{" "}
          <a
            href="https://www.ascent.partners"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.ascent.partners
          </a>
        </p>
      </address>
    </div>
  );
}
