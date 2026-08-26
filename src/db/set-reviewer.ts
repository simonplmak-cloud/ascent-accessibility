import { query } from "./index";

// Grants the reviewer role to an account by email. Usage:
//   pnpm db:set-reviewer reviewer@partner.org
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: pnpm db:set-reviewer <email>");
    process.exit(1);
  }

  const emails = await query<{ user: string; email: string }>(
    "SELECT user, email FROM user_email WHERE email = $email LIMIT 1",
    { email },
  );
  if (emails.length === 0) {
    console.error(`No account found with email "${email}"`);
    process.exit(1);
  }

  const accountId = emails[0]!.user;
  const rows = await query<{ id: string }>(
    "UPDATE user SET role = 'reviewer' WHERE id = type::record($id) RETURN AFTER",
    { id: accountId },
  );
  const user = rows[0]!;
  console.log(`Set role=reviewer for ${email} (${user.id})`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to set reviewer role:", error);
  process.exit(1);
});
