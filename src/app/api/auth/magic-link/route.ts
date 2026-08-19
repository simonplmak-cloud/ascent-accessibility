import { NextResponse } from "next/server";
import { z } from "zod";
import { requestMagicLink } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/auth/email";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  next: z.string().max(2048).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const next =
    parsed.data.next?.startsWith("/") && !parsed.data.next.startsWith("//")
      ? parsed.data.next
      : "/site";

  const token = await requestMagicLink(parsed.data.email);
  await sendMagicLinkEmail(parsed.data.email, token, next);

  // Always "ok" — never reveal whether the email exists.
  return NextResponse.json({ ok: true });
}
