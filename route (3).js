import { NextResponse } from "next/server";
import { sql, ensureSchema } from "../../../lib/db";

export async function POST(req) {
  await ensureSchema();
  const b = await req.json().catch(() => ({}));
  const jobId = String(b.jobId || "");
  const po = String(b.po || "").trim();
  const amount = Number(b.amount);
  if (!jobId || !po || Number.isNaN(amount)) {
    return NextResponse.json({ error: "jobId, po, and amount are required" }, { status: 400 });
  }
  const id = "inv-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
  await sql`
    INSERT INTO invoices (id, job_id, po, date, vendor, invoice_num, amount, source)
    VALUES (${id}, ${jobId}, ${po}, ${b.date || null}, ${b.vendor || null}, ${b.invoiceNum || null}, ${amount}, ${b.source || "Logged"});
  `;
  return NextResponse.json({ id });
}

export async function PATCH(req) {
  await ensureSchema();
  const b = await req.json().catch(() => ({}));
  const id = String(b.id || "");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const amount = Number(b.amount);
  if (Number.isNaN(amount)) return NextResponse.json({ error: "amount is required" }, { status: 400 });
  await sql`
    UPDATE invoices
    SET po = ${b.po}, date = ${b.date || null}, vendor = ${b.vendor || null},
        invoice_num = ${b.invoiceNum || null}, amount = ${amount}
    WHERE id = ${id};
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  await ensureSchema();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await sql`DELETE FROM invoices WHERE id = ${id};`;
  return NextResponse.json({ ok: true });
}
