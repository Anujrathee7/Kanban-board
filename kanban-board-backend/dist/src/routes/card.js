"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const auth_2 = __importDefault(require("./auth"));
const validation_1 = require("../middleware/validation");
const Card_1 = __importDefault(require("../models/Card"));
const Column_1 = __importDefault(require("../models/Column"));
const Board_1 = __importDefault(require("../models/Board"));
const rotuer = express_1.default.Router();
// All card routes require authentication
auth_2.default.use(auth_1.auth);
// Add card
auth_2.default.post('/', [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1 }).withMessage('Card title is required'),
    (0, express_validator_1.body)('columnId').isMongoId().withMessage('Valid column ID is required')
], validation_1.handleValidationError, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const { title, description, columnId, color } = req.body;
        // Find user's board and verify column belongs to user
        const board = await Board_1.default.findOne({ userId: req.user._id });
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        const column = await Column_1.default.findOne({
            _id: columnId,
            boardId: board._id
        });
        if (!column) {
            res.status(404).json({ message: 'Column not found' });
            return;
        }
        // Get the highest position in the column
        const lastCard = await Card_1.default.findOne({ columnID: columnId })
            .sort({ position: -1 });
        const position = lastCard ? lastCard.position + 1 : 0;
        const card = new Card_1.default({
            columnID: columnId,
            title,
            description,
            position,
            color: color || '#ffffff'
        });
        await card.save();
        res.status(201).json({
            message: 'Card created successfully',
            card
        });
    }
    catch (error) {
        console.error('Create card error:', error);
        res.status(500).json({ message: 'Server error creating card' });
    }
});
//Update card
auth_2.default.put('/:id', [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1 }).withMessage('Card title is required')
], validation_1.handleValidationError, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const { id } = req.params;
        const { title, description, color } = req.body;
        // Find user's board
        const board = await Board_1.default.findOne({ userId: req.user._id });
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        // Find card and verify it belongs to user's board
        const card = await Card_1.default.findById(id).populate('columnID');
        if (!card) {
            res.status(404).json({ message: 'Card not found' });
            return;
        }
        const column = await Column_1.default.findById(card.columnID);
        if (!column || column.boardId.toString() !== board._id.toString()) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        // Update card
        card.title = title;
        if (description !== undefined)
            card.description = description;
        if (color !== undefined)
            card.color = color;
        await card.save();
        res.json({
            message: 'Card updated successfully',
            card
        });
    }
    catch (error) {
        console.error('Update card error:', error);
        res.status(500).json({ message: 'Server error updating card' });
    }
});
// Delete card
auth_2.default.delete('/:id', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const { id } = req.params;
        // Find user's board
        const board = await Board_1.default.findOne({ userId: req.user._id });
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        const card = await Card_1.default.findById(id);
        if (!card) {
            res.status(404).json({ message: 'Card not found' });
            return;
        }
        const column = await Column_1.default.findById(card.columnID);
        if (!column || column.boardId.toString() !== board._id.toString()) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        // Delete the card
        await card.deleteOne();
        // Reorder remaining cards in the same column
        const remainingCards = await Card_1.default.find({ columnID: column._id }).sort({ position: 1 });
        const reorderPromises = remainingCards.map((c, index) => Card_1.default.findByIdAndUpdate(c._id, { position: index }));
        await Promise.all(reorderPromises);
        res.json({ message: 'Card deleted and positions reordered successfully' });
    }
    catch (error) {
        console.error('Delete card error:', error);
        res.status(500).json({ message: 'Server error deleting card' });
    }
});
// Move card to a different column or different position in same column
auth_2.default.put('/:id/move', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const { id } = req.params;
        const { targetColumnId, targetPosition } = req.body;
        // Find user's board
        const board = await Board_1.default.findOne({ userId: req.user._id });
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        const card = await Card_1.default.findById(id);
        if (!card) {
            res.status(404).json({ message: 'Card not found' });
            return;
        }
        const sourceColumn = await Column_1.default.findById(card.columnID);
        const targetColumn = await Column_1.default.findById(targetColumnId);
        if (!sourceColumn || !targetColumn ||
            sourceColumn.boardId.toString() !== board._id.toString() ||
            targetColumn.boardId.toString() !== board._id.toString()) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        const sameColumn = sourceColumn._id.toString() === targetColumnId;
        if (sameColumn) {
            // Moving within the same column
            let cards = await Card_1.default.find({ columnID: sourceColumn._id }).sort({ position: 1 });
            // Remove the card from its old position
            cards = cards.filter(c => c._id.toString() !== id);
            // Insert at new position
            cards.splice(targetPosition, 0, card);
            // Update positions
            const updatePromises = cards.map((c, index) => Card_1.default.findByIdAndUpdate(c._id, { position: index }));
            await Promise.all(updatePromises);
            card.position = targetPosition;
            await card.save();
        }
        else {
            // Moving across columns
            const sourceCards = await Card_1.default.find({ columnID: sourceColumn._id, _id: { $ne: id } }).sort({ position: 1 });
            const targetCards = await Card_1.default.find({ columnID: targetColumn._id }).sort({ position: 1 });
            // Reorder source column
            const updateSourcePromises = sourceCards.map((c, index) => Card_1.default.findByIdAndUpdate(c._id, { position: index }));
            // Insert the card into the target column array at the desired position
            targetCards.splice(targetPosition, 0, card);
            // Reorder target column
            const updateTargetPromises = targetCards.map((c, index) => Card_1.default.findByIdAndUpdate(c._id, {
                columnID: targetColumn._id,
                position: index
            }));
            await Promise.all([...updateSourcePromises, ...updateTargetPromises]);
        }
        res.json({
            message: 'Card moved successfully',
            card
        });
    }
    catch (error) {
        console.error('Move card error:', error);
        res.status(500).json({ message: 'Server error moving card' });
    }
});
exports.default = auth_2.default;
