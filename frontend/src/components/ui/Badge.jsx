import { forwardRef } from 'react';

export const Badge = forwardRef(function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  children,
  ...props
}, ref) {
  const variants = {
    default: 'bg-staff-100 text-staff-700',
    primary: 'bg-brand-100 text-brand-700',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    error: 'bg-error-50 text-error-700',
    info: 'bg-info-50 text-info-700',
    pending: 'bg-warning-50 text-warning-700',
    confirmed: 'bg-info-50 text-info-700',
    preparing: 'bg-purple-50 text-purple-700',
    ready: 'bg-success-50 text-success-700',
    served: 'bg-success-50 text-success-700',
    rejected: 'bg-error-50 text-error-700',
    paid: 'bg-success-50 text-success-700',
    requested: 'bg-warning-50 text-warning-700',
    active: 'bg-success-50 text-success-700',
    available: 'bg-staff-100 text-staff-700',
    unavailable: 'bg-staff-100 text-staff-500',
    hidden: 'bg-staff-100 text-staff-400',
    special: 'bg-amber-50 text-amber-700',
    veg: 'bg-green-50 text-green-700',
    nonveg: 'bg-red-50 text-red-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const dotColors = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-info-500',
    pending: 'bg-warning-500',
    confirmed: 'bg-info-500',
    preparing: 'bg-purple-500',
    ready: 'bg-success-500',
    served: 'bg-success-500',
    rejected: 'bg-error-500',
    active: 'bg-success-500',
    default: 'bg-staff-400',
  };

  return (
    <span
      ref={ref}
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`} aria-hidden="true" />}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export const StatusBadge = ({ status, size = 'md', showDot = true }) => {
  const statusMap = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    SERVED: 'served',
    REJECTED: 'rejected',
    PAID: 'paid',
    REQUESTED: 'requested',
    ACTIVE: 'active',
    AVAILABLE: 'available',
    UNAVAILABLE: 'unavailable',
    HIDDEN: 'hidden',
    NOT_REQUESTED: 'default',
  };

  const labelMap = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PREPARING: 'Preparing',
    READY: 'Ready',
    SERVED: 'Served',
    REJECTED: 'Rejected',
    PAID: 'Paid',
    REQUESTED: 'Requested',
    ACTIVE: 'Active',
    AVAILABLE: 'Available',
    UNAVAILABLE: 'Unavailable',
    HIDDEN: 'Hidden',
    NOT_REQUESTED: 'Not Requested',
  };

  return (
    <Badge
      variant={statusMap[status] || 'default'}
      size={size}
      dot={showDot}
    >
      {labelMap[status] || status}
    </Badge>
  );
};