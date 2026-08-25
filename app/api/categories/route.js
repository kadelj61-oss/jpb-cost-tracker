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

export async function PATCH(req) {
  await ensureSchema();
  const b = await req.json().catch(() => ({}));
  const oldName = String(b.oldName || "").trim();
  const newName = String(b.newName || "").trim();
  if (!oldName || !newName) {
    return NextResponse.json({ error: "oldName and newName are required" }, { status: 400 });
  }
  if (oldName === newName) return NextResponse.json({ ok: true, name: newName });

  const { rows: existing } = await sql`SELECT 1 FROM categories WHERE name = ${oldName};`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  const { rows: dupe } = await sql`SELECT 1 FROM categories WHERE lower(name) = lower(${newName});`;
  if (dupe.length > 0) {
    return NextResponse.json({ error: "That category already exists" }, { status: 409 });
  }

  // Rename the category and carry every PO line that used the old name along with it.
  await sql`UPDATE categories SET name = ${newName} WHERE name = ${oldName};`;
  await sql`UPDATE pos SET category = ${newName} WHERE category = ${oldName};`;

  return NextResponse.json({ ok: true, name: newName });
}

export async function DELETE(req) {
  await ensureSchema();
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const { rows: allCats } = await sql`SELECT name FROM categories ORDER BY id ASC;`;
  if (!allCats.some((c) => c.name === name)) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  if (allCats.length <= 1) {
    return NextResponse.json({ error: "Can't delete the last remaining category" }, { status: 400 });
  }

  // PO lines that used this category get moved somewhere sensible rather than
  // left pointing at a category that no longer exists (which would make that
  // spend silently vanish from every summary).
  const fallback =
    allCats.find((c) => c.name === "Other / Miscellaneous" && c.name !== name) ||
    allCats.find((c) => c.name !== name);
  const fallbackName = fallback.name;

  const { rows: affected } = await sql`SELECT COUNT(*)::int AS n FROM pos WHERE category = ${name};`;
  const moved = affected[0].n;
  if (moved > 0) {
    await sql`UPDATE pos SET category = ${fallbackName} WHERE category = ${name};`;
  }
  await sql`DELETE FROM categories WHERE name = ${name};`;

  return NextResponse.json({ ok: true, moved, fallback: fallbackName });
}
