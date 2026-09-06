import express from 'express';
import isAuth, { isAdmin } from '../Middlewares/isAuth.js';
import { getAllUsers, getCurrentUser } from '../Controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/current-user', isAuth, getCurrentUser);
userRouter.get('/all-users', isAuth, isAdmin, getAllUsers);

export default userRouter;