"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const Board_1 = __importDefault(require("../models/Board"));
const Column_1 = __importDefault(require("../models/Column"));
const Card_1 = __importDefault(require("../models/Card"));
const router = express_1.default.Router();
//All column request require authentication
router.use(auth_1.auth);
//API to create new columnn
router.post('/', [(0, express_validator_1.body)('title').trim().isLength({ min: 1 }).withMessage('Title is required')], validation_1.handleValidationError, async (req, res) => {
    try {
        if (!req.user) {
            res.status(404).json({ message: "User not authenticated" });
            return;
        }
        const { title } = req.body;
        //finding the board for the user
        const board = await Board_1.default.findOne({ userId: req.user._id });
        if (!board) {
            res.status(404).json({ message: "Board not found" });
            return;
        }
        //Finding last column
        const lastColumn = await Column_1.default.findOne({ boardId: board._id }).sort({ position: -1 });
        const position = lastColumn ? lastColumn.position + 1 : 0;
        //Crating new Column
        const newColumn = await Column_1.default.create({
            boardId: board._id,
            title,
            position
        });
        await newColumn.save();
        res.json({
            message: "Columm created successfully",
            newColumn
        });
    }
    catch (error) {
        console.error("Columnd error", error);
    }
});
//API to update column
router.put('/:id', [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1 }).withMessage('Title is required')
], validation_1.handleValidationError, async (req, res) => {
    try {
        if (!req.user) {
            res.status(404).json({ message: "User not authenticated" });
            return;
        }
        const { id } = req.params;
        const { title } = req.body;
        //Find user board
        const board = await Board_1.default.findOne({ userId: req.user._id });
        if (!board) {
            res.status(404).json({ message: "Board not found" });
            return;
        }
        //Updating the title for the column
        const updatedColumn = await Column_1.default.findOneAndUpdate({ _id: id, boardId: board._id }, { title }, { new: true, runValidators: true });
        if (!updatedColumn) {
            res.status(404).json({ message: 'Column not found' });
            return;
        }
        res.json({
            message: "Column updated successfully",
            updatedColumn
        });
    }
    catch (error) {
        console.error("Column error", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        if (!req.user) {
            res.json(404).json({ message: "User not authenticated" });
            return;
        }
        const { id } = req.params;
        // Find user's board
        const board = await Board_1.default.findOne({ userId: req.user._id });
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        // Find and delete column
        const column = await Column_1.default.findOneAndDelete({
            _id: id,
            boardId: board._id
        });
        console.log(column);
        if (!column) {
            res.status(404).json({ message: 'Column not found' });
            return;
        }
        // Delete all cards in the column
        await Card_1.default.deleteMany({ columnId: column._id });
        res.json({
            message: 'Column and all its cards deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete column error:', error);
        res.status(500).json({ message: 'Server error deleting column' });
    }
});
router.put('/reorder', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const { columnIds } = req.body;
        if (!Array.isArray(columnIds)) {
            res.status(400).json({ message: 'columnIds must be an array' });
            return;
        }
        // Find user's board
        const board = await Board_1.default.findOne({ userId: req.user._id });
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        // Update positions
        const updatePromises = columnIds.map((columnId, index) => Column_1.default.findOneAndUpdate({ _id: columnId, boardId: board._id }, { position: index }, { new: true }));
        await Promise.all(updatePromises);
        res.json({
            message: 'Columns reordered successfully'
        });
    }
    catch (error) {
        console.error('Reorder columns error:', error);
        res.status(500).json({ message: 'Server error reordering columns' });
    }
});
exports.default = router;
