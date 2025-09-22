import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Avatar, 
  Button, 
  Space, 
  Select, 
  Spin, 
  Alert, 
  Empty, 
  Typography,
  Dropdown,
  Modal,
  message
} from 'antd';
import { 
  MessageOutlined, 
  UserOutlined, 
  MoreOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Rating } from './Rating';
import { useAuthContext } from '../context/auth.context';
import { getProductCommentsApi, deleteCommentApi } from '../../util/api';
import type { Comment, PaginationInfo } from '../../types/product.types';

const { Text } = Typography;
const { Option } = Select;

interface CommentListProps {
  productId: string;
  refreshTrigger?: number; // Use this to trigger refresh from parent
  onCommentDeleted?: () => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  productId,
  refreshTrigger,
  onCommentDeleted
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const { auth } = useAuthContext();

  const fetchComments = async (page: number = 1, reset: boolean = false) => {
    const loadingState = page === 1 ? setLoading : setLoadingMore;
    loadingState(true);
    setError(null);

    try {
      const response = await getProductCommentsApi(productId, page, 10, sortBy);
      
      if (response.success) {
        if (reset) {
          setComments(response.comments);
        } else {
          setComments(prev => [...prev, ...response.comments]);
        }
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Có lỗi khi tải bình luận');
      }
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError('Có lỗi xảy ra khi tải bình luận');
    } finally {
      loadingState(false);
    }
  };

  // Load comments when component mounts or dependencies change
  useEffect(() => {
    if (productId) {
      fetchComments(1, true);
    }
  }, [productId, sortBy, refreshTrigger]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const handleLoadMore = () => {
    if (pagination && pagination.hasNext) {
      fetchComments(pagination.currentPage + 1, false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa bình luận',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setDeletingCommentId(commentId);
          const response = await deleteCommentApi(commentId);
          
          if (response.success) {
            message.success('Xóa bình luận thành công');
            
            // Remove comment from local state
            setComments(prev => prev.filter(comment => comment._id !== commentId));
            
            // Update pagination count
            if (pagination) {
              setPagination(prev => prev ? {
                ...prev,
                totalItems: prev.totalItems - 1
              } : null);
            }
            
            if (onCommentDeleted) {
              onCommentDeleted();
            }
          } else {
            message.error(response.message || 'Có lỗi khi xóa bình luận');
          }
        } catch (error: any) {
          console.error('Error deleting comment:', error);
          message.error('Có lỗi xảy ra khi xóa bình luận');
        } finally {
          setDeletingCommentId(null);
        }
      }
    });
  };

  const getCommentActions = (comment: Comment) => {
    const actions = [];
    
    // Only comment owner or admin can delete
    if (auth.isAuthenticated && 
        (comment.user._id === auth.user?.id || auth.user?.role === 'Admin')) {
      actions.push({
        key: 'delete',
        label: (
          <span style={{ color: '#ff4d4f' }}>
            <DeleteOutlined /> Xóa bình luận
          </span>
        ),
        onClick: () => handleDeleteComment(comment._id)
      });
    }

    return actions;
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  if (loading && comments.length === 0) {
    return (
      <Card 
        title={
          <Space>
            <MessageOutlined />
            Bình luận khách hàng
          </Space>
        }
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#666' }}>
            Đang tải bình luận...
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card 
        title={
          <Space>
            <MessageOutlined />
            Bình luận khách hàng
          </Space>
        }
      >
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => fetchComments(1, true)}>
              Thử lại
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card 
      title={
        <Space>
          <MessageOutlined />
          Bình luận khách hàng
          {pagination && (
            <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>
              ({pagination.totalItems} bình luận)
            </span>
          )}
        </Space>
      }
      extra={
        comments.length > 0 && (
          <Select
            value={sortBy}
            onChange={handleSortChange}
            style={{ width: 140 }}
            size="small"
          >
            <Option value="newest">Mới nhất</Option>
            <Option value="oldest">Cũ nhất</Option>
            <Option value="highest_rating">Đánh giá cao</Option>
            <Option value="lowest_rating">Đánh giá thấp</Option>
          </Select>
        )
      }
    >
      {comments.length === 0 ? (
        <Empty
          image={<MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
          description="Chưa có bình luận nào"
          style={{ padding: '40px 0' }}
        />
      ) : (
        <>
          <List
            itemLayout="vertical"
            dataSource={comments}
            renderItem={(comment) => {
              const actions = getCommentActions(comment);
              
              return (
                <List.Item
                  key={comment._id}
                  actions={[
                    <Text type="secondary" key="time">
                      {formatRelativeTime(comment.createdAt)}
                    </Text>,
                    ...(actions.length > 0 ? [
                      <Dropdown
                        key="actions"
                        menu={{
                          items: actions,
                          onClick: ({ key }) => {
                            const action = actions.find(a => a.key === key);
                            if (action && action.onClick) {
                              action.onClick();
                            }
                          }
                        }}
                        trigger={['click']}
                      >
                        <Button 
                          type="text" 
                          icon={<MoreOutlined />} 
                          size="small"
                          loading={deletingCommentId === comment._id}
                        />
                      </Dropdown>
                    ] : [])
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<UserOutlined />} />
                    }
                    title={
                      <Space>
                        <span>{comment.user.name}</span>
                        <Rating value={comment.rating} size="small" />
                      </Space>
                    }
                    description={
                      <Text style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {comment.content}
                      </Text>
                    }
                  />
                </List.Item>
              );
            }}
          />

          {/* Load More Button */}
          {pagination && pagination.hasNext && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Button 
                onClick={handleLoadMore}
                loading={loadingMore}
              >
                Xem thêm bình luận
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

