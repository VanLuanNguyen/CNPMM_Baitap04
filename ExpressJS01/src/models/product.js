const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index để tăng tốc độ query
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
