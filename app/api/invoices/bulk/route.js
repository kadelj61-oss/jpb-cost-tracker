import { NextResponse } from "next/server";
import { sql, ensureSchema } from "../../../../lib/db";

export async function POST(req) {
  await ensureSchema();
  const b = await req.json().catch(() => ({}));
  const jobId = String(b.jobId || "");
  const rows = Array.isArray(b.rows) ? b.rows : [];
  if (!jobId) return NextResponse.json({ error: "jobId is required" }, { status: 400 });

  let added = 0;
  for (const r of rows) {
    const po = String(r.po || "").trim();
    const amount = Number(r.amount);
    if (!po || Number.isNaN(amount)) continue;
    const id = "imp-" + Date.now() + "-" + Math.floor(Math.random() * 1000000);
    await sql`
      INSERT INTO invoices (id, job_id, po, date, vendor, invoice_num, amount, source)
      VALUES (${id}, ${jobId}, ${po}, ${r.date || null}, ${r.vendor || null}, ${r.invoiceNum || null}, ${amount}, 'Imported');
    `;
    added += 1;
  }
  return NextResponse.json({ added });
}
