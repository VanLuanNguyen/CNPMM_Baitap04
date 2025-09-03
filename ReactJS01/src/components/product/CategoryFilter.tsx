import { Radio, Space, Spin, Alert } from 'antd';
import { useEffect, useState } from 'react';
import { getCategoriesApi } from '../../util/api';
import type { RadioChangeEvent } from 'antd';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getCategoriesApi();
        if (response.success) {
          setCategories(response.data);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải danh mục');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: RadioChangeEvent) => {
    onCategoryChange(e.target.value);
  };

  if (loading) {
    return <Spin size="small" />;
  }

  if (error) {
    return <Alert message={error} type="error" showIcon size="small" />;
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <Radio.Group
        value={selectedCategory}
        onChange={handleChange}
        style={{ width: '100%' }}
      >
        <Space wrap>
          <Radio.Button value="all">Tất cả</Radio.Button>
          {categories.map(category => (
            <Radio.Button key={category} value={category}>
              {category}
            </Radio.Button>
          ))}
        </Space>
      </Radio.Group>
    </div>
  );
};
