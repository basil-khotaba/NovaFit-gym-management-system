const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const { connect, closeDatabase, clearDatabase } = require('./testDb');

let adminToken;
let memberToken;
let trainerId;

beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  await closeDatabase();
});

afterEach(async () => {
  await clearDatabase();
});

/**
 * Every test in this file needs a logged-in admin (to manage classes)
 * and a trainer (every class requires one), so set that up fresh
 * before each test rather than relying on state left by a previous one.
 */
beforeEach(async () => {
  await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
  });
  await User.create({
    name: 'Member',
    email: 'member@test.com',
    password: 'password123',
    role: 'member',
  });

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'password123' });
  adminToken = adminLogin.body.token;

  const memberLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'member@test.com', password: 'password123' });
  memberToken = memberLogin.body.token;

  const trainer = await Trainer.create({ name: 'Alex Trainer' });
  trainerId = trainer._id.toString();
});

const validClass = () => ({
  name: 'Morning HIIT',
  category: 'HIIT',
  durationMinutes: 45,
  schedule: 'Mon/Wed/Fri 7:00am',
  capacity: 20,
  trainer: trainerId,
});

describe('Classes API — CRUD', () => {
  test('GET /api/classes is public and starts empty', async () => {
    const res = await request(app).get('/api/classes');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('rejects creating a class without a token', async () => {
    const res = await request(app).post('/api/classes').send(validClass());
    expect(res.statusCode).toBe(401);
  });

  test('rejects creating a class as a non-admin member', async () => {
    const res = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${memberToken}`)
      .send(validClass());
    expect(res.statusCode).toBe(403);
  });

  test('admin can create a class', async () => {
    const res = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validClass());

    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe('Morning HIIT');
    expect(res.body.data.trainer).toBe(trainerId);
  });

  test('rejects creating a class with missing required fields', async () => {
    const res = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Incomplete class' });

    expect(res.statusCode).toBe(400);
  });

  test('admin can update and delete a class; changes are reflected on GET', async () => {
    const create = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validClass());
    const classId = create.body.data._id;

    const update = await request(app)
      .put(`/api/classes/${classId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ capacity: 30 });
    expect(update.statusCode).toBe(200);
    expect(update.body.data.capacity).toBe(30);

    const getOne = await request(app).get(`/api/classes/${classId}`);
    expect(getOne.body.data.capacity).toBe(30);

    const del = await request(app)
      .delete(`/api/classes/${classId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(del.statusCode).toBe(200);

    const getAfterDelete = await request(app).get(`/api/classes/${classId}`);
    expect(getAfterDelete.statusCode).toBe(404);
  });
});
