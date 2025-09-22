// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  isActive: boolean;
  tags: string[];
  purchaseCount: number; // Số người đã mua
  averageRating: number; // Đánh giá trung bình
  totalComments: number; // Tổng số bình luận
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean; // Optional field để track favorite status trên frontend
  viewedAt?: string; // Optional field để track viewed timestamp trên frontend
}

// API Response types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  products: Product[];
  pagination: PaginationInfo;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: string[];
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Query parameters
export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  fuzzy?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

// Favorites types
export interface FavoritesResponse {
  success: boolean;
  message: string;
  data: Product[];
}

export interface FavoriteActionResponse {
  success: boolean;
  message: string;
}

export interface FavoriteCheckResponse {
  success: boolean;
  isFavorite: boolean;
}

// Similar products types
export interface SimilarProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  totalFound: number;
  basedOn: {
    category: string;
    tags: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}

// Viewed products types
export interface ViewedProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
}

export interface ViewedProductActionResponse {
  success: boolean;
  message: string;
}

// Purchase types
export interface PurchaseInfo {
  quantity: number;
  totalCustomers: number;
  remainingStock: number;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data: Product;
  purchaseInfo: PurchaseInfo;
}

export interface PurchaseStatsResponse {
  success: boolean;
  message: string;
  data: {
    productId: string;
    productName: string;
    totalCustomers: number;
    remainingStock: number;
    price: number;
    isInStock: boolean;
  };
}

// Comment types
export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Comment {
  _id: string;
  user: User;
  product: string;
  content: string;
  rating: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentsResponse {
  success: boolean;
  message: string;
  comments: Comment[];
  pagination: PaginationInfo;
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: Comment;
}

export interface UserCommentResponse {
  success: boolean;
  message: string;
  data: Comment | null;
}

export interface CreateCommentRequest {
  productId: string;
  content: string;
  rating: number;
}

export interface UpdateCommentRequest {
  content: string;
  rating: number;
}

export interface CommentActionResponse {
  success: boolean;
  message: string;
}
