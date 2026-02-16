import React from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiConfig } from 'wagmi'
import App from './App.tsx'
import { wagmiConfig } from './lib/web3Config'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <App />
    </WagmiConfig>
  </React.StrictMode>,
)
