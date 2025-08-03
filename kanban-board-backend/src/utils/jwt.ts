import jwt from "jsonwebtoken"
import { token } from "morgan"

export const generateToken = (userId: string): string=>{
    const jwtSecret = process.env.JWT_SECRET;
    if(!jwtSecret){
        throw new Error("JWT_SECRET enviornment is not defined")
    }

    return jwt.sign({userId},jwtSecret as string,{
        expiresIn: "1d"
    });
}