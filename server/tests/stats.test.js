const db = require('./db');
const { createAgent, api } = require('./helpers');

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

describe('GET /api/stats/posts-by-workout-type', () => {
  it('returns an array with workoutType and postCount fields', async () => {
    const { agent } = await createAgent();
    const groupRes = await agent.post('/api/groups').send({
      name: 'Stats Group',
      workoutType: 'Yoga',
      difficultyLevel: 'beginner',
      isPrivate: false,
    });
    await agent.post('/api/posts').send({
      groupId: groupRes.body._id,
      content: 'Yoga post',
      postType: 'Tip',
      workoutType: 'Yoga',
    });

    const res = await agent.get('/api/stats/posts-by-workout-type');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('workoutType');
    expect(res.body[0]).toHaveProperty('postCount');
  });

  it('returns 401 when not authenticated', async () => {
    const res = await api().get('/api/stats/posts-by-workout-type');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/stats/posts-by-month', () => {
  it('returns an array with month and postCount fields', async () => {
    const { agent } = await createAgent();
    const groupRes = await agent.post('/api/groups').send({
      name: 'Month Group',
      workoutType: 'Running',
      difficultyLevel: 'beginner',
      isPrivate: false,
    });
    await agent.post('/api/posts').send({
      groupId: groupRes.body._id,
      content: 'Monthly post',
      postType: 'Event',
    });

    const res = await agent.get('/api/stats/posts-by-month');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('month');
    expect(res.body[0]).toHaveProperty('postCount');
  });
});
