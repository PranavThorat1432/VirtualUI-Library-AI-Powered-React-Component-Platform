import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';


const isAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.token;
        if(!token) {
            return res.status(400).json({
                message: 'User not authorized!'
            });
        }

        let verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        if(!verifyToken) {
            return res.status(400).json({
                message: 'User does not have valid token!'
            });
        }

        req.userId = verifyToken.userId;
        next();

    } catch (error) {
        return res.status(500).json({
            message: `IsAuth Error: ${error}`
        });
    }
};

export default isAuth;


export const isAdmin = async (req, res, next) => {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin only!' });
    }
    next();
};
