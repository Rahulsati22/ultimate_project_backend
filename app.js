import express from 'express'
import dotenv from 'dotenv'
import router from './routes/CourseRoutes.js';
import userRouter from './routes/UserRoutes.js';
import { connectDB } from './config/database.js';
import { errorMiddleware } from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';
const app = express();
dotenv.config();
connectDB();
app.use(express.urlencoded({
    extended:true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1', router);
app.use('/api/v1', userRouter);
app.listen(process.env.PORT, () => {
    console.log('hello world')
    console.log('successfully running on port', process.env.PORT)
})
app.use(errorMiddleware)



