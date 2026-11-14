import { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * Component StarRating: Hiển thị và chọn số sao tương tác (1-5★)
 */
export default function StarRating({
  rating = 5,
  onRatingChange,
  size = 20,
  readOnly = false,
  showLabel = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  const labels = {
    1: 'Rất tệ',
    2: 'Chưa tốt',
    3: 'Bình thường',
    4: 'Hài lòng',
    5: 'Tuyệt vời',
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
      }}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={`${rating} trên 5 sao`}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              role={readOnly ? undefined : 'radio'}
              aria-checked={!readOnly ? rating === star : undefined}
              aria-label={`${star} sao`}
              onClick={() => {
                if (!readOnly && onRatingChange) {
                  onRatingChange(star);
                }
              }}
              onMouseEnter={() => {
                if (!readOnly) setHoverRating(star);
              }}
              onMouseLeave={() => {
                if (!readOnly) setHoverRating(0);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '1px',
                cursor: readOnly ? 'default' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isFilled ? '#f59e0b' : '#cbd5e1',
                transition: 'transform 0.15s ease, color 0.15s ease',
                transform: !readOnly && hoverRating === star ? 'scale(1.2)' : 'none',
              }}
            >
              <Star
                size={size}
                fill={isFilled ? '#f59e0b' : 'none'}
                stroke={isFilled ? '#f59e0b' : '#94a3b8'}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>

      {showLabel && !readOnly && (
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#b45309',
            marginLeft: '0.25rem',
          }}
        >
          {labels[displayRating] || ''}
        </span>
      )}
    </div>
  );
}
