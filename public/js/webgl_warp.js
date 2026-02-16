// WebGL projective texture warp (no mesh seams).
// Renders the given text texture into a destination quad using a homography.

function solve8(A, b){
  // Gaussian elimination for 8x8
  const n = 8
  // build augmented matrix
  const M = new Array(n)
  for(let i=0;i<n;i++){
    M[i] = A[i].slice()
    M[i].push(b[i])
  }

  for(let col=0; col<n; col++){
    // pivot
    let pivot = col
    let max = Math.abs(M[col][col])
    for(let r=col+1;r<n;r++){
      const v = Math.abs(M[r][col])
      if(v>max){ max=v; pivot=r }
    }
    if(max < 1e-9) return null
    if(pivot !== col){
      const tmp = M[col]; M[col]=M[pivot]; M[pivot]=tmp
    }

    // normalize
    const div = M[col][col]
    for(let c=col;c<=n;c++) M[col][c] /= div

    // eliminate
    for(let r=0;r<n;r++){
      if(r===col) continue
      const f = M[r][col]
      if(Math.abs(f) < 1e-12) continue
      for(let c=col;c<=n;c++) M[r][c] -= f*M[col][c]
    }
  }

  const x = new Array(n)
  for(let i=0;i<n;i++) x[i]=M[i][n]
  return x
}

function homographyDestToSrc(quad, srcW, srcH){
  // Solve H such that [u v 1]^T ~ H * [x y 1]^T
  // with correspondences:
  // p00 -> (0,0), p10 -> (srcW,0), p11 -> (srcW,srcH), p01 -> (0,srcH)
  const pts = [
    [quad.p00.x, quad.p00.y, 0, 0],
    [quad.p10.x, quad.p10.y, srcW, 0],
    [quad.p11.x, quad.p11.y, srcW, srcH],
    [quad.p01.x, quad.p01.y, 0, srcH],
  ]

  const A = []
  const b = []
  for(const [x,y,u,v] of pts){
    // u = (h11 x + h12 y + h13) / (h31 x + h32 y + 1)
    // v = (h21 x + h22 y + h23) / (h31 x + h32 y + 1)
    A.push([ x, y, 1, 0, 0, 0, -u*x, -u*y ])
    b.push(u)
    A.push([ 0, 0, 0, x, y, 1, -v*x, -v*y ])
    b.push(v)
  }

  const h = solve8(A,b)
  if(!h) return null
  const h11=h[0], h12=h[1], h13=h[2]
  const h21=h[3], h22=h[4], h23=h[5]
  const h31=h[6], h32=h[7]

  // row-major H
  // [h11 h12 h13]
  // [h21 h22 h23]
  // [h31 h32 1]
  // convert to column-major for GLSL mat3
  return [
    h11, h21, h31,
    h12, h22, h32,
    h13, h23, 1,
  ]
}

function createProgram(gl, vsSrc, fsSrc){
  function compile(type, src){
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
      const err = gl.getShaderInfoLog(s)
      gl.deleteShader(s)
      throw new Error(err)
    }
    return s
  }
  const vs = compile(gl.VERTEX_SHADER, vsSrc)
  const fs = compile(gl.FRAGMENT_SHADER, fsSrc)
  const p = gl.createProgram()
  gl.attachShader(p, vs)
  gl.attachShader(p, fs)
  gl.linkProgram(p)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if(!gl.getProgramParameter(p, gl.LINK_STATUS)){
    const err = gl.getProgramInfoLog(p)
    gl.deleteProgram(p)
    throw new Error(err)
  }
  return p
}

class WebGLWarp {
  constructor(){
    this.canvas = document.createElement('canvas')
    const gl = this.canvas.getContext('webgl', { alpha:true, premultipliedAlpha:true, preserveDrawingBuffer:true })
    if(!gl) throw new Error('WebGL not available')
    this.gl = gl

    const vs = `
      attribute vec2 a_pos;
      varying vec2 v_pos;
      uniform vec2 u_dst;
      void main(){
        v_pos = a_pos;
        vec2 clip = (a_pos / u_dst) * 2.0 - 1.0;
        gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
      }
    `

    const fs = `
      precision highp float;
      varying vec2 v_pos;
      uniform sampler2D u_tex;
      uniform mat3 u_H;
      uniform vec2 u_src;
      void main(){
        vec3 p = u_H * vec3(v_pos, 1.0);
        float w = p.z;
        if(abs(w) < 1e-6) discard;
        vec2 uv = p.xy / w;
        // 放松边界检查，允许一定程度的超出
        float margin = 10.0;  // 允许10像素的边界容差
        if(uv.x < -margin || uv.y < -margin || uv.x > u_src.x + margin || uv.y > u_src.y + margin) discard;
        // 将uv坐标夹在有效范围内，避免采样错误
        uv = clamp(uv, vec2(0.0), u_src);
        vec2 st = uv / u_src;
        gl_FragColor = texture2D(u_tex, st);
      }
    `

    this.prog = createProgram(gl, vs, fs)
    this.loc = {
      a_pos: gl.getAttribLocation(this.prog, 'a_pos'),
      u_dst: gl.getUniformLocation(this.prog, 'u_dst'),
      u_src: gl.getUniformLocation(this.prog, 'u_src'),
      u_H: gl.getUniformLocation(this.prog, 'u_H'),
      u_tex: gl.getUniformLocation(this.prog, 'u_tex'),
    }

    this.buf = gl.createBuffer()
    this.tex = gl.createTexture()

    gl.bindTexture(gl.TEXTURE_2D, this.tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    this.extAniso = gl.getExtension('EXT_texture_filter_anisotropic') ||
                    gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
                    gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
  }

  ensureSize(w,h){
    if(this.canvas.width !== w || this.canvas.height !== h){
      this.canvas.width = w
      this.canvas.height = h
      this.gl.viewport(0,0,w,h)
    }
  }

  renderTextToQuad({ textCanvas, quad, dstW, dstH }){
    const gl = this.gl
    this.ensureSize(dstW, dstH)

    const srcW = textCanvas.width
    const srcH = textCanvas.height

    const H = homographyDestToSrc(quad, srcW, srcH)
    if(!H) return null

    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.DITHER)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    gl.clearColor(0,0,0,0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(this.prog)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.tex)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas)

    // Enable mipmaps if POT (our text canvas is POT by design)
    const pot = (n)=> (n & (n-1)) === 0
    if(pot(srcW) && pot(srcH)){
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    }else{
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    }

    if(this.extAniso){
      const max = gl.getParameter(this.extAniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 1
      gl.texParameterf(gl.TEXTURE_2D, this.extAniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max))
    }

    gl.uniform1i(this.loc.u_tex, 0)
    gl.uniform2f(this.loc.u_dst, dstW, dstH)
    gl.uniform2f(this.loc.u_src, srcW, srcH)
    gl.uniformMatrix3fv(this.loc.u_H, false, new Float32Array(H))

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf)
    const verts = new Float32Array([
      0,0,
      dstW,0,
      0,dstH,
      0,dstH,
      dstW,0,
      dstW,dstH,
    ])
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STREAM_DRAW)
    gl.enableVertexAttribArray(this.loc.a_pos)
    gl.vertexAttribPointer(this.loc.a_pos, 2, gl.FLOAT, false, 0, 0)

    gl.drawArrays(gl.TRIANGLES, 0, 6)
    return { canvas: this.canvas }
  }
}

let _warp
function getWarp(){
  if(_warp) return _warp
  _warp = new WebGLWarp()
  return _warp
}

export function drawTextWarpedWebGL(targetCtx, opts){
  const {
    text,
    font,
    fillStyle = '#D4AF55',
    padding = 24,
    scaleX = 1,
    scaleY = 1,
    quad,
    dstW,
    dstH,
    renderScale = 6,
  } = opts

  // Measure in CSS pixels
  const meas = document.createElement('canvas')
  const mctx = meas.getContext('2d')
  mctx.font = font
  const m = mctx.measureText(text)
  
  // 固定贴图尺寸，避免字号变化影响scaleX/scaleY效果
  const baseTextW = Math.max(200, Math.ceil(m.width + padding*2))  // 最小200px宽度
  const baseTextH = Math.max(100, Math.ceil((m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + padding*2))  // 最小100px高度
  const textW = baseTextW
  const textH = baseTextH

  function nextPow2(x){
    x = Math.max(1, x|0)
    let p = 1
    while(p < x) p <<= 1
    return p
  }

  // hi-res canvas
  const hi = document.createElement('canvas')
  hi.width = Math.max(1, Math.floor(textW * renderScale))
  hi.height = Math.max(1, Math.floor(textH * renderScale))
  const h = hi.getContext('2d')
  h.imageSmoothingEnabled = true
  h.imageSmoothingQuality = 'high'
  h.setTransform(renderScale,0,0,renderScale,0,0)
  h.clearRect(0,0,textW,textH)
  h.textBaseline = 'alphabetic'
  h.font = font

  const baseline = padding + (m.actualBoundingBoxAscent || (textH*0.7))

  // Center text inside the source texture so it stays visually centered on the quad.
  // Use textAlign=center (more robust than manual x using measured width; avoids glyph bearings quirks).
  h.textAlign = 'center'
  const textX = textW / 2

  h.lineJoin = 'round'
  h.miterLimit = 2
  h.lineWidth = 1.4
  h.strokeStyle = 'rgba(70,45,10,0.65)'

  // Optional horizontal compensation: longer names spanning more of the quad look
  // more "squeezed" due to perspective. scaleX>1 makes glyphs slightly wider before warp.
  h.save()
  h.translate(textX, 0)
  h.scale(scaleX, scaleY)  // 添加scaleY支持
  h.strokeText(text, 0, baseline)
  h.fillStyle = fillStyle
  h.fillText(text, 0, baseline)
  h.restore()

  // reset alignment to avoid side effects
  h.textAlign = 'start'

  // POT canvas for texture
  const off = document.createElement('canvas')
  off.width = nextPow2(hi.width)
  off.height = nextPow2(hi.height)
  const o = off.getContext('2d')
  o.imageSmoothingEnabled = true
  o.imageSmoothingQuality = 'high'
  o.clearRect(0,0,off.width,off.height)
  // Center the hi-res glyphs inside the POT texture; otherwise extra transparent area
  // only on right/bottom would shift the visual center.
  const ox = Math.floor((off.width - hi.width)/2)
  const oy = Math.floor((off.height - hi.height)/2)
  o.drawImage(hi, ox, oy)

  // Make any non-zero alpha fully opaque (solid fill)
  const img = o.getImageData(0,0,off.width,off.height)
  const d = img.data
  for(let i=0;i<d.length;i+=4){
    if(d[i+3] > 0) d[i+3] = 255
  }
  o.putImageData(img,0,0)

  // WebGL warp
  let res
  try{
    const warp = getWarp()
    res = warp.renderTextToQuad({ textCanvas: off, quad, dstW, dstH })
  }catch(e){
    return false
  }
  if(!res) return false

  targetCtx.save()
  targetCtx.setTransform(1,0,0,1,0,0)
  targetCtx.drawImage(res.canvas, 0,0)
  targetCtx.restore()
  return true
}
