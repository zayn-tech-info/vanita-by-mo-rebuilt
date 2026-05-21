import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Webhook } from "svix";

type ClerkUserPayload = {
  id?: string;
  email_addresses?: Array<{ id: string; email_address: string }>;
  first_name?: string | null;
  last_name?: string | null;
  primary_email_address_id?: string | null;
};

type ClerkWebhookEvent = {
  type: string;
  data: ClerkUserPayload;
};

function primaryEmail(data: ClerkUserPayload): string | undefined {
  const addresses = data.email_addresses;
  if (!addresses?.length) return undefined;
  const primaryId = data.primary_email_address_id;
  if (primaryId) {
    const primary = addresses.find((a) => a.id === primaryId);
    if (primary?.email_address) return primary.email_address;
  }
  return addresses[0]?.email_address;
}

/** Clerk → Convex user sync. Registered on the HTTP router in `http.ts`. */
export const clerkWebhook = httpAction(async (ctx, request) => {
  const skipVerify =
    process.env.CLERK_WEBHOOK_SKIP_VERIFY === "true" ||
    process.env.CLERK_WEBHOOK_SKIP_VERIFY === "1";
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET?.trim();

  if (!skipVerify && !webhookSecret) {
    console.error(
      "Missing CLERK_WEBHOOK_SECRET (set CLERK_WEBHOOK_SKIP_VERIFY=true only for local testing)"
    );
    return new Response("Server configuration error", { status: 500 });
  }

  const payload = await request.text();

  let event: ClerkWebhookEvent;

  if (skipVerify) {
    console.warn(
      "Clerk webhook: signature verification SKIPPED (CLERK_WEBHOOK_SKIP_VERIFY). Do not use in production."
    );
    try {
      event = JSON.parse(payload) as ClerkWebhookEvent;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");
    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response(JSON.stringify({ error: "Missing Svix headers" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    try {
      const wh = new Webhook(webhookSecret!);
      event = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : "Invalid signature";
      console.error("Clerk webhook signature verification failed:", detail);
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed", detail }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const clerkUserId = event.data.id;
    const email = primaryEmail(event.data);
    const firstName = event.data.first_name || "";
    const lastName = event.data.last_name || "";

    if (!clerkUserId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing clerkUserId or email" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await ctx.runMutation(api.auth.syncUserFromClerk, {
      clerkUserId,
      email,
      name: `${firstName} ${lastName}`.trim() || email,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (event.type === "user.deleted") {
    const clerkUserId = event.data.id;
    if (clerkUserId) {
      await ctx.runMutation(api.auth.deleteByClerkId, { clerkUserId });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ message: "Event type not handled" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
