import React, { useMemo, useState } from 'react';
import AppStreet from './AppStreet';
import AppPure from './AppPure';

// theme=street|pure （方便两套风格快速切换）
export default function App() {
  const theme = useMemo(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('theme');
      if (q === 'pure' || q === 'street') return q;
      const ls = localStorage.getItem('sf_theme');
      if (ls === 'pure' || ls === 'street') return ls;
    } catch {}
    return 'street' as const;
  }, []);

  return theme === 'pure' ? <AppPure /> : <AppStreet />;
}
