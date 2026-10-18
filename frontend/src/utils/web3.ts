import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  isAddress,
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient,
  type Chain,
} from 'viem';
import { hardhat, sepolia } from 'viem/chains';
import { OLD_MOBILE_REGISTRY_ABI } from '../contracts/contractConfig';
import type { MobileRecord, MobileSpecs } from '../types';

export async function getConnectedChain(): Promise<Chain> {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const hexChain = await window.ethereum.request({ method: 'eth_chainId' });
      const id = parseInt(hexChain, 16);
      if (id === 31337) return hardhat;
    } catch {
      // fallback to sepolia
    }
  }
  return sepolia;
}

export function getPublicClient(): PublicClient {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createPublicClient({
      chain: sepolia,
      transport: custom(window.ethereum),
    });
  }
  return createPublicClient({
    chain: sepolia,
    transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
  });
}

export async function ensureTargetNetwork(): Promise<void> {
  if (typeof window === 'undefined' || !window.ethereum) return;

  const currentChainHex = await window.ethereum.request({ method: 'eth_chainId' });
  const currentChainId = parseInt(currentChainHex, 16);

  // If already on Sepolia or Localhost, allow it
  if (currentChainId === 11155111 || currentChainId === 31337) return;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // 11155111 Sepolia in hex
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'Sepolia ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

// Keep backwards-compatible alias
export const ensureHardhatNetwork = ensureTargetNetwork;

export function getWalletClient(): WalletClient | null {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum),
    });
  }
  return null;
}

export async function fetchMobileByImei(
  contractAddress: Address,
  imei: string
): Promise<MobileRecord | null> {
  const client = getPublicClient();
  const imeiBigInt = BigInt(imei);

  try {
    const data = await client.readContract({
      address: contractAddress,
      abi: OLD_MOBILE_REGISTRY_ABI,
      functionName: 'mobiles',
      args: [imeiBigInt],
    });

    const [rawImei, rawSpecs, currentOwner, registrationDate, firstUsedDate, isActivated, isRegistered] = data as any;

    if (!isRegistered) {
      return null;
    }

    const history = (await client.readContract({
      address: contractAddress,
      abi: OLD_MOBILE_REGISTRY_ABI,
      functionName: 'getOwnershipHistory',
      args: [imeiBigInt],
    })) as Address[];

    const specs: MobileSpecs = {
      brand: rawSpecs.brand ?? rawSpecs[0] ?? '',
      model: rawSpecs.model ?? rawSpecs[1] ?? '',
      chipset: rawSpecs.chipset ?? rawSpecs[2] ?? '',
      ramSizeGB: BigInt(rawSpecs.ramSizeGB ?? rawSpecs[3] ?? 0),
      storageGB: BigInt(rawSpecs.storageGB ?? rawSpecs[4] ?? 0),
      manufacturingYear: BigInt(rawSpecs.manufacturingYear ?? rawSpecs[5] ?? 0),
    };

    return {
      imei: BigInt(rawImei),
      specs,
      currentOwner: currentOwner as Address,
      ownershipHistory: history,
      registrationDate: BigInt(registrationDate),
      firstUsedDate: BigInt(firstUsedDate ?? 0),
      isActivated: Boolean(isActivated),
      isRegistered: Boolean(isRegistered),
    };
  } catch (err) {
    console.error('Error fetching mobile record:', err);
    return null;
  }
}

export async function fetchOwnedMobiles(
  contractAddress: Address,
  ownerAddress: Address
): Promise<MobileRecord[]> {
  const client = getPublicClient();

  try {
    const imeis = (await client.readContract({
      address: contractAddress,
      abi: OLD_MOBILE_REGISTRY_ABI,
      functionName: 'getMobilesByOwner',
      args: [ownerAddress],
    })) as bigint[];

    const records: MobileRecord[] = [];
    for (const imei of imeis) {
      const rec = await fetchMobileByImei(contractAddress, imei.toString());
      if (rec) records.push(rec);
    }

    return records;
  } catch (err) {
    console.error('Error fetching owner devices:', err);
    return [];
  }
}

export async function registerMobileTx(
  contractAddress: Address,
  account: Address,
  data: {
    imei: string;
    brand: string;
    model: string;
    chipset: string;
    ramSizeGB: number;
    storageGB: number;
    manufacturingYear: number;
    activateNow: boolean;
  }
): Promise<Hash> {
  await ensureTargetNetwork();

  const walletClient = getWalletClient();
  if (!walletClient) throw new Error('MetaMask or Web3 wallet is not connected.');

  const client = getPublicClient();
  const activeChain = await getConnectedChain();

  const hash = await walletClient.writeContract({
    chain: activeChain,
    account,
    address: contractAddress,
    abi: OLD_MOBILE_REGISTRY_ABI,
    functionName: 'registerMobile',
    args: [
      BigInt(data.imei),
      data.brand,
      data.model,
      data.chipset,
      BigInt(data.ramSizeGB),
      BigInt(data.storageGB),
      BigInt(data.manufacturingYear),
      data.activateNow,
    ],
  });

  await client.waitForTransactionReceipt({ hash });
  return hash;
}

export async function activateMobileTx(
  contractAddress: Address,
  account: Address,
  imei: string
): Promise<Hash> {
  await ensureTargetNetwork();

  const walletClient = getWalletClient();
  if (!walletClient) throw new Error('MetaMask or Web3 wallet is not connected.');

  const client = getPublicClient();
  const activeChain = await getConnectedChain();

  const hash = await walletClient.writeContract({
    chain: activeChain,
    account,
    address: contractAddress,
    abi: OLD_MOBILE_REGISTRY_ABI,
    functionName: 'activateMobile',
    args: [BigInt(imei)],
  });

  await client.waitForTransactionReceipt({ hash });
  return hash;
}

export async function transferOwnershipTx(
  contractAddress: Address,
  account: Address,
  imei: string,
  newOwner: Address
): Promise<Hash> {
  if (!isAddress(newOwner)) {
    throw new Error('Invalid Ethereum recipient address.');
  }

  await ensureTargetNetwork();

  const walletClient = getWalletClient();
  if (!walletClient) throw new Error('MetaMask or Web3 wallet is not connected.');

  const client = getPublicClient();
  const activeChain = await getConnectedChain();

  const hash = await walletClient.writeContract({
    chain: activeChain,
    account,
    address: contractAddress,
    abi: OLD_MOBILE_REGISTRY_ABI,
    functionName: 'transferOwnership',
    args: [BigInt(imei), newOwner],
  });

  await client.waitForTransactionReceipt({ hash });
  return hash;
}
