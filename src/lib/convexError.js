import { ConvexError } from "convex/values";

/**
 * Get a user-readable message from a Convex or other error.
 * Use when catching errors from Convex actions/mutations so the UI shows a friendly message instead of a raw server error.
 * @param {unknown} err
 * @param {string} [fallback="Something went wrong. Please try again."]
 * @returns {string}
 */
export function getConvexErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (err instanceof ConvexError) {
    const data = err.data;
    return typeof data === "string" ? data : fallback;
  }
  if (err && typeof err === "object" && typeof err.message === "string") {
    return err.message;
  }
  return fallback;
}
