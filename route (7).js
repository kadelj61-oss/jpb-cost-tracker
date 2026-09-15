import { NextResponse } from "next/server";
import { sql, ensureSchema } from "../../../../lib/db";
import { classifyType } from "../../../../lib/categories";

export async function POST(req) {
  await ensureSchema();
  const b = await req.json().catch(() => ({}));
  const jobId = String(b.jobId || "");
  const rows = Array.isArray(b.rows) ? b.rows : [];
  if (!jobId) return NextResponse.json({ error: "jobId is required" }, { status: 400 });

  const { rows: categoryRows } = await sql`SELECT name FROM categories;`;
  const CATEGORIES = categoryRows.map((c) => c.name);

  let updated = 0;
  let added = 0;

  for (const r of rows) {
    const po = String(r.po || "").trim();
    if (!po) continue;
    const type = String(r.type || "").trim();
    const budget = Number(r.budget) || 0;
    const category = String(r.category || "").trim();

    const { rows: existing } = await sql`SELECT 1 FROM pos WHERE job_id = ${jobId} AND po = ${po};`;
    if (existing.length > 0) {
      const isValidCategory = CATEGORIES.includes(category);
      const hasType = type !== "";
      await sql`
        UPDATE pos
        SET budget = ${budget},
            category = CASE WHEN ${isValidCategory} THEN ${category} ELSE category END,
            type = CASE WHEN ${hasType} THEN ${type} ELSE type END
        WHERE job_id = ${jobId} AND po = ${po};
      `;
      updated += 1;
    } else {
      const resolvedCategory = CATEGORIES.includes(category) ? category : classifyType(type || po);
      await sql`
        INSERT INTO pos (job_id, po, type, category, budget)
        VALUES (${jobId}, ${po}, ${type || po}, ${resolvedCategory}, ${budget});
      `;
      added += 1;
    }
  }

  return NextResponse.json({ updated, added });
}
