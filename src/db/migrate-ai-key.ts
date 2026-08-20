import { getDb } from "./index";

// One-shot: rename `qwenApiKey` → `aiApiKey` (backfilling existing values) and
// add the provider/base-URL/model-preference fields for provider-agnostic BYOK.
async function main() {
  const db = await getDb();
  await db.query("DEFINE FIELD OVERWRITE aiApiKey ON user TYPE option<string>");
  await db.query("UPDATE user SET aiApiKey = qwenApiKey WHERE qwenApiKey IS NOT NONE");
  await db.query("REMOVE FIELD qwenApiKey ON user");
  await db.query('DEFINE FIELD OVERWRITE aiProvider ON user TYPE option<string> DEFAULT "openrouter"');
  await db.query("DEFINE FIELD OVERWRITE aiBaseUrl ON user TYPE option<string>");
  await db.query("DEFINE FIELD OVERWRITE aiVisionModel ON user TYPE option<string>");
  await db.query("DEFINE FIELD OVERWRITE aiAudioModel ON user TYPE option<string>");
  console.log("ai-key migration complete");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
