import { NextResponse } from "next/server";
import { evidenceRepository } from "@/db/repository";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; evidenceId: string }> },
) {
  const { evidenceId } = await params;
  const evidence = await evidenceRepository.findById(decodeURIComponent(evidenceId));
  if (!evidence) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }
  const body = Buffer.from(evidence.image, "base64");
  return new NextResponse(body, {
    headers: {
      "Content-Type": evidence.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
