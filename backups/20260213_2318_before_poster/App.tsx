import React from 'react';
import { Toaster } from 'react-hot-toast';
import MintPageMock from './components/MintPageMock';
import FireworksOverlay from './components/FireworksOverlay';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-[#05030C]">
      {/* 赛博霓虹春节街景背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 背景图 */}
        <div className="absolute inset-0 bg-[url('/bg.jpg')] bg-cover bg-center" />

        {/* 暗角/聚焦：让中心面板更突出 */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,0,0,0.15),rgba(0,0,0,0.82)_70%)]" />

        {/* 霓虹雾：加强红金与蓝紫的电影感 */}
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_25%_20%,rgba(255,80,120,0.18),rgba(255,255,255,0)_55%)]" />
        <div className="absolute inset-0 opacity-55 bg-[radial-gradient(circle_at_75%_25%,rgba(0,200,255,0.14),rgba(255,255,255,0)_55%)]" />
        <div className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_40%_85%,rgba(255,215,0,0.16),rgba(255,255,255,0)_60%)]" />

        {/* 轻微雾化层：降低背景锐利度，让前景更高级 */}
        <div className="absolute inset-0 backdrop-blur-[1.5px]" />
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
          success: {
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
        }}
      />
    </div>
  );
}

export default App;