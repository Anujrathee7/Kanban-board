import express, { Router } from "express"
import { auth, AuthRequest } from "../middleware/auth";
import { Request,Response } from "express";
import { body } from "express-validator";
import { handleValidationError } from "../middleware/validation";
import User, { IUser } from "../models/User";
import Board, { IBoard } from "../models/Board";
import { generateToken } from "../utils/jwt";
import { Types } from "mongoose";

const router: Router = express.Router();

router.post('/register',[
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({min:6}).withMessage('Password must be at least 6 characters')
],handleValidationError,async(req: Request, res: Response)=>{
    try{
        const {name,email,password} = req.body;
        
        // Check if user already exists 
        const existingUser = await User.findOne({email});
        if(existingUser){
            res.status(400).json({message: 'User Already exist with this email.'})
            return;
        }
        const user: IUser = new User({name,email,password})
        await user.save()

        // create a new board for this user
        const board: IBoard = new Board({
            userId: user._id,
            name: "My Kanban Board"
        })
        await board.save()

        res.status(201).json({
            message:"Regsitration Successfull",
        })
    }catch(error){
        console.error('Regsitration Error',error)
        res.status(500).json({message:"Server Error during registraiton."}) 
    }
})

router.post('/login',[
    body('email').isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body('password').isLength({min: 6}).withMessage("Password must atleast be 6 characters")
],handleValidationError,async (req: Request,res: Response)=>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email})

        if(!user){
            res.status(401).json({message:"Invalid email or password"})
            return
        }

        const isPasswwordValid = await user?.comparePassword(password)
        if(!isPasswwordValid){
            res.status(401).json({message:'Invalid email or password'})
            return
        }

        const userID = user._id as Types.ObjectId
        const token = generateToken(userID.toString())

        res.status(201).json({
            message: "Login Successfull",
            token,
            name: user.name,
            email: user.email
        })
    }catch(error){
        console.error("Login Error",error)
        res.status(500).json({message:"Server Error during login"})
    }
})

router.get('/profile',auth,(req: AuthRequest, res: Response)=>{
    try{
        if(!req.user){
            res.status(401).json({message: 'User not authenticated'})
            return
        }
        res.json({
            user:{
                name: req.user.name,
                email: req.user.email
            }
        })
    }catch(error){
        console.error("Profile Error:",error)
        res.status(500).json({message:"Internal Server Error"})
    }
})


export default router


