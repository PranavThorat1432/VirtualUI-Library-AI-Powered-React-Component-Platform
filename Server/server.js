import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import connectDB from './Configs/mongoDB.js';
import authRouter from './Routes/authRoute.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './Routes/userRoute.js';
import componentRouter from './Routes/componentRoute.js';
import paymentRouter from './Routes/paymentRoute.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Server is running...');
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/component', componentRouter);
app.use('/api/payment', paymentRouter);

app.listen(port, () => {
    connectDB();
    console.log(`Server is listening on PORT: http://localhost:${port}`);
});  