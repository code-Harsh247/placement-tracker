import { json, error, readJson } from '../../../lib/http.js';
import { toApp, clean, insertStatement, ValidationError } from '../../../lib/applications.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT * FROM applications ORDER BY created_at, rowid').all();
  return json({ rows: results.map(toApp) });
}

export async function onRequestPost({ request, env }) {
  try {
    const fields = clean(await readJson(request));
    const row = await insertStatement(env.DB, fields).first();
    return json({ row: toApp(row) }, 201);
  } catch (e) {
    if (e instanceof ValidationError) return error(e.message);
    throw e;
  }
}
