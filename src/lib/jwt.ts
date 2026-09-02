import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  sub: string;
  username: string;
};

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "kentado-dev-secret-change-in-production"
);

export const SESSION_COOKIE = "kentado_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.sub !== "string" || typeof payload.username !== "string") {
      return null;
    }
    return { sub: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}
