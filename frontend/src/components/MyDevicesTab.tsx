import React, { useEffect, useState } from 'react';
import { Smartphone, ArrowRightLeft, RefreshCw, Plus, Wallet, Box, Zap, Sparkles } from 'lucide-react';
import type { Address } from 'viem';
import type { MobileRecord } from '../types';
import { fetchOwnedMobiles, activateMobileTx } from '../utils/web3';
import { TransferModal } from './TransferModal';

interface MyDevicesTabProps {
  contractAddress: Address;
  account: Address | null;
  onConnect: () => void;
  onNavigateToRegister: () => void;
}

export const MyDevicesTab: React.FC<MyDevicesTabProps> = ({
  contractAddress,
  account,
  onConnect,
  onNavigateToRegister,
}) => {
  const [devices, setDevices] = useState<MobileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activatingImei, setActivatingImei] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<MobileRecord | null>(null);

  const loadDevices = React.useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      const records = await fetchOwnedMobiles(contractAddress, account);
      setDevices(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [account, contractAddress]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleActivate = async (imei: string) => {
    if (!account) return;
    setActivatingImei(imei);
    try {
      await activateMobileTx(contractAddress, account, imei);
      await loadDevices();
    } catch (err: any) {
      console.error(err);
      alert(err?.shortMessage || err?.message || 'Failed to activate device.');
    } finally {
      setActivatingImei(null);
    }
  };

  if (!account) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center max-w-lg mx-auto backdrop-blur-sm">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/10">
          <Wallet className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
        <p className="text-sm text-slate-400 mt-2">
          Connect your Web3 wallet (MetaMask, Coinbase Wallet, etc.) to view and manage all mobile devices registered under your custody.
        </p>
        <button
          onClick={onConnect}
          className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-indigo-500/20"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            My Registered Devices ({devices.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Devices currently recorded under your Ethereum address.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDevices}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={onNavigateToRegister}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Device
          </button>
        </div>
      </div>

      {/* Device List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Fetching your devices from blockchain...</span>
        </div>
      ) : devices.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
          <Smartphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Devices Registered Yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            You do not currently own any devices in this smart contract.
          </p>
          <button
            onClick={onNavigateToRegister}
            className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
          >
            Register Your First Device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {devices.map((device) => {
            const imeiStr = device.imei.toString();
            const isActivatingThis = activatingImei === imeiStr;

            return (
              <div
                key={imeiStr}
                className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition group backdrop-blur-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                        {device.specs.brand}
                      </span>
                      <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                        {device.specs.model}
                      </h4>
                    </div>

                    {device.isActivated ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Activated
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Box className="w-3 h-3" />
                        Factory Sealed
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 mb-4 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>IMEI:</span>
                      <span className="font-mono text-slate-200 select-all font-semibold">
                        {imeiStr}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Chipset:</span>
                      <span className="text-slate-200 truncate max-w-[150px]">{device.specs.chipset}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>RAM / Storage:</span>
                      <span className="text-slate-200">
                        {device.specs.ramSizeGB.toString()}GB / {device.specs.storageGB.toString()}GB
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Unboxed Date:</span>
                      <span className={device.isActivated ? 'text-emerald-300 font-medium' : 'text-amber-400/80 italic'}>
                        {device.isActivated
                          ? new Date(Number(device.firstUsedDate) * 1000).toLocaleDateString()
                          : 'Not unboxed yet'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {!device.isActivated && (
                    <button
                      onClick={() => handleActivate(imeiStr)}
                      disabled={isActivatingThis}
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {isActivatingThis ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Unboxing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Unbox & Activate
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedDevice(device)}
                    className="w-full py-2 bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 border border-slate-700/60 hover:border-transparent"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Transfer Ownership
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {selectedDevice && (
        <TransferModal
          device={selectedDevice}
          contractAddress={contractAddress}
          account={account}
          onClose={() => setSelectedDevice(null)}
          onSuccess={loadDevices}
        />
      )}
    </div>
  );
};
