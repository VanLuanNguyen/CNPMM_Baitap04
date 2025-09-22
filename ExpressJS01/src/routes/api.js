const express = require('express');
const { 
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
} = require('../controllers/userController');
const { 
    getProducts, 
    getCategories, 
    createProduct, 
    syncToElasticsearch, 
    getSimilarProducts,
    purchaseProduct,
    getProductPurchaseStats 
} = require('../controllers/productController');
const {
    createComment,
    getProductComments,
    updateComment,
    deleteComment,
    getUserCommentForProduct
} = require('../controllers/commentController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();

routerAPI.use(auth);

routerAPI.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello world API"
    });
});

routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);

routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

// Product routes
routerAPI.get("/products", getProducts);
routerAPI.get("/categories", getCategories);
routerAPI.get("/products/:id/similar", getSimilarProducts);
routerAPI.get("/products/:id/purchase-stats", getProductPurchaseStats);
routerAPI.post("/products/:id/purchase", purchaseProduct);
routerAPI.post("/products/sync", syncToElasticsearch);

// Favorites routes
routerAPI.get("/favorites", getUserFavorites);
routerAPI.post("/favorites/:productId", addToFavorites);
routerAPI.delete("/favorites/:productId", removeFromFavorites);
routerAPI.get("/favorites/:productId/check", checkIsFavorite);

// Viewed products routes
routerAPI.get("/viewed-products", getUserViewedProducts);
routerAPI.post("/viewed-products/:productId", addToViewedProducts);
routerAPI.delete("/viewed-products/:productId", removeFromViewedProducts);
routerAPI.delete("/viewed-products", clearViewedProducts);

// Comment routes
routerAPI.post("/comments", createComment);
routerAPI.get("/products/:id/comments", getProductComments);
routerAPI.get("/products/:id/comments/me", getUserCommentForProduct);
routerAPI.put("/comments/:id", updateComment);
routerAPI.delete("/comments/:id", deleteComment);

module.exports = routerAPI;