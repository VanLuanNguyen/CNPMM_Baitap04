import React, { useState } from 'react';
import { Card, Typography, Tag, Space } from 'antd';
import { EyeOutlined, UserOutlined } from '@ant-design/icons';
import type { Product } from '../../types/product.types';
import { FavoriteButton } from './FavoriteButton';
import { PurchaseButton } from './PurchaseButton';
import { Rating } from './Rating';
import { ProductDetailModal } from './ProductDetailModal';

const { Text, Title } = Typography;
const { Meta } = Card;

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product: initialProduct }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [product, setProduct] = useState(initialProduct);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatPurchaseCount = (count: number) => {
    if (count === 0) return 'Chưa có người mua';
    if (count === 1) return '1 người đã mua';
    return `${count} người đã mua`;
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalVisible(true);
  };

  const handleCardClick = () => {
    setModalVisible(true);
  };

  const handlePurchaseSuccess = (updatedProduct: Product) => {
    setProduct(updatedProduct);
  };

  const actions = [
    <EyeOutlined key="view" onClick={handleViewDetails} style={{ cursor: 'pointer' }} />,
    <PurchaseButton 
      key="purchase" 
      product={product} 
      size="small" 
      type="text"
      onPurchaseSuccess={handlePurchaseSuccess}
    />,
    <FavoriteButton key="favorite" productId={product._id} />,
  ];

  return (
    <>
      <Card
        hoverable
        style={{ width: 280, marginBottom: 16, cursor: 'pointer' }}
        onClick={handleCardClick}
        cover={
          <div 
            style={{ 
              height: 200, 
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              color: '#d9d9d9'
            }}
          >
            📱
          </div>
        }
        actions={actions}
      >
        <Meta
          title={
            <Title level={5} ellipsis={{ rows: 2 }}>
              {product.name}
            </Title>
          }
          description={
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text type="secondary" ellipsis={{  }}>
                {product.description}
              </Text>
              <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
                {formatPrice(product.price)}
              </Text>
              
              {/* Rating */}
              {product.averageRating > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <Rating 
                    value={product.averageRating} 
                    size="small" 
                  />
                  <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                    ({product.totalComments} đánh giá)
                  </Text>
                </div>
              )}
              
              <Space wrap>
                <Tag color="blue">{product.category}</Tag>
                <Text type="secondary">Còn {product.stock} sản phẩm</Text>
              </Space>
              <div style={{ marginBottom: '4px' }}>
                <Text type="secondary" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <UserOutlined />
                  {formatPurchaseCount(product.purchaseCount)}
                </Text>
              </div>
              <Space wrap size="small">
                {product.tags.slice(0, 3).map(tag => (
                  <Tag key={tag} >{tag}</Tag>
                ))}
              </Space>
            </Space>
          }
        />
      </Card>
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={modalVisible}
        product={product}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};
