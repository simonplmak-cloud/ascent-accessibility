# 02b — User journey flows

Mermaid flows for the four primary journeys. Each step maps to a route in
`02-information-architecture.md`.

## Visitor → first scan (login-gated)

```mermaid
flowchart LR
  home["/ (home)"] --> cta["{Run a scan}"]
  cta --> signin["/sign-in — login protection"]
  signin --> assess["/assess — enter URL + standard"]
  assess --> run["scan streams (log panel)"]
  run --> report["/auditor/report/:id — score + findings"]
```

## Learner → certificate

```mermaid
flowchart LR
  entry["/training (or home CTA)"] --> cont["Continue learning / pick path"]
  cont --> path["/training/paths/:id — overview"]
  path --> lesson["/training/lessons/:id — content + Complete"]
  lesson --> quiz["/training/quizzes/:id — Q 3 of 8"]
  quiz --> res["results + retry-missed"]
  res --> cert["/training/certificate/:id — {Download PDF}"]
  signin["sign-in gate (progress/quiz)"] -.-> lesson
```

## Auditor → report

```mermaid
flowchart LR
  signin["/sign-in"] --> ws["/auditor — queue health + quick actions"]
  ws --> scan["/assess — new scan (scope: single | whole)"]
  scan --> review["/auditor/review — master-detail + bulk resolve"]
  review --> report["/auditor/report/:id — traceability chain"]
  report --> export["{Download PDF}"]
```

## Buyer → human review / donation

```mermaid
flowchart LR
  pricing["/pricing or /human-review"] --> quote["contact (quote)"]
  quote --> donate["/donate (Stripe)"]
  trust["/methodology · /validation · /regulations"] -.-> pricing
```

## Cross-journey hub

```mermaid
flowchart TB
  home["/ home — dual CTA"]
  home --> assess["Run a scan"]
  home --> train["Start training"]
  home --> learn["/standards — WCAG reference"]
  assess --> auditor["/auditor (signed-in)"]
  train --> cert["certificate"]
  auditor --> report["shareable report (public)"]
```
