// src/app/pos/CompleteSaleModal.tsx

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface CompleteSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mpesaReference: string) => void;
  totalAmount: number;
  paymentMethod: string;
  isProcessing: boolean;
}

export const CompleteSaleModal = ({
  isOpen,
  onClose,
  onSubmit,
  totalAmount,
  paymentMethod,
  isProcessing
}: CompleteSaleModalProps) => {
  const [mpesaReference, setMpesaReference] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [useStkPush, setUseStkPush] = useState(true); // Set STK Push as default
  const [businessDetails, setBusinessDetails] = useState({
    mpesa_send: '',
    mpesa_paybill: '',
    mpesa_till: '',
    mpesa_pochi: '',
  });

  // Load business details from settings
  useEffect(() => {
    const loadBusinessDetails = async () => {
      try {
        const response = await fetch('/api/business-settings');
        if (response.ok) {
          const data = await response.json();
          setBusinessDetails({
            mpesa_send: data.mpesaSendNumber || '07XX XXX XXX',
            mpesa_paybill: data.mpesaPaybill || 'XXXXXX',
            mpesa_till: data.mpesaTill || 'XXXXXX',
            mpesa_pochi: data.mpesaPochiNumber || '07XX XXX XXX',
          });
        } else {
          // Fallback to default values if API call fails
          setBusinessDetails({
            mpesa_send: '07XX XXX XXX',
            mpesa_paybill: 'XXXXXX',
            mpesa_till: 'XXXXXX',
            mpesa_pochi: '07XX XXX XXX',
          });
        }
      } catch (error) {
        console.error('Error loading business details:', error);
        // Fallback to default values if there's an error
        setBusinessDetails({
          mpesa_send: '07XX XXX XXX',
          mpesa_paybill: 'XXXXXX',
          mpesa_till: 'XXXXXX',
          mpesa_pochi: '07XX XXX XXX',
        });
      }
    };

    if (isOpen) {
      loadBusinessDetails();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (useStkPush) {
      // If using STK Push, customer phone is required
      if (!customerPhone) {
        alert('Please enter customer phone number to send M-Pesa prompt');
        return;
      }
      // For STK Push, we don't need the reference code upfront since we'll get it from the API response
      onSubmit('', customerPhone); // Pass customer phone to initiate STK Push
    } else {
      // For manual entry, reference is required
      if (!mpesaReference) {
        alert('Please enter M-Pesa reference code');
        return;
      }
      onSubmit(mpesaReference);
    }
  };

  if (!isOpen) return null;

  const getBusinessNumber = () => {
    switch (paymentMethod) {
      case 'mpesa_send':
        return businessDetails.mpesa_send || '07XX XXX XXX';
      case 'mpesa_paybill':
        return businessDetails.mpesa_paybill || 'XXXXXX';
      case 'mpesa_till':
        return businessDetails.mpesa_till || 'XXXXXX';
      case 'mpesa_pochi':
        return businessDetails.mpesa_pochi || '07XX XXX XXX';
      default:
        return 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Complete Sale</h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Amount to pay</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(totalAmount / 100)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Payment Method</p>
              <p className="font-medium">
                {paymentMethod.replace('mpesa_', 'M-Pesa ').replace('_', ' ')}
              </p>
            </div>

            {/* Option to use STK Push */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useStkPush"
                checked={useStkPush}
                onChange={(e) => setUseStkPush(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="useStkPush" className="ml-2 text-sm text-gray-300">
                Send M-Pesa prompt to customer (STK Push)
              </label>
            </div>

            {useStkPush ? (
              // STK Push mode - collect customer phone
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Customer Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., 07XX XXX XXX"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter customer's phone number to send M-Pesa prompt
                  </p>
                </div>

                <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                  <p className="text-sm text-blue-300 mb-2">STK Push Details:</p>
                  <p className="text-sm">Customer will receive an M-Pesa prompt on their phone to enter their PIN for KSH {formatCurrency(totalAmount / 100)}</p>
                </div>
              </div>
            ) : (
              // Manual mode - business details and reference
              <div>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Send money to:</p>
                  <p className="font-bold text-lg text-blue-400">{getBusinessNumber()}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Ask customer to send KSH {formatCurrency(totalAmount / 100)} to the above number via {paymentMethod.replace('mpesa_', 'M-Pesa ').replace('_', ' ')}
                  </p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    M-Pesa Reference Code
                  </label>
                  <input
                    type="text"
                    value={mpesaReference}
                    onChange={(e) => setMpesaReference(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter M-Pesa reference code"
                    required={!useStkPush}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter the reference code received after customer completes payment
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors"
                  onClick={onClose}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-75"
                  disabled={isProcessing ||
                    (useStkPush && !customerPhone) ||
                    (!useStkPush && !mpesaReference)}
                >
                  {isProcessing ? 'Processing...' :
                   useStkPush ? 'Send Prompt' :
                   'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};