import mongoose, { Connection } from "mongoose";

export const connectDB =  async(): Promise<void>=>{
    try{
        const mongoURL = process.env.MONGODB_URL;
        if(!mongoURL){
            throw new Error("MONGODB_URL enviornment variable is not defined.")
        }

        await mongoose.connect(mongoURL)
        mongoose.Promise = Promise
        console.log('Mongo Db connected succesfully.');
    }catch(error){
        console.log("Mongo Db connection error:",error)
        process.exit(1);

    }
}