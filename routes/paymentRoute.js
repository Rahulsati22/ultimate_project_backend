import express from 'express'
import { isAuthenticated } from '../middlewares/auth.js';
import { buySubscription, cancelSubscription, getRazorPayKey, paymentVerification } from '../controllers/paymentController.js';
const Router = express();
// Buy subscription
Router.route('/subscribe').get(isAuthenticated, buySubscription);

// Verify payment and save reference in database
Router.route('/paymentverification').post(isAuthenticated, paymentVerification);


// Get razorpay key
Router.route('/getrazorpaykey').get(isAuthenticated, getRazorPayKey )


// Cancel subscription
Router.route('/subscribe/cancel').get(isAuthenticated, cancelSubscription);
export default Router