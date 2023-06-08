import { Error } from "mongoose";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { courseSchema } from "../models/Course.js"
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from 'cloudinary'

// this function is used to fetch all the courses
export const getAllCourses = catchAsyncError(async (request, response, next) => {
    const courses = await courseSchema.find().select('-lectures');
    response.status(200).json({
        success: true,
        courses
    })
})


// this function is used to create a course
export const createCourse = catchAsyncError(async (request, response, next) => {
    const { title, description, category, createdBy } = request.body;
    if (!title || !description || !category || !createdBy) {
        return next(new ErrorHandler("Please add all the fields", 400));
    }
    const file = request.file;
    const fileUri = getDataUri(file);

    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content)
    const course = await courseSchema.create({
        title, description, createdBy, category, poster: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    })

    return response.status(201).json({
        success: true,
        message: "Course created successfully. You can add lectures now."
    })
})


export const getCourseLectures = catchAsyncError(async (request, response, next) => {
    const course = await courseSchema.findById(request.params.id)
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }

    course.views += 1;
    await course.save();
    return response.status(200).json({
        success: true,
        lectures: course.lectures
    })
})


export const addToLectures = catchAsyncError(async (request, response, next) => {
    const course = await courseSchema.findById(request.params.id);
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }
    //upload file here
    const file = request.file;
    const fileUri = getDataUri(file);
    const cloud = await cloudinary.v2.uploader.upload(fileUri.content, {
        resource_type: "video"
    })
    course.lectures.push({
        title: request.body.title,
        description: request.body.description,
        video: {
            public_id: cloud.public_id,
            url: cloud.secure_url
        }
    })

    course.numOfVideos = course.lectures.length;
    await course.save();
    return response.status(200).json({
        success: true,
        message: "Lecture added successfully"
    })
})

export const deleteCourse = catchAsyncError(async (request, response, next) => {
    const { id } = request.params;
    const course = await courseSchema.findById(id);
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }

    await cloudinary.v2.uploader.destroy(course.poster.public_id)

    course.lectures.map(async (elem) => {
        await cloudinary.v2.uploader.destroy(elem.video.public_id, {
            resource_type: "video"
        })
    })
    await courseSchema.findByIdAndDelete(course._id);

    return response.status(200).json({
        success: true,
        message: "Course Deleted Successfully"
    })
})

export const deleteLecture = catchAsyncError(async (request, response, next) => {
    const { courseId, lectureId } = request.query;
    const course = await courseSchema.findById(courseId);
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }

    const item = course.lectures.find((elem) => {
        if (elem._id.toString() === lectureId.toString()) return elem;
    })

    await cloudinary.v2.uploader.destroy(item.video.public_id);

    const arr = course.lectures.filter((elem) => {
        if (elem._id.toString() !== lectureId.toString()) return elem;
    })



    course.lectures = arr;
    course.numOfVideos = course.lectures.length;
    await course.save();
    return response.status(200).json({
        success: true,
        message: "Lecture deleted successfully"
    })
})