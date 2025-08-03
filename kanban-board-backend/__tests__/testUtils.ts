import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import User from '../src/models/User';

export const createTestUser = async () => {
  const userData = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User'
  };

  // Register the user through the API
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send(userData);

  // Create token manually since your register endpoint doesn't return one
  const user = await User.findOne({ email: userData.email });
  if (!user) {
    throw new Error('Test user not found after registration');
  }
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );

  return { 
    user,
    token 
  };
};