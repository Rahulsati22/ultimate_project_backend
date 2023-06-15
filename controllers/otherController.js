import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { statsSchema } from "../models/Stats.js";
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
    const stats = await statsSchema.find().sort({createdAt:"desc"}).limit(12);

    const statsData = [];

    const requiredSize = 12 - stats.length;

    for (let i = 0; i < stats.length; i++){
        statsData.unshift(stats[i]);
    }

    for (let i = 0; i < requiredSize; i++){
        statsData.unshift({
            users:0,
            subscriptions:0,
            views : 0
        })
    }

    const usersCount = statsData[11].users;
    const viewsCount = statsData[11].views;
    const subscriptionsCount = statsData[11].subscriptions

    

    return response.status(200).json({
        success : true,
        stats : statsData,
        usersCount,
        viewsCount,
        subscriptionsCount
    })

})