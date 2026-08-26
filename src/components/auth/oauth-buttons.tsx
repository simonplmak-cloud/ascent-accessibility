"use client";

import { useTranslations } from "next-intl";
import { ProviderButton } from "./provider-button";
import { GitHubIcon, GoogleIcon, MicrosoftIcon } from "./brand-icons";
import { useGoogleSignIn } from "./google-button";

export function OAuthButtons({ next }: { next?: string }) {
  const t = useTranslations("auth");
  const google = useGoogleSignIn();
  const suffix = next ? `?next=${encodeURIComponent(next)}` : "";

  const buttons = [
    {
      key: "github",
      logo: <GitHubIcon />,
      label: t("continueWith", { provider: "GitHub" }),
      href: `/api/auth/oauth/github${suffix}`,
    },
    ...(google.available
      ? [
          {
            key: "google",
            logo: <GoogleIcon />,
            label: t("continueWith", { provider: "Google" }),
            onClick: google.signIn,
          },
        ]
      : []),
    {
      key: "microsoft",
      logo: <MicrosoftIcon />,
      label: t("continueWith", { provider: "Microsoft" }),
      href: `/api/auth/oauth/microsoft${suffix}`,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {buttons.map((b) =>
        "href" in b ? (
          <ProviderButton key={b.key} logo={b.logo} label={b.label} href={b.href} />
        ) : (
          <ProviderButton key={b.key} logo={b.logo} label={b.label} onClick={b.onClick} />
        ),
      )}
    </div>
  );
}
