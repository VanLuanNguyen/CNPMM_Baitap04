require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
    const white_lists = ["/", "/register", "/login"];
    if (white_lists.find(item => "/v1/api" + item === req.originalUrl)) {
        return next();
    } else {
        if (req?.headers?.authorization?.split(' ')?.[1]) {
            const token = req.headers.authorization.split(' ')[1];
            
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // Lấy thông tin user từ database để có ID
                const user = await User.findOne({ email: decoded.email }).select('_id name email role');
                
                if (!user) {
                    return res.status(401).json({
                        message: "User not found",
                    });
                }

                req.user = {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role || 'User',
                    createdBy: "hoidanit"
                }
                
                console.log("check token: ", decoded);
                next();
            } catch (error) {
                return res.status(401).json({
                    message: "Invalid token",
                })
            }
        }else {
            return res.status(401).json({
                message: "You are not authenticated",
            })
        }
    } 
}

module.exports = auth;