import { useState, useRef, useEffect } from 'react';
import { forwardRef } from 'react';

export function Tabs({ defaultValue, onChange, children, className = '', variant = 'default' }) {
  const [activeValue, setActiveValue] = useState(defaultValue);

  const handleChange = (value) => {
    setActiveValue(value);
    onChange?.(value);
  };

  const variantStyles = {
    default: 'border-b border-staff-200',
    cust: 'border-b border-cust-border',
    pills: '',
    underline: 'border-b border-staff-200',
  };

  return (
    <div className={className} role="tablist">
      <div className={`${variantStyles[variant]} flex gap-1 overflow-x-auto pb-px`}>
        {children.map((child, index) =>
          isTabChild(child) ? (
            <TabTrigger
              key={child.props.value || index}
              value={child.props.value}
              isActive={activeValue === child.props.value}
              onClick={handleChange}
              disabled={child.props.disabled}
              variant={variant}
            >
              {child.props.children}
            </TabTrigger>
          ) : null
        )}
      </div>
      <div role="tabpanel">
        {children.map((child, index) =>
          isTabPanelChild(child) && activeValue === child.props.value ? (
            <div key={child.props.value || index} className="animate-fade-in">
              {child.props.children}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

function isTabChild(child) {
  return child?.type === TabTrigger;
}

function isTabPanelChild(child) {
  return child?.type === TabPanel;
}

const TabTrigger = forwardRef(function TabTrigger({
  value,
  isActive,
  onClick,
  disabled = false,
  variant = 'default',
  children,
  className = '',
}, ref) {
  const variants = {
    default: isActive
      ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50'
      : 'text-staff-500 hover:text-staff-700 hover:bg-staff-50',
    cust: isActive
      ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50'
      : 'text-cust-text-muted hover:text-cust-text-primary hover:bg-brand-50',
    pills: isActive
      ? 'bg-brand-600 text-white shadow-cust-sm'
      : 'text-staff-600 hover:bg-staff-100',
    underline: isActive
      ? 'text-brand-600 border-b-2 border-brand-600'
      : 'text-staff-500 hover:text-staff-700',
  };

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      onClick={() => !disabled && onClick(value)}
      disabled={disabled}
      className={`
        px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap
        transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </button>
  );
});

TabTrigger.displayName = 'TabTrigger';

const TabPanel = forwardRef(function TabPanel({ value, children, className = '' }, ref) {
  return (
    <div ref={ref} role="tabpanel" className={className}>
      {children}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';

Tabs.Trigger = TabTrigger;
Tabs.Panel = TabPanel;

export function SegmentedControl({ value, onChange, options, className = '', fullWidth = false }) {
  return (
    <div
      role="radiogroup"
      className={`inline-flex items-center p-1 bg-staff-100 rounded-xl gap-1 ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          disabled={option.disabled}
          className={`
            flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg
            transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${value === option.value
              ? 'bg-white text-brand-600 shadow-staff-sm'
              : 'text-staff-600 hover:text-staff-900'}
          `}
        >
          {option.icon && <span aria-hidden="true">{option.icon}</span>}
          {option.label}
          {option.badge && <Badge variant="default" size="sm">{option.badge}</Badge>}
        </button>
      ))}
    </div>
  );
}