import express from 'express'
import { addToPlaylist, changePassword, deleteMyProfile, deleteUser, forgetPassword, getAllUsers, getMyProfile, getUserProfile, login, logout, removeFromPlaylist, resetPassword, signUp, updateProfile, updateProfilePicture, updateUserRole } from '../controllers/UserController.js';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';
const userRouter = express();
userRouter.route('/register').post(singleUpload, signUp);
userRouter.route('/login').post(login);
userRouter.route('/logout').get(logout);
userRouter.route('/me').get(isAuthenticated, getMyProfile).delete(isAuthenticated, deleteMyProfile);
userRouter.route('/changepassword').put(isAuthenticated, singleUpload, changePassword);
userRouter.route('/updateprofile').put(isAuthenticated, updateProfile);
userRouter.route('/updateprofilepicture').put(isAuthenticated, singleUpload, updateProfilePicture);
userRouter.route('/forgetpassword').post(forgetPassword);
userRouter.route('/resetpassword/:token').put(resetPassword);
userRouter.route('/addtoplaylist').post(isAuthenticated, addToPlaylist);

// in delete method we cannot send the cookies so we can't use delete here
// userRouter.route('/removefromplaylist').delete(isAuthenticated, removeFromPlaylist);
userRouter.route('/removefromplaylist').post(isAuthenticated, removeFromPlaylist);


// admin routes
userRouter.route('/admin/users').get(isAuthenticated, authorizeAdmin, getAllUsers);
userRouter.route('/admin/user/:id').put(isAuthenticated, authorizeAdmin, updateUserRole).delete(isAuthenticated, authorizeAdmin, deleteUser);
export default userRouter;