import { NextResponse } from "next/server";
import { sql, ensureSchema } from "../../../lib/db";

export async function POST(req) {
  await ensureSchema();
  const b = await req.json().catch(() => ({}));
  const jobId = String(b.jobId || "");
  const po = String(b.po || "").trim();
  const type = String(b.type || "").trim();
  if (!jobId || !po || !type) {
    return NextResponse.json({ error: "jobId, po, and type are required" }, { status: 400 });
  }
  const { rows } = await sql`SELECT 1 FROM pos WHERE job_id = ${jobId} AND po = ${po};`;
  if (rows.length > 0) {
    return NextResponse.json({ error: "That PO # already exists on this job" }, { status: 409 });
  }
  await sql`
    INSERT INTO pos (job_id, po, type, category, budget)
    VALUES (${jobId}, ${po}, ${type}, ${b.category || ""}, ${Number(b.budget) || 0});
  `;
  return NextResponse.json({ ok: true });
}

export async function PATCH(req) {
  await ensureSchema();
  const b = await req.json().catch(() => ({}));
  const jobId = String(b.jobId || "");
  const po = String(b.po || "");
  if (!jobId || !po) {
    return NextResponse.json({ error: "jobId and po are required" }, { status: 400 });
  }
  if (b.category !== undefined) {
    await sql`UPDATE pos SET category = ${b.category} WHERE job_id = ${jobId} AND po = ${po};`;
  }
  if (b.budget !== undefined) {
    await sql`UPDATE pos SET budget = ${Number(b.budget) || 0} WHERE job_id = ${jobId} AND po = ${po};`;
  }
  return NextResponse.json({ ok: true });
}
