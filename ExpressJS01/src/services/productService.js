const Product = require('../models/product');
const elasticsearchService = require('./elasticsearchService');

const productService = {
    // Lấy sản phẩm với phân trang và filter theo danh mục
    getProducts: async (page = 1, limit = 10, category = null, search = null, useElasticsearch = false, minPrice = undefined, maxPrice = undefined) => {
        try {
            // Nếu có search term và bật Elasticsearch, sử dụng fuzzy search
            if (search && useElasticsearch) {
                const result = await elasticsearchService.searchProducts(search, page, limit, category, minPrice, maxPrice);
                return result;
            }
            
            // Fallback về MongoDB search thông thường
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

            // Lọc theo khoảng giá nếu có
            if (minPrice !== undefined || maxPrice !== undefined) {
                filter.price = {};
                if (minPrice !== undefined) {
                    filter.price.$gte = minPrice;
                }
                if (maxPrice !== undefined) {
                    filter.price.$lte = maxPrice;
                }
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
            
            // Index vào Elasticsearch
            await elasticsearchService.indexProduct(product);
            
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
    },

    // Sync tất cả sản phẩm từ MongoDB sang Elasticsearch
    syncToElasticsearch: async () => {
        try {
            const result = await elasticsearchService.indexAllProducts();
            return result;
        } catch (error) {
            return {
                success: false,
                message: 'Lỗi khi sync dữ liệu sang Elasticsearch',
                error: error.message
            };
        }
    }
};

module.exports = productService;
