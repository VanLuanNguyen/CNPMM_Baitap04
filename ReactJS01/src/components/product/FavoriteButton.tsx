import React, { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { 
  addToFavoritesApi, 
  removeFromFavoritesApi, 
  checkIsFavoriteApi 
} from '../../util/api';
import { useAuthContext } from '../context/auth.context';

interface FavoriteButtonProps {
  productId: string;
  size?: 'small' | 'middle' | 'large';
  type?: 'text' | 'link' | 'ghost' | 'default' | 'primary' | 'dashed';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  productId, 
  size = 'middle',
  type = 'text'
}) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { auth } = useAuthContext();

  // Kiểm tra favorite status khi component mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!auth.isAuthenticated) return;
      
      try {
        const response = await checkIsFavoriteApi(productId);
        if (response.success) {
          setIsFavorite(response.isFavorite);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [productId, auth.isAuthenticated]);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    if (!auth.isAuthenticated) {
      message.warning('Vui lòng đăng nhập để sử dụng tính năng yêu thích');
      return;
    }

    setLoading(true);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await removeFromFavoritesApi(productId);
        if (response.success) {
          setIsFavorite(false);
          message.success('Đã xóa khỏi danh sách yêu thích');
        } else {
          message.error(response.message || 'Có lỗi xảy ra');
        }
      } else {
        // Add to favorites
        const response = await addToFavoritesApi(productId);
        if (response.success) {
          setIsFavorite(true);
          message.success('Đã thêm vào danh sách yêu thích');
        } else {
          message.error(response.message || 'Có lỗi xảy ra');
        }
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      message.error('Có lỗi xảy ra khi thực hiện thao tác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type={type}
      size={size}
      loading={loading}
      onClick={handleFavoriteToggle}
      icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
      style={{
        border: 'none',
        boxShadow: 'none',
        color: isFavorite ? '#ff4d4f' : undefined
      }}
    />
  );
};

