import { useEffect, useRef, Fragment } from 'react';
import { createPortal } from 'react-dom';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      contentRef.current?.focus();

      const handleKeyDown = (e) => {
        if (!closeOnEscape || e.key !== 'Escape') return;
        onClose();
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose, closeOnEscape]);

  useEffect(() => {
    const handleOverlayClick = (e) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    };

    if (isOpen && closeOnOverlayClick) {
      overlayRef.current.addEventListener('click', handleOverlayClick);
    }
    return () => {
      overlayRef.current?.removeEventListener('click', handleOverlayClick);
    };
  }, [isOpen, onClose, closeOnOverlayClick]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={`${sizes[size]} w-full bg-white rounded-2xl shadow-xl animate-scale-in overflow-hidden`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-staff-200">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-staff-900">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-staff-500">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-lg text-staff-400 hover:text-staff-600 hover:bg-staff-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(modalContent, document.body);
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-staff-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-staff-700 bg-staff-100 rounded-lg hover:bg-staff-200 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
            variant === 'danger'
              ? 'bg-error-500 hover:bg-error-600'
              : variant === 'success'
              ? 'bg-success-500 hover:bg-success-600'
              : 'bg-brand-500 hover:bg-brand-600'
          }`}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}