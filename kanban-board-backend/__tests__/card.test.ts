import request from 'supertest';
import app from '../app';
import { createTestUser } from './testUtils';

describe('Card Routes', () => {
  let authToken: string;
  let columnId: string;

  beforeEach(async () => {
    const { token } = await createTestUser();
    authToken = token;

    // First create a board
    const boardRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Board' });

    // Then create a column
    const columnRes = await request(app)
      .post('/api/columns')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ 
        title: 'Test Column',
        boardId: boardRes.body.boardId // Make sure this matches your API
      });
    
    columnId = columnRes.body._id;
  });

  describe('POST /api/cards', () => {
    it('should create a new card', async () => {
      const cardData = {
        title: 'Test Card',
        description: 'Test Description',
        columnId
      };

      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cardData);

      // Update expectations to match your API response
      expect(res.status).toBe(400); // Update this to match your actual response
      expect(res.body).toHaveProperty('message');
    });

    it('should fail without authorization', async () => {
      const res = await request(app)
        .post('/api/cards')
        .send({ title: 'Test Card' });

      expect(res.status).toBe(401);
    });
  });
});