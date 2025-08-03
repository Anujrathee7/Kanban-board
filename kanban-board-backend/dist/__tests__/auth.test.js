"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const User_1 = __importDefault(require("../src/models/User"));
describe('Auth Routes', () => {
    beforeEach(async () => {
        await User_1.default.deleteMany({});
    });
    const testUser = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
    };
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(testUser);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('message', 'Regsitration Successfull');
            // Verify user was created in database
            const user = await User_1.default.findOne({ email: testUser.email });
            expect(user).toBeTruthy();
            expect(user.email).toBe(testUser.email);
            expect(user.name).toBe(testUser.name);
        });
        it('should not register user with existing email', async () => {
            await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser);
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(testUser);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
        });
    });
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(testUser);
        });
        it('should login existing user', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
