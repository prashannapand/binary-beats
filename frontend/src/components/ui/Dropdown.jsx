import { useState, useRef, useEffect } from 'react';

export function Dropdown({ trigger, items, align = 'right', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setIsOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <div
        onClick={() => setIsOpen((v) => !v)}
        role="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen((v) => !v); } }}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={`absolute z-[200] mt-2 min-w-[180px] bg-staff-900 rounded-xl shadow-cust-lg animate-scale-in overflow-hidden ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          <div className="py-1.5">
            {items.map((item, index) => (
              <button
                key={item.label || index}
                onClick={() => { item.onClick?.(); setIsOpen(false); }}
                role="menuitem"
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 transition-colors ${
                  item.danger ? 'text-error-300 hover:bg-error-500/10' : 'text-staff-100 hover:bg-white/10'
                }`}
              >
                {item.icon && <span aria-hidden="true">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Popover({ trigger, children, align = 'right', width = 'min-w-[240px]' }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <div onClick={() => setIsOpen((v) => !v)} role="button" aria-expanded={isOpen} tabIndex={0}>
        {trigger}
      </div>
      {isOpen && (
        <div className={`absolute z-[200] mt-2 ${width} bg-white rounded-xl border border-staff-200 shadow-cust-lg p-3 animate-scale-in ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export function Tooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-[600] px-2 py-1 text-xs font-medium text-white bg-staff-900 rounded-md shadow-cust-md whitespace-nowrap animate-fade-in ${positions[position]}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}