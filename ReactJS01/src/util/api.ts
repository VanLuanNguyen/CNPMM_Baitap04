import axios from "./axios.customize";
import type { 
  ProductQuery, 
  ProductsResponse, 
  CategoriesResponse, 
  Product,
  FavoritesResponse,
  FavoriteActionResponse,
  FavoriteCheckResponse,
  SimilarProductsResponse,
  ViewedProductsResponse,
  ViewedProductActionResponse,
  PurchaseResponse,
  PurchaseStatsResponse,
  CommentsResponse,
  CommentResponse,
  UserCommentResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentActionResponse
} from "../types/product.types";

// User APIs
const createUserApi = (name: string, email: string, password: string) => {
  const URL_API = "/v1/api/register";
  const data = {
    name,
    email,
    password,
  };
  return axios.post(URL_API, data);
};

const loginApi = (email: string, password: string) => {
  const URL_API = "/v1/api/login";
  const data = {
    email,
    password,
  };
  return axios.post(URL_API, data);
};

const getUserApi = () => {
  const URL_API = "/v1/api/user";
  return axios.get(URL_API);
};

// Product APIs
const getProductsApi = (params: ProductQuery = {}): Promise<ProductsResponse> => {
  const URL_API = "/v1/api/products";
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.category && params.category !== 'all') queryParams.append('category', params.category);
  if (params.search) queryParams.append('search', params.search);
  if (params.fuzzy) queryParams.append('fuzzy', params.fuzzy.toString());
  if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
  if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
  
  const queryString = queryParams.toString();
  const finalUrl = queryString ? `${URL_API}?${queryString}` : URL_API;
  
  return axios.get(finalUrl);
};

const getCategoriesApi = (): Promise<CategoriesResponse> => {
  const URL_API = "/v1/api/categories";
  return axios.get(URL_API);
};

// Favorites APIs
const getUserFavoritesApi = (): Promise<FavoritesResponse> => {
  const URL_API = "/v1/api/favorites";
  return axios.get(URL_API);
};

const addToFavoritesApi = (productId: string): Promise<FavoriteActionResponse> => {
  const URL_API = `/v1/api/favorites/${productId}`;
  return axios.post(URL_API);
};

const removeFromFavoritesApi = (productId: string): Promise<FavoriteActionResponse> => {
  const URL_API = `/v1/api/favorites/${productId}`;
  return axios.delete(URL_API);
};

const checkIsFavoriteApi = (productId: string): Promise<FavoriteCheckResponse> => {
  const URL_API = `/v1/api/favorites/${productId}/check`;
  return axios.get(URL_API);
};

// Similar Products API
const getSimilarProductsApi = (productId: string, limit: number = 6): Promise<SimilarProductsResponse> => {
  const URL_API = `/v1/api/products/${productId}/similar`;
  const queryParams = new URLSearchParams();
  
  if (limit !== 6) queryParams.append('limit', limit.toString());
  
  const queryString = queryParams.toString();
  const finalUrl = queryString ? `${URL_API}?${queryString}` : URL_API;
  
  return axios.get(finalUrl);
};

// Viewed Products APIs
const getUserViewedProductsApi = (limit: number = 20): Promise<ViewedProductsResponse> => {
  const URL_API = "/v1/api/viewed-products";
  const queryParams = new URLSearchParams();
  
  if (limit !== 20) queryParams.append('limit', limit.toString());
  
  const queryString = queryParams.toString();
  const finalUrl = queryString ? `${URL_API}?${queryString}` : URL_API;
  
  return axios.get(finalUrl);
};

const addToViewedProductsApi = (productId: string): Promise<ViewedProductActionResponse> => {
  const URL_API = `/v1/api/viewed-products/${productId}`;
  return axios.post(URL_API);
};

const removeFromViewedProductsApi = (productId: string): Promise<ViewedProductActionResponse> => {
  const URL_API = `/v1/api/viewed-products/${productId}`;
  return axios.delete(URL_API);
};

const clearViewedProductsApi = (): Promise<ViewedProductActionResponse> => {
  const URL_API = "/v1/api/viewed-products";
  return axios.delete(URL_API);
};

// Purchase APIs
const purchaseProductApi = (productId: string, quantity: number = 1): Promise<PurchaseResponse> => {
  const URL_API = `/v1/api/products/${productId}/purchase`;
  const data = { quantity };
  return axios.post(URL_API, data);
};

const getProductPurchaseStatsApi = (productId: string): Promise<PurchaseStatsResponse> => {
  const URL_API = `/v1/api/products/${productId}/purchase-stats`;
  return axios.get(URL_API);
};

// Comment APIs
const createCommentApi = (data: CreateCommentRequest): Promise<CommentResponse> => {
  const URL_API = "/v1/api/comments";
  return axios.post(URL_API, data);
};

const getProductCommentsApi = (
  productId: string, 
  page: number = 1, 
  limit: number = 10, 
  sortBy: string = 'newest'
): Promise<CommentsResponse> => {
  const URL_API = `/v1/api/products/${productId}/comments`;
  const queryParams = new URLSearchParams();
  
  if (page !== 1) queryParams.append('page', page.toString());
  if (limit !== 10) queryParams.append('limit', limit.toString());
  if (sortBy !== 'newest') queryParams.append('sortBy', sortBy);
  
  const queryString = queryParams.toString();
  const finalUrl = queryString ? `${URL_API}?${queryString}` : URL_API;
  
  return axios.get(finalUrl);
};

const getUserCommentForProductApi = (productId: string): Promise<UserCommentResponse> => {
  const URL_API = `/v1/api/products/${productId}/comments/me`;
  return axios.get(URL_API);
};

const updateCommentApi = (commentId: string, data: UpdateCommentRequest): Promise<CommentResponse> => {
  const URL_API = `/v1/api/comments/${commentId}`;
  return axios.put(URL_API, data);
};

const deleteCommentApi = (commentId: string): Promise<CommentActionResponse> => {
  const URL_API = `/v1/api/comments/${commentId}`;
  return axios.delete(URL_API);
};

export { 
  createUserApi, 
  loginApi, 
  getUserApi,
  getProductsApi,
  getCategoriesApi,
  getUserFavoritesApi,
  addToFavoritesApi,
  removeFromFavoritesApi,
  checkIsFavoriteApi,
  getSimilarProductsApi,
  getUserViewedProductsApi,
  addToViewedProductsApi,
  removeFromViewedProductsApi,
  clearViewedProductsApi,
  purchaseProductApi,
  getProductPurchaseStatsApi,
  createCommentApi,
  getProductCommentsApi,
  getUserCommentForProductApi,
  updateCommentApi,
  deleteCommentApi
};
