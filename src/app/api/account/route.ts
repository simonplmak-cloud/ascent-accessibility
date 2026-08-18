import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  return NextResponse.json({ email: user.email, verified: user.verified });
}
