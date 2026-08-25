import { NextResponse } from "next/server";
import { sql, ensureSchema } from "../../../lib/db";

export async function GET() {
  await ensureSchema();

  const { rows: jobs } = await sql`SELECT * FROM jobs ORDER BY created_at ASC;`;
  const { rows: pos } = await sql`SELECT * FROM pos;`;
  const { rows: invoices } = await sql`SELECT * FROM invoices;`;
  const { rows: categoryRows } = await sql`SELECT name FROM categories ORDER BY id ASC;`;

  const jobsOut = jobs.map((j) => ({
    id: j.id,
    name: j.name,
    client: j.client || "",
    startDate: j.start_date || "",
    status: j.status || "Active",
    pos: pos
      .filter((p) => p.job_id === j.id)
      .map((p) => ({ po: p.po, type: p.type, category: p.category, budget: Number(p.budget) })),
    invoices: invoices
      .filter((i) => i.job_id === j.id)
      .map((i) => ({
        id: i.id,
        po: i.po,
        date: i.date,
        vendor: i.vendor,
        invoiceNum: i.invoice_num,
        amount: Number(i.amount),
        source: i.source,
      })),
  }));

  return NextResponse.json({ categories: categoryRows.map((c) => c.name), jobs: jobsOut });
}
