import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  targetTime: number; // Unix timestamp in milliseconds
  compact?: boolean;
  simple?: boolean; // 更小更简单的一行版
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetTime, compact = false, simple = false }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setIsTimeUp(true);
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    // 立即更新一次
    updateCountdown();

    // 每秒更新
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  if (isTimeUp) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-8"
      >
        <div className="text-4xl font-bold text-green-400 mb-2">🎉</div>
        <p className="text-xl font-semibold text-green-400">Mint已开启！</p>
        <p className="text-gray-300">立即获取您的春节纪念徽章</p>
      </motion.div>
    );
  }

  const timeUnits = [
    { value: timeRemaining.days, label: '天', key: 'days' },
    { value: timeRemaining.hours, label: '时', key: 'hours' },
    { value: timeRemaining.minutes, label: '分', key: 'minutes' },
    { value: timeRemaining.seconds, label: '秒', key: 'seconds' },
  ];

  if (simple) {
    const txt = `${String(timeRemaining.days).padStart(2, '0')}天 ${String(timeRemaining.hours).padStart(2, '0')}时 ${String(timeRemaining.minutes).padStart(2, '0')}分 ${String(timeRemaining.seconds).padStart(2, '0')}秒`;
    return (
      <div className="relative overflow-hidden rounded-lg border border-yellow-200/14 bg-black/22 backdrop-blur-xl px-3 py-2 text-center shadow-[0_14px_55px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute -inset-10 opacity-45 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,120,0.16),rgba(255,255,255,0)_55%)]" />
        <div className="pointer-events-none absolute -inset-10 opacity-30 bg-[radial-gradient(circle_at_70%_80%,rgba(255,60,120,0.10),rgba(255,255,255,0)_60%)]" />
        <span className="relative z-10 text-xs lg:text-sm font-semibold tracking-wide text-white/92">{txt}</span>
      </div>
    );
  }


  const boxClass = compact
    ? "rounded-xl px-3 py-2 border border-yellow-200/18 bg-black/25 backdrop-blur-xl shadow-[0_18px_70px_rgba(0,0,0,0.55)]"
    : "bg-gradient-to-br from-red-500/20 to-yellow-500/20 backdrop-blur-md rounded-lg p-4 border border-white/20";

  const numClass = compact
    ? "text-xl lg:text-2xl font-bold text-white"
    : "text-2xl lg:text-3xl font-bold text-white mb-1";

  const labelClass = compact ? "text-[11px] text-white/70" : "text-sm text-gray-300 font-medium";

  return (
    <div className={compact ? "grid grid-cols-4 gap-2" : "grid grid-cols-4 gap-4"}>
      {timeUnits.map((unit, index) => (
        <motion.div
          key={unit.key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
          className={"text-center relative overflow-hidden " + boxClass}
        >
          {/* 霓虹内发光 */}
          {compact && (
            <>
              <div className="pointer-events-none absolute -inset-10 opacity-60 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,120,0.22),rgba(255,255,255,0)_55%)]" />
              <div className="pointer-events-none absolute -inset-10 opacity-40 bg-[radial-gradient(circle_at_70%_80%,rgba(255,60,120,0.12),rgba(255,255,255,0)_60%)]" />
            </>
          )}

          <motion.div
            key={unit.value}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.18 }}
            className={"relative z-10 " + numClass}
          >
            {String(unit.value).padStart(2, '0')}
          </motion.div>
          <div className={"relative z-10 " + labelClass}>{unit.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default CountdownTimer;