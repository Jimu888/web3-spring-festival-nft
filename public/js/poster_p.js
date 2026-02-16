import { drawTextWarped } from './warp.js?v=20260216_0129'
import { drawTextWarpedWebGL } from './webgl_warp.js?v=20260216_0142'

const canvas = document.getElementById('c')
const ctx = canvas.getContext('2d', { alpha: true })
ctx.imageSmoothingEnabled = true
ctx.imageSmoothingQuality = 'high'

const nameInput = document.getElementById('nameInput')
const titleInput = document.getElementById('titleInput')

const btnDownload = document.getElementById('btnDownload')
const btnSaluteUp = document.getElementById('btnSaluteUp')
const btnSaluteDown = document.getElementById('btnSaluteDown')
const btnSaluteLeft = document.getElementById('btnSaluteLeft')
const btnSaluteRight = document.getElementById('btnSaluteRight')
const btnCopyTplCfg = document.getElementById('btnCopyTplCfg')

// Template buttons
const tplP = document.getElementById('tplP')
const tplZuiLu = document.getElementById('tplZuiLu')
const tplEWei = document.getElementById('tplEWei')
const tplHeYue = document.getElementById('tplHeYue')

const LS_TPL = 'poster_tpl_selected_v1'
const LS_TPL_CFG = 'poster_tpl_cfg_v1'
const salutePosEl = document.getElementById('salutePos')
const metricsEl = document.getElementById('metrics')

// 已移除滑块控制，使用固化的最佳参数

// HiDPI preview: keep base coordinate system at 720×1280
const DPR = Math.max(1, window.devicePixelRatio || 1)
canvas.width = Math.round(720 * DPR)
canvas.height = Math.round(1280 * DPR)
canvas.style.width = '380px'
canvas.style.height = 'auto'

function clampName(s){
  s = (s ?? '').toString().trim()
  if(!s) return '几木'
  return s
}

// Embedded font (via @font-face in css)
const FONT_STACK = '"DingTalk JinBuTi","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",sans-serif'

// Global trophy name quad (shared across templates) in 720×1280 coordinates.
// We keep it fixed for end users, but we still honor your previously saved calibration
// (from earlier iterations) so we don't accidentally reset tuned positions.
const LEGACY_KEY = 'poster_P_xform_v1'
function loadLegacy(){
  try{ return JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null') }catch(e){ return null }
}
const LEGACY = loadLegacy()

const NAME_QUAD_GLOBAL = {
  p00:{x:203, y:703},
  p10:{x:323, y:696},
  p11:{x:338, y:813},
  p01:{x:188, y:822},
}

const TEMPLATES = {
  p: {
    id: 'p',
    label: 'P小将',
    posterUrl: './assets/poster_p.jpg',
    saluteAnchor: { x: 468, y: 401 },
  },
  zuiLu: {
    id: 'zuiLu',
    label: '嘴撸玩家',
    posterUrl: './assets/poster_zu_lu_wan_jia.jpg',
    saluteAnchor: { x: 472, y: 401 },
  },
  eWei: {
    id: 'eWei',
    label: 'E卫兵',
    posterUrl: './assets/poster_e_wei_bing.jpg',
    saluteAnchor: { x: 472, y: 487 },
  },
  heYue: {
    id: 'heYue',
    label: '合约玩家',
    posterUrl: './assets/poster_he_yue_wan_jia.jpg',
    saluteAnchor: { x: 466, y: 407 },
  },
}

function loadTplCfg(){
  try{ return JSON.parse(localStorage.getItem(LS_TPL_CFG) || 'null') }catch(e){ return null }
}
function saveTplCfg(cfg){
  try{ localStorage.setItem(LS_TPL_CFG, JSON.stringify(cfg)) }catch(e){}
}
const TPL_CFG = loadTplCfg() || {}

function applyTplOverrides(tpl){
  const o = TPL_CFG[tpl.id]
  if(o && o.saluteAnchor){
    tpl.saluteAnchor = o.saluteAnchor
  }
  return tpl
}

let currentTpl = TEMPLATES.p

function setTpl(id){
  currentTpl = applyTplOverrides({ ...((TEMPLATES[id] || TEMPLATES.p)) })
  try{ localStorage.setItem(LS_TPL, currentTpl.id) }catch(e){}
  // UI highlight
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
  targetCtx.setTransform(1,0,0,1,0,0)
  targetCtx.clearRect(0,0,dstW,dstH)
  targetCtx.drawImage(baseImg, 0,0, dstW, dstH)

  const name = clampName(nameInput.value)
  const title = titleInput.value || '先生'

  // --- Right side text ---
  if(salutePosEl){
    salutePosEl.textContent = `salute: ${currentTpl.id} (${Math.round(currentTpl.saluteAnchor.x)},${Math.round(currentTpl.saluteAnchor.y)})`
  }

  targetCtx.save()
  targetCtx.fillStyle = 'rgba(255,255,255,.92)'
  targetCtx.font = `normal 800 ${Math.round(20*scale)}px ${FONT_STACK}`
  targetCtx.fillText(`${name} ${title}:`, Math.round(currentTpl.saluteAnchor.x*scale), Math.round(currentTpl.saluteAnchor.y*scale))
  targetCtx.restore()

  // --- Trophy name ---
  const quad720 = NAME_QUAD_GLOBAL
  const quadW = Math.max(dist(quad720.p00, quad720.p10), dist(quad720.p01, quad720.p11))
  const quadH = Math.max(dist(quad720.p00, quad720.p01), dist(quad720.p10, quad720.p11))

  // Allow long handles to use a bit more of the near-side width (you said there is still side space).
  const SAFE_W = (name.length <= 4) ? 0.98 : (name.length <= 6 ? 0.98 : (name.length <= 14 ? 1.03 : 1.00))
  // 增加padding，避免长名字边缘被裁剪
  const padBase = (name.length >= 4) ? 20 : 15  // 长名字用更多padding
  const padExtra = Math.max(0, (name.length - 8)) * 2
  const pad = Math.min(40, padBase + padExtra)

  const maxGlyphW = Math.max(60, (quadW * SAFE_W) - pad*2)
  const maxGlyphH = Math.max(18, (quadH * 0.92) - pad*2)

  // 根据字数应用最佳参数（新海报2026-02-16调整）
  let optimalParams
  if (name.length <= 2) {
    optimalParams = {fontSize: 54, scaleX: 1.45, scaleY: 1.0}
  } else if (name.length === 3) {
    optimalParams = {fontSize: 48, scaleX: 1.45, scaleY: 1.0}
  } else if (name.length === 4) {
    optimalParams = {fontSize: 40, scaleX: 1.25, scaleY: 1.0}
  } else if (name.length === 5) {
    optimalParams = {fontSize: 42, scaleX: 1.2, scaleY: 1.0}
  } else if (name.length >= 6 && name.length <= 7) {
    optimalParams = {fontSize: 43, scaleX: 1.0, scaleY: 0.95}
  } else { // 8字及以上
    optimalParams = {fontSize: 28, scaleX: 0.95, scaleY: 0.95}
  }
  
  const scaleX = optimalParams.scaleX
  const scaleY = optimalParams.scaleY
  
  // 调试信息
  console.log(`字数: ${name.length}, 应用参数: 字号${optimalParams.fontSize}px, scaleX=${scaleX}, scaleY=${scaleY}`)

  // 使用最佳字号（几木调试的结果）
  const size = optimalParams.fontSize
  if(metricsEl){
    metricsEl.textContent = `最佳参数: ${name.length}字 | 字号${size}px | scaleX=${scaleX} scaleY=${scaleY} | quadW=${Math.round(quadW)} quadH=${Math.round(quadH)} pad=${pad}`
  }
  const font = `normal 900 ${Math.round(size*scale)}px ${FONT_STACK}`

  const NUDGE_X = 8
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
      scaleY,
      quad,
      dstW,
      dstH,
      renderScale: 6,
    })
  }catch(e){ ok = false }

  if(!ok){
    // fallback (mesh)
    drawTextWarped(targetCtx, {
      text: name,
      font,
      fillStyle: '#D4AF55',
      padding: Math.round(pad*scale),
      scaleX,
      scaleY,
      blur: 0,
      shadow: {dx:0, dy:0, color:'rgba(0,0,0,0)'},
      highlight: {dx:0, dy:0, color:'rgba(255,255,255,0)'},
      quad,
      meshX: 26,
      meshY: 14,
      renderScale: 6,
    })
  }
}

function render(){
  renderTo(ctx, DPR)
}

function getExportScale(){
  return DPR
}

async function download(){
  // 先用DPR渲染，保证字号与预览一致
  const renderScale = getExportScale()
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = Math.round(720 * renderScale)
  tempCanvas.height = Math.round(1280 * renderScale)
  const tempCtx = tempCanvas.getContext('2d', { alpha: true })
  tempCtx.imageSmoothingEnabled = true
  tempCtx.imageSmoothingQuality = 'high'

  renderTo(tempCtx, renderScale)

  // 再缩放到1152×2048导出
  const out = document.createElement('canvas')
  out.width = Math.round(720 * 1.6)
  out.height = Math.round(1280 * 1.6)
  const octx = out.getContext('2d', { alpha: true })
  octx.imageSmoothingEnabled = true
  octx.imageSmoothingQuality = 'high'
  octx.drawImage(tempCanvas, 0, 0, out.width, out.height)

  const a = document.createElement('a')
  a.download = `poster_${currentTpl.id}_${out.width}x${out.height}_${Date.now()}.png`
  a.href = out.toDataURL('image/png')
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// events
nameInput.addEventListener('input', ()=>{ window.clearTimeout(window.__t); window.__t=setTimeout(render, 120) })
titleInput.addEventListener('change', render)
btnDownload.addEventListener('click', download)

tplP?.addEventListener('click', ()=> setTpl('p'))
tplHeYue?.addEventListener('click', ()=> setTpl('heYue'))
tplZuiLu?.addEventListener('click', ()=> setTpl('zuiLu'))
tplEWei?.addEventListener('click', ()=> setTpl('eWei'))

function tweakSalute(dx, dy){
  currentTpl.saluteAnchor = {
    x: (currentTpl.saluteAnchor.x + dx),
    y: (currentTpl.saluteAnchor.y + dy),
  }
  TPL_CFG[currentTpl.id] = { ...(TPL_CFG[currentTpl.id]||{}), saluteAnchor: currentTpl.saluteAnchor }
  saveTplCfg(TPL_CFG)
  render()
}

// step = 2px per click
btnSaluteUp?.addEventListener('click', ()=>tweakSalute(0,-2))
btnSaluteDown?.addEventListener('click', ()=>tweakSalute(0, 2))
btnSaluteLeft?.addEventListener('click', ()=>tweakSalute(-2,0))
btnSaluteRight?.addEventListener('click', ()=>tweakSalute( 2,0))

btnCopyTplCfg?.addEventListener('click', async ()=>{
  const payload = {
    tpl: currentTpl.id,
    saluteAnchor: currentTpl.saluteAnchor,
  }
  const text = JSON.stringify(payload)
  try{
    await navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }catch(e){
    prompt('复制下面这段：', text)
  }
})

// 参数已固化，不再需要滑块控制

baseImg.onload = render
initTpl()
