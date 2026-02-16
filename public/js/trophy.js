function byId(id){return document.getElementById(id)}

const nameInput = byId('nameInput')
const line1Input = byId('line1Input')
const line2Input = byId('line2Input')
const descInput = byId('descInput')

const nameText = byId('nameText')
const badgeText = byId('badgeText')
const awardText = byId('awardText')
const descText = byId('descText')
const shareCard = byId('shareCard')

function normalizeText(s){
  return (s ?? '').toString().trim()
}

function setPreview(){
  const name = normalizeText(nameInput.value) || '你的名字'
  const l1 = normalizeText(line1Input.value) || '2026web3春晚'
  const l2 = normalizeText(line2Input.value) || '枯坐守夜人'
  const desc = normalizeText(descInput.value) || ''

  nameText.textContent = name
  badgeText.textContent = l1
  awardText.textContent = l2
  descText.textContent = desc.replace(/\n+/g,'\n')

  // auto scale long names a bit
  const len = name.length
  let size = 72
  if(len >= 18) size = 54
  else if(len >= 14) size = 60
  else if(len >= 10) size = 66
  nameText.style.fontSize = size + 'px'
}

async function downloadPNG(){
  setPreview()

  // Make sure images loaded
  await new Promise((resolve)=>setTimeout(resolve, 40))

  const canvas = await html2canvas(shareCard, {
    backgroundColor: null,
    scale: 2, // 2x for sharp
    useCORS: true,
  })

  canvas.toBlob((blob)=>{
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    a.href = url
    a.download = `web3-award-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(()=>URL.revokeObjectURL(url), 2000)
  }, 'image/png')
}

byId('btnUpdate').addEventListener('click', setPreview)
byId('btnDownload').addEventListener('click', downloadPNG)

// initial
setPreview()
