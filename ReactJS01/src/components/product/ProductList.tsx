import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spin, Alert, Typography, Empty, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ProductCard } from './ProductCard';
import { CategoryFilter } from './CategoryFilter';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { getProductsApi } from '../../util/api';
import type { Product } from '../../types/product.types';

const { Title } = Typography;
const { Search } = Input;

export const ProductList: React.FC = () => {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalItems, setTotalItems] = useState(0);

  const ITEMS_PER_PAGE = 12;

  // Load products function
  const loadProducts = useCallback(async (
    page: number = 1, 
    category: string = selectedCategory,
    search: string = searchTerm,
    reset: boolean = false
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProductsApi({
        page,
        limit: ITEMS_PER_PAGE,
        category: category === 'all' ? undefined : category,
        search: search || undefined
      });

      if (response.success) {
        if (reset) {
          setProducts(response.products);
        } else {
          setProducts(prev => [...prev, ...response.products]);
        }
        
        setHasMore(response.pagination.hasNext);
        setTotalItems(response.pagination.totalItems);
        setCurrentPage(page);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm]);

  // Load more products for infinite scroll
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadProducts(currentPage + 1, selectedCategory, searchTerm, false);
    }
  }, [loading, hasMore, currentPage, selectedCategory, searchTerm, loadProducts]);

  // Infinite scroll hook
  const loadMoreRef = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: loadMore
  });

  // Handle category change
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setProducts([]);
    setHasMore(true);
    loadProducts(1, category, searchTerm, true);
  }, [searchTerm, loadProducts]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setProducts([]);
    setHasMore(true);
    loadProducts(1, selectedCategory, value, true);
  }, [selectedCategory, loadProducts]);

  // Initial load
  useEffect(() => {
    loadProducts(1, selectedCategory, searchTerm, true);
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Danh sách sản phẩm</Title>
        <Typography.Text type="secondary">
          {totalItems > 0 && `Tìm thấy ${totalItems} sản phẩm`}
        </Typography.Text>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <Search
          placeholder="Tìm kiếm sản phẩm..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ maxWidth: 400 }}
        />
      </div>

      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Error */}
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Empty state */}
      {!loading && products.length === 0 && !error && (
        <Empty
          description="Không tìm thấy sản phẩm nào"
          style={{ margin: '40px 0' }}
        />
      )}

      {/* Product Grid */}
      {products.length > 0 && (
        <Row gutter={[16, 16]}>
          {products.map((product) => (
            <Col
              key={product._id}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              xl={6}
            >
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}

      {/* Loading indicator for infinite scroll */}
      <div ref={loadMoreRef} style={{ textAlign: 'center', padding: '20px' }}>
        {loading && <Spin size="large" />}
        {!hasMore && products.length > 0 && (
          <Typography.Text type="secondary">
            Đã hiển thị tất cả sản phẩm
          </Typography.Text>
        )}
      </div>
    </div>
  );
};
