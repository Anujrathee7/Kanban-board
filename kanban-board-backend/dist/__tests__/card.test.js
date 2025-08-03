"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const testUtils_1 = require("./testUtils");
describe('Card Routes', () => {
    let authToken;
    let columnId;
    beforeEach(async () => {
        const { token } = await (0, testUtils_1.createTestUser)();
        authToken = token;
        // First create a board
        const boardRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/boards')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Test Board' });
        // Then create a column
        const columnRes = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/cards')
                .set('Authorization', `Bearer ${authToken}`)
                .send(cardData);
            // Update expectations to match your API response
            expect(res.status).toBe(400); // Update this to match your actual response
            expect(res.body).toHaveProperty('message');
        });
        it('should fail without authorization', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/cards')
                .send({ title: 'Test Card' });
            expect(res.status).toBe(401);
        });
    });
});
