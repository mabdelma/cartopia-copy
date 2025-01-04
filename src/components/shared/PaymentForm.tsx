import React, { useState } from 'react';
import type { Order, Payment } from '../../lib/db/schema';
import { Dialog } from '@radix-ui/react-dialog';
import { CreditCard, DollarSign, Wallet } from 'lucide-react';

interface PaymentFormProps {
  order: Order;
  onSubmit: (order: Order, payment: Payment) => void;
  onCancel: () => void;
}

export function PaymentForm({ order, onSubmit, onCancel }: PaymentFormProps) {
  const [amount, setAmount] = useState(order.total);
  const [method, setMethod] = useState<'cash' | 'card' | 'wallet'>('cash');
  const [tip, setTip] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payment: Payment = {
      id: crypto.randomUUID(),
      orderId: order.id,
      amount,
      method,
      status: amount >= order.total ? 'paid' : 'partially',
      tip,
      createdAt: new Date().toISOString()
    };

    onSubmit(order, payment);
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Process Payment</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setMethod('cash')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                    method === 'cash' ? 'border-primary bg-primary/10' : 'border-gray-200'
                  }`}
                >
                  <DollarSign className="w-6 h-6 mb-2" />
                  <span>Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                    method === 'card' ? 'border-primary bg-primary/10' : 'border-gray-200'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mb-2" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('wallet')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                    method === 'wallet' ? 'border-primary bg-primary/10' : 'border-gray-200'
                  }`}
                >
                  <Wallet className="w-6 h-6 mb-2" />
                  <span>Wallet</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={0}
                step={0.01}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tip
              </label>
              <input
                type="number"
                value={tip}
                onChange={(e) => setTip(Number(e.target.value))}
                min={0}
                step={0.01}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tip</span>
                <span>${tip.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${(order.total + tip).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Complete Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}