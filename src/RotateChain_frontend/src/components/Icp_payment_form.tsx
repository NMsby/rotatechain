import React, { useState } from 'react';
import { sendICP, getICPBalance } from './../services/icp_canister';
import { getPaymentCanister } from './../services/icp_canister';

interface PaymentFormProps {
  principal: string;
  accountId: string;
  balance: number;
  network: 'mainnet' | 'testnet';
  onPaymentSent: (txId: bigint) => void;
  onBalanceUpdate: (newBalance: number) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  principal,
  accountId,
  balance,
  network,
  onPaymentSent,
  onBalanceUpdate
}) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
      throw new Error('Invalid amount');
    }


    // Record payment in backend
    const paymentCanister = await getPaymentCanister();
    const paymentId = await paymentCanister.recordPayment(
      recipient,
      BigInt(amountNum * 100000000),
      network === 'testnet' ? { testnet: null } : { mainnet: null }
    );

    
    try {
      if (!recipient.trim()) {
        throw new Error('Recipient address is required');
      }
      
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum)) {
        throw new Error('Invalid amount');
      }
      
      if (amountNum <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      
      if (amountNum > balance) {
        throw new Error('Insufficient balance');
      }
      
      
      // Send transaction
      const txId = await sendICP(recipient, amountNum, network);
      
      // Update payment status
      await paymentCanister.updatePaymentStatus(paymentId, { completed: null });
      
      // Update balance
      const newBalance = await getICPBalance(network);
      onBalanceUpdate(newBalance);
      
      // Store last balance
      await paymentCanister.storeBalance(BigInt(newBalance * 100000000));
      
      setSuccess(`Successfully sent ${amountNum} ICP! Transaction ID: ${txId.toString()}`);
      onPaymentSent(txId);
    } catch (err) {
      console.error("Payment failed:", err);
      setError((err as Error).message || 'Payment failed');
      
      // Update payment status to failed
      try {
        const paymentCanister = await getPaymentCanister();
        await paymentCanister.updatePaymentStatus(paymentId, { failed: null });
      } catch (updateErr) {
        console.error("Failed to update payment status:", updateErr);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Send ICP Payment</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter account ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (ICP)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.00000001"
            min="0.00000001"
            max={balance}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={loading}
          />
          <div className="text-xs text-gray-500 mt-1">
            Available: {balance.toFixed(8)} ICP
          </div>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-medium text-white ${
              loading 
                ? 'bg-gray-500' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            } transition-all duration-200 shadow-lg`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Send Payment'
            )}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>{error}</div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-100">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>{success}</div>
          </div>
        </div>
      )}
      
      <div className="pt-4 border-t border-gray-200 mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Your Account Info</h3>
        <div className="text-xs bg-gray-50 p-3 rounded-lg font-mono break-all">
          <div className="mb-1">
            <span className="text-gray-500">Principal:</span> {principal}
          </div>
          <div>
            <span className="text-gray-500">Account ID:</span> {accountId}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;