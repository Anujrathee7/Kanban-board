"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const testUtils_1 = require("./testUtils");
describe('Board Routes', () => {
    let authToken;
    let userId;
    beforeEach(async () => {
        const { token, user } = await (0, testUtils_1.createTestUser)();
        authToken = token;
        // Assert user has _id property of type string or ObjectId
        userId = user._id.toString();
    });
    describe('GET /api/boards', () => {
        it('should get user board', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/boards')
                .set('Authorization', `Bearer ${authToken}`)
                .send(boardData);
            expect(res.status).toBe(200);
            // Update expectation to match your actual response
            expect(res.body).toHaveProperty('message');
        });
    });
});
