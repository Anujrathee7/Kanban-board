import request from 'supertest';
import app from '../app';
import { createTestUser } from './testUtils';

describe('Board Routes', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    const { token, user } = await createTestUser();
    authToken = token;
    // Assert user has _id property of type string or ObjectId
    userId = (user as { _id: { toString: () => string } })._id.toString();
  });

  describe('GET /api/boards', () => {
    it('should get user board', async () => {
      const res = await request(app)
        .get('/api/boards')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      // Update expectation based on your actual response structure
      expect(res.body).toBeTruthy();
    });
  });

  describe('POST /api/boards', () => {
    it('should create/update board name', async () => {
      const boardData = { name: 'Test Board' };
      
      const res = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(boardData);

      expect(res.status).toBe(200);
      // Update expectation to match your actual response
      expect(res.body).toHaveProperty('message');
    });
  });
});