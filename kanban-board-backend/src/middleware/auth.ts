import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import User,{IUser} from "../models/User";


export interface AuthRequest extends Request{
    user?: IUser
}


//Handling user authentication for request
export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const token = req.header('Authorization')?.split(' ')[1]
        if(!token){
            res.status(401).json({message: 'Access Denied. No token provided.'})
            return;
        }

        const jwtSecret = process.env.JWT_SECRET
        if(!jwtSecret){
            res.status(500).json({message:'JWT Secret not configured'})
        }

        const decoded = jwt.verify(token,jwtSecret as string) as {userId: string};
        const user = await User.findById(decoded.userId).select('-password')
        if(!user){
            res.status(401).json({message: 'Invalid token. User not found.'})
            return
        }
        req.user = user
        next()
    }catch(error){
        res.status(401).json({message: 'Invalid token'})
    }
}