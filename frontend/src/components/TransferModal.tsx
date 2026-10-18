import React, { useState } from 'react';
import { X, ArrowRightLeft, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Address } from 'viem';
import { isAddress } from 'viem';
import type { MobileRecord } from '../types';
import { transferOwnershipTx } from '../utils/web3';

interface TransferModalProps {
  device: MobileRecord;
  contractAddress: Address;
  account: Address;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  device,
  contractAddress,
  account,
  onClose,
  onSuccess,
}) => {
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRecipient = recipient.trim();

    if (!isAddress(cleanRecipient)) {
      setError('Please enter a valid 42-character Ethereum address (0x...)');
      return;
    }

    if (cleanRecipient.toLowerCase() === account.toLowerCase()) {
      setError('You cannot transfer ownership to your own address.');
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const hash = await transferOwnershipTx(
        contractAddress,
        account,
        device.imei.toString(),
        cleanRecipient as Address
      );
      setTxHash(hash);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setError(err?.shortMessage || err?.message || 'Transfer failed or rejected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 text-indigo-400 mb-2">
          <ArrowRightLeft className="w-5 h-5" />
          <h3 className="text-lg font-bold text-white">Transfer Ownership</h3>
        </div>
        <p className="text-xs text-slate-400">
          Transfer on-chain custody of{' '}
          <strong className="text-white">
            {device.specs.brand} {device.specs.model}
          </strong>{' '}
          (IMEI: <span className="font-mono text-indigo-300">{device.imei.toString()}</span>).
        </p>

        {/* Warning Banner */}
        <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex gap-2.5 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            This action is irreversible. The recipient address will become the legal on-chain owner and only they will have the right to transfer it next.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleTransfer} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Recipient Ethereum Address (0x...) *
            </label>
            <input
              type="text"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {txHash && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-200">Ownership transferred successfully!</p>
                <p className="font-mono mt-0.5 text-[10px] break-all text-emerald-400/80">Tx: {txHash}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !recipient}
              className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-medium rounded-xl transition shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm Transfer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
