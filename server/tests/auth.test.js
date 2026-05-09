const db = require('./db');
const { makeUserData, createAgent, api } = require('./helpers');

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

describe('POST /api/auth/register', () => {
  it('creates a user and returns 201 without password field', async () => {
    const data = makeUserData();
    const res = await api().post('/api/auth/register').send(data);
    expect(res.status).toBe(201);
    expect(res.body.username).toBe(data.username);
    expect(res.body.password).toBeUndefined();
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await api().post('/api/auth/register').send({ username: 'only' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 on duplicate username', async () => {
    const data = makeUserData();
    await api().post('/api/auth/register').send(data);
    const res = await api().post('/api/auth/register').send({ ...data, email: 'other@test.dev' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/username/i);
  });

  it('returns 400 on duplicate email', async () => {
    const data = makeUserData();
    await api().post('/api/auth/register').send(data);
    const res = await api().post('/api/auth/register').send({ ...data, username: 'different' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 and user object on valid credentials', async () => {
    const data = makeUserData();
    await api().post('/api/auth/register').send(data);
    const res = await api().post('/api/auth/login').send({
      username: data.username,
      password: data.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe(data.username);
    expect(res.body.password).toBeUndefined();
  });

  it('returns 401 on wrong password', async () => {
    const data = makeUserData();
    await api().post('/api/auth/register').send(data);
    const res = await api().post('/api/auth/login').send({
      username: data.username,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 on unknown username', async () => {
    const res = await api().post('/api/auth/login').send({
      username: 'nobody',
      password: 'Password1!',
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await api().post('/api/auth/login').send({ username: 'only' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('returns the logged-in user', async () => {
    const { agent, data } = await createAgent();
    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.username).toBe(data.username);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await api().get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('destroys the session so /me returns 401 afterwards', async () => {
    const { agent } = await createAgent();
    const logout = await agent.post('/api/auth/logout');
    expect(logout.status).toBe(200);
    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(401);
  });
});
