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
  let po = String(b.po || "");
  if (!jobId || !po) {
    return NextResponse.json({ error: "jobId and po are required" }, { status: 400 });
  }

  // Renaming the PO code itself — carry every invoice logged against the old
  // code forward to the new one, same pattern as a category rename.
  if (b.newPo !== undefined) {
    const newPo = String(b.newPo).trim();
    if (!newPo) return NextResponse.json({ error: "PO # can't be empty" }, { status: 400 });
    if (newPo !== po) {
      const { rows: dupe } = await sql`SELECT 1 FROM pos WHERE job_id = ${jobId} AND po = ${newPo};`;
      if (dupe.length > 0) {
        return NextResponse.json({ error: "That PO # already exists on this job" }, { status: 409 });
      }
      await sql`UPDATE pos SET po = ${newPo} WHERE job_id = ${jobId} AND po = ${po};`;
      await sql`UPDATE invoices SET po = ${newPo} WHERE job_id = ${jobId} AND po = ${po};`;
      po = newPo; // subsequent updates below target the renamed row
    }
  }

  if (b.category !== undefined) {
    await sql`UPDATE pos SET category = ${b.category} WHERE job_id = ${jobId} AND po = ${po};`;
  }
  if (b.budget !== undefined) {
    await sql`UPDATE pos SET budget = ${Number(b.budget) || 0} WHERE job_id = ${jobId} AND po = ${po};`;
  }
  if (b.type !== undefined) {
    const type = String(b.type).trim();
    if (!type) return NextResponse.json({ error: "Type/description can't be empty" }, { status: 400 });
    await sql`UPDATE pos SET type = ${type} WHERE job_id = ${jobId} AND po = ${po};`;
  }
  return NextResponse.json({ ok: true, po });
}

export async function DELETE(req) {
  await ensureSchema();
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  const po = searchParams.get("po");
  if (!jobId || !po) {
    return NextResponse.json({ error: "jobId and po are required" }, { status: 400 });
  }
  // Invoices aren't linked to pos by a foreign key (they're matched by the po text
  // value alone), so there's nothing to cascade automatically — remove them here.
  const { rows: affected } = await sql`SELECT COUNT(*)::int AS n FROM invoices WHERE job_id = ${jobId} AND po = ${po};`;
  const invoicesDeleted = affected[0].n;
  if (invoicesDeleted > 0) {
    await sql`DELETE FROM invoices WHERE job_id = ${jobId} AND po = ${po};`;
  }
  await sql`DELETE FROM pos WHERE job_id = ${jobId} AND po = ${po};`;
  return NextResponse.json({ ok: true, invoicesDeleted });
}
