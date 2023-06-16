import express from 'express'
import dotenv from 'dotenv'
import router from './routes/CourseRoutes.js';
import userRouter from './routes/UserRoutes.js';
import Router from './routes/paymentRoute.js';
import { connectDB } from './config/database.js';
import { errorMiddleware } from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary'
import Razorpay from 'razorpay';
import otherRouter from './routes/otherRoutes.js';
import NodeCron from 'node-cron'
import { statsSchema } from './models/Stats.js';
import cors from 'cors'
const app = express();
const corsOptions = {
    origin: 'https://ultimate-project-backend.vercel.app',
    credentials: true,
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));
dotenv.config();
connectDB();
app.use(express.urlencoded({
    extended: true
}));
export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
})
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1', router);
app.use('/api/v1', userRouter);
app.use('/api/v1', Router);
app.use('/api/v1', otherRouter);

NodeCron.schedule("0 0 0 1 * *", async () => {
    try {
        await statsSchema.create({});
    } catch (error) {
        console.log(error)
    }
})

 

app.listen(process.env.PORT, () => {
    console.log('hello world')
    console.log('successfully running on port', process.env.PORT)
})
app.use(errorMiddleware)



