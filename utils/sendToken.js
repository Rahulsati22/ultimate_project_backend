import { userSchema } from "../models/User.js"

export const sendToken = (response, user, message, statusCode = 200) => {
    const token = user.getToken();
    console.log(token)
    const options = {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
        httpOnly: true,
        // secure: true,
        sameSite: 'none',
    }
    return response.status(statusCode).cookie('token', token, options).json({
        success: true,
        message: message,
        user
    })
}