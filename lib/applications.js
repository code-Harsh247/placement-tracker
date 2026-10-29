export const TAGS = ['lock', 'chill', 'dilemma'];
const MAX_TEXT = 200;
const MAX_LPA = 10000;

export class ValidationError extends Error {}

// D1 row -> shape the page uses
export function toApp(row) {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    ctc: row.ctc ?? '',
    base: row.base ?? '',
    location: row.location,
    tag: row.tag,
    testDone: row.test_done === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function text(value, field, required) {
  const s = String(value ?? '').trim();
  if (required && !s) throw new ValidationError(`${field} is required`);
  if (s.length > MAX_TEXT) throw new ValidationError(`${field} is too long`);
  return s;
}

function amount(value, field) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > MAX_LPA) throw new ValidationError(`${field} must be a number of lakhs`);
  return Math.round(n * 100) / 100;
}

// Validates a request body. With partial = true only the fields present are
// checked and returned (for PATCH). Returns column -> value.
export function clean(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object') throw new ValidationError('Invalid request body');
  const has = k => !partial || k in body;
  const out = {};
  if (has('company')) out.company = text(body.company, 'Company', true);
  if (has('role')) out.role = text(body.role, 'Role', true);
  if (has('ctc')) out.ctc = amount(body.ctc, 'CTC');
  if (has('base')) out.base = amount(body.base, 'Base');
  if (has('location')) out.location = text(body.location, 'Location', false);
  if (has('tag')) {
    const tag = body.tag ?? 'lock';
    if (!TAGS.includes(tag)) throw new ValidationError('Unknown tag');
    out.tag = tag;
  }
  if (has('testDone')) out.test_done = body.testDone ? 1 : 0;
  return out;
}

export function insertStatement(db, fields, { id = crypto.randomUUID(), createdAt = Date.now() } = {}) {
  const now = Date.now();
  return db
    .prepare(
      `INSERT INTO applications (id, company, role, ctc, base, location, tag, test_done, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    )
    .bind(id, fields.company, fields.role, fields.ctc, fields.base, fields.location, fields.tag, fields.test_done ?? 0, createdAt, now);
}
