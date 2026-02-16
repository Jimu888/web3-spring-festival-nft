import { drawTextWarped } from './warp.js'
import { drawTextWarpedWebGL } from './webgl_warp.js?v=20260215_0517'

const canvas = document.getElementById('c')
const ctx = canvas.getContext('2d', { alpha: true })
ctx.imageSmoothingEnabled = true
ctx.imageSmoothingQuality = 'high'

const nameInput = document.getElementById('nameInput')
const titleInput = document.getElementById('titleInput')
const btnDownload = document.getElementById('btnDownload')

// Template buttons
const tplP = document.getElementById('tplP')
const tplHeYue = document.getElementById('tplHeYue')
const tplZuiLu = document.getElementById('tplZuiLu')
const tplEWei = document.getElementById('tplEWei')

const LS_TPL = 'poster_tpl_selected_v1'

// --- Improved Preview clarity ---
// Use consistent DPR handling and better scaling
const DPR = Math.max(1, window.devicePixelRatio || 1)
const PREVIEW_CSS_W = 380
const PREVIEW_ASPECT = 1280 / 720  // height/width ratio

// Set canvas to physical pixels for crisp rendering
canvas.width = Math.round(PREVIEW_CSS_W * DPR)
canvas.height = Math.round(PREVIEW_CSS_W * PREVIEW_ASPECT * DPR)

// Set CSS size
canvas.style.width = PREVIEW_CSS_W + 'px'
canvas.style.height = Math.round(PREVIEW_CSS_W * PREVIEW_ASPECT) + 'px'

// Scale context to work in logical pixels
ctx.scale(DPR, DPR)

function clampName(s){
  s = (s ?? '').toString().trim()
  if(!s) return '几木'
  return s
}

const FONT_STACK = '"DingTalk JinBuTi","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",sans-serif'

// Keep the tuned quad if it exists from earlier iterations on this machine.
const LEGACY_KEY = 'poster_P_xform_v1'
function loadLegacy(){
  try{ return JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null') }catch(e){ return null }
}
const LEGACY = loadLegacy()

// Fixed and optimized NAME_QUAD_GLOBAL coordinates
const NAME_QUAD_GLOBAL = (LEGACY && LEGACY.nameQuad) ? LEGACY.nameQuad : {
  p00:{x:270, y:800},  // slightly adjusted for better centering
  p10:{x:400, y:793},  // slightly adjusted for better centering
  p11:{x:415, y:920},  // slightly adjusted for better centering
  p01:{x:255, y:929},  // slightly adjusted for better centering
}

// Fixed template configurations with better salute anchor positions
const TEMPLATES = {
  p: {
    id: 'p',
    label: 'P小将',
    posterUrl: './assets/poster_p.jpg',
    saluteAnchor: (LEGACY && LEGACY.saluteAnchor) ? LEGACY.saluteAnchor : { x: 502, y: 440 },  // slightly adjusted
  },
  heYue: {
    id: 'heYue',
    label: '合约玩家',
    posterUrl: './assets/poster_he_yue_wan_jia.jpg',
    saluteAnchor: { x: 478, y: 562 },  // slightly adjusted
  },
  zuiLu: {
    id: 'zuiLu',
    label: '嘴撸玩家',
    posterUrl: './assets/poster_zu_lu_wan_jia.jpg',
    saluteAnchor: { x: 495, y: 518 },  // slightly adjusted
  },
  eWei: {
    id: 'eWei',
    label: 'E卫兵',
    posterUrl: './assets/poster_e_wei_bing.jpg',
    saluteAnchor: { x: 478, y: 572 },  // slightly adjusted
  },
}

let currentTpl = TEMPLATES.p

function setTpl(id){
  currentTpl = TEMPLATES[id] || TEMPLATES.p
  try{ localStorage.setItem(LS_TPL, currentTpl.id) }catch(e){}

  ;[tplP, tplHeYue, tplZuiLu, tplEWei].forEach(el=>{ if(el) el.setAttribute('aria-current','false') })
  if(currentTpl.id === 'p') tplP?.setAttribute('aria-current','page')
  if(currentTpl.id === 'heYue') tplHeYue?.setAttribute('aria-current','page')
  if(currentTpl.id === 'zuiLu') tplZuiLu?.setAttribute('aria-current','page')
  if(currentTpl.id === 'eWei') tplEWei?.setAttribute('aria-current','page')

  baseImg.src = currentTpl.posterUrl + '?v=' + Date.now()
}

function initTpl(){
  try{
    const saved = localStorage.getItem(LS_TPL)
    if(saved && TEMPLATES[saved]) currentTpl = TEMPLATES[saved]
  }catch(e){}
  setTpl(currentTpl.id)
}

function dist(a,b){
  const dx = (a.x-b.x)
  const dy = (a.y-b.y)
  return Math.hypot(dx,dy)
}

function fitFontSize(text, maxW, maxH, start=56, min=14){
  let size = start
  while(size >= min){
    ctx.font = `normal 900 ${size}px ${FONT_STACK}`
    const m = ctx.measureText(text)
    const visW = ((m.actualBoundingBoxLeft ?? 0) + (m.actualBoundingBoxRight ?? m.width))
    const w = (visW && visW > 0) ? visW : m.width
    const h = (m.actualBoundingBoxAscent || size*0.75) + (m.actualBoundingBoxDescent || size*0.25)
    if(w <= maxW && h <= maxH) return size
    size -= 2
  }
  return min
}

const baseImg = new Image()
baseImg.crossOrigin = 'anonymous'

function renderTo(targetCtx, scale){
  if(!baseImg.complete) return

  const dstW = Math.round(720 * scale)
  const dstH = Math.round(1280 * scale)
  
  targetCtx.save()
  targetCtx.setTransform(1,0,0,1,0,0)
  targetCtx.clearRect(0,0,dstW,dstH)
  
  // Enable high-quality image smoothing
  targetCtx.imageSmoothingEnabled = true
  targetCtx.imageSmoothingQuality = 'high'
  
  targetCtx.drawImage(baseImg, 0,0, dstW, dstH)

  const name = clampName(nameInput.value)
  const title = titleInput.value || '先生'

  // Right-side salute with improved positioning
  targetCtx.save()
  targetCtx.fillStyle = 'rgba(255,255,255,.95)'  // slightly more opaque
  targetCtx.font = `normal 800 ${Math.round(22*scale)}px ${FONT_STACK}`  // slightly larger
  targetCtx.fillText(`致敬 ${name} ${title}`, Math.round(currentTpl.saluteAnchor.x*scale), Math.round(currentTpl.saluteAnchor.y*scale))
  targetCtx.restore()

  // Trophy name with improved calculations
  const quad720 = NAME_QUAD_GLOBAL
  const quadW = Math.max(dist(quad720.p00, quad720.p10), dist(quad720.p01, quad720.p11))
  const quadH = Math.max(dist(quad720.p00, quad720.p01), dist(quad720.p10, quad720.p11))

  const SAFE_W = (name.length <= 4) ? 0.98 : (name.length <= 6 ? 0.98 : (name.length <= 14 ? 1.03 : 1.00))
  const padBase = (name.length >= 10) ? 6 : 12  // improved padding
  const padExtra = Math.max(0, (name.length - 12)) * 1
  const pad = Math.min(32, padBase + padExtra)

  const maxGlyphW = Math.max(60, (quadW * SAFE_W) - pad*2)
  const maxGlyphH = Math.max(18, (quadH * 0.92) - pad*2)

  const scaleX = (name.length >= 10) ? 1.10 : (name.length >= 6 ? 1.06 : (name.length >= 3 ? 1.12 : 1.0))
  const size = fitFontSize(name, maxGlyphW, maxGlyphH, 60, 14)
  const font = `normal 900 ${Math.round(size*scale)}px ${FONT_STACK}`

  const NUDGE_X = 10  // slightly adjusted
  const quad = {
    p00:{x: (quad720.p00.x + NUDGE_X)*scale, y: quad720.p00.y*scale},
    p10:{x: (quad720.p10.x + NUDGE_X)*scale, y: quad720.p10.y*scale},
    p11:{x: (quad720.p11.x + NUDGE_X)*scale, y: quad720.p11.y*scale},
    p01:{x: (quad720.p01.x + NUDGE_X)*scale, y: quad720.p01.y*scale},
  }

  let ok = false
  try{
    ok = drawTextWarpedWebGL(targetCtx, {
      text: name,
      font,
      fillStyle: '#D4AF55',
      padding: Math.round(pad*scale),
      scaleX,
      quad,
      dstW,
      dstH,
      renderScale: 8,  // increased for better quality
    })
  }catch(e){ 
    console.log('WebGL fallback:', e)
    ok = false 
  }

  if(!ok){
    drawTextWarped(targetCtx, {
      text: name,
      font,
      fillStyle: '#D4AF55',
      padding: Math.round(pad*scale),
      blur: 0,
      shadow: {dx:0, dy:0, color:'rgba(0,0,0,0)'},
      highlight: {dx:0, dy:0, color:'rgba(255,255,255,0)'},
      quad,
      meshX: 30,  // increased mesh density
      meshY: 16,  // increased mesh density
      renderScale: 8,  // increased for better quality
    })
  }
  
  targetCtx.restore()
}

// Improved preview rendering with consistent scaling
function renderPreview(){
  const logicalScale = PREVIEW_CSS_W / 720
  renderTo(ctx, logicalScale)
}

function getExportScale(){
  const nw = baseImg.naturalWidth || 720
  return nw / 720
}

async function download(){
  const scale = getExportScale()
  const out = document.createElement('canvas')
  out.width = Math.round(720 * scale)
  out.height = Math.round(1280 * scale)
  const octx = out.getContext('2d', { alpha: true })
  octx.imageSmoothingEnabled = true
  octx.imageSmoothingQuality = 'high'
  renderTo(octx, scale)

  const a = document.createElement('a')
  a.download = `poster_${currentTpl.id}_${out.width}x${out.height}_${Date.now()}.png`
  a.href = out.toDataURL('image/png', 1.0)  // max quality
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// Event listeners
nameInput.addEventListener('input', ()=>{ window.clearTimeout(window.__t); window.__t=setTimeout(renderPreview, 120) })
titleInput.addEventListener('change', renderPreview)
btnDownload.addEventListener('click', download)

tplP?.addEventListener('click', ()=> setTpl('p'))
tplHeYue?.addEventListener('click', ()=> setTpl('heYue'))
tplZuiLu?.addEventListener('click', ()=> setTpl('zuiLu'))
tplEWei?.addEventListener('click', ()=> setTpl('eWei'))

baseImg.onload = renderPreview
initTpl()

// Debug info
console.log('Poster generator initialized')
console.log('DPR:', DPR)
console.log('Canvas size:', canvas.width, 'x', canvas.height)
console.log('CSS size:', canvas.style.width, 'x', canvas.style.height)