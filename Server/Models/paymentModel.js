import mongosee from 'mongoose';

const paymentSchema = new mongosee.Schema({
    userId: {
        type: mongosee.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: Number,
    aiCredits: Number,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'created'
    }

}, {timestamps: true});

const Payment = mongosee.model('Payment', paymentSchema);
export default Payment; 