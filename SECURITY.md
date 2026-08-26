# Security Policy

## Reporting a vulnerability

Security is a priority. If you believe you have found a security vulnerability
in Ascent Accessibility, please report it responsibly.

**Do not open a public issue.** Instead, email the maintainers directly at
<contact@ascent-partners.com> with:

- A description of the vulnerability and its impact.
- Steps to reproduce (or a proof-of-concept).
- Any relevant configuration or environment details.

We will acknowledge your report within 5 business days and keep you informed as
we triage and address it.

## What to look for

This project accepts **user-supplied URLs** for crawling and scanning. Areas of
particular interest include:

- Server-side request forgery (SSRF) via the crawl/scan target.
- Injection or unsafe handling of third-party page content.
- Authentication/authorization flaws in the API, magic-link, or OAuth flows.
- Secrets in code, configuration, or build artifacts.

## Supported versions

Only the latest release on the default branch (`main`) is supported.

## Disclosure

We follow coordinated disclosure: we will fix the issue and publish an advisory,
and we are happy to credit reporters (unless you prefer to remain anonymous).
