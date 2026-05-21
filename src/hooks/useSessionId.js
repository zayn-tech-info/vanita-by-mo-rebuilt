import { useState } from "react";
import { getSessionId, setSessionId } from "../lib/cookies";

function generateSessionId() {
  return (
    "sess_" + Math.random().toString(36).substring(2) + Date.now().toString(36)
  );
}

/** Session ID for cart identity — stored in cookie (not localStorage) for server-friendly persistence. */
export function useSessionId() {
  const [sessionId] = useState(() => {
    const existing = getSessionId();
    if (existing) return existing;
    const newId = generateSessionId();
    setSessionId(newId);
    return newId;
  });
  return sessionId;
}
