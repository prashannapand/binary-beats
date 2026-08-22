import { forwardRef } from 'react';

export const Card = forwardRef(function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  children,
  ...props
}, ref) {
  const variants = {
    default: 'bg-white border border-staff-200 shadow-staff-sm',
    elevated: 'bg-white border border-staff-200 shadow-staff-md',
    cust: 'bg-cust-surface border border-cust-border shadow-cust-md',
    custElevated: 'bg-white border border-cust-border shadow-cust-lg',
    dark: 'bg-staff-900 border border-staff-800',
    transparent: 'bg-transparent border-none shadow-none',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
    xl: 'p-6 sm:p-8',
  };

  const hoverStyles = hover
    ? 'transition-all duration-200 hover:shadow-staff-lg hover:-translate-y-0.5 cursor-pointer'
    : '';

  return (
    <div
      ref={ref}
      className={`${variants[variant]} ${paddings[padding]} rounded-xl ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = forwardRef(function CardHeader({
  className = '',
  children,
  ...props
}, ref) {
  return (
    <div ref={ref} className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef(function CardTitle({
  as: Component = 'h3',
  className = '',
  children,
  ...props
}, ref) {
  return (
    <Component
      ref={ref}
      className={`text-lg font-semibold text-staff-900 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
});

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef(function CardDescription({
  as: Component = 'p',
  className = '',
  children,
  ...props
}, ref) {
  return (
    <Component
      ref={ref}
      className={`mt-1 text-sm text-staff-500 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
});

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef(function CardContent({
  className = '',
  children,
  ...props
}, ref) {
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef(function CardFooter({
  className = '',
  children,
  ...props
}, ref) {
  return (
    <div
      ref={ref}
      className={`mt-4 pt-4 border-t border-staff-200 flex items-center gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';