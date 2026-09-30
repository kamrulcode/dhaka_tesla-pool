import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import { db } from "./mongodb";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(jwtSecret);
const COOKIE = "tesla_pool_session";

export type SessionUser = {
  id: string;
  role: "passenger" | "driver";
  name: string;
  email: string;
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.id),
      role: payload.role as SessionUser["role"],
      name: String(payload.name),
      email: String(payload.email),
    };
  } catch {
    return null;
  }
}

export async function requireSession(role?: SessionUser["role"]) {
  const session = await getSession();
  if (!session || (role && session.role !== role))
    throw new Error("UNAUTHORIZED");
  return session;
}

export function oid(id: string) {
  return new ObjectId(id);
}

export async function currentUserDoc() {
  const session = await requireSession();
  const database = await db();
  return database.collection("users").findOne({ _id: oid(session.id) });
}
