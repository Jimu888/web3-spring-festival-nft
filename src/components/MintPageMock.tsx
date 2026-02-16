import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Clock, Sparkles, Gift, Users, Calendar, Wallet } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import NFTPreview from './NFTPreview';
import AckModal, { hasAcked } from './AckModal';

// 纯UI演示版：用于快速确认风格（不依赖钱包/合约）
const MintPageMock: React.FC = () => {
  const mintStartTimestamp = useMemo(() => {
    // 2026-02-16 20:26 (GMT+8)
    return new Date('2026-02-16T20:26:00+08:00').getTime();
  }, []);

  const mintEndTimestamp = useMemo(() => {
    // 农历正月十六 0点（北京时间）
    // 2026年春节（正月初一）为 2026-02-17，据此正月十六为 2026-03-04 00:00
    return new Date('2026-03-04T00:00:00+08:00').getTime();
  }, []);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const isMintStarted = now >= mintStartTimestamp;
  const isMintEnded = now >= mintEndTimestamp;

  // demo data
  const totalSupply = 26;
  const remainingSupply = 2026 - totalSupply;
  const userMintCount = 0;

  // （不折叠长文）

  const [ackOpen, setAckOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'connect' | 'mint'>('connect');

  const runAction = (action: 'connect' | 'mint') => {
    if (action === 'connect') toast('（演示版）这里将是连接钱包按钮', { icon: '🔌' });
    if (action === 'mint') toast.success('（演示版）点击Mint的动效/按钮状态 OK！');
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
    <div className="min-h-screen flex flex-col">
      <AckModal
        open={ackOpen}
        onClose={() => setAckOpen(false)}
        onConfirm={() => {
          setAckOpen(false);
          runAction(pendingAction);
        }}
      />
      <nav className="flex justify-between items-center p-6 backdrop-blur-sm bg-black/20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-yellow-300/20 shadow-[0_0_25px_rgba(255,215,0,0.18)]">
            <img src="/nft-preview.jpg" alt="Badge Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Web3春节联欢晚会</h1>
            <p className="text-sm text-gray-300">2026纪念徽章 NFT</p>
          </div>
        </motion.div>

        <button
          onClick={() => requestAckThen('connect')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md"
        >
          <Wallet className="w-4 h-4" />
          连接钱包
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-6">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="flex justify-center">
            <NFTPreview />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="space-y-5">
            <div className="text-center lg:text-left relative">
              {/* 春晚氛围装饰：灯笼/金粉（去掉烟花星星，避免廉价感） */}
              <div className="pointer-events-none absolute -top-10 -left-6 text-5xl opacity-70 lantern-swing">🏮</div>

              <h2 className="title-serif text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
                <span className="bg-gradient-to-r from-red-300 via-yellow-200 to-red-400 bg-clip-text text-transparent">丙午马年</span>
                <span className="ml-3 inline-flex items-center rounded-full border border-yellow-400/20 bg-yellow-200/5 px-3 py-1 text-xs font-medium text-yellow-200/90">春晚限定</span>
              </h2>

              <h3 className="title-serif text-xl lg:text-2xl font-semibold bg-gradient-to-r from-yellow-200 to-red-300 bg-clip-text text-transparent mb-4">
                Web3春节联欢晚会纪念徽章
              </h3>

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
                <div className="absolute -inset-10 opacity-25 bg-[radial-gradient(circle_at_20%_30%,rgba(255,215,0,0.28),rgba(255,255,255,0)_60%)]" />
                <div className="absolute -inset-10 opacity-20 bg-[radial-gradient(circle_at_85%_60%,rgba(255,30,80,0.25),rgba(255,255,255,0)_60%)]" />

                <div className="relative z-10 text-sm lg:text-[15px] text-gray-200/90 leading-relaxed space-y-3">
                  <p><strong className="text-yellow-200">起于2026，马不停蹄。</strong></p>

                  <p>感谢AI时代的馈赠，让我得以用一己之力，‘手搓’出这第一届Web3春晚。这枚NFT，不仅是新春的纪念，更是我们在这条数字洪流中相遇的信物。</p>
                  <p>我许下一个愿望：从今年起，每一个春节，我们都在春晚相聚。</p>
                  <p>12年，是一个生肖的轮回。在代码与算法飞速更迭的世界里，万物皆流，变幻莫测。如果我们有缘，能携手走完这一个轮回，集齐12枚徽章的时刻，或许我们召唤的不止是神龙，更是这一段属于我们共同跨越周期的、闪闪发光的岁月。</p>
                  <p>感谢你，成为这漫长旅程的第一位见证者。</p>
                  <p>新春快乐，在这个奔腾的马年，祝你拥有跨越一切不确定的勇气与好运。</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">已铸造</span>
                </div>
                <p className="text-2xl font-bold text-white">{totalSupply} / 2026</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Gift className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">剩余数量</span>
                </div>
                <p className="text-2xl font-bold text-white">{remainingSupply}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* 倒计时 */}
              {!isMintStarted && !isMintEnded && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300 font-medium">Free Mint开启倒计时</span>
                  </div>
                  <CountdownTimer targetTime={mintStartTimestamp} />
                </div>
              )}

              {/* Mint按钮（始终展示：未开始/进行中/已结束 3种状态） */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: isMintStarted && !isMintEnded ? 1.01 : 1 }}
                  whileTap={{ scale: isMintStarted && !isMintEnded ? 0.99 : 1 }}
                  onClick={isMintStarted && !isMintEnded ? () => requestAckThen('mint') : undefined}
                  disabled={!isMintStarted || isMintEnded}
                  className={
                    "w-full py-3.5 px-7 rounded-2xl font-semibold text-base transition-all duration-300 " +
                    (!isMintStarted || isMintEnded
                      ? "bg-white/5 text-gray-300/80 border border-white/10 cursor-not-allowed shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
                      : "bg-gradient-to-r from-red-500/90 via-yellow-400/90 to-red-500/90 text-white border border-yellow-200/20 shadow-[0_25px_90px_rgba(0,0,0,0.55)] hover:shadow-[0_30px_120px_rgba(0,0,0,0.65)] ring-1 ring-yellow-200/10")
                  }
                >
                  <span className={isMintStarted && !isMintEnded ? "drop-shadow-[0_2px_18px_rgba(255,215,0,0.25)]" : ""}>
                    {isMintEnded ? 'Mint已结束 · 未mint完已销毁' : !isMintStarted ? 'Mint尚未开始' : '🧧 Free Mint 领取徽章'}
                  </span>
                </motion.button>

                <div className="mt-2 space-y-1 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>开始：2026年2月16日 20:26 (北京时间)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>结束：2026年3月4日 00:00 (北京时间) · 未mint完将销毁</span>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-400">本NFT仅作为“2026Web3春晚”的数字纪念凭证，无任何投资价值。</div>
              </div>
            </div>

            {/* 徽章特色板块已移除（按几木要求） */}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-10 text-center text-gray-400 max-w-2xl">
          <p className="mb-2">由 <span className="text-yellow-300 font-medium">几木 @0xjimumu</span> 创作</p>
          <p className="text-sm">期待明年春晚再相见</p>
        </motion.div>
      </main>
    </div>
  );
};

export default MintPageMock;