import axios from "./axios.customize";
import type { ProductQuery, ProductsResponse, CategoriesResponse, Product } from "../types/product.types";

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
  
  const queryString = queryParams.toString();
  const finalUrl = queryString ? `${URL_API}?${queryString}` : URL_API;
  
  return axios.get(finalUrl);
};

const getCategoriesApi = (): Promise<CategoriesResponse> => {
  const URL_API = "/v1/api/categories";
  return axios.get(URL_API);
};

const createProductApi = (product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
  const URL_API = "/v1/api/products";
  return axios.post(URL_API, product);
};

export { 
  createUserApi, 
  loginApi, 
  getUserApi,
  getProductsApi,
  getCategoriesApi,
  createProductApi
};
