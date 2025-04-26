const request = require('supertest');
const app = require('../../app');
const { User } = require('../../models');
const { generateToken } = require('../../utils/token');
const mongoose = require('mongoose');

jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should return 400 if username or password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should return 401 for invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'test', password: 'wrong' });
      
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should return token for valid credentials', async () => {
      const mockUser = { _id: new mongoose.Types.ObjectId(), role: 'user' };
      User.findOne.mockResolvedValue(mockUser);
      require('bcrypt').compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'test', password: 'correct' });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeTruthy();
    });
  });

  describe('POST /auth/register', () => {
    it('should return 403 if no token provided', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ username: 'new', password: 'password123' });
      
      expect(response.status).toBe(401);
    });

    it('should return 403 if non-admin token provided', async () => {
      const token = generateToken({ id: new mongoose.Types.ObjectId(), role: 'user' });

      const response = await request(app)
        .post('/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'new', password: 'password123' });
      
      expect(response.status).toBe(403);
    });

    it('should create user if admin token provided', async () => {
      const token = generateToken({ id: new mongoose.Types.ObjectId(), role: 'admin' });
      const mockUser = { _id: new mongoose.Types.ObjectId(), role: 'user' };
      User.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'new', password: 'password123' });
      
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeTruthy();
    });
  });
});