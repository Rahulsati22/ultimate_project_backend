import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { instance } from "../app.js";
import { userSchema } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import crypto from 'crypto'
import { paymentSchema } from "../models/Payment.js";
export const buySubscription = catchAsyncError(async function (request, response, next) {
    // firstly we have to find the user
    const user = await userSchema.findById(request.user._id);
    if (user.role === 'admin') {
        return next(new ErrorHandler("Admin can't buy subscription", 404));
    }
    const plan_id = process.env.PLAN_ID;
    const subscription = instance.subscriptions.create({
        plan_id: plan_id,
        customer_notify: 1,
        total_count: 12
    }).then(async (elem) => {
        user.subscription.id = elem.id,
        user.subscription.status = elem.status
        await user.save()
        return response.status(201).json({
            success: true,
            subscriptionId: elem.id,
        })
    }).catch((error) => {
        return response.status(500).json({
            success: false,
            message: "Internal server error"
        })
    })
})



export const paymentVerification = catchAsyncError(async (request, response, next) => {
    const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } = request.body;
    const user = await userSchema.findById(request.user._id);
    const subscription_id = user.subscription.id
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET).update(razorpay_payment_id + "|" + subscription_id, "utf-8").digest("hex")
    const isAuthenctic = generatedSignature === razorpay_signature
    if (!isAuthenctic) {
        return response.redirect(`${process.env.FRONTEND_URL}/paymentfailed`)
    }
    await paymentSchema.create({
        razorpay_subscription_id,
        razorpay_payment_id,
        razorpay_signature
    })

    user.subscription.status = "active"
    await user.save();

    return response.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`)
 
    
})


export const getRazorPayKey = catchAsyncError(async (request, response, next) => {
    return response.status(200).json({
        success: true,
        key: process.env.RAZORPAY_KEY
    })
})


export const cancelSubscription = catchAsyncError(async (request, response, next) => {
    const user = await userSchema.findById(request.user._id);
    const subscriptionId = user.subscription.id;
    instance.subscriptions.cancel(subscriptionId)
    const payment = await paymentSchema.findOne({ razorpay_subscription_id: subscriptionId })
    const gap = Date.now() - payment.createdAt;
    const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;

    if (gap < refundTime) {
        instance.payments.refund(payment.razorpay_payment_id).then(async (elem) => {
            await paymentSchema.findByIdAndDelete(payment._id);
            user.subscription.id = undefined
            user.subscription.status = undefined
            await user.save();
            return response.status(200).json({
                success: true,
                message: "Payment cancelled, You will receive full refund within 7 days"
            })
        }).catch((error) => {
            return response.status(500).json({
                success: false,
                message: "Internal server error"
            })
        })
    }
    else {
        user.subscription.id = undefined
        user.subscription.status = undefined
        await user.save();
        return response.status(200).json({
            success: true,
            message: "Subscription cancelled but payment will not refund as the subscription is cancelled after 7 days"
        })
    }
})