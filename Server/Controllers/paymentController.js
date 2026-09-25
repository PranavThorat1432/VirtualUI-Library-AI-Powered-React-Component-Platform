import Payment from "../Models/paymentModel.js";
import User from "../Models/userModel.js";
import razorpayInstance from "../Utils/razorPay.js";
import crypto from 'crypto';


export const createOrder = async (req, res) => {
    try {
        const { amount, aiCredits } = req.body;
        if(!amount || !aiCredits) {
            return res.status(400).json({
                message: 'Invalid Plan Data!'
            });
        }

        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        }; 

        const order = await razorpayInstance.orders.create(options);

        await Payment.create({
            userId: req.userId,
            amount,
            aiCredits,
            razorpayOrderId: order.id,
            status: 'created'
        });

        return res.status(200).json({order});

    } catch (error) {
        return res.status(500).json({
            message: `Failed to create order: ${error}`
        });
    }
};


export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if(expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: 'Invalid payment signature!'
            });
        }

        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id
        });

        if(!payment) {
            return res.status(404).json({
                message: 'Payment not found!'
            });
        }

        if(payment.status === 'paid') {
            return res.status(200).json({
                message: 'Already Proceed!'
            });
        }

        payment.status = 'paid';
        payment.razorpayPaymentId = razorpay_payment_id;
        await payment.save();

        const updatedUser = await User.findByIdAndUpdate(payment.userId, {
            $inc: {aiCredits: payment.aiCredits}
        }, {new: true});

        return res.status(200).json({
            message: 'Payment Verified Successfully!',
            user: updatedUser
        });
        
    } catch (error) {
        return res.status(500).json({
            message: `Failed to Verify Payment: ${error}`
        });
    }
};


export const handleWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        if (!signature) {
            return res.status(400).json({ message: 'Webhook signature missing' });
        }

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        const { event, payload } = req.body;

        if (event === 'payment.captured' || event === 'order.paid') {
            const paymentEntity = payload?.payment?.entity;
            const razorpayOrderId = paymentEntity?.order_id || payload?.order?.entity?.id;
            const razorpayPaymentId = paymentEntity?.id;

            if (razorpayOrderId) {
                const payment = await Payment.findOne({ razorpayOrderId });
                if (payment && payment.status !== 'paid') {
                    payment.status = 'paid';
                    if (razorpayPaymentId) {
                        payment.razorpayPaymentId = razorpayPaymentId;
                    }
                    await payment.save();

                    await User.findByIdAndUpdate(payment.userId, {
                        $inc: { aiCredits: payment.aiCredits }
                    });
                }
            }
        }

        return res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return res.status(500).json({ message: `Webhook error: ${error.message}` });
    }
};  