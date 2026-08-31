import { redirect } from "next/navigation";

// Consolidated into /who-we-serve (flat redesign); middleware re-applies the locale.
export default function RedirectPage() {
  redirect("/who-we-serve");
}
