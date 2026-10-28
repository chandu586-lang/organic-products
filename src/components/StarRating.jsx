import React from 'react';
import { Star } from 'lucide-react';

/**
 * Reusable StarRating Component
 */
function StarRating({ rating = 0, count }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', color: '#f59e0b', gap: '2px' }}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < fullStars || (i === fullStars && hasHalfStar) ? '#f59e0b' : 'none'}
            stroke="#f59e0b"
          />
        ))}
      </div>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginLeft: '4px' }}>
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>({count})</span>
      )}
    </div>
  );
}

export default StarRating;
