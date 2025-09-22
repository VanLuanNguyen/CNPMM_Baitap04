import React, { useState, useEffect } from 'react';
import { Layout, Typography, Row, Col, Spin, Empty, message, Button, Space } from 'antd';
import { HeartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/product/ProductCard';
import { useAuthContext } from '../components/context/auth.context';
import { getUserFavoritesApi } from '../util/api';
import type { Product } from '../types/product.types';

const { Content } = Layout;
const { Title } = Typography;

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { auth } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!auth.isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getUserFavoritesApi();
        if (response.success) {
          setFavorites(response.data);
        } else {
          message.error(response.message || 'Có lỗi khi tải danh sách yêu thích');
        }
      } catch (error: any) {
        console.error('Error fetching favorites:', error);
        message.error('Có lỗi xảy ra khi tải danh sách yêu thích');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [auth.isAuthenticated]);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!auth.isAuthenticated) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Content style={{ padding: '50px' }}>
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <HeartOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={3} style={{ color: '#666' }}>
              Vui lòng đăng nhập để xem danh sách yêu thích
            </Title>
            <Space>
              <Button type="primary" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
              <Button onClick={handleBackToHome}>
                Về trang chủ
              </Button>
            </Space>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Content style={{ padding: '20px 50px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Space>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBackToHome}
              style={{ marginBottom: '16px' }}
            >
              Về trang chủ
            </Button>
          </Space>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HeartOutlined style={{ color: '#ff4d4f' }} />
            Sản phẩm yêu thích
            <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>
              ({favorites.length} sản phẩm)
            </span>
          </Title>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: '#666' }}>
              Đang tải danh sách yêu thích...
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <Empty
              image={<HeartOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
              description={
                <div>
                  <Title level={4} style={{ color: '#666', marginBottom: '8px' }}>
                    Chưa có sản phẩm yêu thích
                  </Title>
                  <div style={{ color: '#999', marginBottom: '16px' }}>
                    Hãy thêm những sản phẩm bạn thích vào danh sách này
                  </div>
                </div>
              }
            >
              <Button type="primary" onClick={handleBackToHome}>
                Khám phá sản phẩm
              </Button>
            </Empty>
          </div>
        ) : (
          <Row gutter={[16, 16]} justify="start">
            {favorites.map((product) => (
              <Col key={product._id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </Content>
    </Layout>
  );
};

