require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');

const sampleProducts = [
    // Điện thoại
    {
        name: "iPhone 15 Pro Max",
        description: "Smartphone cao cấp với chip A17 Pro, camera chuyên nghiệp và thiết kế titan sang trọng.",
        price: 32990000,
        category: "Điện thoại",
        image: "https://example.com/iphone-15-pro-max.jpg",
        stock: 25,
        tags: ["Apple", "5G", "Pro", "Titan"]
    },
    {
        name: "Samsung Galaxy S24 Ultra",
        description: "Flagship Android với S Pen tích hợp, camera zoom 100x và màn hình Dynamic AMOLED 2X.",
        price: 31990000,
        category: "Điện thoại",
        image: "https://example.com/galaxy-s24-ultra.jpg",
        stock: 30,
        tags: ["Samsung", "S Pen", "Android", "Camera"]
    },
    {
        name: "Xiaomi 14 Ultra",
        description: "Smartphone photography với hệ thống camera Leica và hiệu năng Snapdragon 8 Gen 3.",
        price: 24990000,
        category: "Điện thoại",
        image: "https://example.com/xiaomi-14-ultra.jpg",
        stock: 20,
        tags: ["Xiaomi", "Leica", "Photography", "Snapdragon"]
    },

    // Laptop
    {
        name: "MacBook Pro 16 inch M3 Pro",
        description: "Laptop chuyên nghiệp với chip M3 Pro, màn hình Liquid Retina XDR và thời lượng pin 22 giờ.",
        price: 65990000,
        category: "Laptop",
        image: "https://example.com/macbook-pro-16-m3.jpg",
        stock: 15,
        tags: ["Apple", "M3 Pro", "Professional", "Retina"]
    },
    {
        name: "Dell XPS 13 Plus",
        description: "Ultrabook premium với thiết kế không viền, bàn phím cảm ứng và hiệu năng Intel Core i7.",
        price: 42990000,
        category: "Laptop",
        image: "https://example.com/dell-xps-13-plus.jpg",
        stock: 12,
        tags: ["Dell", "Ultrabook", "Intel", "Premium"]
    },
    {
        name: "ASUS ROG Zephyrus G16",
        description: "Gaming laptop mỏng nhẹ với RTX 4070, AMD Ryzen 9 và màn hình 240Hz.",
        price: 48990000,
        category: "Laptop",
        image: "https://example.com/asus-rog-g16.jpg",
        stock: 8,
        tags: ["ASUS", "Gaming", "RTX", "240Hz"]
    },

    // Tai nghe
    {
        name: "Sony WH-1000XM5",
        description: "Tai nghe over-ear với chống ồn hàng đầu, âm thanh Hi-Res và thời lượng pin 30 giờ.",
        price: 8990000,
        category: "Tai nghe",
        image: "https://example.com/sony-wh1000xm5.jpg",
        stock: 40,
        tags: ["Sony", "Noise Cancelling", "Hi-Res", "Wireless"]
    },
    {
        name: "Apple AirPods Pro 2",
        description: "Tai nghe true wireless với chống ồn chủ động, âm thanh không gian và case MagSafe.",
        price: 6990000,
        category: "Tai nghe",
        image: "https://example.com/airpods-pro-2.jpg",
        stock: 35,
        tags: ["Apple", "True Wireless", "ANC", "MagSafe"]
    },
    {
        name: "Sennheiser HD 660S2",
        description: "Tai nghe audiophile mở với driver 38mm, âm thanh tự nhiên và thiết kế ergonomic.",
        price: 12990000,
        category: "Tai nghe",
        image: "https://example.com/sennheiser-hd660s2.jpg",
        stock: 18,
        tags: ["Sennheiser", "Audiophile", "Open-back", "Hi-Fi"]
    },

    // Phụ kiện
    {
        name: "Apple Watch Series 9",
        description: "Smartwatch với chip S9, màn hình Retina Always-On và tính năng sức khỏe toàn diện.",
        price: 9990000,
        category: "Phụ kiện",
        image: "https://example.com/apple-watch-s9.jpg",
        stock: 28,
        tags: ["Apple", "Smartwatch", "Health", "Fitness"]
    },
    {
        name: "Anker PowerBank 20000mAh",
        description: "Sạc dự phòng dung lượng lớn với sạc nhanh 65W PD, hiển thị LED và nhỏ gọn.",
        price: 1990000,
        category: "Phụ kiện",
        image: "https://example.com/anker-powerbank-20k.jpg",
        stock: 50,
        tags: ["Anker", "PowerBank", "65W", "PD"]
    },
    {
        name: "Logitech MX Master 3S",
        description: "Chuột không dây chuyên nghiệp với cảm biến 8000 DPI, cuộn im lặng và pin 70 ngày.",
        price: 2990000,
        category: "Phụ kiện",
        image: "https://example.com/logitech-mx-master-3s.jpg",
        stock: 22,
        tags: ["Logitech", "Wireless Mouse", "Professional", "8000 DPI"]
    },

    // Máy tính bảng
    {
        name: "iPad Pro 12.9 inch M2",
        description: "Máy tính bảng chuyên nghiệp với chip M2, màn hình Liquid Retina XDR và hỗ trợ Apple Pencil.",
        price: 28990000,
        category: "Máy tính bảng",
        image: "https://example.com/ipad-pro-12-m2.jpg",
        stock: 20,
        tags: ["Apple", "M2", "Pro", "Apple Pencil"]
    },
    {
        name: "Samsung Galaxy Tab S9 Ultra",
        description: "Android tablet cao cấp với màn hình 14.6 inch, S Pen và hiệu năng Snapdragon 8 Gen 2.",
        price: 26990000,
        category: "Máy tính bảng",
        image: "https://example.com/galaxy-tab-s9-ultra.jpg",
        stock: 15,
        tags: ["Samsung", "Android", "S Pen", "14.6 inch"]
    },

    // Thêm sản phẩm để test phân trang
    ...Array.from({length: 20}, (_, i) => ({
        name: `Sản phẩm test ${i + 1}`,
        description: `Mô tả chi tiết cho sản phẩm test số ${i + 1}`,
        price: Math.floor(Math.random() * 10000000) + 1000000,
        category: ["Điện thoại", "Laptop", "Tai nghe", "Phụ kiện", "Máy tính bảng"][Math.floor(Math.random() * 5)],
        image: `https://example.com/test-product-${i + 1}.jpg`,
        stock: Math.floor(Math.random() * 50) + 1,
        tags: ["Test", "Sample", "Demo"]
    }))
];

const seedProducts = async () => {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log('Đã kết nối database');

        // Xóa tất cả sản phẩm cũ
        await Product.deleteMany({});
        console.log('Đã xóa dữ liệu cũ');

        // Thêm sản phẩm mới
        await Product.insertMany(sampleProducts);
        console.log(`Đã thêm ${sampleProducts.length} sản phẩm mẫu`);

        // Hiển thị thống kê
        const categories = await Product.distinct('category');
        console.log('Danh mục có sẵn:', categories);
        
        for (const category of categories) {
            const count = await Product.countDocuments({ category });
            console.log(`- ${category}: ${count} sản phẩm`);
        }

    } catch (error) {
        console.error('Lỗi khi seed dữ liệu:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Đã đóng kết nối database');
    }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    seedProducts();
}

module.exports = seedProducts;
