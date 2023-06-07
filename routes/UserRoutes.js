import express from 'express'
import { addToPlaylist, changePassword, forgetPassword, getMyProfile, login, logout, removeFromPlaylist, resetPassword, signUp, updateProfile, updateProfilePicture } from '../controllers/UserController.js';
import { isAuthenticated } from '../middlewares/auth.js';
const userRouter = express();
userRouter.route('/register').post(signUp);
userRouter.route('/login').post(login);
userRouter.route('/logout').get(logout);
userRouter.route('/me').get(isAuthenticated, getMyProfile);
userRouter.route('/changepassword').put(isAuthenticated, changePassword);
userRouter.route('/updateprofile').put(isAuthenticated, updateProfile);
userRouter.route('/updateprofilepicture').put(isAuthenticated, updateProfilePicture);
userRouter.route('/forgetpassword').post(forgetPassword);
userRouter.route('/resetpassword/:token').put(resetPassword);
userRouter.route('/addtoplaylist').post(isAuthenticated, addToPlaylist);
userRouter.route('/removefromplaylist').delete(isAuthenticated, removeFromPlaylist);
export default userRouter;