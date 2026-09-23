import { cookies } from "next/headers";
import crypto from "crypto";

export type Role = "owner" | "rep";

export type Session = {
  userId: string;
  name: string;
  role: Role;
};

const COOKIE_NAME = "allvet_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// NOTE: temporary stopgap fallback — see lib/supabase-admin.ts note. Set a
// real SESSION_SECRET env var on Vercel and remove this hardcoded fallback
// once done.
function getSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    "248e3f938aab671229bbb7d4b6402e39dd7e781694e4b629e7715ee4330d8bbe"
  );
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function encodeSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (
    expected.length !== sig.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return null;
  }
  try {
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json) as Session;
  } catch {
    return null;
  }
}

export async function createSession(session: Session) {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return decodeSession(store.get(COOKIE_NAME)?.value);
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
