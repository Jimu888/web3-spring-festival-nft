import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction, useNetwork } from 'wagmi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Clock, Sparkles, Gift, Users, Calendar } from 'lucide-react';
import { CONTRACT_ADDRESSES, CONTRACT_ABI } from '../config/wagmi';
import CountdownTimer from './CountdownTimer';
import NFTPreview from './NFTPreview';

const MintPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [isMinting, setIsMinting] = useState(false);
  
  // 合约读取
  const contractAddress = chain?.id ? CONTRACT_ADDRESSES[chain.id as keyof typeof CONTRACT_ADDRESSES] : undefined;
  
  const contractReady = !!contractAddress;

  const { data: totalSupply } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
    watch: true,
    enabled: contractReady,
  });
  
  const { data: remainingSupply } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'remainingSupply',
    watch: true,
    enabled: contractReady,
  });
  
  const { data: isMintStarted } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'isMintStarted',
    watch: true,
    enabled: contractReady,
  });
  
  const { data: userMintCount } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'userMintCount',
    args: [address],
    enabled: contractReady && !!address,
    watch: true,
  });
  
  const { data: mintStartTime } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'getMintStartTime',
    enabled: contractReady,
  });
  
  // Mint函数
  const { 
    write: mintNFT, 
    data: mintData, 
    isLoading: isWriteLoading,
    error: writeError 
  } = useContractWrite({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'publicMint',
    value: BigInt(0), // 免费mint
  });
  
  const { isLoading: isTransactionLoading } = useWaitForTransaction({
    hash: mintData?.hash,
    onSuccess: () => {
      setIsMinting(false);
      toast.success('🎉 恭喜！成功获得春节纪念徽章！');
    },
    onError: (error) => {
      setIsMinting(false);
      toast.error(`Mint失败: ${error.message}`);
    },
  });
  
  // 处理mint
  const handleMint = async () => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }
    
    if (!isMintStarted) {
      toast.error('Mint尚未开始');
      return;
    }
    
    if (userMintCount && Number(userMintCount) >= 1) {
      toast.error('每个钱包限制mint 1个');
      return;
    }
    
    try {
      setIsMinting(true);
      mintNFT?.();
    } catch (error: any) {
      setIsMinting(false);
      toast.error(`Mint失败: ${error.message}`);
    }
  };
  
  // 处理写入错误
  useEffect(() => {
    if (writeError) {
      setIsMinting(false);
      toast.error(`交易失败: ${writeError.message}`);
    }
  }, [writeError]);
  
  const isLoading = isWriteLoading || isTransactionLoading || isMinting;
  const mintStartTimestamp = mintStartTime ? Number(mintStartTime) * 1000 : 1771742760000; // 默认时间
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* 头部导航 */}
      <nav className="flex justify-between items-center p-6 backdrop-blur-sm bg-black/20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Web3春节联欢晚会</h1>
            <p className="text-sm text-gray-300">2026纪念徽章</p>
          </div>
        </motion.div>
        
        <ConnectButton />
      </nav>
      
      {/* 主内容区 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          
          {/* 左侧：NFT预览 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <NFTPreview />
          </motion.div>
          
          {/* 右侧：Mint信息 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* 标题区域 */}
            <div className="text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                🐴 <span className="bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
                  机甲马年
                </span>
              </h2>
              <h3 className="text-2xl lg:text-3xl font-semibold text-gray-200 mb-6">
                Web3春节联欢晚会纪念徽章
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                庆祝中国传统新年与Web3科技的完美融合，限量<strong className="text-yellow-400">2026</strong>个数字藏品，
                见证历史第一届Web3春节联欢晚会的诞生时刻。
              </p>
            </div>
            
            {/* 统计信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">已铸造</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {totalSupply ? Number(totalSupply) : 0} / 2026
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Gift className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">剩余数量</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {remainingSupply ? Number(remainingSupply) : 2026}
                </p>
              </div>
            </div>
            
            {/* 倒计时或mint按钮 */}
            <div className="space-y-6">
              {!isMintStarted ? (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300 font-medium">Mint开启倒计时</span>
                  </div>
                  <CountdownTimer targetTime={mintStartTimestamp} />
                  <div className="flex items-center space-x-2 mt-4 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>开启时间：2026年2月16日 20:26 (北京时间)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mint按钮 */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMint}
                    disabled={isLoading || !isConnected || (userMintCount && Number(userMintCount) >= 1)}
                    className={`
                      w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300
                      ${isLoading || !isConnected || (userMintCount && Number(userMintCount) >= 1)
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-500 to-yellow-500 text-white hover:from-red-600 hover:to-yellow-600 shadow-lg hover:shadow-xl'
                      }
                    `}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>铸造中...</span>
                      </div>
                    ) : !isConnected ? (
                      '请先连接钱包'
                    ) : userMintCount && Number(userMintCount) >= 1 ? (
                      '已获得徽章 ✅'
                    ) : (
                      '🧧 免费获取春节徽章'
                    )}
                  </motion.button>
                  
                  {/* 用户状态 */}
                  {isConnected && (
                    <div className="text-center text-sm text-gray-400">
                      已mint: {userMintCount ? Number(userMintCount) : 0} / 1
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* 项目特色 */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">🎁 徽章特色</h4>
              <ul className="space-y-2 text-gray-300">
                <li>✨ <strong>动态NFT：</strong>机甲马霓虹光效动画</li>
                <li>🎨 <strong>原创设计：</strong>AI生成的独特视觉艺术</li>
                <li>🌟 <strong>纪念意义：</strong>Web3春节文化的历史见证</li>
                <li>🔗 <strong>BSC链：</strong>低gas费，环保高效</li>
                <li>💎 <strong>版税收益：</strong>5%交易分成支持创作者</li>
                <li>🎊 <strong>未来权益：</strong>下一年春晚白名单资格</li>
              </ul>
            </div>
            
          </motion.div>
        </div>
        
        {/* 底部信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center text-gray-400 max-w-2xl"
        >
          <p className="mb-2">
            由 <span className="text-yellow-400 font-medium">几木 火星探测技术站</span> 创作
          </p>
          <p className="text-sm">
            传承中华文化 · 拥抱Web3未来 · 每年春节不见不散 🏮
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default MintPage;