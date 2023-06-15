import express from 'express';
import { getAllCourses, createCourse, getCourseLectures, addToLectures, deleteCourse, deleteLecture } from '../controllers/CourseController.js';
import singleUpload from '../middlewares/multer.js';
import { authorizeAdmin, authorizeSubscribers, isAuthenticated } from '../middlewares/auth.js';
const router = express.Router();

// get all courses without lectures
router.route('/courses').get(getAllCourses);

// create a course
router.route('/createcourse').post(isAuthenticated, authorizeAdmin, singleUpload, createCourse)


// add lecture
router.route('/course/:id').get(isAuthenticated, authorizeSubscribers, getCourseLectures).put(isAuthenticated, authorizeAdmin, singleUpload, addToLectures).delete(isAuthenticated, authorizeAdmin, deleteCourse);

// Add lecture, Delete course, getCourseDetails

router.route('/lecture').delete(isAuthenticated, authorizeAdmin, deleteLecture)
export default router;