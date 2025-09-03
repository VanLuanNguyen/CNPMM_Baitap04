import { Card, Typography, Tag, Space } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import type { Product } from '../../types/product.types';

const { Text, Title } = Typography;
const { Meta } = Card;

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const actions = [
    <EyeOutlined key="view" />,
    <ShoppingCartOutlined key="cart" />,
  ];

  return (
    <Card
      hoverable
      style={{ width: 280, marginBottom: 16 }}
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
            <Text type="secondary" ellipsis={{ rows: 2 }}>
              {product.description}
            </Text>
            <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
              {formatPrice(product.price)}
            </Text>
            <Space wrap>
              <Tag color="blue">{product.category}</Tag>
              <Text type="secondary">Còn {product.stock} sản phẩm</Text>
            </Space>
            <Space wrap size="small">
              {product.tags.slice(0, 3).map(tag => (
                <Tag key={tag} size="small">{tag}</Tag>
              ))}
            </Space>
          </Space>
        }
      />
    </Card>
  );
};
