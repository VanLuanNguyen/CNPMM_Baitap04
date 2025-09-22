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
    },

    // Lấy sản phẩm tương tự dựa trên category, tags và price range
    getSimilarProducts: async (productId, limit = 6) => {
        try {
            // Lấy thông tin sản phẩm hiện tại
            const currentProduct = await Product.findById(productId).select('category tags price name');
            if (!currentProduct) {
                return {
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                };
            }

            const { category, tags, price } = currentProduct;
            
            // Tính khoảng giá tương đối (±30% so với giá hiện tại)
            const priceRange = {
                min: Math.max(0, price * 0.7),
                max: price * 1.3
            };

            // Tạo query để tìm sản phẩm tương tự
            const similarQuery = {
                _id: { $ne: productId }, // Loại trừ sản phẩm hiện tại
                isActive: true,
                $or: [
                    // Ưu tiên 1: Cùng category
                    { category: category },
                    // Ưu tiên 2: Có tags trùng khớp
                    { tags: { $in: tags } },
                    // Ưu tiên 3: Khoảng giá tương đương
                    { 
                        price: { 
                            $gte: priceRange.min, 
                            $lte: priceRange.max 
                        } 
                    }
                ]
            };

            // Tìm sản phẩm tương tự và tính điểm relevance
            const products = await Product.find(similarQuery)
                .select('-__v')
                .limit(limit * 3); // Lấy nhiều hơn để có thể sort theo relevance

            // Tính điểm relevance cho mỗi sản phẩm
            const productsWithScore = products.map(product => {
                let score = 0;
                
                // Cùng category: +10 điểm
                if (product.category === category) {
                    score += 10;
                }
                
                // Tags trùng khớp: +2 điểm cho mỗi tag trùng
                const matchingTags = product.tags.filter(tag => tags.includes(tag));
                score += matchingTags.length * 2;
                
                // Giá trong khoảng: +5 điểm
                if (product.price >= priceRange.min && product.price <= priceRange.max) {
                    score += 5;
                }
                
                // Giá càng gần: bonus điểm
                const priceDiff = Math.abs(product.price - price);
                const priceBonus = Math.max(0, 3 - (priceDiff / price) * 3);
                score += priceBonus;

                return {
                    ...product.toObject(),
                    relevanceScore: score
                };
            });

            // Sắp xếp theo điểm relevance và lấy số lượng yêu cầu
            const sortedProducts = productsWithScore
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .slice(0, limit)
                .map(product => {
                    // Xóa relevanceScore khỏi response
                    const { relevanceScore, ...productData } = product;
                    return productData;
                });

            return {
                success: true,
                data: {
                    products: sortedProducts,
                    totalFound: productsWithScore.length,
                    basedOn: {
                        category: category,
                        tags: tags,
                        priceRange: priceRange
                    }
                }
            };

        } catch (error) {
            return {
                success: false,
                message: 'Lỗi khi tìm sản phẩm tương tự',
                error: error.message
            };
        }
    },

    // Simulate mua hàng và tăng purchase count
    purchaseProduct: async (productId, quantity = 1) => {
        try {
            // Tìm sản phẩm
            const product = await Product.findById(productId);
            if (!product) {
                return {
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                };
            }

            // Kiểm tra trạng thái sản phẩm
            if (!product.isActive) {
                return {
                    success: false,
                    message: 'Sản phẩm không còn được bán'
                };
            }

            // Kiểm tra tồn kho
            if (product.stock < quantity) {
                return {
                    success: false,
                    message: `Không đủ hàng trong kho. Chỉ còn ${product.stock} sản phẩm`
                };
            }

            // Cập nhật số lượng mua và giảm tồn kho
            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                {
                    $inc: { 
                        purchaseCount: 1,  // Tăng số người mua (mỗi lần mua = 1 người)
                        stock: -quantity   // Giảm tồn kho theo số lượng mua
                    },
                    updatedAt: new Date()
                },
                { new: true, select: '-__v' }
            );

            return {
                success: true,
                message: 'Mua hàng thành công',
                data: {
                    product: updatedProduct,
                    purchaseInfo: {
                        quantity: quantity,
                        totalCustomers: updatedProduct.purchaseCount,
                        remainingStock: updatedProduct.stock
                    }
                }
            };

        } catch (error) {
            return {
                success: false,
                message: 'Lỗi khi thực hiện mua hàng',
                error: error.message
            };
        }
    },

    // Lấy thống kê mua hàng của sản phẩm
    getProductPurchaseStats: async (productId) => {
        try {
            const product = await Product.findById(productId).select('purchaseCount stock name price');
            if (!product) {
                return {
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                };
            }

            return {
                success: true,
                data: {
                    productId: product._id,
                    productName: product.name,
                    totalCustomers: product.purchaseCount,
                    remainingStock: product.stock,
                    price: product.price,
                    isInStock: product.stock > 0
                }
            };

        } catch (error) {
            return {
                success: false,
                message: 'Lỗi khi lấy thống kê mua hàng',
                error: error.message
            };
        }
    }
};

module.exports = productService;
