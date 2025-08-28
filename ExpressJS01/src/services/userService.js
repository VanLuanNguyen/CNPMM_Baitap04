require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const createUserService = async (name, email, password) => {
    try {
        const user = await User.findOne({ email });
        if (user) {
            console.log("User already exists");
            return null;
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let result = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: "User"
        });
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const loginService = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        if (user) {
            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                return {
                    EC: 2,
                    EM: "Email/Password is incorrect",
                }
            } else {
                const payload = {
                    email: user.email,
                    name: user.name
                }

                const access_token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_EXPIRE || "24h"
                    }
                )
                return {
                    EC: 0,
                    access_token,
                    user: {
                        email: user.email,
                        name: user.name
                    }
                }
            }
        } else {
            return {
                EC: 1,
                EM: "Email/Password is incorrect",
            }
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

const getUserService = async (email) => {
    try {
        let result = await User.find({}).select('-password -__v');
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}
module.exports = {
    createUserService,
    loginService,
    getUserService
}