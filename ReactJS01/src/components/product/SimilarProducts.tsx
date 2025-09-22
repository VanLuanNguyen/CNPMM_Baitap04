import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Spin, Alert, Empty, Card } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { ProductCard } from './ProductCard';
import { getSimilarProductsApi } from '../../util/api';
import type { Product } from '../../types/product.types';

const { Title, Text } = Typography;

interface SimilarProductsProps {
  productId: string;
  limit?: number;
  title?: string;
  style?: React.CSSProperties;
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({ 
  productId, 
  limit = 6,
  title = "Sản phẩm tương tự",
  style
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [basedOn, setBasedOn] = useState<any>(null);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await getSimilarProductsApi(productId, limit);
        
        if (response.success) {
          setProducts(response.data);
          setBasedOn(response.basedOn);
        } else {
          setError(response.message || 'Có lỗi khi tải sản phẩm tương tự');
        }
      } catch (err: any) {
        console.error('Error fetching similar products:', err);
        setError('Có lỗi xảy ra khi tải sản phẩm tương tự');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [productId, limit]);

  // Không hiển thị gì nếu đang loading lần đầu
  if (loading && products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', ...style }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', color: '#666' }}>
          Đang tìm sản phẩm tương tự...
        </div>
      </div>
    );
  }

  // Hiển thị error nếu có
  if (error) {
    return (
      <div style={style}>
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      </div>
    );
  }

  // Không hiển thị gì nếu không có sản phẩm tương tự
  if (products.length === 0) {
    return (
      <div style={style}>
        <Title level={4} style={{ marginBottom: '16px' }}>
          {title}
        </Title>
        <Empty
          image={<ShopOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
          description="Không tìm thấy sản phẩm tương tự"
          style={{ padding: '20px 0' }}
        />
      </div>
    );
  }

  return (
    <div style={style}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShopOutlined />
          {title}
          <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>
            ({products.length} sản phẩm)
          </span>
        </Title>
        
        {/* Thông tin dựa trên */}
        {basedOn && (
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
            Dựa trên: {basedOn.category}
            {basedOn.tags && basedOn.tags.length > 0 && (
              <span>, Tags: {basedOn.tags.slice(0, 3).join(', ')}</span>
            )}
          </Text>
        )}
      </div>

      {/* Products Grid */}
      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <Col 
            key={product._id} 
            xs={24} 
            sm={12} 
            md={8} 
            lg={6} 
            xl={4}
            style={{ minWidth: '280px' }}
          >
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>

      {/* Loading indicator khi đang reload */}
      {loading && products.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Spin />
        </div>
      )}
    </div>
  );
};

