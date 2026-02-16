import { configureChains, createConfig } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { SPRING_FESTIVAL_BADGE_ABI } from './contractAbi';

// 环境变量
export const CONTRACT_ADDRESS = '0x3e7305b8377800decc2b4359c25bc3fdbdad9843' as const;
export const CHAIN_ID = 56; // BSC
export const CHAIN_NAME = 'BSC (Binance Smart Chain)';
export const WALLETCONNECT_PROJECT_ID = (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID || '1af1fbb236796546d0d0dc7d80a3fa1b';

// 配置chains和providers
// 使用 BSC 官方公共 RPC 作为主要节点，publicProvider(ankr) 作为 fallback
const { publicClient, webSocketPublicClient } = configureChains(
  [bsc],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: 'https://bsc-dataseed.binance.org',
      }),
    }),
    jsonRpcProvider({
      rpc: () => ({
        http: 'https://bsc-dataseed1.defibit.io',
      }),
    }),
    publicProvider(),
  ]
);

// 创建wagmi配置
// InjectedConnector 放在最前面，它能自动检测 OKX、TokenPocket、
// MetaMask 等手机钱包内置浏览器注入的 provider
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains: [bsc],
      options: { name: 'Browser Wallet', shimDisconnect: true },
    }),
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
