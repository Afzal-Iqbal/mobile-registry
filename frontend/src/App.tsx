import { useEffect, useState } from 'react';
import { Search, PlusCircle, Smartphone } from 'lucide-react';
import type { Address } from 'viem';
import { Navbar } from './components/Navbar';
import { LookupTab } from './components/LookupTab';
import { RegisterTab } from './components/RegisterTab';
import { MyDevicesTab } from './components/MyDevicesTab';
import { DEFAULT_CONTRACT_ADDRESS } from './contracts/contractConfig';

export function App() {
  const [activeTab, setActiveTab] = useState<'lookup' | 'register' | 'devices'>('lookup');
  const [account, setAccount] = useState<Address | null>(null);
  const [contractAddress, setContractAddress] = useState<Address>(DEFAULT_CONTRACT_ADDRESS);

  // Check if wallet is already connected
  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = (await window.ethereum.request({
          method: 'eth_accounts',
        })) as Address[];
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error('Failed to check connected accounts', err);
      }
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = (await window.ethereum.request({
          method: 'eth_requestAccounts',
        })) as Address[];
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error('User rejected wallet connection', err);
      }
    } else {
      alert('MetaMask or a Web3 compatible browser extension is required.');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  useEffect(() => {
    checkConnection();

    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: Address[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        account={account}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        contractAddress={contractAddress}
        onUpdateContractAddress={(newAddr) => setContractAddress(newAddr)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Tab Navigation Pill Bar */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-xl shadow-lg">
            <button
              onClick={() => setActiveTab('lookup')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'lookup'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-4 h-4" />
              Verify & Lookup
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Register Device
            </button>

            <button
              onClick={() => setActiveTab('devices')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'devices'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              My Devices
            </button>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'lookup' && <LookupTab contractAddress={contractAddress} account={account} />}
        {activeTab === 'register' && (
          <RegisterTab
            contractAddress={contractAddress}
            account={account}
            onSuccess={() => setActiveTab('devices')}
          />
        )}
        {activeTab === 'devices' && (
          <MyDevicesTab
            contractAddress={contractAddress}
            account={account}
            onConnect={connectWallet}
            onNavigateToRegister={() => setActiveTab('register')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Hardhat 3 + Viem + React + Tailwind CSS v4</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Deployed at: {contractAddress}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
