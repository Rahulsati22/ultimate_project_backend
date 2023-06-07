import express from 'express';
import { getAllCourses, createCourse, getCourseLectures } from '../controllers/CourseController.js';
const router = express.Router();

// get all courses without lectures
router.route('/courses').get(getAllCourses);

// create a course
router.route('/createcourse').post(createCourse)


// add lecture
router.route('/course/:id').get(getCourseLectures).post()

// Add lecture, Delete course, getCourseDetails
export default router;