import { NextResponse } from "next/server";
import { sql, ensureSchema } from "../../../lib/db";

export async function POST(req) {
  await ensureSchema();
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || "").trim();
  if (!name) return NextResponse.json({ error: "Category name is required" }, { status: 400 });

  const { rows: existing } = await sql`SELECT 1 FROM categories WHERE lower(name) = lower(${name});`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "That category already exists" }, { status: 409 });
  }
  await sql`INSERT INTO categories (name) VALUES (${name});`;
  return NextResponse.json({ ok: true, name });
}
