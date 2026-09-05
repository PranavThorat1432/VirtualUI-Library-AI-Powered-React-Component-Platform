import User from "../Models/userModel.js";


export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if(!user) {
            return res.status(404).json({
                message: 'User not found!'
            });
        }

        return res.status(200).json(user);
        
    } catch (error) {
        return res.status(500).json({
            message: `Get Current User Error: ${error}`
        });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : null;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;

        if (page) {
            const skip = (page - 1) * limit;
            const totalUsers = await User.countDocuments();
            const totalPages = Math.ceil(totalUsers / limit);
            const users = await User.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            return res.status(200).json({
                users,
                totalPages,
                currentPage: page,
                totalUsers
            });
        }

        const users = await User.find().sort({createdAt: -1});
        if(!users) {
            return res.status(404).json({
                message: 'Users not found!'
            });
        }

        return res.status(200).json(users);

    } catch (error) {
        return res.status(500).json({
            message: `Failed to get all users: ${error}`
        });
    }
};