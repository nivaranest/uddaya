/** Signed-cookie sessions (HMAC-SHA256). Web Crypto only, so it runs in middleware and route handlers. */

export const SESSION_COOKIE = "uddaya_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type Role = "candidate" | "recruiter" | "admin";
export type Session = { sub: string; name: string; role: Role; exp: number };

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(user: { id: string; name: string; role: Role }): Promise<string> {
  const payload: Session = { sub: user.id, name: user.name, role: user.role, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(body));
  return `${body}.${b64url(new Uint8Array(sig))}`;
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(), fromB64url(sig), enc.encode(body));
    if (!ok) return null;
    const s = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Session;
    return s.exp > Date.now() / 1000 ? s : null;
  } catch {
    return null;
  }
}
