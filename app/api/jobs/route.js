import { NextResponse } from "next/server";
import { sql, ensureSchema } from "../../../lib/db";

function slugify(s) {
  return (
    String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "job-" + Date.now()
  );
}

export async function POST(req) {
  await ensureSchema();
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Job name is required" }, { status: 400 });

  let id = slugify(name);
  let suffix = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { rows } = await sql`SELECT 1 FROM jobs WHERE id = ${id};`;
    if (rows.length === 0) break;
    id = slugify(name) + "-" + suffix;
    suffix += 1;
  }

  await sql`
    INSERT INTO jobs (id, name, client, start_date, status)
    VALUES (${id}, ${name}, ${body.client || ""}, ${body.startDate || ""}, ${body.status || "Active"});
  `;
  return NextResponse.json({ id });
}

export async function DELETE(req) {
  await ensureSchema();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  // pos and invoices both have ON DELETE CASCADE on job_id, so this removes everything for the job.
  await sql`DELETE FROM jobs WHERE id = ${id};`;
  return NextResponse.json({ ok: true });
}
