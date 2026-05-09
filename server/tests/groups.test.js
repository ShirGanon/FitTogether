const db = require('./db');
const { makeUserData, createAgent, api } = require('./helpers');

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

const PUBLIC_GROUP = {
  name: 'Morning Runners',
  workoutType: 'Running',
  location: 'Tel Aviv',
  difficultyLevel: 'beginner',
  isPrivate: false,
};

const PRIVATE_GROUP = {
  name: 'Elite CrossFitters',
  workoutType: 'CrossFit',
  location: 'Raanana',
  difficultyLevel: 'advanced',
  isPrivate: true,
};

describe('POST /api/groups', () => {
  it('creates a group and returns 201', async () => {
    const { agent } = await createAgent();
    const res = await agent.post('/api/groups').send(PUBLIC_GROUP);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe(PUBLIC_GROUP.name);
  });

  it('returns 400 when required fields are missing', async () => {
    const { agent } = await createAgent();
    const res = await agent.post('/api/groups').send({ name: 'No workout type' });
    expect(res.status).toBe(400);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await api().post('/api/groups').send(PUBLIC_GROUP);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/groups', () => {
  it('returns all groups including private ones', async () => {
    const { agent } = await createAgent();
    await agent.post('/api/groups').send(PUBLIC_GROUP);
    await agent.post('/api/groups').send(PRIVATE_GROUP);
    const res = await agent.get('/api/groups');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });
});

describe('GET /api/groups/:id', () => {
  it('returns full group data for the manager', async () => {
    const { agent } = await createAgent();
    const create = await agent.post('/api/groups').send(PUBLIC_GROUP);
    const groupId = create.body._id;
    const res = await agent.get(`/api/groups/${groupId}`);
    expect(res.status).toBe(200);
    expect(res.body.isManager).toBe(true);
  });

  it('returns limited data for a private group non-member', async () => {
    const { agent: managerAgent } = await createAgent();
    const { agent: visitorAgent } = await createAgent();
    const create = await managerAgent.post('/api/groups').send(PRIVATE_GROUP);
    const groupId = create.body._id;
    const res = await visitorAgent.get(`/api/groups/${groupId}`);
    expect(res.status).toBe(200);
    expect(res.body.isMember).toBe(false);
    expect(res.body.hasPending).toBe(false);
  });
});

describe('PUT /api/groups/:id', () => {
  it('allows the manager to update the group', async () => {
    const { agent } = await createAgent();
    const create = await agent.post('/api/groups').send(PUBLIC_GROUP);
    const groupId = create.body._id;
    const res = await agent.put(`/api/groups/${groupId}`).send({ description: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Updated');
  });

  it('returns 403 for a non-manager', async () => {
    const { agent: managerAgent } = await createAgent();
    const { agent: otherAgent } = await createAgent();
    const create = await managerAgent.post('/api/groups').send(PUBLIC_GROUP);
    const groupId = create.body._id;
    const res = await otherAgent.put(`/api/groups/${groupId}`).send({ description: 'Hacked' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/groups/:id', () => {
  it('allows the manager to delete the group', async () => {
    const { agent } = await createAgent();
    const create = await agent.post('/api/groups').send(PUBLIC_GROUP);
    const groupId = create.body._id;
    const res = await agent.delete(`/api/groups/${groupId}`);
    expect(res.status).toBe(200);
  });

  it('returns 403 for a non-manager', async () => {
    const { agent: managerAgent } = await createAgent();
    const { agent: otherAgent } = await createAgent();
    const create = await managerAgent.post('/api/groups').send(PUBLIC_GROUP);
    const groupId = create.body._id;
    const res = await otherAgent.delete(`/api/groups/${groupId}`);
    expect(res.status).toBe(403);
  });
});

describe('Membership flows', () => {
  it('joins a public group', async () => {
    const { agent: managerAgent } = await createAgent();
    const { agent: memberAgent } = await createAgent();
    const create = await managerAgent.post('/api/groups').send(PUBLIC_GROUP);
    const groupId = create.body._id;
    const res = await memberAgent.post(`/api/groups/${groupId}/join`);
    expect(res.status).toBe(200);
  });

  it('returns 403 when trying to join a private group directly', async () => {
    const { agent: managerAgent } = await createAgent();
    const { agent: userAgent } = await createAgent();
    const create = await managerAgent.post('/api/groups').send(PRIVATE_GROUP);
    const groupId = create.body._id;
    const res = await userAgent.post(`/api/groups/${groupId}/join`);
    expect(res.status).toBe(403);
  });

  it('sends and approves a join request for a private group', async () => {
    const { agent: managerAgent } = await createAgent();
    const { agent: userAgent, user } = await createAgent();
    const create = await managerAgent.post('/api/groups').send(PRIVATE_GROUP);
    const groupId = create.body._id;

    const request = await userAgent.post(`/api/groups/${groupId}/request`);
    expect(request.status).toBe(200);

    // Verify hasPending is true for the requester
    const view = await userAgent.get(`/api/groups/${groupId}`);
    expect(view.body.hasPending).toBe(true);

    // Manager approves
    const approve = await managerAgent.post(`/api/groups/${groupId}/approve/${user._id}`);
    expect(approve.status).toBe(200);

    // User is now a member
    const after = await userAgent.get(`/api/groups/${groupId}`);
    expect(after.body.isMember).toBe(true);
  });

  it('rejects a join request', async () => {
    const { agent: managerAgent } = await createAgent();
    const { agent: userAgent, user } = await createAgent();
    const create = await managerAgent.post('/api/groups').send(PRIVATE_GROUP);
    const groupId = create.body._id;

    await userAgent.post(`/api/groups/${groupId}/request`);
    const reject = await managerAgent.post(`/api/groups/${groupId}/reject/${user._id}`);
    expect(reject.status).toBe(200);

    const view = await userAgent.get(`/api/groups/${groupId}`);
    expect(view.body.isMember).toBe(false);
    expect(view.body.hasPending).toBe(false);
  });
});
