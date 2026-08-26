import { NextResponse } from "next/server";
import { query } from "@/db";
import { getSessionUser } from "@/server/auth";
import { AI_PROVIDERS, getProvider } from "@/lib/ai-review/providers";

const DEFAULT_PROVIDER = "openrouter";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const rows = await query<{
    aiProvider: string | null;
    aiBaseUrl: string | null;
    aiVisionModel: string | null;
    aiAudioModel: string | null;
  }>(
    "SELECT aiProvider, aiBaseUrl, aiVisionModel, aiAudioModel FROM user WHERE id = type::record($id) LIMIT 1",
    { id: user.id },
  );
  const row = rows[0];
  return NextResponse.json({
    provider: row?.aiProvider ?? DEFAULT_PROVIDER,
    baseUrl: row?.aiBaseUrl ?? null,
    visionModel: row?.aiVisionModel ?? null,
    audioModel: row?.aiAudioModel ?? null,
    providers: AI_PROVIDERS,
  });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    provider?: unknown;
    baseUrl?: unknown;
    visionModel?: unknown;
    audioModel?: unknown;
  };
  const providerId = typeof body.provider === "string" && body.provider ? body.provider : DEFAULT_PROVIDER;
  const baseUrl = typeof body.baseUrl === "string" ? body.baseUrl.trim() : null;
  const visionModel = typeof body.visionModel === "string" && body.visionModel ? body.visionModel : null;
  const audioModel = typeof body.audioModel === "string" && body.audioModel ? body.audioModel : null;

  const provider = getProvider(providerId);
  if (!provider) {
    return NextResponse.json({ code: "INVALID_PROVIDER" }, { status: 400 });
  }
  if (providerId === "custom" && (!baseUrl || !/^https:\/\//i.test(baseUrl))) {
    return NextResponse.json({ code: "INVALID_BASE_URL" }, { status: 400 });
  }
  // `custom` has no curated catalog — accept any model id the user supplies.
  if (providerId !== "custom") {
    if (visionModel && !provider.visionModels.some((m) => m.id === visionModel)) {
      return NextResponse.json({ code: "INVALID_MODEL" }, { status: 400 });
    }
    if (audioModel && !provider.audioModels.some((m) => m.id === audioModel)) {
      return NextResponse.json({ code: "INVALID_MODEL" }, { status: 400 });
    }
  }

  const sets = ["aiProvider = $provider"];
  const bindings: Record<string, unknown> = { provider: providerId, id: user.id };
  if (baseUrl) {
    sets.push("aiBaseUrl = $baseUrl");
    bindings.baseUrl = baseUrl;
  } else {
    sets.push("aiBaseUrl = NONE");
  }
  if (visionModel) {
    sets.push("aiVisionModel = $visionModel");
    bindings.visionModel = visionModel;
  } else {
    sets.push("aiVisionModel = NONE");
  }
  if (audioModel) {
    sets.push("aiAudioModel = $audioModel");
    bindings.audioModel = audioModel;
  } else {
    sets.push("aiAudioModel = NONE");
  }
  await query(`UPDATE user SET ${sets.join(", ")} WHERE id = type::record($id)`, bindings);
  return NextResponse.json({ provider: providerId, baseUrl, visionModel, audioModel });
}
