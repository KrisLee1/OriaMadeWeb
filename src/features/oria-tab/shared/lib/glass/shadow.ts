import type {GlassGeometry} from '@/features/oria-tab/shared/lib/glass/model'
import type {ReadStyle} from '@/features/oria-tab/shared/lib/glass/paint-order'

/** Composite the owner's CSS outer shadows for glass painted above it. */
export function paintGlassShadow(ctx:CanvasRenderingContext2D,owner:HTMLElement,rect:DOMRect,geometry:GlassGeometry,x:number,y:number,dpr:number,alpha:number,readStyle:ReadStyle=getComputedStyle){
  const node=owner.querySelector<HTMLElement>(':scope > .popup-shadow')??owner,style=readStyle(node)
  if(style.display==='none'||style.boxShadow==='none')return
  const sx=rect.width/(owner.offsetWidth||rect.width),sy=rect.height/(owner.offsetHeight||rect.height)
  const radii=(geometry.corners??Array.from({length:4},()=>[geometry.radiusX,geometry.radiusY])).map(([x,y])=>({x:x*dpr,y:y*dpr}))
  ctx.save();ctx.globalAlpha=alpha*(node===owner?1:Number(style.opacity))
  ctx.beginPath();ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.roundRect(x,y,rect.width*dpr,rect.height*dpr,radii);ctx.clip('evenodd')
  // CSS paints the first shadow on top. Colors can contain commas themselves.
  for(const shadow of style.boxShadow.split(/,(?![^()]*\))/).reverse()){
    if(/\binset\b/.test(shadow))continue
    const color=shadow.match(/(?:rgba?|color|oklch|lab|lch|oklab)\([^)]*\)|#[\da-f]+/i)?.[0]
    if(!color)continue
    const lengths=shadow.replace(color,'').match(/-?[\d.]+(?:px)?/g)?.map(parseFloat)??[]
    const [dx=0,dy=0,blur=0,spread=0]=lengths,spreadX=spread*sx*dpr,spreadY=spread*sy*dpr
    ctx.shadowColor=color;ctx.shadowOffsetX=dx*sx*dpr;ctx.shadowOffsetY=dy*sy*dpr;ctx.shadowBlur=blur*Math.sqrt(sx*sy)*dpr;ctx.fillStyle='#000'
    ctx.beginPath();ctx.roundRect(x-spreadX,y-spreadY,Math.max(0,rect.width*dpr+2*spreadX),Math.max(0,rect.height*dpr+2*spreadY),radii.map(r=>({x:Math.max(0,r.x+spreadX),y:Math.max(0,r.y+spreadY)})));ctx.fill()
  }
  ctx.restore()
}
