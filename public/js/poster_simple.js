// 简化版本 - 移除所有复杂逻辑，确保修改生效
import { drawTextWarped } from './warp.js'
import { drawTextWarpedWebGL } from './webgl_warp.js?v=20260215_0454'

const canvas = document.getElementById('c')
const ctx = canvas.getContext('2d', { alpha: true })
ctx.imageSmoothingEnabled = true
ctx.imageSmoothingQuality = 'high'

const nameInput = document.getElementById('nameInput')
const titleInput = document.getElementById('titleInput')
const metricsEl = document.getElementById('metrics')

// HiDPI preview
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

const FONT_STACK = '"DingTalk JinBuTi","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",sans-serif'

// 固定的奖杯名字位置
const NAME_QUAD = {
  p00:{x:205, y:725},
  p10:{x:325, y:718},
  p11:{x:340, y:835},
  p01:{x:190, y:844},
}

// 简化的字体计算函数
function getOptimalFontSize(text, quadW, quadH) {
  const len = text.length
  
  // 直接根据字数返回合适的大小 - 确保生效
  if (len === 1) return 35  // 1字调小一些
  if (len === 2) return 30  // 2字调小一些  
  if (len === 3) return 28
  if (len === 4) return 24  // 4字调小防止超出边界
  if (len === 5) return 20  // 5字调小配合更大的scaleX
  if (len === 6) return 18  // 6字调小配合更大的scaleX
  if (len >= 7) return 16   // 7字以上调小配合更大的scaleX
  
  return 30
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

const baseImg = new Image()
baseImg.crossOrigin = 'anonymous'
baseImg.src = './assets/poster_p.jpg'

function render() {
  if (!baseImg.complete) return
  
  const scale = DPR
  const dstW = Math.round(720 * scale)
  const dstH = Math.round(1280 * scale)
  
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, dstW, dstH)
  ctx.drawImage(baseImg, 0, 0, dstW, dstH)
  
  const name = clampName(nameInput.value)
  const title = titleInput.value || '先生'
  
  // 右侧文字
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,.92)'
  ctx.font = `normal 800 ${Math.round(20*scale)}px ${FONT_STACK}`
  ctx.fillText(`${name} ${title}:`, Math.round(486*scale), Math.round(515*scale))
  ctx.restore()
  
  // 奖杯名字
  const quadW = dist(NAME_QUAD.p00, NAME_QUAD.p10)
  const quadH = dist(NAME_QUAD.p00, NAME_QUAD.p01)
  
  const size = getOptimalFontSize(name, quadW, quadH)
  
  // 横向拉伸 - 解决瘦高问题  
  const scaleX = (name.length >= 5) ? 1.5 : (name.length >= 2 ? 1.3 : 1.0)
  
  if (metricsEl) {
    metricsEl.textContent = `简化版 - len=${name.length} size=${size} scaleX=${scaleX} quadW=${Math.round(quadW)} quadH=${Math.round(quadH)}`
  }
  
  const font = `normal 900 ${Math.round(size*scale)}px ${FONT_STACK}`
  const NUDGE_X = 8
  
  const quad = {
    p00:{x: (NAME_QUAD.p00.x + NUDGE_X)*scale, y: NAME_QUAD.p00.y*scale},
    p10:{x: (NAME_QUAD.p10.x + NUDGE_X)*scale, y: NAME_QUAD.p10.y*scale},
    p11:{x: (NAME_QUAD.p11.x + NUDGE_X)*scale, y: NAME_QUAD.p11.y*scale},
    p01:{x: (NAME_QUAD.p01.x + NUDGE_X)*scale, y: NAME_QUAD.p01.y*scale},
  }
  
  let ok = false
  try {
    ok = drawTextWarpedWebGL(ctx, {
      text: name,
      font,
      fillStyle: '#D4AF55',
      padding: Math.round(10*scale),
      scaleX,
      quad,
      dstW,
      dstH,
      renderScale: 6,
    })
  } catch(e) { ok = false }
  
  if (!ok) {
    drawTextWarped(ctx, {
      text: name,
      font,
      fillStyle: '#D4AF55',
      padding: Math.round(10*scale),
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

// 事件监听
nameInput.addEventListener('input', () => {
  window.clearTimeout(window.__renderTimer)
  window.__renderTimer = setTimeout(render, 100)
})

baseImg.onload = render

// 初始渲染
render()