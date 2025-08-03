import express,{ Router,Response } from "express";
import { body } from "express-validator";
import { auth,AuthRequest } from "../middleware/auth";
import router from "./auth";
import { handleValidationError } from "../middleware/validation";
import Card from "../models/Card";
import Column from "../models/Column";
import Board, { IBoard } from "../models/Board";
import { Types } from "mongoose";

const rotuer: Router = express.Router();

// All card routes require authentication
router.use(auth);


// Add card
router.post('/', [
  body('title').trim().isLength({ min: 1 }).withMessage('Card title is required'),
  body('columnId').isMongoId().withMessage('Valid column ID is required')
], handleValidationError, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { title, description, columnId, color } = req.body;

    // Find user's board and verify column belongs to user
    const board = await Board.findOne({ userId: req.user._id });
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    const column = await Column.findOne({
      _id: columnId,
      boardId: board._id
    });

    if (!column) {
      res.status(404).json({ message: 'Column not found' });
      return;
    }

    // Get the highest position in the column
    const lastCard = await Card.findOne({ columnID: columnId })
      .sort({ position: -1 });

    const position = lastCard ? lastCard.position + 1 : 0;

    const card = new Card({
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
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ message: 'Server error creating card' });
  }
});



//Update card
router.put('/:id', [
  body('title').trim().isLength({ min: 1 }).withMessage('Card title is required')
], handleValidationError, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const { title, description, color } = req.body;

    // Find user's board
    const board = await Board.findOne({ userId: req.user._id });
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    // Find card and verify it belongs to user's board
    const card = await Card.findById(id).populate('columnID');
    if (!card) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    const column = await Column.findById(card.columnID);

    if (!column || column.boardId.toString() !== (board._id as Types.ObjectId).toString()) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Update card
    card.title = title;
    if (description !== undefined) card.description = description;
    if (color !== undefined) card.color = color;

    await card.save();

    res.json({
      message: 'Card updated successfully',
      card
    });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ message: 'Server error updating card' });
  }
});


// Delete card
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    // Find user's board
    const board = await Board.findOne({ userId: req.user._id });
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    const card = await Card.findById(id);
    if (!card) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    const column = await Column.findById(card.columnID);
    if (!column || column.boardId.toString() !== (board._id as Types.ObjectId).toString()) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Delete the card
    await card.deleteOne();

    // Reorder remaining cards in the same column
    const remainingCards = await Card.find({ columnID: column._id }).sort({ position: 1 });
    const reorderPromises = remainingCards.map((c, index) =>
      Card.findByIdAndUpdate(c._id, { position: index })
    );
    await Promise.all(reorderPromises);

    res.json({ message: 'Card deleted and positions reordered successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ message: 'Server error deleting card' });
  }
});



// Move card to a different column or different position in same column
router.put('/:id/move', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const { targetColumnId, targetPosition } = req.body;

    // Find user's board
    const board = await Board.findOne({ userId: req.user._id });
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    const card = await Card.findById(id);
    if (!card) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    const sourceColumn = await Column.findById(card.columnID);
    const targetColumn = await Column.findById(targetColumnId);

    if (!sourceColumn || !targetColumn ||
        sourceColumn.boardId.toString() !== (board._id as Types.ObjectId).toString() ||
        targetColumn.boardId.toString() !== (board._id as Types.ObjectId).toString()) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const sameColumn = (sourceColumn._id as Types.ObjectId).toString() === targetColumnId;

    if (sameColumn) {
      // Moving within the same column
      let cards = await Card.find({ columnID: sourceColumn._id }).sort({ position: 1 });

      // Remove the card from its old position
      cards = cards.filter(c => (c._id as Types.ObjectId).toString() !== id);

      // Insert at new position
      cards.splice(targetPosition, 0, card);

      // Update positions
      const updatePromises = cards.map((c, index) =>
        Card.findByIdAndUpdate(c._id, { position: index })
      );
      await Promise.all(updatePromises);

      card.position = targetPosition;
      await card.save();

    } else {
      // Moving across columns
      const sourceCards = await Card.find({ columnID: sourceColumn._id, _id: { $ne: id } }).sort({ position: 1 });
      const targetCards = await Card.find({ columnID: targetColumn._id }).sort({ position: 1 });

      // Reorder source column
      const updateSourcePromises = sourceCards.map((c, index) =>
        Card.findByIdAndUpdate(c._id, { position: index })
      );

      // Insert the card into the target column array at the desired position
      targetCards.splice(targetPosition, 0, card);

      // Reorder target column
      const updateTargetPromises = targetCards.map((c, index) =>
        Card.findByIdAndUpdate(c._id, {
          columnID: targetColumn._id,
          position: index
        })
      );

      await Promise.all([...updateSourcePromises, ...updateTargetPromises]);
    }

    res.json({
      message: 'Card moved successfully',
      card
    });
  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({ message: 'Server error moving card' });
  }
});

export default router


