import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/pricing",
    "/learn",
    "/learn/wcag",
    "/learn/severity",
    "/learn/remediation",
    "/learn/screen-readers",
    "/standards",
    "/methodology",
    "/faq",
    "/resources",
    "/contact",
    "/donate",
    "/assess",
    "/history",
    "/api-keys",
    "/accessibility-statement",
    "/terms",
    "/privacy",
    "/sla",
    "/refund",
  ];

  return staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
