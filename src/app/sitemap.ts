import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/pricing",
    "/standards",
    "/methodology",
    "/faq",
    "/glossary",
    "/what-is-accessibility",
    "/for-government",
    "/for-ngos",
    "/esg",
    "/human-review",
    "/roadmap",
    "/remediation",
    "/understanding",
    "/guides",
    "/guides/accessibility-audit",
    "/guides/conformance-report",
    "/guides/vpat",
    "/guides/esg-accessibility",
    "/compliance",
    "/contact",
    "/donate",
    "/assess",
    "/training",
    "/training/faq",
    "/api-keys",
    "/accessibility-statement",
    "/terms",
    "/privacy",
    "/sla",
    "/refund",
  ];

  // Stable timestamp so the sitemap's lastmod doesn't churn on every build.
  const lastModified = new Date("2026-08-25");

  return staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
