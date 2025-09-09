const express = require('express');
const { createUser, handleLogin, getUser, getAccount}
    = require('../controllers/userController');
const { getProducts, getCategories, createProduct, syncToElasticsearch } 
    = require('../controllers/productController');
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
routerAPI.post("/products", createProduct);
routerAPI.post("/products/sync", syncToElasticsearch);

module.exports = routerAPI;