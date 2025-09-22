import React from 'react';
import { Layout, Typography, Button, Space } from 'antd';
import { ArrowLeftOutlined, HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ViewedProducts } from '../components/product/ViewedProducts';
import { useAuthContext } from '../components/context/auth.context';

const { Content } = Layout;
const { Title } = Typography;

export const ViewedProductsPage: React.FC = () => {
  const { auth } = useAuthContext();
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!auth.isAuthenticated) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Content style={{ padding: '50px' }}>
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <HistoryOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={3} style={{ color: '#666' }}>
              Vui lòng đăng nhập để xem lịch sử sản phẩm
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
        </div>

        <ViewedProducts 
          limit={50}
          showClearButton={true}
          showRemoveButtons={true}
          style={{ 
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </Content>
    </Layout>
  );
};

