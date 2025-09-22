import React, { useState, useEffect } from 'react';
import { Card, Input, Button, message, Space, Typography } from 'antd';
import { EditOutlined, MessageOutlined } from '@ant-design/icons';
import { InteractiveRating } from './Rating';
import { useAuthContext } from '../context/auth.context';
import { 
  createCommentApi, 
  updateCommentApi,
  getUserCommentForProductApi 
} from '../../util/api';
import type { Comment } from '../../types/product.types';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface CommentFormProps {
  productId: string;
  onCommentSubmitted?: (comment: Comment) => void;
  onCommentUpdated?: (comment: Comment) => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  productId,
  onCommentSubmitted,
  onCommentUpdated
}) => {
  const [content, setContent] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [existingComment, setExistingComment] = useState<Comment | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { auth } = useAuthContext();

  // Check if user already has a comment for this product
  useEffect(() => {
    const checkExistingComment = async () => {
      if (!auth.isAuthenticated || !productId) return;

      try {
        const response = await getUserCommentForProductApi(productId);
        if (response.success && response.data) {
          setExistingComment(response.data);
          setContent(response.data.content);
          setRating(response.data.rating);
        }
      } catch (error) {
        console.error('Error checking existing comment:', error);
      }
    };

    checkExistingComment();
  }, [auth.isAuthenticated, productId]);

  const handleSubmit = async () => {
    if (!auth.isAuthenticated) {
      message.warning('Vui lòng đăng nhập để bình luận');
      return;
    }

    if (!content.trim()) {
      message.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    if (content.trim().length < 10) {
      message.error('Nội dung bình luận phải có ít nhất 10 ký tự');
      return;
    }

    if (rating === 0) {
      message.error('Vui lòng chọn đánh giá sao');
      return;
    }

    setLoading(true);

    try {
      if (existingComment && !isEditing) {
        // If user already has comment and not editing, show edit mode
        setIsEditing(true);
        setLoading(false);
        return;
      }

      if (existingComment && isEditing) {
        // Update existing comment
        const response = await updateCommentApi(existingComment._id, {
          content: content.trim(),
          rating
        });

        if (response.success) {
          message.success('Cập nhật bình luận thành công!');
          setExistingComment(response.data);
          setIsEditing(false);
          
          if (onCommentUpdated) {
            onCommentUpdated(response.data);
          }
        } else {
          message.error(response.message || 'Có lỗi xảy ra khi cập nhật bình luận');
        }
      } else {
        // Create new comment
        const response = await createCommentApi({
          productId,
          content: content.trim(),
          rating
        });

        if (response.success) {
          message.success('Thêm bình luận thành công!');
          setExistingComment(response.data);
          
          if (onCommentSubmitted) {
            onCommentSubmitted(response.data);
          }
        } else {
          message.error(response.message || 'Có lỗi xảy ra khi thêm bình luận');
        }
      }
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      message.error('Có lỗi xảy ra khi gửi bình luận');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (existingComment) {
      // Reset to existing values
      setContent(existingComment.content);
      setRating(existingComment.rating);
      setIsEditing(false);
    } else {
      // Clear form
      setContent('');
      setRating(0);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  if (!auth.isAuthenticated) {
    return (
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <MessageOutlined style={{ fontSize: '32px', color: '#d9d9d9', marginBottom: '12px' }} />
          <div style={{ color: '#666' }}>
            Vui lòng đăng nhập để bình luận và đánh giá sản phẩm
          </div>
        </div>
      </Card>
    );
  }

  const getTitle = () => {
    if (existingComment && !isEditing) {
      return 'Bình luận của bạn';
    }
    if (existingComment && isEditing) {
      return 'Chỉnh sửa bình luận';
    }
    return 'Viết bình luận';
  };

  const getButtonText = () => {
    if (existingComment && !isEditing) {
      return 'Chỉnh sửa';
    }
    if (existingComment && isEditing) {
      return 'Cập nhật bình luận';
    }
    return 'Gửi bình luận';
  };

  return (
    <Card 
      title={
        <Space>
          <MessageOutlined />
          {getTitle()}
        </Space>
      }
      style={{ marginBottom: '16px' }}
    >
      {/* Display existing comment in read-only mode */}
      {existingComment && !isEditing && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <InteractiveRating 
              value={existingComment.rating} 
              onChange={() => {}} // Read-only
              size="small"
            />
          </div>
          <Text style={{ whiteSpace: 'pre-wrap' }}>{existingComment.content}</Text>
          <div style={{ marginTop: '12px' }}>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={handleStartEdit}
              size="small"
            >
              Chỉnh sửa bình luận
            </Button>
          </div>
        </div>
      )}

      {/* Comment form (for new comments or editing) */}
      {(!existingComment || isEditing) && (
        <div>
          {/* Rating */}
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Đánh giá của bạn:
            </Text>
            <InteractiveRating 
              value={rating} 
              onChange={setRating}
              required={true}
            />
          </div>

          {/* Comment content */}
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Nội dung bình luận:
            </Text>
            <TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={4}
              maxLength={1000}
              showCount
              disabled={loading}
            />
          </div>

          {/* Action buttons */}
          <Space>
            <Button
              type="primary"
              loading={loading}
              onClick={handleSubmit}
              disabled={!content.trim() || rating === 0}
            >
              {getButtonText()}
            </Button>
            
            {(existingComment && isEditing) && (
              <Button onClick={handleCancel}>
                Hủy
              </Button>
            )}
          </Space>
        </div>
      )}
    </Card>
  );
};

