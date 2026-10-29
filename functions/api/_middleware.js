import { createRemoteJWKSet, jwtVerify } from 'jose';
import { error } from '../../lib/http.js';

const jwksByTeam = new Map();
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

// Every /api request must carry a valid Cloudflare Access token for this
// application. Access sits in front of the whole site; this check makes sure
// the API stays closed even if Access is ever misconfigured.
export async function onRequest(context) {
  const { request, env } = context;

  // Local development only: set DEV_BYPASS_AUTH=1 in .dev.vars (never deployed)
  if (env.DEV_BYPASS_AUTH === '1' && LOCAL_HOSTS.has(new URL(request.url).hostname)) {
    return context.next();
  }

  const team = String(env.ACCESS_TEAM_DOMAIN || '').replace(/\/+$/, '');
  const audience = env.ACCESS_AUD;
  if (!team || !audience) return error('Sign-in is not configured yet', 503);

  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return error('Not signed in', 401);

  let jwks = jwksByTeam.get(team);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${team}/cdn-cgi/access/certs`));
    jwksByTeam.set(team, jwks);
  }

  try {
    await jwtVerify(token, jwks, { issuer: team, audience });
  } catch {
    return error('Not signed in', 401);
  }
  return context.next();
}
