import request from 'supertest';
import app from '../app';
import User from '../src/models/User';

describe('Auth Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Regsitration Successfull');
      
      // Verify user was created in database
      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeTruthy();
      expect(user!.email).toBe(testUser.email);
      expect(user!.name).toBe(testUser.name);
    });

    it('should not register user with existing email', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message');
    });
  });
});