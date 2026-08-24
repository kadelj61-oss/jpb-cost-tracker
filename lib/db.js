import { neon } from "@neondatabase/serverless";
import seedData from "./seedData.json";

// Created lazily (not at module load) so the app can still build without a
// database connection string present, and picks up whichever env var name
// the Postgres integration you attach happens to use.
let _sql = null;
function getSql() {
  if (!_sql) {
    const conn = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!conn) throw new Error("No database connection string found (DATABASE_URL / POSTGRES_URL).");
    _sql = neon(conn, { fullResults: true });
  }
  return _sql;
}
const sql = (...args) => getSql()(...args);

let schemaReady = null;

export async function ensureSchema() {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        client TEXT DEFAULT '',
        start_date TEXT DEFAULT '',
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS pos (
        job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        po TEXT NOT NULL,
        type TEXT DEFAULT '',
        category TEXT DEFAULT '',
        budget NUMERIC DEFAULT 0,
        PRIMARY KEY (job_id, po)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        po TEXT NOT NULL,
        date TEXT,
        vendor TEXT,
        invoice_num TEXT,
        amount NUMERIC NOT NULL,
        source TEXT DEFAULT 'Logged'
      );
    `;
    await ensureSeed();
  })();
  return schemaReady;
}

async function ensureSeed() {
  const { rows } = await sql`SELECT COUNT(*)::int AS n FROM jobs;`;
  if (rows[0].n > 0) return;

  for (const job of seedData.jobs) {
    await sql`
      INSERT INTO jobs (id, name, client, start_date, status)
      VALUES (${job.id}, ${job.name}, ${job.client}, ${job.startDate}, ${job.status})
      ON CONFLICT (id) DO NOTHING;
    `;
    for (const p of job.pos) {
      await sql`
        INSERT INTO pos (job_id, po, type, category, budget)
        VALUES (${job.id}, ${p.po}, ${p.type}, ${p.category}, ${p.budget})
        ON CONFLICT (job_id, po) DO NOTHING;
      `;
    }
    for (const inv of job.invoices) {
      await sql`
        INSERT INTO invoices (id, job_id, po, date, vendor, invoice_num, amount, source)
        VALUES (${inv.id}, ${job.id}, ${inv.po}, ${inv.date}, ${inv.vendor}, ${inv.invoiceNum}, ${inv.amount}, ${inv.source})
        ON CONFLICT (id) DO NOTHING;
      `;
    }
  }
}

export { sql };
