import { json, error, readJson } from '../../lib/http.js';
import { toApp, clean, insertStatement, ValidationError } from '../../lib/applications.js';

const MAX_ROWS = 2000;

// Replaces every application with the rows in the body, in one transaction.
// Used by Restore (from a Backup file) and by "Try with sample data".
export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  if (!body || !Array.isArray(body.rows)) return error('Expected { rows: [...] }');
  if (body.rows.length > MAX_ROWS) return error(`At most ${MAX_ROWS} rows can be imported`);

  let statements;
  try {
    const base = Date.now();
    statements = body.rows.map((r, i) => {
      const createdAt = Number.isFinite(r?.createdAt) ? r.createdAt : base + i;
      return insertStatement(env.DB, clean({ tag: 'lock', ...r }), { createdAt });
    });
  } catch (e) {
    if (e instanceof ValidationError) return error(`Row could not be imported: ${e.message}`);
    throw e;
  }

  const results = await env.DB.batch([env.DB.prepare('DELETE FROM applications'), ...statements]);
  const rows = results.slice(1).map(r => toApp(r.results[0]));
  return json({ rows });
}
