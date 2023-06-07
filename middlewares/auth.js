import jwt from 'jsonwebtoken'
import { catchAsyncError } from './catchAsyncError.js'
import ErrorHandler from '../utils/errorHandler.js';
import { userSchema } from '../models/User.js';

export const isAuthenticated = catchAsyncError(async (request, response, next) => {
    if (!request.cookies) return next(new ErrorHandler("Please login first", 401));
    const { token } = request.cookies;
    if (!token) {
        return next(new ErrorHandler("Please login first", 401));
    }
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await userSchema.findById(decoded._id);
    request.user = user;
    next();

})

