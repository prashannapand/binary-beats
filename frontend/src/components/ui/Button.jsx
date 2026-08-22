import { forwardRef } from 'react';

export const Button = forwardRef(function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  'aria-label': ariaLabel,
  type = 'button',
  ...props
}, ref) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold transition-all duration-150 ease-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    select-none
  `;

  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus-visible:ring-brand-500 shadow-cust-sm',
    secondary: 'bg-staff-100 text-staff-700 hover:bg-staff-200 active:bg-staff-300 focus-visible:ring-staff-500',
    ghost: 'text-staff-600 hover:bg-staff-100 active:bg-staff-200 focus-visible:ring-staff-500',
    danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 focus-visible:ring-error-500',
    success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500',
    outline: 'border-2 border-staff-300 text-staff-700 hover:bg-staff-50 active:bg-staff-100 focus-visible:ring-staff-500',
    custPrimary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus-visible:ring-brand-500 shadow-cust-sm',
    custSecondary: 'bg-brand-100 text-brand-700 hover:bg-brand-200 active:bg-brand-300 focus-visible:ring-brand-500',
    custGhost: 'text-brand-700 hover:bg-brand-50 active:bg-brand-100 focus-visible:ring-brand-500',
    custOutline: 'border-2 border-brand-300 text-brand-700 hover:bg-brand-50 active:bg-brand-100 focus-visible:ring-brand-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-md',
    md: 'px-4 py-2 text-sm gap-2 rounded-lg',
    lg: 'px-6 py-3 text-base gap-2 rounded-xl',
    xl: 'px-8 py-4 text-lg gap-3 rounded-2xl',
    icon: 'p-2 rounded-lg',
    iconLg: 'p-3 rounded-xl',
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';

export const IconButton = forwardRef(function IconButton({
  variant = 'ghost',
  size = 'md',
  disabled = false,
  'aria-label': ariaLabel,
  children,
  className = '',
  ...props
}, ref) {
  if (!ariaLabel) {
    console.warn('IconButton requires an aria-label for accessibility');
  }
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`p-0 ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
});

IconButton.displayName = 'IconButton';