import jwt from 'jsonwebtoken';

export const genToken = async (userId) => {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        const token = jwt.sign(
            { userId }, 
            secret, 
            { expiresIn: '7d' }
        );
        return token;

    } catch (error) {
        console.log(`Generate Token Error: ${error}`);
    }
};
