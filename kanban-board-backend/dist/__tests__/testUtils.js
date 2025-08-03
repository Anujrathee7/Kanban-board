"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestUser = void 0;
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../src/models/User"));
const createTestUser = async () => {
    const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User'
    };
    // Register the user through the API
    const registerResponse = await (0, supertest_1.default)(app_1.default)
        .post('/api/auth/register')
        .send(userData);
    // Create token manually since your register endpoint doesn't return one
    const user = await User_1.default.findOne({ email: userData.email });
    if (!user) {
        throw new Error('Test user not found after registration');
    }
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
    return {
        user,
        token
    };
};
exports.createTestUser = createTestUser;
