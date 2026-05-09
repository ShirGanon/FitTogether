// Root component for Phase 1. Shows the app title and pings /api/health on
// mount via the centralized jQuery ajaxClient. The status panel proves the
// fullstack skeleton is alive: React rendered, jQuery + Ajax work, Vite proxy
// forwards to Express, Express talks to MongoDB.

import { useEffect, useState } from 'react';
import { getHealth } from './api/healthApi.js';

const MONGO_STATE_LABEL = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export default function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHealth()
      .then((data) => setHealth(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="skeleton">
      <h1 className="hero-title">FitTogether</h1>
      <p className="tagline">Social network for fitness communities.</p>

      <section className="status-panel">
        <h2>Server status</h2>
        {loading && <p>Pinging /api/health…</p>}
        {error && <p className="status-error">Error: {error}</p>}
        {health && (
          <ul>
            <li>
              <strong>ok:</strong> {String(health.ok)}
            </li>
            <li>
              <strong>time:</strong> {health.time}
            </li>
            <li>
              <strong>mongo:</strong>{' '}
              {MONGO_STATE_LABEL[health.mongoState] ?? `state ${health.mongoState}`}
            </li>
          </ul>
        )}
      </section>

      <p className="phase-note">Phase 1 — fullstack skeleton.</p>
    </main>
  );
}
