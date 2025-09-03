const productService = require('../services/productService');

const productController = {
    // GET /products - Lấy danh sách sản phẩm với phân trang và filter
    getProducts: async (req, res) => {
        try {
            const {
                page = 1,
                limit = 10,
                category = null,
                search = null
            } = req.query;

            // Validate parameters
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10)); // Giới hạn tối đa 50 items

            const result = await productService.getProducts(pageNum, limitNum, category, search);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Lấy danh sách sản phẩm thành công',
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

    // POST /products - Tạo sản phẩm mới (để test)
    createProduct: async (req, res) => {
        try {
            const result = await productService.createProduct(req.body);

            if (result.success) {
                return res.status(201).json({
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
            console.error('Error in createProduct:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ',
                error: error.message
            });
        }
    }
};

module.exports = productController;
