import React from 'react';
import { Toaster } from 'react-hot-toast';
import MintPageMock from './components/MintPageMock';
import FireworksOverlay from './components/FireworksOverlay';
import './index.css';

// 纯色渐变“暗黑高级”背景（备份方案）
export default function AppPure() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070A12] via-[#1A0B2E] to-[#060311]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(255,215,0,0.12),rgba(0,0,0,0)_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,30,80,0.12),rgba(0,0,0,0)_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.18),rgba(0,0,0,0)_60%)]" />
      </div>

      <FireworksOverlay />

      <div className="relative z-10">
        <MintPageMock />
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
