import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { userSchema } from "../models/User.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import cloudinary from 'cloudinary'
import crypto from 'crypto'
import { courseSchema } from "../models/Course.js";
import getDataUri from "../utils/dataUri.js";
export const signUp = catchAsyncError(async (request, response, next) => {
    const { name, email, password } = request.body;

    const file = request.file;

    if (!email || !password || !name || !file) {
        return next(new ErrorHandler("Please enter all the fields", 400));
    }

    const fileUri = getDataUri(file);


    const cloud = await cloudinary.v2.uploader.upload(fileUri.content);


    let user = await userSchema.findOne({ email: email });
    if (user) return next(new ErrorHandler("User already existes", 409));

    // upload file on cloudinary
    user = await userSchema.create({
        name,
        email, password,
        avatar: {
            public_id: cloud.public_id, url: cloud.secure_url
        },

    })

    sendToken(response, user, "Registered Successfully", 201);

})

export const login = catchAsyncError(async (request, response, next) => {
    const { email, password } = request.body;
    if (!email || !password) {
        return next(new ErrorHandler("Please enter all the fields", 400));
    }

    const user = await userSchema.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid Credentials", 401));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) return next(new ErrorHandler("Invalid Credentials", 401))

    sendToken(response, user, "Logged in successfully", 200);
})

export const logout = catchAsyncError(async (request, response, next) => {
    return response.status(200).cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message: "Logged Out Successfully"
    })
})


export const getMyProfile = catchAsyncError(async (request, response, next) => {
    const user = await userSchema.findById(request.user._id);
    console.log(user);
    if (!user) {
        return next(new ErrorHandler("User doesn't exits", 401));
    }

    return response.status(200).json({
        success: true,
        user,
    })
})


export const changePassword = catchAsyncError(async (request, response, next) => {
    const user = await userSchema.findById(request.user._id).select("+password");
    if (!user) {
        return next(new ErrorHandler("User doesn't exists", 401));
    }
    const { oldPassword, newPassword } = request.body;

    if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("Enter all the fields", 400));
    }

    const isCorrect = await user.comparePassword(oldPassword);
    console.log(isCorrect)
    if (!isCorrect) {
        return next(new ErrorHandler("Old password is wrong", 400));
    }

    user.password = newPassword;
    await user.save();

    return response.status(200).json({
        success: true,
        message: "Password changed successfully"
    })
})


export const updateProfile = catchAsyncError(async (request, response, next) => {
    const user = await userSchema.findById(request.user._id);
    const { name, email } = request.body;

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    return response.status(200).json({
        success: true,
        message: "Profile updated successfully"
    })
})

export const updateProfilePicture = catchAsyncError(async (request, response, next) => {
    console.log("I am inside update profile picture")
    const file = request.file;
    console.log(file)
    const fileUri = getDataUri(file);
    const cloud = await cloudinary.v2.uploader.upload(fileUri.content);
    const user = await userSchema.findById(request.user._id);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    user.avatar.public_id = cloud.public_id;
    user.avatar.url = cloud.secure_url;
    await user.save();
    return response.status(200).json({
        success: true,
        message: "Profile picture updated successfully"
    })
})

export const forgetPassword = catchAsyncError(async (request, response, next) => {
    // firstly we will send the email of which we have forgotten the password
    const { email } = request.body;
    if (!email) {
        return next(new ErrorHandler('Please enter your email', 409));
    }

    // then we will find if the user with given email exists or not
    const user = await userSchema.findOne({ email: email });

    // if user doesn't exist
    if (!user) {
        return next(new ErrorHandler("User doesn't exist", 400));
    }

    // if user exists
    const resetToken = await user.getResetToken();
    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`
    const message = `Click on the link to reset your password. ${url}. If you have not requested then please ignore`
    // send token via email
    await sendEmail(user.email, "Course Bundler Reset Password", message)

    return response.status(200).json({
        success: true,
        message: 'Reset Token is sent to your email successfully'
    })

})

export const resetPassword = catchAsyncError(async (request, response, next) => {
    const { token } = request.params;
    const ResetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userSchema.findOne({
        ResetPasswordToken,
        ResetPasswordExpire: {
            $gt: Date.now()
        }
    })

    if (!user) {
        return next(new ErrorHandler("Token is invalid or has been expired"))
    }

    user.password = request.body.password;
    user.ResetPasswordToken = undefined;
    user.ResetPasswordExpire = undefined;
    user.save();
    return response.status(200).json({
        success: true,
        message: "Password changed successfully"
    })

})

export const addToPlaylist = catchAsyncError(async (request, response, next) => {
    // firtly we will find the user
    const user = await userSchema.findById(request.user._id);

    // now we have to find the course
    const course = await courseSchema.findById(request.body.id);

    // if course is invalid we will throw an error
    if (!course) {
        return next(new ErrorHandler("Invalid course id", 400));
    }


    // checking whether the item already exists or not in userSchema 
    const isExist = user.playlist.find((elem) => {
        // converting both to strings for perfect comparision
        if (elem.course.toString() === course._id.toString()) return true;
    });

    if (isExist) return next(new ErrorHandler("Playlist already exists", 409));


    // if course is valid we will push the course to the playlist of the userSchema
    user.playlist.push({
        course: course._id,
        poster: course.poster.url
    });

    // after that saving the user
    await user.save();

    // after that returning the response
    return response.status(200).json({
        success: true,
        message: "Playlist added"
    })
})

export const removeFromPlaylist = catchAsyncError(async (request, response, next) => {
    // firstly finding the user
    const user = await userSchema.findById(request.user._id);

    // now finding the course
    const course = await courseSchema.findById(request.body.id);

    // now checking if course exist or not

    // if course doesnot exist throw an error
    if (!course) {
        return next(new ErrorHandler("Invalid course id", 409));
    }

    // delete the course from the playlist
    const newPlaylist = user.playlist.filter((elem) => {
        elem.course.toString() !== course._id.toString();
    })

    user.playlist = newPlaylist;

    await user.save();

    return response.status(200).json({
        success: true,
        message: "Course removed from playlist"
    })
})


export const getAllUsers = catchAsyncError(async (request, response, next) => {
    const users = await userSchema.find();
    return response.status(200).json({
        success: true,
        users
    })
})

export const getUserProfile = catchAsyncError(async (request, response, next) => {
    const { id } = request.params.id;
    const user = await userSchema.findById(id);
    if (!user) {
        return next(new ErrorHandler("User doesn't exist", 404))
    }
    return response.status(200).json({
        success: true,
        user
    })
})


export const updateUserRole = catchAsyncError(async (request, response, next) => {
    const { id } = request.params;
    const user = await userSchema.findById(id);
    if (!user) return next(new ErrorHandler("User doesn't exist", 404));

    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();
    return response.status(200).json({
        success: true,
        message: "Role updated successfully"
    })
})

export const deleteUser = catchAsyncError(async (request, response, next) => {
    const { id } = request.params;
    const user = await userSchema.findById(id);
    if (!user) return next(new ErrorHandler("User doesn't exist", 404));

    if (user.avatar)
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await userSchema.findByIdAndDelete(user._id);

    return response.status(200).json({
        success: true,
        message: "User deleted successfully"
    })
})

export const deleteMyProfile = catchAsyncError(async (request, response, next) => {
    const id = request.user._id;
    const user = await userSchema.findById(id);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    await userSchema.findByIdAndDelete(user._id);
    return response.status(200).cookie('token', null, {
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: "User deleted successfully"
    })
})