import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Calendar, Wallet, Loader, Copy, ExternalLink } from 'lucide-react';
import { useAccount, useConnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import CountdownTimer from './CountdownTimer';
import NFTPreview from './NFTPreview';
import AckModal, { hasAcked } from './AckModal';
import { useMintNFT } from '../hooks/useMintNFT';
import { WALLETCONNECT_PROJECT_ID } from '../lib/web3Config';

// 海报式布局：参考图风格（中央大面板）
const MintPagePoster: React.FC = () => {
  const mintStartTimestamp = useMemo(() => new Date('2026-02-16T20:26:00+08:00').getTime(), []);
  const mintEndTimestamp = useMemo(() => new Date('2026-03-04T00:00:00+08:00').getTime(), []);
  const now = Date.now();
  const isMintStarted = now >= mintStartTimestamp;
  const isMintEnded = now >= mintEndTimestamp;

  // 预览开关：?mint=1 强制展示“已开始”的按钮样式
  const previewStarted = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('mint') === '1';
    } catch {
      return false;
    }
  }, []);

  const effectiveMintStarted = previewStarted || isMintStarted;
  const mintActive = effectiveMintStarted && !isMintEnded;

  // Web3 hooks
  const { address, isConnected } = useAccount();

  // 检测是否有注入钱包（钱包内置浏览器）
  const hasInjectedWallet = typeof window !== 'undefined' && !!(window as any).ethereum;
  const isMobileBrowser = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const needWalletConnect = isMobileBrowser && !hasInjectedWallet;

  const { connect: connectInjected } = useConnect({
    connector: new InjectedConnector(),
  });
  const { connect: connectWC } = useConnect({
    connector: new WalletConnectConnector({
      options: { projectId: WALLETCONNECT_PROJECT_ID },
    }),
  });

  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork({ chainId: 56 });
  const { mint, isLoading, canMint, userMintCount, remainingSupply, isBSC, chainLoading, status, error } = useMintNFT();

  // Demo数据（如果合约数据不可用）
  const displayTotalSupply = 26;
  const displayRemainingSupply = remainingSupply !== undefined ? remainingSupply : 2000;

  const [ackOpen, setAckOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'connect' | 'mint'>('connect');
  const [showWalletTip, setShowWalletTip] = useState(false);

  // 钱包连接
  const handleConnect = () => {
    if (!isConnected) {
      if (needWalletConnect) {
        // 普通手机浏览器：先尝试 WalletConnect，显示提示
        try {
          connectWC();
          toast.loading('正在唤起 WalletConnect...', { icon: '🔗' });
        } catch {
          // WalletConnect 失败，显示提示
          setShowWalletTip(true);
        }
      } else {
        connectInjected();
        toast.loading('正在连接钱包...', { icon: '🔌' });
      }
    } else {
      if (!isBSC) {
        // 尝试自动切换到 BSC
        if (switchNetwork) {
          switchNetwork();
          toast.loading('正在切换到BSC网络...', { icon: '🔄' });
        } else {
          toast.error('请在钱包中手动切换到BSC网络');
        }
        return;
      }
      if (userMintCount > 0) {
        toast('你已经mint过了，每个钱包限1个哦 😊', { icon: '✨' });
        return;
      }
      setPendingAction('mint');
      if (hasAcked()) {
        handleMint();
      } else {
        setAckOpen(true);
      }
    }
  };

  // Mint操作
  const handleMint = () => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }
    if (!isBSC) {
      if (switchNetwork) {
        switchNetwork();
        toast.loading('正在切换到BSC网络...', { icon: '🔄' });
      } else {
        toast.error('请在钱包中手动切换到BSC网络');
      }
      return;
    }
    if (userMintCount > 0) {
      toast.error('你已经mint过了');
      return;
    }
    if (remainingSupply <= 0) {
      toast.error('已售罄');
      return;
    }

    mint?.();
  };

  // 监听mint状态
  useEffect(() => {
    if (status === 'success') {
      toast.success('🎉 Mint成功！检查你的钱包');
    } else if (status === 'error') {
      toast.error(`❌ Mint失败: ${error?.message || '未知错误'}`);
    }
  }, [status, error]);

  const runAction = (action: 'connect' | 'mint') => {
    if (action === 'connect') {
      handleConnect();
    } else if (action === 'mint') {
      handleMint();
    }
  };

  const requestAckThen = (action: 'connect' | 'mint') => {
    setPendingAction(action);
    if (hasAcked()) {
      runAction(action);
      return;
    }
    setAckOpen(true);
  };

  return (
    <div className="min-h-screen">
      <AckModal
        open={ackOpen}
        onClose={() => setAckOpen(false)}
        onConfirm={() => {
          setAckOpen(false);
          runAction(pendingAction);
        }}
      />

      {/* 顶部轻导航（可选） */}
      <div className="px-6 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-yellow-300/20 shadow-[0_0_25px_rgba(255,215,0,0.18)]">
            <img src="/nft-preview.jpg" alt="Badge Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-white font-semibold">Web3春节联欢晚会</div>
            <div className="text-white/70 text-sm">2026纪念徽章 NFT</div>
          </div>
          <a
            href="/?theme=street&page=poster"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-200/20 bg-black/30 text-yellow-100/90 hover:bg-black/40 backdrop-blur-md text-sm sm:text-base font-semibold transition-colors"
          >
            🏆 春晚奖杯领取
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-yellow-200/15 bg-black/30 text-yellow-100/90 backdrop-blur-md shadow-[0_16px_70px_rgba(0,0,0,0.55)]">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r from-red-400 to-yellow-300 shadow-[0_0_18px_rgba(255,215,0,0.35)]" />
            <span className="text-sm font-semibold tracking-wide">FREE MINT</span>
          </div>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md transition-all"
          >
            <Wallet className="w-4 h-4" />
            {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : '连接钱包'}
          </button>
        </div>
      </div>

      {/* 中央海报面板 */}
      <div className="px-6 pb-10 pt-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[460px]"
        >
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/45 backdrop-blur-2xl shadow-[0_40px_160px_rgba(0,0,0,0.78)]">
            {/* 霓虹描边（红金为主，贴近参考图） */}
            <div className="pointer-events-none absolute -inset-[1px] rounded-[28px] bg-gradient-to-r from-red-500/28 via-yellow-400/22 to-red-500/20 opacity-65" />
            {/* 霓虹内灯管（细内描边） */}
            <div className="pointer-events-none absolute inset-[10px] rounded-[20px] border border-yellow-200/14 shadow-[0_0_70px_rgba(255,215,120,0.12)]" />
            <div className="pointer-events-none absolute inset-[10px] rounded-[20px] border border-red-400/10 shadow-[0_0_90px_rgba(255,60,120,0.10)]" />
            {/* 顶部灯光扫过（静态高光条，提升金属感） */}
            <div className="pointer-events-none absolute left-[-20%] top-[-25%] h-[60%] w-[140%] rotate-[-8deg] opacity-25 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.35),rgba(255,255,255,0))]" />

            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,180,90,0.20),rgba(255,255,255,0)_55%)]" />
            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_20%_40%,rgba(255,60,120,0.12),rgba(255,255,255,0)_60%)]" />

            <div className="relative p-5">
              <div className="text-center">
                <div className="title-serif text-3xl font-bold text-white/95 drop-shadow-[0_10px_40px_rgba(0,0,0,0.55)]">丙午马年</div>
                <div className="title-serif mt-2 text-xl font-semibold text-yellow-200/95 drop-shadow-[0_8px_26px_rgba(255,215,120,0.10)]">Web3春节联欢晚会纪念徽章</div>
              </div>

              <div className="mt-5 flex justify-center">
                <NFTPreview showCaption={false} />
              </div>

              <div className="mt-3 text-center">
                <div className="text-sm font-semibold text-white/90">丙午马年徽章</div>
                <div className="text-xs text-white/60">Web3春节联欢晚会 2026 · 纪念NFT</div>
              </div>

              {/* 介绍文字（完整保留，卡片内滚动，不占首屏） */}
              <div className="mt-4 relative rounded-2xl border border-white/10 bg-black/20 backdrop-blur-2xl p-4 max-h-[112px] overflow-auto text-[13px] leading-[1.55] text-white/78">
                <p className="title-serif text-yellow-200/95 font-semibold mb-2 tracking-wide">起于2026，马不停蹄。</p>
                <p className="mb-2 text-white/76">感谢AI时代的馈赠，让我得以用一己之力，‘手搓’出这第一届Web3春晚。这枚NFT，不仅是新春的纪念，更是我们在这条数字洪流中相遇的信物。</p>
                <p className="mb-2 text-white/76">我许下一个愿望：从今年起，每一个春节，我们都在春晚相聚。</p>
                <p className="mb-2 text-white/76">12年，是一个生肖的轮回。在代码与算法飞速更迭的世界里，万物皆流，变幻莫测。如果我们有缘，能携手走完这一个轮回，集齐12枚徽章的时刻，或许我们召唤的不止是神龙，更是这一段属于我们共同跨越周期的、闪闪发光的岁月。</p>
                <p className="mb-2 text-white/76">感谢你，成为这漫长旅程的第一位见证者。</p>
                <p className="text-white/76">新春快乐，在这个奔腾的马年，祝你拥有跨越一切不确定的勇气与好运。</p>

                {/* 右侧向下箭头提示（更明显：三个箭头，轻动画） */}
                <div className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1 leading-none text-[12px] text-white/55">
                  <span className="arrow-bob" style={{ animationDelay: '0s' }}>▾</span>
                  <span className="arrow-bob" style={{ animationDelay: '0.15s' }}>▾</span>
                  <span className="arrow-bob" style={{ animationDelay: '0.3s' }}>▾</span>
                </div>
              </div>

              {/* 进度条：已铸造/剩余（节省空间） */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/18 backdrop-blur-2xl p-4">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>已铸造</span>
                  <span className="text-white/80 font-semibold">{displayTotalSupply} / 2026</span>
                </div>

                <div className="mt-2 relative h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_50%,rgba(255,215,120,0.18),rgba(255,255,255,0)_60%)]" />
                  <div
                    className="relative h-full rounded-full bg-[linear-gradient(90deg,rgba(255,30,90,0.85),rgba(255,215,120,0.45),rgba(255,30,90,0.85))] shadow-[0_0_22px_rgba(255,60,120,0.18)]"
                    style={{ width: `${Math.min(100, Math.max(0, (displayTotalSupply / 2026) * 100))}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-white/60">
                  <span>剩余：{displayRemainingSupply}</span>
                  <span>每地址限量mint 1枚</span>
                </div>

                {/* 钱包状态提示 */}
                {isConnected && (
                  <div className="mt-3 text-[11px] text-yellow-200/80 bg-yellow-600/15 px-2 py-1.5 rounded">
                    {chainLoading && '⏳ 正在检测网络...'}
                    {!chainLoading && !isBSC && '⚠️ 请切换到BSC网络（点击下方按钮自动切换）'}
                    {isBSC && userMintCount > 0 && '✅ 你已mint过'}
                    {isBSC && userMintCount === 0 && displayRemainingSupply > 0 && '✨ 可以mint'}
                    {displayRemainingSupply === 0 && '🔥 已售罄'}
                  </div>
                )}
              </div>

              {/* Mint按钮 */}
              <div className="mt-5">
                <motion.button
                  whileHover={{ scale: canMint && !isLoading ? 1.01 : 1 }}
                  whileTap={{ scale: canMint && !isLoading ? 0.99 : 1 }}
                  onClick={() => requestAckThen('mint')}
                  disabled={!canMint || isLoading || !effectiveMintStarted}
                  className={
                    "group relative w-full py-3.5 px-7 rounded-2xl font-semibold text-base transition-all duration-300 overflow-hidden " +
                    (mintActive && canMint
                      ? "bg-[linear-gradient(90deg,rgba(255,30,90,0.85),rgba(255,80,140,0.55),rgba(255,30,90,0.85))] text-white border border-red-200/22 shadow-[0_30px_140px_rgba(255,60,120,0.22)] ring-1 ring-red-200/14 "
                      : "bg-black/30 text-white border border-yellow-200/18 shadow-[0_25px_90px_rgba(0,0,0,0.55)] ring-1 ring-yellow-200/10 ") +
                    (isLoading || !canMint ? "opacity-70 cursor-not-allowed" : "")
                  }
                >
                  {/* 霓虹边框 */}
                  <span className="pointer-events-none absolute inset-0 rounded-2xl border border-yellow-200/22 opacity-80" />
                  <span className="pointer-events-none absolute inset-0 rounded-2xl border border-red-300/18 opacity-70" />

                  {/* 内发光底 */}
                  <span className="pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,215,120,0.24),rgba(255,255,255,0)_55%)]" />
                  <span className="pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_70%_70%,rgba(255,60,120,0.16),rgba(255,255,255,0)_60%)]" />

                  {/* 扫描线（hover更明显） */}
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0)_100%)] bg-[length:100%_6px]" />

                  {/* 文案 */}
                  <span className="relative z-10 tracking-wide drop-shadow-[0_2px_18px_rgba(255,215,0,0.12)] flex items-center justify-center gap-2">
                    {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                    {!isConnected && 'Connect Wallet'}
                    {isConnected && chainLoading && '⏳ 检测网络中...'}
                    {isConnected && !chainLoading && !isBSC && '🔄 切换到BSC网络'}
                    {isConnected && isBSC && userMintCount > 0 && '✅ 已mint'}
                    {isConnected && isBSC && userMintCount === 0 && displayRemainingSupply > 0 && 'FREE MINT'}
                    {displayRemainingSupply === 0 && '🔥 已售罄'}
                    {!effectiveMintStarted && ' (未开始)'}
                    {isMintEnded && ' (已结束)'}
                  </span>
                </motion.button>
              </div>

              {/* 普通手机浏览器提示：复制链接到钱包浏览器 */}
              {!isConnected && needWalletConnect && (
                <div className="mt-3 rounded-xl border border-yellow-200/15 bg-yellow-600/[0.08] p-3 space-y-2">
                  <p className="text-[11px] text-yellow-200/80 leading-relaxed">
                    💡 建议在钱包App（MetaMask、OKX、TokenPocket等）的内置浏览器中打开本页面，连接更稳定
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        toast.success('链接已复制，请粘贴到钱包浏览器中打开');
                      } catch {
                        toast.error('复制失败，请手动复制地址栏链接');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-yellow-400/15 border border-yellow-300/20 text-yellow-200/90 text-xs font-medium hover:bg-yellow-400/25 active:bg-yellow-400/30 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    复制链接到钱包浏览器打开
                  </button>
                </div>
              )}

              {/* 时间 & 声明 */}
              <div className="mt-4 space-y-2 text-xs text-white/65">
                <div className="flex items-center gap-2 justify-center">
                  <Calendar className="w-4 h-4" />
                  <span>开始：2026年2月16日 20:26（北京时间）</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Calendar className="w-4 h-4" />
                  <span>结束：2026年3月4日 00:00（北京时间）· 未mint完将销毁</span>
                </div>
                <div className="text-center">本NFT仅作为“2026Web3春晚”的数字纪念凭证，无任何投资价值。</div>
              </div>

              {/* 底部文案（去掉“由几木创作”） */}
              <div className="mt-6 text-center">
                <div className="text-xs text-white/55">期待明年春晚再相见</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MintPagePoster;
