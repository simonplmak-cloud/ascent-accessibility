import { getSessionUser } from "@/server/auth";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { ProfileForm } from "@/components/account/profile-form";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  return (
    <PageShell width="3xl">
      <PageHeading>Account</PageHeading>
      <ProfileForm />
    </PageShell>
  );
}
