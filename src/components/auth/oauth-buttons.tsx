"use client";

import { useTranslations } from "next-intl";
import { ProviderButton } from "./provider-button";
import { GitHubIcon, GoogleIcon, MicrosoftIcon } from "./brand-icons";

// All three providers use the same server-side authorization-code flow
// (`/api/auth/oauth/:provider` → provider → callback). Google no longer needs a
// special client-side button.
export function OAuthButtons({ next }: { next?: string }) {
  const t = useTranslations("auth");
  const suffix = next ? `?next=${encodeURIComponent(next)}` : "";

  const buttons = [
    {
      key: "github",
      logo: <GitHubIcon />,
      label: t("continueWith", { provider: "GitHub" }),
      href: `/api/auth/oauth/github${suffix}`,
    },
    {
      key: "google",
      logo: <GoogleIcon />,
      label: t("continueWith", { provider: "Google" }),
      href: `/api/auth/oauth/google${suffix}`,
    },
    {
      key: "microsoft",
      logo: <MicrosoftIcon />,
      label: t("continueWith", { provider: "Microsoft" }),
      href: `/api/auth/oauth/microsoft${suffix}`,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {buttons.map((b) => (
        <ProviderButton key={b.key} logo={b.logo} label={b.label} href={b.href} />
      ))}
    </div>
  );
}
