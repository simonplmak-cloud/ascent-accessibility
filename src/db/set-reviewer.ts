import { query } from "./index";

// Grants the reviewer role to a user by email. Usage:
//   pnpm db:set-reviewer reviewer@partner.org
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: pnpm db:set-reviewer <email>");
    process.exit(1);
  }

  const rows = await query<{ id: string; email: string; role: string }>(
    "UPDATE user SET role = 'reviewer' WHERE email = $email RETURN AFTER",
    { email },
  );

  if (rows.length === 0) {
    console.error(`No user found with email "${email}"`);
    process.exit(1);
  }

  const user = rows[0]!;
  console.log(`Set role=reviewer for ${user.email} (${user.id})`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to set reviewer role:", error);
  process.exit(1);
});
