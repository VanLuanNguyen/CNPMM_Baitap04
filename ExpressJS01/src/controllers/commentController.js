const commentService = require('../services/commentService');

const commentController = {
    // POST /comments - Tạo comment mới
    createComment: async (req, res) => {
        try {
            const { productId, content, rating } = req.body;
            const userId = req.user.id; // Từ auth middleware

            // Validate input
            if (!productId || !content || !rating) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: productId, content, rating'
                });
            }

            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating phải từ 1 đến 5 sao'
                });
            }

            if (content.trim().length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Nội dung bình luận phải có ít nhất 10 ký tự'
                });
            }

            const result = await commentService.createComment(userId, productId, content, rating);

            if (result.success) {
                return res.status(201).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            console.error('Error in createComment:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ',
                error: error.message
            });
        }
    },

    // GET /products/:id/comments - Lấy comments của product
    getProductComments: async (req, res) => {
        try {
            const { id: productId } = req.params;
            const { page = 1, limit = 10, sortBy = 'newest' } = req.query;

            // Validate productId
            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID is required'
                });
            }

            // Validate parameters
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));

            const result = await commentService.getProductComments(productId, pageNum, limitNum, sortBy);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Lấy danh sách bình luận thành công',
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
            console.error('Error in getProductComments:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ',
                error: error.message
            });
        }
    },

    // PUT /comments/:id - Cập nhật comment
    updateComment: async (req, res) => {
        try {
            const { id: commentId } = req.params;
            const { content, rating } = req.body;
            const userId = req.user.id;

            // Validate input
            if (!content || !rating) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: content, rating'
                });
            }

            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating phải từ 1 đến 5 sao'
                });
            }

            if (content.trim().length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Nội dung bình luận phải có ít nhất 10 ký tự'
                });
            }

            const result = await commentService.updateComment(commentId, userId, content, rating);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            console.error('Error in updateComment:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ',
                error: error.message
            });
        }
    },

    // DELETE /comments/:id - Xóa comment
    deleteComment: async (req, res) => {
        try {
            const { id: commentId } = req.params;
            const userId = req.user.id;
            const isAdmin = req.user.role === 'Admin'; // Kiểm tra role admin

            if (!commentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Comment ID is required'
                });
            }

            const result = await commentService.deleteComment(commentId, userId, isAdmin);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            console.error('Error in deleteComment:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ',
                error: error.message
            });
        }
    },

    // GET /products/:id/comments/me - Lấy comment của user cho product
    getUserCommentForProduct: async (req, res) => {
        try {
            const { id: productId } = req.params;
            const userId = req.user.id;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID is required'
                });
            }

            const result = await commentService.getUserCommentForProduct(userId, productId);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Lấy bình luận của user thành công',
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
            console.error('Error in getUserCommentForProduct:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ',
                error: error.message
            });
        }
    }
};

module.exports = commentController;

