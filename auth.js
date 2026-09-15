// Minimal single-password auth. No accounts, no user table — just one shared
// password (set as the APP_PASSWORD environment variable) and a signed cookie.
// Uses Web Crypto so the exact same code runs in Edge middleware and Node routes.

const SALT = "strand-app-v1::";

export async function hashPassword(pw) {
  const data = new TextEncoder().encode(SALT + String(pw || ""));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const SESSION_COOKIE = "strand_session";

export async function isValidSessionCookie(cookieValue) {
  if (!cookieValue) return false;
  const expected = await hashPassword(process.env.APP_PASSWORD || "");
  return cookieValue === expected;
}
