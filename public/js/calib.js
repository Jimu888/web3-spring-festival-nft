export function attachCalibration(canvas, onDone){
  let active = false
  let points = []

  function toPosterXY(evt){
    const rect = canvas.getBoundingClientRect()
    const x = (evt.clientX - rect.left) / rect.width * 720
    const y = (evt.clientY - rect.top) / rect.height * 1280
    return {x: Math.round(x), y: Math.round(y)}
  }

  function click(evt){
    if(!active) return
    points.push(toPosterXY(evt))
    if(points.length === 5){
      active = false
      const [p00,p10,p11,p01, salute] = points
      points = []
      onDone({
        nameQuad: {p00,p10,p11,p01},
        saluteAnchor: salute,
      })
    }
  }

  canvas.addEventListener('click', click)

  return {
    start(){ active = true; points = [] },
    stop(){ active = false; points = [] },
    get active(){ return active },
    get count(){ return points.length },
  }
}
