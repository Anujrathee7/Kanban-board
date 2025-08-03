import express,{ Express } from "express";
import { connectDB } from "./src/config/database";
import dotenv from "dotenv"
import helmet from "helmet";
import morgan = require("morgan");
import cors from "cors";
import authRouter from "./src/routes/auth";
import boardRouter from "./src/routes/board";
import columnRouter from "./src/routes/column";
import cardRouter from "./src/routes/card";

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 5000;
connectDB();


//Middleware
app.use(morgan('dev'))
app.use(express.json())
app.use(helmet())
//FOR PRODUCTION SPECIFY ALLOWED ORGINS
app.use(cors())
app.use(express.urlencoded({extended: true}))

//Routes
app.use('/api/auth',authRouter)
app.use('/api/boards',boardRouter)
app.use('/api/columns',columnRouter)
app.use('/api/cards',cardRouter)

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app