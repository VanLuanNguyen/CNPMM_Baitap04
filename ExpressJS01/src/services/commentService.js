const Comment = require('../models/comment');
const Product = require('../models/product');

const commentService = {
    // Tạo comment mới
    createComment: async (userId, productId, content, rating) => {
        try {
            // Kiểm tra xem user đã comment cho product này chưa
            const existingComment = await Comment.findOne({ 
                user: userId, 
                product: productId 
            });

            if (existingComment) {
                return {
                    success: false,
                    message: 'Bạn đã bình luận cho sản phẩm này rồi. Vui lòng chỉnh sửa bình luận hiện có.'
                };
            }

            // Kiểm tra product có tồn tại không
            const product = await Product.findById(productId);
            if (!product) {
                return {
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                };
            }

            // Tạo comment mới
            const newComment = new Comment({
                user: userId,
                product: productId,
                content: content.trim(),
                rating: rating
            });

            const savedComment = await newComment.save();

            // Populate user info để trả về
            await savedComment.populate('user', 'name email');

            // Cập nhật rating trung bình và tổng số comments của product
            await commentService.updateProductRating(productId);

            return {
                success: true,
                message: 'Thêm bình luận thành công',
                data: savedComment
            };

        } catch (error) {
            return {
                success: false,
                message: 'Lỗi khi tạo bình luận',
                error: error.message
            };
        }
    },

    // Lấy danh sách comments của product
    getProductComments: async (productId, page = 1, limit = 10, sortBy = 'newest') => {
        try {
            const skip = (page - 1) * limit;
            
            // Xác định sort order
            let sortQuery = {};
            switch (sortBy) {
                case 'oldest':
                    sortQuery = { createdAt: 1 };
                    break;
                case 'highest_rating':
                    sortQuery = { rating: -1, createdAt: -1 };
                    break;
                case 'lowest_rating':
                    sortQuery = { rating: 1, createdAt: -1 };
                    break;
                default: // newest
                    sortQuery = { createdAt: -1 };
            }

            // Đếm tổng số comments
            const total = await Comment.countDocuments({ 
                product: productId, 
                isVisible: true 
            });

            // Lấy comments với pagination
            const comments = await Comment.find({ 
                product: productId, 
                isVisible: true 
            })
                .populate('user', 'name email')
                .sort(sortQuery)
                .skip(skip)
                .limit(parseInt(limit))
                .select('-__v');

            // Tính toán thông tin phân trang
            const totalPages = Math.ceil(total / limit);
            const hasNext = page < totalPages;
            const hasPrev = page > 1;

            return {
                success: true,
                data: {
                    comments,
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
                message: 'Lỗi khi lấy danh sách bình luận',
                error: error.message
            };
        }
    },

    // Cập nhật comment (chỉ user owner)
    updateComment: async (commentId, userId, content, rating) => {
        try {
            const comment = await Comment.findById(commentId);
            
            if (!comment) {
                return {
                    success: false,
                    message: 'Không tìm thấy bình luận'
                };
            }

            // Kiểm tra quyền chỉnh sửa
            if (comment.user.toString() !== userId) {
                return {
                    success: false,
                    message: 'Bạn không có quyền chỉnh sửa bình luận này'
                };
            }

            // Cập nhật comment
            const updatedComment = await Comment.findByIdAndUpdate(
                commentId,
                {
                    content: content.trim(),
                    rating: rating,
                    updatedAt: new Date()
                },
                { new: true }
            ).populate('user', 'name email');

            // Cập nhật rating trung bình của product
            await commentService.updateProductRating(comment.product);

            return {
                success: true,
                message: 'Cập nhật bình luận thành công',
                data: updatedComment
            };

        } catch (error) {
            return {
                success: false,
                message: 'Lỗi khi cập nhật bình luận',
                error: error.message
            };
        }
    },

    // Xóa comment (chỉ user owner hoặc ẩn)
    deleteComment: async (commentId, userId, isAdmin = false) => {
        try {
            const comment = await Comment.findById(commentId);
            
            if (!comment) {
                return {
                    success: false,
                    message: 'Không tìm thấy bình luận'
                };
            }

            // Kiểm tra quyền xóa
            if (!isAdmin && comment.user.toString() !== userId) {
                return {
                    success: false,
                    message: 'Bạn không có quyền xóa bình luận này'
                };
            }

            const productId = comment.product;

            // Xóa hoàn toàn comment
            await Comment.findByIdAndDelete(commentId);

            // Cập nhật rating trung bình của product
            await commentService.updateProductRating(productId);

            return {
                success: true,
                message: 'Xóa bình luận thành công'
            };

        } catch (error) {
            return {
                success: false,
                message: 'Lỗi khi xóa bình luận',
                error: error.message
            };
        }
    },

    // Helper method: Cập nhật rating trung bình và tổng comments của product
    updateProductRating: async (productId) => {
        try {
            // Aggregate để tính rating trung bình và tổng comments
            const stats = await Comment.aggregate([
                {
                    $match: { 
                        product: productId, 
                        isVisible: true 
                    }
                },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' },
                        totalComments: { $sum: 1 }
                    }
                }
            ]);

            const averageRating = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
            const totalComments = stats.length > 0 ? stats[0].totalComments : 0;

            // Cập nhật product
            await Product.findByIdAndUpdate(
                productId,
                {
                    averageRating: averageRating,
                    totalComments: totalComments,
                    updatedAt: new Date()
                }
            );

            return {
                success: true,
                averageRating,
                totalComments
            };

        } catch (error) {
            console.error('Error updating product rating:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Lấy comment của user cho một product cụ thể
    getUserCommentForProduct: async (userId, productId) => {
        try {
            const comment = await Comment.findOne({
                user: userId,
                product: productId,
                isVisible: true
            }).populate('user', 'name email');

            return {
                success: true,
                data: comment
            };

        } catch (error) {
            return {
                success: false,
                message: 'Lỗi khi lấy bình luận của user',
                error: error.message
            };
        }
    }
};

module.exports = commentService;

