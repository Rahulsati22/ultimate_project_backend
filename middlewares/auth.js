import jwt from 'jsonwebtoken'
import { catchAsyncError } from './catchAsyncError.js'
import ErrorHandler from '../utils/errorHandler.js';
import { userSchema } from '../models/User.js';

export const isAuthenticated = catchAsyncError(async (request, response, next) => {
    if (!request.cookies) return next(new ErrorHandler("Please login first", 401));
    const { token } = request.cookies;
    console.log(token, "I am request cookie token")
    if (!token) {
        return next(new ErrorHandler("Please login first", 401));
    }
    const decoded =  jwt.verify(token, process.env.SECRET);
    const user = await userSchema.findById(decoded._id);
    request.user = user;
    next();

})



export const authorizeAdmin = catchAsyncError(async (request, response, next) => {
    if (!request.cookies) return next(new ErrorHandler("Please login first", 401));
    const { token } = request.cookies;
    if (!token) {
        return next(new ErrorHandler("Please login first", 401));
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await userSchema.findById(decoded._id);
    if (user.role !== 'admin') {
        return next(new ErrorHandler("Only admins can access this functionality", 401));
    }
    next();
})


export const authorizeSubscribers = catchAsyncError(async (request, response, next)=>{
    if (request.user.subscription.status !== 'active' && request.user.role !== 'admin'){
        return next(new ErrorHandler("Only subscriber can access video lectures", 404))
    }
    next();
})