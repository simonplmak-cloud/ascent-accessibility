import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({
    user: user ? { id: user.id, email: user.email, name: user.name } : null,
  });
}
