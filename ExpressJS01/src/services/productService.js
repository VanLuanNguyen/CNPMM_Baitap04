const Product = require('../models/product');

const productService = {
    // Lấy sản phẩm với phân trang và filter theo danh mục
    getProducts: async (page = 1, limit = 10, category = null, search = null) => {
        try {
            const skip = (page - 1) * limit;
            
            // Tạo filter query
            let filter = { isActive: true };
            
            // Filter theo danh mục nếu có
            if (category && category !== 'all') {
                filter.category = { $regex: new RegExp(category, 'i') };
            }
            
            // Tìm kiếm theo tên hoặc mô tả nếu có
            if (search) {
                filter.$or = [
                    { name: { $regex: new RegExp(search, 'i') } },
                    { description: { $regex: new RegExp(search, 'i') } },
                    { tags: { $in: [new RegExp(search, 'i')] } }
                ];
            }
            
            // Đếm tổng số sản phẩm
            const total = await Product.countDocuments(filter);
            
            // Lấy sản phẩm với phân trang
            const products = await Product.find(filter)
                .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo mới nhất
                .skip(skip)
                .limit(parseInt(limit))
                .select('-__v'); // Bỏ trường __v
            
            // Tính toán thông tin phân trang
            const totalPages = Math.ceil(total / limit);
            const hasNext = page < totalPages;
            const hasPrev = page > 1;
            
            return {
                success: true,
                data: {
                    products,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalItems: total,
                        itemsPerPage: parseInt(limit),
                        hasNext,
                        hasPrev
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách sản phẩm',
                error: error.message
            };
        }
    },

    // Lấy danh sách các danh mục có sẵn
    getCategories: async () => {
        try {
            const categories = await Product.distinct('category', { isActive: true });
            return {
                success: true,
                data: categories.sort()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách danh mục',
                error: error.message
            };
        }
    },

    // Tạo sản phẩm mới (để test)
    createProduct: async (productData) => {
        try {
            const product = new Product(productData);
            await product.save();
            return {
                success: true,
                data: product,
                message: 'Tạo sản phẩm thành công'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Lỗi khi tạo sản phẩm',
                error: error.message
            };
        }
    }
};

module.exports = productService;
