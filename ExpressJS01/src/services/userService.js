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

const addToFavoritesService = async (userEmail, productId) => {
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return {
                EC: 1,
                EM: "User not found"
            };
        }

        // Kiểm tra xem sản phẩm đã có trong favorites chưa
        if (user.favorites.includes(productId)) {
            return {
                EC: 2,
                EM: "Product already in favorites"
            };
        }

        // Thêm sản phẩm vào favorites
        user.favorites.push(productId);
        await user.save();

        return {
            EC: 0,
            EM: "Product added to favorites successfully"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 3,
            EM: "Error adding product to favorites"
        };
    }
}

const removeFromFavoritesService = async (userEmail, productId) => {
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return {
                EC: 1,
                EM: "User not found"
            };
        }

        // Xóa sản phẩm khỏi favorites
        const index = user.favorites.indexOf(productId);
        if (index === -1) {
            return {
                EC: 2,
                EM: "Product not in favorites"
            };
        }

        user.favorites.splice(index, 1);
        await user.save();

        return {
            EC: 0,
            EM: "Product removed from favorites successfully"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 3,
            EM: "Error removing product from favorites"
        };
    }
}

const getUserFavoritesService = async (userEmail) => {
    try {
        const user = await User.findOne({ email: userEmail })
            .populate('favorites')
            .select('favorites');
        
        if (!user) {
            return {
                EC: 1,
                EM: "User not found"
            };
        }

        return {
            EC: 0,
            data: user.favorites
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: "Error getting user favorites"
        };
    }
}

const checkIsFavoriteService = async (userEmail, productId) => {
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return {
                EC: 1,
                EM: "User not found"
            };
        }

        const isFavorite = user.favorites.includes(productId);
        return {
            EC: 0,
            isFavorite
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: "Error checking favorite status"
        };
    }
}

const addToViewedProductsService = async (userEmail, productId) => {
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return {
                EC: 1,
                EM: "User not found"
            };
        }

        // Kiểm tra xem sản phẩm đã có trong lịch sử xem chưa
        const existingViewIndex = user.viewedProducts.findIndex(
            viewed => viewed.product.toString() === productId
        );

        if (existingViewIndex !== -1) {
            // Nếu đã có, xóa cái cũ và thêm vào đầu với timestamp mới
            user.viewedProducts.splice(existingViewIndex, 1);
        }

        // Thêm sản phẩm vào đầu danh sách với timestamp hiện tại
        user.viewedProducts.unshift({
            product: productId,
            viewedAt: new Date()
        });

        // Giới hạn số lượng sản phẩm đã xem (tối đa 50)
        if (user.viewedProducts.length > 50) {
            user.viewedProducts = user.viewedProducts.slice(0, 50);
        }

        await user.save();

        return {
            EC: 0,
            EM: "Product added to viewed history successfully"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 3,
            EM: "Error adding product to viewed history"
        };
    }
}

const getUserViewedProductsService = async (userEmail, limit = 20) => {
    try {
        const user = await User.findOne({ email: userEmail })
            .populate({
                path: 'viewedProducts.product',
                model: 'Product'
            })
            .select('viewedProducts');
        
        if (!user) {
            return {
                EC: 1,
                EM: "User not found"
            };
        }

        // Lọc ra những sản phẩm còn tồn tại và đang active
        const validViewedProducts = user.viewedProducts
            .filter(viewed => viewed.product && viewed.product.isActive)
            .slice(0, limit)
            .map(viewed => ({
                ...viewed.product.toObject(),
                viewedAt: viewed.viewedAt
            }));

        return {
            EC: 0,
            data: validViewedProducts
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: "Error getting user viewed products"
        };
    }
}

const clearViewedProductsService = async (userEmail) => {
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return {
                EC: 1,
                EM: "User not found"
            };
        }

        user.viewedProducts = [];
        await user.save();

        return {
            EC: 0,
            EM: "Viewed products history cleared successfully"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: "Error clearing viewed products history"
        };
    }
}

const removeFromViewedProductsService = async (userEmail, productId) => {
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return {
                EC: 1,
                EM: "User not found"
            };
        }

        // Tìm và xóa sản phẩm khỏi lịch sử xem
        const viewIndex = user.viewedProducts.findIndex(
            viewed => viewed.product.toString() === productId
        );

        if (viewIndex === -1) {
            return {
                EC: 2,
                EM: "Product not found in viewed history"
            };
        }

        user.viewedProducts.splice(viewIndex, 1);
        await user.save();

        return {
            EC: 0,
            EM: "Product removed from viewed history successfully"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 3,
            EM: "Error removing product from viewed history"
        };
    }
}
module.exports = {
    createUserService,
    loginService,
    getUserService,
    addToFavoritesService,
    removeFromFavoritesService,
    getUserFavoritesService,
    checkIsFavoriteService,
    addToViewedProductsService,
    getUserViewedProductsService,
    clearViewedProductsService,
    removeFromViewedProductsService
}