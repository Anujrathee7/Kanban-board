"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoURL = process.env.MONGODB_URL;
        if (!mongoURL) {
            throw new Error("MONGODB_URL enviornment variable is not defined.");
        }
        await mongoose_1.default.connect(mongoURL);
        mongoose_1.default.Promise = Promise;
        console.log('Mongo Db connected succesfully.');
    }
    catch (error) {
        console.log("Mongo Db connection error:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
