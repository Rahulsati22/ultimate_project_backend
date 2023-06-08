import express from 'express'
import dotenv from 'dotenv'
import router from './routes/CourseRoutes.js';
import userRouter from './routes/UserRoutes.js';
import { connectDB } from './config/database.js';
import { errorMiddleware } from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary'
const app = express();
dotenv.config();
connectDB();
app.use(express.urlencoded({
    extended: true
}));
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1', router);
app.use('/api/v1', userRouter);
app.listen(process.env.PORT, () => {
    console.log('hello world')
    console.log('successfully running on port', process.env.PORT)
})
app.use(errorMiddleware)



