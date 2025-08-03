import express, {Router,Response} from 'express';
import { body } from 'express-validator';
import { auth,AuthRequest } from '../middleware/auth';
import { handleValidationError } from '../middleware/validation';
import Board from '../models/Board';
import Column from '../models/Column';
import Card from '../models/Card';


const router: Router = express.Router()

//All column request require authentication
router.use(auth)

//API to create new columnn
router.post('/',[body('title').trim().isLength({min: 1}).withMessage('Title is required')],
    handleValidationError,async(req: AuthRequest, res: Response)=>{
        try{
            if(!req.user){
                res.status(404).json({message:"User not authenticated"})
                return
            }

            const {title} = req.body

            //finding the board for the user
            const board = await Board.findOne({userId: req.user._id})
            if(!board){
                res.status(404).json({message:"Board not found"})
                return
            }

            //Finding last column
            const lastColumn = await Column.findOne({boardId: board._id}).sort({position: -1})
            const position = lastColumn ? lastColumn.position + 1 : 0;

            //Crating new Column
            const newColumn = await Column.create({
                boardId: board._id,
                title,
                position
            })
            
            await newColumn.save()

            res.json({
                message: "Columm created successfully",
                newColumn
            })

        }catch(error){
            console.error("Columnd error",error)
        }
})

//API to update column
router.put('/:id',[
    body('title').trim().isLength({min: 1}).withMessage('Title is required')
],handleValidationError, async(req: AuthRequest, res: Response)=>{
    try{
        if(!req.user){
            res.status(404).json({message:"User not authenticated"})
            return
        }
        const {id} = req.params
        const {title} = req.body


        //Find user board
        const board = await Board.findOne({userId: req.user._id})
        if(!board){
            res.status(404).json({message:"Board not found"})
            return
        }

        //Updating the title for the column
        const updatedColumn = await Column.findOneAndUpdate(
            {_id: id, boardId: board._id},
            {title},
            {new: true, runValidators: true}
        );
         if (!updatedColumn){
            res.status(404).json({ message: 'Column not found' });
            return;
        }

        res.json({
            message: "Column updated successfully",
            updatedColumn
        })

    }catch(error){
        console.error("Column error",error)
        res.status(500).json({message:"Internal server error"})
    }
})

router.delete('/:id',async(req: AuthRequest, res: Response)=>{
    try{
        if(!req.user){
            res.json(404).json({message:"User not authenticated"})
            return
        }
        const {id} = req.params

        // Find user's board
        const board = await Board.findOne({ userId: req.user._id });
        if (!board) {
        res.status(404).json({ message: 'Board not found' });
        return;
        }

        // Find and delete column
        const column = await Column.findOneAndDelete({
        _id: id,
        boardId: board._id
        });

        console.log(column)

        if (!column) {
        res.status(404).json({ message: 'Column not found' });
        return;
        }

        // Delete all cards in the column
        await Card.deleteMany({ columnId: column._id });

        res.json({
        message: 'Column and all its cards deleted successfully'
        });

    } catch (error) {
        console.error('Delete column error:', error);
        res.status(500).json({ message: 'Server error deleting column' });
    }
})

router.put('/reorder',async (req: AuthRequest, res: Response): Promise<void> => {
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
    const board = await Board.findOne({ userId: req.user._id });
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    // Update positions
    const updatePromises = columnIds.map((columnId, index) =>
      Column.findOneAndUpdate(
        { _id: columnId, boardId: board._id },
        { position: index },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    res.json({
      message: 'Columns reordered successfully'
    });
  } catch (error) {
    console.error('Reorder columns error:', error);
    res.status(500).json({ message: 'Server error reordering columns' });
  }
});

export default router