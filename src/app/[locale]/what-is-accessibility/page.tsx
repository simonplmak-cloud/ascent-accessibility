import { redirect } from "next/navigation";

// Consolidated into /learn (flat redesign); middleware re-applies the locale.
export default function RedirectPage() {
  redirect("/learn");
}
