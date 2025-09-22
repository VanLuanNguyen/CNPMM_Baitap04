import React from 'react';
import { StarFilled, StarOutlined } from '@ant-design/icons';

interface RatingProps {
  value: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  precision?: number; // 0.5 for half stars, 1 for whole stars
}

export const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'medium',
  showText = false,
  precision = 1
}) => {
  const maxStars = 5;
  
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { fontSize: '14px' };
      case 'large':
        return { fontSize: '20px' };
      default:
        return { fontSize: '16px' };
    }
  };

  const handleStarClick = (starIndex: number) => {
    if (disabled || !onChange) return;
    
    const newRating = precision === 0.5 ? starIndex + 0.5 : starIndex + 1;
    onChange(Math.min(newRating, maxStars));
  };

  const handleStarHover = (starIndex: number, isHalf?: boolean) => {
    if (disabled || !onChange) return;
    // Could implement hover preview here
  };

  const renderStar = (starIndex: number) => {
    const starValue = starIndex + 1;
    const isFullStar = value >= starValue;
    const isHalfStar = precision === 0.5 && value >= starValue - 0.5 && value < starValue;
    
    const starStyle = {
      ...getSizeStyle(),
      color: isFullStar || isHalfStar ? '#faad14' : '#d9d9d9',
      cursor: disabled ? 'default' : 'pointer',
      marginRight: '2px',
      transition: 'color 0.2s'
    };

    const handleClick = () => handleStarClick(starIndex);
    
    if (isFullStar) {
      return (
        <StarFilled
          key={starIndex}
          style={starStyle}
          onClick={handleClick}
          onMouseEnter={() => handleStarHover(starIndex)}
        />
      );
    } else if (isHalfStar) {
      // For half stars, we'll use a combination of filled and outlined
      return (
        <span
          key={starIndex}
          style={{ position: 'relative', cursor: disabled ? 'default' : 'pointer' }}
          onClick={handleClick}
        >
          <StarOutlined style={{ ...starStyle, position: 'absolute' }} />
          <StarFilled 
            style={{ 
              ...starStyle, 
              clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
              position: 'relative'
            }} 
          />
        </span>
      );
    } else {
      return (
        <StarOutlined
          key={starIndex}
          style={starStyle}
          onClick={handleClick}
          onMouseEnter={() => handleStarHover(starIndex)}
        />
      );
    }
  };

  const getRatingText = (rating: number) => {
    if (rating === 0) return 'Chưa có đánh giá';
    if (rating <= 1) return 'Rất tệ';
    if (rating <= 2) return 'Tệ';
    if (rating <= 3) return 'Trung bình';
    if (rating <= 4) return 'Tốt';
    return 'Xuất sắc';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {Array.from({ length: maxStars }, (_, index) => renderStar(index))}
      </div>
      
      {showText && (
        <span style={{ 
          fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
          color: '#666',
          marginLeft: '4px'
        }}>
          {value > 0 ? `${value.toFixed(precision === 0.5 ? 1 : 0)} - ${getRatingText(value)}` : getRatingText(value)}
        </span>
      )}
    </div>
  );
};

// Interactive Rating component for forms
interface InteractiveRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  required?: boolean;
}

export const InteractiveRating: React.FC<InteractiveRatingProps> = ({
  value,
  onChange,
  size = 'medium',
  required = false
}) => {
  const [hoverValue, setHoverValue] = React.useState<number>(0);
  const maxStars = 5;

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { fontSize: '18px' };
      case 'large':
        return { fontSize: '28px' };
      default:
        return { fontSize: '24px' };
    }
  };

  const handleStarClick = (starIndex: number) => {
    const newRating = starIndex + 1;
    onChange(newRating);
  };

  const handleStarHover = (starIndex: number) => {
    setHoverValue(starIndex + 1);
  };

  const handleMouseLeave = () => {
    setHoverValue(0);
  };

  const renderStar = (starIndex: number) => {
    const starValue = starIndex + 1;
    const displayValue = hoverValue || value;
    const isActive = displayValue >= starValue;
    
    const starStyle = {
      ...getSizeStyle(),
      color: isActive ? '#faad14' : '#d9d9d9',
      cursor: 'pointer',
      marginRight: '4px',
      transition: 'color 0.2s, transform 0.1s',
      transform: hoverValue === starValue ? 'scale(1.1)' : 'scale(1)'
    };

    const StarComponent = isActive ? StarFilled : StarOutlined;

    return (
      <StarComponent
        key={starIndex}
        style={starStyle}
        onClick={() => handleStarClick(starIndex)}
        onMouseEnter={() => handleStarHover(starIndex)}
      />
    );
  };

  const getRatingText = (rating: number) => {
    if (rating === 0) return required ? 'Vui lòng chọn đánh giá' : 'Chọn đánh giá';
    if (rating <= 1) return 'Rất tệ';
    if (rating <= 2) return 'Tệ';
    if (rating <= 3) return 'Trung bình';
    if (rating <= 4) return 'Tốt';
    return 'Xuất sắc';
  };

  return (
    <div>
      <div 
        style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxStars }, (_, index) => renderStar(index))}
      </div>
      
      <div style={{ 
        fontSize: '14px',
        color: (hoverValue || value) === 0 && required ? '#ff4d4f' : '#666',
        minHeight: '20px'
      }}>
        {getRatingText(hoverValue || value)}
      </div>
    </div>
  );
};

