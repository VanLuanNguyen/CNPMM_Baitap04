const { 
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
} = require("../services/userService");

const createUser = async (req, res) => {
    const { email, name, password } = req.body;
    const data = await createUserService(name, email, password);
    return res.status(200).json(data);
}

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const data = await loginService(email, password);
    return res.status(200).json(data);
}

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data);
}

const getAccount = async (req, res) => {
    return res.status(200).json(req.user);
}

const addToFavorites = async (req, res) => {
    try {
        const { productId } = req.params;
        const userEmail = req.user.email;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const result = await addToFavoritesService(userEmail, productId);
        
        if (result.EC === 0) {
            return res.status(200).json({
                success: true,
                message: result.EM
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.EM
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

const removeFromFavorites = async (req, res) => {
    try {
        const { productId } = req.params;
        const userEmail = req.user.email;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const result = await removeFromFavoritesService(userEmail, productId);
        
        if (result.EC === 0) {
            return res.status(200).json({
                success: true,
                message: result.EM
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.EM
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

const getUserFavorites = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const result = await getUserFavoritesService(userEmail);
        
        if (result.EC === 0) {
            return res.status(200).json({
                success: true,
                message: "Get favorites successfully",
                data: result.data
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.EM
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

const checkIsFavorite = async (req, res) => {
    try {
        const { productId } = req.params;
        const userEmail = req.user.email;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const result = await checkIsFavoriteService(userEmail, productId);
        
        if (result.EC === 0) {
            return res.status(200).json({
                success: true,
                isFavorite: result.isFavorite
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.EM
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

const addToViewedProducts = async (req, res) => {
    try {
        const { productId } = req.params;
        const userEmail = req.user.email;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const result = await addToViewedProductsService(userEmail, productId);
        
        if (result.EC === 0) {
            return res.status(200).json({
                success: true,
                message: result.EM
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.EM
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

const getUserViewedProducts = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { limit = 20 } = req.query;

        // Validate limit parameter
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));

        const result = await getUserViewedProductsService(userEmail, limitNum);
        
        if (result.EC === 0) {
            return res.status(200).json({
                success: true,
                message: "Get viewed products successfully",
                data: result.data
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.EM
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

const clearViewedProducts = async (req, res) => {
    try {
        const userEmail = req.user.email;

        const result = await clearViewedProductsService(userEmail);
        
        if (result.EC === 0) {
            return res.status(200).json({
                success: true,
                message: result.EM
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.EM
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

const removeFromViewedProducts = async (req, res) => {
    try {
        const { productId } = req.params;
        const userEmail = req.user.email;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const result = await removeFromViewedProductsService(userEmail, productId);
        
        if (result.EC === 0) {
            return res.status(200).json({
                success: true,
                message: result.EM
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.EM
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

module.exports = {
    createUser,
    handleLogin,
    getUser,
    getAccount,
    addToFavorites,
    removeFromFavorites,
    getUserFavorites,
    checkIsFavorite,
    addToViewedProducts,
    getUserViewedProducts,
    clearViewedProducts,
    removeFromViewedProducts
}