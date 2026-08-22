"use client";

import { useTranslations } from "next-intl";
import { Tabs } from "@/components/ui/tabs";
import { Disclosure } from "@/components/ui/disclosure";

export interface StandardSc {
  num: string;
  title: string;
  level: string;
  specUrl: string;
  understandingUrl: string;
}

export interface GuidelineGroup {
  num: string;
  name: string;
  scs: StandardSc[];
}

export interface PrincipleGroup {
  num: number;
  name: string;
  guidelines: GuidelineGroup[];
}

export interface StandardTree {
  id: string;
  name: string;
  version: string;
  principles: PrincipleGroup[];
}

const LEVEL_STYLE: Record<string, string> = {
  A: "text-terminal-pass",
  AA: "text-terminal-serious",
  AAA: "text-terminal-moderate",
};

function ScList({ scs }: { scs: StandardSc[] }) {
  const t = useTranslations("standards");
  return (
    <ul className="mt-2 divide-y divide-terminal-border rounded border border-terminal-border">
      {scs.map((sc) => (
        <li key={sc.num} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2">
          <span
            aria-hidden="true"
            className={`w-8 font-sans text-xs font-bold ${LEVEL_STYLE[sc.level] ?? "text-terminal-muted"}`}
          >
            {sc.level}
          </span>
          <a
            href={sc.specUrl}
            target="_blank"
            rel="noreferrer"
            className="font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
          >
            {sc.num}
            <span className="sr-only">{t("opensNewWindow")}</span>
          </a>
          <span className="font-sans text-sm text-terminal-fg">{sc.title}</span>
          <a
            href={sc.understandingUrl}
            target="_blank"
            rel="noreferrer"
            className="font-sans text-xs text-terminal-muted underline-offset-4 hover:text-terminal-fg hover:underline"
          >
            {t("understanding")}
            <span className="sr-only">{t("opensNewWindow")}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Principle({ principle }: { principle: PrincipleGroup }) {
  return (
    <section aria-labelledby={`p-${principle.num}`} className="mt-6 first:mt-0">
      <h3 id={`p-${principle.num}`} className="font-display text-lg font-semibold text-terminal-fg">
        {principle.num}. {principle.name}
      </h3>
      <div className="mt-3 space-y-2">
        {principle.guidelines.map((guideline) => (
          <Disclosure
            key={guideline.num}
            as="h4"
            title={
              <>
                {guideline.num} {guideline.name}{" "}
                <span className="font-normal text-terminal-muted">({guideline.scs.length})</span>
              </>
            }
          >
            <ScList scs={guideline.scs} />
          </Disclosure>
        ))}
      </div>
    </section>
  );
}

export function StandardsView({
  standards,
  defaultId,
}: {
  standards: StandardTree[];
  defaultId?: string;
}) {
  const t = useTranslations("standards");
  return (
    <div className="mt-10">
      <Tabs
        label={t("tabsLabel")}
        defaultId={defaultId}
        tabs={standards.map((standard) => ({ id: standard.id, label: standard.name }))}
      >
        {(activeId) => {
          const standard = standards.find((s) => s.id === activeId);
          if (!standard) return null;
          return (
            <div>
              {standard.principles.map((principle) => (
                <Principle key={principle.num} principle={principle} />
              ))}
            </div>
          );
        }}
      </Tabs>
    </div>
  );
}
