import expresss,{ Router,Response } from "express";
import Board,{IBoard} from "../models/Board";
import { auth,AuthRequest } from "../middleware/auth";
import { IUser } from "../models/User";
import Column, { IColumn } from "../models/Column";
import Card from "../models/Card";
import { Types } from "mongoose";
const router: Router = expresss.Router()

//All board routes use the authentication middleware
router.use(auth);

router.get('/',async(req: AuthRequest, res:Response)=>{
    try{
        const user: IUser|undefined = req.user
        if(!user){
            res.status(401).json({message:"User not authenticated"})
            return
        }

        //Get board for the user

        let board: IBoard | null = await Board.findOne({userId: user._id})

        if(!board){
            board = new Board({
                userId: user._id,
                name:"My Kanban board"
            })
            await board.save();
        }

        //Get Column for the board

        const columns = await Column.find({boardId: board._id})

        const cards = await Card.find({columnID:{$in: columns.map(column => column._id)}}).sort({position: 1})

        const columnsWithCards = columns.map(column => ({
            ...column.toObject(),
            cards: cards.filter(card => card.columnID.toString() === (column._id as Types.ObjectId).toString())
        }));

        res.json({
            board:{
                ...board.toObject(),
                columns: columnsWithCards
            }
        })


    }catch(error){
        res.status(500).json({message:"Internal Server error"})
    }
})

//Route to update board title

router.post('/',async (req: AuthRequest, res: Response)=>{
    try{
        if(!req.user){
            res.status(401).json({message:"User not found"})
            return
        }

        const {name} = req.body

        console.log(name)
        //Update board name
        const board = await Board.findOneAndUpdate(
            {userId: req.user._id},
            {name},
            { new: true, runValidators: true }
        )
        //check if the board exist
        if(!board){
            res.status(404).json({message: "Board does not exist"})
            return
        }

        res.json({
            message: "Updated successfully",
        })
    }catch(error){
        console.error("Board error",error)
        res.status(500).json({message:"Error updating board"})
    }
})

export default router