import { NextResponse } from "next/server";
import { trainingRepository } from "@/db/repository";
import { renderCertificatePdf } from "@/lib/training/certificate-document";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const credential = await trainingRepository.getCredential(id);
  if (!credential) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });

  const pdf = await renderCertificatePdf(credential);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificate-${credential.path}.pdf"`,
    },
  });
}
