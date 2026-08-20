const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

export interface FetchedMedia {
  data: string; // base64
  mimeType: string;
  format: string; // short extension for OpenAI `input_audio`
}

function detect(url: string, contentType: string | null): { mimeType: string; format: string } {
  const ext = /\.(wav|mp3|m4a|ogg|flac|webm|aac)(\?|$)/i.exec(url)?.[1];
  if (ext) return { mimeType: `audio/${ext === "m4a" ? "mp4" : ext}`, format: ext };
  if (contentType?.startsWith("audio/")) {
    const sub = contentType.slice(6).split(";")[0]!.trim();
    return { mimeType: `audio/${sub}`, format: sub === "mpeg" ? "mp3" : sub };
  }
  return { mimeType: "audio/mpeg", format: "mp3" };
}

// Fetches a media URL and base64-encodes it for a model's audio input. Returns
// null (fail-safe) on any error, non-2xx, empty, or oversized response.
export async function fetchMedia(
  url: string,
  fetchFn: typeof fetch,
): Promise<FetchedMedia | null> {
  try {
    const res = await fetchFn(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > MAX_MEDIA_BYTES) return null;
    const { mimeType, format } = detect(url, res.headers.get("content-type"));
    return { data: buf.toString("base64"), mimeType, format };
  } catch {
    return null;
  }
}
