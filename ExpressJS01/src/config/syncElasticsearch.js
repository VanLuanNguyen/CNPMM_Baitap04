require('dotenv').config();
const mongoose = require('mongoose');
const { checkConnection, createProductsIndex } = require('./elasticsearch');
const elasticsearchService = require('../services/elasticsearchService');

const syncToElasticsearch = async () => {
    try {
        console.log('🚀 Bắt đầu sync dữ liệu từ MongoDB sang Elasticsearch...');
        
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log('✅ Đã kết nối MongoDB');

        // Kiểm tra kết nối Elasticsearch
        const isConnected = await checkConnection();
        if (!isConnected) {
            throw new Error('Không thể kết nối Elasticsearch');
        }

        // Tạo index nếu chưa có
        await createProductsIndex();

        // Sync dữ liệu
        const result = await elasticsearchService.indexAllProducts();
        
        if (result.success) {
            console.log('✅ Sync thành công!');
            console.log(`📊 Thống kê: ${result.data.successCount} sản phẩm thành công, ${result.data.errorCount} lỗi`);
        } else {
            console.error('❌ Sync thất bại:', result.message);
        }

    } catch (error) {
        console.error('❌ Lỗi khi sync:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Đã đóng kết nối MongoDB');
        process.exit(0);
    }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    syncToElasticsearch();
}

module.exports = syncToElasticsearch;

