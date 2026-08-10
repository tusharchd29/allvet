import { cookies } from "next/headers";
import crypto from "crypto";

// Small internal team app (5 users), PIN-based — not Supabase Auth.
// Session is a signed cookie so it can't be forged client-side; all data
// access is authorized in server actions/pages by checking this session,
// not by database-level RLS.

export type Session = {
  userId: string;
  name: string;
  role: "owner" | "rep";
};

const SECRET = process.env.SESSION_SECRET || "allvet-dev-secret-change-me";
const COOKIE_NAME = "allvet_session";

function sign(payload: string) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export async function createSession(session: Session) {
  const payload = JSON.stringify(session);
  const encoded = Buffer.from(payload).toString("base64url");
  const sig = sign(encoded);
  const store = await cookies();
  store.set(COOKIE_NAME, `${encoded}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days — field reps shouldn't have to re-login often
  });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const [encoded, sig] = raw.split(".");
  if (!encoded || !sig) return null;
  if (sign(encoded) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
