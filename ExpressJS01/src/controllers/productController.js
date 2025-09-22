const productService = require('../services/productService');

const productController = {
    // GET /products - Lấy danh sách sản phẩm với phân trang và filter
    getProducts: async (req, res) => {
        try {
            const {
                page = 1,
                limit = 10,
                category = null,
                search = null,
                fuzzy = false,
                minPrice = null,
                maxPrice = null
            } = req.query;

            // Validate parameters
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10)); // Giới hạn tối đa 50 items
            const useElasticsearch = fuzzy === 'true' || fuzzy === true;
            const minPriceNum = minPrice !== null && minPrice !== undefined && minPrice !== '' ? Math.max(0, parseFloat(minPrice)) : undefined;
            const maxPriceNum = maxPrice !== null && maxPrice !== undefined && maxPrice !== '' ? Math.max(0, parseFloat(maxPrice)) : undefined;

            const result = await productService.getProducts(pageNum, limitNum, category, search, useElasticsearch, minPriceNum, maxPriceNum);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: useElasticsearch ? 'Tìm kiếm fuzzy search thành công' : 'Lấy danh sách sản phẩm thành công',
                    ...result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error in getProducts:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ',
                error: error.message
            });
        }
    },

    // GET /categories - Lấy danh sách danh mục
    getCategories: async (req, res) => {
        try {
            const result = await productService.getCategories();

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Lấy danh sách danh mục thành công',
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error in getCategories:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ',
                error: error.message
            });
        }
    },

    // POST /products/sync - Sync dữ liệu từ MongoDB sang Elasticsearch
    syncToElasticsearch: async (req, res) => {
        try {
            const result = await productService.syncToElasticsearch();

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error in syncToElasticsearch:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ',
                error: error.message
            });
        }
    },

    // GET /products/:id/similar - Lấy sản phẩm tương tự
    getSimilarProducts: async (req, res) => {
        try {
            const { id } = req.params;
            const { limit = 6 } = req.query;

            // Validate product ID
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID is required'
                });
            }

            // Validate limit parameter
            const limitNum = Math.min(20, Math.max(1, parseInt(limit) || 6)); // Giới hạn tối đa 20 items

            const result = await productService.getSimilarProducts(id, limitNum);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Lấy danh sách sản phẩm tương tự thành công',
                    data: result.data.products,
                    totalFound: result.data.totalFound,
                    basedOn: result.data.basedOn
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error in getSimilarProducts:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ',
                error: error.message
            });
        }
    },

    // POST /products/:id/purchase - Simulate mua hàng
    purchaseProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const { quantity = 1 } = req.body;

            // Validate product ID
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID is required'
                });
            }

            // Validate quantity
            const quantityNum = Math.max(1, parseInt(quantity) || 1);

            const result = await productService.purchaseProduct(id, quantityNum);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data.product,
                    purchaseInfo: result.data.purchaseInfo
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error in purchaseProduct:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ',
                error: error.message
            });
        }
    },

    // GET /products/:id/purchase-stats - Lấy thống kê mua hàng
    getProductPurchaseStats: async (req, res) => {
        try {
            const { id } = req.params;

            // Validate product ID
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID is required'
                });
            }

            const result = await productService.getProductPurchaseStats(id);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Lấy thống kê mua hàng thành công',
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error in getProductPurchaseStats:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ',
                error: error.message
            });
        }
    }
};

module.exports = productController;
