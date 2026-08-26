import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation primitives. Use this `Link` (instead of next/link) for
// internal links so the active locale prefix is preserved across navigations.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
