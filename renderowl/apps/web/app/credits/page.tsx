'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ArrowLeft, Check, Zap } from 'lucide-react';
import Link from 'next/link';

interface CreditPack {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
}

interface Transaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund';
  amount: number;
  description: string;
  createdAt: string;
}

const CREDIT_PACKS: CreditPack[] = [
  { id: 'starter', credits: 100, price: 9.99 },
  { id: 'pro', credits: 500, price: 39.99, popular: true },
  { id: 'studio', credits: 2000, price: 129.99 },
];

export default function CreditsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchCreditsData();
    }
  }, [userId]);

  const fetchCreditsData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        fetch('/api/credits'),
        fetch('/api/credits/transactions'),
      ]);

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData.balance);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPack) return;

    const pack = CREDIT_PACKS.find((p) => p.id === selectedPack);
    if (!pack) return;

    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: selectedPack }),
      });

      if (response.ok) {
        await fetchCreditsData();
        setShowCheckout(false);
        setSelectedPack(null);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Credits</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Balance */}
        <div data-testid="current-balance" className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-6 h-6" />
            <span className="text-blue-100">Available Credits</span>
          </div>
          <div className="text-5xl font-bold">{balance}</div>
          <p className="mt-2 text-blue-100">
            Use credits to render and export your videos
          </p>
        </div>

        {/* Purchase Options */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchase Credits</h2>
          <div data-testid="purchase-options" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.id}
                data-testid={`credit-pack-${pack.credits}`}
                onClick={() => setSelectedPack(pack.id)}
                className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all ${
                  selectedPack === pack.id
                    ? 'border-blue-600 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {pack.credits} Credits
                  </h3>
                  <p className="text-gray-500 mb-4">
                    ${(pack.price / pack.credits).toFixed(3)} per credit
                  </p>

                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    ${pack.price}
                  </div>

                  {selectedPack === pack.id && (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Selected</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedPack && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowCheckout(true)}
                data-testid="checkout-button"
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h2>
          <div data-testid="transaction-list" className="bg-white rounded-xl border overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No transactions yet
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      data-testid="transaction-item"
                      className="border-b last:border-b-0"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-medium text-right ${
                          transaction.type === 'purchase' || transaction.type === 'refund'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'purchase' || transaction.type === 'refund'
                          ? '+'
                          : '-'}
                        {transaction.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div data-testid="stripe-payment-form" className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Complete Purchase</h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Credits</span>
                <span className="font-medium">
                  {CREDIT_PACKS.find((p) => p.id === selectedPack)?.credits}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${CREDIT_PACKS.find((p) => p.id === selectedPack)?.price}</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  data-testid="card-number-input"
                  placeholder="4242 4242 4242 4242"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry
                  </label>
                  <input
                    type="text"
                    data-testid="card-expiry-input"
                    placeholder="MM/YY"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    data-testid="card-cvc-input"
                    placeholder="123"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                data-testid="pay-button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
