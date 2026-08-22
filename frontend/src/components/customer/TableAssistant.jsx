import { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

const ASSISTANT_OPTIONS = [
  { id: 'water', icon: '💧', label: 'Request water', emoji: '💧' },
  { id: 'plate', icon: '🍽', label: 'Extra plate', emoji: '🍽' },
  { id: 'cutlery', icon: '🥄', label: 'Cutlery', emoji: '🥄' },
  { id: 'napkins', icon: '🧻', label: 'Napkins', emoji: '🧻' },
  { id: 'chair', icon: '🪑', label: 'Extra chair', emoji: '🪑' },
  { id: 'staff', icon: '🙋', label: 'Request staff', emoji: '🙋' },
  { id: 'bill', icon: '🧾', label: 'Request bill', emoji: '🧾' },
  { id: 'custom', icon: '✏️', label: 'Custom request', emoji: '✏️' },
];

export function TableAssistant() {
  const { token, table } = useCustomer();
  const { success, error } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [customRequest, setCustomRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!table || !token) return null;

  const handleRequest = async (type) => {
    if (type === 'custom' && !customRequest.trim()) return;

    setSubmitting(true);
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate the request
      await new Promise(resolve => setTimeout(resolve, 500));

      success(`✓ ${type === 'custom' ? 'Custom request' : ASSISTANT_OPTIONS.find(o => o.id === type)?.label} sent`);
      setIsOpen(false);
      setCustomRequest('');
    } catch (e) {
      error('Failed to send request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="no-print fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-brand-600 text-white shadow-cust-lg flex items-center justify-center
          hover:bg-brand-700 active:scale-95 transition-all duration-150 animate-bounce-subtle"
        aria-label="Table Assistant"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m5.656 0l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Table Assistant"
        description="How can we help you?"
        size="sm"
      >
        <div className="space-y-2">
          {ASSISTANT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleRequest(option.id)}
              disabled={submitting}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-staff-50 transition-colors"
            >
              <span className="text-2xl" aria-hidden="true">{option.emoji}</span>
              <span className="font-medium text-cust-text-primary">{option.label}</span>
            </button>
          ))}

          <div className="pt-2 border-t border-cust-border">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-cust-text-secondary">Custom request</span>
              <textarea
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
                placeholder="Type your request here..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-cust-border bg-white text-cust-text-primary placeholder:text-cust-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none"
              />
            </label>
            <Button
              variant="custPrimary"
              fullWidth
              onClick={() => handleRequest('custom')}
              disabled={submitting || !customRequest.trim()}
              loading={submitting}
            >
              Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}