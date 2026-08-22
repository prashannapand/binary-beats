import { forwardRef } from 'react';

export const Avatar = forwardRef(function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  className = '',
  ...props
}, ref) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  };

  const shapes = {
    circle: 'rounded-full',
    square: 'rounded-xl',
    rounded: 'rounded-lg',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-staff-300',
    busy: 'bg-error-500',
    away: 'bg-warning-500',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = name ? getInitials(name) : '?';

  return (
    <div ref={ref} className={`relative inline-flex ${className}`} {...props}>
      <div
        className={`
          ${sizes[size]} ${shapes[shape]} overflow-hidden bg-staff-200
          flex items-center justify-center font-semibold text-staff-600
          select-none
        `}
        aria-label={name || alt}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 border-2 border-white
            ${statusSizes[size]} rounded-full ${statusColors[status] || statusColors.offline}
          `}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export const AvatarGroup = ({ avatars = [], max = 4, size = 'md', className = '' }) => {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`} aria-label={`${avatars.length} people`}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={avatar.id || index}
          {...avatar}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${{
              xs: 'w-6 h-6 text-xs',
              sm: 'w-8 h-8 text-sm',
              md: 'w-10 h-10 text-base',
              lg: 'w-12 h-12 text-lg',
              xl: 'w-16 h-16 text-xl',
              '2xl': 'w-24 h-24 text-2xl',
            }[size]}
            rounded-full bg-brand-100 text-brand-700
            flex items-center justify-center font-semibold
            ring-2 ring-white border border-brand-200
          `}
          aria-label={`${remaining} more`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};