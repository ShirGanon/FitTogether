const db = require('./db');
const { makeUserData, createAgent, api } = require('./helpers');

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

describe('GET /api/users', () => {
  it('returns list of users when authenticated', async () => {
    const { agent } = await createAgent();
    await api().post('/api/auth/register').send(makeUserData());
    const res = await agent.get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await api().get('/api/users');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/:id', () => {
  it('returns a user by ID', async () => {
    const { agent, user } = await createAgent();
    const res = await agent.get(`/api/users/${user._id}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(user._id);
    expect(res.body.username).toBe(user.username);
  });

  it('returns 404 for unknown ID', async () => {
    const { agent } = await createAgent();
    const fakeId = '000000000000000000000001';
    const res = await agent.get(`/api/users/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/users/:id', () => {
  it('allows a user to update their own profile', async () => {
    const { agent, user } = await createAgent();
    const res = await agent.put(`/api/users/${user._id}`).send({ bio: 'Updated bio' });
    expect(res.status).toBe(200);
    expect(res.body.bio).toBe('Updated bio');
  });

  it('returns 403 when updating another user\'s profile', async () => {
    const { agent } = await createAgent();
    const { user: other } = await createAgent();
    const res = await agent.put(`/api/users/${other._id}`).send({ bio: 'Hacked' });
    expect(res.status).toBe(403);
  });
});

describe('Friends', () => {
  it('adds and removes a friend', async () => {
    const { agent, user } = await createAgent();
    const { user: other } = await createAgent();

    const add = await agent.post(`/api/users/${other._id}/friends`);
    expect(add.status).toBe(200);

    const remove = await agent.delete(`/api/users/${other._id}/friends`);
    expect(remove.status).toBe(200);
  });
});

describe('DELETE /api/users/:id', () => {
  it('allows a user to delete their own account', async () => {
    const { agent, user } = await createAgent();
    const res = await agent.delete(`/api/users/${user._id}`);
    expect(res.status).toBe(200);
    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(401);
  });

  it('returns 403 when deleting another user', async () => {
    const { agent } = await createAgent();
    const { user: other } = await createAgent();
    const res = await agent.delete(`/api/users/${other._id}`);
    expect(res.status).toBe(403);
  });
});
