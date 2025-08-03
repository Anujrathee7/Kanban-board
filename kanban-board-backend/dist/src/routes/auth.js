"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const User_1 = __importDefault(require("../models/User"));
const Board_1 = __importDefault(require("../models/Board"));
const jwt_1 = require("../utils/jwt");
const router = express_1.default.Router();
router.post('/register', [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validation_1.handleValidationError, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists 
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User Already exist with this email.' });
            return;
        }
        const user = new User_1.default({ name, email, password });
        await user.save();
        // create a new board for this user
        const board = new Board_1.default({
            userId: user._id,
            name: "My Kanban Board"
        });
        await board.save();
        res.status(201).json({
            message: "Regsitration Successfull",
        });
    }
    catch (error) {
        console.error('Regsitration Error', error);
        res.status(500).json({ message: "Server Error during registraiton." });
    }
});
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage("Password must atleast be 6 characters")
], validation_1.handleValidationError, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        const isPasswwordValid = await user?.comparePassword(password);
        if (!isPasswwordValid) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const userID = user._id;
        const token = (0, jwt_1.generateToken)(userID.toString());
        res.status(201).json({
            message: "Login Successfull",
            token,
            name: user.name,
            email: user.email
        });
    }
    catch (error) {
        console.error("Login Error", error);
        res.status(500).json({ message: "Server Error during login" });
    }
});
router.get('/profile', auth_1.auth, (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        res.json({
            user: {
                name: req.user.name,
                email: req.user.email
            }
        });
    }
    catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.default = router;
