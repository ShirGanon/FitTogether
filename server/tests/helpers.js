// Shared test helpers: create users, get logged-in agents.

const request = require('supertest');
const app = require('../app');

let counter = 0;

// Returns a unique user payload — call once per user you want to create.
function makeUserData(overrides = {}) {
  const n = ++counter;
  return {
    username: `user${n}`,
    password: 'Password1!',
    fullName: `Test User ${n}`,
    email: `user${n}@test.dev`,
    fitnessLevel: 'beginner',
    preferredWorkoutTypes: ['Running'],
    location: 'Test City',
    ...overrides,
  };
}

// Registers a user and returns a supertest agent that carries the session cookie.
// Register also logs the user in (sets req.session.userId), so no extra login needed.
async function createAgent(overrides = {}) {
  const data = makeUserData(overrides);
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/register').send(data);
  if (res.status !== 201) throw new Error(`Register failed: ${JSON.stringify(res.body)}`);
  return { agent, data, user: res.body };
}

// Returns a plain (unauthenticated) supertest request object.
function api() {
  return request(app);
}

module.exports = { makeUserData, createAgent, api };
