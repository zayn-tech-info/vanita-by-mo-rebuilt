/**
 * Simple cookie helpers for session/cart identity (no localStorage for cart-related data).
 * Uses a 1-year expiry so the same session persists across visits.
 */

const SESSION_COOKIE_NAME = "vanita_session_id";
const COOKIE_MAX_AGE_DAYS = 365;

export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + encodeURIComponent(name) + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name, value, maxAgeDays = COOKIE_MAX_AGE_DAYS) {
  if (typeof document === "undefined") return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie =
    encodeURIComponent(name) +
    "=" +
    encodeURIComponent(value) +
    "; path=/; max-age=" +
    maxAge +
    "; SameSite=Lax";
}

export function getSessionId() {
  return getCookie(SESSION_COOKIE_NAME);
}

export function setSessionId(value) {
  setCookie(SESSION_COOKIE_NAME, value);
}
