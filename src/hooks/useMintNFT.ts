import { useAccount, usePrepareContractWrite, useContractWrite, useNetwork } from 'wagmi';
import { useEffect, useState } from 'react';
import { CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from '../lib/web3Config';
import { readContract } from 'wagmi/actions';

/**
 * Mint NFT的Hook
 * 提供钱包连接状态、Mint功能和合约数据
 */
export function useMintNFT() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  // 合约数据状态
  const [userMintCount, setUserMintCount] = useState(0);
  const [remainingSupply, setRemainingSupply] = useState<number | undefined>(undefined);
  const [totalSupply, setTotalSupply] = useState<number | undefined>(undefined);

  // 准备合约写入
  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: NFT_CONTRACT_ABI,
    functionName: 'publicMint',
  });

  // 执行合约写入
  const { write, isLoading, isSuccess, isError, error, data } = useContractWrite(config);

  // 获取用户mint状态和合约数据
  useEffect(() => {
    if (!isConnected || !address) return;

    const fetchData = async () => {
      try {
        // 获取用户mint数量
        const count = await readContract({
          address: CONTRACT_ADDRESS,
          abi: NFT_CONTRACT_ABI,
          functionName: 'userMintCount',
          args: [address],
        });
        setUserMintCount(Number(count || 0));

        // 获取剩余供应量
        const remaining = await readContract({
          address: CONTRACT_ADDRESS,
          abi: NFT_CONTRACT_ABI,
          functionName: 'remainingSupply',
        });
        setRemainingSupply(Number(remaining || 0));

        // 获取总供应量
        const total = await readContract({
          address: CONTRACT_ADDRESS,
          abi: NFT_CONTRACT_ABI,
          functionName: 'totalSupply',
        });
        setTotalSupply(Number(total || 0));
      } catch (e) {
        console.error('Failed to fetch contract data:', e);
      }
    };

    fetchData();

    // 定期更新数据
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  const isBSC = chain?.id === 56;
  const canMint = isConnected && isBSC && userMintCount === 0;

  return {
    mint: write,
    isLoading,
    isSuccess,
    isError,
    error,
    transactionHash: data?.hash,
    canMint,
    isConnected,
    address,
    chain,
    isBSC,
    userMintCount,
    remainingSupply,
    totalSupply,
    status: isLoading ? 'loading' : isError ? 'error' : isSuccess ? 'success' : 'idle',
  };
}
