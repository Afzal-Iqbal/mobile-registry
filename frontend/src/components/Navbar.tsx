import React, { useEffect, useState } from 'react';
import { Smartphone, Wallet, Check, Copy, Settings, AlertTriangle } from 'lucide-react';
import type { Address } from 'viem';
import { ensureHardhatNetwork } from '../utils/web3';

interface NavbarProps {
  account: Address | null;
  onConnect: () => void;
  onDisconnect: () => void;
  contractAddress: Address;
  onUpdateContractAddress: (newAddr: Address) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  account,
  onConnect,
  onDisconnect,
  contractAddress,
  onUpdateContractAddress,
}) => {
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [customAddress, setCustomAddress] = useState(contractAddress);
  const [chainId, setChainId] = useState<number | null>(null);

  const checkChain = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const hexChain = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(hexChain, 16));
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    checkChain();
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = (newChainHex: string) => {
        setChainId(parseInt(newChainHex, 16));
      };
      window.ethereum.on('chainChanged', handleChainChanged);
      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAddress.startsWith('0x') && customAddress.length === 42) {
      onUpdateContractAddress(customAddress);
      setShowConfig(false);
    } else {
      alert('Please enter a valid 42-character Ethereum address (0x...)');
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await ensureHardhatNetwork();
      await checkChain();
    } catch (err: any) {
      alert(err?.message || 'Failed to switch network in MetaMask.');
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">MobileRegistry</span>
              <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                On-Chain Provenance
              </span>
            </div>
            <p className="text-xs text-slate-400">Hardhat & Viem Smart Contract Registry</p>
          </div>
        </div>

        {/* Contract & Wallet Info */}
        <div className="flex items-center gap-3">
          {/* Network Badge */}
          {account && chainId !== null && (
            <>
              {chainId === 11155111 ? (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Sepolia (11155111)
                </div>
              ) : chainId === 31337 ? (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Hardhat Local (31337)
                </div>
              ) : (
                <button
                  onClick={handleSwitchNetwork}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-medium transition animate-pulse"
                  title="Click to switch MetaMask to Sepolia"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Switch to Sepolia</span>
                </button>
              )}
            </>
          )}

          {/* Contract Address Badge */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700/60 transition"
            title="Configure Contract Address"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Contract:</span>
            <span className="font-mono text-indigo-300">
              {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
            </span>
          </button>

          {/* Wallet Connect Button */}
          {account ? (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl p-1.5 pl-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-slate-200">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:text-white text-slate-400 rounded transition"
                  title="Copy address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                onClick={onDisconnect}
                className="text-xs bg-slate-700/60 hover:bg-red-500/20 hover:text-red-300 text-slate-300 px-2.5 py-1 rounded-lg transition"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-medium text-sm shadow-md shadow-indigo-500/20 transition active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Contract Address Config Modal */}
      {showConfig && (
        <div className="border-t border-slate-800/80 bg-slate-900/95 px-4 py-3">
          <form onSubmit={handleSaveContract} className="max-w-7xl mx-auto flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Target Contract Address:</span>
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value as Address)}
              className="flex-1 max-w-lg bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="0x..."
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
