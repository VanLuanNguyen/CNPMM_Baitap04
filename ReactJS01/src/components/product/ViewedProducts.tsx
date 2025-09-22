import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Spin, Alert, Empty, Card, Button, Space, Tooltip } from 'antd';
import { HistoryOutlined, ClearOutlined, DeleteOutlined } from '@ant-design/icons';
import { ProductCard } from './ProductCard';
import { getUserViewedProductsApi, clearViewedProductsApi, removeFromViewedProductsApi } from '../../util/api';
import type { Product } from '../../types/product.types';

const { Title, Text } = Typography;

interface ViewedProductsProps {
  limit?: number;
  title?: string;
  style?: React.CSSProperties;
  showClearButton?: boolean;
  showRemoveButtons?: boolean;
}

export const ViewedProducts: React.FC<ViewedProductsProps> = ({ 
  limit = 20,
  title = "Sản phẩm đã xem",
  style,
  showClearButton = true,
  showRemoveButtons = false
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState<boolean>(false);

  const fetchViewedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getUserViewedProductsApi(limit);
      
      if (response.success) {
        setProducts(response.data);
      } else {
        setError(response.message || 'Có lỗi khi tải lịch sử xem sản phẩm');
      }
    } catch (err: any) {
      console.error('Error fetching viewed products:', err);
      setError('Có lỗi xảy ra khi tải lịch sử xem sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViewedProducts();
  }, [limit]);

  const handleClearAll = async () => {
    try {
      setClearingAll(true);
      const response = await clearViewedProductsApi();
      
      if (response.success) {
        setProducts([]);
      } else {
        setError(response.message || 'Có lỗi khi xóa lịch sử');
      }
    } catch (err: any) {
      console.error('Error clearing viewed products:', err);
      setError('Có lỗi xảy ra khi xóa lịch sử');
    } finally {
      setClearingAll(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      const response = await removeFromViewedProductsApi(productId);
      
      if (response.success) {
        setProducts(prev => prev.filter(p => p._id !== productId));
      } else {
        setError(response.message || 'Có lỗi khi xóa sản phẩm');
      }
    } catch (err: any) {
      console.error('Error removing viewed product:', err);
      setError('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  const formatViewedTime = (viewedAt: string) => {
    const now = new Date();
    const viewed = new Date(viewedAt);
    const diffInHours = Math.floor((now.getTime() - viewed.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Vừa xem';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
  };

  // Không hiển thị gì nếu đang loading lần đầu
  if (loading && products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', ...style }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', color: '#666' }}>
          Đang tải lịch sử xem sản phẩm...
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
          action={
            <Button size="small" onClick={fetchViewedProducts}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  // Không hiển thị gì nếu không có sản phẩm đã xem
  if (products.length === 0) {
    return (
      <div style={style}>
        <Title level={4} style={{ marginBottom: '16px' }}>
          {title}
        </Title>
        <Empty
          image={<HistoryOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
          description={
            <div>
              <div style={{ marginBottom: '8px' }}>Chưa có sản phẩm nào được xem</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Lịch sử xem sẽ được ghi lại khi bạn xem chi tiết sản phẩm
              </Text>
            </div>
          }
          style={{ padding: '20px 0' }}
        />
      </div>
    );
  }

  return (
    <div style={style}>
      {/* Header */}
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HistoryOutlined />
            {title}
            <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>
              ({products.length} sản phẩm)
            </span>
          </Title>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
            Lịch sử xem sản phẩm của bạn
          </Text>
        </div>
        
        {showClearButton && products.length > 0 && (
          <Button 
            type="text" 
            danger
            icon={<ClearOutlined />}
            loading={clearingAll}
            onClick={handleClearAll}
            size="small"
          >
            Xóa tất cả
          </Button>
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
            <div style={{ position: 'relative' }}>
              {/* Viewed time badge */}
              {product.viewedAt && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    right: '8px', 
                    zIndex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}
                >
                  {formatViewedTime(product.viewedAt)}
                </div>
              )}
              
              {/* Remove button */}
              {showRemoveButtons && (
                <Tooltip title="Xóa khỏi lịch sử">
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveProduct(product._id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      zIndex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }}
                  />
                </Tooltip>
              )}
              
              <ProductCard product={product} />
            </div>
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

