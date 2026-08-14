export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Contact us</h1>
      <p className="mt-4 text-neutral-600">
        Want help improving your accessibility, or a deeper audit of your site? Get in
        touch.
      </p>
      <address className="mt-6 not-italic text-neutral-800">
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
