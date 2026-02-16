import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Download, Share2, Copy, RefreshCw, Users } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────
interface Point { x: number; y: number }
interface Quad { p00: Point; p10: Point; p11: Point; p01: Point }
interface Template {
  id: string;
  name: string;
  image: string;
  saluteAnchor: Point;
}

// ─── Constants ───────────────────────────────────────────────────────
// Original poster images are 1440×2194.
// We use a half-size coordinate system: 720×1097.
const BASE_W = 720;
const BASE_H = 1097;

const FONT_STACK =
  '"DingTalk JinBuTi","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",sans-serif';

// All coordinates below are in 720×1097 base.
const TEMPLATES: Template[] = [
  { id: 'p',      name: 'P小将',   image: '/assets/poster_p.jpg',              saluteAnchor: { x: 466, y: 349 } },
  { id: 'zuiLu',  name: '嘴撸玩家', image: '/assets/poster_zu_lu_wan_jia.jpg', saluteAnchor: { x: 466, y: 349 } },
  { id: 'heYue',  name: '合约玩家', image: '/assets/poster_he_yue_wan_jia.jpg', saluteAnchor: { x: 466, y: 349 } },
  { id: 'eWei',   name: 'E卫兵',   image: '/assets/poster_e_wei_bing.jpg',      saluteAnchor: { x: 472, y: 417 } },
];

// Trophy name-plate quad (trapezoid with perspective) in 720×1097 coords.
const NAME_QUAD: Quad = {
  p00: { x: 203, y: 602 },   // top-left
  p10: { x: 323, y: 596 },   // top-right
  p11: { x: 338, y: 697 },   // bottom-right
  p01: { x: 188, y: 704 },   // bottom-left
};

// Small rightward nudge so text sits centred on the plate
const NUDGE_X = 8;

// Twitter share text templates
const SHARE_TEXTS = [
  '刚看完「2026年Web3春节联欢晚会」，本来是去抢红包凑热闹的，结果被颁奖环节扎心了，句句让我破防\ud83d\ude02',
  '呵呵，2026年Web3春节联欢晚会的年度扎心总结，我真的会谢。',
  '？？？写颁奖词的人应该枪毙。尤其是晚会里完整版颁奖词，我听了想刀人。',
  '有了AI，一个人就可以做一台春晚，太强了。有唱跳、有舞蹈、有脱口秀，有互动有抽奖甚至还有广告，这很春晚了，我最爱舞蹈，艺术含量极高',
  '红包没有抢到，先被晚会发的海报羞辱了一顿。写脱口秀和这颁奖词的老师，你晚上最好睁着眼睛睡觉\uff1a)',
  '看了那个币圈春晚的颁奖。别骂了别骂了……大过年的',
  '得在币圈亏多少钱才能弄出这么狠的春晚啊',
  '？？？中本聪都出来了，认真的吗',
  '太搞笑了，这个春晚笑着笑着就哭了',
];

// Font-size & scale params per character count.
// The plate is ~120px wide at base scale. Sizes are chosen so that
// even long English names remain clearly readable after scaling.
function getOptimalParams(charCount: number) {
  if (charCount <= 2) return { fontSize: 36, scaleX: 1.0, scaleY: 1.0 };
  if (charCount === 3) return { fontSize: 30, scaleX: 1.0, scaleY: 1.0 };
  if (charCount === 4) return { fontSize: 26, scaleX: 0.95, scaleY: 1.0 };
  if (charCount <= 6)  return { fontSize: 24, scaleX: 0.9, scaleY: 1.0 };
  if (charCount <= 9)  return { fontSize: 22, scaleX: 0.85, scaleY: 0.95 };
  if (charCount <= 13) return { fontSize: 20, scaleX: 0.8, scaleY: 0.95 };
  return                       { fontSize: 18, scaleX: 0.75, scaleY: 0.9 };
}

// ─── Trophy name drawing (simple affine, no mesh artifacts) ──────────

function drawTrophyName(
  ctx: CanvasRenderingContext2D,
  text: string,
  scale: number,
) {
  const params = getOptimalParams(text.length);
  const font = `normal 900 ${Math.round(params.fontSize * scale)}px ${FONT_STACK}`;

  // Quad corners (with nudge) in canvas coords
  const p00 = { x: (NAME_QUAD.p00.x + NUDGE_X) * scale, y: NAME_QUAD.p00.y * scale };
  const p10 = { x: (NAME_QUAD.p10.x + NUDGE_X) * scale, y: NAME_QUAD.p10.y * scale };
  const p01 = { x: (NAME_QUAD.p01.x + NUDGE_X) * scale, y: NAME_QUAD.p01.y * scale };
  const p11 = { x: (NAME_QUAD.p11.x + NUDGE_X) * scale, y: NAME_QUAD.p11.y * scale };

  // Centre of the quad
  const cx = (p00.x + p10.x + p11.x + p01.x) / 4;
  const cy = (p00.y + p10.y + p11.y + p01.y) / 4;

  // Slight rotation to match the plate tilt
  const topAngle = Math.atan2(p10.y - p00.y, p10.x - p00.x);
  const botAngle = Math.atan2(p11.y - p01.y, p11.x - p01.x);
  const angle = (topAngle + botAngle) / 2;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Clip to the quad so text doesn't bleed outside the plate
  ctx.beginPath();
  ctx.moveTo(p00.x, p00.y);
  ctx.lineTo(p10.x, p10.y);
  ctx.lineTo(p11.x, p11.y);
  ctx.lineTo(p01.x, p01.y);
  ctx.closePath();
  ctx.clip();

  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.scale(params.scaleX, params.scaleY);

  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#D4AF55';
  ctx.fillText(text, 0, 0);

  ctx.restore();
}

// Draw the salute line ("XX 先生:") on the right side of the poster.
function drawSaluteText(
  ctx: CanvasRenderingContext2D,
  text: string,
  titleText: string,
  anchor: Point,
  scale: number,
) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.font = `normal 800 ${Math.round(20 * scale)}px ${FONT_STACK}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const saluteStr = titleText ? `${text} ${titleText}:` : `${text}:`;
  ctx.fillText(
    saluteStr,
    Math.round(anchor.x * scale),
    Math.round(anchor.y * scale),
  );
  ctx.restore();
}

// ─── Counter (localStorage) ─────────────────────────────────────────

function getCounterKey(templateId: string) {
  return `poster_count_${templateId}`;
}

function getCount(templateId: string): number {
  try {
    return parseInt(localStorage.getItem(getCounterKey(templateId)) || '0', 10) || 0;
  } catch { return 0; }
}

function incrementCount(templateId: string): number {
  const next = getCount(templateId) + 1;
  try { localStorage.setItem(getCounterKey(templateId), String(next)); } catch {}
  return next;
}

// ─── Component ───────────────────────────────────────────────────────

const PosterGeneratorPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  const [posterImage, setPosterImage] = useState<HTMLImageElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [shareTextIdx, setShareTextIdx] = useState(
    () => Math.floor(Math.random() * SHARE_TEXTS.length),
  );
  const [counter, setCounter] = useState(() => getCount(TEMPLATES[0].id));

  const dpr = typeof window !== 'undefined' ? Math.max(1, window.devicePixelRatio || 1) : 1;

  // Refresh counter when template changes
  useEffect(() => {
    setCounter(getCount(selectedTemplate.id));
  }, [selectedTemplate]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedTemplate.image;
    img.onload = () => setPosterImage(img);
    img.onerror = () => toast.error(`加载图片失败: ${selectedTemplate.name}`);
  }, [selectedTemplate]);

  const renderTo = useCallback(
    (targetCtx: CanvasRenderingContext2D, baseImg: HTMLImageElement, scale: number) => {
      const dstW = Math.round(BASE_W * scale);
      const dstH = Math.round(BASE_H * scale);
      targetCtx.setTransform(1, 0, 0, 1, 0, 0);
      targetCtx.clearRect(0, 0, dstW, dstH);
      targetCtx.drawImage(baseImg, 0, 0, dstW, dstH);
      const displayName = (name || '').trim() || '几木';
      drawTrophyName(targetCtx, displayName, scale);
      drawSaluteText(targetCtx, displayName, title, selectedTemplate.saluteAnchor, scale);
    },
    [name, title, selectedTemplate],
  );

  useEffect(() => {
    if (!canvasRef.current || !posterImage) return;
    const canvasW = Math.round(BASE_W * dpr);
    const canvasH = Math.round(BASE_H * dpr);
    canvasRef.current.width = canvasW;
    canvasRef.current.height = canvasH;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    setIsRendering(true);
    try { renderTo(ctx, posterImage, dpr); } catch (err) { console.error('render failed', err); }
    setIsRendering(false);
  }, [name, title, selectedTemplate, posterImage, renderTo, dpr]);

  const handleDownload = useCallback(async () => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedTemplate.image;
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; });
      const exportScale = 2;
      const hires = document.createElement('canvas');
      hires.width = Math.round(BASE_W * exportScale);
      hires.height = Math.round(BASE_H * exportScale);
      const ctx = hires.getContext('2d');
      if (!ctx) throw new Error('canvas ctx');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      renderTo(ctx, img, exportScale);
      const a = document.createElement('a');
      a.download = `Web3春晚-${name.trim() || '几木'}-${selectedTemplate.name}.png`;
      a.href = hires.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      a.remove();
      const n = incrementCount(selectedTemplate.id);
      setCounter(n);
      toast.success('海报已保存！');
    } catch { toast.error('保存失败，请重试'); }
  }, [name, title, selectedTemplate, renderTo]);

  const handleCopyImage = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) { toast.error('无法生成图片'); return; }
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          toast.success('海报已复制到剪贴板');
        } catch {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Web3春晚-${name.trim() || '几木'}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast('已下载图片');
        }
      });
    } catch { toast.error('操作失败'); }
  }, [name]);

  const handleShareToTwitter = useCallback(() => {
    const text = encodeURIComponent(SHARE_TEXTS[shareTextIdx]);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    handleCopyImage();
    const n = incrementCount(selectedTemplate.id);
    setCounter(n);
  }, [shareTextIdx, handleCopyImage, selectedTemplate]);

  return (
    <div className="min-h-screen min-h-[100dvh] pb-[env(safe-area-inset-bottom)]">
      {/* Nav — compact on mobile */}
      <div className="px-3 sm:px-6 pt-3 sm:pt-4 flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden ring-1 ring-yellow-300/20 shrink-0">
          <img src="/nft-preview.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="text-xs sm:text-sm min-w-0">
          <span className="text-white/90 font-medium">Web3春节联欢晚会</span>
          <span className="text-white/40 mx-1 sm:mx-1.5">/</span>
          <span className="text-white/50">奖杯海报领取</span>
        </div>
        <a
          href="/?theme=street"
          className="ml-auto px-2.5 sm:px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white/90 hover:bg-white/10 text-[11px] sm:text-xs transition-colors whitespace-nowrap shrink-0"
        >
          春晚纪念徽章Free Mint
        </a>
      </div>

      {/* Main content */}
      <div className="px-3 sm:px-6 pb-6 sm:pb-8 pt-3 sm:pt-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[960px] mx-auto"
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-0">

            {/* Left: poster preview — full-width on mobile, centered */}
            <div className="flex-1 flex flex-col items-center lg:items-end">
              <canvas
                ref={canvasRef}
                className="rounded-xl lg:rounded-r-none sm:rounded-2xl lg:rounded-r-none shadow-[0_12px_40px_rgba(0,0,0,0.5)] sm:shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  height: 'auto',
                  aspectRatio: `${BASE_W} / ${BASE_H}`,
                }}
              />
            </div>

            {/* Right: controls panel — attached to poster on desktop */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-3 sm:space-y-4 lg:pt-0">

              {/* Settings card — no left border-radius on desktop to connect with poster */}
              <div className="rounded-xl sm:rounded-2xl lg:rounded-l-none border border-white/8 lg:border-l-0 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-5 space-y-4 sm:space-y-5">

                {/* Heading */}
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white/90">生成你的奖杯</h2>
                  <p className="text-[11px] sm:text-xs text-white/40 mt-0.5 sm:mt-1 leading-relaxed">
                    加密的旅途常常独自跋涉，但今夜我们并肩狂欢
                  </p>
                </div>

                {/* Name input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] sm:text-xs text-white/50 font-medium uppercase tracking-wider">昵称</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={18}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="几木"
                      className="flex-1 min-w-0 px-3 py-2.5 sm:py-2 rounded-lg border border-white/12 text-white text-sm placeholder-white/30 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20 transition-all"
                      style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: '16px' }}
                    />
                    <select
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-20 px-2 py-2.5 sm:py-2 rounded-lg border border-white/12 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors"
                      style={{ background: 'rgba(0,0,0,0.45)', colorScheme: 'dark' }}
                    >
                      <option value="" className="bg-gray-800 text-white">无</option>
                      <option value="先生" className="bg-gray-800 text-white">先生</option>
                      <option value="女士" className="bg-gray-800 text-white">女士</option>
                    </select>
                  </div>
                </div>

                {/* Template picker — 2×2 grid on very small screens, inline row otherwise */}
                <div className="space-y-1.5">
                  <label className="text-[11px] sm:text-xs text-white/50 font-medium tracking-wider">选择你的身份</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl)}
                        className={
                          'py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ' +
                          (selectedTemplate.id === tpl.id
                            ? 'bg-white/15 text-white border border-white/20'
                            : 'bg-white/5 text-white/45 border border-transparent hover:text-white/70')
                        }
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Share text card — also attached to poster on desktop */}
              <div className="rounded-xl sm:rounded-2xl lg:rounded-l-none border border-white/8 lg:border-l-0 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] sm:text-xs text-white/50 font-medium uppercase tracking-wider">文案参考</label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setShareTextIdx((i) => (i + 1) % SHARE_TEXTS.length)}
                      className="p-1.5 sm:p-1 rounded-md hover:bg-white/10 active:bg-white/15 text-white/35 hover:text-white/60 transition-colors"
                      title="换一条"
                    >
                      <RefreshCw className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(SHARE_TEXTS[shareTextIdx]);
                          toast.success('已复制文案');
                        } catch { toast.error('复制失败'); }
                      }}
                      className="p-1.5 sm:p-1 rounded-md hover:bg-white/10 active:bg-white/15 text-white/35 hover:text-white/60 transition-colors"
                      title="复制"
                    >
                      <Copy className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[13px] sm:text-[12px] text-white/60 leading-relaxed">
                  {SHARE_TEXTS[shareTextIdx]}
                </p>
                <p className="text-[11px] sm:text-[10px] text-white/25">
                  点击「发推分享」会自动打开推特并携带文案
                </p>

                {/* Action buttons — taller touch targets on mobile */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleDownload}
                    disabled={isRendering}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 sm:py-2.5 rounded-xl bg-white/10 border border-white/10 text-white/80 hover:bg-white/15 active:bg-white/20 text-sm font-medium transition-colors disabled:opacity-40"
                  >
                    <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    保存海报
                  </button>
                  <button
                    onClick={handleShareToTwitter}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 sm:py-2.5 rounded-xl bg-[rgba(29,155,240,0.25)] border border-[rgba(29,155,240,0.3)] text-[#1d9bf0] hover:bg-[rgba(29,155,240,0.35)] active:bg-[rgba(29,155,240,0.45)] text-sm font-medium transition-colors"
                  >
                    <Share2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    发推分享
                  </button>
                </div>
              </div>

              {/* Counter badge */}
              {counter > 0 && (
                <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-400/15 bg-amber-400/[0.04]">
                  <Users className="w-3.5 h-3.5 text-amber-400/60" />
                  <span className="text-[12px] sm:text-[12px] text-amber-400/70">
                    你是第 <span className="font-bold text-amber-400">{counter}</span> 位{selectedTemplate.name}
                  </span>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PosterGeneratorPage;
