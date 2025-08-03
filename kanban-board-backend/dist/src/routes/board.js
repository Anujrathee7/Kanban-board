"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Board_1 = __importDefault(require("../models/Board"));
const auth_1 = require("../middleware/auth");
const Column_1 = __importDefault(require("../models/Column"));
const Card_1 = __importDefault(require("../models/Card"));
const router = express_1.default.Router();
//All board routes use the authentication middleware
router.use(auth_1.auth);
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        //Get board for the user
        let board = await Board_1.default.findOne({ userId: user._id });
        if (!board) {
            board = new Board_1.default({
                userId: user._id,
                name: "My Kanban board"
            });
            await board.save();
        }
        //Get Column for the board
        const columns = await Column_1.default.find({ boardId: board._id });
        const cards = await Card_1.default.find({ columnID: { $in: columns.map(column => column._id) } }).sort({ position: 1 });
        const columnsWithCards = columns.map(column => ({
            ...column.toObject(),
            cards: cards.filter(card => card.columnID.toString() === column._id.toString())
        }));
        res.json({
            board: {
                ...board.toObject(),
                columns: columnsWithCards
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server error" });
    }
});
//Route to update board title
router.post('/', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not found" });
            return;
        }
        const { name } = req.body;
        console.log(name);
        //Update board name
        const board = await Board_1.default.findOneAndUpdate({ userId: req.user._id }, { name }, { new: true, runValidators: true });
        //check if the board exist
        if (!board) {
            res.status(404).json({ message: "Board does not exist" });
            return;
        }
        res.json({
            message: "Updated successfully",
        });
    }
    catch (error) {
        console.error("Board error", error);
        res.status(500).json({ message: "Error updating board" });
    }
});
exports.default = router;
