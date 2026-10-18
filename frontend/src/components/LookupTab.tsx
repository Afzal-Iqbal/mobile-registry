import React, { useState } from 'react';
import { Search, ShieldCheck, Cpu, HardDrive, MemoryStick, Calendar, UserCheck, AlertCircle, Clock, Box, Zap, Sparkles } from 'lucide-react';
import type { Address } from 'viem';
import type { MobileRecord } from '../types';
import { fetchMobileByImei, activateMobileTx } from '../utils/web3';

interface LookupTabProps {
  contractAddress: Address;
  account?: Address | null;
}

function formatTimeAgo(timestampInSeconds: number): string {
  const diffSeconds = Math.max(0, Math.floor(Date.now() / 1000) - timestampInSeconds);
  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export const LookupTab: React.FC<LookupTabProps> = ({ contractAddress, account }) => {
  const [imeiInput, setImeiInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);
  const [searched, setSearched] = useState(false);
  const [record, setRecord] = useState<MobileRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!imeiInput.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await fetchMobileByImei(contractAddress, imeiInput.trim());
      setRecord(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to query the blockchain.');
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!record || !account) return;
    setActivating(true);
    try {
      await activateMobileTx(contractAddress, account, record.imei.toString());
      // Refresh record
      const updated = await fetchMobileByImei(contractAddress, record.imei.toString());
      setRecord(updated);
    } catch (err: any) {
      console.error(err);
      alert(err?.shortMessage || err?.message || 'Failed to activate device.');
    } finally {
      setActivating(false);
    }
  };

  const isCurrentOwner = account && record && account.toLowerCase() === record.currentOwner.toLowerCase();

  return (
    <div className="space-y-8">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-10 text-center relative overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Verify Device Authenticity & Unboxing History
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
          Query the immutable Ethereum ledger by IMEI to inspect first-activation date, box status, hardware specs, and complete ownership history.
        </p>

        <form onSubmit={handleSearch} className="mt-6 max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={imeiInput}
              onChange={(e) => setImeiInput(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter 15-digit Device IMEI..."
              className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !imeiInput}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl transition shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Verify
          </button>
        </form>

        <p className="mt-3 text-xs text-slate-500">
          Tip: Test by registering a new device in the <strong>Register Device</strong> tab first.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {searched && !loading && (
        <>
          {record ? (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-sm">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified On-Chain
                    </span>
                    <span className="text-xs text-slate-400 font-mono">IMEI: {record.imei.toString()}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-2">
                    {record.specs.brand} {record.specs.model}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    Registered on: {new Date(Number(record.registrationDate) * 1000).toLocaleString()}
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:text-right">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Current Verified Owner
                  </span>
                  <span className="font-mono text-xs text-indigo-300 select-all font-semibold">
                    {record.currentOwner}
                  </span>
                </div>
              </div>

              {/* UNBOXING & ACTIVATION STATUS BANNER */}
              {record.isActivated ? (
                <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                          Box Status: Unboxed & Activated
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                          First-Use Authenticated
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white mt-1">
                        First Opened on: {new Date(Number(record.firstUsedDate) * 1000).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Device Age since unboxing:</span>
                        <strong className="text-emerald-300 font-mono">
                          {formatTimeAgo(Number(record.firstUsedDate))}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                      <Box className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                          Box Status: Factory Sealed
                        </span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                          Never Opened
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white mt-1">
                        Brand new in original box — Never unboxed or activated.
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        First-usage timestamp will be permanently locked on-chain when the box is first opened.
                      </div>
                    </div>
                  </div>

                  {isCurrentOwner && (
                    <button
                      onClick={handleActivate}
                      disabled={activating}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0 active:scale-95"
                    >
                      {activating ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Activating On-Chain...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Open Box & Activate Now
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Hardware Specifications Grid */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Hardware Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      Chipset
                    </div>
                    <div className="text-sm font-semibold text-white truncate">{record.specs.chipset}</div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <MemoryStick className="w-4 h-4 text-violet-400" />
                      RAM
                    </div>
                    <div className="text-sm font-semibold text-white">{record.specs.ramSizeGB.toString()} GB</div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <HardDrive className="w-4 h-4 text-sky-400" />
                      Storage
                    </div>
                    <div className="text-sm font-semibold text-white">{record.specs.storageGB.toString()} GB</div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      Year
                    </div>
                    <div className="text-sm font-semibold text-white">{record.specs.manufacturingYear.toString()}</div>
                  </div>
                </div>
              </div>

              {/* Ownership Provenance Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  Ownership Provenance History ({record.ownershipHistory.length} Transfer{record.ownershipHistory.length > 1 ? 's' : ''})
                </h4>

                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5">
                  <div className="space-y-4">
                    {record.ownershipHistory.map((addr, idx) => {
                      const isInitial = idx === 0;
                      const isCurrent = idx === record.ownershipHistory.length - 1;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCurrent
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : isInitial
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {idx + 1}
                          </div>

                          <div className="flex-1 font-mono text-xs sm:text-sm text-slate-300 break-all">
                            {addr}
                          </div>

                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            isCurrent
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : isInitial
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isInitial && isCurrent ? 'Original & Current Owner' : isInitial ? 'Original Registrant' : isCurrent ? 'Current Owner' : `Owner #${idx + 1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">IMEI Not Found</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                No device is registered on-chain with IMEI <code className="text-indigo-300">{imeiInput}</code>.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
