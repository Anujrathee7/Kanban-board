import { error } from "console";
import { Request,Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const handleValidationError = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({
            message:"Validation errors",
            errors: errors.array()
        });
        return
    }
    next()
}
