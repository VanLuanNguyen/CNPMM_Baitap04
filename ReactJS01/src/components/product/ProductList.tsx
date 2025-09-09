import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spin, Alert, Typography, Empty, Input, Switch, Space, Button } from 'antd';
import { SearchOutlined, ThunderboltOutlined } from '@ant-design/icons';
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
  const [useFuzzySearch, setUseFuzzySearch] = useState(true); // Mặc định bật Fuzzy Search
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const ITEMS_PER_PAGE = 12;

  // Load products function
  const loadProducts = useCallback(async (
    page: number = 1, 
    category: string = selectedCategory,
    search: string = searchTerm,
    reset: boolean = false,
    fuzzy: boolean = useFuzzySearch,
    minP: number | undefined = minPrice,
    maxP: number | undefined = maxPrice
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProductsApi({
        page,
        limit: ITEMS_PER_PAGE,
        category: category === 'all' ? undefined : category,
        search: search || undefined,
        fuzzy: fuzzy,
        minPrice: minP,
        maxPrice: maxP
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
  }, [selectedCategory, searchTerm, useFuzzySearch, minPrice, maxPrice]);

  // Load more products for infinite scroll
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadProducts(currentPage + 1, selectedCategory, searchTerm, false, useFuzzySearch, minPrice, maxPrice);
    }
  }, [loading, hasMore, currentPage, selectedCategory, searchTerm, useFuzzySearch, minPrice, maxPrice, loadProducts]);

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
    loadProducts(1, category, searchTerm, true, useFuzzySearch, minPrice, maxPrice);
  }, [searchTerm, useFuzzySearch, minPrice, maxPrice, loadProducts]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setProducts([]);
    setHasMore(true);
    loadProducts(1, selectedCategory, value, true, useFuzzySearch, minPrice, maxPrice);
  }, [selectedCategory, useFuzzySearch, minPrice, maxPrice, loadProducts]);

  // Handle fuzzy search toggle
  const handleFuzzyToggle = useCallback((checked: boolean) => {
    setUseFuzzySearch(checked);
    // Reload products khi thay đổi fuzzy mode
    setCurrentPage(1);
    setProducts([]);
    setHasMore(true);
    loadProducts(1, selectedCategory, searchTerm, true, checked, minPrice, maxPrice);
  }, [searchTerm, selectedCategory, minPrice, maxPrice, loadProducts]);

  // Initial load
  useEffect(() => {
    loadProducts(1, selectedCategory, searchTerm, true, useFuzzySearch, minPrice, maxPrice);
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
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Search
              placeholder="Tìm kiếm theo tên sản phẩm..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              style={{ maxWidth: 400 }}
            />
            <Space>
              <ThunderboltOutlined style={{ color: useFuzzySearch ? '#1890ff' : '#d9d9d9' }} />
              <Switch
                checked={useFuzzySearch}
                onChange={handleFuzzyToggle}
                checkedChildren="Fuzzy"
                unCheckedChildren="Normal"
                size="small"
              />
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                {useFuzzySearch ? 'Tìm kiếm mờ theo tên (tolerate typos)' : 'Tìm kiếm chính xác theo tên'}
              </Typography.Text>
            </Space>
          </Space>
          <Space wrap>
            <Input
              placeholder="Giá tối thiểu"
              type="number"
              value={minPrice ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                const num = v === '' ? undefined : Math.max(0, Number(v));
                setMinPrice(Number.isNaN(num as number) ? undefined : num);
              }}
              style={{ width: 160 }}
            />
            <Input
              placeholder="Giá tối đa"
              type="number"
              value={maxPrice ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                const num = v === '' ? undefined : Math.max(0, Number(v));
                setMaxPrice(Number.isNaN(num as number) ? undefined : num);
              }}
              style={{ width: 160 }}
            />
            <Button
              type="primary"
              onClick={() => {
                setCurrentPage(1);
                setProducts([]);
                setHasMore(true);
                loadProducts(1, selectedCategory, searchTerm, true, useFuzzySearch, minPrice, maxPrice);
              }}
            >
              Lọc giá
            </Button>
          </Space>
        </Space>
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
