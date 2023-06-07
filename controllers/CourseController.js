import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { courseSchema } from "../models/Course.js"
import ErrorHandler from "../utils/errorHandler.js";


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
    // const file = request.file;
    const course = await courseSchema.create({
        title, description, createdBy, category, poster: {
            public_id: "temp_public_id",
            url: "temp_url"
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
    course.lectures.push({
        title: request.body.title,
        description: request.body.description,
        video: {
            public_id: "public_id",
            url: "url"
        }
    })
    await course.save();
    return response.status(200).json({
        success: true,
        message: "Lecture added successfully"
    })
})