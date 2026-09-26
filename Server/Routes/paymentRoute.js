import express from 'express';
import isAuth from '../Middlewares/isAuth.js';
import { createOrder, verifyPayment, handleWebhook } from '../Controllers/paymentController.js';

const paymentRouter = express.Router();

paymentRouter.post('/create-order', isAuth, createOrder);
paymentRouter.post('/verify-payment', isAuth, verifyPayment);
paymentRouter.post('/webhook', handleWebhook);

export default paymentRouter;