import express from 'express'
import { contactUs, courseRequest, getDashboardStats } from '../controllers/otherController.js';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';

const otherRouter = express();


// contact form
otherRouter.route('/contact').post(contactUs)

//request course
otherRouter.route('/courserequest').post(courseRequest)


otherRouter.route('/admin/stats').get(isAuthenticated, authorizeAdmin, getDashboardStats)


export default otherRouter