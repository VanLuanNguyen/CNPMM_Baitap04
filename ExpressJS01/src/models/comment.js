const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  isVisible: {
    type: Boolean,
    default: true
  },
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
commentSchema.index({ product: 1, createdAt: -1 });
commentSchema.index({ user: 1, product: 1 });
commentSchema.index({ rating: 1 });

// Middleware để update updatedAt khi save
commentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;

