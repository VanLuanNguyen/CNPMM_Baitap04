import React, { useEffect, useState } from 'react';
import { Modal, Typography, Tag, Space, Divider, Row, Col } from 'antd';
import { CloseOutlined, UserOutlined } from '@ant-design/icons';
import { FavoriteButton } from './FavoriteButton';
import { PurchaseButton } from './PurchaseButton';
import { SimilarProducts } from './SimilarProducts';
import { Rating } from './Rating';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { useAuthContext } from '../context/auth.context';
import { addToViewedProductsApi } from '../../util/api';
import type { Product } from '../../types/product.types';

const { Title, Text, Paragraph } = Typography;

interface ProductDetailModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  visible,
  product: initialProduct,
  onClose
}) => {
  const { auth } = useAuthContext();
  const [product, setProduct] = useState(initialProduct);
  const [commentsRefreshTrigger, setCommentsRefreshTrigger] = useState<number>(0);

  // Update product state when prop changes
  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  // Track viewed product when modal opens
  useEffect(() => {
    const trackViewedProduct = async () => {
      if (!visible || !product || !auth.isAuthenticated) return;

      try {
        await addToViewedProductsApi(product._id);
        // Silent tracking - không cần thông báo cho user
      } catch (error) {
        // Silent fail - không làm gián đoạn UX
        console.log('Failed to track viewed product:', error);
      }
    };

    // Delay một chút để đảm bảo modal đã mở hoàn toàn
    if (visible && product) {
      const timer = setTimeout(trackViewedProduct, 500);
      return () => clearTimeout(timer);
    }
  }, [visible, product, auth.isAuthenticated]);

  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatPurchaseCount = (count: number) => {
    if (count === 0) return 'Chưa có người mua';
    if (count === 1) return '1 khách hàng đã mua';
    return `${count} khách hàng đã mua`;
  };

  const handlePurchaseSuccess = (updatedProduct: Product) => {
    setProduct(updatedProduct);
  };

  const handleCommentSubmitted = () => {
    // Refresh comments list
    setCommentsRefreshTrigger(prev => prev + 1);
    
    // Update product's comment count (optimistic update)
    if (product) {
      setProduct(prev => prev ? {
        ...prev,
        totalComments: prev.totalComments + 1
        // Note: averageRating will be updated by backend, we'll get it on next refresh
      } : prev);
    }
  };

  const handleCommentUpdated = () => {
    // Refresh comments list to show updated content
    setCommentsRefreshTrigger(prev => prev + 1);
  };

  const handleCommentDeleted = () => {
    // Refresh comments list
    setCommentsRefreshTrigger(prev => prev + 1);
    
    // Update product's comment count (optimistic update)
    if (product) {
      setProduct(prev => prev ? {
        ...prev,
        totalComments: Math.max(0, prev.totalComments - 1)
      } : prev);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      closeIcon={<CloseOutlined />}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Chi tiết sản phẩm</span>
          <Tag color="blue">{product.category}</Tag>
        </div>
      }
    >
      <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <Row gutter={[24, 24]}>
          {/* Left Column - Product Image */}
          <Col xs={24} md={10}>
            <div 
              style={{ 
                height: 300, 
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px',
                color: '#d9d9d9',
                borderRadius: '8px'
              }}
            >
              📱
            </div>
          </Col>
          
          {/* Right Column - Product Info */}
          <Col xs={24} md={14}>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Product Title */}
              <Title level={2} style={{ marginBottom: '12px', lineHeight: 1.3 }}>
                {product.name}
              </Title>
              
              {/* Price */}
              <Title level={3} style={{ color: '#ff4d4f', margin: '0 0 16px 0' }}>
                {formatPrice(product.price)}
              </Title>
              
              {/* Rating */}
              {product.averageRating > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <Space align="center">
                    <Rating value={product.averageRating} showText={true} />
                    <Text type="secondary">
                      ({product.totalComments} đánh giá)
                    </Text>
                  </Space>
                </div>
              )}
              
              {/* Stock Status & Purchase Info */}
              <Space style={{ marginBottom: '16px' }}>
                <Text type={product.stock > 0 ? 'success' : 'danger'}>
                  {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                </Text>
                <Text type="secondary">•</Text>
                <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <UserOutlined />
                  {formatPurchaseCount(product.purchaseCount)}
                </Text>
              </Space>
              
              <div style={{ marginBottom: '16px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Ngày tạo: {formatDate(product.createdAt)}
                </Text>
              </div>
              
              {/* Tags */}
              <div style={{ marginBottom: '20px' }}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Tags:</Text>
                <Space wrap>
                  {product.tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </div>
              
              {/* Action Buttons */}
              <Space size="middle" style={{ marginBottom: '20px' }}>
                <PurchaseButton 
                  product={product}
                  size="large" 
                  type="primary"
                  showQuantitySelector={true}
                  onPurchaseSuccess={handlePurchaseSuccess}
                />
                <FavoriteButton productId={product._id} size="large" type="default" />
              </Space>
            </div>
          </Col>
        </Row>
        
        {/* Product Description */}
        <Divider />
        <div style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ marginBottom: '12px' }}>Mô tả sản phẩm</Title>
          <Paragraph style={{ fontSize: '15px', lineHeight: 1.6 }}>
            {product.description}
          </Paragraph>
        </div>
        
        {/* Product Specifications */}
        <Divider />
        <div style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ marginBottom: '16px' }}>Thông số kỹ thuật</Title>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Text strong>Danh mục:</Text> <Text>{product.category}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Giá:</Text> <Text>{formatPrice(product.price)}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Tồn kho:</Text> <Text>{product.stock} sản phẩm</Text>
            </Col>
            <Col span={12}>
              <Text strong>Số người mua:</Text> <Text>{product.purchaseCount} khách hàng</Text>
            </Col>
            <Col span={12}>
              <Text strong>Trạng thái:</Text> 
              <Tag color={product.isActive ? 'green' : 'red'} style={{ marginLeft: '8px' }}>
                {product.isActive ? 'Đang bán' : 'Ngừng bán'}
              </Tag>
            </Col>
          </Row>
        </div>
        
        {/* Similar Products */}
        <Divider />
        <SimilarProducts 
          productId={product._id} 
          limit={4}
          title="Sản phẩm tương tự"
          style={{ marginTop: '20px' }}
        />
        
        {/* Comments Section */}
        <Divider />
        <div style={{ marginTop: '20px' }}>
          <CommentForm 
            productId={product._id}
            onCommentSubmitted={handleCommentSubmitted}
            onCommentUpdated={handleCommentUpdated}
          />
          
          <CommentList 
            productId={product._id}
            refreshTrigger={commentsRefreshTrigger}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      </div>
    </Modal>
  );
};