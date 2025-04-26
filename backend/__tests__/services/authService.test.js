const { login, register } = require('../../services/authService');
const { User } = require('../../models');
const { AppError } = require('../../utils/errorHandler');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Mock User model
jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(() => 'hashedPassword')
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw error if username or password is missing', async () => {
      await expect(login({})).rejects.toThrow(AppError);
      await expect(login({ username: 'test' })).rejects.toThrow(AppError);
      await expect(login({ password: 'test' })).rejects.toThrow(AppError);
    });

    it('should throw error if user not found', async () => {
      User.findOne.mockResolvedValue(null);
      await expect(login({ username: 'test', password: 'test' })).rejects.toThrow(AppError);
    });

    it('should return token on successful login', async () => {
      const mockUser = { _id: new mongoose.Types.ObjectId(), role: 'user' };
      User.findOne.mockResolvedValue(mockUser);
      require('bcrypt').compare.mockResolvedValue(true);

      const token = await login({ username: 'test', password: 'test' });
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toMatchObject({ id: mockUser._id.toString(), role: mockUser.role });
    });
  });

  describe('register', () => {
    it('should throw error if username or password is missing', async () => {
      await expect(register({})).rejects.toThrow(AppError);
      await expect(register({ username: 'test' })).rejects.toThrow(AppError);
      await expect(register({ password: 'test' })).rejects.toThrow(AppError);
    });

    it('should throw error if password is too short', async () => {
      await expect(register({ username: 'test', password: '12345' })).rejects.toThrow(AppError);
    });

    it('should create user and return token on successful registration', async () => {
      const mockUser = { _id: new mongoose.Types.ObjectId(), role: 'user' };
      User.create.mockResolvedValue(mockUser);

      const token = await register({ username: 'test', password: 'test123' });
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toMatchObject({ id: mockUser._id.toString(), role: mockUser.role });
    });
  });
});