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
  createdAt: string;
  updatedAt: string;
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
