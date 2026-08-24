import { NextResponse } from "next/server";
import { SESSION_COOKIE, hashPassword } from "../../../lib/auth";

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  const expected = process.env.APP_PASSWORD || "";

  if (!expected) {
    return NextResponse.json(
      { error: "APP_PASSWORD is not set on the server yet." },
      { status: 500 }
    );
  }
  if (String(password || "") !== expected) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const token = await hashPassword(expected);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });
  return res;
}
