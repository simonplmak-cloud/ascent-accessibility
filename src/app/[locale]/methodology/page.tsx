import { redirect } from "next/navigation";

// Consolidated into /guides (flat redesign); middleware re-applies the locale.
export default function RedirectPage() {
  redirect("/guides");
}
