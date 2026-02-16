import React, { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

// 轻量“烟花爆开”效果：点击空白处触发（金/红霓虹，克制不廉价）
const FireworksOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const ps = particlesRef.current;
      if (ps.length === 0) return;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += 1;
        const t = p.life / p.maxLife;

        // ease-out
        const drag = 0.985;
        p.vx *= drag;
        p.vy *= drag;
        p.vy += 0.02; // gravity

        p.x += p.vx;
        p.y += p.vy;

        const alpha = 1 - t;
        const s = p.size * (1 - t * 0.6);

        // outer glow
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${alpha * 0.18})`;
        ctx.arc(p.x, p.y, s * 3.2, 0, Math.PI * 2);
        ctx.fill();

        // core
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 95%, 62%, ${alpha * 0.85})`;
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife) ps.splice(i, 1);
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    rafRef.current = requestAnimationFrame(tick);

    const burst = (x: number, y: number) => {
      const count = 34;
      const baseHue = Math.random() < 0.6 ? 45 : 10; // gold/red
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.18;
        const sp = 2.1 + Math.random() * 2.3;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0,
          maxLife: 48 + Math.floor(Math.random() * 18),
          size: 1.2 + Math.random() * 1.4,
          hue: baseHue + (Math.random() - 0.5) * 10,
        });
      }
    };

    const onClick = (e: MouseEvent) => {
      // 只在“空白处”触发：如果点到了按钮/链接/输入等，跳过
      const el = e.target as HTMLElement | null;
      if (el) {
        const interactive = el.closest('button, a, input, textarea, select, [role="button"]');
        if (interactive) return;
      }
      burst(e.clientX, e.clientY);
    };

    window.addEventListener('click', onClick, true);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', onClick, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[5] pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default FireworksOverlay;
