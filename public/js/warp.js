// Minimal perspective-ish image warp on 2D canvas.
// We approximate a projective mapping by subdividing into a mesh and drawing tiny triangles.
// Source space: (0..sw, 0..sh). Destination quad: p00, p10, p11, p01 (clockwise).

export function drawTextWarped(ctx, opts){
  const {
    text,
    font,
    fillStyle,
    letterSpacing = 0,
    padding = 20,
    scaleX = 1,  // 添加scaleX支持
    scaleY = 1,  // 添加scaleY支持
    // quad points in destination canvas coords
    quad, // {p00:{x,y}, p10:{x,y}, p11:{x,y}, p01:{x,y}}
    // shading for deboss/engrave
    shadow = {dx:-1, dy:-1, color:'rgba(0,0,0,.35)'},
    highlight = {dx: 1, dy: 1, color:'rgba(255,255,255,.25)'},
    blur = 0,
    meshX = 18,
    meshY = 10,
    // render text at higher resolution to keep edges crisp after warping
    renderScale = 2,
  } = opts;

  // 1) render text to offscreen (hi-res)
  const off = document.createElement('canvas');
  const offCtx = off.getContext('2d');
  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = 'high';

  offCtx.font = font;
  const metrics = offCtx.measureText(text);
  // 固定Canvas fallback的贴图尺寸，保持稳定
  const baseTextW = Math.max(200, Math.ceil(metrics.width + padding*2));
  const baseTextH = Math.max(100, Math.ceil((metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + padding*2));
  const textW = baseTextW;
  const textH = baseTextH;

  off.width = Math.max(1, Math.floor(textW * renderScale));
  off.height = Math.max(1, Math.floor(textH * renderScale));

  offCtx.setTransform(renderScale,0,0,renderScale,0,0);
  offCtx.clearRect(0,0,textW,textH);
  offCtx.textBaseline = 'alphabetic';
  offCtx.font = font;

  // helper to draw with manual letter spacing and scale
  function drawSpaced(x, y, color){
    offCtx.fillStyle = color;
    offCtx.save();
    offCtx.translate(x, y);
    offCtx.scale(scaleX, scaleY);  // 应用横向和纵向缩放
    if(!letterSpacing){
      offCtx.fillText(text, 0, 0);
    } else {
      let cx = 0;
      for(const ch of text){
        offCtx.fillText(ch, cx, 0);
        cx += offCtx.measureText(ch).width + letterSpacing;
      }
    }
    offCtx.restore();
  }

  const baseline = padding + (metrics.actualBoundingBoxAscent || (textH*0.7));

  function isTransparentColor(c){
    if(!c) return true;
    c = (''+c).trim().toLowerCase();
    if(c === 'transparent') return true;
    // crude but effective: treat rgba(...,0) as transparent
    if(c.startsWith('rgba') && c.replace(/\s+/g,'').endsWith(',0)')) return true;
    if(c.startsWith('rgba') && c.replace(/\s+/g,'').endsWith(',0.0)')) return true;
    return false;
  }

  // layers (skip fully transparent ones)
  if(shadow && !isTransparentColor(shadow.color)){
    drawSpaced(padding + (shadow.dx||0), baseline + (shadow.dy||0), shadow.color);
  }
  if(highlight && !isTransparentColor(highlight.color)){
    drawSpaced(padding + (highlight.dx||0), baseline + (highlight.dy||0), highlight.color);
  }
  drawSpaced(padding, baseline, fillStyle);

  // reset transform so warping math uses pixel space
  offCtx.setTransform(1,0,0,1,0,0);

  // optional blur (very light)
  if(blur > 0){
    const imgData = offCtx.getImageData(0,0,off.width,off.height);
    // cheap blur by drawing scaled down & up
    const tmp = document.createElement('canvas');
    tmp.width = Math.max(1, Math.floor(off.width/2));
    tmp.height = Math.max(1, Math.floor(off.height/2));
    const tctx = tmp.getContext('2d');
    tctx.imageSmoothingEnabled = true;
    tctx.putImageData(imgData,0,0);
    offCtx.clearRect(0,0,off.width,off.height);
    offCtx.globalAlpha = 0.85;
    offCtx.drawImage(tmp, 0,0,tmp.width,tmp.height, 0,0,off.width,off.height);
    offCtx.globalAlpha = 1;
  }

  // 2) warp the offscreen canvas into quad
  drawImageToQuadMesh(ctx, off, quad, meshX, meshY);
}

function lerp(a,b,t){return a + (b-a)*t}
function lerpPt(p,q,t){return {x:lerp(p.x,q.x,t), y:lerp(p.y,q.y,t)}}

// bilinear mapping from (u,v) to quad
function mapQuad(quad, u, v){
  const top = lerpPt(quad.p00, quad.p10, u);
  const bot = lerpPt(quad.p01, quad.p11, u);
  return lerpPt(top, bot, v);
}

function drawImageToQuadMesh(ctx, img, quad, nx, ny){
  const sw = img.width;
  const sh = img.height;

  // draw each cell as two triangles
  for(let y=0;y<ny;y++){
    const v0 = y/ny, v1=(y+1)/ny;
    const sy0 = v0*sh, sy1=v1*sh;
    for(let x=0;x<nx;x++){
      const u0=x/nx, u1=(x+1)/nx;
      const sx0=u0*sw, sx1=u1*sw;

      const p00 = mapQuad(quad,u0,v0);
      const p10 = mapQuad(quad,u1,v0);
      const p11 = mapQuad(quad,u1,v1);
      const p01 = mapQuad(quad,u0,v1);

      // tri A: (sx0,sy0)-(sx1,sy0)-(sx1,sy1) -> p00-p10-p11
      drawTexturedTriangle(ctx, img,
        {x:sx0,y:sy0}, {x:sx1,y:sy0}, {x:sx1,y:sy1},
        p00, p10, p11
      );
      // tri B: (sx0,sy0)-(sx1,sy1)-(sx0,sy1) -> p00-p11-p01
      drawTexturedTriangle(ctx, img,
        {x:sx0,y:sy0}, {x:sx1,y:sy1}, {x:sx0,y:sy1},
        p00, p11, p01
      );
    }
  }
}

// Draw image mapped from source triangle to destination triangle using affine transform + clip.
function drawTexturedTriangle(ctx, img, s0,s1,s2, d0,d1,d2){
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // clip destination triangle
  ctx.beginPath();
  ctx.moveTo(d0.x,d0.y);
  ctx.lineTo(d1.x,d1.y);
  ctx.lineTo(d2.x,d2.y);
  ctx.closePath();
  ctx.clip();

  // Compute affine transform that maps source -> dest.
  // Solve: [x y 1]*T = [X Y 1]
  const denom = (s0.x*(s1.y-s2.y) + s1.x*(s2.y-s0.y) + s2.x*(s0.y-s1.y));
  if(Math.abs(denom) < 1e-6){ ctx.restore(); return; }

  const a = (d0.x*(s1.y-s2.y) + d1.x*(s2.y-s0.y) + d2.x*(s0.y-s1.y)) / denom;
  const b = (d0.y*(s1.y-s2.y) + d1.y*(s2.y-s0.y) + d2.y*(s0.y-s1.y)) / denom;
  const c = (d0.x*(s2.x-s1.x) + d1.x*(s0.x-s2.x) + d2.x*(s1.x-s0.x)) / denom;
  const d = (d0.y*(s2.x-s1.x) + d1.y*(s0.x-s2.x) + d2.y*(s1.x-s0.x)) / denom;
  const e = (d0.x*(s1.x*s2.y - s2.x*s1.y) + d1.x*(s2.x*s0.y - s0.x*s2.y) + d2.x*(s0.x*s1.y - s1.x*s0.y)) / denom;
  const f = (d0.y*(s1.x*s2.y - s2.x*s1.y) + d1.y*(s2.x*s0.y - s0.x*s2.y) + d2.y*(s0.x*s1.y - s1.x*s0.y)) / denom;

  ctx.setTransform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);

  ctx.restore();
}
