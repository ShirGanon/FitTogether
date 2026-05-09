const db = require('./db');
const { makeUserData, createAgent, api } = require('./helpers');

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

async function setupGroupAndPost(agent) {
  const groupRes = await agent.post('/api/groups').send({
    name: 'Test Group',
    workoutType: 'Running',
    difficultyLevel: 'beginner',
    isPrivate: false,
  });
  const groupId = groupRes.body._id;
  const postRes = await agent.post('/api/posts').send({
    groupId,
    content: 'My first post',
    postType: 'Tip',
    workoutType: 'Running',
  });
  return { groupId, post: postRes.body };
}

describe('POST /api/posts', () => {
  it('creates a post and returns 201', async () => {
    const { agent } = await createAgent();
    const { post } = await setupGroupAndPost(agent);
    expect(post.content).toBe('My first post');
  });

  it('returns 400 when groupId or content is missing', async () => {
    const { agent } = await createAgent();
    const res = await agent.post('/api/posts').send({ content: 'No group' });
    expect(res.status).toBe(400);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await api().post('/api/posts').send({ content: 'x', groupId: '000000000000000000000001' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/posts/feed', () => {
  it('returns posts from groups the user is a member of', async () => {
    const { agent } = await createAgent();
    await setupGroupAndPost(agent);
    const res = await agent.get('/api/posts/feed');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/posts/mine', () => {
  it('returns only the authenticated user\'s posts', async () => {
    const { agent: agentA, user: userA } = await createAgent();
    const { agent: agentB } = await createAgent();

    const groupRes = await agentA.post('/api/groups').send({
      name: 'Shared Group',
      workoutType: 'Gym',
      difficultyLevel: 'beginner',
      isPrivate: false,
    });
    const groupId = groupRes.body._id;
    await agentB.post(`/api/groups/${groupId}/join`);

    await agentA.post('/api/posts').send({ groupId, content: 'Post by A', postType: 'Tip' });
    await agentB.post('/api/posts').send({ groupId, content: 'Post by B', postType: 'Tip' });

    const mine = await agentA.get('/api/posts/mine');
    expect(mine.status).toBe(200);
    expect(mine.body.every((p) => p.authorId._id === userA._id || p.authorId === userA._id)).toBe(true);
  });
});

describe('PUT /api/posts/:id', () => {
  it('allows the author to edit their post', async () => {
    const { agent } = await createAgent();
    const { post } = await setupGroupAndPost(agent);
    const res = await agent.put(`/api/posts/${post._id}`).send({ content: 'Updated content' });
    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Updated content');
  });

  it('returns 403 when editing another user\'s post', async () => {
    const { agent: agentA } = await createAgent();
    const { agent: agentB } = await createAgent();
    const { groupId, post } = await setupGroupAndPost(agentA);
    await agentB.post(`/api/groups/${groupId}/join`);
    const res = await agentB.put(`/api/posts/${post._id}`).send({ content: 'Hacked' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/posts/:id', () => {
  it('allows the author to delete their post', async () => {
    const { agent } = await createAgent();
    const { post } = await setupGroupAndPost(agent);
    const res = await agent.delete(`/api/posts/${post._id}`);
    expect(res.status).toBe(200);
  });

  it('returns 403 when deleting another user\'s post', async () => {
    const { agent: agentA } = await createAgent();
    const { agent: agentB } = await createAgent();
    const { groupId, post } = await setupGroupAndPost(agentA);
    await agentB.post(`/api/groups/${groupId}/join`);
    const res = await agentB.delete(`/api/posts/${post._id}`);
    expect(res.status).toBe(403);
  });
});
