import React, { useState } from 'react';
import { Button, message, InputNumber, Space, Modal } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { purchaseProductApi } from '../../util/api';
import { useAuthContext } from '../context/auth.context';
import type { Product } from '../../types/product.types';

interface PurchaseButtonProps {
  product: Product;
  size?: 'small' | 'middle' | 'large';
  type?: 'text' | 'link' | 'ghost' | 'default' | 'primary' | 'dashed';
  onPurchaseSuccess?: (updatedProduct: Product, purchaseInfo: any) => void;
  showQuantitySelector?: boolean;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({ 
  product,
  size = 'middle',
  type = 'primary',
  onPurchaseSuccess,
  showQuantitySelector = false
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const { auth } = useAuthContext();

  const handlePurchase = async (purchaseQuantity: number = 1) => {
    if (!auth.isAuthenticated) {
      message.warning('Vui lòng đăng nhập để mua hàng');
      return;
    }

    if (product.stock === 0) {
      message.error('Sản phẩm đã hết hàng');
      return;
    }

    if (purchaseQuantity > product.stock) {
      message.error(`Chỉ còn ${product.stock} sản phẩm trong kho`);
      return;
    }

    setLoading(true);
    
    try {
      const response = await purchaseProductApi(product._id, purchaseQuantity);
      
      if (response.success) {
        message.success(
          <div>
            <div>🎉 {response.message}</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Đã có {response.purchaseInfo.totalCustomers} khách hàng mua sản phẩm này
            </div>
          </div>
        );
        
        // Callback to parent component with updated data
        if (onPurchaseSuccess) {
          onPurchaseSuccess(response.data, response.purchaseInfo);
        }
        
        // Reset quantity and close modal
        setQuantity(1);
        setModalVisible(false);
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi mua hàng');
      }
    } catch (error: any) {
      console.error('Error purchasing product:', error);
      message.error('Có lỗi xảy ra khi mua hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    if (showQuantitySelector && product.stock > 1) {
      setModalVisible(true);
    } else {
      handlePurchase(1);
    }
  };

  const handleModalOk = () => {
    handlePurchase(quantity);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setQuantity(1);
  };

  const isDisabled = product.stock === 0 || !product.isActive;

  return (
    <>
      <Button
        type={type}
        size={size}
        loading={loading}
        disabled={isDisabled}
        onClick={handleButtonClick}
        icon={<ShoppingCartOutlined />}
        style={{
          ...(isDisabled && { opacity: 0.5 }),
        }}
      >
        {product.stock === 0 ? 'Hết hàng' : 'Mua ngay'}
      </Button>

      {/* Quantity Selection Modal */}
      <Modal
        title="Chọn số lượng"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Mua ngay"
        cancelText="Hủy"
        confirmLoading={loading}
        width={400}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: '16px' }}>
            <strong>{product.name}</strong>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <span>Giá: </span>
            <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(product.price)}
            </span>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <span>Còn lại: </span>
            <span style={{ color: '#52c41a' }}>{product.stock} sản phẩm</span>
          </div>
          
          <Space align="center">
            <span>Số lượng:</span>
            <InputNumber
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(value) => setQuantity(value || 1)}
              style={{ width: '80px' }}
            />
          </Space>
          
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tổng tiền:</span>
              <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(product.price * quantity)}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

