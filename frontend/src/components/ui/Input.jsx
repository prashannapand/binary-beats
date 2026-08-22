import { forwardRef, useId } from 'react';

export const Input = forwardRef(function Input({
  label,
  error,
  hint,
  required = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  className = '',
  id: providedId,
  type = 'text',
  ...props
}, ref) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-staff-700 mb-1.5">
          {label}
          {required && <span className="text-error-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-staff-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={`
            w-full rounded-lg border bg-white text-staff-900 placeholder:text-staff-400
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            py-2.5
            ${error
              ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
              : 'border-staff-300 focus:ring-brand-500 focus:border-brand-500'}
            disabled:bg-staff-50 disabled:cursor-not-allowed
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          aria-required={required}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-staff-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-error-600 flex items-center gap-1" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-staff-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(function Textarea({
  label,
  error,
  hint,
  required = false,
  fullWidth = true,
  rows = 3,
  className = '',
  id: providedId,
  ...props
}, ref) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-staff-700 mb-1.5">
          {label}
          {required && <span className="text-error-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={`
          w-full rounded-lg border bg-white text-staff-900 placeholder:text-staff-400
          transition-all duration-150 resize-y min-h-[80px]
          focus:outline-none focus:ring-2 focus:ring-offset-0
          px-4 py-2.5
          ${error
            ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
            : 'border-staff-300 focus:ring-brand-500 focus:border-brand-500'}
          disabled:bg-staff-50 disabled:cursor-not-allowed
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        aria-required={required}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-error-600 flex items-center gap-1" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-staff-500">{hint}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export const Select = forwardRef(function Select({
  label,
  error,
  hint,
  required = false,
  fullWidth = true,
  options = [],
  placeholder,
  className = '',
  id: providedId,
  ...props
}, ref) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-staff-700 mb-1.5">
          {label}
          {required && <span className="text-error-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`
          w-full rounded-lg border bg-white text-staff-900
          transition-all duration-150 appearance-none
          focus:outline-none focus:ring-2 focus:ring-offset-0
          px-4 py-2.5 pr-10
          ${error
            ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
            : 'border-staff-300 focus:ring-brand-500 focus:border-brand-500'}
          disabled:bg-staff-50 disabled:cursor-not-allowed
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        aria-required={required}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-error-600 flex items-center gap-1" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-staff-500">{hint}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';