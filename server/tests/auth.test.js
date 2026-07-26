const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./testDb');

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Auth API', () => {
  const credentials = {
    name: 'Test Member',
    email: 'member@test.com',
    password: 'password123',
  };

  test('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(credentials);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(credentials.email);
    // Password must never be echoed back to the client.
    expect(res.body.user.password).toBeUndefined();
  });

  test('rejects registering the same email twice', async () => {
    await request(app).post('/api/auth/register').send(credentials);
    const res = await request(app).post('/api/auth/register').send(credentials);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('rejects registration missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: credentials.email });

    expect(res.statusCode).toBe(400);
  });

  test('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(credentials);

    const res = await request(app).post('/api/auth/login').send({
      email: credentials.email,
      password: credentials.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(credentials.email);
  });

  test('rejects login with the wrong password', async () => {
    await request(app).post('/api/auth/register').send(credentials);

    const res = await request(app).post('/api/auth/login').send({
      email: credentials.email,
      password: 'wrong-password',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me requires a valid token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me returns the logged-in user with a valid token', async () => {
    const register = await request(app).post('/api/auth/register').send(credentials);
    const token = register.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(credentials.email);
  });
});
