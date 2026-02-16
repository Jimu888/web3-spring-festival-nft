import React, { useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import MintPagePoster from './components/MintPagePoster';
import PosterGeneratorPage from './components/PosterGeneratorPage';
import FireworksOverlay from './components/FireworksOverlay';
import './index.css';

// 街景霓虹春节背景
export default function AppStreet() {
  // 根据域名或URL参数确定显示哪个页面
  const page = useMemo(() => {
    try {
      // 优先检查 URL 参数
      const q = new URLSearchParams(window.location.search).get('page');
      if (q === 'poster') return 'poster';
      
      // 其次检查域名
      const hostname = window.location.hostname;
      if (hostname.includes('2026')) return 'poster';
      if (hostname.includes('mint')) return 'mint';
    } catch {}
    return 'mint' as const;
  }, []);

  const showFireworks = page === 'mint';

  return (
    <div className="min-h-screen bg-[#05030C]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/bg.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,0,0,0.05),rgba(0,0,0,0.90)_72%)]" />
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_25%_20%,rgba(255,80,120,0.18),rgba(255,255,255,0)_55%)]" />
        <div className="absolute inset-0 opacity-55 bg-[radial-gradient(circle_at_75%_25%,rgba(0,200,255,0.14),rgba(255,255,255,0)_55%)]" />
        <div className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_40%_85%,rgba(255,215,0,0.16),rgba(255,255,255,0)_60%)]" />
        <div className="absolute inset-0 backdrop-blur-[2.5px]" />

        {/* 轻噪点质感（高级感关键，不是点阵） */}
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.7%22/%3E%3C/svg%3E')]" />
      </div>

      {showFireworks && <FireworksOverlay />}

      <div className="relative z-10">
        {page === 'poster' ? <PosterGeneratorPage /> : <MintPagePoster />}
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #475569',
          },
        }}
      />
    </div>
  );
}
