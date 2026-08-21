import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/server/auth";
import { resolveOwnerAi } from "@/server/byok";
import { getProvider, DEFAULT_VISION_MODEL } from "@/lib/ai-review/providers";
import { suggestFix } from "@/lib/ai-fix";

const SuggestFixRequestSchema = z.object({
  ruleId: z.string().min(1),
  description: z.string().min(1),
  recommendation: z.string().min(1),
  sc: z.string().optional(),
  html: z.string().max(2000).optional(),
  target: z.string().max(500).optional(),
});

// A8: supervised AI fix suggestions. Requires the caller's own BYOK key (never a
// platform key), OpenAI-compatible providers only in v1, and never auto-applies —
// the suggestion is returned as text for the human to review and apply.
export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = SuggestFixRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: parsed.error.message },
      { status: 400 },
    );
  }

  const owner = await resolveOwnerAi(sessionUser.id);
  if (!owner) {
    return NextResponse.json(
      {
        code: "NO_AI_KEY",
        message:
          "Fix suggestions need your own AI review key (BYOK). Add one under Account → AI review key.",
      },
      { status: 400 },
    );
  }

  const provider = getProvider(owner.providerId);
  if (!provider || provider.apiFormat !== "openai") {
    return NextResponse.json(
      {
        code: "PROVIDER_UNSUPPORTED",
        message:
          "Fix suggestions currently support OpenAI-compatible providers (OpenRouter, OpenAI, Qwen/DashScope, or a custom endpoint).",
      },
      { status: 400 },
    );
  }

  const suggestion = await suggestFix({
    apiKey: owner.apiKey,
    baseUrl: owner.baseUrl ?? provider.baseUrl,
    model: owner.visionModelId ?? provider.visionModels[0]?.id ?? DEFAULT_VISION_MODEL,
    finding: parsed.data,
  });

  if (!suggestion) {
    return NextResponse.json(
      { code: "AI_UNAVAILABLE", message: "The AI provider did not return a usable suggestion. Try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ suggestion });
}
