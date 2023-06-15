import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { statsSchema } from "../models/Stats.js";
import {userSchema} from '../models/User.js'
export const contactUs = catchAsyncError(async (request, response, next) => {

    const { name, email, message } = request.body;
    if (!name || !email || !message) {
        return next(new ErrorHandler("All fields are mandatory", 400));
    }
    const to = process.env.MY_MAIL;
    const subject = "Contact from course bundler";
    const text = `I am ${name} and my email is ${email} .\n ${message}`

    await sendEmail(to, subject, text);

    return response.status(200).json({
        success: true,
        message: "Form submitted successfully"
    })
})


export const courseRequest = catchAsyncError(async (request, response, next) => {
    const { name, email, course } = request.body;
    if (!name || !email || !course) {
        return next(new ErrorHandler("All fields are required", 400));
    }
    const to = process.env.MY_MAIL;
    const subject = "Request from course bundler";
    const text = `I am ${name} and my email is ${email} .\n ${course}`

    await sendEmail(to, subject, text);

    return response.status(200).json({
        success: true,
        message: "Form submitted successfully"
    })
})


export const getDashboardStats = catchAsyncError(async (request, response, next) => {
    const stats = await statsSchema.find({}).sort({ createdAt: "desc" }).limit(12);
    const statsData = [];
    for (let i = 0; i < stats.length; i++) {
        statsData.unshift(stats[i]);
    }
    const requiredSize = 12 - stats.length;
    for (let i = 0; i < requiredSize; i++) {
        statsData.unshift({
            users: 0,
            subscriptions: 0,
            views: 0
        });
    }
    const usersCount = statsData[11].users;
    const subscriptionsCount = statsData[11].subscriptions;
    const viewsCount = statsData[11].views;
    let usersProfit = false, subscriptionsProfit = false, viewsProfit = false;
    let usersPercentage = 0, subscriptionsPercentage = 0, viewsPercentage = 0;

    if (statsData[10].users === 0) usersPercentage = usersCount;
    else usersPercentage = (statsData[11].users - statsData[10].users) / statsData[10].users * 100;
    if (statsData[10].views === 0) viewsPercentage = viewsCount;
    else viewsPercentage = (statsData[11].views - statsData[10].views) / statsData[10].views * 100;
    if (statsData[10].subscriptions === 0) subscriptionsPercentage = subscriptionsCount;
    else subscriptionsPercentage = (statsData[11].subscriptions - statsData[10].subscriptions) / statsData[10].subscriptions * 100;

    if (usersPercentage >= 0) {
        usersProfit = true;
    }
    if (viewsPercentage >= 0) {
        viewsProfit = true;
    }
    if (subscriptionsPercentage >= 0) {
        subscriptionsProfit = true;
    }

    const user2Count = await userSchema.countDocuments();


    return response.status(200).json({
        success: true,
        stats: statsData,
        usersCount,
        subscriptionsCount,
        viewsCount,
        usersPercentage,
        viewsPercentage,
        subscriptionsPercentage,
        viewsProfit,
        subscriptionsProfit,
        usersProfit,
        user2Count
    })
})