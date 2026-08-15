import { handleStripeWebhook } from "@/server/subscription";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");
  return handleStripeWebhook(rawBody, signature);
}
