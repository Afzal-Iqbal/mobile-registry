import React, { useState } from 'react';
import { PlusCircle, Smartphone, CheckCircle2, AlertCircle, Sparkles, Box, Zap } from 'lucide-react';
import type { Address } from 'viem';
import { registerMobileTx } from '../utils/web3';

interface RegisterTabProps {
  contractAddress: Address;
  account: Address | null;
  onSuccess: () => void;
}

const PRESETS = [
  {
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    chipset: 'A17 Pro',
    ramSizeGB: 8,
    storageGB: 256,
    manufacturingYear: 2024,
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    chipset: 'Snapdragon 8 Gen 3',
    ramSizeGB: 12,
    storageGB: 512,
    manufacturingYear: 2024,
  },
  {
    brand: 'Google',
    model: 'Pixel 9 Pro',
    chipset: 'Google Tensor G4',
    ramSizeGB: 16,
    storageGB: 256,
    manufacturingYear: 2024,
  },
];

export const RegisterTab: React.FC<RegisterTabProps> = ({ contractAddress, account, onSuccess }) => {
  const [imei, setImei] = useState('');
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('iPhone 15 Pro');
  const [chipset, setChipset] = useState('Apple A17 Pro');
  const [ramSizeGB, setRamSizeGB] = useState(8);
  const [storageGB, setStorageGB] = useState(256);
  const [manufacturingYear, setManufacturingYear] = useState(2024);
  const [activateNow, setActivateNow] = useState(true);

  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setBrand(preset.brand);
    setModel(preset.model);
    setChipset(preset.chipset);
    setRamSizeGB(preset.ramSizeGB);
    setStorageGB(preset.storageGB);
    setManufacturingYear(preset.manufacturingYear);
  };

  const generateRandomImei = () => {
    let result = '35';
    for (let i = 0; i < 13; i++) {
      result += Math.floor(Math.random() * 10);
    }
    setImei(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      alert('Please connect your Web3 wallet first.');
      return;
    }

    if (!imei || imei.length < 5) {
      setError('Please provide a valid numeric IMEI (at least 5 digits).');
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const hash = await registerMobileTx(contractAddress, account, {
        imei,
        brand,
        model,
        chipset,
        ramSizeGB: Number(ramSizeGB),
        storageGB: Number(storageGB),
        manufacturingYear: Number(manufacturingYear),
        activateNow,
      });

      setTxHash(hash);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.shortMessage || err?.message || 'Transaction failed or rejected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              Register New Mobile Device
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Mint an immutable on-chain record that permanently verifies initial ownership, hardware specs, and unboxing date.
            </p>
          </div>

          <button
            type="button"
            onClick={generateRandomImei}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Random IMEI
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-5">
          <span className="text-xs text-slate-400 font-medium mr-2">Quick Presets:</span>
          <div className="inline-flex flex-wrap gap-2 mt-2 sm:mt-0">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg border border-slate-700/60 transition"
              >
                {p.brand} {p.model}
              </button>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Unboxing / Activation Status Option */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Initial Box & Activation State
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActivateNow(true)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  activateNow
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Zap className={`w-5 h-5 shrink-0 mt-0.5 ${activateNow ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold text-white">Just Unboxed & In-Use</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Records today's timestamp as the permanent first-activation / unboxing date.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActivateNow(false)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  !activateNow
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Box className={`w-5 h-5 shrink-0 mt-0.5 ${!activateNow ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold text-white">Factory Sealed in Box</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Unactivated. Activation date will be stamped whenever the box is first opened.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* IMEI */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Device IMEI Number *
            </label>
            <input
              type="text"
              required
              value={imei}
              onChange={(e) => setImei(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 356938035643809"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Brand & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Brand *
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Samsung"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Model Name *
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. iPhone 15 Pro Max"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Chipset & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Chipset / Processor
              </label>
              <input
                type="text"
                required
                value={chipset}
                onChange={(e) => setChipset(e.target.value)}
                placeholder="e.g. Snapdragon 8 Gen 3"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Manufacturing Year
              </label>
              <input
                type="number"
                required
                min={2000}
                max={2030}
                value={manufacturingYear}
                onChange={(e) => setManufacturingYear(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* RAM & Storage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                RAM Size (GB)
              </label>
              <input
                type="number"
                required
                min={1}
                max={128}
                value={ramSizeGB}
                onChange={(e) => setRamSizeGB(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Internal Storage (GB)
              </label>
              <input
                type="number"
                required
                min={8}
                max={2048}
                value={storageGB}
                onChange={(e) => setStorageGB(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {txHash && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-200">Device registered successfully!</p>
                <p className="font-mono mt-1 text-[11px] break-all text-emerald-400/80">Tx: {txHash}</p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !account}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl transition shadow-lg shadow-indigo-500/20 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Waiting for Blockchain Confirmation...
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4" />
                {account ? 'Register On-Chain' : 'Connect Wallet to Register'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
