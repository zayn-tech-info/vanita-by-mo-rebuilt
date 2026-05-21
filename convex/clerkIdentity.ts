import type { UserIdentity } from "convex/server";

/** Clerk user id from Convex JWT (`subject` claim, not deprecated `.sub`). */
export function clerkUserIdFromIdentity(
  identity: UserIdentity | null,
): string | null {
  if (!identity) return null;
  const subject = identity.subject;
  return typeof subject === "string" && subject.length > 0 ? subject : null;
}
