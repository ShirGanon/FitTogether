// Smoke-test API call. Phase 1 only — proves the full client → Vite proxy →
// Express → Mongo wiring works end-to-end. Will be removed (or kept as a
// status indicator) once the real APIs are in place.

import { ajaxRequest } from './ajaxClient.js';

export function getHealth() {
  return ajaxRequest({ method: 'GET', url: '/api/health' });
}
