import { getDefaultWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, bscTestnet } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  // WalletConnect Project ID is required for reliable wallet connections.
  // Keep a fallback for local mock previews, but production should always set this.
  console.warn('[wagmi] Missing VITE_WALLETCONNECT_PROJECT_ID. Wallet connections may not work.');
}

const effectiveProjectId = projectId || 'demo';

const { wallets } = getDefaultWallets({
  appName: 'Web3春节联欢晚会2026',
  projectId: effectiveProjectId,
});

export const chains = [bsc, bscTestnet] as const;

export const config = getDefaultConfig({
  appName: 'Web3春节联欢晚会2026',
  projectId: effectiveProjectId,
  wallets,
  chains,
  ssr: false,
});

// 合约地址配置（未部署前允许为空）
export const CONTRACT_ADDRESSES = {
  [bsc.id]: (import.meta.env.VITE_CONTRACT_ADDRESS_BSC as `0x${string}` | undefined) || undefined,
  [bscTestnet.id]: (import.meta.env.VITE_CONTRACT_ADDRESS_BSC_TESTNET as `0x${string}` | undefined) || undefined,
} as const;

// 合约ABI（简化版，只包含需要的函数）
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "publicMint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "remainingSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isMintStarted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMintStartTime",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "userMintCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_SUPPLY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_PER_WALLET",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;