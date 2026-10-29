import { json, error, readJson } from '../../../lib/http.js';
import { toApp, clean, ValidationError } from '../../../lib/applications.js';

export async function onRequestPatch({ request, env, params }) {
  try {
    const fields = clean(await readJson(request), { partial: true });
    const cols = Object.keys(fields);
    if (!cols.length) return error('Nothing to update');
    const row = await env.DB
      .prepare(`UPDATE applications SET ${cols.map(c => `${c} = ?`).join(', ')}, updated_at = ? WHERE id = ? RETURNING *`)
      .bind(...cols.map(c => fields[c]), Date.now(), params.id)
      .first();
    if (!row) return error('Application not found', 404);
    return json({ row: toApp(row) });
  } catch (e) {
    if (e instanceof ValidationError) return error(e.message);
    throw e;
  }
}

export async function onRequestDelete({ env, params }) {
  const { meta } = await env.DB.prepare('DELETE FROM applications WHERE id = ?').bind(params.id).run();
  if (!meta.changes) return error('Application not found', 404);
  return json({ ok: true });
}
