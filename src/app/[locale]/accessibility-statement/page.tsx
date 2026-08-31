import { redirect } from "next/navigation";

// Consolidated into /legal (flat redesign); middleware re-applies the locale.
export default function RedirectPage() {
  redirect("/legal");
}
