import { configureChains, createConfig } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { SPRING_FESTIVAL_BADGE_ABI } from './contractAbi';

// 环境变量
export const CONTRACT_ADDRESS = '0x3e7305b8377800decc2b4359c25bc3fdbdad9843' as const;
export const CHAIN_ID = 56; // BSC
export const CHAIN_NAME = 'BSC (Binance Smart Chain)';
export const WALLETCONNECT_PROJECT_ID = process.env.VITE_WALLETCONNECT_PROJECT_ID || '1af1fbb236796546d0d0dc7d80a3fa1b';

// 配置chains和providers
const { publicClient, webSocketPublicClient } = configureChains(
  [bsc],
  [publicProvider()]
);

// 创建wagmi配置
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains: [bsc] }),
    new WalletConnectConnector({
      chains: [bsc],
      options: {
        projectId: WALLETCONNECT_PROJECT_ID,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

// 导出ABI
export const NFT_CONTRACT_ABI = SPRING_FESTIVAL_BADGE_ABI;
